// lib/apiClient.ts
// import { LoginRequest } from "@/types/auth";
import { createAxiosClient } from "./axiosClient";
import type { AxiosProgressEvent } from "axios";
// import { PagedResponse, Report } from "@/types/report";
import { appendFormData } from "./formHelpers";
import { LoginRequest } from "../types/auth";
import { PagedResponse } from "../types/report";

export class ApiError extends Error {
  status: number;
  payload?: any;
  constructor(message: string, status = 500, payload?: any) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

function handleAxiosError(err: any): never {
  if (err?.response) {
    const status = err.response.status;
    const payload = err.response.data;
    throw new ApiError(
      payload?.message ?? err.message ?? "API error",
      status,
      payload
    );
  } else if (err?.request) {
    throw new ApiError("No response from server", 0, { details: err.message });
  }
  throw new ApiError(err?.message ?? "Unknown error", 0);
}

type UploadProgress = (ev: AxiosProgressEvent | ProgressEvent) => void;

export const apiClient = {
  // AUTH
  login: async (credentials: LoginRequest): Promise<any> => {
    try {
      const axios = createAxiosClient();
      const res = await axios.post<any>("/auth/login", credentials);
      return res.data;
    } catch (err: any) {
      handleAxiosError(err);
    }
  },

  // REPORTS
  getReportById: async (reportNo: string): Promise<Report> => {
    try {
      const axios = createAxiosClient();
      const res = await axios.get<Report>(
        `/public-report/${encodeURIComponent(reportNo)}`
      );
      return res.data;
    } catch (err: any) {
      handleAxiosError(err);
    }
  },

  getAllReports: async (
    params?: { page?: number; pageSize?: number; q?: string },
    opts?: { token?: string }
  ): Promise<PagedResponse<Report>> => {
    try {
      const axios = createAxiosClient({ token: opts?.token });
      // use axios params to serialize query string
      const res = await axios.get<PagedResponse<Report>>("/reports", {
        params,
      });
      return res.data;
    } catch (err: any) {
      handleAxiosError(err);
    }
  },

  updateReport: async (
    reportNumber: string,
    body: Partial<Report>,
    opts?: { token?: string }
  ): Promise<Report> => {
    try {
      const axios = createAxiosClient({ token: opts?.token });
      const res = await axios.put<Report>(
        `/reports/${encodeURIComponent(reportNumber)}`,
        body
      );
      return res.data;
    } catch (err: any) {
      handleAxiosError(err);
    }
  },

  deleteReport: async (
    reportNumber: string,
    opts?: { token?: string }
  ): Promise<{ success: boolean }> => {
    try {
      const axios = createAxiosClient({ token: opts?.token });
      const res = await axios.delete<{ success: boolean }>(
        `/reports/${encodeURIComponent(reportNumber)}`
      );
      return res.data;
    } catch (err: any) {
      handleAxiosError(err);
    }
  },

  // XLSX upload — use FormData
  uploadXlsx: async (
    file: File,
    opts?: {
      token?: string;
      onUploadProgress?: UploadProgress;
      companyLogo?: File | null;
      diamondType?: string | null;
      isecopy?: boolean | null;
      comment?: string | null;
      notice_image?: boolean | null;
      igi_logo?: boolean | null;
    }
  ): Promise<any> => {
    try {
      const axios = createAxiosClient({ token: opts?.token });
      const form = new FormData();

      // required xlsx file
      form.append("file", file);

      // optional fields: append only if provided (not null/undefined)
      if (opts?.companyLogo) {
        form.append("company_logo", opts.companyLogo);
      }
      if (opts?.diamondType != null) {
        form.append("diamond_type", opts.diamondType);
      }
      if (typeof opts?.isecopy !== "undefined" && opts.isecopy !== null) {
        // backend receives text via multipart; send boolean as "true"/"false"
        form.append("isecopy", String(opts.isecopy));
      }
      if (opts?.comment != null) {
        form.append("comment", opts.comment);
      }
      if (
        typeof opts?.notice_image !== "undefined" &&
        opts.notice_image !== null
      ) {
        form.append("notice_image", String(opts.notice_image));
      }
      if (typeof opts?.igi_logo !== "undefined" && opts.igi_logo !== null) {
        form.append("igi_logo", String(opts.igi_logo));
      }

      const res = await axios.post("/reports/upload-xlsx", form, {
        onUploadProgress: opts?.onUploadProgress as unknown as (
          progressEvent?: AxiosProgressEvent
        ) => void,
        // Do NOT set Content-Type here; let the browser/axios set multipart boundaries
        headers: { Accept: "application/json" },
      });
      return res.data;
    } catch (err: any) {
      handleAxiosError(err);
    }
  },

  // PDF upload
  // apiClient (where uploadPdf lives)
  uploadPdf: async (
    file: File,
    opts?: {
      token?: string;
      proportions?: any;
      onUploadProgress?: (progressEvent: AxiosProgressEvent) => void;
    }
  ): Promise<any> => {
    try {
      const axios = createAxiosClient({ token: opts?.token });
      const form = new FormData();

      // append file (ensure backend expects "file")
      form.append("file", file);

      // append nested data properly
      if (opts?.proportions !== undefined) {
        // Option A (structured): append object keys recursively
        appendFormData(form, opts.proportions, "proportions");

        // Option B (simple): if the backend expects a single JSON string:
        // form.append('proportions', JSON.stringify(opts.proportions));
      }

      const res = await axios.post("/pdf/upload-pdf/", form, {
        onUploadProgress: opts?.onUploadProgress,
        // Do NOT set Content-Type here. Let the browser set the correct multipart/form-data boundary.
        headers: {
          Accept: "application/json",
          // no 'Content-Type' entry
        },
      });

      return res.data;
    } catch (err: any) {
      // your existing handler
      handleAxiosError(err);
      throw err;
    }
  },

  // EXPORT BACKUP (returns binary blob + optional filename)
  exportBackup: async (): Promise<{ blob: Blob; filename?: string }> => {
    try {
      const axios = createAxiosClient();
      const res = await axios.post(
        "/reports/export-backup",
        {},
        { responseType: "blob" }
      );

      const blob = res.data as Blob;
      const disp =
        res.headers?.["content-disposition"] ||
        res.headers?.["Content-Disposition"];
      let filename: string | undefined;
      if (disp) {
        const match = /filename\*?=(?:UTF-8'')?["']?([^;"']+)/i.exec(disp);
        if (match) filename = decodeURIComponent(match[1]);
      }

      return { blob, filename };
    } catch (err: any) {
      handleAxiosError(err);
      throw err;
    }
  },

  importBackup: async (file: File): Promise<any> => {
    try {
      const axios = createAxiosClient();
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post("/reports/import-backup", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch (err: any) {
      handleAxiosError(err);
      throw err;
    }
  },
};
