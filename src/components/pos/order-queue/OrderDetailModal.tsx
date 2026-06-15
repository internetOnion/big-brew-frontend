import { useState } from "react";
import {
    CheckCircle,
    XCircle,
    ForkKnife,
    ShoppingBag,
    Clock,
} from "@phosphor-icons/react";
import type { Order, OrderItem } from "@/types/order";
import { cn } from "@/lib/utils";
import { getTimeSince, isUrgent } from "@/lib/order-utils";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { VoidConfirmForm } from "./VoidConfirmForm";

interface OrderDetailModalProps {
    order: Order;
    onComplete: () => void;
    onVoid: (reason: string) => void;
    onCancel: () => void;
}

const groupModifiers = (
    modifiers: { groupName?: string; name: string; price?: string }[],
): Record<string, typeof modifiers> => {
    const grouped: Record<string, typeof modifiers> = {};
    for (const m of modifiers) {
        const key = m.groupName || "Modifiers";
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(m);
    }
    return grouped;
};

export const OrderDetailModal = ({
    order,
    onComplete,
    onVoid,
    onCancel,
}: OrderDetailModalProps) => {
    const [showVoidConfirm, setShowVoidConfirm] = useState(false);

    const urgent = isUrgent(order.createdAt);
    const timeSince = getTimeSince(order.createdAt);

    const TypeIcon = order.diningOption === "dine_in" ? ForkKnife : ShoppingBag;

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
                                            {Object.entries(
                                                groupModifiers(item.modifiers),
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
                                            ))}
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
                    <VoidConfirmForm
                        onConfirm={(reason) => {
                            onVoid(reason);
                            setShowVoidConfirm(false);
                        }}
                        onCancel={() => setShowVoidConfirm(false)}
                    />
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
                            <CheckCircle />
                            Complete
                        </Button>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default OrderDetailModal;
