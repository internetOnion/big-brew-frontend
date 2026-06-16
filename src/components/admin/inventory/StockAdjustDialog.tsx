import { useState } from "react";
import { toast } from "sonner";
import { useAdjustStock } from "@/hooks/useInventory";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
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
import type { InventoryItem } from "@/types/admin";

interface StockAdjustDialogProps {
    ingredient: InventoryItem | null;
    open: boolean;
    onClose: () => void;
}

const reasonOptions = [
    { value: "manual_restock", label: "Restock" },
    { value: "manual_deduction", label: "Deduction" },
    { value: "manual_adjustment", label: "Adjustment" },
];

const StockAdjustDialog = ({
    ingredient,
    open,
    onClose,
}: StockAdjustDialogProps) => {
    const adjustMutation = useAdjustStock();
    const [reason, setReason] = useState<string>("manual_restock");
    const [quantity, setQuantity] = useState("");
    const [notes, setNotes] = useState("");

    const currentStock = ingredient ? parseFloat(ingredient.stockQuantity) : 0;
    const qtyNum = parseFloat(quantity) || 0;
    const absQty = Math.abs(qtyNum);
    let delta: number;
    if (reason === "manual_restock") {
        delta = absQty;
    } else if (reason === "manual_deduction") {
        delta = -absQty;
    } else {
        delta = quantity.startsWith("-") ? -absQty : absQty;
    }
    const newStock = currentStock + delta;

    const handleSubmit = async () => {
        if (!ingredient || !quantity || qtyNum <= 0) return;
        try {
            await adjustMutation.mutateAsync({
                id: ingredient.id,
                quantityChange: delta,
                reason: reason as
                    | "manual_restock"
                    | "manual_deduction"
                    | "manual_adjustment",
                notes: notes || undefined,
            });
            toast.success("Stock adjusted");
            setQuantity("");
            setNotes("");
            onClose();
        } catch {
            toast.error("Failed to adjust stock");
        }
    };

    if (!ingredient) return null;

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-sm border-(--admin-border) bg-(--admin-card)">
                <DialogHeader>
                    <DialogTitle className="text-(--admin-text)">
                        Adjust Stock: {ingredient.name}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="rounded border border-(--admin-border) bg-(--admin-hover) p-3">
                        <span className="text-[11px] text-(--admin-text-muted)">
                            Current Stock
                        </span>
                        <p className="font-mono text-lg text-(--admin-text)">
                            {currentStock} {ingredient.unit}
                        </p>
                    </div>

                    <div className="grid gap-1.5">
                        <Label className="text-[11px] text-(--admin-text-secondary)">
                            Reason
                        </Label>
                        <Select
                            value={reason}
                            onValueChange={(v) =>
                                setReason(v ?? "manual_restock")
                            }
                        >
                            <SelectTrigger className="h-8 border-(--admin-border) bg-(--admin-card) text-xs">
                                <SelectValue>
                                    {(val) =>
                                        reasonOptions.find(
                                            (r) => r.value === val,
                                        )?.label ?? "Reason"
                                    }
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {reasonOptions.map((opt) => (
                                    <SelectItem
                                        key={opt.value}
                                        value={opt.value}
                                    >
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-1.5">
                        <Label className="text-[11px] text-(--admin-text-secondary)">
                            Quantity
                        </Label>
                        <Input
                            type="number"
                            step="0.01"
                            min={
                                reason === "manual_adjustment" ? undefined : "0"
                            }
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            className="h-8 border-(--admin-border) bg-(--admin-card) font-mono text-xs"
                        />
                    </div>

                    <div className="grid gap-1.5">
                        <Label className="text-[11px] text-(--admin-text-secondary)">
                            Notes
                        </Label>
                        <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={2}
                            placeholder="Optional notes..."
                            className="border-(--admin-border) bg-(--admin-card) text-xs placeholder:text-(--admin-text-muted)"
                        />
                    </div>

                    {quantity && qtyNum > 0 && (
                        <div className="rounded border border-(--admin-border) p-2 text-center">
                            <span className="text-[11px] text-(--admin-text-muted)">
                                New stock:{" "}
                            </span>
                            <span
                                className={`font-mono text-sm font-medium ${newStock < 0 ? "text-red-500" : "text-(--admin-text)"}`}
                            >
                                {newStock.toFixed(2)} {ingredient.unit}
                            </span>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="text-(--admin-text-secondary)"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={
                            !quantity || qtyNum <= 0 || adjustMutation.isPending
                        }
                        className="bg-(--admin-primary) text-white hover:bg-[#3a1d0e]"
                    >
                        {adjustMutation.isPending
                            ? "Adjusting..."
                            : "Adjust Stock"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default StockAdjustDialog;
