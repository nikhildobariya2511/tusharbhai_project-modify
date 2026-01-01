'use client';

import React, { useEffect, useRef } from 'react';

export type ScannerProps = {
    /** called with decoded text */
    onResult?: (decodedText: string) => void;
    /** called on scan error (optional) */
    onError?: (err: any) => void;
    fps?: number;
    qrbox?: any
    verbose?: boolean;
    elementId?: string; // defaults to 'html5qr-reader'
};

export default function Html5QrcodeScannerNext({
    onResult,
    onError,
    fps = 10,
    qrbox = 250,
    verbose = false,
    elementId = 'html5qr-reader',
}: ScannerProps) {
    const scannerRef = useRef<any>(null);
    const mountedRef = useRef(false);

    useEffect(() => {
        let active = true;

        async function setup() {
            if (!active) return;
            if (typeof window === 'undefined') return;

            try {
                // dynamically import to avoid SSR import errors
                // eslint-disable-next-line @next/next/no-assign-module-variable
                const module = await import('html5-qrcode');
                const Html5QrcodeScanner = module.Html5QrcodeScanner;

                // keep reference so we can clear it on unmount
                scannerRef.current = new Html5QrcodeScanner(
                    elementId,
                    { fps, qrbox },
                    verbose
                );

                scannerRef.current.render(
                    (decodedText: string) => {
                        onResult?.(decodedText);
                    },
                    (errorMessage: any) => {
                        onError?.(errorMessage);
                    }
                );

                mountedRef.current = true;
            } catch (e) {
                console.error('Failed to load html5-qrcode', e);
                onError?.(e);
            }
        }

        setup();

        return () => {
            active = false;
            // cleanup
            if (scannerRef.current && mountedRef.current) {
                try {
                    scannerRef.current.clear(); // stops camera, removes UI
                } catch (e) {
                    // ignoring cleanup errors
                }
            }
        };
    }, [elementId, fps, qrbox, verbose, onResult, onError]);

    return (
        <div className="w-full h-full">
            <div id={elementId} />
        </div>
    );
}