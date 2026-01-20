/* eslint-disable @typescript-eslint/no-explicit-any */

import { Document, Page, StyleSheet, Font,Image } from "@react-pdf/renderer"
import MiniReportBlock from "./MiniReportBlock"
import sampleDatamini from "../../../data/sampledata-mini"

const PAGE_WIDTH = 1224
const PAGE_HEIGHT = 792

// Fonts
Font.register({
  family: "DINPro",
  fonts: [
    { src: "/fonts/DINPro-Light_13935.ttf", fontWeight: "normal" },
    { src: "/fonts/DINPro-Medium_13936.ttf", fontWeight: "bold" },
  ],
})

Font.register({
  family: "Helvetica-Light",
  src: "/fonts/Helvetica-Light.ttf", // path to your light TTF file
  fontWeight: "light",
})

Font.register({ family: "OCR", src: "/fonts/OCR-a___.ttf" })
Font.registerHyphenationCallback((word) => [word])

const styles = StyleSheet.create({
  page: {
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
    backgroundColor: "#fff",
    position: "relative",
  },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
    zIndex: -1,
    backgroundColor:"red"
  },
})

export default function InvoicePDFMini({ reports }: { reports?: any[] }) {
  const reportData = reports || sampleDatamini.reports.slice(0, 2)

  const finalReports = [reportData[0] || null, reportData[1] || null]

  return (
    <Document>
      <Page size={[PAGE_WIDTH, PAGE_HEIGHT]} style={styles.page}>
        {/* Background */}
        <Image src="/mimi-reports.jpg" style={styles.background} /> 

        {/* TOP REPORT */}
        {finalReports[0] && <MiniReportBlock report={finalReports[0]} top={0} />}

        {/* BOTTOM REPORT  432*/}
        {finalReports[1] && <MiniReportBlock report={finalReports[1]} top={432} />}
      </Page>
    </Document>
  )
}
