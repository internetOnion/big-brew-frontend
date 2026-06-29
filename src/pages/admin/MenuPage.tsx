import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    MagnifyingGlassIcon,
    PlusIcon,
    ForkKnifeIcon,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { useMenuItems } from "@/hooks/useMenuItems";
import { useCategories } from "@/hooks/useCategories";
import { useDeleteMenuItem } from "@/hooks/useDeleteMenuItem";
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

    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");
    const [availabilityFilter, setAvailabilityFilter] = useState<
        "all" | "available" | "unavailable"
    >("all");
    const [deletingItem, setDeletingItem] =
        useState<MenuItemListResponse | null>(null);

    const deleteMutation = useDeleteMenuItem();

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
                <h1 className="text-[13px] font-medium text-(--admin-primary)">
                    Menu Management
                </h1>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate("/admin/menu/categories")}
                        className="h-7 border-(--admin-border) text-[11px] text-(--admin-text-secondary) hover:text-(--admin-text)"
                    >
                        Manage Categories
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => navigate("/admin/menu/new")}
                        className="h-7 gap-1.5 bg-(--admin-primary) text-[11px] text-white hover:bg-[#3a1d0e] cursor-pointer"
                    >
                        <PlusIcon className="size-3" />
                        Add Item
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
                <Select
                    value={categoryFilter}
                    onValueChange={(v) => setCategoryFilter(v ?? "all")}
                >
                    <SelectTrigger className="h-7 w-36 border-(--admin-border) bg-(--admin-card) text-xs">
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

                <div className="flex gap-0.5 rounded-md bg-(--admin-hover) p-0.5">
                    {(["all", "available", "unavailable"] as const).map(
                        (opt) => (
                            <Button
                                key={opt}
                                variant="ghost"
                                size="xs"
                                onClick={() => setAvailabilityFilter(opt)}
                                className={`h-6 px-2 text-xs capitalize ${
                                    availabilityFilter === opt
                                        ? "bg-(--admin-card) font-medium text-(--admin-primary) shadow-sm"
                                        : "text-(--admin-text-muted) hover:text-(--admin-text-secondary)"
                                }`}
                            >
                                {opt}
                            </Button>
                        ),
                    )}
                </div>

                <div className="relative ml-auto">
                    <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-(--admin-text-muted)" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search..."
                        className="h-7 w-48 border-(--admin-border) bg-(--admin-card) pl-8 text-xs placeholder:text-xs"
                    />
                </div>
            </div>

            {/* Grid */}
            {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-48 animate-pulse rounded-lg border border-(--admin-border) bg-(--admin-hover)"
                        />
                    ))}
                </div>
            ) : !filteredItems || filteredItems.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center gap-1.5">
                    <ForkKnifeIcon className="size-5 text-(--admin-text-muted)" />
                    <p className="text-xs text-(--admin-text-muted)">
                        No menu items found
                    </p>
                    <p className="text-[10px] text-(--admin-text-muted)/70">
                        Try adjusting your filters or add a new item
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                    {filteredItems.map((item) => (
                        <MenuItemCard
                            key={item.id}
                            item={item}
                            onEdit={(item) =>
                                navigate(`/admin/menu/${item.id}`)
                            }
                            onDelete={setDeletingItem}
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
                <DialogContent className="max-w-sm border-(--admin-border) bg-(--admin-card) shadow-xl">
                    <DialogHeader>
                        <DialogTitle className="text-[14px] font-medium text-(--admin-text)">
                            Delete Item
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-[13px] text-(--admin-text-secondary)">
                        Are you sure you want to delete{" "}
                        <span className="font-medium text-(--admin-text)">
                            {deletingItem?.name}
                        </span>
                        ? This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-2 border-t border-(--admin-border) pt-3">
                        <Button
                            variant="ghost"
                            onClick={() => setDeletingItem(null)}
                            disabled={deleteMutation.isPending}
                            className="text-(--admin-text-secondary)"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                if (!deletingItem) return;
                                const id = deletingItem.id;
                                setDeletingItem(null);
                                deleteMutation.mutate(id, {
                                    onSuccess: () =>
                                        toast.success("Item deleted"),
                                    onError: () =>
                                        toast.error("Failed to delete item"),
                                });
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

export default MenuPage;
