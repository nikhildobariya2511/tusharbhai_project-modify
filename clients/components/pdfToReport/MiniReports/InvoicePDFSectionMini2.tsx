/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable jsx-a11y/alt-text */

import { View, Text, Image, StyleSheet } from "@react-pdf/renderer"
import { BASE_URL } from "../../../lib/axiosClient"

export default function InvoicePDFSectionMini2({ report }: { report: any }) {
  const diagramImage = report.Images?.Proportions
  const barcode10 = report.Images?.Barcode10

  return (
    <View style={styles.container}>
      {diagramImage && (
        <View style={styles.diagramContainer}>
          <Image src={`${BASE_URL}${diagramImage}`} style={styles.diagramImage} />
        </View>
      )}

      {barcode10?.image && (
        <View style={styles.barcodeContainer}>
          <Image src={`${BASE_URL}${barcode10.image}`} style={styles.barcodeImage} />
          <Text style={styles.barcodeNumber}>{barcode10.number}</Text>
        </View>
      )}

      <View style={styles.diaTextPosition}>
        <Text
          style={{
            fontFamily: "OCR",
            fontWeight: "light",
            fontSize: 7.19,
            textAlign: "right",
          }}
        >
          DOSS
        </Text>
      </View>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
    height: "100%",
  },

  diagramContainer: {
    height: "100%",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  diagramImage: {
    width: "70%",
    height: "70%",
    objectFit: "contain",
  },
  barcodeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 160,
    left: 22
  },
  barcodeImage: {
    width: 90,
    height: 27,
    objectFit: "contain",
  },
  barcodeNumber: {
    marginLeft: 3,
    marginTop: '1px',
    fontSize: "7.70",
    fontFamily: "OCR",
    color: "#000",

  },
  verticalDotsContainer: {
    alignItems: "center",
    marginTop: 4,
  },
  verticalDotsText: {
    fontFamily: "Helvetica",
    fontSize: 4,
    color: "#333",
    lineHeight: 1,
  },
  diaTextPosition: {
    right: 17.5,
    position: "absolute" as const,
    width: 30, height: 20,
    top: 256, 
    transform: "rotate(-90deg)"
  },
})
