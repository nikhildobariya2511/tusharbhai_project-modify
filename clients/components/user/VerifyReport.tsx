/* eslint-disable @next/next/no-img-element */
// components/VerifyReport.tsx
"use client";

import React, { useState } from "react";
import styles from "./Verify.module.css";
import QRPage from "./scanQR/QRPage";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";

// memoize at module scope so the MemoQRPage instance is stable across renders
const MemoQRPage = React.memo(QRPage);

export default function VerifyReport() {
    const t = useTranslations("VerifyReport");
    const router = useRouter();
    const searchParams = useSearchParams();
    const rParam = searchParams?.get("r") ?? "";

    const [reportNumber, setReportNumber] = useState("");

    // If URL already has ?r=..., hide this component
    if (rParam) return null;

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!reportNumber) return;

        // client-side navigate to include the query param.
        // Uses Router push so app re-renders and ParamsVerifyReport will show.
        router.push(`/?r=${encodeURIComponent(reportNumber)}`);
    }

    return (
        <div className={`${styles.pageBackground} `}>
            <div
                className="container bg-[#f9fafb] md:pt-12 px-[16px] sm:px-0"
            >
                <div
                    className="mt-12 mb-4 flex mx-auto items-center"
                    style={{ maxWidth: "500px" }}
                >
                    <img
                        src="/logo-gold.svg"
                        alt="Logo"
                        className="pe-3"
                        style={{ height: "40px", verticalAlign: "text-bottom" }}
                        decoding="async"
                    />
                    <h1 className="text-[32px] md:text-[42px]">{t('verifyYourReport')}</h1>
                </div>

                <div className="bg-white mt-12 mx-auto py-2" style={{ maxWidth: "500px" }}>
                    <form className="w-full px-[20px]" onSubmit={handleSubmit}>
                        <h6 className="text-2xl">{t('reportNumber')}</h6>

                        {/* Use flex layout so input keeps stable width and button doesn't push layout */}
                        <div
                            className="form-group flex mb-2 p-2 text-left items-center"
                            style={{
                                maxWidth: "500px",
                                backgroundColor: "white",
                                marginLeft: "auto",
                                marginRight: "auto",
                            }}
                        >
                            <label className="sr-only">{t('reportNumber')}</label>
                            <input
                                name="r"
                                placeholder={t('enterReportNo')}
                                value={reportNumber}
                                onChange={(e) => setReportNumber(e.target.value)}
                                className={`${styles.input} flex-1`}
                                type="text"
                            />
                            <button
                                type="submit"
                                className={`bg-[#465b5d] text-[#fff] text-[16px] border border-[#344054] rounded-[2px] px-4 py-[4.8] hover:bg-[#fff] hover:text-[#475467] transition-colors duration-700 h-[36px] ml-[8px] mr-[8px] min-w-[80px]`}
                            >
                                {t('verify')}
                            </button>
                        </div>
                    </form>
                </div>

                <MemoQRPage />
            </div>
        </div>
    );
}
