// components/admin/ProductTable.tsx
"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import type {
    GridReadyEvent,
    GridApi,
    ColDef,
    ICellRendererParams,
} from "ag-grid-community";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";

import { Input } from "../ui/input";
import { useReports } from "../../hooks/useReports";
import EditModal from "./EditModal";
import DeleteModal from "./DeleteModal";
import { Button } from "../ui/button";
import { DEFAULT_PAGE_SIZE, MAX_SEARCH_WORDS } from "../../lib/env";
import { toast } from "sonner";

ModuleRegistry.registerModules([AllCommunityModule]);

export type Product = {
    report_no: string;
    shape_and_cut?: string;
    tot_est_weight?: number | string;
    color?: string;
    clarity?: string;
    style_number?: string;
    // optional fields your EditModal might read (description, etc.)
    description?: string;
};

/* ActionCell: typed React cell renderer component */
/* Replace the previous ActionCell with this version */
const ActionCell: React.FC<
    ICellRendererParams<Product, any> & {
        onEdit?: (report_no: string) => void;
        onDeleted?: (report_no: string) => void;
        buttonClassName?: string;
    }
> = (props) => {
    const { data, onEdit, onDeleted, buttonClassName } = props;
    if (!data) return <div />;

    const handleEdit = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        e?.preventDefault();
        onEdit?.(data.report_no ?? "");
    };

    const handlePrint = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        e?.preventDefault();
        const reportNo = data.report_no ?? "";
        if (!reportNo) return;
        const url = `/admin/report-viewer-grid?r=${encodeURIComponent(reportNo)}`;
        try {
            window.open(url, "_blank", "noopener,noreferrer");
        } catch {
            // silent
        }
    };

    return (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <Button
                type="button"
                onClick={handleEdit}
                title="Edit"
                className="transition-smooth hover:scale-[1.02]"
                variant={"default"}
            >
                Edit
            </Button>

            <Button
                type="button"
                onClick={handlePrint}
                title={`Open report ${data.report_no}`}
                className="transition-smooth hover:scale-[1.02]"
                variant={"outline"}
            >
                Print
            </Button>

            <div className="relative" onClick={(e) => e.stopPropagation()}>
                <DeleteModal
                    report_no={data.report_no}
                    onDeleted={() => onDeleted?.(data.report_no)}
                    buttonClassName={buttonClassName ?? "px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700 text-sm"}
                    dialogTitle={`Delete report ${data.report_no}?`}
                    dialogDescription="This will permanently delete the report. This action cannot be undone."
                />
            </div>
        </div>
    );
};

export default function ProductTable() {
    const gridApi = useRef<GridApi | null>(null);

    // client-visible controls
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
    const [quickSearch, setQuickSearch] = useState("");

    // debounce search input so we don't spam the server
    const [debouncedQ, setDebouncedQ] = useState("");
    useEffect(() => {
        const t = setTimeout(() => setDebouncedQ(quickSearch.trim()), 350);
        return () => clearTimeout(t);
    }, [quickSearch]);

    const q = useMemo(
        () =>
            debouncedQ
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, MAX_SEARCH_WORDS)
                .join(" "),
        [debouncedQ]
    );

    const { data, isLoading, isError, error, refetch, isFetching } = useReports({
        page,
        size: pageSize,
        q: q || undefined,
    });

    const extractItems = (d: any): any[] => d?.items ?? d?.data ?? d?.reports ?? d?.results ?? [];
    const extractTotal = (d: any): number | null => d?.total ?? d?.totalItems ?? d?.count ?? d?.meta?.total ?? null;

    const rows = useMemo<Product[]>(() => {
        const items = extractItems(data);
        return items.map((r: any) => ({
            report_no: r.report_no,
            // shape_and_cut: r.shape_and_cut,
            // tot_est_weight: r.tot_est_weight,
            // color: r.color,
            // clarity: r.clarity,
            style_number: r.style_number,
            // reportedDate: r.reportedDate,
            // description: r.description,
        } as Product));
    }, [data]);

    const totalRows = useMemo(() => {
        const t = extractTotal(data);
        return typeof t === "number" ? t : null;
    }, [data]);

    // editing modal state
    const [editingReportNumber, setEditingReportNumber] = useState<string | null>(null);
    const openEditForReport = useCallback((reportNo: string) => setEditingReportNumber(reportNo), []);
    const closeEdit = useCallback(() => setEditingReportNumber(null), []);
    const afterSaveOrDelete = useCallback(() => refetch(), [refetch]);

    // Column definitions — NOTE: the Actions column does NOT have a `field`
    const columnDefs = useMemo<ColDef<Product, any>[]>(
        () => [
            { headerName: "Report_NO", field: "report_no", sortable: false, filter: false, resizable: true, minWidth: 180 },
            { headerName: "Style_Number", field: "style_number", sortable: false, filter: false, minWidth: 160 },
            // { headerName: "Shape and Cut", field: "shape_and_cut", sortable: false, filter: false, minWidth: 200 },
            // { headerName: "Tot_Est_Weight", field: "tot_est_weight", sortable: false, filter: "agNumberColumnFilter", minWidth: 140 },
            // { headerName: "Color", field: "color", sortable: false, filter: false, minWidth: 110 },
            // { headerName: "Clarity", field: "clarity", sortable: false, filter: false, minWidth: 110 },
            {
                headerName: "Actions",
                pinned: 'right',
                // DO NOT add `field` here — actions column doesn't correspond to a data field
                minWidth: 250,
                sortable: false,
                filter: false,
                // Provide a cellRenderer function that returns our React component
                cellRenderer: (params: ICellRendererParams<Product, any>) => (
                    <ActionCell
                        {...params}
                        onEdit={(reportNo) => openEditForReport(reportNo)}
                        onDeleted={() => afterSaveOrDelete()}
                    />
                ),
            },
        ],
        [openEditForReport, afterSaveOrDelete]
    );

    const defaultColDef = useMemo(
        () => ({ sortable: true, filter: true, resizable: true, suppressMovable: false, flex: 0 }),
        []
    );

    const onGridReady = useCallback((params: GridReadyEvent) => {
        gridApi.current = params.api;
        params.api.sizeColumnsToFit();
    }, []);

    useEffect(() => {
        setPage(1);
    }, [pageSize, q]);

    const totalPages = totalRows ? Math.max(1, Math.ceil(totalRows / pageSize)) : null;
    const canPrev = page > 1;
    const canNext = totalPages ? page < totalPages : rows.length === pageSize;

    return (
        <div className="max-w-3xl mx-auto relative">
            <div style={{ display: "flex", alignItems: "center", justifyContent: 'center', gap: 12, marginBottom: 8 }}>
                <Input
                    aria-label="Search products"
                    placeholder="Search (up to 25 words)"
                    style={{ width: 400 }}
                    value={quickSearch}
                    onChange={(e) => setQuickSearch(e.target.value)}
                />
                <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
                    <small>{isFetching || isLoading ? "Loading..." : `Showing ${rows.length} rows`}</small>
                    <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                    <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={!canPrev}>
                        Prev
                    </button>
                    <span>Page {page}{totalPages ? ` of ${totalPages}` : ""}</span>
                    <button onClick={() => setPage((p) => p + 1)} disabled={!canNext}>
                        Next
                    </button>
                </div>
            </div>

            <div className="ag-theme-alpine" style={{ width: "100%", height: 450 }}>
                <AgGridReact
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    rowData={rows}
                    animateRows={false}
                    rowSelection="single"
                    onGridReady={onGridReady}
                    suppressRowClickSelection={true}
                    pagination={false}
                    rowModelType={"clientSide"}
                    getRowId={(params) => params.data.report_no}
                    suppressAggFuncInHeader={true}
                    enableCellTextSelection={true}

                />
            </div>

            {isError && (
                <div style={{ color: "red", marginTop: 8 }}>
                    Error loading reports: {(error as any)?.message ?? String(error)}
                </div>
            )}
            <EditModal
                reportNumber={editingReportNumber ?? ""}
                onClose={closeEdit}
                onSave={() => {
                    closeEdit();
                    afterSaveOrDelete();
                    toast.success("Report updated");
                }}
            />
        </div>
    );
}
