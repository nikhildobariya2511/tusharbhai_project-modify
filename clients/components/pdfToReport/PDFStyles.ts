// PDFStyles.ts
import { StyleSheet } from "@react-pdf/renderer";

export const baseFont = "DINPro";

export const commonStyles = StyleSheet.create({
  fieldRow: {
    flexDirection: "row",
    // alignItems: "baseline",
    marginBottom: "3.5px",
    width: "100%",
  },
  fieldLabel: {
    fontFamily: baseFont,
    fontWeight: "normal",
    fontSize: 9,
    color: "#333",
    letterSpacing: "-0.20",
  },
  // PDFStyles.ts (add these into commonStyles)
  shapeFieldValueContainer: {
    flexDirection: "column", // stack first-line and continuation vertically
    alignItems: "flex-end", // align children to right edge so continuation starts from the right
    // backgroundColor: "red",
    padding: 0,
    margin: 0,
    width: "48%", // tune this percentage to match your layout — ensures this column has a fixed width
  },
  ReportDate: {
    fontFamily: baseFont,
    fontWeight: "normal",
    fontSize: 9,
    color: "#333",
    marginBottom: 5,
  },
  separator: {
    flexGrow: 1,
    borderBottom: "1px dotted #4B4B4D",
    marginHorizontal: "1px",
    height: 10,
  },
  fieldValue: {
    fontFamily: baseFont,
    fontWeight: "bold",
    fontSize: 9,
    color: "#4B4B4D",
    textAlign: "right",
    letterSpacing: "-0.20",
  },
  headerText: {
    fontFamily: baseFont,
    fontSize: 12,
    marginBottom: 10,
  },
  commentText: {
    fontFamily: baseFont,
    fontSize: 10,
    marginTop: 8,
    color: "#000",
    lineHeight: 1.3,
  },
  boldText: {
    fontSize: 10,
    color: "#000",
  },
  barcodeImage: {
    width: "80%",
    height: "100%",
    objectFit: "contain",
  },
  paragraphText: {
    fontFamily: baseFont,
    fontSize: 10,
    color: "#000",
    lineHeight: 1.3,
  },
  AddressText: {
    fontFamily: baseFont,
    fontSize: 10,
    color: "#333",
    width: "70%",
  },
});
