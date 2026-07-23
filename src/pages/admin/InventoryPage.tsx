import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
    MagnifyingGlassIcon,
    PlusIcon,
    PackageIcon,
    DotsThreeVerticalIcon,
    PencilSimpleIcon,
    TrashIcon,
} from "@phosphor-icons/react";
import { useIngredients } from "@/hooks/useInventory";
import { useDeleteIngredient } from "@/hooks/useDeleteIngredient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { getStockStatus, stockStatusConfig } from "@/lib/format-stock";

const InventoryPage = () => {
    const navigate = useNavigate();
    const { data: ingredients, isLoading } = useIngredients();
    const deleteMutation = useDeleteIngredient();

    const [search, setSearch] = useState("");
    const [lowStockOnly, setLowStockOnly] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const filtered = useMemo(
        () =>
            ingredients?.filter((ing) => {
                if (
                    lowStockOnly &&
                    parseFloat(ing.stockQuantity) >
                        parseFloat(ing.lowStockThreshold)
                )
                    return false;
                if (
                    search &&
                    !ing.name.toLowerCase().includes(search.toLowerCase())
                )
                    return false;
                return true;
            })
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name)),
        [ingredients, search, lowStockOnly],
    );

    const handleDelete = () => {
        if (!deletingId) return;
        const id = deletingId;
        setDeletingId(null);
        deleteMutation.mutate(id, {
            onSuccess: () => toast.success("Ingredient deleted"),
            onError: () => toast.error("Failed to delete ingredient"),
        });
    };

    return (
        <div className="flex flex-col gap-4 p-5">
            <div className="flex items-center justify-between">
                <h1 className="text-[13px] font-medium text-(--admin-primary)">
                    Inventory
                </h1>
                <Button
                    size="sm"
                    onClick={() => navigate("/admin/inventory/new")}
                    className="h-7 max-md:min-h-[44px] gap-1.5 bg-(--admin-primary) text-[11px] text-white hover:bg-(--admin-primary)/80 cursor-pointer"
                >
                    <PlusIcon className="size-3" />
                    Add Ingredient
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
                <Button
                    variant={lowStockOnly ? "default" : "outline"}
                    size="sm"
                    onClick={() => setLowStockOnly(!lowStockOnly)}
                    className={`h-7 text-xs ${
                        lowStockOnly
                            ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                            : "border-(--admin-border) text-(--admin-text-secondary)"
                    }`}
                >
                    Low Stock Only
                </Button>

                <div className="relative ml-auto">
                    <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-(--admin-text-muted)" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search..."
                        aria-label="Search ingredients"
                        className="h-7 max-md:min-h-[44px] w-48 border-(--admin-border) bg-(--admin-card) pl-8 text-xs placeholder:text-xs"
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
                                    Unit
                                </th>
                                <th className="px-4 py-2.5 text-right text-[10px] font-medium text-(--admin-text-muted)">
                                    Stock
                                </th>
                                <th className="px-4 py-2.5 text-right text-[10px] font-medium text-(--admin-text-muted)">
                                    Threshold
                                </th>
                                <th className="px-4 py-2.5 text-center text-[10px] font-medium text-(--admin-text-muted)">
                                    Status
                                </th>
                                <th className="w-36 px-2 py-2.5" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-(--admin-border)">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-4 py-3">
                                            <Skeleton className="h-4 w-32 bg-(--admin-hover)" />
                                        </td>
                                        <td className="px-4 py-3">
                                            <Skeleton className="h-4 w-8 bg-(--admin-hover)" />
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Skeleton className="ml-auto h-4 w-16 bg-(--admin-hover)" />
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Skeleton className="ml-auto h-4 w-12 bg-(--admin-hover)" />
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <Skeleton className="mx-auto h-5 w-16 rounded-full bg-(--admin-hover)" />
                                        </td>
                                        <td className="px-2 py-3" />
                                    </tr>
                                ))
                            ) : !filtered || filtered.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-4 py-10 text-center"
                                    >
                                        <div className="flex flex-col items-center gap-1.5">
                                            <PackageIcon className="size-5 text-(--admin-text-muted)" />
                                            <p className="text-xs text-(--admin-text-muted)">
                                                No ingredients found
                                            </p>
                                            <p className="text-[11px] text-(--admin-text-muted)/70">
                                                Try adjusting your search or add
                                                a new ingredient
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((ing) => {
                                    const status = getStockStatus(
                                        ing.stockQuantity,
                                        ing.lowStockThreshold,
                                    );
                                    const config = stockStatusConfig[status];

                                    return (
                                        <tr
                                            key={ing.id}
                                            onClick={() =>
                                                navigate(
                                                    `/admin/inventory/${ing.id}`,
                                                )
                                            }
                                            onKeyDown={(e) => {
                                                if (
                                                    e.key === "Enter" ||
                                                    e.key === " "
                                                ) {
                                                    e.preventDefault();
                                                    navigate(
                                                        `/admin/inventory/${ing.id}`,
                                                    );
                                                }
                                            }}
                                            tabIndex={0}
                                            role="button"
                                            aria-label={`View ${ing.name}`}
                                            className="admin-table-row cursor-pointer transition-colors hover:bg-(--admin-hover) focus-visible:outline-2 focus-visible:outline-(--admin-primary) focus-visible:-outline-offset-2"
                                        >
                                            <td className="px-4 py-2.5 text-[12px] font-medium text-(--admin-text)">
                                                {ing.name}
                                            </td>
                                            <td className="px-4 py-2.5 font-mono text-[11px] text-(--admin-text-secondary)">
                                                {ing.unit}
                                            </td>
                                            <td className="px-4 py-2.5 text-right font-mono text-[12px] text-(--admin-text)">
                                                {parseFloat(
                                                    ing.stockQuantity,
                                                ).toFixed(1)}
                                            </td>
                                            <td className="px-4 py-2.5 text-right font-mono text-[11px] text-(--admin-text-muted)">
                                                {parseFloat(
                                                    ing.lowStockThreshold,
                                                ).toFixed(1)}
                                            </td>
                                            <td className="px-4 py-2.5 text-center">
                                                <span
                                                    className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium ${config.className}`}
                                                >
                                                    {config.label}
                                                </span>
                                            </td>
                                            <td className="px-2 py-2.5 text-right">
                                                <div
                                                    className="flex justify-end"
                                                    onClick={(e) =>
                                                        e.stopPropagation()
                                                    }
                                                >
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger
                                                            aria-label="Actions"
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
                                                                        `/admin/inventory/${ing.id}`,
                                                                    )
                                                                }
                                                            >
                                                                <PencilSimpleIcon className="size-4" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                variant="destructive"
                                                                onClick={() =>
                                                                    setDeletingId(
                                                                        ing.id,
                                                                    )
                                                                }
                                                            >
                                                                <TrashIcon className="size-4" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Delete confirmation */}
            <Dialog
                open={deletingId !== null}
                onOpenChange={(v) =>
                    !v && !deleteMutation.isPending && setDeletingId(null)
                }
            >
                <DialogContent className="max-w-sm border-(--admin-border) bg-(--admin-card)">
                    <DialogHeader>
                        <DialogTitle className="text-[14px] font-medium text-(--admin-text)">
                            Delete Ingredient
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-[13px] text-(--admin-text-secondary)">
                        Are you sure you want to delete{" "}
                        <span className="font-medium text-(--admin-text)">
                            {ingredients?.find((i) => i.id === deletingId)
                                ?.name ?? ""}
                        </span>
                        ? This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-2 border-t border-(--admin-border) pt-3">
                        <Button
                            variant="ghost"
                            onClick={() => setDeletingId(null)}
                            disabled={deleteMutation.isPending}
                            className="text-(--admin-text-secondary)"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDelete}
                            disabled={deleteMutation.isPending}
                            variant="destructive"
                        >
                            {deleteMutation.isPending
                                ? "Deleting..."
                                : "Delete"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default InventoryPage;
