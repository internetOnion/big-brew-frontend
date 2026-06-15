import { useState } from "react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import { ingredientKeys } from "@/lib/query-keys";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface AddIngredientDialogProps {
    open: boolean;
    onClose: () => void;
}

const AddIngredientDialog = ({ open, onClose }: AddIngredientDialogProps) => {
    const queryClient = useQueryClient();
    const [name, setName] = useState("");
    const [unit, setUnit] = useState("g");
    const [stockQuantity, setStockQuantity] = useState("0");
    const [lowStockThreshold, setLowStockThreshold] = useState("0");

    const createMutation = useMutation({
        mutationFn: async () => {
            const { data } = await api.post(ENDPOINTS.INGREDIENTS.BASE, {
                name,
                unit,
                stockQuantity: parseFloat(stockQuantity),
                lowStockThreshold: parseFloat(lowStockThreshold),
            });
            return data;
        },
        onSuccess: () => {
            toast.success("Ingredient created");
            queryClient.invalidateQueries({
                queryKey: ingredientKeys.all,
            });
            setName("");
            setUnit("g");
            setStockQuantity("0");
            setLowStockThreshold("0");
            onClose();
        },
        onError: () => toast.error("Failed to create ingredient"),
    });

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-sm border-[var(--admin-border)] bg-[var(--admin-card)]">
                <DialogHeader>
                    <DialogTitle className="text-[var(--admin-text)]">
                        Add Ingredient
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="grid gap-1.5">
                        <Label className="text-[11px] text-[var(--admin-text-secondary)]">
                            Name
                        </Label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="h-8 border-[var(--admin-border)] bg-[var(--admin-card)] text-xs"
                        />
                    </div>

                    <div className="grid gap-1.5">
                        <Label className="text-[11px] text-[var(--admin-text-secondary)]">
                            Unit
                        </Label>
                        <Select
                            value={unit}
                            onValueChange={(v) => setUnit(v ?? "g")}
                        >
                            <SelectTrigger className="h-8 border-[var(--admin-border)] bg-[var(--admin-card)] text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="g">Grams (g)</SelectItem>
                                <SelectItem value="ml">
                                    Milliliters (ml)
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-1.5">
                            <Label className="text-[11px] text-[var(--admin-text-secondary)]">
                                Initial Stock
                            </Label>
                            <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={stockQuantity}
                                onChange={(e) =>
                                    setStockQuantity(e.target.value)
                                }
                                className="h-8 border-[var(--admin-border)] bg-[var(--admin-card)] font-mono text-xs"
                            />
                        </div>
                        <div className="grid gap-1.5">
                            <Label className="text-[11px] text-[var(--admin-text-secondary)]">
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
                                className="h-8 border-[var(--admin-border)] bg-[var(--admin-card)] font-mono text-xs"
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="text-[var(--admin-text-secondary)]"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => createMutation.mutate()}
                        disabled={!name || createMutation.isPending}
                        className="bg-[var(--admin-primary)] text-white hover:bg-[#3a1d0e]"
                    >
                        {createMutation.isPending
                            ? "Creating..."
                            : "Create Ingredient"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AddIngredientDialog;
