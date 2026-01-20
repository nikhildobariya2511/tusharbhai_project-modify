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
    bottom:2
  },
  barcodeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 165,
    left: 19
  },
  barcodeImage: {
    width: 90,
    height: 23,
    objectFit: "contain",
  },
  barcodeNumber: {
    marginLeft: 5.5,
    bottom: 1,
    fontSize: "7",
    fontFamily: "OCR",
    color: "#000",

  },
  diaTextPosition: {
    right: 16,
    position: "absolute" as const,
    width: 30, height: 20,
    top: 258, 
    transform: "rotate(-90deg)"
  },
})
