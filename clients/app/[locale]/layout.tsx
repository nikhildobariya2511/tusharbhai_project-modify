//app/[locale]/layout.tsx
import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";

type Props = {
    children: ReactNode;
    // params may be passed as a Promise in some Next.js server contexts,
    // so accept either a plain object or a Promise of that object.
    params: { locale: string } | Promise<{ locale: string }>;
};

export async function generateStaticParams() {
    return [{ locale: "zh" }];
}

export default async function LocaleLayout({ children, params }: Props) {
    // Await params (handles the case when Next provides it as a Promise)
    const { locale } = (await params) as { locale: string };

    // Only allow "zh" here; English handled at root /Verify-Your-Report layout
    if (locale !== "zh") {
        return notFound();
    }

    let messages: Record<string, any>;
    try {
        messages = (await import(`../../messages/${locale}.json`)).default;
    } catch (e) {
        return notFound();
    }

    // NOTE: root layout defines <html>/<body>, so don't include them here.
    return <NextIntlClientProvider locale={locale} messages={messages}>{children}</NextIntlClientProvider>;
}
