import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useSettings } from "@/hooks/useSettings";
import { useUpdateSettings } from "@/hooks/useUpdateSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import ReceiptPreview from "@/components/admin/settings/ReceiptPreview";
import type { Settings } from "@/types/order";

const SettingsPage = () => {
    const { data: settings, isLoading } = useSettings();
    const updateMutation = useUpdateSettings();

    const [form, setForm] = useState<Partial<Settings>>({});

    useEffect(() => {
        if (settings) {
            setForm({
                storeName: settings.storeName,
                storeAddress: settings.storeAddress,
                currencySymbol: settings.currencySymbol,
                receiptHeader: settings.receiptHeader,
                receiptFooter: settings.receiptFooter,
                taxLabel: settings.taxLabel,
                logoUrl: settings.logoUrl,
                qrCodeUrl: settings.qrCodeUrl,
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

    const previewSettings: Settings = {
        id: 1,
        storeName: form.storeName ?? "",
        storeAddress: form.storeAddress ?? null,
        currencySymbol: form.currencySymbol ?? "$",
        receiptHeader: form.receiptHeader ?? null,
        receiptFooter: form.receiptFooter ?? null,
        taxLabel: form.taxLabel ?? "Tax",
        logoUrl: form.logoUrl ?? null,
        qrCodeUrl: form.qrCodeUrl ?? null,
        khrRate: form.khrRate ?? null,
        createdAt: settings?.createdAt ?? "",
        updatedAt: settings?.updatedAt ?? "",
    };

    if (isLoading) {
        return (
            <div className="flex flex-col gap-4 p-5">
                <Skeleton className="h-5 w-32 bg-[var(--admin-hover)]" />
                <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
                    <Skeleton className="h-[500px] bg-[var(--admin-hover)]" />
                    <Skeleton className="h-[500px] bg-[var(--admin-hover)]" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 p-5">
            <h1 className="text-[13px] font-medium text-[var(--admin-primary)]">
                Settings
            </h1>

            <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
                {/* Form */}
                <div className="admin-card p-5">
                    <h2 className="mb-4 text-[11px] font-medium uppercase tracking-wide text-[var(--admin-text-muted)]">
                        Store Configuration
                    </h2>

                    <div className="space-y-4">
                        <div className="grid gap-1.5">
                            <Label className="text-[11px] text-[var(--admin-text-secondary)]">
                                Store Name
                            </Label>
                            <Input
                                value={form.storeName ?? ""}
                                onChange={(e) =>
                                    handleChange("storeName", e.target.value)
                                }
                                className="h-8 border-[var(--admin-border)] bg-[var(--admin-card)] text-xs text-[var(--admin-text)] focus-visible:ring-[var(--admin-accent)]"
                            />
                        </div>

                        <div className="grid gap-1.5">
                            <Label className="text-[11px] text-[var(--admin-text-secondary)]">
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
                                className="h-8 border-[var(--admin-border)] bg-[var(--admin-card)] text-xs text-[var(--admin-text)] focus-visible:ring-[var(--admin-accent)]"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-1.5">
                                <Label className="text-[11px] text-[var(--admin-text-secondary)]">
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
                                    className="h-8 border-[var(--admin-border)] bg-[var(--admin-card)] font-mono text-xs text-[var(--admin-text)] focus-visible:ring-[var(--admin-accent)]"
                                />
                            </div>
                            <div className="grid gap-1.5">
                                <Label className="text-[11px] text-[var(--admin-text-secondary)]">
                                    Tax Label
                                </Label>
                                <Input
                                    value={form.taxLabel ?? ""}
                                    onChange={(e) =>
                                        handleChange("taxLabel", e.target.value)
                                    }
                                    className="h-8 border-[var(--admin-border)] bg-[var(--admin-card)] text-xs text-[var(--admin-text)] focus-visible:ring-[var(--admin-accent)]"
                                />
                            </div>
                        </div>

                        <div className="grid gap-1.5">
                            <Label className="text-[11px] text-[var(--admin-text-secondary)]">
                                KHR Exchange Rate
                            </Label>
                            <Input
                                type="number"
                                value={form.khrRate ?? ""}
                                onChange={(e) =>
                                    handleChange(
                                        "khrRate",
                                        e.target.value
                                            ? parseInt(e.target.value)
                                            : null,
                                    )
                                }
                                className="h-8 border-[var(--admin-border)] bg-[var(--admin-card)] font-mono text-xs text-[var(--admin-text)] focus-visible:ring-[var(--admin-accent)]"
                            />
                        </div>

                        <div className="grid gap-1.5">
                            <Label className="text-[11px] text-[var(--admin-text-secondary)]">
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
                                className="border-[var(--admin-border)] bg-[var(--admin-card)] text-xs text-[var(--admin-text)] focus-visible:ring-[var(--admin-accent)]"
                            />
                        </div>

                        <div className="grid gap-1.5">
                            <Label className="text-[11px] text-[var(--admin-text-secondary)]">
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
                                className="border-[var(--admin-border)] bg-[var(--admin-card)] text-xs text-[var(--admin-text)] focus-visible:ring-[var(--admin-accent)]"
                            />
                        </div>

                        <div className="grid gap-1.5">
                            <Label className="text-[11px] text-[var(--admin-text-secondary)]">
                                Logo URL
                            </Label>
                            <Input
                                value={form.logoUrl ?? ""}
                                onChange={(e) =>
                                    handleChange(
                                        "logoUrl",
                                        e.target.value || null,
                                    )
                                }
                                placeholder="https://..."
                                className="h-8 border-[var(--admin-border)] bg-[var(--admin-card)] font-mono text-xs text-[var(--admin-text)] placeholder:text-[var(--admin-text-muted)] focus-visible:ring-[var(--admin-accent)]"
                            />
                        </div>

                        <div className="grid gap-1.5">
                            <Label className="text-[11px] text-[var(--admin-text-secondary)]">
                                QR Code URL
                            </Label>
                            <Input
                                value={form.qrCodeUrl ?? ""}
                                onChange={(e) =>
                                    handleChange(
                                        "qrCodeUrl",
                                        e.target.value || null,
                                    )
                                }
                                placeholder="https://..."
                                className="h-8 border-[var(--admin-border)] bg-[var(--admin-card)] font-mono text-xs text-[var(--admin-text)] placeholder:text-[var(--admin-text-muted)] focus-visible:ring-[var(--admin-accent)]"
                            />
                        </div>

                        <Button
                            onClick={handleSave}
                            disabled={updateMutation.isPending}
                            className="h-8 bg-[var(--admin-primary)] text-xs font-medium text-white hover:bg-[#3a1d0e]"
                        >
                            {updateMutation.isPending
                                ? "Saving..."
                                : "Save Settings"}
                        </Button>
                    </div>
                </div>

                {/* Receipt Preview */}
                <div className="admin-card p-5">
                    <h2 className="mb-4 text-[11px] font-medium uppercase tracking-wide text-[var(--admin-text-muted)]">
                        Receipt Preview
                    </h2>
                    <ReceiptPreview settings={previewSettings} />
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
