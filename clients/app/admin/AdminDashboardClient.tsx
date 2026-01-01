// app/admin/AdminDashboardClient.tsx
'use client'
import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import XLDiamondSubmissionForm from '../../components/admin/XLDiamondSubmissionForm';
import ProductTable from '../../components/admin/ProductTable';
import { useRouter, useSearchParams } from 'next/navigation';

const AdminDashboardClient: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'upload' | 'data'>('upload');
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const tab = (searchParams?.get('tab') as 'upload' | 'data' | null) ?? 'upload';
        setActiveTab(tab);
    }, [searchParams]);

    const handleTabChange = (value: string) => {
        setActiveTab(value as 'upload' | 'data');
        router.replace(`/admin?tab=${value}`);
    };

    return (
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-8">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
                <TabsTrigger value="upload">Upload File</TabsTrigger>
                <TabsTrigger value="data">Data Table</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-4">
                <XLDiamondSubmissionForm />
            </TabsContent>

            <TabsContent value="data" className="space-y-4">
                <ProductTable />
            </TabsContent>
        </Tabs>
    );
};

export default AdminDashboardClient;
