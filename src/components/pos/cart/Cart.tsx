import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { usePOS } from "@/hooks/usePos";
import { ROUTES } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { OrderTypeToggle } from "./OrderTypeToggle";
import { CartItemCard } from "./CartItemCard";
import { CartFooter } from "./CartFooter";

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

    const onConfirm = useCallback(() => navigate(ROUTES.PAYMENT), [navigate]);
    const subtotal = useMemo(
        () => cartItems.reduce((sum, item) => sum + item.price, 0),
        [cartItems],
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
                        {cartItems.reduce((sum, i) => sum + i.quantity, 0)}
                    </Badge>
                </div>
            </div>

            <OrderTypeToggle value={orderType} onChange={setOrderType} />

            <div className="flex-1 overflow-y-auto px-3 py-2 pos-scroll">
                {cartItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <ShoppingBag className="mb-2 size-10 text-border" />
                        <p className="text-xs text-muted-foreground">
                            Cart is empty
                        </p>
                    </div>
                ) : (
                    cartItems.map((item) => (
                        <CartItemCard
                            key={item.id}
                            item={item}
                            onEdit={startEdit}
                            onRemove={removeItem}
                            onQuantityChange={changeQuantity}
                        />
                    ))
                )}
            </div>

            <CartFooter
                subtotal={subtotal}
                tax={tax}
                total={total}
                isEmpty={cartItems.length === 0}
                onConfirm={onConfirm}
                onReset={resetCart}
            />
        </div>
    );
};

export default Cart;
