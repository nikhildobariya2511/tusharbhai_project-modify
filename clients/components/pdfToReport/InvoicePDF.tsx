
/* eslint-disable @typescript-eslint/no-explicit-any */

// InvoicePDF.tsx
import { Document, Page, View, StyleSheet, Text, Image } from '@react-pdf/renderer';
import InvoicePDFSection1 from './InvoicePDFSection1';
import InvoicePDFSection2 from './InvoicePDFSection2';
import InvoicePDFSection4 from './InvoicePDFSection4';
import { baseFont } from './PDFStyles';
import InvoicePDFSection5 from './InvoicePDFSection5';
import { Font } from '@react-pdf/renderer';
import InvoicePDFSection3 from './InvoicePDFSection3';
const dinProRegular = '/fonts/DINPro-Light_13935.ttf';
const dinProBold = '/fonts/DINPro-Medium_13936.ttf';
Font.register({
    family: 'DINPro',
    fonts: [
        {
            src: dinProRegular,
            fontWeight: 'normal',
        },
        {
            src: dinProBold,
            fontWeight: 'bold',
        },
    ],
});

Font.register({
    family: 'OCR',
    src: '/fonts/OCR-a___.ttf',
});

Font.register({
    family: 'Helvetica-Light',
    src: '/fonts/Helvetica-Light.ttf', // path to your light TTF file
    fontWeight: 'light',
});


Font.registerHyphenationCallback((word) => {
    return [word];
});

const styles = StyleSheet.create({
    page: {
        width: 1224,
        height: 792,
        fontSize: 10,
        fontFamily: 'Helvetica',
        backgroundColor: '#fff',
        flexDirection: 'column',
        position: 'relative',
    },
    backgroundImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 1224,
        height: 792,
        zIndex: -1,
    },
    titleContainer: {
        width: '100%',
        textAlign: 'center',
        paddingTop: '156px',
    },
    titleText: {
        fontFamily: baseFont,
        fontSize: 12,
        color: "#000",
        marginRight: '257px',
    },
    contentRow: {
        flexDirection: 'row',
        width: '100%',
        gap: 10,
    },
});

export default function InvoicePDF({ data }: { data: any }) {
    return (
        <Document>
            {/* 792 612 */}
            <Page size={[1224, 792]} style={styles.page}>
                {/* <Image src={'/basiSctucutre.jpg'} style={styles.backgroundImage} /> */}
                {/* Title section */}
                <View style={styles.titleContainer}>
                    <Text style={styles.titleText}>{data?.GIANATURALDIAMONDGRADINGREPORT?.GIAReportNumber}</Text>
                </View>
                {/* Main content row */}
                <View style={[styles.contentRow]}>
                    {/* marginLeft: '109px' */}
                    <View style={{ width: '215px', marginTop: '42px', marginLeft: '112px' }}>
                        <InvoicePDFSection1 data={data} />
                    </View>
                    {/* marginLeft: '32px' */}
                    <View style={{ width: '236px', height: '100%', marginLeft: '36px', marginTop: '28px', position: 'relative' }}>
                        <View>
                            <View>
                                <InvoicePDFSection4 data={data} />
                            </View>
                            {/* <View
                                style={{
                                    width: 30,
                                    height: 20,
                                    marginTop: '104.4px',
                                    //    marginLeft: '233.80px',
                                    marginLeft: '225.80px',
                                    transform: 'rotate(-90deg)',
                                }}
                            >
                                <Text
                                    style={{
                                        fontFamily: "OCR",
                                        fontWeight: 'light',
                                        fontSize: 7.19,
                                        // color: '#000',
                                        textAlign: 'right',
                                    }}
                                >
                                    DIA
                                </Text>
                            </View> */}
                            <View
                                style={{
                                    position: 'absolute',
                                    width: 30,
                                    height: 20,
                                    top: 485.4,
                                    left: 231,
                                    transform: 'rotate(-90deg)',
                                }}
                            >
                                <Text
                                    style={{
                                        fontFamily: "OCR",
                                        fontWeight: 'light',
                                        fontSize: 7.19,
                                        //   color: '#000',
                                        textAlign: 'right',
                                    }}
                                >
                                    DIA
                                </Text>
                            </View>
                        </View>
                    </View>
                    {/* marginLeft: '21px' */}
                    <View style={{ width: '215px', marginTop: '28px', marginLeft: '14px' }}>
                        <InvoicePDFSection5 data={data} />
                    </View>
                    {/* marginLeft: '32px', */}
                    {/* <View style={{ width: '184px', marginLeft: '34px', marginTop: '7px' }}>
                        <View>
                            <InvoicePDFSection2 data={data} />
                        </View>
                        <View style={{
                            width: 68,
                            height: 170,
                            // marginTop: '55px',
                            marginLeft: '49.5px',
                            marginTop: 86,
                            // marginLeft: 70,
                            transform: 'rotate(-90deg)',
                            // marginBottom: 63,
                            // backgroundColor: 'pink'
                        }}>
                            <InvoicePDFSection3 data={data} />
                        </View>
                    </View> */}
                    <View
                        style={{
                            width: '183px',
                            marginLeft: '35px',
                            marginTop: '7px',
                            position: 'relative',
                            height: '100%',
                        }}
                    >
                        <View>
                            <InvoicePDFSection2 data={data} />
                        </View>

                        <View
                            style={{
                                width: 68,
                                height: 170,
                                position: 'absolute',
                                left: '49.5px',
                                top: 416,
                                transform: 'rotate(-90deg)',
                            }}
                        >
                            <InvoicePDFSection3 data={data} />
                        </View>
                    </View>

                </View>
            </Page>
        </Document>
    );
}
