'use client';
import React from 'react';
import Html5QrcodeScannerNext from './Html5QrcodeScannerNext';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

export default function QRPage() {
    const t = useTranslations("QRPage");
    const router = useRouter();

    // function handleResult(text: string) {
    //     console.log("scanned:", text);
    //     if (!text) return;
    //     // client-side navigate to URL with the scanned report
    //     router.push(`/Verify-Your-Report/?r=${encodeURIComponent(text)}`);
    // }

    function handleResult(text: string) {
    console.log("scanned:", text);
    if (!text) return;

    // Extract the value after r=
    const match = text.match(/[?&]r=([^&]+)/);
    const extracted = match ? match[1] : text; // fallback if not a URL

    router.push(`/?r=${encodeURIComponent(extracted)}`);
}

    function handleError(err: any) {
        console.warn("scan error", err);
    }


    return (
        <div className="mx-auto bg-white py-2 my-12 max-w-[500px]">
            <div className="w-full px-[20px]">
                <h6 className="text-2xl ">{t('scanQrCode')}</h6>
                <div
                    className="w-full bg-white relative p-0 border border-silver"
                >
                    <Html5QrcodeScannerNext onResult={handleResult} onError={handleError} fps={10} qrbox={250} />
                </div>
            </div>
        </div>
    );
}