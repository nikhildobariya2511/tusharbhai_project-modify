// app/admin/layout.tsx
'use client';
import React from 'react';
import { usePathname } from 'next/navigation';
import AdminHeader from '../../components/admin/AdminHeader';

// export const metadata = {
//     title: 'Admin',
// };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const hideHeader = pathname?.startsWith('/admin/login');

    return (
        <div className="w-full min-h-screen">
            {!hideHeader && <AdminHeader />}
            <main className="container mx-auto px-4 py-8">
                {children}
            </main>
        </div>
    );
}
