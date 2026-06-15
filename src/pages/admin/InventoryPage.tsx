import { useState } from "react";
import { Search, Plus, History, SlidersHorizontal, Trash2 } from "lucide-react";
import { useIngredients } from "@/hooks/useInventory";
import { useDeleteIngredient } from "@/hooks/useDeleteIngredient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import StockAdjustDialog from "@/components/admin/inventory/StockAdjustDialog";
import StockHistoryDialog from "@/components/admin/inventory/StockHistoryDialog";
import AddIngredientDialog from "@/components/admin/inventory/AddIngredientDialog";
import type { InventoryItem } from "@/types/admin";

const InventoryPage = () => {
    const { data: ingredients, isLoading } = useIngredients();
    const deleteMutation = useDeleteIngredient();

    const [search, setSearch] = useState("");
    const [lowStockOnly, setLowStockOnly] = useState(false);
    const [adjustingIngredient, setAdjustingIngredient] =
        useState<InventoryItem | null>(null);
    const [historyIngredient, setHistoryIngredient] =
        useState<InventoryItem | null>(null);
    const [deletingIngredient, setDeletingIngredient] =
        useState<InventoryItem | null>(null);
    const [showAddDialog, setShowAddDialog] = useState(false);

    const filtered = ingredients?.filter((ing) => {
        if (
            lowStockOnly &&
            parseFloat(ing.stockQuantity) > parseFloat(ing.lowStockThreshold)
        )
            return false;
        if (search && !ing.name.toLowerCase().includes(search.toLowerCase()))
            return false;
        return true;
    });

    return (
        <div className="flex flex-col gap-4 p-5">
            <div className="flex items-center justify-between">
                <h1 className="text-[13px] font-medium text-[var(--admin-primary)]">
                    Inventory
                </h1>
                <Button
                    size="sm"
                    onClick={() => setShowAddDialog(true)}
                    className="h-7 gap-1.5 bg-[var(--admin-primary)] text-[11px] text-white hover:bg-[#3a1d0e]"
                >
                    <Plus className="size-3" />
                    Add
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[var(--admin-text-muted)]" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search ingredients..."
                        className="h-8 w-48 border-[var(--admin-border)] bg-[var(--admin-card)] pl-8 text-xs placeholder:text-[var(--admin-text-muted)]"
                    />
                </div>

                <Button
                    variant={lowStockOnly ? "default" : "outline"}
                    size="sm"
                    onClick={() => setLowStockOnly(!lowStockOnly)}
                    className={`h-7 text-[11px] ${
                        lowStockOnly
                            ? "bg-red-100 text-red-700 hover:bg-red-200"
                            : "border-[var(--admin-border)] text-[var(--admin-text-secondary)]"
                    }`}
                >
                    Low Stock Only
                </Button>
            </div>

            {/* Table */}
            <div className="admin-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[var(--admin-border)] bg-[var(--admin-hover)]">
                                <th className="px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-wide text-[var(--admin-text-muted)]">
                                    Name
                                </th>
                                <th className="px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-wide text-[var(--admin-text-muted)]">
                                    Unit
                                </th>
                                <th className="px-4 py-2.5 text-right text-[10px] font-medium uppercase tracking-wide text-[var(--admin-text-muted)]">
                                    Stock
                                </th>
                                <th className="px-4 py-2.5 text-right text-[10px] font-medium uppercase tracking-wide text-[var(--admin-text-muted)]">
                                    Threshold
                                </th>
                                <th className="px-4 py-2.5 text-center text-[10px] font-medium uppercase tracking-wide text-[var(--admin-text-muted)]">
                                    Status
                                </th>
                                <th className="px-4 py-2.5 text-right text-[10px] font-medium uppercase tracking-wide text-[var(--admin-text-muted)]">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--admin-border)]">
                            {isLoading ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-4 py-8 text-center text-xs text-[var(--admin-text-muted)]"
                                    >
                                        Loading...
                                    </td>
                                </tr>
                            ) : !filtered || filtered.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-4 py-8 text-center text-xs text-[var(--admin-text-muted)]"
                                    >
                                        No ingredients found.
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
                                            className="admin-table-row transition-colors"
                                        >
                                            <td className="px-4 py-2.5 text-[12px] font-medium text-[var(--admin-text)]">
                                                {ing.name}
                                            </td>
                                            <td className="px-4 py-2.5 font-mono text-[11px] text-[var(--admin-text-secondary)]">
                                                {ing.unit}
                                            </td>
                                            <td className="px-4 py-2.5 text-right font-mono text-[12px] text-[var(--admin-text)]">
                                                {parseFloat(
                                                    ing.stockQuantity,
                                                ).toFixed(1)}
                                            </td>
                                            <td className="px-4 py-2.5 text-right font-mono text-[11px] text-[var(--admin-text-muted)]">
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
                                            <td className="px-4 py-2.5 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        render={
                                                            <Button
                                                                variant="ghost"
                                                                size="icon-xs"
                                                                className="text-[var(--admin-text-muted)]"
                                                            />
                                                        }
                                                    >
                                                        <SlidersHorizontal className="size-3.5" />
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent
                                                        align="end"
                                                        className="border-[var(--admin-border)] bg-[var(--admin-card)]"
                                                    >
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                setAdjustingIngredient(
                                                                    ing,
                                                                )
                                                            }
                                                        >
                                                            <SlidersHorizontal className="mr-2 size-3.5" />
                                                            Adjust Stock
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                setHistoryIngredient(
                                                                    ing,
                                                                )
                                                            }
                                                        >
                                                            <History className="mr-2 size-3.5" />
                                                            View History
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                setDeletingIngredient(
                                                                    ing,
                                                                )
                                                            }
                                                            className="text-red-600 focus:text-red-600"
                                                        >
                                                            <Trash2 className="mr-2 size-3.5" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Dialogs */}
            <StockAdjustDialog
                ingredient={adjustingIngredient}
                open={adjustingIngredient !== null}
                onClose={() => setAdjustingIngredient(null)}
            />
            <StockHistoryDialog
                ingredientId={historyIngredient?.id ?? null}
                ingredientName={historyIngredient?.name ?? null}
                open={historyIngredient !== null}
                onClose={() => setHistoryIngredient(null)}
            />
            <AddIngredientDialog
                open={showAddDialog}
                onClose={() => setShowAddDialog(false)}
            />

            {/* Delete Confirmation */}
            <Dialog
                open={deletingIngredient !== null}
                onOpenChange={(v) =>
                    !v &&
                    !deleteMutation.isPending &&
                    setDeletingIngredient(null)
                }
            >
                <DialogContent className="max-w-sm border-[var(--admin-border)] bg-[var(--admin-card)] shadow-xl">
                    <DialogHeader>
                        <DialogTitle className="text-[14px] font-medium text-[var(--admin-text)]">
                            Delete Ingredient
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-[13px] text-[var(--admin-text-secondary)]">
                        Are you sure you want to delete{" "}
                        <span className="font-medium text-[var(--admin-text)]">
                            {deletingIngredient?.name}
                        </span>
                        ? This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-2 border-t border-[var(--admin-border)] pt-3">
                        <Button
                            variant="ghost"
                            onClick={() => setDeletingIngredient(null)}
                            disabled={deleteMutation.isPending}
                            className="text-[var(--admin-text-secondary)]"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                if (!deletingIngredient) return;
                                const id = deletingIngredient.id;
                                setDeletingIngredient(null);
                                deleteMutation.mutate(id);
                            }}
                            disabled={deleteMutation.isPending}
                            className="bg-red-600 text-white hover:bg-red-700"
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
