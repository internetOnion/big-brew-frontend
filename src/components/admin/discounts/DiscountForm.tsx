import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import { useMenuItems } from "@/hooks/useMenuItems";
import { useSettings } from "@/hooks/useSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { AdminDiscount, CreateDiscountPayload } from "@/types/admin";

type DiscountType = "percentage" | "fixed_amount" | "bogo";

export interface DiscountFormData {
    name: string;
    type: DiscountType;
    value: string;
    maxDiscountAmount: string;
    appliesTo: "order" | "item";
    itemId: string;
    buyItemId: string;
    freeItemId: string;
    isActive: boolean;
    startsAt: string;
    endsAt: string;
}

interface DiscountFormProps {
    initialData?: AdminDiscount;
    onSubmit: (payload: CreateDiscountPayload) => void;
    isPending: boolean;
    submitLabel: string;
}

const TYPE_OPTIONS: { value: DiscountType; label: string }[] = [
    { value: "percentage", label: "Percentage" },
    { value: "fixed_amount", label: "Fixed Amount" },
    { value: "bogo", label: "Buy One Get One (BOGO)" },
];

const toFormData = (d: AdminDiscount): DiscountFormData => ({
    name: d.name,
    type: d.type,
    value: d.value ?? "",
    maxDiscountAmount: d.maxDiscountAmount ?? "",
    appliesTo: d.appliesTo,
    itemId: d.itemId ?? "",
    buyItemId: d.buyItemId ?? "__any__",
    freeItemId: d.freeItemId ?? "__any__",
    isActive: d.isActive,
    startsAt: d.startsAt ? d.startsAt.slice(0, 10) : "",
    endsAt: d.endsAt ? d.endsAt.slice(0, 10) : "",
});

const toPayload = (form: DiscountFormData): CreateDiscountPayload => {
    const base = {
        name: form.name.trim(),
        type: form.type,
        is_active: form.isActive,
        starts_at: form.startsAt ? new Date(form.startsAt).toISOString() : null,
        ends_at: form.endsAt ? new Date(form.endsAt).toISOString() : null,
    };

    if (form.type === "bogo") {
        return {
            ...base,
            value: null,
            applies_to: "item",
            item_id: null,
            buy_item_id:
                form.buyItemId === "__any__" ? null : form.buyItemId || null,
            free_item_id:
                form.freeItemId === "__any__" ? null : form.freeItemId || null,
        };
    }

    return {
        ...base,
        value: form.value ? Number(form.value) : null,
        max_discount_amount: form.maxDiscountAmount
            ? Number(form.maxDiscountAmount)
            : null,
        applies_to: form.appliesTo,
        item_id: form.appliesTo === "item" ? form.itemId || null : null,
        buy_item_id: null,
        free_item_id: null,
    };
};

const DiscountForm = ({
    initialData,
    onSubmit,
    isPending,
    submitLabel,
}: DiscountFormProps) => {
    const navigate = useNavigate();
    const { data: menuItems } = useMenuItems();
    const { data: settings } = useSettings();

    const currencySymbol = settings?.currencySymbol ?? "$";

    const [form, setForm] = useState<DiscountFormData>(
        initialData
            ? toFormData(initialData)
            : {
                  name: "",
                  type: "percentage",
                  value: "",
                  maxDiscountAmount: "",
                  appliesTo: "order",
                  itemId: "",
                  buyItemId: "",
                  freeItemId: "",
                  isActive: true,
                  startsAt: "",
                  endsAt: "",
              },
    );

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (initialData) setForm(toFormData(initialData));
    }, [initialData]);

    const updateField = <K extends keyof DiscountFormData>(
        field: K,
        value: DiscountFormData[K],
    ) => {
        setForm((prev) => {
            const next = { ...prev, [field]: value };
            // Auto-set appliesTo when type changes
            if (field === "type") {
                if (value === "bogo") {
                    next.appliesTo = "item";
                } else {
                    next.appliesTo = "order";
                    next.itemId = "";
                }
            }
            return next;
        });
        setErrors((prev) => {
            const next = { ...prev };
            delete next[field];
            return next;
        });
    };

    const validate = (): boolean => {
        const e: Record<string, string> = {};
        if (!form.name.trim()) e.name = "Name is required";
        if (form.type === "percentage" || form.type === "fixed_amount") {
            if (!form.value || Number(form.value) <= 0)
                e.value = "Value is required and must be positive";
            if (form.appliesTo === "item" && !form.itemId)
                e.itemId = "Select an item for item-level discounts";
        }
        if (form.type === "bogo") {
            if (!form.buyItemId && !form.freeItemId)
                e.buyItemId = "At least one item is required";
        }
        if (form.startsAt && form.endsAt && form.startsAt > form.endsAt) {
            e.endsAt = "End date must be after start date";
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        onSubmit(toPayload(form));
    };

    const isBogo = form.type === "bogo";
    const isPercentOrFixed =
        form.type === "percentage" || form.type === "fixed_amount";

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-5">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => navigate("/admin/discounts")}
                    aria-label="Back to discounts"
                    className="text-(--admin-text-muted) hover:text-(--admin-text)"
                >
                    <ArrowLeftIcon className="size-4" />
                </Button>
                <h1 className="text-[13px] font-medium text-(--admin-primary)">
                    {initialData ? "Edit Discount" : "New Discount"}
                </h1>
            </div>

            <div className="admin-card max-w-lg p-5">
                <div className="flex flex-col gap-4">
                    {/* Name */}
                    <div className="grid gap-1.5">
                        <Label
                            htmlFor="discount-name"
                            className="text-[11px] text-(--admin-text-secondary)"
                        >
                            Name
                        </Label>
                        <Input
                            id="discount-name"
                            value={form.name}
                            onChange={(e) =>
                                updateField("name", e.target.value)
                            }
                            placeholder="e.g. Happy Hour 20% Off"
                            className="h-8 max-md:min-h-[44px] border-(--admin-border) bg-(--admin-card) text-xs text-(--admin-text) focus-visible:ring-(--admin-accent)"
                        />
                        {errors.name && (
                            <p className="text-[10px] text-destructive">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    {/* Type */}
                    <div className="grid gap-1.5">
                        <Label className="text-[11px] text-(--admin-text-secondary)">
                            Discount Type
                        </Label>
                        <Select
                            value={form.type}
                            onValueChange={(v) =>
                                updateField("type", v as DiscountType)
                            }
                        >
                            <SelectTrigger className="h-8 max-md:min-h-[44px] border-(--admin-border) bg-(--admin-card) text-xs">
                                <SelectValue placeholder="Select type">
                                    {(v) =>
                                        TYPE_OPTIONS.find((t) => t.value === v)
                                            ?.label
                                    }
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {TYPE_OPTIONS.map((t) => (
                                    <SelectItem key={t.value} value={t.value}>
                                        {t.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Applies to (percentage / fixed_amount only) */}
                    {isPercentOrFixed && (
                        <div className="grid gap-1.5">
                            <Label className="text-[11px] text-(--admin-text-secondary)">
                                Applies to
                            </Label>
                            <div className="flex gap-1 rounded-md bg-(--admin-hover) p-0.5">
                                {(
                                    [
                                        { value: "order", label: "Order-wide" },
                                        {
                                            value: "item",
                                            label: "Specific item",
                                        },
                                    ] as const
                                ).map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() =>
                                            updateField("appliesTo", opt.value)
                                        }
                                        className={`flex-1 rounded-md px-3 py-1.5 text-xs transition-colors cursor-pointer ${
                                            form.appliesTo === opt.value
                                                ? "bg-(--admin-card) font-medium text-(--admin-primary) shadow-sm"
                                                : "text-(--admin-text-muted) hover:text-(--admin-text-secondary)"
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Item selector (item-level percentage/fixed) */}
                    {isPercentOrFixed && form.appliesTo === "item" && (
                        <div className="grid gap-1.5">
                            <Label className="text-[11px] text-(--admin-text-secondary)">
                                Menu Item
                            </Label>
                            <Select
                                value={form.itemId}
                                onValueChange={(v) =>
                                    updateField("itemId", v ?? "")
                                }
                            >
                                <SelectTrigger className="h-8 max-md:min-h-[44px] border-(--admin-border) bg-(--admin-card) text-xs">
                                    <SelectValue placeholder="Select an item">
                                        {(v) =>
                                            menuItems?.find((i) => i.id === v)
                                                ?.name
                                        }
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {menuItems?.map((item) => (
                                        <SelectItem
                                            key={item.id}
                                            value={item.id}
                                        >
                                            {item.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.itemId && (
                                <p className="text-[10px] text-destructive">
                                    {errors.itemId}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Value (percentage / fixed_amount) */}
                    {isPercentOrFixed && (
                        <div className="grid gap-1.5">
                            <Label
                                htmlFor="discount-value"
                                className="text-[11px] text-(--admin-text-secondary)"
                            >
                                {form.type === "percentage"
                                    ? "Percentage (%)"
                                    : `Amount (${currencySymbol})`}
                            </Label>
                            <div className="relative">
                                {form.type === "fixed_amount" && (
                                    <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-(--admin-text-muted)">
                                        {currencySymbol}
                                    </span>
                                )}
                                <Input
                                    id="discount-value"
                                    type="number"
                                    min="0"
                                    step={
                                        form.type === "percentage"
                                            ? "1"
                                            : "0.01"
                                    }
                                    value={form.value}
                                    onChange={(e) =>
                                        updateField("value", e.target.value)
                                    }
                                    placeholder={
                                        form.type === "percentage"
                                            ? "20"
                                            : "5.00"
                                    }
                                    className={`h-8 max-md:min-h-[44px] border-(--admin-border) bg-(--admin-card) text-xs text-(--admin-text) focus-visible:ring-(--admin-accent) ${form.type === "fixed_amount" ? "pl-7" : ""}`}
                                />
                                {form.type === "percentage" && (
                                    <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-(--admin-text-muted)">
                                        %
                                    </span>
                                )}
                            </div>
                            {errors.value && (
                                <p className="text-[10px] text-destructive">
                                    {errors.value}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Max discount amount (percentage only) */}
                    {form.type === "percentage" && (
                        <div className="grid gap-1.5">
                            <Label
                                htmlFor="max-discount-amount"
                                className="text-[11px] text-(--admin-text-secondary)"
                            >
                                Max Discount ({currencySymbol}){" "}
                                <span className="text-(--admin-text-muted)">
                                    (optional)
                                </span>
                            </Label>
                            <div className="relative">
                                <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-(--admin-text-muted)">
                                    {currencySymbol}
                                </span>
                                <Input
                                    id="max-discount-amount"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={form.maxDiscountAmount}
                                    onChange={(e) =>
                                        updateField(
                                            "maxDiscountAmount",
                                            e.target.value,
                                        )
                                    }
                                    placeholder="e.g. 10.00"
                                    className="h-8 max-md:min-h-[44px] border-(--admin-border) bg-(--admin-card) pl-7 text-xs text-(--admin-text) focus-visible:ring-(--admin-accent)"
                                />
                            </div>
                            {errors.maxDiscountAmount && (
                                <p className="text-[10px] text-destructive">
                                    {errors.maxDiscountAmount}
                                </p>
                            )}
                        </div>
                    )}

                    {/* BOGO item selects */}
                    {isBogo && (
                        <>
                            <div className="grid gap-1.5">
                                <Label className="text-[11px] text-(--admin-text-secondary)">
                                    Buy Item
                                </Label>
                                <Select
                                    value={form.buyItemId}
                                    onValueChange={(v) =>
                                        updateField("buyItemId", v ?? "")
                                    }
                                >
                                    <SelectTrigger className="h-8 max-md:min-h-[44px] border-(--admin-border) bg-(--admin-card) text-xs">
                                        <SelectValue placeholder="Customer buys...">
                                            {(v) =>
                                                v === "__any__"
                                                    ? "Any item"
                                                    : menuItems?.find(
                                                          (i) => i.id === v,
                                                      )?.name
                                            }
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="__any__">
                                            Any item
                                        </SelectItem>
                                        {menuItems?.map((item) => (
                                            <SelectItem
                                                key={item.id}
                                                value={item.id}
                                            >
                                                {item.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.buyItemId && (
                                    <p className="text-[10px] text-destructive">
                                        {errors.buyItemId}
                                    </p>
                                )}
                            </div>
                            <div className="grid gap-1.5">
                                <Label className="text-[11px] text-(--admin-text-secondary)">
                                    Free Item
                                </Label>
                                <Select
                                    value={form.freeItemId}
                                    onValueChange={(v) =>
                                        updateField("freeItemId", v ?? "")
                                    }
                                >
                                    <SelectTrigger className="h-8 max-md:min-h-[44px] border-(--admin-border) bg-(--admin-card) text-xs">
                                        <SelectValue placeholder="Customer gets free...">
                                            {(v) =>
                                                v === "__any__"
                                                    ? "Any item"
                                                    : menuItems?.find(
                                                          (i) => i.id === v,
                                                      )?.name
                                            }
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="__any__">
                                            Any item
                                        </SelectItem>
                                        {menuItems?.map((item) => (
                                            <SelectItem
                                                key={item.id}
                                                value={item.id}
                                            >
                                                {item.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.freeItemId && (
                                    <p className="text-[10px] text-destructive">
                                        {errors.freeItemId}
                                    </p>
                                )}
                            </div>
                        </>
                    )}

                    {/* Date range */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-1.5">
                            <Label className="text-[11px] text-(--admin-text-secondary)">
                                Starts At{" "}
                                <span className="text-(--admin-text-muted)">
                                    (optional)
                                </span>
                            </Label>
                            <DatePicker
                                value={
                                    form.startsAt
                                        ? new Date(form.startsAt + "T00:00:00")
                                        : null
                                }
                                onChange={(date) =>
                                    updateField(
                                        "startsAt",
                                        date
                                            ? date.toISOString().split("T")[0]
                                            : "",
                                    )
                                }
                                placeholder="Select date"
                                disabled={
                                    form.endsAt
                                        ? (date) =>
                                              date >
                                              new Date(
                                                  form.endsAt + "T00:00:00",
                                              )
                                        : undefined
                                }
                            />
                        </div>
                        <div className="grid gap-1.5">
                            <Label className="text-[11px] text-(--admin-text-secondary)">
                                Ends At{" "}
                                <span className="text-(--admin-text-muted)">
                                    (optional)
                                </span>
                            </Label>
                            <DatePicker
                                value={
                                    form.endsAt
                                        ? new Date(form.endsAt + "T00:00:00")
                                        : null
                                }
                                onChange={(date) =>
                                    updateField(
                                        "endsAt",
                                        date
                                            ? date.toISOString().split("T")[0]
                                            : "",
                                    )
                                }
                                placeholder="Select date"
                                disabled={
                                    form.startsAt
                                        ? (date) =>
                                              date <
                                              new Date(
                                                  form.startsAt + "T00:00:00",
                                              )
                                        : undefined
                                }
                            />
                            {errors.endsAt && (
                                <p className="text-[10px] text-destructive">
                                    {errors.endsAt}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Active toggle */}
                    <label className="flex items-center gap-2.5">
                        <Checkbox
                            checked={form.isActive}
                            onCheckedChange={(checked) =>
                                updateField("isActive", !!checked)
                            }
                        />
                        <span className="text-[12px] text-(--admin-text)">
                            Active
                        </span>
                    </label>

                    {/* Submit */}
                    <Button
                        type="submit"
                        disabled={isPending}
                        className="h-8 max-md:min-h-[44px] bg-(--admin-primary) text-xs font-medium text-white hover:bg-(--admin-primary)/80"
                    >
                        {isPending ? "Saving..." : submitLabel}
                    </Button>
                </div>
            </div>
        </form>
    );
};

export default DiscountForm;
