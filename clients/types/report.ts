// types/report.ts
export type Report = {
  report_no: string; // e.g., "66J239165799"
  description: string;
  shape_and_cut: string;
  tot_est_weight: string;
  color: string;
  clarity: string;
  style_number: string;
  comment: string | null;
};

export type PagedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};
