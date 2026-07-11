import { TagIcon, XIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { Discount } from "@/types/order";

interface CartFooterProps {
    subtotal: number;
    tax: number;
    total: number;
    discountAmount: number;
    discountId: string | null;
    activeDiscounts: Discount[];
    onDiscountChange: (id: string | null) => void;
    discountHint: string | null;
    isEmpty: boolean;
    onConfirm: () => void;
    onReset: () => void;
}

const formatDiscountValue = (d: Discount) => {
    if (d.type === "percentage") return `${d.value}%`;
    if (d.type === "fixed_amount") return `$${Number(d.value).toFixed(2)}`;
    return "Buy 1 Get 1";
};

export const CartFooter = ({
    subtotal,
    tax,
    total,
    discountAmount,
    discountId,
    activeDiscounts,
    onDiscountChange,
    discountHint,
    isEmpty,
    onConfirm,
    onReset,
}: CartFooterProps) => {
    const selectedDiscount = activeDiscounts.find((d) => d.id === discountId);

    return (
        <div className="border-t border-(--pos-border) bg-(--pos-card) px-4 py-3">
            <div className="mb-1 flex justify-between text-[11px] text-(--pos-text-muted)">
                <span>Subtotal</span>
                <span className="font-mono tabular-nums">
                    ${subtotal.toFixed(2)}
                </span>
            </div>

            {/* Discount selector */}
            {!isEmpty && activeDiscounts.length > 0 && (
                <div className="mb-1 flex items-center gap-1.5">
                    <TagIcon className="size-3 shrink-0 text-(--pos-text-muted)" />
                    {discountId ? (
                        <div className="flex flex-1 flex-col gap-0.5">
                            <div className="flex items-center gap-1">
                                <span className="flex-1 truncate text-[11px] text-(--pos-primary)">
                                    {selectedDiscount?.name}{" "}
                                    <span className="text-(--pos-text-muted)">
                                        (
                                        {formatDiscountValue(selectedDiscount!)}
                                        )
                                    </span>
                                </span>
                                {discountAmount > 0 && (
                                    <span className="font-mono text-[11px] tabular-nums text-(--pos-primary)">
                                        -${discountAmount.toFixed(2)}
                                    </span>
                                )}
                                <button
                                    onClick={() => onDiscountChange(null)}
                                    className="ml-0.5 flex size-4 shrink-0 items-center justify-center rounded-sm text-(--pos-text-muted) hover:text-(--pos-text) cursor-pointer"
                                    aria-label="Remove discount"
                                >
                                    <XIcon className="size-3" />
                                </button>
                            </div>
                            {discountHint && (
                                <p className="text-[10px] text-(--pos-text-muted)">
                                    {discountHint}
                                </p>
                            )}
                        </div>
                    ) : (
                        <Select
                            value=""
                            onValueChange={(v) =>
                                onDiscountChange(v === "__none__" ? null : v)
                            }
                        >
                            <SelectTrigger className="h-6 flex-1 border-0 bg-transparent p-0 text-[11px] text-(--pos-text-muted) shadow-none focus:ring-0 [&>span]:truncate">
                                <SelectValue placeholder="Apply discount..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__none__">
                                    No discount
                                </SelectItem>
                                {activeDiscounts.map((d) => (
                                    <SelectItem key={d.id} value={d.id}>
                                        {d.name} ({formatDiscountValue(d)})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>
            )}

            <div className="mb-2 flex justify-between text-[11px] text-(--pos-text-muted)">
                <span>Tax (7%)</span>
                <span className="font-mono tabular-nums">
                    ${tax.toFixed(2)}
                </span>
            </div>
            <Separator className="mb-3" />
            <div className="mb-3 flex justify-between text-[13px] font-bold text-(--pos-text)">
                <span>Total</span>
                <span className="font-mono tabular-nums text-(--pos-primary)">
                    ${total.toFixed(2)}
                </span>
            </div>
            <Button
                onClick={onConfirm}
                disabled={isEmpty}
                className="h-10 w-full rounded-lg bg-(--pos-primary) font-sans text-xs font-bold text-white hover:bg-(--pos-primary)/80 cursor-pointer"
            >
                Confirm
            </Button>
            <Button
                variant="outline"
                onClick={onReset}
                className="mt-2 h-8 w-full rounded-lg text-[11px] font-medium"
            >
                Reset
            </Button>
        </div>
    );
};
