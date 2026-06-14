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
    <div className="border-t border-border bg-background px-4 py-3">
        <div className="mb-1 flex justify-between text-xs text-muted-foreground">
            <span>Subtotal</span>
            <span className="font-mono tabular-nums">
                ${subtotal.toFixed(2)}
            </span>
        </div>
        <div className="mb-2 flex justify-between text-xs text-muted-foreground">
            <span>Tax (7%)</span>
            <span className="font-mono tabular-nums">${tax.toFixed(2)}</span>
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
            disabled={isEmpty}
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
);
