// lib/queryKeys.ts
export const QUERY_KEYS = {
  auth: ["auth"] as const,
  reports: {
    all: (params?: any) => ["reports", "list", params] as const,
    detail: (reportNumber: string) =>
      ["reports", "detail", reportNumber] as const,
  },
};
