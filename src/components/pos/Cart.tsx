import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
import { getCategoryIconName } from "@/types/menu";
import { usePOS } from "@/hooks/usePos";
import { ROUTES } from "@/lib/constants";

const categoryIconMap: Record<string, React.ElementType> = {
    Coffee,
    Milk,
    Leaf,
    GlassWater,
    Croissant,
};

export const Cart = () => {
    const {
        cartItems,
        orderType,
        setOrderType,
        removeItem,
        changeQuantity,
        startEdit,
        resetCart,
    } = usePOS();
    const navigate = useNavigate();

    const items = cartItems;
    const onOrderTypeChange = setOrderType;
    const onRemove = removeItem;
    const onQuantityChange = changeQuantity;
    const onEdit = startEdit;
    const onConfirm = useCallback(() => navigate(ROUTES.PAYMENT), [navigate]);
    const onReset = resetCart;
    const subtotal = useMemo(
        () => items.reduce((sum, item) => sum + item.price, 0),
        [items],
    );
    const tax = useMemo(() => subtotal * 0.07, [subtotal]);
    const total = useMemo(() => subtotal + tax, [subtotal, tax]);

    const handleDineIn = useCallback(
        () => onOrderTypeChange("dine-in"),
        [onOrderTypeChange],
    );
    const handleTakeout = useCallback(
        () => onOrderTypeChange("takeout"),
        [onOrderTypeChange],
    );

    return (
        <div className="flex h-full w-[260px] shrink-0 flex-col overflow-hidden bg-card border-l border-border">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-primary" />
                    <span className="text-sm font-bold font-sans text-foreground">
                        Order
                    </span>
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold text-white bg-primary">
                        {items.reduce((sum, i) => sum + i.quantity, 0)}
                    </span>
                </div>
            </div>

            <div className="flex gap-1 p-3 bg-background">
                <button
                    onClick={handleDineIn}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all border border-border ${
                        orderType === "dine-in"
                            ? "bg-primary text-white"
                            : "bg-card text-foreground"
                    }`}
                >
                    <UtensilsCrossed className="h-3.5 w-3.5" />
                    Dine In
                </button>
                <button
                    onClick={handleTakeout}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all border border-border ${
                        orderType === "takeout"
                            ? "bg-primary text-white"
                            : "bg-card text-foreground"
                    }`}
                >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    Takeout
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-2">
                {items.length === 0 ? (
                    <div
                        key="empty"
                        className="flex flex-col items-center justify-center py-12"
                    >
                        <ShoppingBag className="h-10 w-10 mb-2 text-border" />
                        <p className="text-xs text-muted-foreground">
                            Cart is empty
                        </p>
                    </div>
                ) : (
                    items.map((item) => {
                        const CategoryIcon =
                            categoryIconMap[
                                getCategoryIconName(item.category)
                            ] || Coffee;
                        return (
                            <div
                                key={item.id}
                                className="mb-2 rounded-xl p-2.5 bg-background border border-border"
                            >
                                <div className="flex items-start gap-2">
                                    <CategoryIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                    <div className="flex-1 min-w-0">
                                        <p className="truncate text-xs font-bold font-sans text-foreground">
                                            {item.name}
                                        </p>
                                        <div className="mt-0.5 flex flex-wrap gap-x-2 gap-y-0.5">
                                            {item.size && (
                                                <span className="text-[10px] text-muted-foreground">
                                                    Size {item.size}
                                                </span>
                                            )}
                                            {item.sugarLevel && (
                                                <span className="text-[10px] text-muted-foreground">
                                                    Sugar {item.sugarLevel}
                                                </span>
                                            )}
                                            {item.toppings.length > 0 && (
                                                <span className="truncate text-[10px] text-muted-foreground">
                                                    {item.toppings
                                                        .map((t) => t.name)
                                                        .join(", ")}
                                                </span>
                                            )}
                                        </div>
                                        {item.note && (
                                            <p className="mt-0.5 truncate text-[10px] italic text-muted-foreground">
                                                &ldquo;{item.note}&rdquo;
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <p className="text-xs font-bold tabular-nums font-mono text-primary">
                                            ${item.price.toFixed(2)}
                                        </p>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => onEdit(item.id)}
                                                className="flex h-5 w-5 items-center justify-center rounded-md transition-colors hover:bg-black/5"
                                            >
                                                <Pencil className="h-3 w-3 text-muted-foreground" />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    onRemove(item.id)
                                                }
                                                className="flex h-5 w-5 items-center justify-center rounded-md transition-colors hover:bg-red-50"
                                            >
                                                <Trash2 className="h-3 w-3 text-destructive" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-2 flex items-center justify-end gap-2">
                                    <button
                                        onClick={() =>
                                            onQuantityChange(item.id, -1)
                                        }
                                        className="flex h-6 w-6 items-center justify-center rounded-md border border-border transition-colors hover:bg-black/5"
                                    >
                                        <Minus className="h-3 w-3" />
                                    </button>
                                    <span className="w-4 text-center text-xs font-bold tabular-nums font-mono text-foreground">
                                        {item.quantity}
                                    </span>
                                    <button
                                        onClick={() =>
                                            onQuantityChange(item.id, 1)
                                        }
                                        className="flex h-6 w-6 items-center justify-center rounded-md border border-border transition-colors hover:bg-black/5"
                                    >
                                        <Plus className="h-3 w-3" />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="px-4 py-3 border-t border-border bg-background">
                <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="tabular-nums font-mono">
                        ${subtotal.toFixed(2)}
                    </span>
                </div>
                <div className="mb-2 flex justify-between text-xs text-muted-foreground">
                    <span>Tax (7%)</span>
                    <span className="tabular-nums font-mono">
                        ${tax.toFixed(2)}
                    </span>
                </div>
                <div className="mb-3 flex justify-between text-base font-bold text-foreground">
                    <span>Total</span>
                    <span className="tabular-nums font-mono text-primary">
                        ${total.toFixed(2)}
                    </span>
                </div>
                <button
                    onClick={onConfirm}
                    disabled={items.length === 0}
                    className="w-full rounded-xl py-3 text-sm font-bold text-white bg-primary transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Confirm
                </button>
                <button
                    onClick={onReset}
                    className="mt-2 w-full rounded-xl border border-border py-2 text-xs font-semibold text-muted-foreground transition-all hover:bg-black/5"
                >
                    Reset
                </button>
            </div>
        </div>
    );
};

export default Cart;
