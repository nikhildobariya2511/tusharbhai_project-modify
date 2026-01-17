/**
 * Generate PDF filename for mini reports
 * Format: "reportnumber color Weight.pdf" for single report
 * Format: "reportnumber color Weight & reportnumber color Weight.pdf" for dual reports
 */

export interface ReportNameData {
  reportNumber: string
  color: string
  weight: string
}

/**
 * Extract report name data from report object
 */
export function extractReportNameData(report: any): ReportNameData | null {
  if (!report) return null

  const reportNumber = report.ReportNumber || report.GIANATURALDIAMONDGRADINGREPORT?.GIAReportNumber || ""
  const color = report.GRADINGRESULTS?.ColorGrade || "Unknown"
  const weight = report.GRADINGRESULTS?.CaratWeight || "Unknown"

  if (!reportNumber) return null

  return {
    reportNumber,
    color,
    weight: weight.replace(" carat", "").trim(), // Extract just the number (e.g., "0.50" from "0.50 carat")
  }
}

/**
 * Generate a single report filename
 * Example: "2516758150 D 0.50.pdf"
 */
export function generateSingleReportFileName(report: any): string {
  const data = extractReportNameData(report)
  if (!data) return `mini-report-${Date.now()}.pdf`

  return `${data.reportNumber} ${data.color} ${data.weight}.pdf`
}

/**
 * Generate a dual report filename
 * Example: "2516758150 D 0.50 & 7518722328 D 0.50.pdf"
 */
export function generateDualReportFileName(report1: any, report2: any): string {
  const data1 = extractReportNameData(report1)
  const data2 = extractReportNameData(report2)

  if (!data1 || !data2) return `mini-reports-${Date.now()}.pdf`

  return `${data1.reportNumber} ${data1.color} ${data1.weight} & ${data2.reportNumber} ${data2.color} ${data2.weight}.pdf`
}

/**
 * Generate filename based on number of reports
 */
export function generateMiniReportFileName(reports: (any | null)[]): string {
  const validReports = reports.filter((r) => r !== null)

  if (validReports.length === 2) {
    return generateDualReportFileName(validReports[0], validReports[1])
  } else if (validReports.length === 1) {
    return generateSingleReportFileName(validReports[0])
  }

  return `mini-reports-${Date.now()}.pdf`
}
