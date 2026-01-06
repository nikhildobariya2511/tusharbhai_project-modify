'use client';
import React, { useCallback, useMemo } from "react";
import {
    PDFViewer as RPDPDFViewer,
    Document,
    Page,
    StyleSheet,
    View,
    Font,
    Image,
    pdf,
} from "@react-pdf/renderer";
import ReportPDF, { ReportData } from "../ReportPDF";
import JSZip from "jszip";

type Props = {
    data: ReportData[];
    pageSize?: "A4" | "LETTER" | [number, number];
    viewerWidth?: string | number;
    viewerHeight?: string | number;
    cols?: number;
    rows?: number;
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
    fonts: [{ src: iBMPlexSansBold, fontWeight: "semibold" }],
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
    fonts: [
        { src: CanvaSansRegular, fontWeight: "normal" },
    ],
});
Font.register({
    family: "Arimo",
    fonts: [
        { src: ArimoBold, fontWeight: "bold" },
    ],
});

export default function JewelryReportGrid({
    data,
    pageSize = "A4",
    viewerWidth = "100%",
    viewerHeight = "100vh",
    cols = 3,
    rows = 3,
}: Props) {
    // === IMAGE ORIGINAL SIZE & DPI ===
    // const imgPx = { w: 2484, h: 3512 }; // right-pixels 
    const imgPx = { w: 2480, h: 3508 }; // in psd file-pixels

    const dpi = 300;


    // Before Take as : { width: 595.2, height: 841.8 },
    // Now take as : { width: 595.2, height: 841.9 },

    // convert px -> points (1pt = 1/72 inch)
    const pageWidthPts = (imgPx.w / dpi) * 72; // 595.2
    const pageHeightPts = (imgPx.h / dpi) * 72; // 841.92

    // Use image dimensions as page dimensions so page == image size (1:1)
    const pageDims = { width: pageWidthPts, height: pageHeightPts };

    // grid math
    const itemsPerPage = cols * rows;
    const pages = chunk(data, itemsPerPage);

    // border/stroke
    // If you still see artifacts, try setting BORDER_WIDTH = 1 (integer pt)
    const BORDER_WIDTH = 0.3; // points (hairline). Can try 1 for crisper integer alignment
    const BORDER_COLOR = "black";

    // compute total border thickness that will occupy page space:
    // each column contributes a left border and the grid contributes a final right border:
    // total horizontal border thickness = (cols * leftBorder) + gridRightBorder = (cols + 1) * BORDER_WIDTH
    // similarly for vertical: (rows + 1) * BORDER_WIDTH
    const totalBorderX = (cols + 1) * BORDER_WIDTH;
    const totalBorderY = (rows + 1) * BORDER_WIDTH;

    // now compute cell sizes **after** subtracting border space
    const cellWidth = (pageDims.width - totalBorderX) / cols;
    const cellHeight = (pageDims.height - totalBorderY) / rows;

    // Helper to stabilize floats (reduce tiny rounding errors)
    const r = (v: number, decimals = 3) => parseFloat(v.toFixed(decimals));

    // Precompute line positions (single lines across full page)
    // Vertical lines at x = i * (cellWidth + BORDER_WIDTH) for i = 0..cols
    const verticalXs = Array.from({ length: cols + 1 }, (_, i) =>
        r(i * (cellWidth + BORDER_WIDTH))
    );
    // Horizontal lines at y = i * (cellHeight + BORDER_WIDTH) for i = 0..rows
    const horizontalYs = Array.from({ length: rows + 1 }, (_, i) =>
        r(i * (cellHeight + BORDER_WIDTH))
    );

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
        },
        // styles for the single-line views (we set them inline with computed coords)
        lineCommon: {
            position: "absolute",
            backgroundColor: BORDER_COLOR,
        },
    });

    // Build the Document once for the viewer (all pages)
    const renderDocument = useCallback(() => {
        return (
            <Document
                title={`Jewelry Report — ${data?.[0]?.report_no ?? "batch"}`}
            >
                {pages.map((pageItems, pIdx) => (
                    <Page
                        key={pIdx}
                        size={[pageDims.width, pageDims.height]}
                        style={styles.page}
                    >
                        {/* <Image src="/pdfBg.jpg" style={styles.backgroundImage} /> */}

                        {/* overlay grid container (no per-cell borders) */}
                        <View style={styles.grid}>
                            {pageItems.map((item, idx) => (
                                <View key={idx} style={styles.cell}>
                                    <View style={styles.rotateWrapper}>
                                        <View style={[styles.rotatedContent, { position: "relative" }]}>
                                            {/* COPY 1 */}
                                            <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
                                                <ReportPDF
                                                    data={item}
                                                    isSingleGridLayout={false}
                                                    contentWidth={cellHeight}
                                                    contentHeight={cellWidth}
                                                    valueWidth={cellWidth + 26.3}
                                                />
                                            </View>

                                            {/* COPY 2 */}
                                            <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
                                                <ReportPDF
                                                    data={item}
                                                    isSingleGridLayout={false}
                                                    contentWidth={cellHeight}
                                                    contentHeight={cellWidth}
                                                    valueWidth={cellWidth + 26.3}
                                                    copyType="header-only"        // <--- full for this overlay copy
                                                    disableQr={true}              // <--- optional: skip generating/printing QR for overlay
                                                />
                                            </View>
                                        </View>

                                    </View>
                                </View>
                            ))}

                            {/* fill empty cells to keep layout stable */}
                            {pageItems.length < itemsPerPage &&
                                Array.from({ length: itemsPerPage - pageItems.length }).map(
                                    (_, i) => <View key={`empty-${i}`} style={styles.cell} />
                                )}

                            {/* Draw vertical lines (single Views) */}
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

                            {/* Draw horizontal lines (single Views) */}
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
                ))}
            </Document>
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, cols, rows, pageDims.width, pageDims.height]);

    // Helper: create a Document that contains exactly the provided pageItems as one page.
    const makeDocumentForPage = useCallback(
        (pageItems: ReportData[], pageIndex: number) => {
            return (
                <Document
                    key={pageIndex}
                    title={`Jewelry Report`}
                >
                    <Page size={[pageDims.width, pageDims.height]} style={styles.page}>
                        {/* <Image src="/pdfBg.jpg" style={styles.backgroundImage} /> */}

                        <View style={styles.grid}>
                            {pageItems.map((item, idx) => (
                                <View key={idx} style={styles.cell}>
                                    <View style={styles.rotateWrapper}>
                                        <View style={styles.rotatedContent}>
                                            <ReportPDF
                                                isSingleGridLayout={false}
                                                data={item}
                                                contentWidth={cellHeight}
                                                contentHeight={cellWidth}
                                                valueWidth={cellWidth + 26.3}
                                            />
                                        </View>
                                    </View>
                                </View>
                            ))}

                            {pageItems.length < itemsPerPage &&
                                Array.from({ length: itemsPerPage - pageItems.length }).map(
                                    (_, i) => <View key={`empty-${i}`} style={styles.cell} />
                                )}

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

    // File name root
    const fileNameRoot = useMemo(() => {
        const rn = data?.[0]?.report_no ?? "batch";
        return `Jewelry-Report-${rn}-${cols}x${rows}`;
    }, [data, cols, rows]);

    // Generate and download PDF(s) (client-side)
    const handleDownloadAll = useCallback(async () => {
        try {
            // chunk into pages (each page contains up to itemsPerPage)
            const perPageChunks = chunk(data, itemsPerPage);

            // For each page, create a Document containing that single page and generate a Blob
            const blobPromises = perPageChunks.map(async (pageItems, idx) => {
                const doc = makeDocumentForPage(pageItems, idx);
                const asPdf = pdf(doc);
                const blob = await asPdf.toBlob();
                return { blob, idx };
            });

            const blobResults = await Promise.all(blobPromises);

            if (blobResults.length === 0) {
                // nothing to download
                return;
            }

            if (blobResults.length === 1) {
                // Single PDF - download directly
                const { blob } = blobResults[0];
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${fileNameRoot}.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
                return;
            }

            // Multiple PDFs -> zip them
            const zip = new JSZip();
            blobResults.forEach(({ blob, idx }) => {
                const partName = `${fileNameRoot}-part-${idx + 1}.pdf`;
                zip.file(partName, blob);
            });

            const zipBlob = await zip.generateAsync({ type: "blob" });
            const zipUrl = URL.createObjectURL(zipBlob);
            const a = document.createElement("a");
            a.href = zipUrl;
            a.download = `${fileNameRoot}.zip`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(zipUrl);
        } catch (err) {
            console.error("Error generating PDF(s):", err);
        }
    }, [data, fileNameRoot, itemsPerPage, makeDocumentForPage]);

    // Render both the viewer and a download button
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, height: "100%" }}>
            {/* <div style={{ display: "flex", justifyContent: "flex-end", padding: 8 }}>
                <button
                    onClick={handleDownloadAll}
                    style={{
                        padding: "8px 12px",
                        borderRadius: 6,
                        border: "1px solid #ccc",
                        background: "#fff",
                        cursor: "pointer",
                    }}
                >
                    Download PDF{pages.length > 1 ? "s" : ""}
                </button>
            </div> */}

            <div style={{ flex: 1, minHeight: 0 }}>
                <RPDPDFViewer style={{ width: viewerWidth, height: viewerHeight }}>
                    {renderDocument()}
                </RPDPDFViewer>
            </div>
        </div>
    );
}
