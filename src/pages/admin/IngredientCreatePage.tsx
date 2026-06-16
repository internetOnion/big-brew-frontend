import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import { ingredientKeys } from "@/lib/query-keys";
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

const IngredientCreatePage = () => {
    const navigate = useNavigate();
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
            navigate("/admin/inventory");
        },
        onError: () => toast.error("Failed to create ingredient"),
    });

    return (
        <div className="flex flex-col gap-5 p-5">
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
                    Add Ingredient
                </h1>
            </div>

            <div className="max-w-md rounded-lg border border-(--admin-border) bg-(--admin-card) p-4">
                <h2 className="mb-3 text-[11px] font-medium uppercase tracking-wide text-(--admin-text-secondary)">
                    Ingredient Info
                </h2>

                <div className="space-y-4">
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
                                <SelectItem value="g">Grams (g)</SelectItem>
                                <SelectItem value="ml">
                                    Milliliters (ml)
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-1.5">
                            <Label className="text-[11px] text-(--admin-text-secondary)">
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
                                className="h-8 border-(--admin-border) bg-(--admin-card) font-mono text-xs"
                            />
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
                </div>

                <div className="mt-5 flex justify-end gap-2 border-t border-(--admin-border) pt-3">
                    <Button
                        variant="ghost"
                        onClick={() => navigate("/admin/inventory")}
                        className="text-(--admin-text-secondary)"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => createMutation.mutate()}
                        disabled={!name.trim() || createMutation.isPending}
                        className="bg-(--admin-primary) text-white hover:bg-[#3a1d0e]"
                    >
                        {createMutation.isPending
                            ? "Creating..."
                            : "Create Ingredient"}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default IngredientCreatePage;
