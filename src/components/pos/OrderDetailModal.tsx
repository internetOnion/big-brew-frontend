import { useState } from "react";
import {
    X,
    CheckCircle2,
    XCircle,
    UtensilsCrossed,
    ShoppingBag,
    Clock,
} from "lucide-react";
import type { Order, OrderItem } from "@/types/order";
import { cn } from "@/lib/utils";

interface OrderDetailModalProps {
    order: Order;
    onComplete: () => void;
    onVoid: (reason: string) => void;
    onCancel: () => void;
}

export const OrderDetailModal = ({
    order,
    onComplete,
    onVoid,
    onCancel,
}: OrderDetailModalProps) => {
    const [showVoidConfirm, setShowVoidConfirm] = useState(false);
    const [voidReason, setVoidReason] = useState("");

    const urgent = (() => {
        const now = new Date();
        const created = new Date(order.createdAt);
        const diffMs = now.getTime() - created.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        return diffMins >= 8;
    })();

    const timeSince = (() => {
        const now = new Date();
        const created = new Date(order.createdAt);
        const diffMs = now.getTime() - created.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return "Just now";
        if (diffMins === 1) return "1m";
        return `${diffMins}m`;
    })();

    const TypeIcon =
        order.diningOption === "dine_in" ? UtensilsCrossed : ShoppingBag;

    const handleVoid = () => {
        if (voidReason.trim()) {
            onVoid(voidReason.trim());
            setShowVoidConfirm(false);
            setVoidReason("");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onCancel}
            />
            <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
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
                                #{order.orderNumber}
                            </span>
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5">
                                <TypeIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-xs font-medium capitalize text-muted-foreground">
                                    {order.diningOption === "dine_in"
                                        ? "dine-in"
                                        : "takeout"}
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
                                    {timeSince}
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
                        {order.items.map((item: OrderItem) => (
                            <div
                                key={item.id}
                                className="flex items-center justify-between rounded-lg bg-background px-3 py-2"
                            >
                                <div>
                                    <p className="text-sm font-medium text-foreground">
                                        {item.quantity > 1 &&
                                            `${item.quantity}x `}
                                        {item.name}
                                    </p>
                                    {item.modifiers.length > 0 && (
                                        <div className="mt-0.5 flex flex-col gap-0.5">
                                            {(() => {
                                                const grouped: Record<
                                                    string,
                                                    typeof item.modifiers
                                                > = {};
                                                for (const m of item.modifiers) {
                                                    const key =
                                                        m.groupName ||
                                                        "Modifiers";
                                                    if (!grouped[key])
                                                        grouped[key] = [];
                                                    grouped[key].push(m);
                                                }
                                                return Object.entries(
                                                    grouped,
                                                ).map(([group, mods]) => (
                                                    <div
                                                        key={group}
                                                        className="text-[10px] text-muted-foreground leading-tight"
                                                    >
                                                        <span className="font-semibold text-foreground">
                                                            {group}:{" "}
                                                        </span>
                                                        {mods
                                                            .map((m) =>
                                                                m.price &&
                                                                parseFloat(
                                                                    m.price,
                                                                ) > 0
                                                                    ? `${m.name} (+$${parseFloat(m.price).toFixed(2)})`
                                                                    : m.name,
                                                            )
                                                            .join(", ")}
                                                    </div>
                                                ));
                                            })()}
                                        </div>
                                    )}
                                </div>
                                <span className="text-sm font-semibold font-mono tabular-nums text-primary">
                                    $
                                    {(
                                        parseFloat(item.unitPrice) *
                                        item.quantity
                                    ).toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-3 flex items-center justify-between rounded-lg bg-secondary px-3 py-2">
                        <span className="text-sm font-bold text-foreground">
                            Total
                        </span>
                        <span className="text-base font-bold font-mono tabular-nums text-primary">
                            ${parseFloat(order.total).toFixed(2)}
                        </span>
                    </div>
                </div>

                {showVoidConfirm ? (
                    <div className="border-t border-border px-5 pb-5 pt-4">
                        <h4 className="mb-2 text-sm font-bold text-foreground">
                            Void Order
                        </h4>
                        <p className="mb-3 text-xs text-muted-foreground">
                            Please provide a reason for voiding this order.
                        </p>
                        <textarea
                            value={voidReason}
                            onChange={(e) => setVoidReason(e.target.value)}
                            placeholder="Enter reason..."
                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary mb-3"
                            rows={2}
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setShowVoidConfirm(false);
                                    setVoidReason("");
                                }}
                                className="flex-1 rounded-xl border border-border py-2.5 text-sm font-bold text-foreground transition-all hover:bg-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleVoid}
                                disabled={!voidReason.trim()}
                                className={cn(
                                    "flex-1 rounded-xl py-2.5 text-sm font-bold text-white transition-all",
                                    voidReason.trim()
                                        ? "bg-destructive hover:brightness-110"
                                        : "bg-destructive/50 cursor-not-allowed",
                                )}
                            >
                                Confirm Void
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex gap-2 border-t border-border px-5 pb-5 pt-1">
                        <button
                            onClick={() => setShowVoidConfirm(true)}
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
                )}
            </div>
        </div>
    );
};

export default OrderDetailModal;
