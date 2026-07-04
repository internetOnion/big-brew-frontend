import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeftIcon, TrashIcon } from "@phosphor-icons/react";
import { format } from "date-fns";
import { useIngredients, useAdjustStock } from "@/hooks/useInventory";
import { useUpdateIngredient } from "@/hooks/useUpdateIngredient";
import { useDeleteIngredient } from "@/hooks/useDeleteIngredient";
import { useStockMovements } from "@/hooks/useStockMovements";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const reasonLabels: Record<string, string> = {
    order_placed: "Order",
    order_voided: "Void",
    manual_restock: "Restock",
    manual_deduction: "Deduction",
    manual_adjustment: "Adjustment",
};

const IngredientDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: ingredients, isLoading } = useIngredients();
    const updateMutation = useUpdateIngredient();
    const adjustMutation = useAdjustStock();
    const deleteMutation = useDeleteIngredient();
    const { data: movements, isLoading: historyLoading } = useStockMovements(
        id ? { ingredientId: id } : undefined,
    );

    const ingredient = ingredients?.find((i) => i.id === id);

    const [name, setName] = useState("");
    const [unit, setUnit] = useState("g");
    const [lowStockThreshold, setLowStockThreshold] = useState("");
    const [showDelete, setShowDelete] = useState(false);

    const [mode, setMode] = useState<"add" | "reduce" | "set">("add");
    const [quantity, setQuantity] = useState("");
    const [adjustNotes, setAdjustNotes] = useState("");

    useEffect(() => {
        if (!ingredient) return;
        setName(ingredient.name);
        setUnit(ingredient.unit);
        setLowStockThreshold(ingredient.lowStockThreshold);
    }, [ingredient]);

    if (!id) {
        navigate("/admin/inventory");
        return null;
    }

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center text-sm text-(--admin-text-muted)">
                Loading...
            </div>
        );
    }

    if (!ingredient) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 py-20">
                <p className="text-sm text-(--admin-text-muted)">
                    Ingredient not found
                </p>
                <Button
                    variant="ghost"
                    onClick={() => navigate("/admin/inventory")}
                    className="text-xs text-(--admin-text-secondary)"
                >
                    Back to Inventory
                </Button>
            </div>
        );
    }

    const currentStock = parseFloat(ingredient.stockQuantity);
    const qtyNum = parseFloat(quantity) || 0;
    let delta: number;
    let backendReason:
        | "manual_restock"
        | "manual_deduction"
        | "manual_adjustment";
    if (mode === "add") {
        delta = qtyNum;
        backendReason = "manual_restock";
    } else if (mode === "reduce") {
        delta = -qtyNum;
        backendReason = "manual_deduction";
    } else {
        delta = qtyNum - currentStock;
        backendReason = "manual_adjustment";
    }
    const newStock = mode === "set" ? qtyNum : currentStock + delta;

    const handleSave = async () => {
        if (!name.trim()) return;
        try {
            await updateMutation.mutateAsync({
                id,
                name: name.trim(),
                unit,
                lowStockThreshold: parseFloat(lowStockThreshold) || 0,
            });
            toast.success("Ingredient updated");
        } catch {
            // error handled by hook
        }
    };

    const handleAdjust = async () => {
        if (!quantity || qtyNum <= 0) return;
        try {
            await adjustMutation.mutateAsync({
                id,
                quantityChange: delta,
                reason: backendReason,
                notes: adjustNotes || undefined,
            });
            toast.success("Stock adjusted");
            setQuantity("");
            setAdjustNotes("");
        } catch {
            toast.error("Failed to adjust stock");
        }
    };

    const handleDelete = () => {
        setShowDelete(false);
        deleteMutation.mutate(id, {
            onSuccess: () => navigate("/admin/inventory"),
        });
    };

    return (
        <div className="flex flex-col gap-5 p-5">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => navigate("/admin/inventory")}
                    className="text-(--admin-text-muted) hover:text-(--admin-text)"
                >
                    <ArrowLeftIcon className="size-4" />
                </Button>
                <h1 className="text-[13px] font-medium text-(--admin-primary)">
                    {ingredient.name}
                </h1>
                <span className="rounded-full border border-(--admin-border) bg-(--admin-hover) px-2 py-0.5 font-mono text-[10px] text-(--admin-text-secondary)">
                    {ingredient.unit}
                </span>
                <div className="ml-auto">
                    {!showDelete ? (
                        <Button
                            variant="outline"
                            size="xs"
                            onClick={() => setShowDelete(true)}
                            className="border-destructive/30 text-[11px] text-destructive hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
                        >
                            <TrashIcon className="size-3" />
                            Delete
                        </Button>
                    ) : (
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] text-destructive">
                                Are you sure?
                            </span>
                            <Button
                                variant="ghost"
                                size="xs"
                                onClick={() => setShowDelete(false)}
                                disabled={deleteMutation.isPending}
                                className="text-[11px] text-(--admin-text-secondary)"
                            >
                                Cancel
                            </Button>
                            <Button
                                size="xs"
                                onClick={handleDelete}
                                disabled={deleteMutation.isPending}
                                className="bg-destructive text-[11px] text-destructive-foreground hover:bg-destructive/90"
                            >
                                {deleteMutation.isPending
                                    ? "Deleting..."
                                    : "Delete"}
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
                {/* Left column: Basic info + Adjust stock */}
                <div className="flex flex-col gap-5">
                    {/* Basic Info */}
                    <div className="rounded-lg border border-(--admin-border) bg-(--admin-card) p-4">
                        <h2 className="mb-3 text-[11px] font-medium uppercase tracking-wide text-(--admin-text-secondary)">
                            Basic Info
                        </h2>
                        <div className="grid gap-1.5">
                            <Label className="text-[11px] text-(--admin-text-secondary)">
                                Name
                            </Label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="h-8 border-(--admin-border) bg-(--admin-card) text-xs"
                            />
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-3">
                            <div className="grid gap-1.5">
                                <Label className="text-[11px] text-(--admin-text-secondary)">
                                    Unit
                                </Label>
                                <Select
                                    value={unit}
                                    onValueChange={(v) => setUnit(v ?? "g")}
                                >
                                    <SelectTrigger className="h-8 border-(--admin-border) bg-(--admin-card) text-xs">
                                        <SelectValue>
                                            {(val) =>
                                                val === "g"
                                                    ? "Grams (g)"
                                                    : "Milliliters (ml)"
                                            }
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="g">
                                            Grams (g)
                                        </SelectItem>
                                        <SelectItem value="ml">
                                            Milliliters (ml)
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-1.5">
                                <Label className="text-[11px] text-(--admin-text-secondary)">
                                    Low Stock Alert
                                </Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={lowStockThreshold}
                                    onChange={(e) =>
                                        setLowStockThreshold(e.target.value)
                                    }
                                    className="h-8 border-(--admin-border) bg-(--admin-card) font-mono text-xs"
                                />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                            <div className="rounded border border-(--admin-border) bg-(--admin-hover) px-3 py-1.5">
                                <span className="text-[10px] text-(--admin-text-muted)">
                                    Current Stock:{" "}
                                </span>
                                <span className="font-mono text-[13px] font-medium text-(--admin-text)">
                                    {currentStock.toFixed(2)} {ingredient.unit}
                                </span>
                            </div>
                            <Button
                                onClick={handleSave}
                                disabled={updateMutation.isPending}
                                className="h-8 bg-(--admin-primary) text-xs text-white hover:bg-(--admin-primary)/80"
                            >
                                {updateMutation.isPending
                                    ? "Saving..."
                                    : "Save Changes"}
                            </Button>
                        </div>
                    </div>

                    {/* Adjust Stock */}
                    <div className="rounded-lg border border-(--admin-border) bg-(--admin-card) p-4">
                        <h2 className="mb-3 text-[11px] font-medium uppercase tracking-wide text-(--admin-text-secondary)">
                            Adjust Stock
                        </h2>
                        <div className="flex flex-col gap-4">
                            <div className="rounded border border-(--admin-border) bg-(--admin-hover) p-3">
                                <span className="text-[11px] text-(--admin-text-muted)">
                                    Current Stock
                                </span>
                                <p className="font-mono text-lg text-(--admin-text)">
                                    {currentStock} {ingredient.unit}
                                </p>
                            </div>

                            <div>
                                <div className="flex overflow-hidden rounded border border-(--admin-border)">
                                    {(
                                        [
                                            {
                                                key: "add" as const,
                                                label: "+ Add",
                                            },
                                            {
                                                key: "reduce" as const,
                                                label: "− Reduce",
                                            },
                                            {
                                                key: "set" as const,
                                                label: "↦ Set to",
                                            },
                                        ] as const
                                    ).map((opt) => (
                                        <button
                                            key={opt.key}
                                            type="button"
                                            onClick={() => {
                                                setMode(opt.key);
                                                setQuantity("");
                                            }}
                                            className={`flex-1 cursor-pointer px-3 py-1.5 text-center text-[11px] font-medium transition-colors ${
                                                mode === opt.key
                                                    ? "bg-(--admin-primary) text-white"
                                                    : "bg-(--admin-card) text-(--admin-text-secondary) hover:bg-(--admin-hover)"
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid gap-1.5">
                                <Label className="text-[11px] text-(--admin-text-secondary)">
                                    {mode === "set"
                                        ? "New Stock Value"
                                        : "Amount to " +
                                          (mode === "add" ? "Add" : "Deduct")}
                                </Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={quantity}
                                    onChange={(e) => {
                                        const v = e.target.value.replace(
                                            "-",
                                            "",
                                        );
                                        setQuantity(v);
                                    }}
                                    className="h-8 border-(--admin-border) bg-(--admin-card) font-mono text-xs"
                                />
                            </div>

                            <div className="grid gap-1.5">
                                <Label className="text-[11px] text-(--admin-text-secondary)">
                                    Notes
                                </Label>
                                <Textarea
                                    value={adjustNotes}
                                    onChange={(e) =>
                                        setAdjustNotes(e.target.value)
                                    }
                                    rows={2}
                                    placeholder="Optional notes..."
                                    className="border-(--admin-border) bg-(--admin-card) text-xs placeholder:text-(--admin-text-muted)"
                                />
                            </div>

                            {quantity && qtyNum > 0 && (
                                <div className="rounded border border-(--admin-border) bg-(--admin-hover) p-3">
                                    {mode === "set" ? (
                                        <div className="flex items-center justify-center gap-6 text-center">
                                            <div className="flex flex-col items-center gap-0.5">
                                                <span className="text-[10px] text-(--admin-text-muted)">
                                                    Current
                                                </span>
                                                <span className="font-mono text-[13px] font-medium text-(--admin-text)">
                                                    {currentStock.toFixed(2)}{" "}
                                                    {ingredient.unit}
                                                </span>
                                            </div>
                                            <span className="text-sm text-(--admin-text-muted)">
                                                →
                                            </span>
                                            <div className="flex flex-col items-center gap-0.5">
                                                <span className="text-[10px] text-(--admin-text-muted)">
                                                    New
                                                </span>
                                                <span
                                                    className={`font-mono text-[13px] font-medium ${newStock < 0 ? "text-destructive" : "text-(--admin-text)"}`}
                                                >
                                                    {newStock.toFixed(2)}{" "}
                                                    {ingredient.unit}
                                                </span>
                                            </div>
                                            <div className="flex flex-col items-center gap-0.5">
                                                <span className="text-[10px] text-(--admin-text-muted)">
                                                    Change
                                                </span>
                                                <span
                                                    className={`font-mono text-[13px] font-medium ${delta > 0 ? "text-(--admin-success)" : delta < 0 ? "text-destructive" : "text-(--admin-text)"}`}
                                                >
                                                    {delta > 0 ? "+" : ""}
                                                    {delta.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between text-center">
                                            <div className="flex flex-col items-center gap-0.5">
                                                <span className="text-[10px] text-(--admin-text-muted)">
                                                    Current
                                                </span>
                                                <span className="font-mono text-[13px] font-medium text-(--admin-text)">
                                                    {currentStock.toFixed(2)}{" "}
                                                    {ingredient.unit}
                                                </span>
                                            </div>
                                            <span className="text-(--admin-text-muted)">
                                                {mode === "add" ? "+" : "−"}
                                            </span>
                                            <div className="flex flex-col items-center gap-0.5">
                                                <span className="text-[10px] text-(--admin-text-muted)">
                                                    Change
                                                </span>
                                                <span
                                                    className={`font-mono text-[13px] font-medium ${delta > 0 ? "text-(--admin-success)" : "text-destructive"}`}
                                                >
                                                    {delta > 0 ? "+" : ""}
                                                    {delta.toFixed(2)}
                                                </span>
                                            </div>
                                            <span className="text-(--admin-text-muted)">
                                                =
                                            </span>
                                            <div className="flex flex-col items-center gap-0.5">
                                                <span className="text-[10px] text-(--admin-text-muted)">
                                                    New
                                                </span>
                                                <span
                                                    className={`font-mono text-[13px] font-medium ${newStock < 0 ? "text-destructive" : "text-(--admin-text)"}`}
                                                >
                                                    {newStock.toFixed(2)}{" "}
                                                    {ingredient.unit}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="mt-4 flex justify-end">
                            <Button
                                onClick={handleAdjust}
                                disabled={
                                    !quantity ||
                                    qtyNum <= 0 ||
                                    adjustMutation.isPending
                                }
                                className="h-8 bg-(--admin-primary) text-xs text-white hover:bg-(--admin-primary)/80"
                            >
                                {adjustMutation.isPending
                                    ? "Adjusting..."
                                    : "Adjust Stock"}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Right column: Stock History */}
                <div>
                    <div className="rounded-lg border border-(--admin-border) bg-(--admin-card) p-4">
                        <h2 className="mb-3 text-[11px] font-medium uppercase tracking-wide text-(--admin-text-secondary)">
                            Stock History
                        </h2>
                        <div className="max-h-[500px] overflow-y-auto">
                            {historyLoading ? (
                                <div className="flex h-32 items-center justify-center text-xs text-(--admin-text-muted)">
                                    Loading...
                                </div>
                            ) : !movements || movements.length === 0 ? (
                                <div className="flex h-32 items-center justify-center text-xs text-(--admin-text-muted)">
                                    No stock movements recorded.
                                </div>
                            ) : (
                                <div className="divide-y divide-(--admin-border)">
                                    {movements.map((m) => {
                                        const qty = parseFloat(
                                            m.quantityChange,
                                        );
                                        const isPositive = qty > 0;

                                        return (
                                            <div
                                                key={m.id}
                                                className="flex items-center justify-between px-1 py-2"
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-[12px] text-(--admin-text)">
                                                        {reasonLabels[
                                                            m.reason
                                                        ] ?? m.reason}
                                                    </p>
                                                    {m.notes && (
                                                        <p className="truncate text-[10px] text-(--admin-text-muted)">
                                                            {m.notes}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span
                                                        className={`font-mono text-[12px] font-medium ${isPositive ? "text-(--admin-success)" : "text-destructive"}`}
                                                    >
                                                        {isPositive ? "+" : ""}
                                                        {qty.toFixed(2)}
                                                    </span>
                                                    <span className="text-[10px] text-(--admin-text-muted)">
                                                        {format(
                                                            new Date(
                                                                m.createdAt,
                                                            ),
                                                            "MMM d, HH:mm",
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IngredientDetailPage;
