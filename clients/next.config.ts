// next.config.ts
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // any other Next.js config you already had
};

const withNextIntl = createNextIntlPlugin(); // looks for ./src/i18n/request.ts by default
export default withNextIntl(nextConfig);
