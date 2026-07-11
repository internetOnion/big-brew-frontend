import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBagIcon } from "@phosphor-icons/react";
import { usePOS } from "@/hooks/usePos";
import { ROUTES } from "@/lib/constants";
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
        discountId,
        setDiscountId,
        activeDiscounts,
        discountAmount,
        discountHint,
    } = usePOS();
    const navigate = useNavigate();

    const onConfirm = useCallback(() => navigate(ROUTES.PAYMENT), [navigate]);
    const subtotal = useMemo(
        () => cartItems.reduce((sum, item) => sum + item.price, 0),
        [cartItems],
    );
    const tax = useMemo(() => subtotal * 0.07, [subtotal]);
    const total = useMemo(
        () => subtotal + tax - discountAmount,
        [subtotal, tax, discountAmount],
    );

    return (
        <div className="flex h-full w-[270px] shrink-0 flex-col overflow-hidden border-l border-(--pos-border) bg-(--pos-card)">
            <div className="flex items-center justify-between border-b border-(--pos-border) px-4 py-2.5">
                <div className="flex items-center gap-2">
                    <ShoppingBagIcon className="size-4 text-(--pos-primary)" />
                    <span className="font-sans text-[13px] font-medium text-(--pos-text)">
                        Order
                    </span>
                    <span className="rounded-md border border-(--pos-border) bg-(--pos-hover) px-1.5 py-0.5 font-sans text-[10px] font-medium text-(--pos-text-muted)">
                        {cartItems.reduce((sum, i) => sum + i.quantity, 0)}
                    </span>
                </div>
            </div>

            <OrderTypeToggle value={orderType} onChange={setOrderType} />

            <div className="flex-1 overflow-y-auto px-3 py-2 pos-scroll">
                {cartItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-12">
                        <svg
                            viewBox="0 0 48 52"
                            className="size-12"
                            fill="none"
                        >
                            <path
                                d="M8 12h32l-3 28c-0.5 4-3.5 7-7.5 7h-11c-4 0-7-3-7.5-7L8 12Z"
                                className="fill-border"
                            />
                            <rect
                                x="10"
                                y="2"
                                width="28"
                                height="4"
                                rx="1"
                                className="fill-muted-foreground/20"
                            />
                            <path
                                d="M34 12c0 0 4 4 4 10s-4 10-4 10"
                                className="fill-none stroke-border"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                        </svg>
                        <p className="text-center text-xs text-muted-foreground">
                            No items yet
                            <br />
                            <span className="text-[11px] opacity-70">
                                Tap a drink to start
                            </span>
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
                discountAmount={discountAmount}
                discountId={discountId}
                activeDiscounts={activeDiscounts}
                onDiscountChange={setDiscountId}
                discountHint={discountHint}
                isEmpty={cartItems.length === 0}
                onConfirm={onConfirm}
                onReset={resetCart}
            />
        </div>
    );
};

export default Cart;
