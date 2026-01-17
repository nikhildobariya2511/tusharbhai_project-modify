// hooks/useReports.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "../lib/apiClient"
import type { Report, PagedResponse } from "../types/report"
import { QUERY_KEYS } from "../lib/queryKeys"
import type { AxiosProgressEvent } from "axios"

type UploadProgress = (ev: AxiosProgressEvent | ProgressEvent) => void

export function useReport(reportNumber: string) {
  return useQuery<any, Error>({
    queryKey: QUERY_KEYS.reports.detail(reportNumber),
    queryFn: async () => {
      // queryFn will only be used when enabled===true, but keep a guard anyway
      if (!reportNumber) throw new Error("Missing reportNumber")
      return apiClient.getReportById(reportNumber)
    },
    enabled: !!reportNumber,
    staleTime: 0,
  })
}

const invalidateAndRefetchReports = (qc: any) => {
  // Invalidate any query whose key starts with ["reports","all", ...params]
  qc.invalidateQueries({
    predicate: (query: any) => {
      const key = query.queryKey as unknown[]
      return Array.isArray(key) && key[0] === "reports" && key[1] === "all"
    },
  })
  // Force an immediate refetch of matching queries (useful if they are currently inactive/you want instant reload)
  qc.refetchQueries({
    predicate: (query: any) => {
      const key = query.queryKey as unknown[]
      return Array.isArray(key) && key[0] === "reports" && key[1] === "all"
    },
  })
}

export function useReports(params?: {
  page?: number
  size?: number
  q?: string
}) {
  return useQuery<PagedResponse<Report>, Error>({
    queryKey: QUERY_KEYS.reports.all(params),
    queryFn: () => apiClient.getAllReports(params),
    staleTime: 30_000,
  })
}

export function useUploadXlsx() {
  const qc = useQueryClient()
  return useMutation<
    any,
    Error,
    {
      file: File
      onUploadProgress?: UploadProgress
      companyLogo?: File | null
      diamondType?: string | null
      isecopy?: boolean | null
      comment?: string | null
      notice_image?: boolean | null
      igi_logo?: boolean | null
    }
  >({
    mutationFn: ({ file, onUploadProgress, companyLogo, diamondType, isecopy, comment, igi_logo, notice_image }) =>
      apiClient.uploadXlsx(file, {
        onUploadProgress,
        companyLogo,
        diamondType,
        isecopy,
        comment,
        igi_logo,
        notice_image,
      }),
    onSuccess: () => {
      // qc.invalidateQueries({ queryKey: QUERY_KEYS.reports.all() });
      invalidateAndRefetchReports(qc)
    },
  })
}

export function useUploadPdf() {
  const qc = useQueryClient()
  return useMutation<any, Error, { file: File; proportions?: any; onUploadProgress?: (e: any) => void }>({
    mutationFn: ({ file, proportions, onUploadProgress }) =>
      apiClient.uploadPdf(file, { proportions, onUploadProgress }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.reports.all() })
    },
  })
}

export function useMiniReports() {
  const qc = useQueryClient()
  return useMutation<any, Error, { files: File[]; onUploadProgress?: (e: any) => void }>({
    mutationFn: ({ files, onUploadProgress }) => apiClient.uploadMiniReports(files, { onUploadProgress }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.reports.all() })
    },
  })
}

export function useUpdateReport() {
  const qc = useQueryClient()
  return useMutation<Report, Error, { reportNumber: string; body: Partial<Report> }>({
    mutationFn: ({ reportNumber, body }) => apiClient.updateReport(reportNumber, body),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({
        queryKey: QUERY_KEYS.reports.detail(variables.reportNumber),
      })
      // qc.invalidateQueries({ queryKey: QUERY_KEYS.reports.all() });
      invalidateAndRefetchReports(qc)
    },
  })
}

export function useDeleteReport() {
  const qc = useQueryClient()
  return useMutation<{ success: boolean }, Error, { reportNumber: string }>({
    mutationFn: ({ reportNumber }) => apiClient.deleteReport(reportNumber),
    onSuccess: (_, variables) => {
      invalidateAndRefetchReports(qc)
      qc.removeQueries({
        queryKey: QUERY_KEYS.reports.detail(variables.reportNumber),
      })
    },
  })
}

export type ExportResult = { blob: Blob; filename?: string }

export function useExportBackup(options?: {
  onSuccess?: (fileUrl: string | null) => void
  onError?: (err: unknown) => void
}) {
  return useMutation<ExportResult, Error, void, unknown>({
    // provide the mutationFn as part of the options object
    mutationFn: async (): Promise<ExportResult> => {
      return apiClient.exportBackup()
    },
    onError: (err) => {
      options?.onError?.(err)
    },
    onSuccess: (data) => {
      options?.onSuccess?.(data?.filename ?? null)
    },
  })
}

export function useImportBackup(options?: {
  onSuccess?: (res: any) => void
  onError?: (err: unknown) => void
}) {
  const qc = useQueryClient()

  return useMutation<any, Error, File, unknown>({
    mutationFn: (file: File) => apiClient.importBackup(file),
    onError: (err) => {
      options?.onError?.(err)
    },
    onSuccess: (res) => {
      console.log("res", res)
      invalidateAndRefetchReports(qc)
      options?.onSuccess?.(res)
    },
  })
}
