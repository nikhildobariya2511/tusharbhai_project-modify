// app/report-viewer-grid/client.tsx
'use client'

import JewelryReportGrid from '../../../components/excelToReport/JewelryReportGrid/JewelryReportGrid'
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
    // eslint-disable-next-line react-hooks/rules-of-hooks
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
        <JewelryReportGrid
            // data={[dummyData]}
            data={[reportData]}
        />
    )
}
