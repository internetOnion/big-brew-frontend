import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    MagnifyingGlassIcon,
    PlusIcon,
    ForkKnifeIcon,
    ListIcon,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { useMenuItems } from "@/hooks/useMenuItems";
import { useCategories } from "@/hooks/useCategories";
import { useSettings } from "@/hooks/useSettings";
import { useDeleteMenuItem } from "@/hooks/useDeleteMenuItem";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
    const { data: settings } = useSettings();
    const currencySymbol = settings?.currencySymbol ?? "$";

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

    const hasActiveFilters =
        search || categoryFilter !== "all" || availabilityFilter !== "all";

    return (
        <div className="flex flex-col gap-4 p-4 md:p-5">
            {/* Header */}
            <div className="flex items-center justify-between gap-2">
                <h1 className="text-[13px] font-medium text-(--admin-primary)">
                    Menu Management
                </h1>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate("/admin/menu/categories")}
                        aria-label="Manage Categories"
                        className="h-7 gap-1.5 border border-(--admin-border) bg-(--admin-card) text-[11px] text-(--admin-text-secondary) hover:text-(--admin-text)"
                    >
                        <ListIcon className="size-3" />
                        <span className="hidden sm:inline">
                            Manage Categories
                        </span>
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => navigate("/admin/menu/new")}
                        className="h-7 gap-1.5 bg-(--admin-primary) text-[11px] text-white hover:bg-(--admin-primary)/80 cursor-pointer"
                    >
                        <PlusIcon className="size-3" />
                        Add Item
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
                <div className="w-full sm:w-auto">
                    <Select
                        value={categoryFilter}
                        onValueChange={(v) => setCategoryFilter(v ?? "all")}
                    >
                        <SelectTrigger className="h-7 w-full sm:w-36 border-(--admin-border) bg-(--admin-card) text-xs">
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
                </div>

                <div className="flex w-full sm:w-auto gap-0.5 rounded-md bg-(--admin-hover) p-0.5">
                    {(["all", "available", "unavailable"] as const).map(
                        (opt) => (
                            <Button
                                key={opt}
                                variant="ghost"
                                size="xs"
                                onClick={() => setAvailabilityFilter(opt)}
                                className={`h-7 sm:h-6 flex-1 sm:flex-none px-2 text-xs capitalize focus-visible:ring-2 focus-visible:ring-(--admin-primary)/50 ${
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

                <div className="relative w-full sm:w-48 sm:ml-auto">
                    <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-(--admin-text-muted)" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search..."
                        aria-label="Search menu items"
                        className="h-7 w-full border-(--admin-border) bg-(--admin-card) pl-8 text-xs placeholder:text-xs"
                    />
                </div>
            </div>

            {/* Grid */}
            {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <Skeleton
                            key={i}
                            className="h-48 rounded-lg border border-(--admin-border) bg-(--admin-hover)"
                        />
                    ))}
                </div>
            ) : !items || items.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-10">
                    <ForkKnifeIcon
                        className="size-6 text-(--admin-text-muted)"
                        aria-hidden="true"
                    />
                    <div className="text-center">
                        <p className="text-xs text-(--admin-text-muted)">
                            No menu items yet
                        </p>
                        <p className="text-[10px] text-(--admin-text-muted)/70 mt-0.5">
                            Add your first menu item to get started
                        </p>
                    </div>
                    <Button
                        size="sm"
                        onClick={() => navigate("/admin/menu/new")}
                        className="h-7 gap-1.5 bg-(--admin-primary) text-[11px] text-white hover:bg-(--admin-primary)/80"
                    >
                        <PlusIcon className="size-3" />
                        Add Menu Item
                    </Button>
                </div>
            ) : !filteredItems || filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-1.5 py-10">
                    <ForkKnifeIcon
                        className="size-5 text-(--admin-text-muted)"
                        aria-hidden="true"
                    />
                    <p className="text-xs text-(--admin-text-muted)">
                        No items match your filters
                    </p>
                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setSearch("");
                                setCategoryFilter("all");
                                setAvailabilityFilter("all");
                            }}
                            className="h-7 text-[11px] text-(--admin-accent) hover:text-(--admin-accent)/80"
                        >
                            Clear all filters
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
                    {filteredItems.map((item) => (
                        <MenuItemCard
                            key={item.id}
                            item={item}
                            onEdit={(item) =>
                                navigate(`/admin/menu/${item.id}`)
                            }
                            onDelete={setDeletingItem}
                            currencySymbol={currencySymbol}
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
                            Delete
                            {deletingItem ? `: ${deletingItem.name}` : " Item"}
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
                                deleteMutation.mutate(deletingItem.id, {
                                    onSuccess: () => {
                                        toast.success("Item deleted");
                                        setDeletingItem(null);
                                    },
                                    onError: () => {
                                        toast.error("Failed to delete item");
                                    },
                                });
                            }}
                            disabled={deleteMutation.isPending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
