import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
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
    >(initialOptions?.toppings || []);
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
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <div
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    onClick={onClose}
                />
                <motion.div
                    className="relative z-10 flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl shadow-2xl"
                    style={{
                        background: "#FFFFFF",
                        border: "1px solid #E2D8CC",
                    }}
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                >
                    {/* Header */}
                    <div
                        className="flex items-center gap-3 px-5 py-4"
                        style={{
                            background: "#F4EFE8",
                            borderBottom: "1px solid #E2D8CC",
                        }}
                    >
                        <div
                            className="flex h-10 w-10 items-center justify-center rounded-xl"
                            style={{ background: "#4A2512" }}
                        >
                            <CategoryIcon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3
                                className="text-lg font-bold leading-tight"
                                style={{
                                    fontFamily:
                                        "'Bricolage Grotesque', sans-serif",
                                    color: "#1A0F0A",
                                }}
                            >
                                {item.name}
                            </h3>
                            <p className="text-sm" style={{ color: "#8B7A67" }}>
                                Base ${item.basePrice.toFixed(2)}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-black/5"
                        >
                            <X
                                className="h-5 w-5"
                                style={{ color: "#8B7A67" }}
                            />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto px-5 py-4">
                        {/* Size */}
                        {item.hasSizes && (
                            <div className="mb-5">
                                <label
                                    className="mb-2 block text-xs font-semibold uppercase tracking-wider"
                                    style={{ color: "#8B7A67" }}
                                >
                                    Size
                                </label>
                                <div className="flex gap-2">
                                    {SIZES.map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => setSize(s)}
                                            className="flex flex-1 flex-col items-center gap-1 rounded-xl border-2 px-3 py-2.5 transition-all"
                                            style={{
                                                borderColor:
                                                    size === s
                                                        ? "#4A2512"
                                                        : "#E2D8CC",
                                                background:
                                                    size === s
                                                        ? "#4A2512"
                                                        : "#FFFFFF",
                                                color:
                                                    size === s
                                                        ? "#FFFFFF"
                                                        : "#1A0F0A",
                                            }}
                                        >
                                            <span className="text-sm font-bold">
                                                {s}
                                            </span>
                                            <span
                                                className="text-xs"
                                                style={{
                                                    color:
                                                        size === s
                                                            ? "#FFFFFF"
                                                            : "#8B7A67",
                                                    opacity:
                                                        size === s ? 0.8 : 1,
                                                }}
                                            >
                                                +${SIZE_PRICES[s].toFixed(2)}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Sugar */}
                        {item.hasSugar && (
                            <div className="mb-5">
                                <label
                                    className="mb-2 block text-xs font-semibold uppercase tracking-wider"
                                    style={{ color: "#8B7A67" }}
                                >
                                    Sugar Level
                                </label>
                                <div className="flex gap-1.5">
                                    {SUGAR_LEVELS.map((sl) => (
                                        <button
                                            key={sl}
                                            onClick={() => setSugarLevel(sl)}
                                            className="flex-1 rounded-lg border px-2 py-2 text-xs font-semibold transition-all"
                                            style={{
                                                borderColor:
                                                    sugarLevel === sl
                                                        ? "#4A2512"
                                                        : "#E2D8CC",
                                                background:
                                                    sugarLevel === sl
                                                        ? "#4A2512"
                                                        : "#FFFFFF",
                                                color:
                                                    sugarLevel === sl
                                                        ? "#FFFFFF"
                                                        : "#1A0F0A",
                                            }}
                                        >
                                            {sl}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Toppings */}
                        {item.hasToppings && (
                            <div className="mb-5">
                                <label
                                    className="mb-2 block text-xs font-semibold uppercase tracking-wider"
                                    style={{ color: "#8B7A67" }}
                                >
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
                                                className="flex items-center justify-between rounded-xl px-3 py-2.5"
                                                style={{
                                                    background: "#F0EBE3",
                                                }}
                                            >
                                                <div>
                                                    <p
                                                        className="text-sm font-medium"
                                                        style={{
                                                            color: "#1A0F0A",
                                                        }}
                                                    >
                                                        {t.name}
                                                    </p>
                                                    <p
                                                        className="text-xs"
                                                        style={{
                                                            color: "#8B7A67",
                                                        }}
                                                    >
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
                                                        className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-black/5"
                                                        style={{
                                                            border: "1px solid #E2D8CC",
                                                        }}
                                                        disabled={qty === 0}
                                                    >
                                                        <Minus className="h-3.5 w-3.5" />
                                                    </button>
                                                    <span
                                                        className="w-4 text-center text-sm font-semibold tabular-nums"
                                                        style={{
                                                            fontFamily:
                                                                "'DM Mono', monospace",
                                                            color: "#1A0F0A",
                                                        }}
                                                    >
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
                                                        className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-black/5"
                                                        style={{
                                                            border: "1px solid #E2D8CC",
                                                        }}
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

                        {/* Note */}
                        <div className="mb-5">
                            <label
                                className="mb-2 block text-xs font-semibold uppercase tracking-wider"
                                style={{ color: "#8B7A67" }}
                            >
                                Note
                            </label>
                            <div className="relative">
                                <FileText
                                    className="absolute left-3 top-2.5 h-4 w-4"
                                    style={{ color: "#8B7A67" }}
                                />
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Any special requests..."
                                    className="w-full resize-none rounded-xl px-3 py-2 pl-9 text-sm outline-none transition-colors focus:ring-2"
                                    style={{
                                        background: "#F0EBE3",
                                        border: "1px solid #E2D8CC",
                                        color: "#1A0F0A",
                                        minHeight: 72,
                                    }}
                                    rows={3}
                                />
                            </div>
                        </div>

                        {/* Quantity */}
                        <div className="mb-2">
                            <label
                                className="mb-2 block text-xs font-semibold uppercase tracking-wider"
                                style={{ color: "#8B7A67" }}
                            >
                                Quantity
                            </label>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() =>
                                        setQuantity((q) => Math.max(1, q - 1))
                                    }
                                    className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-black/5"
                                    style={{ border: "1px solid #E2D8CC" }}
                                    disabled={quantity <= 1}
                                >
                                    <Minus className="h-4 w-4" />
                                </button>
                                <span
                                    className="w-8 text-center text-lg font-bold tabular-nums"
                                    style={{
                                        fontFamily: "'DM Mono', monospace",
                                        color: "#1A0F0A",
                                    }}
                                >
                                    {quantity}
                                </span>
                                <button
                                    onClick={() => setQuantity((q) => q + 1)}
                                    className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-black/5"
                                    style={{ border: "1px solid #E2D8CC" }}
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div
                        className="flex items-center gap-3 px-5 py-4"
                        style={{
                            borderTop: "1px solid #E2D8CC",
                            background: "#F4EFE8",
                        }}
                    >
                        <div className="flex-1">
                            <p className="text-xs" style={{ color: "#8B7A67" }}>
                                Unit: ${unitPrice.toFixed(2)}
                            </p>
                            <p
                                className="text-xl font-bold tabular-nums"
                                style={{
                                    fontFamily: "'DM Mono', monospace",
                                    color: "#1A0F0A",
                                }}
                            >
                                ${finalPrice.toFixed(2)}
                            </p>
                        </div>
                        <button
                            onClick={handleAdd}
                            className="rounded-xl px-6 py-3 text-sm font-bold text-white transition-all hover:brightness-110 active:scale-95"
                            style={{ background: "#4A2512" }}
                        >
                            {initialOptions ? "Save Changes" : "Add to Order"}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default CustomizeModal;
