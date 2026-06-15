import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MagnifyingGlass, Plus, ForkKnife } from "@phosphor-icons/react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import { useMenuItems } from "@/hooks/useMenuItems";
import { useCategories } from "@/hooks/useCategories";
import { menuItemKeys } from "@/lib/query-keys";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/dialog";
import MenuItemCard from "@/components/admin/menu/MenuItemCard";
import type { MenuItemListResponse } from "@/types/menu";

const MenuPage = () => {
    const navigate = useNavigate();
    const { data: items, isLoading } = useMenuItems();
    const { data: categories } = useCategories();
    const queryClient = useQueryClient();

    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");
    const [availabilityFilter, setAvailabilityFilter] = useState<
        "all" | "available" | "unavailable"
    >("all");
    const [deletingItem, setDeletingItem] =
        useState<MenuItemListResponse | null>(null);

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(ENDPOINTS.MENU.BY_ID(id));
        },
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: menuItemKeys.all });
            const previous = queryClient.getQueryData(menuItemKeys.all);
            queryClient.setQueryData(
                menuItemKeys.all,
                (old: MenuItemListResponse[] | undefined) =>
                    old?.filter((item) => item.id !== id) ?? [],
            );
            setDeletingItem(null);
            return { previous };
        },
        onError: (_err, _id, context) => {
            if (context?.previous) {
                queryClient.setQueryData(menuItemKeys.all, context.previous);
            }
            toast.error("Failed to delete item");
        },
        onSuccess: () => {
            toast.success("Item deleted");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: menuItemKeys.all });
        },
    });

    const filteredItems = items?.filter((item) => {
        if (search && !item.name.toLowerCase().includes(search.toLowerCase()))
            return false;
        if (categoryFilter !== "all" && item.category.id !== categoryFilter)
            return false;
        if (availabilityFilter === "available" && item.isAvailable === false)
            return false;
        if (availabilityFilter === "unavailable" && item.isAvailable !== false)
            return false;
        return true;
    });

    return (
        <div className="flex flex-col gap-4 p-5">
            <div className="flex items-center justify-between">
                <h1 className="text-[13px] font-medium text-[var(--admin-primary)]">
                    Menu Management
                </h1>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate("/admin/menu/categories")}
                        className="h-7 border-[var(--admin-border)] text-[11px] text-[var(--admin-text-secondary)] hover:text-[var(--admin-text)]"
                    >
                        Manage Categories
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => navigate("/admin/menu/new")}
                        className="h-7 gap-1.5 bg-[var(--admin-primary)] text-[11px] text-white hover:bg-[#3a1d0e]"
                    >
                        <Plus className="size-3" />
                        Add Item
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                    <MagnifyingGlass className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[var(--admin-text-muted)]" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search items..."
                        className="h-8 w-48 border-[var(--admin-border)] bg-[var(--admin-card)] pl-8 text-xs placeholder:text-[var(--admin-text-muted)]"
                    />
                </div>

                <Select
                    value={categoryFilter}
                    onValueChange={(v) => setCategoryFilter(v ?? "all")}
                >
                    <SelectTrigger className="h-8 w-36 border-[var(--admin-border)] bg-[var(--admin-card)] text-xs">
                        <SelectValue placeholder="Category">
                            {(val) =>
                                val === "all"
                                    ? "All Categories"
                                    : (categories?.find((c) => c.id === val)
                                          ?.name ?? "Category")
                            }
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories?.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <div className="flex gap-0.5 rounded-md bg-[var(--admin-hover)] p-0.5">
                    {(["all", "available", "unavailable"] as const).map(
                        (opt) => (
                            <Button
                                key={opt}
                                variant="ghost"
                                size="xs"
                                onClick={() => setAvailabilityFilter(opt)}
                                className={`h-6 px-2 text-[11px] capitalize ${
                                    availabilityFilter === opt
                                        ? "bg-[var(--admin-card)] font-medium text-[var(--admin-primary)] shadow-sm"
                                        : "text-[var(--admin-text-muted)] hover:text-[var(--admin-text-secondary)]"
                                }`}
                            >
                                {opt}
                            </Button>
                        ),
                    )}
                </div>
            </div>

            {/* Grid */}
            {isLoading ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-48 animate-pulse rounded-lg border border-[var(--admin-border)] bg-[var(--admin-hover)]"
                        />
                    ))}
                </div>
            ) : !filteredItems || filteredItems.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center gap-1.5">
                    <ForkKnife className="size-5 text-[var(--admin-text-muted)]" />
                    <p className="text-xs text-[var(--admin-text-muted)]">
                        No menu items found
                    </p>
                    <p className="text-[10px] text-[var(--admin-text-muted)]/70">
                        Try adjusting your filters or add a new item
                    </p>
                </div>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredItems.map((item) => (
                        <MenuItemCard
                            key={item.id}
                            item={item}
                            onEdit={(item) =>
                                navigate(`/admin/menu/${item.id}`)
                            }
                            onDelete={setDeletingItem}
                            isDeleting={
                                deleteMutation.isPending &&
                                deletingItem?.id === item.id
                            }
                        />
                    ))}
                </div>
            )}

            {/* Delete Confirmation */}
            <Dialog
                open={deletingItem !== null}
                onOpenChange={(v) =>
                    !v && !deleteMutation.isPending && setDeletingItem(null)
                }
            >
                <DialogContent className="max-w-sm border-[var(--admin-border)] bg-[var(--admin-card)] shadow-xl">
                    <DialogHeader>
                        <DialogTitle className="text-[14px] font-medium text-[var(--admin-text)]">
                            Delete Item
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-[13px] text-[var(--admin-text-secondary)]">
                        Are you sure you want to delete{" "}
                        <span className="font-medium text-[var(--admin-text)]">
                            {deletingItem?.name}
                        </span>
                        ? This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-2 border-t border-[var(--admin-border)] pt-3">
                        <Button
                            variant="ghost"
                            onClick={() => setDeletingItem(null)}
                            disabled={deleteMutation.isPending}
                            className="text-[var(--admin-text-secondary)]"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() =>
                                deletingItem &&
                                deleteMutation.mutate(deletingItem.id)
                            }
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

export default MenuPage;
