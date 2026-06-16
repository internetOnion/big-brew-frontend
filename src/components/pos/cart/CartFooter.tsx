import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface CartFooterProps {
    subtotal: number;
    tax: number;
    total: number;
    isEmpty: boolean;
    onConfirm: () => void;
    onReset: () => void;
}

export const CartFooter = ({
    subtotal,
    tax,
    total,
    isEmpty,
    onConfirm,
    onReset,
}: CartFooterProps) => (
    <div className="border-t border-(--pos-border) bg-(--pos-card) px-4 py-3">
        <div className="mb-1 flex justify-between text-[11px] text-(--pos-text-muted)">
            <span>Subtotal</span>
            <span className="font-mono tabular-nums">
                ${subtotal.toFixed(2)}
            </span>
        </div>
        <div className="mb-2 flex justify-between text-[11px] text-(--pos-text-muted)">
            <span>Tax (7%)</span>
            <span className="font-mono tabular-nums">${tax.toFixed(2)}</span>
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
            className="h-10 w-full rounded-lg bg-(--pos-primary) font-sans text-xs font-bold text-white hover:bg-[#3a1d0e] cursor-pointer"
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
