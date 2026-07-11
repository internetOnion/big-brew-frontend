import { motion } from "motion/react";
import { getCategoryIcon } from "@/lib/category-icons";
import { getCategoryIconName } from "@/types/menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { CartItem } from "@/types/cart";
import type { Currency, Discount } from "@/types/order";

interface PaymentOrderSummaryProps {
    cartItems: CartItem[];
    currency: Currency;
    onCurrencyChange: (c: Currency) => void;
    khrRate: number;
    isFullyPaid: boolean;
    isProcessing: boolean;
    onConfirm: () => void;
    resetInput: () => void;
    discountAmount: number;
    discountId: string | null;
    activeDiscounts: Discount[];
}

const prefersReducedMotion =
    typeof window !== "undefined"
        ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
        : false;

export const PaymentOrderSummary = ({
    cartItems,
    currency,
    onCurrencyChange,
    khrRate,
    isFullyPaid,
    isProcessing,
    onConfirm,
    resetInput,
    discountAmount,
    discountId,
    activeDiscounts,
}: PaymentOrderSummaryProps) => {
    const selectedDiscount = activeDiscounts.find((d) => d.id === discountId);
    const formatDiscountValue = (d: Discount) => {
        if (d.type === "percentage") return `${d.value}%`;
        if (d.type === "fixed_amount")
            return `${currency === "KHR" ? "៛" : "$"}${Number(d.value).toFixed(2)}`;
        return "BOGO";
    };

    return (
        <div className="flex w-[280px] flex-col border-l border-(--pos-border) bg-(--pos-card)">
            <div className="px-4 pt-4">
                <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.1em] text-(--pos-text-muted)">
                    Order Summary
                </p>
                <div className="mb-3 flex overflow-hidden rounded-lg bg-(--pos-hover) p-0.5 gap-0.5">
                    {(["USD", "KHR"] as const).map((c) => (
                        <Button
                            key={c}
                            variant={currency === c ? "default" : "ghost"}
                            size="sm"
                            onClick={() => {
                                onCurrencyChange(c);
                                resetInput();
                            }}
                            className="flex-1 font-mono font-semibold"
                        >
                            {c === "USD" ? "$ USD" : "៛ KHR"}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 pb-3 scrollbar-hide">
                {cartItems.map((item: CartItem) => {
                    const Icon = getCategoryIcon(
                        getCategoryIconName(item.category),
                    );
                    return (
                        <div
                            key={item.id}
                            className="flex items-start gap-2 border-b border-(--pos-border) py-2 pl-1"
                        >
                            <Icon
                                size={14}
                                strokeWidth={1.5}
                                className="mt-0.5 shrink-0 text-(--pos-primary)"
                            />
                            <div className="min-w-0 flex-1">
                                <p className="text-[12px] font-medium text-(--pos-text)">
                                    {item.quantity > 1 && (
                                        <span className="font-bold text-(--pos-accent)">
                                            {item.quantity}×{" "}
                                        </span>
                                    )}
                                    {item.name}
                                </p>
                                <div className="mt-[3px] flex flex-wrap gap-[3px_4px]">
                                    {item.size && (
                                        <Badge
                                            variant="secondary"
                                            className="px-1.5 py-px text-[10px]"
                                        >
                                            {item.size}
                                        </Badge>
                                    )}
                                    {item.sugarLevel &&
                                        item.sugarLevel !== "50%" && (
                                            <Badge
                                                variant="secondary"
                                                className="px-1.5 py-px text-[10px]"
                                            >
                                                Sugar {item.sugarLevel}
                                            </Badge>
                                        )}
                                    {item.toppings.map(
                                        (
                                            topping: (typeof item.toppings)[number],
                                        ) => (
                                            <Badge
                                                key={topping.name}
                                                variant="secondary"
                                                className="px-1.5 py-px text-[10px]"
                                            >
                                                {topping.qty > 1
                                                    ? `${topping.qty}× `
                                                    : "+"}
                                                {topping.name}
                                            </Badge>
                                        ),
                                    )}
                                </div>
                            </div>
                            <span className="shrink-0 text-right font-mono text-[12px] font-semibold text-(--pos-text)">
                                {currency === "KHR"
                                    ? "៛" +
                                      Math.round(
                                          item.price * khrRate,
                                      ).toLocaleString()
                                    : "$" + item.price.toFixed(2)}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Discount summary */}
            {discountId && selectedDiscount && discountAmount > 0 && (
                <div className="flex items-center justify-between border-t border-(--pos-border) px-4 py-2">
                    <span className="text-[11px] text-(--pos-primary)">
                        Discount ({selectedDiscount.name}{" "}
                        {formatDiscountValue(selectedDiscount)})
                    </span>
                    <span className="font-mono text-[12px] font-semibold tabular-nums text-(--pos-primary)">
                        -
                        {currency === "KHR"
                            ? "៛" +
                              Math.round(
                                  discountAmount * khrRate,
                              ).toLocaleString()
                            : "$" + discountAmount.toFixed(2)}
                    </span>
                </div>
            )}

            <div className="border-t border-(--pos-border) p-4 pb-5">
                <motion.div
                    animate={
                        isFullyPaid && !isProcessing && !prefersReducedMotion
                            ? { scale: [1, 1.01, 1] }
                            : { scale: 1 }
                    }
                    transition={
                        isFullyPaid && !isProcessing && !prefersReducedMotion
                            ? {
                                  duration: 1.6,
                                  repeat: Infinity,
                                  ease: "easeInOut",
                              }
                            : {}
                    }
                >
                    <Button
                        onClick={onConfirm}
                        disabled={!isFullyPaid || isProcessing}
                        className="h-auto w-full flex-col gap-1 py-4 rounded-lg"
                    >
                        <span className="text-[15px] font-bold">
                            {isProcessing ? "Processing..." : "Confirm Payment"}
                        </span>
                        {!isFullyPaid && !isProcessing && (
                            <span className="text-[10px] opacity-70">
                                Enter full amount
                            </span>
                        )}
                    </Button>
                </motion.div>
            </div>
        </div>
    );
};
