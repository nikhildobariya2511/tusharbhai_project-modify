/* eslint-disable @typescript-eslint/no-explicit-any */

import { View, Text } from "@react-pdf/renderer"
import { baseFont, commonStyles } from "./PDFStyles"

/* ---------- helpers ---------- */

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
      <View style={commonStyles.fieldRow}>
        <Text style={commonStyles.fieldLabel}>{label}</Text>
        <View style={commonStyles.separator} />
        <Text style={commonStyles.fieldValue}>{firstLine}</Text>
      </View>

      {/* wrapped continuation */}
      {remaining && (
        <View style={commonStyles.fieldRow}>
          <Text style={commonStyles.fieldLabel} />
          <View style={[commonStyles.separator, { borderBottom: "none" }]} />
          <Text style={commonStyles.fieldValue}>{remaining}</Text>
        </View>
      )}
    </View>
  )
}

/* ---------- component ---------- */

export default function InvoicePDFSectionMini1({ report }: any) {
  const gia = report.GIANATURALDIAMONDGRADINGREPORT || {}
  const grading = report.GRADINGRESULTS || {}
  const additional = report.ADDITIONALGRADINGINFORMATION || {}

  return (
    <View>
      {report.ReportDate && (
        <Text
          style={{
            fontFamily: baseFont,
            fontSize: 8,
            color: "#333",
            marginBottom: 5.5,
          }}
        >
          {report.ReportDate}
        </Text>
      )}

      <MiniRow label="GIA Report Number" value={gia.GIAReportNumber} />
      <MiniRow
        label="Shape and Cutting Style"
        value={gia.ShapeandCuttingStyle}
        limit={30}
      />
      <MiniRow label="Measurements" value={gia.Measurements} />

      <View style={{ height: 34 }} />

      <MiniRow label="Carat Weight" value={grading.CaratWeight} />
      <MiniRow label="Color Grade" value={grading.ColorGrade} />
      <MiniRow label="Clarity Grade" value={grading.ClarityGrade} />
      <MiniRow label="Cut Grade" value={grading.CutGrade} />

      <View style={{ height: 31 }} />

      <MiniRow label="Polish" value={additional.Polish} />
      <MiniRow label="Symmetry" value={additional.Symmetry} />
      <MiniRow label="Fluorescence" value={additional.Fluorescence} />


      <MiniRow
        label="Clarity Characteristics"
        value={additional.ClarityCharacteristics}
        limit={30}
      />

      {/* Inscription */}
      <View style={[commonStyles.fieldRow, { marginBottom: 2.5 }]}>
        <Text style={[commonStyles.fieldLabel, { marginRight: -1 }]}>
          Inscription
          <Text
            style={{
              fontFamily: "Helvetica-Light",
              fontSize: 7,
              color: "#4B4B4D",
            }}
          >
            (
          </Text>
          <Text
            style={{
              fontFamily: "DINPro",
              fontSize: 7,
              color: "#4B4B4D",
            }}
          >
            s
          </Text>
          <Text
            style={{
              fontFamily: "Helvetica-Light",
              fontSize: 7,
              color: "#4B4B4D",
            }}
          >
            )
          </Text>
          : {"\u00A0"}
        </Text>

        <Text style={commonStyles.fieldLabel}>
          GIA {gia.GIAReportNumber}
        </Text>
      </View>

    </View>
  )
}
