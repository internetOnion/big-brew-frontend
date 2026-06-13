import {
    X,
    CheckCircle2,
    XCircle,
    UtensilsCrossed,
    ShoppingBag,
    Clock,
} from "lucide-react";
import { type QueueItem } from "./data";
import { cn } from "@/lib/utils";

interface OrderDetailModalProps {
    order: QueueItem;
    onComplete: () => void;
    onVoid: () => void;
    onCancel: () => void;
}

export const OrderDetailModal = ({
    order,
    onComplete,
    onVoid,
    onCancel,
}: OrderDetailModalProps) => {
    const total = order.lineItems.reduce((sum, li) => sum + li.price, 0);
    const urgent = parseInt(order.time.replace(/\D/g, ""), 10) >= 8;
    const TypeIcon = order.type === "dine-in" ? UtensilsCrossed : ShoppingBag;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
        >
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onCancel}
            />
            <div
                className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
            >
                <div
                    className={cn(
                        "flex items-center justify-between px-5 py-4",
                        urgent
                            ? "border-b border-destructive/20 bg-destructive/8"
                            : "border-b border-border bg-background",
                    )}
                >
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                            <span className="text-sm font-bold font-mono text-white tabular-nums">
                                #{order.queueNumber}
                            </span>
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5">
                                <TypeIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-xs font-medium capitalize text-muted-foreground">
                                    {order.type}
                                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock
                                    className={cn(
                                        "h-3 w-3",
                                        urgent
                                            ? "text-destructive"
                                            : "text-muted-foreground",
                                    )}
                                />
                                <span
                                    className={cn(
                                        "text-xs font-medium font-mono tabular-nums",
                                        urgent
                                            ? "text-destructive"
                                            : "text-muted-foreground",
                                    )}
                                >
                                    {order.time}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onCancel}
                        className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-black/5"
                    >
                        <X className="h-5 w-5 text-muted-foreground" />
                    </button>
                </div>

                <div className="px-5 py-4">
                    <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Items
                    </h4>
                    <div className="flex flex-col gap-2">
                        {order.lineItems.map((li, idx) => (
                            <div
                                key={idx}
                                className="flex items-center justify-between rounded-lg bg-background px-3 py-2"
                            >
                                <div>
                                    <p className="text-sm font-medium text-foreground">
                                        {li.name}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground">
                                        {li.size && `Size: ${li.size} `}
                                        {li.sugarLevel &&
                                            `Sugar: ${li.sugarLevel} `}
                                        {li.toppings &&
                                            li.toppings.length > 0 &&
                                            `Toppings: ${li.toppings.join(", ")}`}
                                    </p>
                                </div>
                                <span className="text-sm font-semibold font-mono tabular-nums text-primary">
                                    ${li.price.toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-3 flex items-center justify-between rounded-lg bg-secondary px-3 py-2">
                        <span className="text-sm font-bold text-foreground">
                            Total
                        </span>
                        <span className="text-base font-bold font-mono tabular-nums text-primary">
                            ${total.toFixed(2)}
                        </span>
                    </div>
                </div>

                <div className="flex gap-2 border-t border-border px-5 pb-5 pt-1">
                    <button
                        onClick={onVoid}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-destructive py-2.5 text-sm font-bold text-destructive transition-all hover:bg-red-50"
                    >
                        <XCircle className="h-4 w-4" />
                        Void
                    </button>
                    <button
                        onClick={onComplete}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#5C8A5C] py-2.5 text-sm font-bold text-white transition-all hover:brightness-110 active:scale-95"
                    >
                        <CheckCircle2 className="h-4 w-4" />
                        Complete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailModal;
