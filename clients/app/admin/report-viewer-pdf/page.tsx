import React, { Suspense } from 'react'
import Client from './client'

export default function Page() {
    return (
        <Suspense fallback={<div>Loading report UI…</div>}>
            <Client />
        </Suspense>
    );
}