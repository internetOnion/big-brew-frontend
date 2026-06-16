import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeftIcon,
    PlusIcon,
    PencilSimpleIcon,
    TrashIcon,
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

    const handleAdd = () => {
        if (!newName.trim()) return;
        createMutation.mutate(
            { name: newName.trim() },
            {
                onSuccess: () => {
                    setNewName("");
                    setIsAdding(false);
                },
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
                        className="h-7 gap-1.5 bg-(--admin-primary) text-[11px] text-white hover:bg-[#3a1d0e]"
                    >
                        <PlusIcon className="size-3" />
                        Add Category
                    </Button>
                </div>
            </div>

            {/* List */}
            <div className="rounded-lg border border-(--admin-border) bg-(--admin-card)">
                {isLoading ? (
                    <div className="flex h-24 items-center justify-center text-xs text-(--admin-text-muted)">
                        Loading...
                    </div>
                ) : !categories || categories.length === 0 ? (
                    <div className="flex h-24 items-center justify-center text-xs text-(--admin-text-muted)">
                        No categories yet. Add one to get started.
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
                                    className="h-7 bg-(--admin-primary) text-[11px] text-white hover:bg-[#3a1d0e]"
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
                                                className="h-7 bg-(--admin-primary) text-[11px] text-white hover:bg-[#3a1d0e]"
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
                                                onClick={() =>
                                                    deleteMutation.mutate(
                                                        cat.id,
                                                    )
                                                }
                                                disabled={
                                                    !isEmpty ||
                                                    deleteMutation.isPending
                                                }
                                                className={
                                                    isEmpty
                                                        ? "text-red-500 hover:text-red-700"
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
        </div>
    );
};

export default CategoriesPage;
