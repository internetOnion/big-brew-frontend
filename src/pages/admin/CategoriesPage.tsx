import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
    ArrowLeftIcon,
    PlusIcon,
    PencilSimpleIcon,
    TrashIcon,
    ListIcon,
} from "@phosphor-icons/react";
import {
    useCategories,
    useCreateCategory,
    useUpdateCategory,
    useDeleteCategory,
} from "@/hooks/useCategories";
import { useMenuItems } from "@/hooks/useMenuItems";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

const CategoriesPage = () => {
    const navigate = useNavigate();
    const { data: categories, isLoading } = useCategories();
    const { data: items } = useMenuItems();
    const createMutation = useCreateCategory();
    const updateMutation = useUpdateCategory();
    const deleteMutation = useDeleteCategory();

    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleAdd = () => {
        if (!newName.trim()) return;
        createMutation.mutate(
            { name: newName.trim() },
            {
                onSuccess: () => {
                    setNewName("");
                    setIsAdding(false);
                },
                onError: () => toast.error("Failed to create category"),
            },
        );
    };

    const handleEdit = (id: string) => {
        const cat = categories?.find((c) => c.id === id);
        if (!cat) return;
        setEditingId(id);
        setEditName(cat.name);
    };

    const handleSaveEdit = () => {
        if (!editingId || !editName.trim()) return;
        updateMutation.mutate(
            { id: editingId, name: editName.trim() },
            {
                onSuccess: () => {
                    setEditingId(null);
                    setEditName("");
                },
                onError: () => toast.error("Failed to update category"),
            },
        );
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditName("");
    };

    const getItemCount = (categoryId: string): number => {
        return (items ?? []).filter((item) => item.category.id === categoryId)
            .length;
    };

    return (
        <div className="flex flex-col gap-5 p-5">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => navigate("/admin/menu")}
                    aria-label="Back to menu"
                    className="text-(--admin-text-muted) hover:text-(--admin-text)"
                >
                    <ArrowLeftIcon className="size-4" />
                </Button>
                <h1 className="text-[13px] font-medium text-(--admin-primary)">
                    Categories
                </h1>
                <div className="ml-auto">
                    <Button
                        size="sm"
                        onClick={() => {
                            setIsAdding(true);
                            setNewName("");
                        }}
                        disabled={isAdding}
                        className="h-7 max-md:min-h-[44px] gap-1.5 bg-(--admin-primary) text-[11px] text-white hover:bg-(--admin-primary)/80"
                    >
                        <PlusIcon className="size-3" />
                        Add Category
                    </Button>
                </div>
            </div>

            {/* List */}
            <div className="rounded-lg border border-(--admin-border) bg-(--admin-card)">
                {isLoading ? (
                    <div className="divide-y divide-(--admin-border)">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-2 px-4 py-2.5"
                            >
                                <Skeleton className="h-4 flex-1 bg-(--admin-hover)" />
                                <Skeleton className="h-4 w-12 bg-(--admin-hover)" />
                            </div>
                        ))}
                    </div>
                ) : !categories || categories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-8">
                        <ListIcon
                            className="size-5 text-(--admin-text-muted)"
                            aria-hidden="true"
                        />
                        <p className="text-xs text-(--admin-text-muted)">
                            No categories yet
                        </p>
                        <p className="text-[10px] text-(--admin-text-muted)/70">
                            Add a category to organize your menu items
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-(--admin-border)">
                        {/* Add row */}
                        {isAdding && (
                            <div className="flex items-center gap-2 px-4 py-2.5">
                                <Input
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleAdd();
                                        if (e.key === "Escape") {
                                            setIsAdding(false);
                                            setNewName("");
                                        }
                                    }}
                                    placeholder="Category name..."
                                    autoFocus
                                    className="h-8 flex-1 border-(--admin-border) bg-(--admin-card) text-xs placeholder:text-(--admin-text-muted)"
                                />
                                <Button
                                    size="sm"
                                    onClick={handleAdd}
                                    disabled={
                                        !newName.trim() ||
                                        createMutation.isPending
                                    }
                                    className="h-7 bg-(--admin-primary) text-[11px] text-white hover:bg-(--admin-primary)/80"
                                >
                                    Save
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setIsAdding(false);
                                        setNewName("");
                                    }}
                                    className="h-7 text-[11px] text-(--admin-text-secondary)"
                                >
                                    Cancel
                                </Button>
                            </div>
                        )}

                        {categories.map((cat) => {
                            const itemCount = getItemCount(cat.id);
                            const isEmpty = itemCount === 0;
                            const isEditing = editingId === cat.id;

                            return (
                                <div
                                    key={cat.id}
                                    className="flex items-center gap-2 px-4 py-2.5"
                                >
                                    {isEditing ? (
                                        <>
                                            <Input
                                                value={editName}
                                                onChange={(e) =>
                                                    setEditName(e.target.value)
                                                }
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter")
                                                        handleSaveEdit();
                                                    if (e.key === "Escape")
                                                        handleCancelEdit();
                                                }}
                                                autoFocus
                                                className="h-8 flex-1 border-(--admin-border) bg-(--admin-card) text-xs"
                                            />
                                            <Button
                                                size="sm"
                                                onClick={handleSaveEdit}
                                                disabled={
                                                    !editName.trim() ||
                                                    updateMutation.isPending
                                                }
                                                className="h-7 bg-(--admin-primary) text-[11px] text-white hover:bg-(--admin-primary)/80"
                                            >
                                                Save
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleCancelEdit}
                                                className="h-7 text-[11px] text-(--admin-text-secondary)"
                                            >
                                                Cancel
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <span className="flex-1 text-[12px] font-medium text-(--admin-text)">
                                                {cat.name}
                                            </span>
                                            {!isEmpty && (
                                                <span className="text-[10px] text-(--admin-text-muted)">
                                                    {itemCount} item
                                                    {itemCount !== 1 ? "s" : ""}
                                                </span>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon-xs"
                                                aria-label="Edit category"
                                                onClick={() =>
                                                    handleEdit(cat.id)
                                                }
                                                className="text-(--admin-text-muted) hover:text-(--admin-text)"
                                            >
                                                <PencilSimpleIcon className="size-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon-xs"
                                                aria-label="Delete category"
                                                onClick={() =>
                                                    setDeletingId(cat.id)
                                                }
                                                disabled={
                                                    !isEmpty ||
                                                    deleteMutation.isPending
                                                }
                                                className={
                                                    isEmpty
                                                        ? "text-destructive hover:text-destructive/80"
                                                        : "text-(--admin-text-muted)/30"
                                                }
                                            >
                                                <TrashIcon className="size-3.5" />
                                            </Button>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <Dialog
                open={deletingId !== null}
                onOpenChange={(v) => !v && setDeletingId(null)}
            >
                <DialogContent className="max-w-sm border-(--admin-border) bg-(--admin-card)">
                    <DialogHeader>
                        <DialogTitle className="text-(--admin-text)">
                            Delete Category
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-xs text-(--admin-text-secondary)">
                        Are you sure you want to delete{" "}
                        <span className="font-medium text-(--admin-text)">
                            {categories?.find((c) => c.id === deletingId)
                                ?.name ?? ""}
                        </span>
                        ?
                    </p>
                    <DialogFooter>
                        <Button
                            variant="ghost"
                            onClick={() => setDeletingId(null)}
                            className="text-(--admin-text-secondary)"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                if (deletingId) {
                                    deleteMutation.mutate(deletingId, {
                                        onSuccess: () => setDeletingId(null),
                                        onError: () => {
                                            toast.error(
                                                "Failed to delete category",
                                            );
                                            setDeletingId(null);
                                        },
                                    });
                                }
                            }}
                            disabled={deleteMutation.isPending}
                            variant="destructive"
                        >
                            {deleteMutation.isPending
                                ? "Deleting..."
                                : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default CategoriesPage;
