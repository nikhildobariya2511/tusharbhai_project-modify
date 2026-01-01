"use client";

import React, { useMemo, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { ReportData } from "../../../components/excelToReport/ReportPDF";
import { useReport } from "../../../hooks/useReports";
import JewelryReportAutoDownload from "../../../components/excelToReport/JewelryReportGrid/JewelryReportAutoDownload";
// import { useReport } from "@/hooks/useReports"; // optional: your hook
// import { ReportData } from "@/components/excelToReport/ReportPDF";
// import JewelryReportAutoDownload from "@/components/excelToReport/JewelryReportGrid/JewelryReportAutoDownload";

type Props = {
    /** Optional: provide data directly. If omitted, component will read ?r= from URL and fetch via useReport */
    data?: ReportData[];
    /** Optional: callback when finished (done or error) */
    onFinished?: (status: "done" | "error" | "idle") => void;
    cols?: number;
    rows?: number;
};

export default function JewelryReportAutoDownloadLauncher({
    data: externalData,
    onFinished,
    cols = 3,
    rows = 3,
}: Props) {
    const searchParams = useSearchParams();
    const reportNo = searchParams?.get("r") ?? undefined;

    // If externalData not provided and there's an r param, fetch report via hook
    const { data: fetched, isLoading, error } = useReport && !externalData && reportNo
        ? useReport(reportNo)
        : { data: undefined, isLoading: false, error: undefined } as any;

    // normalize data source: prefer prop -> fetched -> empty
    const finalData = useMemo(() => {
        if (externalData && externalData.length > 0) return externalData;
        if (fetched) return [fetched];
        return [];
    }, [externalData, fetched]);

    const [statusText, setStatusText] = useState<string>("idle");
    const [progress, setProgress] = useState<number>(0);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [hasTriggered, setHasTriggered] = useState<boolean>(false);

    const handleStatusChange = useCallback(
        (status: string, p?: number, errorStr?: string | null) => {
            setStatusText(status);
            setProgress(typeof p === "number" ? p : progress);
            setErrorMsg(errorStr ?? null);

            if (status === "done") onFinished?.("done");
            if (status === "error") onFinished?.("error");
        },
        [onFinished, progress]
    );

    // If no data available (and not loading) show message
    if (!externalData && !fetched && !isLoading) {
        return (
            <div style={{ padding: 12 }}>
                <div style={{ marginBottom: 8 }}>No report data available to generate PDF.</div>
                <div style={{ color: "#666", fontSize: 13 }}>
                    Provide `data` to the component or include `?r=REPORT_NO` in the URL so the report can be fetched.
                </div>
            </div>
        );
    }

    // Loading indicator for fetch
    if (isLoading) {
        return <div style={{ padding: 12 }}>Loading report…</div>;
    }

    if (error) {
        return (
            <div style={{ padding: 12 }}>
                <div style={{ color: "crimson" }}>Error fetching report: {String(error?.message ?? error)}</div>
            </div>
        );
    }

    // Render the AutoDownload component once with data.
    // JewelryReportAutoDownload auto-triggers when data changes (it has its own effect).
    // We guard to only render once by tracking hasTriggered flag if needed.
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <strong>Auto PDF export</strong>
                    <div style={{ fontSize: 12, color: "#666" }}>
                        Status: {statusText} {progress ? `— ${progress}%` : ""}
                        {errorMsg ? ` — ${errorMsg}` : ""}
                    </div>
                </div>

                {/* Manual trigger / retry button */}
                <div>
                    <button
                        onClick={() => {
                            // unmounting & remounting the inner component is the simplest way to re-trigger.
                            // Toggle hasTriggered to force a remount when user clicks Retry.
                            setHasTriggered((v) => !v);
                            setStatusText("idle");
                            setProgress(0);
                            setErrorMsg(null);
                        }}
                        style={{
                            padding: "8px 12px",
                            borderRadius: 6,
                            border: "1px solid #ccc",
                            background: "#fff",
                            cursor: "pointer",
                        }}
                    >
                        Retry / Regenerate
                    </button>
                </div>
            </div>

            {/* Small visual progress bar */}
            <div style={{ height: 8, background: "#eee", borderRadius: 6, overflow: "hidden" }}>
                <div
                    style={{
                        width: `${Math.min(Math.max(progress, 0), 100)}%`,
                        height: "100%",
                        transition: "width 200ms linear",
                        background: progress >= 100 ? "#27ae60" : "#0070f3",
                    }}
                />
            </div>

            {/* The auto-download component: it triggers by itself as soon as `finalData` is present.
          We include `key={hasTriggered ? "t1" : "t0"}` so toggling hasTriggered remounts it for retry. */}
            <div style={{ minHeight: 1 }}>
                {finalData.length > 0 && (
                    <div key={hasTriggered ? "t1" : "t0"}>
                        <JewelryReportAutoDownload
                            data={finalData}
                            cols={cols}
                            rows={rows}
                            onStatusChange={handleStatusChange}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
