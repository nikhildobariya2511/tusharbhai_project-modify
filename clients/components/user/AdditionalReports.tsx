'use client'
import { useTranslations } from "next-intl";
import Image from "next/image";
import React from "react";

const defaultLogo =
    "/img/report/logo-bg.webp";


// const limitationsText = `This report provides an opinion by IGI, and neither IGI’s original client nor any purchaser of the article shall rely on this report as a guarantee, appraisal, or warranty. Opinions provided by third-party laboratories may vary depending on when, how and by whom the article was examined. Technologies employed in treatments, processing and synthesis are continuously evolving, and hence it may not always be possible to determine the origin of the article using the then-latest available techniques. Neither IGI nor any of its employees shall, at any time, be liable for any difference of opinion or discrepancy which may result from the application of other assessment and/or identification methods, tools or techniques. IGI has provided this report for a small fee compared to the actual and potential value of the subject article and has no financial interest in the sale/purchase of the item described in this report. Important notice: This report is subject to IGI’s Terms and Conditions, which can be found at www.igi.org/reports/terms-and-conditions. The limitations included in our Terms & Conditions apply to every person reading or receiving this report.`;

export default function AdditionalReports() {
    const t = useTranslations("AdditionalReports");

    const defaultItems = [
        {
            href: "https://www.igi.org/consumer-education/your-diamonds-creation/",
            src: "/img/report/report1.jpg",
            alt: "IGI report 1",
        },
        {
            href: "https://www.igi.org/reports/hearts-arrows-report/",
            src: "/img/report/report2.jpg",
            alt: "IGI report 2",
        },
        {
            href: "https://www.igi.org/consumer-education/learn-with-videos/",
            src: "/img/report/report3.jpg",
            alt: "IGI report 3",
        },
        {
            href: "https://www.igi.org/consumer-education/the-4cs/",
            src: "/img/report/report4.jpg",
            alt: "IGI report 4",
        },
    ];

    const list = defaultItems;
    // const linkTarget = true ? "_blank" : "_self";
    // const rel = true ? "noopener noreferrer" : undefined;

    return (
        <section className="flex justify-center">
            <div className="container">
                <div className="flex flex-wrap mx-2 py-12">
                    {list.map((it, index) => (
                        <div
                            key={it.href + index}
                            className={`w-full sm:w-1/2 lg:w-1/4 mb-4 lg:mb-0 px-2 relative min-h-[110px]`}
                        >
                            <a
                                href={it.href}
                                aria-label={it.alt ?? t("reportLinkAria")}
                                className="relative  h-full flex items-center justify-center transition-all duration-300 ease-in-out no-underline"
                                {...(true
                                    ? { target: "_blank", rel: "noopener noreferrer" }
                                    : {})}
                            >
                                <Image
                                    src={it.src}
                                    fill
                                    alt={it.alt ?? t("reportImageAlt")}
                                    className="absolute inset-0 w-full h-full min-h-[110px] object-cover object-center z-0 rounded-[4px] transition-all duration-300 ease-in-out
                                     opacity-100 hover:opacity-80
                                    "
                                    loading="lazy"
                                />
                            </a>
                        </div>
                    ))}
                    {/* </div> */}
                </div>
                <div className={`w-full`}>
                    <section className="flex flex-col items-center py-8 px-4 md:px-8">
                        <Image
                            src={defaultLogo}
                            alt={t("reportLogoAlt")}
                            width={166}
                            height={100}
                        />
                        <div className="text-gray-800">
                            <h5 className="text-lg font-medium mb-3">{t("importantLimitations")}</h5>
                            <p className="text-sm leading-6 mb-4 whitespace-pre-line">{t("limitationsText")}</p>
                        </div>
                    </section>


                    <section className="py-12 px-4 md:px-8">
                        <div className="">
                            <a
                                href={`https://www.igi.org/API-IGI/report-diagnosis.php?r=`}
                                className="no-underline transition-all duration-300 ease-in-out text-[#8e7965] hover:text-[#000]"
                                rel="noreferrer"
                            >
                                {t("verifyReportData")}
                            </a>
                        </div>
                    </section>
                </div>
            </div>
        </section>
    );
}
