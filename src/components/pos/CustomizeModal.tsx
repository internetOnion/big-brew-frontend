import { useState, useMemo } from "react";
import {
    Coffee,
    Milk,
    Leaf,
    GlassWater,
    Croissant,
    X,
    Plus,
    Minus,
    FileText,
} from "lucide-react";
import {
    type MenuItem,
    TOPPINGS,
    SIZES,
    SUGAR_LEVELS,
    SIZE_PRICES,
    CATEGORY_ICONS,
} from "./data";
import { cn } from "@/lib/utils";

export interface CustomizeOptions {
    size: string;
    toppings: { name: string; qty: number; price: number }[];
    sugarLevel: string;
    quantity: number;
    finalPrice: number;
    note: string;
}

interface CustomizeModalProps {
    item: MenuItem;
    initialOptions?: CustomizeOptions;
    onClose: () => void;
    onAdd: (item: MenuItem, options: CustomizeOptions) => void;
}

const EMPTY_TOPPINGS: { name: string; qty: number; price: number }[] = [];

const categoryIconMap: Record<string, React.ElementType> = {
    Coffee,
    Milk,
    Leaf,
    GlassWater,
    Croissant,
};

export const CustomizeModal = ({
    item,
    initialOptions,
    onClose,
    onAdd,
}: CustomizeModalProps) => {
    const [size, setSize] = useState<string>(initialOptions?.size || "M");
    const [toppings, setToppings] = useState<
        { name: string; qty: number; price: number }[]
    >(initialOptions?.toppings ?? EMPTY_TOPPINGS);
    const [sugarLevel, setSugarLevel] = useState<string>(
        initialOptions?.sugarLevel || "50%",
    );
    const [quantity, setQuantity] = useState(initialOptions?.quantity || 1);
    const [note, setNote] = useState(initialOptions?.note || "");

    const finalPrice = useMemo(() => {
        let price = item.basePrice;
        if (item.hasSizes) {
            price += SIZE_PRICES[size] || 0;
        }
        const toppingsTotal = toppings.reduce(
            (sum, t) => sum + t.price * t.qty,
            0,
        );
        price += toppingsTotal;
        return price * quantity;
    }, [item, size, toppings, quantity]);

    const unitPrice = useMemo(() => {
        let price = item.basePrice;
        if (item.hasSizes) {
            price += SIZE_PRICES[size] || 0;
        }
        const toppingsTotal = toppings.reduce(
            (sum, t) => sum + t.price * t.qty,
            0,
        );
        return price + toppingsTotal;
    }, [item, size, toppings]);

    const updateTopping = (name: string, price: number, delta: number) => {
        setToppings((prev) => {
            const existing = prev.find((t) => t.name === name);
            if (!existing) {
                if (delta > 0) {
                    return [...prev, { name, qty: delta, price }];
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

    const handleAdd = () => {
        const options: CustomizeOptions = {
            size: item.hasSizes ? size : "",
            toppings: [...toppings],
            sugarLevel: item.hasSugar ? sugarLevel : "",
            quantity,
            finalPrice,
            note,
        };
        onAdd(item, options);
        onClose();
    };

    const CategoryIcon =
        categoryIconMap[CATEGORY_ICONS[item.category]] || Coffee;

    return (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center"
            >
                <div
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    onClick={onClose}
                />
                <div
                    className="relative z-10 flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
                >
                    <div className="flex items-center gap-3 border-b border-border bg-background px-5 py-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                            <CategoryIcon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-sans text-lg font-bold leading-tight text-foreground">
                                {item.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Base ${item.basePrice.toFixed(2)}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-black/5"
                        >
                            <X className="h-5 w-5 text-muted-foreground" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-5 py-4">
                        {item.hasSizes && (
                            <div className="mb-5">
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Size
                                </label>
                                <div className="flex gap-2">
                                    {SIZES.map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => setSize(s)}
                                            className={cn(
                                                "flex flex-1 flex-col items-center gap-1 rounded-xl border-2 px-3 py-2.5 transition-all",
                                                size === s
                                                    ? "border-primary bg-primary text-white"
                                                    : "border-border bg-card text-foreground",
                                            )}
                                        >
                                            <span className="text-sm font-bold">
                                                {s}
                                            </span>
                                            <span
                                                className={cn(
                                                    "text-xs",
                                                    size === s
                                                        ? "text-white/80"
                                                        : "text-muted-foreground",
                                                )}
                                            >
                                                +${SIZE_PRICES[s].toFixed(2)}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {item.hasSugar && (
                            <div className="mb-5">
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Sugar Level
                                </label>
                                <div className="flex gap-1.5">
                                    {SUGAR_LEVELS.map((sl) => (
                                        <button
                                            key={sl}
                                            onClick={() => setSugarLevel(sl)}
                                            className={cn(
                                                "flex-1 rounded-lg border px-2 py-2 text-xs font-semibold transition-all",
                                                sugarLevel === sl
                                                    ? "border-primary bg-primary text-white"
                                                    : "border-border bg-card text-foreground",
                                            )}
                                        >
                                            {sl}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {item.hasToppings && (
                            <div className="mb-5">
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Toppings
                                </label>
                                <div className="flex flex-col gap-2">
                                    {TOPPINGS.map((t) => {
                                        const current = toppings.find(
                                            (x) => x.name === t.name,
                                        );
                                        const qty = current?.qty || 0;
                                        return (
                                            <div
                                                key={t.name}
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
                                                    <button
                                                        onClick={() =>
                                                            updateTopping(
                                                                t.name,
                                                                t.price,
                                                                -1,
                                                            )
                                                        }
                                                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-border transition-colors hover:bg-black/5"
                                                        disabled={qty === 0}
                                                    >
                                                        <Minus className="h-3.5 w-3.5" />
                                                    </button>
                                                    <span className="w-4 text-center font-mono text-sm font-semibold tabular-nums text-foreground">
                                                        {qty}
                                                    </span>
                                                    <button
                                                        onClick={() =>
                                                            updateTopping(
                                                                t.name,
                                                                t.price,
                                                                1,
                                                            )
                                                        }
                                                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-border transition-colors hover:bg-black/5"
                                                    >
                                                        <Plus className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="mb-5">
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Note
                            </label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Any special requests..."
                                    className="min-h-[72px] w-full resize-none rounded-xl border border-border bg-secondary px-3 py-2 pl-9 text-sm text-foreground outline-none transition-colors focus:ring-2"
                                    rows={3}
                                />
                            </div>
                        </div>

                        <div className="mb-2">
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Quantity
                            </label>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() =>
                                        setQuantity((q) => Math.max(1, q - 1))
                                    }
                                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-border transition-colors hover:bg-black/5"
                                    disabled={quantity <= 1}
                                >
                                    <Minus className="h-4 w-4" />
                                </button>
                                <span className="w-8 text-center font-mono text-lg font-bold tabular-nums text-foreground">
                                    {quantity}
                                </span>
                                <button
                                    onClick={() => setQuantity((q) => q + 1)}
                                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-border transition-colors hover:bg-black/5"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 border-t border-border bg-background px-5 py-4">
                        <div className="flex-1">
                            <p className="text-xs text-muted-foreground">
                                Unit: ${unitPrice.toFixed(2)}
                            </p>
                            <p className="font-mono text-xl font-bold tabular-nums text-foreground">
                                ${finalPrice.toFixed(2)}
                            </p>
                        </div>
                        <button
                            onClick={handleAdd}
                            className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white transition-all hover:brightness-110 active:scale-95"
                        >
                            {initialOptions ? "Save Changes" : "Add to Order"}
                        </button>
                    </div>
                </div>
        </div>
    );
};

export default CustomizeModal;
