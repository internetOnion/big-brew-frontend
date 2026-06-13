import { useState, useMemo } from "react";
import {
    Coffee,
    Milk,
    Leaf,
    GlassWater,
    Croissant,
    Plus,
    Minus,
    FileText,
} from "lucide-react";
import {
    type MenuItem,
    type ModifierGroup,
    getCategoryIconName,
    findModifierGroup,
} from "@/types/menu";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

export interface CustomizeOptions {
    size: string;
    sizeOptionId: string;
    toppings: {
        name: string;
        qty: number;
        price: number;
        modifierOptionId: string;
    }[];
    sugarLevel: string;
    sugarOptionId: string;
    quantity: number;
    finalPrice: number;
    note: string;
    modifiers: Record<string, string[]>;
}

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

const categoryIconMap: Record<string, React.ElementType> = {
    Coffee,
    Milk,
    Leaf,
    GlassWater,
    Croissant,
};

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
    const CategoryIcon = categoryIconMap[iconName] || Coffee;

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
                        <div className="mb-5">
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                {sizeGroup?.name ?? "Size"}
                            </label>
                            <div className="flex gap-2">
                                {sizeOptions.map((s) => (
                                    <Button
                                        key={s.id}
                                        variant={
                                            size === s.name
                                                ? "default"
                                                : "outline"
                                        }
                                        onClick={() => {
                                            setSize(s.name);
                                            setSizeOptionId(s.id);
                                        }}
                                        className="h-auto flex flex-1 flex-col items-center gap-1 py-2.5"
                                    >
                                        <span className="text-sm font-bold">
                                            {s.name}
                                        </span>
                                        <span
                                            className={cn(
                                                "text-xs",
                                                size === s.name
                                                    ? "text-primary-foreground/80"
                                                    : "text-muted-foreground",
                                            )}
                                        >
                                            +${s.price.toFixed(2)}
                                        </span>
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}

                    {item.hasSugar && sugarOptions.length > 0 && (
                        <div className="mb-5">
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                {sugarGroup?.name ?? "Sugar Level"}
                            </label>
                            <div className="flex gap-1.5">
                                {sugarOptions.map((sl) => (
                                    <Button
                                        key={sl.id}
                                        variant={
                                            sugarLevel === sl.name
                                                ? "default"
                                                : "outline"
                                        }
                                        size="default"
                                        onClick={() => {
                                            setSugarLevel(sl.name);
                                            setSugarOptionId(sl.id);
                                        }}
                                        className="flex-1"
                                    >
                                        {sl.name}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}

                    {item.hasToppings && toppingOptions.length > 0 && (
                        <div className="mb-5">
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                {toppingsGroup?.name ?? "Toppings"}
                            </label>
                            <div className="flex flex-col gap-2">
                                {toppingOptions.map((t) => {
                                    const current = toppings.find(
                                        (x) => x.name === t.name,
                                    );
                                    const qty = current?.qty || 0;
                                    return (
                                        <div
                                            key={t.id}
                                            className="flex items-center justify-between rounded-xl bg-secondary px-3 py-2.5"
                                        >
                                            <div>
                                                <p className="text-sm font-medium text-foreground">
                                                    {t.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    +${t.price.toFixed(2)}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon-sm"
                                                    onClick={() =>
                                                        updateTopping(
                                                            t.name,
                                                            t.price,
                                                            -1,
                                                            t.id,
                                                        )
                                                    }
                                                    disabled={qty === 0}
                                                >
                                                    <Minus />
                                                </Button>
                                                <span className="w-4 text-center font-mono text-sm font-semibold tabular-nums text-foreground">
                                                    {qty}
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    size="icon-sm"
                                                    onClick={() =>
                                                        updateTopping(
                                                            t.name,
                                                            t.price,
                                                            1,
                                                            t.id,
                                                        )
                                                    }
                                                >
                                                    <Plus />
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {otherGroups.map((group) => {
                        const selected = selectedModifiers[group.id] ?? [];
                        return (
                            <div key={group.id} className="mb-5">
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    {group.name}
                                </label>
                                <div className="flex flex-col gap-1.5">
                                    {group.options.map((opt) => {
                                        const isSelected = selected.includes(
                                            opt.id,
                                        );
                                        return (
                                            <button
                                                key={opt.id}
                                                onClick={() =>
                                                    toggleModifier(
                                                        group.id,
                                                        opt.id,
                                                    )
                                                }
                                                className={cn(
                                                    "flex items-center justify-between rounded-xl border px-3 py-2.5 text-left transition-all",
                                                    isSelected
                                                        ? "border-primary bg-primary/8 text-foreground"
                                                        : "border-border bg-secondary text-foreground hover:bg-muted",
                                                )}
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <div
                                                        className={cn(
                                                            "flex size-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                                                            isSelected
                                                                ? "border-primary bg-primary"
                                                                : "border-muted-foreground/30",
                                                        )}
                                                    >
                                                        {isSelected && (
                                                            <div className="size-1.5 rounded-full bg-primary-foreground" />
                                                        )}
                                                    </div>
                                                    <span className="text-sm font-medium">
                                                        {opt.name}
                                                    </span>
                                                </div>
                                                {opt.price > 0 && (
                                                    <span className="text-xs text-muted-foreground">
                                                        +$
                                                        {opt.price.toFixed(2)}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}

                    <div className="mb-5">
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Note
                        </label>
                        <div className="relative p-0.5">
                            <FileText className="pointer-events-none absolute left-3.5 top-3 size-4 text-muted-foreground" />
                            <Textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Any special requests..."
                                className="min-h-[72px] resize-none border-border bg-secondary pl-9"
                                rows={3}
                            />
                        </div>
                    </div>

                    <div className="mb-2">
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Quantity
                        </label>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                    setQuantity((q) => Math.max(1, q - 1))
                                }
                                disabled={quantity <= 1}
                            >
                                <Minus />
                            </Button>
                            <span className="w-8 text-center font-mono text-lg font-bold tabular-nums text-foreground">
                                {quantity}
                            </span>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setQuantity((q) => q + 1)}
                            >
                                <Plus />
                            </Button>
                        </div>
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
