"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "../../components/ui/button";
import { LogOut } from "lucide-react";
import BackupButtons from "./BackupButtons";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "../../components/ui/dialog";

const AdminHeader: React.FC = () => {
    const pathname = usePathname() || "";
    const router = useRouter();
    const isPdfReport = pathname.startsWith("/admin/pdf-report");

    const handleLogout = () => {
        try {
            document.cookie =
                "token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
            document.cookie =
                "refreshToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
        } catch (e) {
            console.warn("Failed to remove cookie", e);
        }
        router.push("/admin/login");
    };

    return (
        <header className="border-b border-border bg-card">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>

                <div className="flex items-center gap-4">
                    {isPdfReport ? (
                        <Button
                            variant="outline"
                            onClick={() => router.push("/admin?tab=upload")}
                        >
                            Open XL Upload
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            onClick={() => router.push("/admin/pdf-report")}
                        >
                            Open PDF Upload
                        </Button>
                    )}

                    {/* Use shadcn Dialog for modal backup UI */}
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline">Backup</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-xl">
                            <DialogHeader>
                                <DialogTitle>Backup</DialogTitle>
                            </DialogHeader>

                            {/* BackupButtons will handle import/export actions. Pass a ref-like handler if you want dialog closed after success. */}
                            <div className="mt-4">
                                <BackupButtons />
                            </div>

                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="ghost">Close</Button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Button variant="destructive" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </Button>
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;
