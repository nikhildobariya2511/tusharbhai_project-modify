// src/i18n/request.ts
import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async () => {
  // cookies() returns a RequestCookies object synchronously
  const store = cookies();
  const locale = (await store).get("locale")?.value || "en";

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
