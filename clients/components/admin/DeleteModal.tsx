import React, { useState } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { useDeleteReport } from "../../hooks/useReports";
import { toast } from "sonner";
import { Button } from "../ui/button";

interface ReportDeleteProps {
    report_no: string;
    onDeleted?: () => void;
    buttonClassName?: string;
    dialogTitle?: string;
    dialogDescription?: string;
}

export default function DeleteModal({
    report_no,
    onDeleted,
    dialogTitle = "Delete report?",
    dialogDescription = "This will permanently delete the report. This action cannot be undone.",
}: ReportDeleteProps) {
    const [open, setOpen] = useState(false);
    const deleteMutation = useDeleteReport();

    const isDeleting = deleteMutation.isPending;

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        // don't allow closing while deleting
        if (!isDeleting) setOpen(false);
    };

    const handleConfirm = async () => {
        try {
            await deleteMutation.mutateAsync({ reportNumber: report_no });
            setOpen(false);
            onDeleted?.();
            toast.success("Report deleted successfully.");
        } catch (err: any) {
            console.error("Delete failed:", err);
            alert(err?.message ?? "Failed to delete report");
        }
    };

    return (
        <>
            <Button
                type="button"
                onClick={handleOpen}
                className="transition-smooth hover:scale-[1.02]"
                variant={"destructive"}
            >
                Delete
            </Button>

            <AlertDialog
                open={open}
                // Prevent closing from overlay while deleting; otherwise allow toggling
                onOpenChange={(val) => {
                    if (!isDeleting) {
                        setOpen(val);
                    }
                }}
            >
                <AlertDialogContent aria-busy={isDeleting}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{dialogTitle}</AlertDialogTitle>
                        <AlertDialogDescription>{dialogDescription}</AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>

                        <AlertDialogAction
                            onClick={handleConfirm}
                            disabled={isDeleting}
                            className="transition-smooth hover:scale-[1.02]"
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
