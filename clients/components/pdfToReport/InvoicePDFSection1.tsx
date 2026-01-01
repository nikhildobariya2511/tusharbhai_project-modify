/* eslint-disable @typescript-eslint/no-explicit-any */
// InvoicePDFSection1.tsx
import { View, Text } from "@react-pdf/renderer";
import { baseFont, commonStyles } from "./PDFStyles";


export default function InvoicePDFSection1({ data }: any) {
    const report = data.GIANATURALDIAMONDGRADINGREPORT || {};
    const grading = data.GRADINGRESULTS || {};
    const additional = data.ADDITIONALGRADINGINFORMATION || {};

    const fieldValue = additional.comments || '';
    const firstLineLimit = 44; // Adjust based on your PDF layout

    // Split into words
    const words = fieldValue.split(' ');
    const firstLineWords: string[] = [];
    const remainingWords: string[] = [];

    let currentLength = 0;
    for (const word of words) {
        if ((currentLength + word.length + (firstLineWords.length > 0 ? 1 : 0)) <= firstLineLimit) {
            firstLineWords.push(word);
            currentLength += word.length + (firstLineWords.length > 1 ? 1 : 0); // +1 for space
        } else {
            remainingWords.push(word);
        }
    }

    const firstLine = firstLineWords.join(' ');
    const remaining = remainingWords.join(' ');

    return (
        <>
            <View>
                {data.ReportDate && (
                    <Text style={{
                        fontFamily: baseFont,
                        fontWeight: "normal",
                        fontSize: 9,
                        color: "#333",
                        marginBottom: '4px',
                        letterSpacing: "-0.20",
                    }}>{data.ReportDate}</Text>
                )}
                <View style={commonStyles.fieldRow}>
                    <Text style={commonStyles.fieldLabel}>GIA Report Number</Text>
                    <View style={commonStyles.separator} />
                    <Text style={commonStyles.fieldValue}>{report.GIAReportNumber}</Text>
                </View>
                {/* Shape & Cutting Style — special handling to avoid word-breaks, add ellipsis on first line, continuation right-aligned */}
                <View style={commonStyles.fieldRow}>
                    <Text style={commonStyles.fieldLabel}>Shape and Cutting Style</Text>
                    <View style={commonStyles.separator} />
                    {data.size === "small" ? (
                        <Text style={commonStyles.fieldValue}>
                            {report.ShapeandCuttingStyle}
                        </Text>
                    ) : (() => {
                        const raw = (report.ShapeandCuttingStyle || "").trim();

                        // keep layout even if empty
                        if (!raw) {
                            return <Text style={commonStyles.fieldValue}></Text>;
                        }

                        // adjust character limit as needed for your font/width
                        const firstLineLimit = 24;
                        const words = raw.split(/\s+/);
                        const firstLineWords = [];
                        let currentLen = 0;

                        for (const w of words) {
                            const addLen = (firstLineWords.length > 0 ? 1 : 0) + w.length;
                            if (currentLen + addLen <= firstLineLimit) {
                                firstLineWords.push(w);
                                currentLen += addLen;
                            } else {
                                break;
                            }
                        }

                        // fits in one line — render normally
                        if (firstLineWords.length === words.length) {
                            return <Text style={commonStyles.fieldValue}>{raw}</Text>;
                        }
                        // Otherwise, form firstLine + remaining
                        const firstLine = firstLineWords.join(" ");
                        const remaining = words.slice(firstLineWords.length).join(" ");

                        return (
                            <View style={commonStyles.shapeFieldValueContainer}>
                                <Text style={[commonStyles.fieldValue]}>
                                    {firstLine}
                                </Text>
                                <Text style={[commonStyles.fieldValue]}>
                                    {remaining}
                                </Text>
                            </View>
                        );
                    })()}
                </View>
                <View style={commonStyles.fieldRow}>
                    <Text style={commonStyles.fieldLabel}>Measurements</Text>
                    <View style={commonStyles.separator} />
                    <Text style={commonStyles.fieldValue}>{report.Measurements}</Text>
                </View>
                {/* Spacer */}
                <View style={{ height: '34px' }} />
                <View style={commonStyles.fieldRow}>
                    <Text style={commonStyles.fieldLabel}>Carat Weight</Text>
                    <View style={commonStyles.separator} />
                    <Text style={commonStyles.fieldValue}>{grading.CaratWeight}</Text>
                </View>

                <View style={commonStyles.fieldRow}>
                    <Text style={commonStyles.fieldLabel}>Color Grade</Text>
                    <View style={commonStyles.separator} />
                    <Text style={commonStyles.fieldValue}>{grading.ColorGrade}</Text>
                </View>

                <View style={commonStyles.fieldRow}>
                    <Text style={commonStyles.fieldLabel}>Clarity Grade</Text>
                    <View style={commonStyles.separator} />
                    <Text style={commonStyles.fieldValue}>{grading.ClarityGrade}</Text>
                </View>

                {/* <View style={commonStyles.fieldRow}>
                    <Text style={commonStyles.fieldLabel}>Cut Grade</Text>
                    <View style={commonStyles.separator} />
                    <Text style={commonStyles.fieldValue}>{grading.CutGrade}</Text>
                </View> */}
                {/* {grading.CutGrade ? (
                    <View style={commonStyles.fieldRow}>
                        <Text style={commonStyles.fieldLabel}>Cut Grade</Text>
                        <View style={commonStyles.separator} />
                        <Text style={commonStyles.fieldValue}>{grading.CutGrade}</Text>
                    </View>
                ) : (
                    <View style={[commonStyles.fieldRow, { visibility: "hidden" }]}>
                        <Text style={commonStyles.fieldLabel}>.</Text>
                        <View style={commonStyles.separator} />
                        <Text style={commonStyles.fieldValue}> </Text>
                    </View>
                )} */}
                <View style={commonStyles.fieldRow}>
                    {/* {grading.CutGrade ? ( */}
                    {/* // <> */}
                    {grading.CutGrade ?
                        <>
                            <Text style={commonStyles.fieldLabel}>Cut Grade</Text>
                            <View style={commonStyles.separator} />
                            <Text style={commonStyles.fieldValue}>{grading.CutGrade}</Text></> : ''}
                    {/* </> */}
                    {/* // ) : ( */}
                    {/* //     <>
                    //         <Text style={[commonStyles.fieldLabel, { color: 'transparent' }]}>Cut Grade</Text>
                    //         {/* <View style={commonStyles.separator} /> */}
                    {/* //         <Text style={[commonStyles.fieldValue, { color: 'transparent' }]}>-</Text> */}
                    {/* //     </> */}
                    {/* // )} */}
                </View>


                {/* Spacer */}
                {/* <View style={{ height: 34 }} /> */}
                <View style={{ height: data.cutGrade ? 34 : 45 }} />
                <View style={commonStyles.fieldRow}>
                    <Text style={commonStyles.fieldLabel}>Polish</Text>
                    <View style={commonStyles.separator} />
                    <Text style={commonStyles.fieldValue}>{additional.polish}</Text>
                </View>

                <View style={commonStyles.fieldRow}>
                    <Text style={commonStyles.fieldLabel}>Symmetry</Text>
                    <View style={commonStyles.separator} />
                    <Text style={commonStyles.fieldValue}>{additional.symmetry}</Text>
                </View>

                <View style={[commonStyles.fieldRow, { marginBottom: 2 }]}>
                    <Text style={commonStyles.fieldLabel}>Fluorescence</Text>
                    <View style={commonStyles.separator} />
                    <Text style={commonStyles.fieldValue}>{additional.fluorescence}</Text>
                </View>

                {/* <View style={[commonStyles.fieldRow, { marginBottom: '2.5px' }]}> */}
                {/* <Text style={commonStyles.fieldLabel}>Inscription(s): </Text> */}
                {/* <Text style={[commonStyles.fieldLabel, { marginRight: -1 }]}>Inscription(s) :</Text> */}
                {/* <Text style={[commonStyles.fieldLabel,]}>GIA  {report.GIAReportNumber}</Text> */}
                {/* </View> */}
                <View style={[commonStyles.fieldRow, { marginBottom: '2.5px' }]}>
                    <Text style={[commonStyles.fieldLabel, { marginRight: -1 }]}>
                        Inscription
                        <Text style={{
                            fontFamily: 'Helvetica-Light',
                            fontWeight: 'light',
                            fontSize: 8,
                            color: "#333",
                        }}>(</Text>
                        s
                        <Text style={{
                            fontFamily: 'Helvetica-Light',
                            fontWeight: 'light',
                            fontSize: 8,
                            color: "#333",
                        }}>)</Text>
                        : {'\u00A0'}
                    </Text>
                    <Text style={commonStyles.fieldLabel}>
                        GIA {report.GIAReportNumber}
                    </Text>
                </View>

                {additional.comments && <View style={[commonStyles.fieldRow]}>
                    <Text style={[commonStyles.fieldValue, { textAlign: 'left' }]}>Comments: </Text>
                    {/* <Text style={[commonStyles.fieldLabel, { marginLeft: '1px', flex: 1, flexWrap: 'wrap' }]}> {additional.comments}</Text> */}
                    <Text style={[commonStyles.fieldLabel]} wrap={false}>{firstLine}</Text>
                </View>}
                {remaining && (
                    <View style={{ width: '100%', marginTop: '-4px' }}>
                        <Text
                            style={[commonStyles.fieldLabel, { textAlign: 'left' }]}
                        >
                            {remaining}
                        </Text>
                    </View>
                )}
            </View>
        </>
    );
}
