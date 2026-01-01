// app/report-viewer-pdf/client.tsx
'use client'

import JewelryReportSingle from '../../../components/excelToReport/JewelryReportSingle/JewelryReportSingle'
import { useReport } from '../../../hooks/useReports'
import { dummyData } from '../../../lib/env'
import { useSearchParams } from 'next/navigation'
import React from 'react'

export default function Client() {
    const searchParams = useSearchParams()
    const paramR = searchParams.get('r')

    // Handle the case where `paramR` is null early
    if (!paramR) {
        return <div>No report number found in URL</div>
    }

    // Now `paramR` is guaranteed to be a string, so it can be passed to the hook
    const { data: reportData, isLoading: queryLoading, error } = useReport(paramR)

    if (queryLoading) {
        return <div>Loading report...</div>
    }

    if (error) {
        return <div>Error fetching report: {error.message}</div>
    }

    if (!reportData.report_no) {
        return <div>No Date Found{ }</div>
    }

    return (
        <JewelryReportSingle
            // data={dummyData}
            data={reportData}
        />
    )
}
