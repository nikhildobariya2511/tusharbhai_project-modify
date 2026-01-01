// app/admin/login/layout.tsx
import React from 'react';

export const metadata = {
    title: 'Admin — Login',
};

export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
    // simple, focused layout for login pages (no AdminHeader)
    return (
        <div className="flex min-h-screen w-full items-center justify-center">
            <div className="w-full">
                {children}
            </div>
        </div>
    );
}
