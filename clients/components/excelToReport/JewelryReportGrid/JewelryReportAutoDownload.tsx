"use client";

import React, { useCallback, useMemo, useState, useEffect, useRef } from "react";
import {
    PDFViewer as RPDPDFViewer,
    Document,
    Page,
    StyleSheet,
    View,
    Font,
    pdf,
} from "@react-pdf/renderer";
import ReportPDF, { ReportData } from "../ReportPDF";
import JSZip from "jszip";
import QRCode from "qrcode";
import { buildFileNameRoot } from "./utils/fileName";

/**
 * Props - added onStatusChange to report status/progress back to parent
 */
type Props = {
    data: ReportData[];
    pageSize?: "A4" | "LETTER" | [number, number];
    viewerWidth?: string | number;
    viewerHeight?: string | number;
    cols?: number;
    rows?: number;
    onStatusChange?: (status: string, progress?: number, error?: string | null) => void;
};

function chunk<T>(arr: T[], size: number): T[][] {
    const out: T[][] = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
}

const iBMPlexSansBold = "/fonts/IBMPlexSans-Bold.ttf";
const iTCAvantGardeCondensedNormal = "/fonts/ITC-CE-Book.otf";
const ITCAvantGardeStdBold = "/fonts/ITCAvantGardeStd-Bold.ttf";
const CanvaSansRegular = "/fonts/CanvaSans-Regular.otf";
const ArimoBold = "/fonts/Arimo-Bold.ttf";
const AVGARDD_2 = "/fonts/AVGARDD_2.ttf";

Font.register({
    family: "AVGARDD_2",
    fonts: [{ src: AVGARDD_2, fontWeight: "bold" }],
});
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

export default function JewelryReportAutoDownload({
    data,
    cols = 3,
    rows = 3,
    onStatusChange,
}: Props) {
    // === I    MAGE ORIGINAL SIZE & DPI ===
    const imgPx = { w: 2484, h: 3512 }; // right-pixels
    const dpi = 300;

    const pageWidthPts = (imgPx.w / dpi) * 72;
    const pageHeightPts = (imgPx.h / dpi) * 72;
    const pageDims = { width: pageWidthPts, height: pageHeightPts };

    const itemsPerPage = cols * rows;
    const pages = chunk(data, itemsPerPage);

    const BORDER_WIDTH = 0.3; // points
    const BORDER_COLOR = "black";

    const totalBorderX = (cols + 1) * BORDER_WIDTH;
    const totalBorderY = (rows + 1) * BORDER_WIDTH;

    const cellWidth = (pageDims.width - totalBorderX) / cols;
    const cellHeight = (pageDims.height - totalBorderY) / rows;

    const r = (v: number, decimals = 3) => parseFloat(v.toFixed(decimals));

    const verticalXs = Array.from({ length: cols + 1 }, (_, i) => r(i * (cellWidth + BORDER_WIDTH)));
    const horizontalYs = Array.from({ length: rows + 1 }, (_, i) => r(i * (cellHeight + BORDER_WIDTH)));

    const styles = StyleSheet.create({
        page: {
            padding: 0,
            margin: 0,
            position: "relative",
        },
        backgroundImage: {
            position: "absolute",
            top: 0,
            left: 0,
            width: pageDims.width,
            height: pageDims.height,
        },
        grid: {
            position: "absolute",
            top: 0,
            left: 0,
            width: pageDims.width,
            height: pageDims.height,
            flexDirection: "row",
            flexWrap: "wrap",
        },
        cell: {
            width: cellWidth,
            height: cellHeight,
            overflow: "hidden",
        },
        rotateWrapper: {
            width: cellWidth,
            height: cellHeight,
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
        },
        rotatedContent: {
            width: cellHeight,
            height: cellWidth,
            position: 'relative',
        },
        overprintLayer: {
            // overlay exactly on top of the first ReportPDF
            position: 'absolute',
            top: 0,
            left: 0,
            // fill the rotatedContent area; if you prefer explicit, use width/height numbers
            width: '100%',
            height: '100%',
            // ensure it sits above the original. zIndex often works in @react-pdf/renderer,
            // but rendering order (placing it after the first) is the reliable stacking method.
            zIndex: 1,
        },
        lineCommon: {
            position: "absolute",
            backgroundColor: BORDER_COLOR,
        },
    });

    const makeDocumentForPage = useCallback(
        (pageItems: ReportData[], pageIndex: number) => {
            return (
                <Document key={pageIndex} title={`Jewelry Report`}>
                    <Page size={[pageDims.width, pageDims.height]} style={styles.page}>
                        <View style={styles.grid}>
                            {pageItems.map((item, idx) => (
                                <View key={idx} style={styles.cell}>
                                    <View style={styles.rotateWrapper}>
                                        {/* <View style={styles.rotatedContent}>
                                            <ReportPDF
                                                isSingleGridLayout={false}
                                                data={item}
                                                contentWidth={cellHeight}
                                                contentHeight={cellWidth}
                                                valueWidth={cellWidth + 26.3}
                                            />
                                        </View> */}
                                        <View style={styles.rotatedContent}>
                                            {/* First (regular) print */}
                                            <ReportPDF
                                                isSingleGridLayout={false}
                                                data={item}
                                                contentWidth={cellHeight}
                                                contentHeight={cellWidth}
                                                valueWidth={cellWidth + 26.3}
                                            />

                                            {/* Second, overlaid print (header-only). 
                        It must be placed AFTER the first so it sits on top. */}
                                            <View style={styles.overprintLayer}>
                                                <ReportPDF
                                                    isSingleGridLayout={false}
                                                    data={item}
                                                    contentWidth={cellHeight}
                                                    contentHeight={cellWidth}
                                                    valueWidth={cellWidth + 26.3}
                                                    copyType="header-only"
                                                />
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            ))}

                            {pageItems.length < itemsPerPage &&
                                Array.from({ length: itemsPerPage - pageItems.length }).map((_, i) => (
                                    <View key={`empty-${i}`} style={styles.cell} />
                                ))}

                            {verticalXs.map((x, i) => (
                                <View
                                    key={`v-${i}`}
                                    style={[
                                        styles.lineCommon,
                                        {
                                            left: x,
                                            top: 0,
                                            width: BORDER_WIDTH,
                                            height: pageDims.height,
                                        },
                                    ]}
                                />
                            ))}

                            {horizontalYs.map((y, i) => (
                                <View
                                    key={`h-${i}`}
                                    style={[
                                        styles.lineCommon,
                                        {
                                            left: 0,
                                            top: y,
                                            width: pageDims.width,
                                            height: BORDER_WIDTH,
                                        },
                                    ]}
                                />
                            ))}
                        </View>
                    </Page>
                </Document>
            );
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [cellHeight, cellWidth, cols, data, horizontalYs, pageDims.height, pageDims.width, styles, verticalXs, rows]
    );

    const fileNameRoot = useMemo(() => {
        return buildFileNameRoot();
    }, [data]);

    // Loading / progress UI
    const [status, setStatus] = useState<string>("idle"); // idle | generating | zipping | downloading | done | error
    const [progress, setProgress] = useState<number>(0);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // key to detect meaningful data changes (so we re-trigger auto-download on new data)
    const autoTriggeredKeyRef = useRef<string | null>(null);

    // call parent when status/progress/error changes
    useEffect(() => {
        onStatusChange?.(status, progress, errorMsg);
    }, [status, progress, errorMsg, onStatusChange]);

    const qrCache = new Map<string, string | null>();

    async function genQrDataUrlForReport(reportNo: string | undefined) {
        if (!reportNo) return null;
        const key = String(reportNo);
        if (qrCache.has(key)) return qrCache.get(key) ?? null;
        try {
            const base = (process.env.NEXT_PUBLIC_BASE_URL ?? window.location.origin);
            const verifyUrl = `${base}/?r=${encodeURIComponent(key)}`;
            // high res
            // const opts = { margin: 0, width: 800 };
            // const url = await QRCode.toDataURL(verifyUrl, opts);
            const url = await QRCode.toDataURL(verifyUrl, {
                margin: 3,
                scale: 8,
                width: 1400
            });
            qrCache.set(key, url);
            return url;
        } catch (err) {
            console.error("QR generation error:", err);
            qrCache.set(key, null);
            return null;
        }
    }

    const handleDownloadAll = useCallback(async () => {
        try {
            setErrorMsg(null);
            setStatus("generating");
            setProgress(0);

            const perPageChunks = chunk(data, itemsPerPage);
            if (perPageChunks.length === 0) {
                setStatus("idle");
                setProgress(0);
                onStatusChange?.("idle", 0, null);
                return;
            }

            // generate each page PDF sequentially so we can update progress
            const blobResults: { blob: Blob; idx: number }[] = [];

            // Generate PDFs sequentially so progress works and memory is controlled
            for (let i = 0; i < perPageChunks.length; i++) {
                setStatus(`generating (${i + 1}/${perPageChunks.length})`);
                onStatusChange?.(status, Math.round(((i + 1) / perPageChunks.length) * 100), null);
                const pageItems = perPageChunks[i];

                // 1) Pre-generate QR data URLs for this page's items
                await Promise.all(
                    pageItems.map(async (item) => {
                        // store the qrDataUrl directly on item (shallow mutation)
                        // Make sure item is not frozen. If it is, clone: const it = {...item};
                        (item as any).qrDataUrl = await genQrDataUrlForReport(item.report_no);
                    })
                );

                // 2) Build the Document now that each item has item.qrDataUrl
                const doc = makeDocumentForPage(pageItems, i);
                const asPdf = pdf(doc);
                const blob = await asPdf.toBlob();
                blobResults.push({ blob, idx: i });

                setProgress(Math.round(((i + 1) / perPageChunks.length) * 100));
                onStatusChange?.("generating", Math.round(((i + 1) / perPageChunks.length) * 100), null);
            }

            if (blobResults.length === 1) {
                setStatus("downloading");
                onStatusChange?.("downloading", 100, null);
                const { blob } = blobResults[0];
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${fileNameRoot}.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
                setStatus("done");
                setProgress(100);
                onStatusChange?.("done", 100, null);
                return;
            }

            setStatus("zipping");
            onStatusChange?.("zipping", progress, null);
            // multiple -> zip
            const zip = new JSZip();
            blobResults.forEach(({ blob, idx }) => {
                const partName = `${idx + 1}-part-${fileNameRoot}.pdf`;
                zip.file(partName, blob);
            });

            const zipBlob = await zip.generateAsync({ type: "blob" }, (metadata) => {
                setProgress(Math.round(metadata.percent));
                onStatusChange?.("zipping", Math.round(metadata.percent), null);
            });

            setStatus("downloading");
            onStatusChange?.("downloading", 100, null);
            const zipUrl = URL.createObjectURL(zipBlob);
            const a = document.createElement("a");
            a.href = zipUrl;
            a.download = `${fileNameRoot}.zip`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(zipUrl);

            setStatus("done");
            setProgress(100);
            onStatusChange?.("done", 100, null);
        } catch (err: any) {
            console.error("Error generating PDF(s):", err);
            const msg = String(err?.message ?? err);
            setErrorMsg(msg);
            setStatus("error");
            onStatusChange?.("error", progress, msg);
        } finally {
            // keep state for parent to observe; parent will unmount this component when done
        }
    }, [data, fileNameRoot, itemsPerPage, makeDocumentForPage, onStatusChange, progress, status]);

    // Auto-trigger when data "key" changes and has items.
    useEffect(() => {
        const key = `${data?.length ?? 0}-${data?.[0]?.report_no ?? ""}`;
        if (data?.length > 0 && autoTriggeredKeyRef.current !== key) {
            autoTriggeredKeyRef.current = key;
            void handleDownloadAll();
        }
    }, [data, handleDownloadAll]);

    // simple small status area (kept minimal — parent shows blocking loader)
    const spinnerStyle: React.CSSProperties = {
        width: 14,
        height: 14,
        border: "2px solid rgba(0,0,0,0.2)",
        borderTop: "2px solid rgba(0,0,0,0.8)",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, height: "100%" }}>
            <style>{`@keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }`}</style>

            <div style={{ display: "flex", justifyContent: "flex-end", padding: 8, gap: 8, alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {status !== "idle" && (
                        <>
                            <div style={spinnerStyle} />
                            <div style={{ fontSize: 13 }}>
                                {status === "generating" && `Generating PDFs — ${progress}%`}
                                {status.startsWith("generating (") && `Generating (${progress}%)`}
                                {status === "zipping" && `Zipping — ${progress}%`}
                                {status === "downloading" && `Downloading...`}
                                {status === "done" && `Done`}
                                {status === "error" && `Error: ${errorMsg ?? "See console"}`}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
