import { useState } from "react";
import {
    CheckCircle2,
    XCircle,
    UtensilsCrossed,
    ShoppingBag,
    Clock,
} from "lucide-react";
import type { Order, OrderItem } from "@/types/order";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

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
        <Dialog open onOpenChange={(open) => !open && onCancel()}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div
                            className={cn(
                                "flex size-10 items-center justify-center rounded-xl",
                                urgent ? "bg-destructive" : "bg-primary",
                            )}
                        >
                            <span className="font-mono text-sm font-bold tabular-nums text-primary-foreground">
                                #{order.orderNumber}
                            </span>
                        </div>
                        <div>
                            <DialogTitle>
                                Order #{order.orderNumber}
                            </DialogTitle>
                            <div className="flex items-center gap-1.5">
                                <TypeIcon className="size-3.5 text-muted-foreground" />
                                <span className="text-xs font-medium capitalize text-muted-foreground">
                                    {order.diningOption === "dine_in"
                                        ? "dine-in"
                                        : "takeout"}
                                </span>
                                <Separator
                                    orientation="vertical"
                                    className="mx-1 h-3"
                                />
                                <Clock
                                    className={cn(
                                        "size-3",
                                        urgent
                                            ? "text-destructive"
                                            : "text-muted-foreground",
                                    )}
                                />
                                <span
                                    className={cn(
                                        "font-mono text-xs font-medium tabular-nums",
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
                </DialogHeader>

                <div>
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
                                                        className="text-[10px] leading-tight text-muted-foreground"
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
                                <span className="font-mono text-sm font-semibold tabular-nums text-primary">
                                    $
                                    {(
                                        parseFloat(item.unitPrice) *
                                        item.quantity
                                    ).toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>
                    <Separator className="my-3" />
                    <div className="flex items-center justify-between rounded-lg bg-secondary px-3 py-2">
                        <span className="text-sm font-bold text-foreground">
                            Total
                        </span>
                        <span className="font-mono text-base font-bold tabular-nums text-primary">
                            ${parseFloat(order.total).toFixed(2)}
                        </span>
                    </div>
                </div>

                {showVoidConfirm ? (
                    <div className="border-t border-border pt-4">
                        <h4 className="mb-2 text-sm font-bold text-foreground">
                            Void Order
                        </h4>
                        <p className="mb-3 text-xs text-muted-foreground">
                            Please provide a reason for voiding this order.
                        </p>
                        <Textarea
                            value={voidReason}
                            onChange={(e) => setVoidReason(e.target.value)}
                            placeholder="Enter reason..."
                            className="mb-3 border-border bg-background"
                            rows={2}
                        />
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowVoidConfirm(false);
                                    setVoidReason("");
                                }}
                                className="h-auto flex-1 py-2.5 font-bold"
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleVoid}
                                disabled={!voidReason.trim()}
                                className="h-auto flex-1 py-2.5 font-bold"
                            >
                                Confirm Void
                            </Button>
                        </div>
                    </div>
                ) : (
                    <DialogFooter>
                        <Button
                            variant="destructive"
                            onClick={() => setShowVoidConfirm(true)}
                            className="h-auto flex-1 py-2.5"
                        >
                            <XCircle />
                            Void
                        </Button>
                        <Button
                            onClick={onComplete}
                            className="h-auto flex-1 rounded-xl bg-chart-4 py-2.5 font-bold hover:brightness-110"
                        >
                            <CheckCircle2 />
                            Complete
                        </Button>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default OrderDetailModal;
