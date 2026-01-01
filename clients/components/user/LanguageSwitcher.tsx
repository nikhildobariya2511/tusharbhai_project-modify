"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type Locale = "en" | "zh";

export default function LanguageSwitcher() {
    const router = useRouter();
    const pathname = usePathname() ?? "/";

    const initialLocale: Locale = pathname.startsWith("/zh") ? "zh" : "en";
    const [locale, setLocale] = useState<Locale>(initialLocale);

    useEffect(() => {
        // keep state synced if pathname changes externally
        setLocale(pathname.startsWith("/zh") ? "zh" : "en");
    }, [pathname]);

    function switchTo(localeTo: Locale) {
        if (localeTo === "en") {
            const pathWithoutZh = pathname.replace(/^\/zh/, "") || "/";
            router.push(pathWithoutZh);
            setLocale("en");
        } else {
            // zh
            if (pathname.startsWith("/zh")) {
                router.push(pathname);
            } else {
                router.push(`/zh${pathname}`);
            }
            setLocale("zh");
        }
    }

    // helpers (no LANGS constant — simplified for two locales)
    const currentFlagSuffix = locale === "en" ? "en" : "cn";
    const currentLabel = locale === "en" ? "English" : "中文 (简体)";

    const otherLocale: Locale = locale === "en" ? "zh" : "en";
    const otherFlagSuffix = otherLocale === "en" ? "en" : "cn";
    const otherLabel = otherLocale === "en" ? "English" : "中文 (简体)";

    return (
        <aside
            className="fixed bottom-[5px] right-10 z-[999] text-left bg-white border border-[#ccc] p-[5px] text-[16px] flex"
        >
            <label
                className="w-auto"
                data-l={locale}
                data-code-language={locale === "en" ? "wg-en" : "zh"}
                data-name-language={currentLabel}
                role="button"
                aria-label={`Switch language to ${currentLabel}`}
            >
                {/* Use exact class names your CSS expects: flag-after--en or flag-after--cn */}
                <span className={`flag-after--${currentFlagSuffix} cursor`}>
                    {currentLabel}
                </span>
            </label>

            <ul role="none" className="align-middle list-none">
                <li key={otherLocale} data-l={otherLocale} className="my-[2px]" data-code-language={otherLocale}>
                    <a
                        className={`px-[10px] whitespace-nowrap cursor-pointer flag-after--${otherFlagSuffix} hover:text-[#00a0d2] hover:underline`}
                        title={`Language switcher: ${otherLabel === 'English' ? 'English' : 'Chinese (Simplified)'}`}
                        onClick={(e) => {
                            e.preventDefault();
                            switchTo(otherLocale);
                        }}
                        aria-label={`Switch language to ${otherLabel}`}
                    >
                        {otherLabel}
                    </a>
                </li>
            </ul>
        </aside>
    );
}
