"use client";

import React from "react";

import Navbar from "../../components/user/NavBar";
import FixedBottomIconBar from "../../components/user/FixedBottomIconBar";
import LanguageSwitcher from "../../components/user/LanguageSwitcher";
import ParamsVerifyReport from "../../components/user/ParamsVerifyReport";
import VerifyReport from "../../components/user/VerifyReport";
import AdditionalReports from "../../components/user/AdditionalReports";
import Footer from "../../components/user/Footer";

export default function VerifyYourReport() {
    return (
        <>
            <Navbar />
            {/* spacer to offset the fixed header */}
            <div className="h-[50px] md:h-[80px] lg:h-[130px] xl:h-[89px]" aria-hidden="true" />
            <FixedBottomIconBar />
            <LanguageSwitcher />
            <ParamsVerifyReport />
            <VerifyReport />
            <AdditionalReports />
            <Footer />
        </>
    );
}
