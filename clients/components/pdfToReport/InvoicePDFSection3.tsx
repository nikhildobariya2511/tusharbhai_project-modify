/* eslint-disable @typescript-eslint/no-explicit-any */
// InvoicePDFSection3.tsx
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { baseFont, commonStyles } from './PDFStyles';
import React from 'react';


export default function InvoicePDFSection3({ data }: any) {
    const GIA = data.GIANATURALDIAMONDGRADINGREPORT || {};
    const GRADING = data.GRADINGRESULTS || {};
    const ADDITIONAL = data.ADDITIONALGRADINGINFORMATION || {};
    const symbols = data.symbols || []
    const reportNo = GIA.GIAReportNumber;
    const shape = GIA.ShapeandCuttingStyle;
    const measurements = GIA.Measurements;
    const carat = GRADING.CaratWeight;
    const color = GRADING.ColorGrade;

    const polish = ADDITIONAL.polish;
    const symmetry = ADDITIONAL.symmetry;
    const fluorescence = ADDITIONAL.fluorescence;

    const fieldValue = data?.reportType || '';
    const firstLineLimit = 8; // Adjust this number as per your PDF font size and width
    const firstLine = fieldValue.slice(0, firstLineLimit);
    const remaining = fieldValue.length > firstLineLimit ? fieldValue.slice(firstLineLimit) : '';

    // const commentsValue = ADDITIONAL.comments || '';
    // const commentsLineLimit = 33; // Adjust this number as per your PDF font size and width
    // const commentsFirstLine = commentsValue.slice(0, commentsLineLimit);
    // const commentsRemaining = commentsValue.length > commentsLineLimit ? commentsValue.slice(commentsLineLimit) : '';

    // Put this near the top of the file
    const splitAtWordBoundary = (raw: string, limit: number): [string, string] => {
        if (!raw) return ["", ""];

        // Normalize spaces and make sure punctuation is followed by a space
        const text = raw
            .replace(/\s+/g, " ")
            .replace(/([.,;:!?])(?=\S)/g, "$1 ") // add space after punctuation if missing
            .trim();

        if (text.length <= limit) return [text, ""];

        // Find the last space at or before the limit
        const cut = text.lastIndexOf(" ", limit);

        if (cut === -1) {
            // First token is longer than the limit. Don't cut the word:
            const firstSpace = text.indexOf(" ");
            if (firstSpace === -1) return [text, ""]; // single very-long token
            // Put the whole first word on line 1, rest on line 2
            return [text.slice(0, firstSpace), text.slice(firstSpace + 1)];
        }

        return [text.slice(0, cut), text.slice(cut + 1)];
    };
    const commentsValue = ADDITIONAL.comments || "";
    const commentsLineLimit = 33;

    const [commentsFirstLine, commentsRemaining] = splitAtWordBoundary(
        commentsValue,
        commentsLineLimit
    );


    const helveticaLightStyle = {
        fontFamily: "Helvetica-Light",
        fontWeight: "light",
        fontSize: 6,
        color: "#333",
    };

    const renderWithLightBrackets = (text?: string) => {
        if (!text) return null;

        // keep bracket groups as separate array entries
        const parts = text.split(/(\(.*?\))/g);

        return parts.map((part, i) => {
            // exact bracket chunk like "(30%)"
            if (/^\(.*\)$/.test(part)) {
                const inside = part.slice(1, -1); // remove parentheses
                return (
                    <React.Fragment key={i}>
                        <Text style={helveticaLightStyle}>(</Text>
                        <Text style={styles.fieldValue}>{inside}</Text>
                        <Text style={helveticaLightStyle}>)</Text>
                    </React.Fragment>
                );
            }

            // normal chunk: convert trailing regular spaces into NBSPs so they don't get dropped
            const withPreservedTrailingSpaces = part.replace(/ +$/g, (m) =>
                "\u00A0".repeat(m.length)
            );

            return (
                <Text key={i} style={styles.fieldValue}>
                    {withPreservedTrailingSpaces}
                </Text>
            );
        });
    };


    return (
        <View>
            <View>
                <Text style={styles.fieldLabel}>{data.ReportDate}</Text>
            </View>
            {/* <View style={{
                flexDirection: "row",
                alignItems: "baseline",
                width: "100%",
            }}>
                <Text style={styles.fieldLabel}>Report Type</Text>
                <View style={styles.separator} />
                <Text style={styles.fieldValue}>{data.ReportType}</Text>
            </View> */}
            {fieldValue &&
                <View style={{ width: '100%' }}>
                    {/* First line: label + separator + first part of value */}
                    <View style={styles.fieldRow}>
                        <Text style={styles.fieldLabel}>Report Type</Text>
                        <View style={styles.separator} />
                        <Text style={[styles.fieldValue]} wrap={false}>{firstLine}</Text>

                    </View>

                    {/* Second line: remaining value, right-aligned */}
                    {remaining && (
                        <View style={{ width: '100%', }}>
                            <Text
                                style={[styles.fieldValue, { textAlign: 'right' }]}
                            >
                                {remaining}
                            </Text>
                        </View>
                    )}
                </View>}

            <View style={{
                flexDirection: "row",
                alignItems: "baseline",
                marginTop: fieldValue && remaining ? '1px' : '7.48px',
                width: "100%",
            }}>
                <Text style={styles.fieldLabel}>GIA Report No</Text>
                <View style={styles.separator} />
                <Text style={styles.fieldValue}>{reportNo}</Text>
            </View>
            <View style={{ marginTop: '7.40px' }}>
                <Text style={{
                    fontFamily: baseFont,
                    fontWeight: "bold",
                    fontSize: 5,
                    color: "#000",
                    letterSpacing: "-0.20",
                    textAlign: 'left'
                }}>
                    {shape}
                </Text>
            </View>
            <View style={{ marginTop: '1.30px' }}>
                <Text style={{
                    fontFamily: baseFont,
                    fontWeight: "bold",
                    fontSize: 5,
                    color: "#000",
                    letterSpacing: "-0.20",
                    textAlign: 'left'
                }}>
                    {measurements}
                </Text>
            </View>
            <View style={{ marginTop: '1px' }}>
                <View style={[styles.fieldRow]}>
                    <Text style={styles.fieldLabel}>Carat Weight</Text>
                    <View style={styles.separator} />
                    <Text style={styles.fieldValue}>{carat}</Text>
                </View>
                <View style={[styles.fieldRow]}>
                    <Text style={styles.fieldLabel}>Color</Text>
                    <View style={styles.separator} />
                    <Text style={styles.fieldValue}>{color}</Text>
                </View>
                <View style={[styles.fieldRow, { marginTop: 1 }]}>
                    <Text style={styles.fieldLabel}>Clarity</Text>
                    <View style={styles.separator} />
                    <Text style={styles.fieldValue}>{GRADING.ClarityGrade}</Text>
                </View>
                {GRADING.CutGrade && <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Cut</Text>
                    <View style={styles.separator} />
                    <Text style={styles.fieldValue}>{GRADING.CutGrade}</Text>
                </View>}
            </View>

            <View style={{ marginTop: '1px' }}>
                {/* {(data.TBL || data.TD) && (
                    <View style={{ flexDirection: 'row' }}>
                        {data.TBL && <Text style={styles.fieldLabel}>TBL: {data.TBL}%</Text>}
                        {data.TBL && data.TD && <View style={{ width: 10 }} />}
                        {data.TD && <Text style={styles.fieldLabel}>TD: {data.TD}%</Text>}
                    </View>
                )} */}

                {/* CA / PA */}
                {/* {(data.CA || data.PA) && (
                    <View style={{ flexDirection: 'row', marginTop: '1px' }}>
                        {data.CA && <Text style={styles.fieldLabel}>CA: {data.CA}&#176;</Text>}
                        {data.CA && data.PA && <View style={{ width: 17 }} />}
                        {data.PA && <Text style={styles.fieldLabel}>PA: {data.PA}&#176;</Text>}
                    </View>
                )} */}

                {/* ST / LH */}
                {/* {(data.ST || data.LH) && (
                    <View style={{ flexDirection: 'row' }}>
                        {data.ST && <Text style={styles.fieldLabel}>ST: {data.ST}%</Text>}
                        {data.ST && data.LH && <View style={{ width: 17 }} />}
                        {data.LH && <Text style={styles.fieldLabel}>LH: {data.LH}%</Text>}
                    </View>
                )} */}
                {/* TBL / TD */}
                {(data.TBL || data.TD) && (
                    <View style={{ flexDirection: 'row', width: '100%' }}>
                        {data.TBL && (
                            <View style={{ flex: 1 }}>
                                <Text style={styles.fieldLabel}>
                                    TBL: {data.TBL}%
                                </Text>
                            </View>
                        )}
                        {data.TD && (
                            <View style={{ flex: 1 }}>
                                <Text style={styles.fieldLabel}>
                                    TD: {data.TD}%
                                </Text>
                            </View>
                        )}
                    </View>
                )}

                {/* CA / PA */}
                {(data.CA || data.PA) && (
                    <View style={{ flexDirection: 'row', width: '100%', marginTop: '1px' }}>
                        {data.CA && (
                            <View style={{ flex: 1 }}>
                                <Text style={styles.fieldLabel}>
                                    CA: {data.CA}&#176;
                                </Text>
                            </View>
                        )}
                        {data.PA && (
                            <View style={{ flex: 1 }}>
                                <Text style={styles.fieldLabel}>
                                    PA: {data.PA}&#176;
                                </Text>
                            </View>
                        )}
                    </View>
                )}


                {(data.ST || data.LH) && (
                    <View style={{ flexDirection: 'row', width: '100%' }}>
                        {/* Column 1: ST */}
                        {data.ST && (
                            <View style={{ flex: 1 }}>
                                <Text style={styles.fieldLabel}>
                                    ST: {data.ST}%
                                </Text>
                            </View>
                        )}

                        {/* Column 2: LH */}
                        {data.LH && (
                            <View style={{ flex: 1 }}>
                                <Text style={styles.fieldLabel}>
                                    LH: {data.LH}%
                                </Text>
                            </View>
                        )}
                    </View>
                )}

                {data.depth && <View style={[styles.fieldRow]}>
                    <Text style={styles.fieldLabel}>Depth</Text>
                    <View style={styles.separator} />
                    <Text style={styles.fieldValue}>{data.depth}%</Text>
                </View>}

                {data.table && <View style={[styles.fieldRow]}>
                    <Text style={styles.fieldLabel}>Table</Text>
                    <View style={styles.separator} />
                    <Text style={styles.fieldValue}>{data.table}%</Text>
                </View>}

                {data.girdle && <View style={[styles.fieldRow]}>
                    <Text style={styles.fieldLabel}>Girdle</Text>
                    <View style={styles.separator} />
                    {renderWithLightBrackets(data.girdle)}
                </View>}
                {data.culet && <View style={[styles.fieldRow, { marginTop: '1px' }]}>
                    <Text style={styles.fieldLabel}>Culet</Text>
                    <View style={styles.separator} />
                    <Text style={styles.fieldValue}>{data.culet}</Text>
                </View>}
                <View style={[styles.fieldRow, { marginTop: '0.40px' }]}>
                    <Text style={styles.fieldLabel}>Polish</Text>
                    <View style={styles.separator} />
                    <Text style={styles.fieldValue}>{polish}</Text>
                </View>
                <View style={[styles.fieldRow, { marginTop: '1px' }]}>
                    <Text style={styles.fieldLabel}>Symmetry</Text>
                    <View style={styles.separator} />
                    <Text style={styles.fieldValue}>{symmetry}</Text>
                </View>
                <View style={[styles.fieldRow, { marginTop: '0.30px' }]}>
                    <Text style={styles.fieldLabel}>Fluorescence</Text>
                    <View style={styles.separator} />
                    <Text style={styles.fieldValue}>{fluorescence}</Text>
                </View>
            </View>
            <View style={{ marginTop: '2px' }}>
                <View>
                    {/* {data.clarityCharacteristics && <Text style={{
                        fontFamily: baseFont,
                        fontWeight: "bold",
                        fontSize: 5,
                        color: "#000",
                        textAlign: "left",
                        letterSpacing: "-0.20",
                    }}>
                        Clarity char:  {data.clarityCharacteristics}
                    </Text>} */}
                    {/* {symbols && symbols.length > 0 && (
                        <Text style={styles.fieldLabel}>
                            Clarity char:{' '}
                            {symbols
                                .map((s: any) => s.name.replace(/\n/g, ', '))
                                .map((word, idx) => (
                                    <Text key={idx} wrap={false}>
                                        {word}
                                        {idx < symbols.length - 1 ? ', ' : ''}
                                    </Text>
                                ))}
                        </Text>
                    )} */}

                    {/* {symbols && symbols.length > 0 && (
                        <Text style={styles.fieldLabel}>
                            Clarity char:{' '}
                            {symbols.map((s: any, idx: number) => {
                                // Prepare each symbol text (replace newlines with commas)
                                const symbolText = s.name.replace(/\n/g, ', ');

                                // Wrap the whole thing including the comma after it
                                const fullChunk =
                                    idx < symbols.length - 1 ? `${symbolText}, ` : symbolText;

                                return (
                                    <Text key={idx} wrap={false}>
                                        {fullChunk}
                                    </Text>
                                );
                            })}
                        </Text>
                    )} */}
                    {symbols && symbols.length > 0 && (
                        <View style={{ flexDirection: "row", flexWrap: "wrap", width: '96%' }}>
                            {/* Label stays inline */}
                            <Text style={styles.fieldLabel}>Clarity char:{' '}</Text>
                            {symbols
                                .map((s: any) =>
                                    s.name
                                        .replace(/\n/g, ", ")
                                        // Insert space before capital letters in camelCase or PascalCase
                                        .replace(/([a-z])([A-Z])/g, "$1 $2")
                                        .split(" ")
                                )
                                .flat()
                                .map((word: any, index: any) => (
                                    <Text key={index} style={styles.fieldLabel}>
                                        {word}
                                        {" "}
                                    </Text>
                                ))}
                        </View>
                    )}
                </View>
                <View>
                    <Text style={{
                        fontFamily: baseFont,
                        fontWeight: "bold",
                        fontSize: 5,
                        color: "#373435",
                        textAlign: "left",
                        letterSpacing: "-0.20",
                    }}>
                        Ins:GIA {reportNo}
                    </Text>
                </View>
                {ADDITIONAL.comments && <View
                >
                    <Text style={{
                        fontFamily: baseFont,
                        fontWeight: "bold",
                        fontSize: 5,
                        color: "#373435",
                        textAlign: "left",
                        letterSpacing: "-0.20",
                    }} wrap>
                        {commentsFirstLine}
                    </Text>
                    {commentsRemaining && (
                        <View style={{ width: '100%', }}>
                            <Text
                                style={[{
                                    fontFamily: baseFont,
                                    fontWeight: "bold",
                                    fontSize: 5,
                                    color: "#373435",
                                    letterSpacing: "-0.20",
                                    textAlign: 'left'
                                }]}
                            >
                                {commentsRemaining}
                            </Text>
                        </View>
                    )}
                </View>}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    fieldRow: {
        flexDirection: "row",
        alignItems: "baseline",
        width: "100%",
    },
    fieldLabel: {
        fontFamily: baseFont,
        fontWeight: "bold",
        fontSize: 5,
        color: "#373435",
        letterSpacing: "-0.20",
    },
    ReportDate: {
        fontFamily: baseFont,
        fontWeight: "bold",
        fontSize: 5,
        color: "#333",
    },
    separator: {
        flexGrow: 1,
        borderBottomWidth: 0.5,
        borderBottomColor: "#4B4B4D",
        borderStyle: "dotted", // instead of dotted     //dashed
        dashArray: [0.5, 0.5], // [dotLength, gapLength] in points
    },
    fieldValue: {
        fontFamily: baseFont,
        fontWeight: "bold",
        fontSize: 5,
        color: "#000",
        textAlign: "right",
        letterSpacing: "-0.20",
    },
    miniField: {
        fontSize: 5,
        fontFamily: baseFont
    }
})