/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable jsx-a11y/alt-text */

import { View, Text, Image, StyleSheet } from "@react-pdf/renderer"
import { baseFont, commonStyles } from "./PDFStyles"
import { BASE_URL } from "../../../lib/axiosClient"


function splitByWords(value = "", limit = 26) {
  const words = value.trim().split(/\s+/)
  const first: string[] = []
  const rest: string[] = []

  let len = 0
  for (const w of words) {
    const add = (first.length ? 1 : 0) + w.length
    if (len + add <= limit) {
      first.push(w)
      len += add
    } else {
      rest.push(w)
    }
  }

  return {
    firstLine: first.join(" "),
    remaining: rest.join(" "),
  }
}

/* ---------- reusable row ---------- */

function MiniRow({
  label,
  value,
  limit = 26,
}: {
  label: string
  value?: string
  limit?: number
}) {
  if (!value) return null

  const { firstLine, remaining } = splitByWords(value, limit)

  return (
    <View>
      {/* first line */}
      <View style={{ flexDirection: "row", width: "100%" }}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.separator} />
        <Text style={styles.value}>{firstLine}</Text>
      </View>

      {/* wrapped continuation */}
      {remaining && (
        <View style={{ flexDirection: "row", width: "100%" }}>
          <Text style={styles.label} />
          <View style={styles.separatorInvisible} />
          <Text style={styles.value}>{remaining}</Text>
        </View>
      )}
    </View>
  )
}

export default function InvoicePDFSectionMini4({ report }: { report: any }) {
  const gia = report.GIANATURALDIAMONDGRADINGREPORT || {}
  const grading = report.GRADINGRESULTS || {}
  const additional = report.ADDITIONALGRADINGINFORMATION || {}
  const images = report.Images || {}

  const jobNumber = Math.floor(10000000 + Math.random() * 90000000)
  const rawCode = Math.floor(Math.random() * 30) + 1;
  const orCode = rawCode.toString().padStart(2, "0");

  return (
    <View style={styles.container}>
      {/* Address */}
      <View style={{ top: 15 }}>
        {report.address && (
          <Text
            style={{
              fontFamily: baseFont,
              fontWeight: "normal",
              fontSize: 6,
              color: "#333",
              marginBottom: -1,
            }}
          >
            {report.address}
          </Text>
        )}
        {(report.city || report.state) && (
          <Text
            style={{
              fontFamily: baseFont,
              fontWeight: "normal",
              fontSize: 6,
              color: "#333",
              marginBottom: -1,
            }}
          >
            {report.city},{report.state}
          </Text>
        )}
        {report.country && (
          <Text
            style={{
              fontFamily: baseFont,
              fontWeight: "normal",
              fontSize: 6,
              color: "#333",
              marginBottom: -1,
            }}
          >
            {report.country}
          </Text>
        )}
      </View>
      {/* Barcode 12 */}
      {images.Barcode12?.image && (
        <View style={styles.barcode12Wrapper}>
          <Image src={`${BASE_URL}${images.Barcode12.image}`} style={styles.barcode12Image} />
          <Text style={styles.barcodeNumber}>{images.Barcode12.number}</Text>
        </View>
      )}

      {/* Job Number */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "baseline",
          marginTop: "-2px",
          width: "100%",
        }}
      >
        <Text style={styles.fieldLabel}>JOB:</Text>
        <Text style={[styles.fieldLabel, { marginRight: "auto" }]}>{jobNumber}</Text>
        <Text style={styles.fieldLabel}>{orCode}</Text>
      </View>

      {/* Report Date */}
      <MiniRow label="GIA Report No" value={gia.GIAReportNumber} />
      <MiniRow label="Shape" value={gia.ShapeandCuttingStyle} limit={22} />
      <MiniRow label="Meas" value={gia.Measurements} />
      <MiniRow label="Carat Weight" value={grading.CaratWeight} />
      <MiniRow label="Color" value={grading.ColorGrade} />
      <MiniRow label="Clarity" value={grading.ClarityGrade} />

      {grading.CutGrade && <MiniRow label="Cut" value={grading.CutGrade} />}

      {/* Proportions */}
      {images.Proportions && (
        <>
          <Text style={styles.label}>Proportion:</Text>
          <Image src={`${BASE_URL}${images.Proportions}`} style={styles.diagram} />
        </>
      )}

      {/* Additional Info */}
      <MiniRow label="Polish" value={additional.Polish} />
      <MiniRow label="Symmetry" value={additional.Symmetry} />
      <MiniRow label="Fluorescence" value={additional.Fluorescence} />
      <MiniRow
        label="Clarity char"
        value={additional.ClarityCharacteristics}
        limit={20}
      />

      {/* Inscription */}
      <View style={[commonStyles.fieldRow, { marginBottom: 6.5 }]}>
        <Text style={[commonStyles.fieldLabel, { marginRight: -1 }]}>
          Inscription
          <Text
            style={{
              fontFamily: "Helvetica-Light",
              fontWeight: "light",
              fontSize: 8,
              color: "#333",
            }}
          >
            (
          </Text>
          s
          <Text
            style={{
              fontFamily: "Helvetica-Light",
              fontWeight: "light",
              fontSize: 8,
              color: "#333",
            }}
          >
            )
          </Text>
          : {"\u00A0"}
        </Text>
        <Text style={commonStyles.fieldLabel}>GIA {gia.GIAReportNumber}</Text>
      </View>

      {/* Barcode 10 */}
      {images.Barcode10?.image && (
        <View style={styles.barcode10Row}>
          <Image src={`${BASE_URL}${images.Barcode10.image}`} style={styles.barcode10Image} />
          <Text style={styles.barcode10Text}>{images.Barcode10.number}</Text>
        </View>
      )}
    </View>
  )
}

/* Styles */
const styles = StyleSheet.create({
  container: {
    paddingRight: 4,
    width: "100%",
    height: "100%",
    fontSize: 6,
  },

  smallText: {
    fontFamily: baseFont,
    fontSize: 6.5,
    color: "#555",
    marginBottom: 1.5,
  },

  barcode12Wrapper: {
    marginVertical: 2,
    alignItems: "center",
  },

  barcode12Image: {
    width: 96,
    height: 30,
    top: 8,
    objectFit: "contain",
  },

  barcodeNumber: {
    fontFamily: baseFont,
    fontSize: 7,
    marginTop: -1,
    right: 26,
  },

  fieldLabel: {
    fontFamily: baseFont,
    fontWeight: "normal",
    fontSize: 6.5,
    right: 1,
    color: "#333",
    letterSpacing: "-0.20",
  },

  reportDate: {
    fontFamily: baseFont,
    fontSize: 6.5,
    marginTop: 2.5,
    color: "#333",
  },

  label: {
    fontFamily: baseFont,
    fontSize: 6,
    color: "#333",
  },

  value: {
    fontFamily: baseFont,
    fontSize: 6,
    fontWeight: "bold",
    color: "#4B4B4D",
  },

  separator: {
    flexGrow: 1,
    borderBottom: "1px dotted #4B4B4D",
    top:-1,
    marginHorizontal: 1,
  },

  separatorInvisible: {
    flexGrow: 1,
    marginHorizontal: 1,
  },

  diagram: {
    width: 83,
    height: 64,
    marginVertical: 1.5,
    objectFit: "contain",
  },

  barcode10Row: {
    marginTop: 10,
  },

  barcode10Image: {
    width: 90,
    height: 10,
    objectFit: "contain",
  },

  barcode10Text: {
    fontFamily: "OCR",
    fontSize: 7,
    marginLeft: 3,
  },
})
