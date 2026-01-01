// app/Verify-Your-Report/layout.tsx
import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";

type Props = {
    children: ReactNode;
};

export default async function VerifyLayout({ children }: Props) {
    const locale = "en";
    // path relative to this file: src/messages/en.json -> ../../messages
    const messages = (await import(`../../messages/${locale}.json`)).default as Record<string, any>;

    return (
        <NextIntlClientProvider locale={locale} messages={messages}>
            {children}
        </NextIntlClientProvider>
    );
}
