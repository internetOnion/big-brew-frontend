import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeftIcon,
    PlusIcon,
    PencilSimpleIcon,
    TrashIcon,
    TagIcon,
} from "@phosphor-icons/react";
import {
    useExpenseCategories,
    useCreateExpenseCategory,
    useUpdateExpenseCategory,
    useDeleteExpenseCategory,
} from "@/hooks/useExpenseCategories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

const ExpenseCategoriesPage = () => {
    const navigate = useNavigate();
    const { data: categories, isLoading } = useExpenseCategories();
    const createMutation = useCreateExpenseCategory();
    const updateMutation = useUpdateExpenseCategory();
    const deleteMutation = useDeleteExpenseCategory();

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

    return (
        <div className="flex flex-col gap-5 p-5">
            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => navigate("/admin/expenses")}
                    className="text-(--admin-text-muted) hover:text-(--admin-text)"
                >
                    <ArrowLeftIcon className="size-4" />
                </Button>
                <h1 className="text-[13px] font-medium text-(--admin-primary)">
                    Expense Categories
                </h1>
                <div className="ml-auto">
                    <Button
                        size="sm"
                        onClick={() => {
                            setIsAdding(true);
                            setNewName("");
                        }}
                        disabled={isAdding}
                        className="h-7 gap-1.5 bg-(--admin-primary) text-[11px] text-white hover:bg-(--admin-primary)/80"
                    >
                        <PlusIcon className="size-3" />
                        Add Category
                    </Button>
                </div>
            </div>

            <div className="rounded-lg border border-(--admin-border) bg-(--admin-card)">
                {isLoading ? (
                    <div className="flex h-24 items-center justify-center text-xs text-(--admin-text-muted)">
                        Loading...
                    </div>
                ) : !categories || categories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-8">
                        <TagIcon
                            className="size-5 text-(--admin-text-muted)"
                            aria-hidden="true"
                        />
                        <p className="text-xs text-(--admin-text-muted)">
                            No expense categories yet
                        </p>
                        <p className="text-[10px] text-(--admin-text-muted)/70">
                            Add categories to organize your expenses
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-(--admin-border)">
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
                                                    setDeletingId(cat.id)
                                                }
                                                className="text-destructive hover:text-destructive/80"
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
                                    deleteMutation.mutate(deletingId);
                                    setDeletingId(null);
                                }
                            }}
                            disabled={deleteMutation.isPending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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

export default ExpenseCategoriesPage;
