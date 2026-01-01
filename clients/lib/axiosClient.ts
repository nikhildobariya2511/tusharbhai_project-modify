// lib/axiosClient.ts
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

/**
 * Read cookie by name from document.cookie (client-side only).
 */
export function getCookieFromDocument(name: string): string | null {
  if (typeof document === "undefined") return null;
  const matches = document.cookie.match(
    new RegExp(
      "(?:^|; )" + name.replace(/([.$?*|{}()[\]\\/+^])/g, "\\$1") + "=([^;]*)"
    )
  );
  return matches ? decodeURIComponent(matches[1]) : null;
}

/**
 * Create an axios instance. If token is provided, attach Authorization header.
 * On client usage call createAxiosClient() (no args) — it will read document.cookie token.
 * For server usage pass the token (from request cookies/headers).
 */

export const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export function createAxiosClient(opts?: { token?: string; baseURL?: string }) {
  const baseURL = opts?.baseURL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  console.log("baseURL", baseURL);
  const token = opts?.token ?? getCookieFromDocument("token") ?? null;

  const instance = axios.create({
    baseURL,
    withCredentials: true, // if you use cookies cross-site, keep this in mind
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    // you can add timeout, etc.
  });

  // Optional: request interceptor to ensure Authorization header exists if token becomes available later
  instance.interceptors.request.use((config) => {
    // if the header is already present, keep it
    if (config.headers && !config.headers["Authorization"]) {
      // try to get token from document cookie (client); do NOT call document on server
      if (typeof document !== "undefined") {
        const docToken = getCookieFromDocument("token");
        if (docToken) {
          config.headers["Authorization"] = `Bearer ${docToken}`;
        }
      }
      // if this instance was created with opts.token it is already set in default headers
    }
    return config;
  });

  return instance;
}
