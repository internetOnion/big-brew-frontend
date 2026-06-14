import { useState, useMemo } from "react";
import {
    type MenuItem,
    type ModifierGroup,
    getCategoryIconName,
    findModifierGroup,
} from "@/types/menu";
import type { CustomizeOptions } from "@/types/cart";
import { getCategoryIcon } from "@/lib/category-icons";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { QuantityStepper } from "@/components/common/QuantityStepper";
import { SizeSelector } from "./SizeSelector";
import { SugarLevelSelector } from "./SugarLevelSelector";
import { ToppingsPicker } from "./ToppingsPicker";
import { ModifierGroupSelector } from "./ModifierGroupSelector";
import { ItemNoteInput } from "./ItemNoteInput";

interface CustomizeModalProps {
    item: MenuItem;
    initialOptions?: CustomizeOptions;
    onClose: () => void;
    onAdd: (item: MenuItem, options: CustomizeOptions) => void;
}

const EMPTY_TOPPINGS: {
    name: string;
    qty: number;
    price: number;
    modifierOptionId: string;
}[] = [];

const getSizeGroup = (item: MenuItem): ModifierGroup | undefined =>
    findModifierGroup(item.modifierGroups, /size/i);

const getSugarGroup = (item: MenuItem): ModifierGroup | undefined =>
    findModifierGroup(item.modifierGroups, /sugar/i);

const getToppingsGroup = (item: MenuItem): ModifierGroup | undefined =>
    findModifierGroup(item.modifierGroups, /topping/i);

export const CustomizeModal = ({
    item,
    initialOptions,
    onClose,
    onAdd,
}: CustomizeModalProps) => {
    const sizeGroup = getSizeGroup(item);
    const sugarGroup = getSugarGroup(item);
    const toppingsGroup = getToppingsGroup(item);

    const sizeOptions = sizeGroup?.options ?? [];
    const sugarOptions = sugarGroup?.options ?? [];
    const toppingOptions = toppingsGroup?.options ?? [];

    const defaultSize = sizeOptions[0]?.name ?? "";
    const defaultSizeId = sizeOptions[0]?.id ?? "";
    const defaultSugar = sugarOptions[2]?.name ?? sugarOptions[0]?.name ?? "";
    const defaultSugarId = sugarOptions[2]?.id ?? sugarOptions[0]?.id ?? "";

    const [size, setSize] = useState<string>(
        initialOptions?.size || defaultSize,
    );
    const [sizeOptionId, setSizeOptionId] = useState<string>(
        initialOptions?.sizeOptionId || defaultSizeId,
    );
    const [toppings, setToppings] = useState<
        { name: string; qty: number; price: number; modifierOptionId: string }[]
    >(
        initialOptions?.toppings?.map((t) => ({
            ...t,
            modifierOptionId: t.modifierOptionId || "",
        })) ?? EMPTY_TOPPINGS,
    );
    const [sugarLevel, setSugarLevel] = useState<string>(
        initialOptions?.sugarLevel || defaultSugar,
    );
    const [sugarOptionId, setSugarOptionId] = useState<string>(
        initialOptions?.sugarOptionId || defaultSugarId,
    );
    const [quantity, setQuantity] = useState(initialOptions?.quantity || 1);
    const [note, setNote] = useState(initialOptions?.note || "");
    const [selectedModifiers, setSelectedModifiers] = useState<
        Record<string, string[]>
    >(initialOptions?.modifiers ?? {});

    const otherGroups =
        item.modifierGroups?.filter(
            (g) =>
                !/size/i.test(g.name) &&
                !/sugar/i.test(g.name) &&
                !/topping/i.test(g.name),
        ) ?? [];

    const otherModifiersPrice = useMemo(() => {
        let total = 0;
        for (const group of otherGroups) {
            const selected = selectedModifiers[group.id] ?? [];
            for (const optId of selected) {
                const opt = group.options.find((o) => o.id === optId);
                if (opt) total += opt.price;
            }
        }
        return total;
    }, [otherGroups, selectedModifiers]);

    const finalPrice = useMemo(() => {
        let price = item.basePrice;
        if (item.hasSizes && size) {
            const sizeOpt = sizeOptions.find((s) => s.name === size);
            if (sizeOpt) price += sizeOpt.price;
        }
        const toppingsTotal = toppings.reduce(
            (sum, t) => sum + t.price * t.qty,
            0,
        );
        price += toppingsTotal + otherModifiersPrice;
        return price * quantity;
    }, [item, size, sizeOptions, toppings, otherModifiersPrice, quantity]);

    const unitPrice = useMemo(() => {
        let price = item.basePrice;
        if (item.hasSizes && size) {
            const sizeOpt = sizeOptions.find((s) => s.name === size);
            if (sizeOpt) price += sizeOpt.price;
        }
        const toppingsTotal = toppings.reduce(
            (sum, t) => sum + t.price * t.qty,
            0,
        );
        return price + toppingsTotal + otherModifiersPrice;
    }, [item, size, sizeOptions, toppings, otherModifiersPrice]);

    const updateTopping = (
        name: string,
        price: number,
        delta: number,
        modifierOptionId: string,
    ) => {
        setToppings((prev) => {
            const existing = prev.find((t) => t.name === name);
            if (!existing) {
                if (delta > 0) {
                    return [
                        ...prev,
                        { name, qty: delta, price, modifierOptionId },
                    ];
                }
                return prev;
            }
            const nextQty = existing.qty + delta;
            if (nextQty <= 0) {
                return prev.filter((t) => t.name !== name);
            }
            return prev.map((t) =>
                t.name === name ? { ...t, qty: nextQty } : t,
            );
        });
    };

    const toggleModifier = (groupId: string, optId: string) => {
        setSelectedModifiers((prev) => {
            const current = prev[groupId] ?? [];
            const group = otherGroups.find((g) => g.id === groupId);
            if (group?.selectionType === "single") {
                return {
                    ...prev,
                    [groupId]: current.includes(optId) ? [] : [optId],
                };
            }
            const next = current.includes(optId)
                ? current.filter((id) => id !== optId)
                : [...current, optId];
            return { ...prev, [groupId]: next };
        });
    };

    const handleAdd = () => {
        const options: CustomizeOptions = {
            size: item.hasSizes ? size : "",
            sizeOptionId: item.hasSizes ? sizeOptionId : "",
            toppings: [...toppings],
            sugarLevel: item.hasSugar ? sugarLevel : "",
            sugarOptionId: item.hasSugar ? sugarOptionId : "",
            quantity,
            finalPrice,
            note,
            modifiers: { ...selectedModifiers },
        };
        onAdd(item, options);
        onClose();
    };

    const iconName = getCategoryIconName(
        typeof item.category === "string" ? item.category : "",
    );
    const CategoryIcon = getCategoryIcon(iconName);

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md" showCloseButton>
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        {item.image ? (
                            <img
                                src={item.image}
                                alt={item.name}
                                className="size-12 rounded-xl object-cover"
                            />
                        ) : (
                            <div className="flex size-12 items-center justify-center rounded-xl bg-secondary">
                                <CategoryIcon className="size-5 text-muted-foreground" />
                            </div>
                        )}
                        <div>
                            <DialogTitle>{item.name}</DialogTitle>
                            <p className="text-sm text-muted-foreground">
                                Base ${item.basePrice.toFixed(2)}
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                <div className="max-h-[60vh] overflow-y-auto">
                    {item.hasSizes && sizeOptions.length > 0 && (
                        <SizeSelector
                            label={sizeGroup?.name ?? "Size"}
                            options={sizeOptions}
                            value={size}
                            onSelect={(name, id) => {
                                setSize(name);
                                setSizeOptionId(id);
                            }}
                        />
                    )}

                    {item.hasSugar && sugarOptions.length > 0 && (
                        <SugarLevelSelector
                            label={sugarGroup?.name ?? "Sugar Level"}
                            options={sugarOptions}
                            value={sugarLevel}
                            onSelect={(name, id) => {
                                setSugarLevel(name);
                                setSugarOptionId(id);
                            }}
                        />
                    )}

                    {item.hasToppings && toppingOptions.length > 0 && (
                        <ToppingsPicker
                            label={toppingsGroup?.name ?? "Toppings"}
                            options={toppingOptions}
                            selected={toppings}
                            onUpdate={updateTopping}
                        />
                    )}

                    {otherGroups.map((group) => (
                        <ModifierGroupSelector
                            key={group.id}
                            group={group}
                            selectedIds={selectedModifiers[group.id] ?? []}
                            onToggle={toggleModifier}
                        />
                    ))}

                    <ItemNoteInput value={note} onChange={setNote} />

                    <div className="mb-2">
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Quantity
                        </label>
                        <QuantityStepper
                            value={quantity}
                            onChange={(delta) =>
                                setQuantity((q) => Math.max(1, q + delta))
                            }
                            size="icon"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <div className="flex-1">
                        <p className="text-xs text-muted-foreground">
                            Unit: ${unitPrice.toFixed(2)}
                        </p>
                        <p className="font-mono text-xl font-bold tabular-nums text-foreground">
                            ${finalPrice.toFixed(2)}
                        </p>
                    </div>
                    <Button
                        onClick={handleAdd}
                        className="h-auto rounded-xl px-6 py-3 font-bold"
                    >
                        {initialOptions ? "Save Changes" : "Add to Order"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CustomizeModal;
