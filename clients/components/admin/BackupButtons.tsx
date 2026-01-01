"use client";
import React, { useRef } from "react";
import { Button } from "../../components/ui/button";
import { Download, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useExportBackup, useImportBackup } from "../../hooks/useReports";

export default function BackupButtons() {
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const exportMutation = useExportBackup({
        onError: (err) => {
            if ((err as any)?.message) toast.error(String((err as any).message));
            else toast.error("Failed to export backup");
        },
        onSuccess: () => {
            // Noop; saving is handled below after mutateAsync resolves
        },
    });

    const importMutation = useImportBackup({
        onError: (err) => {
            if ((err as any)?.message) toast.error(String((err as any).message));
            else toast.error("Failed to import backup");
        },
        onSuccess: () => {
            toast.success("Backup imported successfully");
        },
    });

    const handleExport = async () => {
        try {
            const res = await exportMutation.mutateAsync();
            if (!res?.blob) {
                toast.error("No file returned from server");
                return;
            }

            const blob = res.blob;
            const filename =
                res.filename ??
                `backup-${new Date()
                    .toISOString()
                    .slice(0, 19)
                    .replace(/[:T]/g, "-")}.zip`;

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            toast.success("Backup download started");
        } catch (err) {
            console.error(err);
            // mutateAsync already triggers onError; fallback
            toast.error("Failed to download backup");
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFilePicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        const file = files[0];
        if (!file.name.toLowerCase().endsWith(".zip")) {
            toast.error("Please select a .zip file");
            return;
        }
        try {
            await importMutation.mutateAsync(file);
        } catch (err) {
            console.error(err);
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    return (
        <div className="flex items-center gap-3">
            <input
                ref={fileInputRef}
                type="file"
                accept=".zip,application/zip"
                onChange={handleFilePicked}
                className="hidden"
            />

            <Button
                variant="ghost"
                onClick={handleImportClick}
                disabled={importMutation.isPending}
                title="Import backup"
            >
                {importMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Upload className="mr-2 h-4 w-4" />
                )}
                {importMutation.isPending ? "Importing…" : "Import"}
            </Button>

            <Button
                variant="secondary"
                onClick={handleExport}
                disabled={exportMutation.isPending}
                title="Export backup"
            >
                {exportMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Download className="mr-2 h-4 w-4" />
                )}
                {exportMutation.isPending ? "Exporting…" : "Export"}
            </Button>
        </div>
    );
}
