// hooks/useAuth.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../lib/apiClient";
import { LoginRequest } from "../types/auth";
import { QUERY_KEYS } from "../lib/queryKeys";

export function useLogin() {
  const qc = useQueryClient();

  return useMutation<any, Error, LoginRequest>({
    mutationFn: (creds) => apiClient.login(creds),
    onSuccess: (data) => {
      console.log("data", data);
      try {
        if (typeof document !== "undefined" && data?.access_token) {
          const token = encodeURIComponent(data.access_token);

          // 10 years in seconds: 10 * 365 * 24 * 60 * 60 = 315360000
          const maxAge = 315360000;

          // Build an expires date for compatibility (UTC string)
          const expiresDate = new Date(
            Date.now() + maxAge * 1000
          ).toUTCString();

          // Add Secure flag only on HTTPS
          const secure =
            typeof window !== "undefined" &&
            window.location?.protocol === "https:"
              ? ";Secure"
              : "";

          document.cookie = `token=${token};path=/;SameSite=Lax;max-age=${maxAge};expires=${expiresDate}${secure}`;
        }
      } catch (e) {
        // ignore
      }

      // optionally invalidate admin-only endpoints
      qc.invalidateQueries({ queryKey: QUERY_KEYS.reports.all() });
    },
  });
}
