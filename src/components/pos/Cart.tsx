import { motion, AnimatePresence } from "motion/react";
import {
    Trash2,
    Pencil,
    Minus,
    Plus,
    ShoppingBag,
    UtensilsCrossed,
    Coffee,
    Milk,
    Leaf,
    GlassWater,
    Croissant,
} from "lucide-react";
import { type CartItem, CATEGORY_ICONS } from "./data";

const categoryIconMap: Record<string, React.ElementType> = {
    Coffee,
    Milk,
    Leaf,
    GlassWater,
    Croissant,
};

interface CartProps {
    items: CartItem[];
    orderType: "dine-in" | "takeout";
    onOrderTypeChange: (t: "dine-in" | "takeout") => void;
    onRemove: (id: string) => void;
    onQuantityChange: (id: string, delta: number) => void;
    onEdit: (id: string) => void;
    onConfirm: () => void;
    onReset: () => void;
}

export const Cart = ({
    items,
    orderType,
    onOrderTypeChange,
    onRemove,
    onQuantityChange,
    onEdit,
    onConfirm,
    onReset,
}: CartProps) => {
    const subtotal = items.reduce((sum, item) => sum + item.price, 0);
    const tax = subtotal * 0.07;
    const total = subtotal + tax;

    return (
        <div
            className="flex h-full w-[260px] shrink-0 flex-col overflow-hidden"
            style={{ background: "#FFFFFF", borderLeft: "1px solid #E2D8CC" }}
        >
            {/* Header */}
            <div
                className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: "1px solid #E2D8CC" }}
            >
                <div className="flex items-center gap-2">
                    <ShoppingBag
                        className="h-4 w-4"
                        style={{ color: "#4A2512" }}
                    />
                    <span
                        className="text-sm font-bold"
                        style={{
                            fontFamily: "'Bricolage Grotesque', sans-serif",
                            color: "#1A0F0A",
                        }}
                    >
                        Order
                    </span>
                    <span
                        className="flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold text-white"
                        style={{ background: "#4A2512" }}
                    >
                        {items.reduce((sum, i) => sum + i.quantity, 0)}
                    </span>
                </div>
            </div>

            {/* Order Type Toggle */}
            <div className="flex gap-1 p-3" style={{ background: "#F4EFE8" }}>
                <button
                    onClick={() => onOrderTypeChange("dine-in")}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all"
                    style={{
                        background:
                            orderType === "dine-in" ? "#4A2512" : "#FFFFFF",
                        color: orderType === "dine-in" ? "#FFFFFF" : "#1A0F0A",
                        border: "1px solid #E2D8CC",
                    }}
                >
                    <UtensilsCrossed className="h-3.5 w-3.5" />
                    Dine In
                </button>
                <button
                    onClick={() => onOrderTypeChange("takeout")}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all"
                    style={{
                        background:
                            orderType === "takeout" ? "#4A2512" : "#FFFFFF",
                        color: orderType === "takeout" ? "#FFFFFF" : "#1A0F0A",
                        border: "1px solid #E2D8CC",
                    }}
                >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    Takeout
                </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-3 py-2">
                <AnimatePresence initial={false}>
                    {items.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center py-12"
                        >
                            <ShoppingBag
                                className="h-10 w-10 mb-2"
                                style={{ color: "#E2D8CC" }}
                            />
                            <p className="text-xs" style={{ color: "#8B7A67" }}>
                                Cart is empty
                            </p>
                        </motion.div>
                    ) : (
                        items.map((item) => {
                            const CategoryIcon =
                                categoryIconMap[
                                    CATEGORY_ICONS[item.category]
                                ] || Coffee;
                            return (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{
                                        opacity: 0,
                                        x: -20,
                                        height: 0,
                                        marginBottom: 0,
                                    }}
                                    className="mb-2 rounded-xl p-2.5"
                                    style={{
                                        background: "#F4EFE8",
                                        border: "1px solid #E2D8CC",
                                    }}
                                >
                                    <div className="flex items-start gap-2">
                                        <CategoryIcon
                                            className="mt-0.5 h-3.5 w-3.5 shrink-0"
                                            style={{ color: "#8B7A67" }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p
                                                className="truncate text-xs font-bold"
                                                style={{
                                                    fontFamily:
                                                        "'Bricolage Grotesque', sans-serif",
                                                    color: "#1A0F0A",
                                                }}
                                            >
                                                {item.name}
                                            </p>
                                            <div className="mt-0.5 flex flex-wrap gap-x-2 gap-y-0.5">
                                                {item.size && (
                                                    <span
                                                        className="text-[10px]"
                                                        style={{
                                                            color: "#8B7A67",
                                                        }}
                                                    >
                                                        Size {item.size}
                                                    </span>
                                                )}
                                                {item.sugarLevel && (
                                                    <span
                                                        className="text-[10px]"
                                                        style={{
                                                            color: "#8B7A67",
                                                        }}
                                                    >
                                                        Sugar {item.sugarLevel}
                                                    </span>
                                                )}
                                                {item.toppings.length > 0 && (
                                                    <span
                                                        className="truncate text-[10px]"
                                                        style={{
                                                            color: "#8B7A67",
                                                        }}
                                                    >
                                                        {item.toppings
                                                            .map((t) => t.name)
                                                            .join(", ")}
                                                    </span>
                                                )}
                                            </div>
                                            {item.note && (
                                                <p
                                                    className="mt-0.5 truncate text-[10px] italic"
                                                    style={{ color: "#8B7A67" }}
                                                >
                                                    “{item.note}”
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <p
                                                className="text-xs font-bold tabular-nums"
                                                style={{
                                                    fontFamily:
                                                        "'DM Mono', monospace",
                                                    color: "#4A2512",
                                                }}
                                            >
                                                ${item.price.toFixed(2)}
                                            </p>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() =>
                                                        onEdit(item.id)
                                                    }
                                                    className="flex h-5 w-5 items-center justify-center rounded-md transition-colors hover:bg-black/5"
                                                >
                                                    <Pencil
                                                        className="h-3 w-3"
                                                        style={{
                                                            color: "#8B7A67",
                                                        }}
                                                    />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        onRemove(item.id)
                                                    }
                                                    className="flex h-5 w-5 items-center justify-center rounded-md transition-colors hover:bg-red-50"
                                                >
                                                    <Trash2
                                                        className="h-3 w-3"
                                                        style={{
                                                            color: "#c0392b",
                                                        }}
                                                    />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-2 flex items-center justify-end gap-2">
                                        <button
                                            onClick={() =>
                                                onQuantityChange(item.id, -1)
                                            }
                                            className="flex h-6 w-6 items-center justify-center rounded-md transition-colors hover:bg-black/5"
                                            style={{
                                                border: "1px solid #E2D8CC",
                                            }}
                                        >
                                            <Minus className="h-3 w-3" />
                                        </button>
                                        <span
                                            className="w-4 text-center text-xs font-bold tabular-nums"
                                            style={{
                                                fontFamily:
                                                    "'DM Mono', monospace",
                                                color: "#1A0F0A",
                                            }}
                                        >
                                            {item.quantity}
                                        </span>
                                        <button
                                            onClick={() =>
                                                onQuantityChange(item.id, 1)
                                            }
                                            className="flex h-6 w-6 items-center justify-center rounded-md transition-colors hover:bg-black/5"
                                            style={{
                                                border: "1px solid #E2D8CC",
                                            }}
                                        >
                                            <Plus className="h-3 w-3" />
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </AnimatePresence>
            </div>

            {/* Footer */}
            <div
                className="px-4 py-3"
                style={{
                    borderTop: "1px solid #E2D8CC",
                    background: "#F4EFE8",
                }}
            >
                <div
                    className="mb-1 flex justify-between text-xs"
                    style={{ color: "#8B7A67" }}
                >
                    <span>Subtotal</span>
                    <span
                        className="tabular-nums"
                        style={{ fontFamily: "'DM Mono', monospace" }}
                    >
                        ${subtotal.toFixed(2)}
                    </span>
                </div>
                <div
                    className="mb-2 flex justify-between text-xs"
                    style={{ color: "#8B7A67" }}
                >
                    <span>Tax (7%)</span>
                    <span
                        className="tabular-nums"
                        style={{ fontFamily: "'DM Mono', monospace" }}
                    >
                        ${tax.toFixed(2)}
                    </span>
                </div>
                <div
                    className="mb-3 flex justify-between text-base font-bold"
                    style={{ color: "#1A0F0A" }}
                >
                    <span>Total</span>
                    <span
                        className="tabular-nums"
                        style={{
                            fontFamily: "'DM Mono', monospace",
                            color: "#4A2512",
                        }}
                    >
                        ${total.toFixed(2)}
                    </span>
                </div>
                <button
                    onClick={onConfirm}
                    disabled={items.length === 0}
                    className="w-full rounded-xl py-3 text-sm font-bold text-white transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                    style={{ background: "#4A2512" }}
                >
                    Charge
                </button>
                <button
                    onClick={onReset}
                    className="mt-2 w-full rounded-xl border py-2 text-xs font-semibold transition-all hover:bg-black/5"
                    style={{ borderColor: "#E2D8CC", color: "#8B7A67" }}
                >
                    Reset
                </button>
            </div>
        </div>
    );
};

export default Cart;
