import { useEffect, useRef, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { useReport, useUpdateReport } from "../../hooks/useReports";
import { DEFAULT_COMMENT } from "../../lib/env";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";

interface JewelryReport {
    report_no: string;
    description: string;
    shape_and_cut: string;
    tot_est_weight: string;
    color: string;
    clarity: string;
    style_number: string;
    company_logo?: string;
    isecopy?: boolean;
    notice_image?: boolean;
    igi_logo?: boolean;
}

interface EditModalProps {
    reportNumber: string; // id used for useReport + update
    onClose: () => void;
    onSave?: (updated: JewelryReport & { comment?: string | null }) => void;
}

type EditableReport = JewelryReport & { comment?: string | null };

const EditModal = ({ reportNumber, onClose, onSave }: EditModalProps) => {
    // fetch the report data (this now supplies the "product" fields)
    const { data: reportData, isLoading: reportLoading, isError: reportError } = useReport(reportNumber);
    const updateMutation = useUpdateReport();

    const [formData, setFormData] = useState<EditableReport | null>(null);
    const [localError, setLocalError] = useState<string | null>(null);

    // New states for copy type + logo upload
    const [copyType, setCopyType] = useState<string>("");
    const [productLogoFile, setProductLogoFile] = useState<File | null>(null);
    const productFileInputRef = useRef<HTMLInputElement | null>(null);
    const [companyLogoPreview, setCompanyLogoPreview] = useState<string | null>(null);
    const [productLogoPreview, setProductLogoPreview] = useState<string | null>(null);
    const [companyLogoFile, setCompanyLogoFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const originalServerCommentRef = useRef<string | null>(null);
    const [noticeImage, setNoticeImage] = useState<boolean>(false);

    // initialize formData when reportData (fetched) or its comment changes
    useEffect(() => {
        if (!reportData) {
            setFormData(null);
            originalServerCommentRef.current = null;
            setCopyType("");
            setCompanyLogoPreview(null);
            setProductLogoPreview(null);
            setCompanyLogoFile(null);
            return;
        }

        // keep original server comment for comparison
        originalServerCommentRef.current = reportData?.comment ?? null;
        setNoticeImage(reportData.notice_image ?? false);
        // initialize copyType & company logo preview from reportData if present
        setCopyType(reportData.isecopy ? "electronic-copy" : "e-copy");
        setCompanyLogoPreview(reportData.company_logo);
        setProductLogoPreview(reportData.image_filename);
        setCompanyLogoFile(null);

        // create formData from reportData (preserve existing in-progress edits if same report_no)
        setFormData((prev) => {
            if (!prev || prev.report_no !== reportData.report_no) {
                return {
                    report_no: reportData.report_no,
                    description: reportData.description,
                    shape_and_cut: reportData.shape_and_cut,
                    tot_est_weight: reportData.tot_est_weight,
                    color: reportData.color,
                    clarity: reportData.clarity,
                    style_number: reportData.style_number,
                    company_logo: reportData.company_logo,
                    isecopy: reportData.isecopy,
                    igi_logo: reportData.igi_logo ?? false,
                    notice_image: reportData.notice_image ?? false,
                    comment: reportData.comment ?? DEFAULT_COMMENT,
                } as EditableReport;
            }
            // same report_no: merge updated comment and keep any in-progress fields
            return {
                ...prev,
                comment: reportData.comment ?? prev.comment ?? null,
                company_logo: prev.company_logo ?? reportData.company_logo,
                isecopy: prev.isecopy ?? reportData.isecopy,
                igi_logo: prev.igi_logo ?? reportData.igi_logo ?? false,
                notice_image: prev.notice_image ?? reportData.notice_image ?? false,
            } as EditableReport;
        });
    }, [reportData, reportData?.comment, reportNumber]);

    const handleChange = (field: keyof EditableReport, value: any) => {
        if (!formData) return;
        setFormData({ ...formData, [field]: value });
    };

    const prepareFormData = (data: EditableReport) => {
        const { report_no, ...rest } = data;
        const fd = new FormData();
        Object.entries(rest).forEach(([k, v]) => {
            if (v === undefined) return;
            // If value is a plain object, stringify it (keep primitives as-is)
            if (v !== null && typeof v === "object" && !(v as any)) {
                try {
                    fd.append(k, JSON.stringify(v));
                } catch {
                    fd.append(k, String(v));
                }
            } else {
                fd.append(k, String(v ?? ""));
            }
        });
        return fd;
    };


    const fileToDataUrl = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                if (typeof reader.result === "string") resolve(reader.result);
                else reject(new Error("Failed to convert file to data URL"));
            };
            reader.onerror = () => reject(new Error("File read error"));
            reader.readAsDataURL(file);
        });
    };

    const onSelectCompanyLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0] ?? null;
        if (!f) return;
        setCompanyLogoFile(f);
        const url = URL.createObjectURL(f);
        setCompanyLogoPreview(url);
        setFormData((prev) => (prev ? { ...prev, company_logo: url } : prev));
    };

    const onSelectProductLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0] ?? null;
        if (!f) return;
        setProductLogoFile(f);
        const url = URL.createObjectURL(f);
        setProductLogoPreview(url);
        setFormData((prev) => (prev ? { ...prev, image_filename: url } : prev)); // image_filename added to formData
    };


    const onSelectLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0] ?? null;
        if (!f) return;
        setCompanyLogoFile(f);
        const url = URL.createObjectURL(f);
        setCompanyLogoPreview(url);
        setFormData((prev) => (prev ? { ...prev, company_logo: url } : prev));
    };
    useEffect(() => {
        return () => {
            if (companyLogoPreview && companyLogoFile) {
                try {
                    URL.revokeObjectURL(companyLogoPreview);
                } catch { }
            }
            if (productLogoPreview && productLogoFile) {
                try {
                    URL.revokeObjectURL(productLogoPreview);
                } catch { }
            }
        };
    }, [companyLogoFile, companyLogoPreview, productLogoFile, productLogoPreview]);
    // helper: build FormData from only changed fields (compared to reportData)
    // includes company_logo file only when user uploaded a new file (companyLogoFile)
    const createFormDataFromChanges = (current: EditableReport, original?: JewelryReport | null) => {
        const fd = new FormData();

        if (!original) {
            // fallback: send all current fields except report_no and file placeholders
            Object.entries(current).forEach(([k, v]) => {
                if (k === "report_no") return;
                if (v === undefined) return;
                // skip company/product file fields here; handled below
                if (k === "company_logo" || k === "image_filename") return;
                fd.append(k, String(v ?? ""));
            });

            // include uploaded files if present
            if (companyLogoFile) {
                fd.append("company_logo", companyLogoFile, companyLogoFile.name);
            }
            if (productLogoFile) {
                // append product image under key "image" (adjust key to your backend if required)
                fd.append("image", productLogoFile, productLogoFile.name);
            }
            return fd;
        }

        // list of textual fields to compare
        const fieldsToCheck: (keyof EditableReport)[] = [
            "description",
            "shape_and_cut",
            "tot_est_weight",
            "color",
            "clarity",
            "style_number",
        ];

        fieldsToCheck.forEach((f) => {
            const cur = (current as any)[f];
            const orig = (original as any)[f];
            // treat null/undefined and "" consistently
            const curStr = cur ?? "";
            const origStr = orig ?? "";
            if (String(curStr) !== String(origStr)) {
                fd.append(String(f), String(curStr));
            }
        });

        // isecopy based on copyType (we derive it outside too). Compare with original.
        const isecopyComputed = copyType === "electronic-copy";
        if (Boolean(original.isecopy) !== Boolean(isecopyComputed)) {
            fd.append("isecopy", String(isecopyComputed));
        }

        const currentNotice = Boolean((current as any).notice_image);
        const originalNotice = Boolean(original.notice_image);
        if (currentNotice !== originalNotice) {
            fd.append("notice_image", String(currentNotice));
        }

        const currentIgi = Boolean((current as any).igi_logo);
        const originalIgi = Boolean(original.igi_logo);
        if (currentIgi !== originalIgi) {
            fd.append("igi_logo", String(currentIgi));
        }

        // comment: use the same shouldSendComment logic you already had
        const originalComment = originalServerCommentRef.current;
        const currentComment = current.comment ?? null;
        const shouldSendComment = (() => {
            if (originalComment == null) {
                return currentComment !== null && currentComment !== DEFAULT_COMMENT;
            }
            return currentComment !== originalComment;
        })();
        if (shouldSendComment) {
            fd.append("comment", String(currentComment ?? ""));
        }

        // company_logo: only include if user uploaded a new file
        if (companyLogoFile) {
            fd.append("company_logo", companyLogoFile, companyLogoFile.name);
        }
        // NEW: include product file if uploaded
        if (productLogoFile) {
            // using key "image" for product image — change to your backend key if different
            fd.append("image", productLogoFile, productLogoFile.name);
        }
        return fd;
    };


    const handleSubmit = async () => {
        setLocalError(null);
        if (!formData) return;

        if (!formData.report_no || !formData.description) {
            setLocalError("Report number and description are required.");
            return;
        }

        try {
            // If we don't have the original report for comparison, use reportData fallback
            const original = reportData ?? null;

            // Build a FormData that contains ONLY the changed fields (and file if uploaded)
            const body: any = createFormDataFromChanges(formData, original);

            // If there are no fields to send, notify user (no-op)
            // Note: FormData.has/keys is not directly convenient; check by iterating:
            let hasAny = false;
            for (const _ of body.keys()) {
                hasAny = true;
                break;
            }

            if (!hasAny) {
                setLocalError("No changes to save.");
                return;
            }

            updateMutation.mutate(
                { reportNumber: reportNumber, body },
                {
                    onSuccess: (updated: any) => {
                        onSave?.(updated);
                        onClose();
                    },
                    onError: (err: Error) => {
                        setLocalError(err.message ?? "Failed to update report");
                    },
                }
            );
        } catch (err) {
            setLocalError("Failed to prepare form data. Please try again.");
            return;
        }
    };


    // Modal open when we have fetched reportData (or while loading)
    const isOpen = !!reportData || reportLoading;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-full max-w-3xl p-0">
                <div className="flex flex-col max-h-[100vh]">
                    <DialogHeader className="px-6 py-4">
                        <DialogTitle>Edit Jewelry Report</DialogTitle>
                        <DialogDescription>Update the report fields and comment below.</DialogDescription>
                    </DialogHeader>

                    <div className="overflow-auto px-6 py-4">
                        {reportLoading && <div className="px-0 py-2">Loading report comment...</div>}
                        {reportError && <div className="px-0 py-2 text-red-600">Failed to load comment.</div>}

                        {formData ? (
                            <div className="grid gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="report_no">Report Number</Label>
                                    <Input id="report_no" value={formData.report_no} disabled />
                                </div>

                                <div className="flex gap-2 ">
                                    {productLogoPreview && <div className="">
                                        <Label className="mb-1">Product Logo</Label>
                                        <div className="flex items-center gap-4">
                                            <div className="w-24 h-24 rounded overflow-hidden bg-zinc-100 flex items-center justify-center">
                                                {productLogoPreview ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    // <img src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/uploads/${productLogoPreview}`} alt="Product logo preview" className="object-contain w-full h-full" />
                                                    <img
                                                        src={
                                                            productLogoPreview?.startsWith("blob:")
                                                                ? productLogoPreview
                                                                : `${process.env.NEXT_PUBLIC_API_BASE_URL}/uploads/${productLogoPreview}`
                                                        }
                                                        alt="Product logo preview"
                                                        className="object-contain w-full h-full"
                                                    />


                                                ) : (
                                                    <div className="text-xs text-zinc-500 px-2 text-center">No logo</div>
                                                )}
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <input
                                                    ref={productFileInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={onSelectProductLogo}
                                                    className="hidden"
                                                    id="product-logo-input"
                                                />
                                                <div className="flex gap-2">
                                                    <label htmlFor="product-logo-input">
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => {
                                                                productFileInputRef.current?.click();
                                                            }}
                                                        >
                                                            Change / Upload
                                                        </Button>
                                                    </label>
                                                </div>
                                                <div className="text-xs text-zinc-500">Accepted: image files. New upload will replace existing logo on save.</div>
                                            </div>

                                        </div>
                                    </div>}
                                    {companyLogoPreview && <div className="">
                                        <Label className="mb-1">Company Logo</Label>
                                        <div className="flex items-center gap-4">
                                            <div className="w-24 h-24 rounded overflow-hidden bg-zinc-100 flex items-center justify-center">
                                                {companyLogoPreview ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={
                                                            companyLogoPreview?.startsWith("blob:")
                                                                ? companyLogoPreview
                                                                : `${process.env.NEXT_PUBLIC_API_BASE_URL}/uploads/logo/${companyLogoPreview}`
                                                        }
                                                        alt="Company logo preview"
                                                        className="object-contain w-full h-full"
                                                    />

                                                ) : (
                                                    <div className="text-xs text-zinc-500 px-2 text-center">No logo</div>
                                                )}
                                            </div>

                                            {/* <div className="flex flex-col gap-2">
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={onSelectCompanyLogo}
                                                    className="hidden"
                                                    id="company-logo-input"
                                                />
                                                <div className="flex gap-2">
                                                    <label htmlFor="company-logo-input">
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => {
                                                                fileInputRef.current?.click();
                                                            }}
                                                        >
                                                            Change / Upload
                                                        </Button>
                                                    </label>
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => {
                                                            setCompanyLogoFile(null);
                                                            setCompanyLogoPreview(null);
                                                            setFormData((prev) => (prev ? { ...prev, company_logo: undefined } : prev));
                                                            if (fileInputRef.current) fileInputRef.current.value = "";
                                                        }}
                                                    >
                                                        Remove
                                                    </Button>
                                                </div>
                                                <div className="text-xs text-zinc-500">Accepted: image files. New upload will replace existing logo on save.</div>
                                            </div> */}
                                        </div>
                                    </div>}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => handleChange("description", e.target.value)}
                                        rows={3}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="shape_and_cut">Shape & Cut</Label>
                                        <Input
                                            id="shape_and_cut"
                                            value={formData.shape_and_cut}
                                            onChange={(e) => handleChange("shape_and_cut", e.target.value)}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="style_number">Style Number</Label>
                                        <Input
                                            id="style_number"
                                            value={formData.style_number}
                                            onChange={(e) => handleChange("style_number", e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="tot_est_weight">Total Estimated Weight</Label>
                                        <Input
                                            id="tot_est_weight"
                                            value={formData.tot_est_weight}
                                            onChange={(e) => handleChange("tot_est_weight", e.target.value)}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="color">Color</Label>
                                        <Input id="color" value={formData.color} onChange={(e) => handleChange("color", e.target.value)} />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="clarity">Clarity</Label>
                                    <Input id="clarity" value={formData.clarity} onChange={(e) => handleChange("clarity", e.target.value)} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="copy-type" className="mb-1">Copy</Label>
                                    <Select value={copyType} onValueChange={(v) => setCopyType(v)}>
                                        <SelectTrigger id="copy-type" className="w-full">
                                            <SelectValue placeholder="Select E-copy Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="e-copy">E-copy</SelectItem>
                                            <SelectItem value="electronic-copy">Electronic Copy</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="notice-image" className="mb-1">Notice Image</Label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            id="notice-image"
                                            type="checkbox"
                                            checked={Boolean(formData?.notice_image)}
                                            onChange={(e) => handleChange("notice_image", e.target.checked)}
                                        />
                                        <label htmlFor="notice-image" className="text-sm">Include notice image</label>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="igi-logo" className="mb-1">IGI Logo</Label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            id="igi-logo"
                                            type="checkbox"
                                            checked={Boolean(formData?.igi_logo)}
                                            onChange={(e) => handleChange("igi_logo", e.target.checked)}
                                        />
                                        <label htmlFor="igi-logo" className="text-sm">Include IGI logo</label>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="comment">Comment</Label>
                                    <Textarea
                                        id="comment"
                                        value={formData.comment ?? ""}
                                        onChange={(e) => handleChange("comment", e.target.value)}
                                        rows={3}
                                    />
                                </div>

                                {localError && <div className="text-sm text-red-600">{localError}</div>}
                                {updateMutation.isError && (
                                    <div className="text-sm text-red-600">{(updateMutation.error as Error)?.message}</div>
                                )}
                            </div>
                        ) : (
                            <div className="px-0 py-8 text-center text-sm text-zinc-600">No product selected</div>
                        )}
                    </div>

                    <DialogFooter className="px-6 py-3 border-t flex-shrink-0">
                        <Button variant="outline" onClick={onClose} disabled={updateMutation.isPending}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            className="transition-smooth hover:scale-[1.02] ml-3"
                            disabled={!formData || updateMutation.isPending}
                        >
                            {updateMutation.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default EditModal;
