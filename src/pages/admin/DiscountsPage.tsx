import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
    PlusIcon,
    MagnifyingGlassIcon,
    TagIcon,
    CheckCircleIcon,
    ProhibitIcon,
    DotsThreeVerticalIcon,
    PencilSimpleIcon,
    TrashIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import {
    useDiscounts,
    useUpdateDiscount,
    useDeleteDiscount,
} from "@/hooks/useDiscounts";
import { useSettings } from "@/hooks/useSettings";
import { useMenuItems } from "@/hooks/useMenuItems";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AdminDiscount } from "@/types/admin";

type StatusFilter = "all" | "active" | "inactive";
type TypeFilter = "" | "percentage" | "fixed_amount" | "bogo";

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "All Statuses" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
];

const TYPE_OPTIONS: { value: TypeFilter; label: string }[] = [
    { value: "", label: "All Types" },
    { value: "percentage", label: "Percentage" },
    { value: "fixed_amount", label: "Fixed Amount" },
    { value: "bogo", label: "BOGO" },
];

const typeBadge = (type: AdminDiscount["type"]) => {
    switch (type) {
        case "percentage":
            return "border-(--admin-primary)/30 bg-(--admin-primary)/10 text-(--admin-primary)";
        case "fixed_amount":
            return "border-(--admin-warning)/30 bg-(--admin-warning)/10 text-(--admin-warning)";
        case "bogo":
            return "border-(--admin-accent)/30 bg-(--admin-accent)/10 text-(--admin-accent)";
    }
};

const typeLabel = (type: AdminDiscount["type"]) => {
    switch (type) {
        case "percentage":
            return "Percentage";
        case "fixed_amount":
            return "Fixed";
        case "bogo":
            return "BOGO";
    }
};

const DiscountsPage = () => {
    const navigate = useNavigate();
    const { data: discounts, isLoading } = useDiscounts();
    const { data: settings } = useSettings();
    const { data: menuItems } = useMenuItems();
    const updateDiscount = useUpdateDiscount();
    const deleteDiscount = useDeleteDiscount();

    const currencySymbol = settings?.currencySymbol ?? "$";

    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState<TypeFilter>("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [deleteDialogId, setDeleteDialogId] = useState<string | null>(null);
    const menuItemName = (id: string | null) => {
        if (!id) return "Any item";
        return menuItems?.find((m) => m.id === id)?.name ?? id;
    };

    const formatValue = (discount: AdminDiscount) => {
        if (discount.type === "percentage") {
            const base = `${discount.value}%`;
            if (discount.appliesTo === "item" && discount.itemId) {
                return `${base} on ${menuItemName(discount.itemId)}`;
            }
            return base;
        }
        if (discount.type === "fixed_amount") {
            const base = `${currencySymbol}${Number(discount.value).toFixed(2)}`;
            if (discount.appliesTo === "item" && discount.itemId) {
                return `${base} off ${menuItemName(discount.itemId)}`;
            }
            return base;
        }
        return `Buy ${menuItemName(discount.buyItemId)} → Get ${menuItemName(discount.freeItemId)} free`;
    };

    const formatDateRange = (discount: AdminDiscount) => {
        const fmt = (d: string) =>
            new Date(d).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            });
        if (!discount.startsAt && !discount.endsAt) return "—";
        if (discount.startsAt && discount.endsAt)
            return `${fmt(discount.startsAt)} – ${fmt(discount.endsAt)}`;
        if (discount.startsAt) return `From ${fmt(discount.startsAt)}`;
        return `Until ${fmt(discount.endsAt!)}`;
    };

    const filtered = useMemo(() => {
        if (!discounts) return [];
        return discounts.filter((d) => {
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                if (!d.name.toLowerCase().includes(q)) return false;
            }
            if (typeFilter && d.type !== typeFilter) return false;
            if (statusFilter === "active" && !d.isActive) return false;
            if (statusFilter === "inactive" && d.isActive) return false;
            return true;
        });
    }, [discounts, searchQuery, typeFilter, statusFilter]);

    const handleToggleActive = (discount: AdminDiscount) => {
        updateDiscount.mutate(
            { id: discount.id, is_active: !discount.isActive },
            {
                onError: () =>
                    toast.error(
                        `Failed to ${discount.isActive ? "deactivate" : "activate"} discount`,
                    ),
            },
        );
    };

    const handleDelete = () => {
        if (!deleteDialogId) return;
        deleteDiscount.mutate(deleteDialogId, {
            onSuccess: () => setDeleteDialogId(null),
            onError: () => {
                toast.error("Failed to delete discount");
                setDeleteDialogId(null);
            },
        });
    };

    const isLoadingRows = () => (
        <>
            {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                    <td className="px-4 py-3">
                        <Skeleton className="h-4 w-28 bg-(--admin-hover)" />
                    </td>
                    <td className="px-4 py-3">
                        <Skeleton className="h-5 w-16 rounded-full bg-(--admin-hover)" />
                    </td>
                    <td className="px-4 py-3">
                        <Skeleton className="h-4 w-16 bg-(--admin-hover)" />
                    </td>
                    <td className="px-4 py-3 text-center">
                        <Skeleton className="mx-auto h-4 w-12 bg-(--admin-hover)" />
                    </td>
                    <td className="px-4 py-3">
                        <Skeleton className="h-4 w-20 bg-(--admin-hover)" />
                    </td>
                    <td className="px-2 py-3" />
                </tr>
            ))}
        </>
    );

    const emptyRows = () => (
        <tr>
            <td colSpan={6} className="px-4 py-10 text-center">
                <div className="flex flex-col items-center gap-1.5">
                    <TagIcon
                        className="size-5 text-(--admin-text-muted)"
                        aria-hidden="true"
                    />
                    <p className="text-xs text-(--admin-text-muted)">
                        {searchQuery || typeFilter || statusFilter !== "all"
                            ? "No discounts match your filters"
                            : "No discounts yet"}
                    </p>
                    <p className="text-[11px] text-(--admin-text-muted)/70">
                        {searchQuery || typeFilter || statusFilter !== "all"
                            ? "Try adjusting your search or filters"
                            : 'Click "Add" to create your first discount'}
                    </p>
                </div>
            </td>
        </tr>
    );

    return (
        <div className="flex flex-col gap-4 p-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-[13px] font-medium text-(--admin-primary)">
                    Discounts
                </h1>
                <Button
                    size="sm"
                    onClick={() => navigate("/admin/discounts/new")}
                    className="h-7 max-md:min-h-[44px] gap-1.5 bg-(--admin-primary) text-[11px] text-white hover:bg-(--admin-primary)/80 cursor-pointer"
                >
                    <PlusIcon className="size-3" />
                    Add
                </Button>
            </div>

            {/* Filters row */}
            <div className="flex items-center gap-2">
                <Select
                    value={typeFilter}
                    onValueChange={(v) => setTypeFilter(v as TypeFilter)}
                >
                    <SelectTrigger
                        size="sm"
                        aria-label="Filter by type"
                        className="h-7 max-md:min-h-[44px] w-32 border-(--admin-border) bg-(--admin-card) text-xs"
                    >
                        <SelectValue placeholder="All Types">
                            {(val) =>
                                val
                                    ? (TYPE_OPTIONS.find((t) => t.value === val)
                                          ?.label ?? val)
                                    : "All Types"
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

                <div className="flex gap-0.5 rounded-md bg-(--admin-hover) p-0.5">
                    {STATUS_OPTIONS.map((opt) => (
                        <Button
                            key={opt.value}
                            variant="ghost"
                            size="xs"
                            onClick={() => setStatusFilter(opt.value)}
                            className={cn(
                                "h-6 rounded-md px-2 text-xs focus-visible:ring-2 focus-visible:ring-(--admin-primary)/50",
                                statusFilter === opt.value
                                    ? "bg-(--admin-card) font-medium text-(--admin-primary) shadow-sm"
                                    : "text-(--admin-text-muted) hover:text-(--admin-text-secondary)",
                            )}
                        >
                            {opt.label}
                        </Button>
                    ))}
                </div>

                <div className="relative ml-auto">
                    <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-(--admin-text-muted)" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search..."
                        aria-label="Search discounts"
                        className="h-7 max-md:min-h-[44px] w-44 border-(--admin-border) bg-(--admin-card) pl-8 text-xs placeholder:text-xs"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="admin-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-(--admin-border) bg-(--admin-hover)">
                                <th className="px-4 py-2.5 text-left text-[10px] font-medium text-(--admin-text-muted)">
                                    Name
                                </th>
                                <th className="px-4 py-2.5 text-left text-[10px] font-medium text-(--admin-text-muted)">
                                    Type
                                </th>
                                <th className="px-4 py-2.5 text-left text-[10px] font-medium text-(--admin-text-muted)">
                                    Value
                                </th>
                                <th className="px-4 py-2.5 text-center text-[10px] font-medium text-(--admin-text-muted)">
                                    Status
                                </th>
                                <th className="px-4 py-2.5 text-left text-[10px] font-medium text-(--admin-text-muted)">
                                    Date Range
                                </th>
                                <th className="w-12 px-2 py-2.5 text-right text-[10px] font-medium text-(--admin-text-muted)" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-(--admin-border)">
                            {isLoading
                                ? isLoadingRows()
                                : filtered.length === 0
                                  ? emptyRows()
                                  : filtered.map((discount) => (
                                        <tr
                                            key={discount.id}
                                            className="cursor-pointer transition-colors hover:bg-(--admin-hover)"
                                            onClick={() =>
                                                navigate(
                                                    `/admin/discounts/${discount.id}`,
                                                )
                                            }
                                        >
                                            <td className="px-4 py-2.5 text-[12px] font-medium text-(--admin-text)">
                                                {discount.name}
                                                {discount.type === "bogo" && (
                                                    <span className="block text-[10px] font-normal text-(--admin-text-muted)">
                                                        {menuItemName(
                                                            discount.buyItemId,
                                                        )}{" "}
                                                        →{" "}
                                                        {menuItemName(
                                                            discount.freeItemId,
                                                        )}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-2.5">
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        "text-[10px]",
                                                        typeBadge(
                                                            discount.type,
                                                        ),
                                                    )}
                                                >
                                                    {typeLabel(discount.type)}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-2.5 font-mono text-[12px] text-(--admin-text-secondary)">
                                                {formatValue(discount)}
                                            </td>
                                            <td className="px-4 py-2.5 text-center">
                                                <span
                                                    className={cn(
                                                        "text-[10px] font-medium",
                                                        discount.isActive
                                                            ? "text-(--admin-success)"
                                                            : "text-(--admin-text-muted)",
                                                    )}
                                                >
                                                    {discount.isActive
                                                        ? "Active"
                                                        : "Inactive"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2.5 text-[11px] text-(--admin-text-secondary)">
                                                {formatDateRange(discount)}
                                            </td>
                                            <td className="px-2 py-2.5 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        aria-label="Actions"
                                                        onClick={(e) =>
                                                            e.stopPropagation()
                                                        }
                                                        className="flex size-7 max-md:min-h-[44px] max-md:min-w-[44px] shrink-0 items-center justify-center rounded-md border border-(--admin-border) text-(--admin-text-secondary) transition-colors hover:bg-(--admin-hover) hover:text-(--admin-text) cursor-pointer"
                                                    >
                                                        <DotsThreeVerticalIcon className="size-4" />
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent
                                                        align="end"
                                                        sideOffset={4}
                                                        className="border-(--admin-border) bg-(--admin-card)"
                                                    >
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                navigate(
                                                                    `/admin/discounts/${discount.id}`,
                                                                )
                                                            }
                                                        >
                                                            <PencilSimpleIcon className="size-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            variant={
                                                                discount.isActive
                                                                    ? "destructive"
                                                                    : undefined
                                                            }
                                                            onClick={() =>
                                                                handleToggleActive(
                                                                    discount,
                                                                )
                                                            }
                                                        >
                                                            {discount.isActive ? (
                                                                <ProhibitIcon className="size-4" />
                                                            ) : (
                                                                <CheckCircleIcon className="size-4" />
                                                            )}
                                                            {discount.isActive
                                                                ? "Deactivate"
                                                                : "Activate"}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            variant="destructive"
                                                            onClick={() =>
                                                                setDeleteDialogId(
                                                                    discount.id,
                                                                )
                                                            }
                                                        >
                                                            <TrashIcon className="size-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Delete confirmation dialog */}
            <Dialog
                open={deleteDialogId !== null}
                onOpenChange={(v) => !v && setDeleteDialogId(null)}
            >
                <DialogContent className="max-w-sm border-(--admin-border) bg-(--admin-card)">
                    <DialogHeader>
                        <DialogTitle className="text-(--admin-text)">
                            Delete Discount
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-xs text-(--admin-text-secondary)">
                        Are you sure you want to delete{" "}
                        <span className="font-medium text-(--admin-text)">
                            {discounts?.find((d) => d.id === deleteDialogId)
                                ?.name ?? ""}
                        </span>
                        ? It will be deactivated and hidden.
                    </p>
                    <DialogFooter>
                        <Button
                            variant="ghost"
                            onClick={() => setDeleteDialogId(null)}
                            className="text-(--admin-text-secondary)"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDelete}
                            disabled={deleteDiscount.isPending}
                            variant="destructive"
                        >
                            {deleteDiscount.isPending
                                ? "Deleting..."
                                : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default DiscountsPage;
