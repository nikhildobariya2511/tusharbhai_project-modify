import { View, Text, StyleSheet } from "@react-pdf/renderer"
import { baseFont } from "./PDFStyles"

import InvoicePDFSectionMini1 from "./InvoicePDFSectionMini1"
import InvoicePDFSectionMini2 from "./InvoicePDFSectionMini2"
import InvoicePDFSectionMini3 from "./InvoicePDFSectionMini3"
import InvoicePDFSectionMini4 from "./InvoicePDFSectionMini4"

const styles = StyleSheet.create({
  block: {
    position: "absolute",
    left: 0,
    width: 1224,
    height: 396,
  },

  titleContainer: {
    width: "100%",
    textAlign: "center",
    paddingTop: "36px",
    left: 37,
  },

  titleText: {
    fontFamily: baseFont,
    fontSize: 12,
    color: "#000",
  },

  section1: {
    position: "absolute",
    left: 287,
    width: 205,
    height: 190,
    top: 83,

    overflow: "hidden",
  },

  section2: {
    position: "absolute",
    left: 491,
    top: 70,
    width: 200,
    overflow: "hidden",
  },

  section3: {
    position: "absolute",
    left: 695,
    top: 287,
    width: 80,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "flex-start",
  },

  section4: {
    position: "absolute",
    left: 790,
    top: 40,
    width: 98,
    overflow: "hidden",
  },

})

export default function MiniReportBlock({
  report,
  top,
}: {
  report: any
  top: number
}) {
  return (
    <View style={[styles.block, { top }]}>
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>{report.GIANATURALDIAMONDGRADINGREPORT?.GIAReportNumber}</Text>
      </View>

      {/* Section 1: Left Text Details */}
      <View style={styles.section1}>
        <InvoicePDFSectionMini1 report={report} />
      </View>

      {/* Section 2: Middle Diagram + Barcode */}
      <View style={styles.section2}>
        <InvoicePDFSectionMini2 report={report} />
      </View>

      {/* Section 3: QR Code */}
      <View style={styles.section3}>
        <InvoicePDFSectionMini3 report={report} />
      </View>

      {/* Section 4: Right Detail Column */}
      <View style={styles.section4}>
        <InvoicePDFSectionMini4 report={report} />
      </View>
    </View>
  )
}
