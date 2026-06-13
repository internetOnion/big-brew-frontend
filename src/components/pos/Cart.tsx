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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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

    return (
        <div className="flex h-full w-[260px] shrink-0 flex-col overflow-hidden border-l border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div className="flex items-center gap-2">
                    <ShoppingBag className="size-4 text-primary" />
                    <span className="font-sans text-sm font-bold text-foreground">
                        Order
                    </span>
                    <Badge variant="default" className="min-w-5">
                        {items.reduce((sum, i) => sum + i.quantity, 0)}
                    </Badge>
                </div>
            </div>

            <div className="flex gap-1 bg-background p-3">
                <Button
                    variant={orderType === "dine-in" ? "default" : "outline"}
                    size="default"
                    onClick={() => onOrderTypeChange("dine-in")}
                    className="flex-1 text-xs"
                >
                    <UtensilsCrossed />
                    Dine In
                </Button>
                <Button
                    variant={orderType === "takeout" ? "default" : "outline"}
                    size="default"
                    onClick={() => onOrderTypeChange("takeout")}
                    className="flex-1 text-xs"
                >
                    <ShoppingBag />
                    Takeout
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-2 pos-scroll">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <ShoppingBag className="mb-2 size-10 text-border" />
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
                                className="mb-2 rounded-xl border border-border bg-background p-2.5"
                            >
                                <div className="flex items-start gap-2">
                                    <CategoryIcon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-sans text-xs font-bold text-foreground">
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
                                            {item.modifierGroups
                                                .flatMap((g) => {
                                                    const selected =
                                                        item.selectedModifiers[
                                                            g.id
                                                        ] ?? [];
                                                    return selected.map(
                                                        (optId) => {
                                                            const opt =
                                                                g.options.find(
                                                                    (o) =>
                                                                        o.id ===
                                                                        optId,
                                                                );
                                                            return opt?.name;
                                                        },
                                                    );
                                                })
                                                .filter(Boolean)
                                                .map((name) => (
                                                    <span
                                                        key={name}
                                                        className="text-[10px] text-muted-foreground"
                                                    >
                                                        {name}
                                                    </span>
                                                ))}
                                        </div>
                                        {item.note && (
                                            <p className="mt-0.5 truncate text-[10px] italic text-muted-foreground">
                                                &ldquo;{item.note}&rdquo;
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <p className="font-mono text-xs font-bold tabular-nums text-primary">
                                            ${item.price.toFixed(2)}
                                        </p>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon-xs"
                                                onClick={() => onEdit(item.id)}
                                            >
                                                <Pencil className="text-muted-foreground" />
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="icon-xs"
                                                onClick={() =>
                                                    onRemove(item.id)
                                                }
                                            >
                                                <Trash2 />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-2 flex items-center justify-end gap-2">
                                    <Button
                                        variant="outline"
                                        size="icon-xs"
                                        onClick={() =>
                                            onQuantityChange(item.id, -1)
                                        }
                                    >
                                        <Minus />
                                    </Button>
                                    <span className="w-4 text-center font-mono text-xs font-bold tabular-nums text-foreground">
                                        {item.quantity}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="icon-xs"
                                        onClick={() =>
                                            onQuantityChange(item.id, 1)
                                        }
                                    >
                                        <Plus />
                                    </Button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="border-t border-border bg-background px-4 py-3">
                <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="font-mono tabular-nums">
                        ${subtotal.toFixed(2)}
                    </span>
                </div>
                <div className="mb-2 flex justify-between text-xs text-muted-foreground">
                    <span>Tax (7%)</span>
                    <span className="font-mono tabular-nums">
                        ${tax.toFixed(2)}
                    </span>
                </div>
                <Separator className="mb-3" />
                <div className="mb-3 flex justify-between text-base font-bold text-foreground">
                    <span>Total</span>
                    <span className="font-mono tabular-nums text-primary">
                        ${total.toFixed(2)}
                    </span>
                </div>
                <Button
                    onClick={onConfirm}
                    disabled={items.length === 0}
                    className="h-11 w-full rounded-xl font-bold"
                >
                    Confirm
                </Button>
                <Button
                    variant="outline"
                    onClick={onReset}
                    className="mt-2 w-full rounded-xl text-xs font-semibold"
                >
                    Reset
                </Button>
            </div>
        </div>
    );
};

export default Cart;
