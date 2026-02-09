/* eslint-disable jsx-a11y/alt-text */
import { BASE_URL } from "../../../lib/axiosClient"
import { View, Image, StyleSheet } from "@react-pdf/renderer"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function InvoicePDFSectionMini3({ report }: { report: any }) {
  const Qrcode = report.Images?.QRCode
  return (
    <View style={styles.container}>
      {/* QR Code */}
      <View style={styles.qrContainer}>{Qrcode && <Image src={`${BASE_URL}${Qrcode}`} style={styles.qrImage} />}</View>
      <text>{report.Images?.QRcodenumber}</text>
    </View>

  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 4,
  },
  qrContainer: {
    width: 57,
    height: 57,
    alignItems: "center",
    justifyContent: "center",
  },
  qrImage: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
})
