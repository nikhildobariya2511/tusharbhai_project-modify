// components/user/ParamsVerifyReport.tsx
"use client";

import React, { useEffect, useState } from "react";
import styles from "./Verify.module.css";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import AdobeEmbedViewer from "./AdobeEmbedFromReactPdf";
import { useReport } from "../../hooks/useReports";
import { ADOBE_CLIENT_ID } from "../../lib/env";
// import { ADOBE_CLIENT_ID } from "@/lib/env";
// import type { Report } from "@/types/report";
// import { useReport } from "@/hooks/useReports";

export default function ParamsVerifyReport() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const paramR = searchParams?.get("r") ?? "";

    // Input state separate from the URL param
    const [reportNumberInput, setReportNumberInput] = useState<string>("");
    // You can keep a small local state for UI loading if needed
    const [localLoading, setLocalLoading] = useState(false);

    // Call the hook with the query param `r`
    const { data: reportData, isLoading: queryLoading, error } = useReport(paramR);

    // Keep combined loading indicator if you want
    const loading = localLoading || queryLoading;

    // Submit handler implements the rules described:
    // - If no param exists: set param to input value and clear the input
    // - If param exists:
    //     - if input non-empty and different -> replace param and clear input
    //     - else -> just clear input and keep param as-is
    if (!paramR) return null;

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const inputVal = (reportNumberInput || "").trim();
        // nothing to do if no input and no param
        if (!paramR && !inputVal) {
            // optional: alert or toast
            return;
        }

        // Helper to push new search params preserving other params
        const pushWithR = (rValue: string) => {
            const next = new URLSearchParams(searchParams?.toString() ?? "");
            if (rValue) next.set("r", rValue);
            else next.delete("r");
            // push new URL (app router). You may use replace if you prefer not to add history.
            router.push(`${pathname}?${next.toString()}`);
        };

        if (!paramR) {
            // no param yet — user must have typed a value
            if (!inputVal) return;
            setLocalLoading(true);
            pushWithR(inputVal);
            setReportNumberInput("");
            setLocalLoading(false);
            return;
        }

        // param exists
        if (inputVal && inputVal !== paramR) {
            // user entered a different report number — replace param with new value
            setLocalLoading(true);
            pushWithR(inputVal);
            setReportNumberInput("");
            setLocalLoading(false);
            return;
        }

        // param exists but input is empty or equals param — just clear input and keep param intact
        setReportNumberInput("");
    }

    return (
        <div className={`${styles.pageBackground}`}>
            <div className="container">
                <div className="container mx-auto px-4">
                    <div className="mb-6">
                        <div className="flex justify-between items-start">
                            <ul id="myTab" role="tablist" className="flex gap-2 bg-white border-0 mt-10">
                                <li role="presentation" className="pdf-tab">
                                    <button
                                        role="tab"
                                        className="inline-block bg-[#465b5d] text-white px-3 py-2 border border-[#465b5d] rounded-none text-sm font-medium hover:opacity-95 transition"
                                    >
                                        PDF Report
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="w-full mx-auto px-4 mb-12" style={{ height: "90vh", minHeight: "300px" }}>
                    {/* top action area */}
                    <div className="w-full flex justify-end mb-2 text-end ">
                        <a
                            id="view-pdf"
                            className=" sm:text-nowrap px-1  bg-[#fff] text-[#475467] text-[16px] border border-[#344054] rounded-[2px] sm:px-4 py-[4.8] hover:bg-[#465b5d] hover:text-[#fff] transition-colors duration-500 hover:cursor-pointer"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            PDF Only
                        </a>

                        <div className="ml-3 self-center text-sm text-gray-600">
                            Print &amp; Download in <i className="fa-solid fa-ellipsis" aria-hidden="true"></i> Menu
                        </div>
                    </div>

                    {/* Adobe embed (replaced the commented iframe) */}
                    <div className=" w-full h-full bg-[#F5F5F5] overflow-hidden mb-3">
                        {reportData ? (
                            // Pass the report object straight into the Adobe viewer
                            <AdobeEmbedViewer
                                data={reportData as Report}
                                clientId={ADOBE_CLIENT_ID}
                                viewerWidth="100%"
                                viewerHeight="100%"
                                fileName={`${paramR}.pdf`}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500">
                                {loading ? "Loading report..." : "No preview available"}
                                {error ? <div className="text-red-500 mt-2">Failed to load report: {String(error)}</div> : null}
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <form className="w-full sm:px-4 mx-auto mt-4" onSubmit={handleSubmit}>
                        <div className="form-group flex mb-12 w-max-[500px] text-left" style={{ backgroundColor: "white" }}>
                            <input
                                name="r"
                                placeholder="Enter Your Report No."
                                value={reportNumberInput}
                                onChange={(e) => setReportNumberInput(e.target.value)}
                                className={`w-[170px] md:w-[200px] h-[36px]  ${styles.input}`}
                                type="text"
                            />
                            <button
                                type="submit"
                                className={`bg-[#465b5d] text-[#fff] text-[16px] border border-[#344054] rounded-[2px] px-4 py-[4.8] hover:bg-[#fff] hover:text-[#475467] transition-colors duration-500 h-[36px] ml-[8px] mr-[8px] min-w-[80px]`}
                            >
                                Verify
                            </button>
                            <Image src={"/img/qr-sample.svg"} alt="Qr" width={35} height={35} />
                        </div>

                        <div className="mt-[15px]  col-span-12 ml-0 p-0 md:p-0 flex items-center justify-center md:justify-start mb-5 md:mb-0">
                            <a
                                href="https://www.igi.org/missing-report/?report=06J079318256"
                                className="ml-[10px] bg-[#fff] text-[#475467] text-[16px] border border-[#344054] rounded-[2px] px-4 py-[4.8] hover:bg-[#465b5d] hover:text-[#fff] transition-colors duration-500"
                            >
                                Report Issues or Problems
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
