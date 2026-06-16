import { PlusIcon, TrashIcon } from "@phosphor-icons/react";
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
import type { InventoryItem } from "@/types/admin";

export type RecipeEntry = {
    id: string;
    ingredientId: string;
    name: string;
    unit: string;
    quantity: string;
};

type RecipeTabProps = {
    entries: RecipeEntry[];
    onRemove: (entry: RecipeEntry) => void;
    selectedIngredientId: string;
    quantity: string;
    onIngredientIdChange: (v: string) => void;
    onQuantityChange: (v: string) => void;
    onAdd: () => void;
    ingredients: InventoryItem[] | undefined;
};

const RecipeTab = ({
    entries,
    onRemove,
    selectedIngredientId,
    quantity,
    onIngredientIdChange,
    onQuantityChange,
    onAdd,
    ingredients,
}: RecipeTabProps) => {
    const selectedUnit = selectedIngredientId
        ? (ingredients?.find((i) => i.id === selectedIngredientId)?.unit ?? "")
        : "";

    return (
        <div className="rounded-lg border border-(--admin-border) bg-(--admin-card) p-4">
            <h2 className="mb-3 text-[11px] font-medium uppercase tracking-wide text-(--admin-text-secondary)">
                Recipe
            </h2>
            <div className="flex flex-col gap-1">
                {entries.length === 0 ? (
                    <p className="text-xs text-(--admin-text-muted)">
                        No recipe ingredients configured.
                    </p>
                ) : (
                    entries.map((r) => (
                        <div
                            key={r.id}
                            className="flex items-center justify-between rounded border border-(--admin-border) bg-(--admin-hover) px-3 py-2"
                        >
                            <span className="text-[12px] text-(--admin-text)">
                                {r.name}
                            </span>
                            <div className="flex items-center gap-3">
                                <span className="font-mono text-[11px] text-(--admin-text-secondary)">
                                    {r.quantity} {r.unit}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="icon-xs"
                                    onClick={() => onRemove(r)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <TrashIcon className="size-3.5" />
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <div className="mt-3 flex items-end gap-2">
                <div className="grid flex-1 gap-1.5">
                    <Label className="text-[11px] text-(--admin-text-secondary)">
                        Ingredient
                    </Label>
                    <Select
                        value={selectedIngredientId}
                        onValueChange={(v) => onIngredientIdChange(v ?? "")}
                    >
                        <SelectTrigger className="h-8 border-(--admin-border) bg-(--admin-card) text-xs w-40">
                            <SelectValue placeholder="Select...">
                                {(val) =>
                                    ingredients?.find((i) => i.id === val)
                                        ?.name ?? "Select..."
                                }
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {ingredients?.map((ing) => (
                                <SelectItem key={ing.id} value={ing.id}>
                                    {ing.name} ({ing.unit})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid w-24 gap-1.5">
                    <Label className="text-[11px] text-(--admin-text-secondary)">
                        Qty
                    </Label>
                    <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={quantity}
                        onChange={(e) => {
                            const v = e.target.value;
                            if (
                                v === "" ||
                                (parseFloat(v) > 0 && !isNaN(parseFloat(v)))
                            ) {
                                onQuantityChange(v);
                            }
                        }}
                        className="h-8 border-(--admin-border) bg-(--admin-card) font-mono text-xs"
                    />
                </div>
                {selectedIngredientId && (
                    <span className="pb-1.5 font-mono text-[12px] font-medium text-(--admin-text-secondary)">
                        {selectedUnit}
                    </span>
                )}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onAdd}
                    className="h-8 border-(--admin-border) text-(--admin-text-secondary)"
                >
                    <PlusIcon className="size-3.5" />
                </Button>
            </div>
        </div>
    );
};

export default RecipeTab;
