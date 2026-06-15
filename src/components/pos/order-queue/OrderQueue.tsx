import { useState } from "react";
import { ListOrdered, Coffee } from "lucide-react";
import type { Order } from "@/types/order";
import { usePendingOrders } from "@/hooks/usePendingOrders";
import { useCompleteOrder, useVoidOrder } from "@/hooks/useOrderMutations";
import { getTimeSince, isUrgent } from "@/lib/order-utils";
import OrderDetailModal from "./OrderDetailModal";
import { OrderQueueCard } from "./OrderQueueCard";
import { Skeleton } from "@/components/ui/skeleton";

export const OrderQueue = () => {
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const { data: orders, isLoading } = usePendingOrders();
    const completeMutation = useCompleteOrder();
    const voidMutation = useVoidOrder();

    const handleComplete = (orderId: string) => {
        completeMutation.mutate(orderId, {
            onSuccess: () => setSelectedOrder(null),
        });
    };

    const handleVoid = (orderId: string, reason: string) => {
        voidMutation.mutate(
            { orderId, reason },
            {
                onSuccess: () => setSelectedOrder(null),
            },
        );
    };

    if (isLoading) {
        return (
            <div className="flex h-full w-[220px] shrink-0 flex-col overflow-hidden border-r border-[var(--pos-border)] bg-[var(--pos-card)]">
                <div className="flex items-center justify-between border-b border-[var(--pos-border)] px-4 py-2.5">
                    <div className="flex items-center gap-2">
                        <ListOrdered className="size-4 text-[var(--pos-primary)]" />
                        <span className="font-sans text-[13px] font-medium text-[var(--pos-text)]">
                            Queue
                        </span>
                    </div>
                </div>
                <div className="flex flex-1 items-center justify-center gap-2">
                    <Skeleton className="size-4 rounded-full" />
                    <Skeleton className="h-4 w-20" />
                </div>
            </div>
        );
    }

    const pendingOrders = orders ?? [];

    return (
        <div className="flex h-full w-[220px] shrink-0 flex-col overflow-hidden border-r border-[var(--pos-border)] bg-[var(--pos-card)]">
            <div className="flex items-center justify-between border-b border-[var(--pos-border)] px-4 py-2.5">
                <div className="flex items-center gap-2">
                    <ListOrdered className="size-4 text-[var(--pos-primary)]" />
                    <span className="font-sans text-[13px] font-medium text-[var(--pos-text)]">
                        Queue
                    </span>
                </div>
                <span className="rounded-md border border-[var(--pos-border)] bg-[var(--pos-hover)] px-1.5 py-0.5 font-sans text-[10px] font-medium text-[var(--pos-text-muted)]">
                    {pendingOrders.length}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto px-2 py-2 pos-scroll">
                {pendingOrders.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center gap-2">
                        <Coffee className="size-7 text-[var(--pos-text-muted)]/40" />
                        <p className="text-[11px] text-[var(--pos-text-muted)]">
                            No orders
                        </p>
                    </div>
                ) : (
                    pendingOrders.map((order) => (
                        <OrderQueueCard
                            key={order.id}
                            order={order}
                            urgent={isUrgent(order.createdAt)}
                            timeSince={getTimeSince(order.createdAt)}
                            onClick={() => setSelectedOrder(order)}
                            onComplete={(e) => {
                                e.stopPropagation();
                                handleComplete(order.id);
                            }}
                            onVoid={(e) => {
                                e.stopPropagation();
                                handleVoid(order.id, "Voided from queue");
                            }}
                        />
                    ))
                )}
            </div>

            {selectedOrder && (
                <OrderDetailModal
                    order={selectedOrder}
                    onComplete={() => handleComplete(selectedOrder.id)}
                    onVoid={(reason) => handleVoid(selectedOrder.id, reason)}
                    onCancel={() => setSelectedOrder(null)}
                />
            )}
        </div>
    );
};

export default OrderQueue;
