import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useSettings } from "@/hooks/useSettings";
import { useUpdateSettings } from "@/hooks/useUpdateSettings";
import { settingKeys } from "@/lib/query-keys";
import api from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import ReceiptPreview from "@/components/admin/settings/ReceiptPreview";
import ImageUpload from "@/components/admin/settings/ImageUpload";
import type { Settings } from "@/types/order";

const SettingsPage = () => {
    const { data: settings, isLoading } = useSettings();
    const updateMutation = useUpdateSettings();
    const queryClient = useQueryClient();

    const [form, setForm] = useState<Partial<Settings>>({});
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadingQr, setUploadingQr] = useState(false);

    useEffect(() => {
        if (settings) {
            setForm({
                storeName: settings.storeName,
                storeAddress: settings.storeAddress,
                currencySymbol: settings.currencySymbol,
                receiptHeader: settings.receiptHeader,
                receiptFooter: settings.receiptFooter,
                taxLabel: settings.taxLabel,
                khrRate: settings.khrRate,
            });
        }
    }, [settings]);

    const handleChange = (
        field: keyof Settings,
        value: string | number | null,
    ) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        updateMutation.mutate(form, {
            onSuccess: () => toast.success("Settings saved"),
            onError: () => toast.error("Failed to save settings"),
        });
    };

    const handleLogoUpload = async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        setUploadingLogo(true);
        try {
            await api.put(ENDPOINTS.SETTINGS.LOGO, formData, {
                headers: { "Content-Type": undefined },
            });
            await queryClient.invalidateQueries({
                queryKey: settingKeys.all,
            });
            toast.success("Logo uploaded");
        } finally {
            setUploadingLogo(false);
        }
    };

    const handleLogoRemove = async () => {
        setUploadingLogo(true);
        try {
            await api.delete(ENDPOINTS.SETTINGS.LOGO);
            await queryClient.invalidateQueries({
                queryKey: settingKeys.all,
            });
            toast.success("Logo removed");
        } finally {
            setUploadingLogo(false);
        }
    };

    const handleQrUpload = async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        setUploadingQr(true);
        try {
            await api.put(ENDPOINTS.SETTINGS.QR_CODE, formData, {
                headers: { "Content-Type": undefined },
            });
            await queryClient.invalidateQueries({
                queryKey: settingKeys.all,
            });
            toast.success("QR code uploaded");
        } finally {
            setUploadingQr(false);
        }
    };

    const handleQrRemove = async () => {
        setUploadingQr(true);
        try {
            await api.delete(ENDPOINTS.SETTINGS.QR_CODE);
            await queryClient.invalidateQueries({
                queryKey: settingKeys.all,
            });
            toast.success("QR code removed");
        } finally {
            setUploadingQr(false);
        }
    };

    const previewSettings: Settings = {
        id: 1,
        storeName: form.storeName ?? "",
        storeAddress: form.storeAddress ?? null,
        currencySymbol: form.currencySymbol ?? "$",
        receiptHeader: form.receiptHeader ?? null,
        receiptFooter: form.receiptFooter ?? null,
        taxLabel: form.taxLabel ?? "Tax",
        logoUrl: settings?.logoUrl ?? null,
        qrCodeUrl: settings?.qrCodeUrl ?? null,
        khrRate: form.khrRate ?? null,
        createdAt: settings?.createdAt ?? "",
        updatedAt: settings?.updatedAt ?? "",
    };

    if (isLoading) {
        return (
            <div className="flex flex-col gap-4 p-5">
                <Skeleton className="h-5 w-32 bg-(--admin-hover)" />
                <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
                    <Skeleton className="h-[500px] bg-(--admin-hover)" />
                    <Skeleton className="h-[500px] bg-(--admin-hover)" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 p-5">
            <h1 className="text-[13px] font-medium text-(--admin-primary)">
                Settings
            </h1>

            <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
                {/* Form */}
                <div className="admin-card p-5">
                    <h2 className="mb-4 text-[11px] font-medium uppercase tracking-wide text-(--admin-text-muted)">
                        Store Configuration
                    </h2>

                    <div className="space-y-4">
                        <div className="grid gap-1.5">
                            <Label className="text-[11px] text-(--admin-text-secondary)">
                                Store Name
                            </Label>
                            <Input
                                value={form.storeName ?? ""}
                                onChange={(e) =>
                                    handleChange("storeName", e.target.value)
                                }
                                className="h-8 border-(--admin-border) bg-(--admin-card) text-xs text-(--admin-text) focus-visible:ring-(--admin-accent)"
                            />
                        </div>

                        <div className="grid gap-1.5">
                            <Label className="text-[11px] text-(--admin-text-secondary)">
                                Store Address
                            </Label>
                            <Input
                                value={form.storeAddress ?? ""}
                                onChange={(e) =>
                                    handleChange(
                                        "storeAddress",
                                        e.target.value || null,
                                    )
                                }
                                className="h-8 border-(--admin-border) bg-(--admin-card) text-xs text-(--admin-text) focus-visible:ring-(--admin-accent)"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-1.5">
                                <Label className="text-[11px] text-(--admin-text-secondary)">
                                    Currency Symbol
                                </Label>
                                <Input
                                    value={form.currencySymbol ?? ""}
                                    onChange={(e) =>
                                        handleChange(
                                            "currencySymbol",
                                            e.target.value,
                                        )
                                    }
                                    className="h-8 border-(--admin-border) bg-(--admin-card) font-mono text-xs text-(--admin-text) focus-visible:ring-(--admin-accent)"
                                />
                            </div>
                            <div className="grid gap-1.5">
                                <Label className="text-[11px] text-(--admin-text-secondary)">
                                    Tax Label
                                </Label>
                                <Input
                                    value={form.taxLabel ?? ""}
                                    onChange={(e) =>
                                        handleChange("taxLabel", e.target.value)
                                    }
                                    className="h-8 border-(--admin-border) bg-(--admin-card) text-xs text-(--admin-text) focus-visible:ring-(--admin-accent)"
                                />
                            </div>
                        </div>

                        <div className="grid gap-1.5">
                            <Label className="text-[11px] text-(--admin-text-secondary)">
                                KHR Exchange Rate
                            </Label>
                            <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.khrRate ?? ""}
                                onChange={(e) =>
                                    handleChange(
                                        "khrRate",
                                        e.target.value
                                            ? parseFloat(e.target.value)
                                            : null,
                                    )
                                }
                                className="h-8 border-(--admin-border) bg-(--admin-card) font-mono text-xs text-(--admin-text) focus-visible:ring-(--admin-accent)"
                            />
                        </div>

                        <div className="grid gap-1.5">
                            <Label className="text-[11px] text-(--admin-text-secondary)">
                                Receipt Header
                            </Label>
                            <Textarea
                                value={form.receiptHeader ?? ""}
                                onChange={(e) =>
                                    handleChange(
                                        "receiptHeader",
                                        e.target.value || null,
                                    )
                                }
                                rows={2}
                                className="border-(--admin-border) bg-(--admin-card) text-xs text-(--admin-text) focus-visible:ring-(--admin-accent)"
                            />
                        </div>

                        <div className="grid gap-1.5">
                            <Label className="text-[11px] text-(--admin-text-secondary)">
                                Receipt Footer
                            </Label>
                            <Textarea
                                value={form.receiptFooter ?? ""}
                                onChange={(e) =>
                                    handleChange(
                                        "receiptFooter",
                                        e.target.value || null,
                                    )
                                }
                                rows={2}
                                className="border-(--admin-border) bg-(--admin-card) text-xs text-(--admin-text) focus-visible:ring-(--admin-accent)"
                            />
                        </div>

                        <div className="grid gap-1.5">
                            <Label className="text-[11px] text-(--admin-text-secondary)">
                                Logo
                            </Label>
                            <ImageUpload
                                imageUrl={settings?.logoUrl ?? null}
                                onUpload={handleLogoUpload}
                                onRemove={handleLogoRemove}
                                uploading={uploadingLogo}
                                label="Logo"
                            />
                        </div>

                        <div className="grid gap-1.5">
                            <Label className="text-[11px] text-(--admin-text-secondary)">
                                QR Code
                            </Label>
                            <ImageUpload
                                imageUrl={settings?.qrCodeUrl ?? null}
                                onUpload={handleQrUpload}
                                onRemove={handleQrRemove}
                                uploading={uploadingQr}
                                label="QR code"
                            />
                        </div>

                        <Button
                            onClick={handleSave}
                            disabled={updateMutation.isPending}
                            className="h-8 bg-(--admin-primary) text-xs font-medium text-white hover:bg-[#3a1d0e]"
                        >
                            {updateMutation.isPending
                                ? "Saving..."
                                : "Save Settings"}
                        </Button>
                    </div>
                </div>

                {/* Receipt Preview */}
                <div className="admin-card p-5">
                    <h2 className="mb-4 text-[11px] font-medium uppercase tracking-wide text-(--admin-text-muted)">
                        Receipt Preview
                    </h2>
                    <ReceiptPreview settings={previewSettings} />
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
