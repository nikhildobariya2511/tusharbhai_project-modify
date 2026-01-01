import React, { useEffect, useState } from "react"
import { View, Text, Image, StyleSheet, Font } from "@react-pdf/renderer"
import { BOTTOM_DATE, DEFAULT_COMMENT, DEFAULT_COMMENT_ELECTRONIC_COPY_ONE, DEFAULT_COMMENT_ELECTRONIC_COPY_TWO, IMPORTANT_NOTICE, IMPORTANT_NOTICE_BOLD } from "../../lib/env";
import QRCode from "qrcode";

// add near top of file / inside component before creating styles
const LABEL_WIDTH = 53.4; // LABEL_WIDTH — the horizontal space (in PDF points) reserved for the label text (e.g. "Comments:"). Think of it as the left  column width.
const LABEL_GAP = 0  // a little extra padding between the label and value of the start of the first line of the value.


Font.registerHyphenationCallback(word => [word]);

export type ReportData = {
    style_number: string
    report_no: string
    description: string
    shape_and_cut: string
    tot_est_weight: string
    color: string
    clarity: string
    comment: string | null;
    image_url?: string
    important_notice?: string
    report_date?: string
    bottom_data?: string
    important_notice_bold?: string
    isecopy?: boolean
    notice_image?: boolean
    igi_logo?: boolean
    image_filename?: string
    company_logo?: string
    qrDataUrl?: any
}

type Props = {
    data: ReportData
    /** width/height for the *inner content box* (numbers = points, or percent strings like "80%") */
    contentWidth?: number | string
    contentHeight?: number | string
    isSingleGridLayout: boolean
    valueWidth: number
    copyType?: 'full' | 'header-only'   // default 'full'
    disableQr?: boolean

}

export default function ReportPDF({
    data,
    isSingleGridLayout,
    contentWidth,
    contentHeight,
    valueWidth,
    copyType = 'full',
    disableQr = false
}: Props) {

    const [localQr, setLocalQr] = useState<string | null>(null);

    // We prefer the QR already prepared outside
    const incomingQr = data.qrDataUrl ?? null;

    // // Debug log
    // useEffect(() => {
    //     console.log("ReportPDF incoming QR:", incomingQr);
    //     console.log("ReportPDF local QR:", localQr);
    // }, [incomingQr, localQr]);

    // FINAL QR to use
    const qrToUse = incomingQr || localQr;  // <-- automatic priority

    const isECopy = Boolean(data.isecopy);

    const FIXED_FONTS = {
        title: 6,
        jewelryTitle: isSingleGridLayout && isECopy ? 4.5 : 6.3,
        label: isSingleGridLayout ? isECopy ? 4.8 : 5.5 : 6,
        value: isSingleGridLayout ? isECopy ? 4.8 : 5 : 6,
        footer: 2.9,
        bottomDate: 3,
    };

    useEffect(() => {
        let mounted = true;

        const generateQr = async () => {
            try {
                // RULE 1: If incoming QR exists, DO NOT generate
                if (incomingQr) return;

                // RULE 2: Only generate inside single layout
                if (isSingleGridLayout) return;

                const reportNo = String(data?.report_no ?? "");
                if (!reportNo) return;

                // ensure we have a base URL
                const base =
                    process.env.NEXT_PUBLIC_BASE_URL ||
                    (typeof window !== "undefined" ? window.location.origin : "");

                const verifyUrl = `${base}/?r=${encodeURIComponent(reportNo)}`;

                console.log("Generating QR inside ReportPDF for:", reportNo);

                const url = await QRCode.toDataURL(verifyUrl, {
                    margin: 3,
                    scale: 8,
                    width: 1400
                });

                if (mounted) setLocalQr(url);
            } catch (err) {
                console.error("Local QR generation error:", err);
                if (mounted) setLocalQr(null);
            }
        };

        generateQr();

        return () => {
            mounted = false;
        };
    }, [incomingQr, isSingleGridLayout, data?.report_no]);


    const styles = StyleSheet.create({
        // global container
        container: {
            fontFamily: "Helvetica",
            fontSize: 11,
            // backgroundColor: "#FFFFFF",
            flexDirection: "column",
        },
        headerRow: {
            flexDirection: "row",
            justifyContent: "space-between",
            position: "absolute",
            top: isSingleGridLayout ? 0 : 7.5,
            left: isSingleGridLayout ? isECopy ? 44 : 38 : 40,
            right: isSingleGridLayout ? 11 : 19.3,
            // zIndex: 9999,
        },
        logoRow: {
            // marginTop: 1.6,
        },
        // fonts
        ITCFont: {
            fontFamily: "ITCAvantGardeCondensed",
        },
        CanvaFont: {
            fontFamily: "CanvaSans",
        },
        ArimoFont: {
            fontFamily: "Arimo",
        },
        IBmFont: {
            fontFamily: "IBMPlexSans",
        },
        title: {
            color: 'black',
            fontSize: FIXED_FONTS.title,
        },
        jewelryTitle: {
            marginTop: isSingleGridLayout ? isECopy ? 2.7 : 0 : 0,
            // fontWeight: "normal",
            marginRight: isSingleGridLayout ? isECopy ? 2 : 0 : 3.4,
            letterSpacing: 0.1,
            fontSize: FIXED_FONTS.jewelryTitle,
        },
        ecopy: {
            fontSize: 5.6, color: "red",
            fontWeight: "bold"
        },
        rightImageContainer: {
            width: 52,
            height: 46,
        },
        twoCol: {
            flexDirection: "row",
            marginLeft: isSingleGridLayout ? 2.1 : 4,
            marginTop: isSingleGridLayout ? isECopy ? 44.5 : 42 : 43.5,
            position: "relative"
        },
        leftCol: { flex: 1 },
        labelRow: {
            flexDirection: "row",
            marginBottom: -0.6,
            alignItems: "flex-start",
            position: "relative",
        },
        label: {
            width: isSingleGridLayout && isECopy ? 57 : LABEL_WIDTH,
            fontSize: FIXED_FONTS.label,
            position: "absolute",
            left: 0,
            top: 0,
            // fontWeight: 400,
            paddingRight: 4,
            ...(isSingleGridLayout && isECopy && {
                position: 'static',
                textTransform: 'uppercase',
            }),
            // letterSpacing: 0.4,
            fontFamily: "ITCAvantGardeCondensed",
        },
        // value should take full width and use a textIndent so the first line starts after the label
        value: {
            fontSize: FIXED_FONTS.value,
            width: isSingleGridLayout && isECopy ? valueWidth - 50 : valueWidth,
            // backgroundColor: 'pink',
            // first line is indented to sit after the label; wrapped lines start at left margin (same as label)
            textIndent: LABEL_WIDTH + LABEL_GAP,
            // ensure there's no left margin that would push wrapped lines further
            paddingLeft: 0,
            marginTop: isSingleGridLayout ? isECopy ? -2 : -1.5 : -1.3,
            // letterSpacing: 0.3,
            // vertical spacing between lines: increase to add more space between the 1st and 2nd line
            // lineHeight: 1.4,
            lineHeight: isSingleGridLayout ? isECopy ? 1.6 : 1.8 : 1.6,
            fontFamily: "IBMPlexSans",
            ...(isSingleGridLayout && isECopy && {
                textIndent: -5
            }),
        },
        colon: {
            marginLeft: -10,
            fontSize: Math.max(FIXED_FONTS.value - 1, 6),
            fontFamily: "IBMPlexSans",
        },
        mainComment: {
            fontSize: FIXED_FONTS.value,
            letterSpacing: -0.2,
        },
        bigBold: {
            fontWeight: "bold",
            fontSize: 12
        },
        commentsBox: { marginTop: 10 },
        footer: {
            marginTop: isSingleGridLayout ? 15 : 17.5,
            marginLeft: -3.4,
            letterSpacing: isSingleGridLayout && isECopy ? 0.1 : -0.1,
            position: "absolute",
            bottom: isSingleGridLayout ? isECopy ? 1 : 3 : 30.3,
            left: isSingleGridLayout ? 11 : 26.5,
            fontSize: FIXED_FONTS.footer,
        },
        bottomDate: {
            position: "absolute",
            bottom: isSingleGridLayout ? '2.7%' : "16%",
            right: isSingleGridLayout ? '5%' : "11.60%",
            fontSize: FIXED_FONTS.bottomDate,
        },
        // qrWatermark: {
        //     backgroundColor:'red',
        //     position: "absolute",
        //     top: "15%",
        //     left: "41%",
        //     width: 26.3,
        //     height: 27,
        // },
        qrWatermark: {
            position: "absolute",
            top: "13%",
            left: "41%",
            width: 33,
            height: 34,
        },

        rightImageAbsolute: {
            position: "absolute",
            top: isSingleGridLayout ? isECopy ? "45%" : "41%" : "46%",
            right: isSingleGridLayout ? isECopy ? 6 : 8.5 : 24,
            // width: 47, // orignal img size
            // height: 44.5, // orignal img size
            width: isSingleGridLayout ? isECopy ? 43 : 43 : 46,
            height: isSingleGridLayout ? isECopy ? 43 : 43 : 45,
            overflow: "hidden",
            // border: "0.3pt solid red", // optional
        },
        IgiImageAbsolute: {
            position: "absolute",
            top: isSingleGridLayout && isECopy ? '-9' : '-11',
            left: isSingleGridLayout && isECopy ? 6 : 1,
            width: isSingleGridLayout && isECopy ? 50 : 52,
            height: isSingleGridLayout && isECopy ? 50 : 52,
            overflow: "hidden",
            // border: "0.3pt solid red", // optional
        },
        noticeBgImageAbsolute: {
            position: "absolute",
            bottom: isSingleGridLayout ? "0%" : "13%",
            left: isSingleGridLayout ? 0 : 11,
            width: isSingleGridLayout ? "100%" : "90%",
            height: isSingleGridLayout ? isECopy ? 10 : 13 : 15,
            overflow: "hidden",
        },
        igiBgImageAbsolute: {
            position: "absolute",
            top: isSingleGridLayout ? isECopy ? "31%" : "30%" : "33.5%",
            left: -54,
            width: "75%",
            height: "62%",
            overflow: "hidden",
            opacity: 0.7
        },

        electronicCopyImageAbsolute: {
            position: "absolute",
            top: isSingleGridLayout && isECopy ? '3%' : "8%",
            right: isSingleGridLayout && isECopy ? 59 : 18,
            width: isSingleGridLayout && isECopy ? 29 : 31,
            height: isSingleGridLayout && isECopy ? 29 : 31,
            overflow: "hidden",
            // border: "0.3pt solid red", // optional
        },
        eCopyAbsolute: {
            position: "absolute",
            top: isSingleGridLayout && isECopy ? '24.9%' : "0",
            left: isSingleGridLayout && isECopy ? '62.4%' : '40.3%',
            marginTop: -1,
            overflow: "hidden",
        },

    })

    // Apply width/height/padding only to this inner container.
    // const containerStyle: any = [styles.container, { width: contentWidth ?? "100%", height: contentHeight ?? undefined, padding }, style]
    const containerStyle: any = [
        styles.container,
        {
            width: contentWidth ?? "100%",
            height: contentHeight ?? undefined,
        },
    ];

    // wrapper that rotates the entire page/content 180° clockwise 
    const rotatedWrapperStyle: any = {
        width: contentWidth ?? "100%",
        height: contentHeight ?? undefined,
        transform: isSingleGridLayout ? "rotate(0deg)" : "rotate(270deg)",
    };

    return (
        <View style={[rotatedWrapperStyle]}>
            <View style={[containerStyle,
                { paddingHorizontal: isSingleGridLayout ? isECopy ? 4 : 6 : 21.3, paddingVertical: isSingleGridLayout ? 0 : 25.3, }
            ]}>

                {copyType === 'full' && (
                    <>
                        {isSingleGridLayout && <View style={styles.eCopyAbsolute}>
                            <Text style={{
                                color: 'red',
                                ...(isSingleGridLayout && isECopy && {
                                    letterSpacing: 1,
                                }),
                                fontSize: isSingleGridLayout && isECopy ? 5.2 : 6, fontFamily: isSingleGridLayout && isECopy ? "IBMPlexSans" : "CanvaSans",
                                // fontWeight: 100
                            }}>{isSingleGridLayout && isECopy ? 'ELECTRONIC COPY' : 'E-COPY'}</Text>
                        </View>}

                        {isSingleGridLayout && data.company_logo && <View style={styles.electronicCopyImageAbsolute}>
                            <Image
                                src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/uploads/logo/${data.company_logo}`}
                                style={{ width: "100%", height: "100%", objectFit: "fill" }}
                            />
                        </View>}

                        {isSingleGridLayout && <View style={styles.IgiImageAbsolute}>
                            <Image
                                src="/img/logo.jpg"
                                style={{ width: "100%", height: "100%", objectFit: "contain", }}
                            />

                        </View>}
                        {data.igi_logo && <View style={styles.igiBgImageAbsolute}>
                            <Image
                                src="/img/logo.jpg"
                                style={{ width: "100%", height: "100%", objectFit: "fill" }}
                            />
                        </View>}
                        {data.notice_image && <View style={styles.noticeBgImageAbsolute}>
                            <Image
                                src="/img/notice_bg.png"
                                style={{ width: "100%", height: "100%", objectFit: "fill" }}
                            />

                        </View>}
                        <View style={styles.rightImageAbsolute}>
                            <Image
                                src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/uploads/${data.image_filename}`}
                                style={{ width: "100%", height: "100%", objectFit: "fill" }}
                            />
                        </View>
                        {qrToUse && (
                            <View style={styles.qrWatermark} wrap={false}>
                                <Image
                                    src={qrToUse}
                                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                                />

                            </View>
                        )}
                    </>
                )}
                {/* Header */}
                <View>
                    <View style={styles.headerRow} wrap={false}>
                        <View style={styles.logoRow}>
                            <View style={{ flexDirection: "column", marginTop: isSingleGridLayout ? 5 : 0 }}>
                                <Text style={[styles.title, styles.ArimoFont, {
                                    // fontFamily: "ITCAvantGardeCondensed",
                                    // fontWeight: "bold",
                                    letterSpacing: -0.3
                                }]}>
                                    INTERNATIONAL
                                </Text>

                                <Text
                                    style={[
                                        styles.ArimoFont,
                                        {
                                            // fontFamily: "ITCAvantGardeCondensed",
                                            // fontWeight: "bold",
                                            fontSize: FIXED_FONTS.title,
                                            marginTop: 1,
                                            color: 'black',
                                        },
                                    ]}
                                >
                                    GEMOLOGICAL
                                </Text>
                                <Text
                                    style={[
                                        styles.ArimoFont,
                                        {
                                            // fontFamily: "ITCAvantGardeCondensed",
                                            // fontWeight: "bold",
                                            fontSize: FIXED_FONTS.title, color: 'black', marginTop: 1.2, letterSpacing: -0.1
                                        },
                                    ]}
                                >
                                    INSTITUTE{"\u00A0"}
                                    <Text
                                        style={[
                                            styles.ITCFont,
                                            {
                                                // fontFamily: "ITCAvantGardeCondensed",
                                                // fontWeight: "bold",
                                                fontWeight: "normal",
                                                fontSize: 6.5, marginLeft: 6, letterSpacing: 0.3
                                            },
                                        ]}
                                    >
                                        INDIA
                                    </Text>
                                </Text>
                            </View>
                        </View>

                        <View >
                            <Text style={[styles.CanvaFont, styles.jewelryTitle]}>
                                JEWELRY REPORT
                            </Text>
                        </View>
                    </View>
                    {/* Main content */}
                    <View style={styles.twoCol}>
                        <View style={styles.leftCol}>
                            <View style={styles.labelRow}>
                                <Text style={styles.label}>{isSingleGridLayout && isECopy ? 'summary no' : 'Report No'}</Text>
                                <Text style={styles.value}>
                                    {"\u00A0"}
                                    <Text style={styles.colon}>: </Text>
                                    <Text>{data.report_no}</Text>
                                </Text>
                            </View>

                            <View style={[styles.labelRow, { top: isSingleGridLayout ? isECopy ? 1.2 : 0.7 : 0.6 }]}>
                                <Text style={styles.label}>Description</Text>
                                <Text
                                    style={[
                                        styles.value,
                                        { fontFamily: "ITCAvantGardeCondensed", width: '100%' },
                                    ]}
                                >
                                    {"\u00A0"}
                                    <Text style={styles.colon}>: </Text>
                                    <Text>{data.description}</Text>
                                </Text>
                            </View>

                            <View style={[styles.labelRow, { top: isSingleGridLayout ? isECopy ? 1 : 5.5 : 3.5 }]}>
                                <Text style={styles.label}>Shape and Cut</Text>
                                <Text
                                    style={[
                                        styles.value,
                                        { fontFamily: "ITCAvantGardeCondensed" },
                                    ]}
                                >
                                    {"\u00A0"}
                                    <Text style={styles.colon}>: </Text>
                                    <Text>
                                        {data.shape_and_cut}
                                    </Text>
                                </Text>
                            </View>

                            <View style={[styles.labelRow, { top: isSingleGridLayout ? isECopy ? 2.4 : 7 : 4.5 }]}>
                                <Text style={styles.label}>Tot. Est.Weight</Text>
                                <Text style={[styles.value,
                                    // { fontWeight: "bold" }
                                ]}>
                                    {"\u00A0"}
                                    <Text style={[styles.colon]}>: </Text>
                                    <Text>{data.tot_est_weight} Carat</Text>
                                </Text>
                            </View>

                            <View style={[styles.labelRow, { top: isSingleGridLayout ? isECopy ? 4 : 7 : 3.8 }]}>
                                <Text style={styles.label}>Color</Text>
                                <Text style={[styles.value,
                                { fontFamily: "Arimo" }]}>
                                    {"\u00A0"}
                                    <Text style={styles.colon}>: </Text>
                                    <Text>{data.color}</Text>
                                </Text>
                            </View>

                            <View style={[styles.labelRow, { top: isSingleGridLayout ? isECopy ? 5.3 : 7.5 : 3.4 }]}>
                                <Text style={styles.label}>Clarity</Text>
                                <Text style={[styles.value,
                                { fontFamily: "Arimo" }
                                    //  { fontWeight: "bold" }
                                ]}>
                                    {"\u00A0"}
                                    <Text style={styles.colon}>: </Text>
                                    <Text>{data.clarity}</Text>
                                </Text>
                            </View>

                            {/* Comments row */}
                            <View style={[styles.labelRow, { top: isSingleGridLayout ? isECopy ? 6.4 : 8.5 : 12.5 }]}>
                                <Text style={styles.label}>Comments</Text>
                                {/* keep a container the same width as your value column */}
                                {isSingleGridLayout && isECopy ? <View style={{ width: isECopy ? valueWidth - 50 : valueWidth }}>

                                    {/* first line: uses the existing styles.value so textIndent (first-line indent) + colon work */}
                                    <Text style={[styles.value, { fontFamily: "ITCAvantGardeCondensed" }]}>
                                        {"\u00A0"}
                                        <Text style={styles.colon}>: </Text>
                                        <Text>
                                            {data.comment ?? DEFAULT_COMMENT_ELECTRONIC_COPY_ONE}
                                        </Text>
                                    </Text>

                                    {/* second line: only render when ; textIndent and shift it right so it starts where the value does */}
                                    {(
                                        <Text
                                            style={[
                                                styles.value,
                                                {
                                                    textIndent: 0, // no first-line indent for these explicit lines
                                                    fontFamily: "ITCAvantGardeCondensed",
                                                    marginTop: 0.1
                                                },
                                            ]}
                                        >
                                            {data.comment ?? DEFAULT_COMMENT_ELECTRONIC_COPY_TWO}
                                        </Text>
                                    )}

                                    {/* third line: data.style, also aligned under value */}
                                    {<Text
                                        style={[
                                            styles.value,
                                            {
                                                textIndent: 0,
                                                fontFamily: "ITCAvantGardeCondensed",
                                                marginTop: -2

                                            },
                                        ]}
                                    >
                                        <Text style={styles.mainComment}>Style #{data.style_number ?? ""}</Text>
                                    </Text>}
                                </View> : <Text style={[styles.value, { fontFamily: "ITCAvantGardeCondensed" }]}>
                                    {"\u00A0"}
                                    <Text style={styles.colon}>: </Text>
                                    <Text>
                                        {/* {`${data.comment}${data.style}`} */}
                                        {data.comment ?? DEFAULT_COMMENT}
                                        {/* {DEFAULT_COMMENT_ELECTRONIC_COPY} */}
                                        <Text style={styles.mainComment}>Style #{data.style_number ?? ""}</Text>
                                    </Text>
                                </Text>}
                            </View>
                        </View>
                        <View>
                        </View>
                    </View>
                </View>

                {/* Footer (placed at bottom because container uses space-between) */}
                <View style={styles.footer}>
                    <Text>
                        <Text
                            style={{
                                fontWeight: "bold",
                                fontFamily: "ITCAvantGardeCondensed",
                            }}
                        >Important notice:{" "}</Text>
                        <Text style={{ letterSpacing: 0.10 }}>{IMPORTANT_NOTICE}</Text>
                    </Text>
                    <Text
                        style={{
                            fontWeight: "bold",
                            marginTop: 1,
                            fontFamily: "ITCAvantGardeCondensed",
                        }}
                    >
                        {IMPORTANT_NOTICE_BOLD}
                    </Text>
                </View>

                {<View style={styles.bottomDate}>
                    <Text style={{ fontSize: FIXED_FONTS.bottomDate }}>
                        {BOTTOM_DATE}
                    </Text>
                </View>}
            </View >
        </View>
    )
}
