'use client';
import React, { useCallback } from "react";
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
import { dummyData } from "@/lib/env";

type Props = {
    data: ReportData;
    pageSize?: "A4" | "LETTER" | [number, number];
    viewerWidth?: string | number;
    viewerHeight?: string | number;
};

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



export default function JewelryReportSingle({
    data,
    viewerWidth = "100%",
    viewerHeight = "100%",
}: Props) {
    // image pixel dims + dpi from your metadata
    const imgPxWidth = 1004;
    const imgPxHeight = 591;
    const imgDpi = 300; // from your image properties

    // convert px -> points (pt)
    const contentWidth = (imgPxWidth * 72) / imgDpi;   // 240.96
    const contentHeight = (imgPxHeight * 72) / imgDpi; // 141.84


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
            width: contentWidth,
            height: contentHeight,
        },
    });

    // Build the Document once for the viewer (all pages)
    const renderDocument = useCallback(() => (
        <Document title={`Jewelry Report — ${data.report_no}`}>
            <Page size={[contentWidth, contentHeight]} style={styles.page}>
                {/* this will render the image at ~240.96 x 141.84 points */}
                {/* <Image src="/e-copyBg.jpg" style={styles.backgroundImage} /> */}
                {/* <Image src="/ele-copy.jpg" style={styles.backgroundImage} /> */}

                <ReportPDF
                    data={data as any}
                    isSingleGridLayout={true}
                    contentWidth={contentWidth}
                    contentHeight={contentHeight}
                    valueWidth={contentWidth - 38}
                />
            </Page>
        </Document>
    ), [data, contentWidth, contentHeight]);

    // Render both the viewer and a download button
    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <div style={{ flex: 1, minHeight: 0 }}>
                <RPDPDFViewer style={{ width: viewerWidth, height: viewerHeight }}>
                    {renderDocument()}
                </RPDPDFViewer>
            </div>
        </div>
    );
}
