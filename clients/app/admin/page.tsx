// app/admin/page.tsx
import React, { Suspense } from 'react';
import AdminDashboardClient from './AdminDashboardClient';

export default function Page() {
    return (
        <div className="w-full">
            <Suspense fallback={<div>Loading admin dashboard…</div>}>
                <AdminDashboardClient />
            </Suspense>
        </div>
    );
}
