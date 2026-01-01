"use client";

import React, { useCallback, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "../../components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../components/ui/select";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { useUploadXlsx } from "../../hooks/useReports";
import { DEFAULT_COMMENT, DEFAULT_COPY, DEFAULT_DIAMOND } from "../../lib/env";
import { toast } from "sonner";
import JewelryReportAutoDownload from "../excelToReport/JewelryReportGrid/JewelryReportAutoDownload";
import { createPortal } from "react-dom";

/**
 * Local copy of the Report type (replace with your shared type import if available)
 */
type Report = {
    report_no: string;
    description: string;
    shape_and_cut: string;
    tot_est_weight: string;
    color: string;
    clarity: string;
    style_number: string;
    image_filename: string;
    comment: string | null;
    company_logo: string | null;
    created_at: string;
    isecopy: boolean;
    notice_image?: boolean;
    igi_logo?: boolean; // <-- added here

};

type Props = {
    visible: boolean;
    children?: React.ReactNode;
    onClose?: () => void;
};
export function ModalOverlay({ visible, children }: Props) {
    if (!visible) return null;

    // ensure document exists (this file is client-only)
    const el = document.body;
    return createPortal(
        <div
            aria-live="polite"
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            role="dialog"
            aria-modal="true"
        >
            <div
                aria-hidden="true"
                className="absolute inset-0 bg-black/45 backdrop-blur-sm"
                style={{ WebkitBackdropFilter: "blur(6px)", backdropFilter: "blur(6px)" }}
            />

            <div className="relative z-10 bg-white rounded-lg p-6 shadow-lg flex flex-col items-center gap-4 w-80">
                {children}
            </div>
        </div>,
        el
    );
}
const XLDiamondSubmissionForm: React.FC = () => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const logoInputRef = useRef<HTMLInputElement | null>(null);

    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null); // xlsx
    const [companyLogo, setCompanyLogo] = useState<File | null>(null); // optional logo
    const [diamondType, setDiamondType] = useState<string>(DEFAULT_DIAMOND);
    const [copyType, setCopyType] = useState<string>(DEFAULT_COPY);
    const [comment, setComment] = useState<string>(DEFAULT_COMMENT);
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const [noticeImage, setNoticeImage] = useState<boolean>(false);
    const [igiLogo, setIgiLogo] = useState<boolean>(false);

    // state to hold array to pass to auto-download component
    const [autoDownloadData, setAutoDownloadData] = useState<Report[] | null>(null);

    // auto-download status for showing overlay loader
    const [autoDownloadStatus, setAutoDownloadStatus] = useState<
        "idle" | "generating" | "zipping" | "downloading" | "done" | "error"
    >("idle");
    const [autoDownloadProgress, setAutoDownloadProgress] = useState<number>(0);
    const [autoDownloadError, setAutoDownloadError] = useState<string | null>(null);

    const { mutate, isPending: isLoading } = useUploadXlsx();

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) setSelectedFile(files[0]);
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            setSelectedFile(files[0]);
            e.currentTarget.value = "";
        }
    };

    const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            setCompanyLogo(files[0]);
            e.currentTarget.value = "";
        }
    };

    const handleSubmit = async () => {
        if (!selectedFile) {
            alert("Please select a file first.");
            return;
        }

        const opts: {
            onUploadProgress?: any;
            companyLogo?: File | null;
            diamondType?: string | null;
            isecopy?: boolean | null;
            comment?: string | null;
            notice_image?: boolean;
            igi_logo?: boolean;
        } = {};

        opts.onUploadProgress = (progressEvent: any) => {
            try {
                let percent = 0;
                if (progressEvent && typeof progressEvent === "object") {
                    if (typeof progressEvent === "number") {
                        percent = Math.round(progressEvent);
                    } else if (
                        "loaded" in progressEvent &&
                        "total" in progressEvent &&
                        progressEvent.total
                    ) {
                        percent = Math.round((progressEvent.loaded / progressEvent.total) * 100);
                    } else if ("progress" in progressEvent) {
                        percent = Math.round(progressEvent.progress);
                    }
                }
                setUploadProgress(Math.min(Math.max(percent, 0), 100));
            } catch {
                setUploadProgress(null);
            }
        };

        if (companyLogo) opts.companyLogo = companyLogo;
        if (diamondType !== DEFAULT_DIAMOND) opts.diamondType = diamondType;
        if (copyType !== DEFAULT_COPY) opts.isecopy = true;
        if (comment !== DEFAULT_COMMENT) opts.comment = comment;
        if (noticeImage !== false) opts.notice_image = noticeImage; // or always set: opts.notice_image = noticeImage;
        if (igiLogo !== false) opts.igi_logo = igiLogo;
        
        const payload: any = {
            file: selectedFile,
            onUploadProgress: opts.onUploadProgress,
            companyLogo: opts.companyLogo,
            diamondType: opts.diamondType,
            isecopy: opts.isecopy,
            comment: opts.comment,
            ...(typeof opts.notice_image !== "undefined" ? { notice_image: opts.notice_image } : {}),
            ...(typeof opts.igi_logo !== "undefined" ? { igi_logo: igiLogo } : {}),
        };

        mutate(payload as any, {
            onSuccess: (data) => {
                // show success toast
                toast.success(data.msg ?? "Upload successful");

                // reset UI inputs immediately (optional)
                setSelectedFile(null);
                setCompanyLogo(null);
                setDiamondType(DEFAULT_DIAMOND);
                setCopyType(DEFAULT_COPY);
                setComment(DEFAULT_COMMENT);
                setUploadProgress(null);
                setIgiLogo(false);
                setNoticeImage(false);
                if (inputRef.current) inputRef.current.value = "";
                if (logoInputRef.current) logoInputRef.current.value = "";

                // pass uploaded array to the auto-download component (same screen)
                if (data?.uploaded && data.uploaded.length > 0) {
                    setAutoDownloadData(data.uploaded);
                    // reset any previous state
                    setAutoDownloadStatus("generating");
                    setAutoDownloadProgress(0);
                    setAutoDownloadError(null);
                } else {
                    // nothing to auto-download
                    setAutoDownloadData(null);
                }
                alert(data?.msg);
            },
            onError: (err: any) => {
                console.error(err);
                alert(err?.message || "Upload failed");
                setUploadProgress(null);
            },
        });
    };

    // callback passed down to child to receive status/progress updates
    const handleAutoStatusChange = (status: string, progress?: number, error?: string | null) => {
        // Map to our union
        if (status.startsWith("generating")) {
            setAutoDownloadStatus("generating");
        } else if (status === "zipping") {
            setAutoDownloadStatus("zipping");
        } else if (status === "downloading") {
            setAutoDownloadStatus("downloading");
        } else if (status === "done") {
            setAutoDownloadStatus("done");
        } else if (status === "error") {
            setAutoDownloadStatus("error");
        } else if (status === "idle") {
            setAutoDownloadStatus("idle");
        }

        if (typeof progress === "number") setAutoDownloadProgress(progress);
        if (error) setAutoDownloadError(error);

        // when finished (done or error) unmount the auto-download UI after a short delay
        if (status === "done" || status === "error") {
            // keep a brief moment so user sees "Done" or "Error" if needed, then clear data
            setTimeout(() => {
                setAutoDownloadData(null);
            }, 700);
        }
    };

    const overlayVisible =
        autoDownloadData !== null &&
        (autoDownloadStatus === "generating" ||
            autoDownloadStatus === "zipping" ||
            autoDownloadStatus === "downloading");

    return (
        <div className="max-w-2xl mx-auto relative">

            {/* Render JewelryReportAutoDownload on the same screen when we have uploaded data */}
            {autoDownloadData && (
                <div className="mt-4">
                    <JewelryReportAutoDownload
                        data={autoDownloadData as any}
                        cols={3}
                        rows={3}
                        onStatusChange={(status, progress, error) => handleAutoStatusChange(status, progress, error)}
                    />
                </div>
            )}
            {/* loader overlay shown while auto-download runs */}
            {overlayVisible && (
                <ModalOverlay visible={overlayVisible}>
                    <div
                        className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-black animate-spin"
                        role="status"
                        aria-hidden="true"
                    />
                    <div className="text-center">
                        <div className="font-medium">
                            {autoDownloadStatus.startsWith("generating") && `Generating PDFs — ${autoDownloadProgress}%`}
                            {autoDownloadStatus === "zipping" && `Zipping — ${autoDownloadProgress}%`}
                            {autoDownloadStatus === "downloading" && `Starting download...`}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                            Please wait until the browser prompts you to save the file.
                        </div>
                    </div>
                </ModalOverlay>
            )}

            <div className="bg-card border border-border rounded-lg p-6 shadow-card">
                <h2 className="text-2xl font-semibold mb-4">Upload File</h2>

                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                        if (e.target === e.currentTarget) inputRef.current?.click();
                    }}
                    role="button"
                    tabIndex={0}
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-smooth cursor-pointer
             ${isDragging ? "border-primary bg-accent" : "border-border hover:border-primary hover:bg-accent/50"}`}
                >
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-lg font-medium mb-1">
                        {selectedFile ? selectedFile.name : "Drag & drop your file here"}
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">or click to browse (.xlsx / .xls)</p>

                    <input
                        ref={inputRef}
                        id="file-upload"
                        type="file"
                        accept=".xlsx,.xls"
                        className="hidden"
                        onChange={handleFileSelect}
                    />

                    <label htmlFor="file-upload" className="inline-block">
                        <Button variant="outline" className="cursor-pointer" asChild>
                            <span>{selectedFile ? "Change file" : "Select file"}</span>
                        </Button>
                    </label>

                    {/* progress bar */}
                    {uploadProgress !== null && (
                        <div className="mt-4">
                            <div className="w-full h-2 bg-muted rounded overflow-hidden">
                                <div style={{ width: `${uploadProgress}%` }} className="h-full bg-primary transition-all" />
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{uploadProgress}%</p>
                        </div>
                    )}
                </div>

                {/* Logo upload (optional) */}
                <div className="mt-4">
                    <Label htmlFor="logo-upload" className="mb-1">
                        Company logo (optional)
                    </Label>
                    <div className="flex items-center gap-2">
                        <input
                            ref={logoInputRef}
                            id="logo-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleLogoSelect}
                        />
                        <label htmlFor="logo-upload">
                            <Button variant="outline" asChild>
                                <span>{companyLogo ? "Change logo" : "Upload logo"}</span>
                            </Button>
                        </label>
                        {companyLogo && <span className="text-sm text-muted-foreground">{companyLogo.name}</span>}
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <Label htmlFor="diamond-type" className="mb-1">
                            Diamond type
                        </Label>
                        <Select value={diamondType} onValueChange={(v) => setDiamondType(v)}>
                            <SelectTrigger id="diamond-type" className="w-full">
                                <SelectValue placeholder="Select diamond type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="natural">Natural diamond</SelectItem>
                                <SelectItem value="Labgrown diamond">Labgrown diamond</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="img-size" className="mb-1">
                            Copy
                        </Label>
                        <Select value={copyType} onValueChange={(v) => setCopyType(v)}>
                            <SelectTrigger id="img-size" className="w-full">
                                <SelectValue placeholder="Select E-copy Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="e-copy">E-copy</SelectItem>
                                <SelectItem value="electronic-copy">ELECTRONIC COPY</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            id="notice-image"
                            type="checkbox"
                            className="rounded"
                            checked={noticeImage}
                            onChange={(e) => setNoticeImage(e.target.checked)}
                        />
                        <label htmlFor="notice-image" className="text-sm">
                            Include notice image
                        </label>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            id="igi-logo"
                            type="checkbox"
                            className="rounded"
                            checked={igiLogo}
                            onChange={(e) => setIgiLogo(e.target.checked)}
                        />
                        <label htmlFor="igi-logo" className="text-sm">
                            Include IGI logo
                        </label>
                    </div>

                    <div className="md:col-span-2">
                        <Label htmlFor="comment" className="mb-1">
                            Comment
                        </Label>
                        <Textarea id="comment" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add an optional note..." />
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                    <Button onClick={handleSubmit} disabled={!selectedFile || isLoading}>
                        {isLoading ? "Uploading..." : "Submit"}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default XLDiamondSubmissionForm;
