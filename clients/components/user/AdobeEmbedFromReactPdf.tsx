'use client';

import React, { useEffect, useRef, useState } from "react";
import { pdf, Document, Page, StyleSheet, Font } from "@react-pdf/renderer";
import ReportPDF from "../excelToReport/ReportPDF";

type Props = {
    data: any;
    clientId: string;
    viewerWidth?: string | number;
    viewerHeight?: string | number;
    fileName?: string;
};

declare global { interface Window { AdobeDC?: any; } }


const iBMPlexSansBold = "/fonts/IBMPlexSans-Bold.ttf";
const iTCAvantGardeCondensedNormal = "/fonts/ITC-CE-Book.otf";
const ITCAvantGardeStdBold = "/fonts/ITCAvantGardeStd-Bold.ttf";
const CanvaSansRegular = "/fonts/CanvaSans-Regular.otf";
const ArimoBold = "/fonts/Arimo-Bold.ttf";

Font.register({
    family: "IBMPlexSans",
    fonts: [{ src: iBMPlexSansBold, fontWeight: "bold" }],
});

Font.register({
    family: "ITCAvantGardeCondensed",
    fonts: [
        { src: iTCAvantGardeCondensedNormal, fontWeight: "normal" },
        { src: ITCAvantGardeStdBold, fontWeight: "bold" },
    ],
});

Font.register({
    family: "CanvaSans",
    fonts: [{ src: CanvaSansRegular, fontWeight: "normal" }],
});

Font.register({
    family: "Arimo",
    fonts: [{ src: ArimoBold, fontWeight: "bold" }],
});

export default function AdobeEmbedViewer({
    data,
    clientId,
    viewerHeight = "100vh",
    viewerWidth = "100%",
    fileName = `report.pdf`,
}: Props) {
    const adobeDivId = "adobe-dc-view";
    const adobeViewRef = useRef<any>(null);
    const didInitRef = useRef(false);
    const [viewReady, setViewReady] = useState(false);
    const [status, setStatus] = useState<
        "idle" | "loading-script" | "sdk-ready" | "init-view" | "generating-pdf" | "previewing" | "error"
    >("idle");
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const lastObjectUrl = useRef<string | null>(null);
    const [fallbackUrl, setFallbackUrl] = useState<string | null>(null);

    const makeFileId = () => {
        try {
            return (crypto && (crypto as any).randomUUID) ? (crypto as any).randomUUID() : `file-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
        } catch {
            return `file-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
        }
    };

    const extractFileNameFromPath = (path?: string) => {
        if (!path) return fileName;
        try {
            const parts = path.split('/');
            const last = parts.pop() || fileName;
            return last.split('?')[0];
        } catch {
            return fileName;
        }
    };

    const makeAbsoluteUrl = (p?: string) => {
        if (!p) return p;
        if (/^https?:\/\//i.test(p)) return p; // already absolute
        const base = process.env.NEXT_PUBLIC_API_BASE_URL;
        if (!base) return p;
        return `${base}${p.startsWith("/") ? "" : "/"}${p}`;
    };

    useEffect(() => {
        const id = "adobe-viewer-sdk";
        if (document.getElementById(id)) {
            setStatus("loading-script");
            return;
        }
        setStatus("loading-script");
        const s = document.createElement("script");
        s.id = id;
        s.src = "https://acrobatservices.adobe.com/view-sdk/viewer.js";
        s.async = true;
        s.onload = () => {
            setStatus("sdk-ready");
        };
        s.onerror = (ev) => {
            setErrorMsg("Failed to load Adobe viewer script.");
            setStatus("error");
        };
        document.body.appendChild(s);
    }, []);

    useEffect(() => {
        if (status === "idle") return;

        const onReady = () => {
            if (didInitRef.current) return;

            setStatus("init-view");

            try {
                adobeViewRef.current = new (window as any).AdobeDC.View({ clientId, divId: adobeDivId });
                didInitRef.current = true;
                setViewReady(true);
            } catch (err) {
                setErrorMsg(String(err ?? "Adobe init error"));
                setStatus("error");
            }
        };

        document.addEventListener("adobe_dc_view_sdk.ready", onReady);

        if ((window as any).AdobeDC && !didInitRef.current) {
            setTimeout(() => onReady(), 0);
        }

        const readyTimeout = setTimeout(() => {
            if (!didInitRef.current) {
                setErrorMsg("Adobe SDK not responding. Check network or clientId.");
                setStatus("error");
            }
        }, 10000);

        return () => {
            document.removeEventListener("adobe_dc_view_sdk.ready", onReady);
            clearTimeout(readyTimeout);
        };
    }, [status, clientId]);

    useEffect(() => {
        if (!viewReady || !didInitRef.current || !adobeViewRef.current) {
            return;
        }

        let cancelled = false;
        (async () => {
            if (fallbackUrl) setFallbackUrl(null);
            if (lastObjectUrl.current) {
                try {
                    URL.revokeObjectURL(lastObjectUrl.current);
                } catch { }
                lastObjectUrl.current = null;
            }

            if (data?.pdf_path) {
                const remoteUrl = makeAbsoluteUrl(data.pdf_path);
                const metaName = extractFileNameFromPath(remoteUrl);
                const fileId = makeFileId();
                setStatus("previewing");
                try {
                    await adobeViewRef.current.previewFile(
                        { content: { location: { url: remoteUrl } }, metaData: { fileName: metaName, id: fileId } },
                        { enableAnnotationAPIs: true }
                    );
                    if (!cancelled) {
                        return;
                    }
                } catch {
                    // fall through to PDF generation/fallback
                }
            }

            setStatus("generating-pdf");
            const imgPxWidth = 1004;
            const imgPxHeight = 591;
            const imgDpi = 300;
            // convert px -> points (pt)
            const contentWidth = (imgPxWidth * 72) / imgDpi;   // 240.96
            const contentHeight = (imgPxHeight * 72) / imgDpi; // 141.84
            const localStyles = StyleSheet.create({ page: { padding: 0, margin: 0, position: "relative" } });

            const docElement = (
                <Document title={`Jewelry Report — ${data?.report_no ?? "batch"}`}>
                    <Page size={[contentWidth, contentHeight]} style={localStyles.page}>
                        <ReportPDF
                            data={data}
                            isSingleGridLayout={true}
                            contentWidth={contentWidth}
                            contentHeight={contentHeight}
                            valueWidth={contentWidth - 38}
                        />
                    </Page>
                </Document>
            );

            try {
                const asPdf = pdf(docElement);
                const blob = await asPdf.toBlob();
                if (cancelled) return;

                setStatus("previewing");

                const fileId = makeFileId();
                try {
                    await adobeViewRef.current.previewFile(
                        { content: { promise: blob.arrayBuffer() }, metaData: { fileName, id: fileId } },
                        { enableAnnotationAPIs: true }
                    );
                    if (!cancelled) {
                        return;
                    }
                } catch {
                    const url = URL.createObjectURL(blob);
                    lastObjectUrl.current = url;
                    const fallbackId = makeFileId();
                    try {
                        await adobeViewRef.current.previewFile(
                            { content: { location: { url } }, metaData: { fileName, id: fallbackId } },
                            {}
                        );
                        if (!cancelled) {
                            return;
                        }
                    } catch {
                        if (!cancelled) {
                            setFallbackUrl(url);
                            setStatus("error");
                            setErrorMsg("Adobe viewer could not render file; showing browser fallback.");
                        }
                    }
                }
            } catch (err) {
                if (!cancelled) {
                    setErrorMsg(String(err ?? "PDF generation error"));
                    setStatus("error");
                }
            }
        })();

        return () => {
            cancelled = true;
            if (lastObjectUrl.current) {
                try {
                    URL.revokeObjectURL(lastObjectUrl.current);
                } catch { }
                lastObjectUrl.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [viewReady, data, fileName]); // runs after init

    return (
        <div style={{ width: viewerWidth, height: viewerHeight, minHeight: 420, position: "relative" }}>
            <div
                id={adobeDivId}
                style={{
                    width: "100%",
                    height: "100%",
                    minHeight: 420,
                    boxSizing: "border-box",
                }}
            />

            {fallbackUrl && (
                <div style={{ position: "absolute", inset: 0 }}>
                    <iframe title="pdf-fallback" src={fallbackUrl} style={{ width: "100%", height: "100%" }} />
                </div>
            )}
        </div>
    );
}
