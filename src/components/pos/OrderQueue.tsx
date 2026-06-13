import { useState, useEffect, useCallback } from "react";
import {
    ListOrdered,
    UtensilsCrossed,
    ShoppingBag,
    CheckCircle2,
    XCircle,
    Clock,
    Coffee,
} from "lucide-react";
import type { Order, OrderItem } from "@/types/order";
import api from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import OrderDetailModal from "./OrderDetailModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const POLL_INTERVAL = 10000; // 10 seconds

const getTimeSince = (createdAt: string): string => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins === 1) return "1m";
    return `${diffMins}m`;
};

const isUrgent = (createdAt: string): boolean => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    return diffMins >= 8;
};

export const OrderQueue = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchOrders = useCallback(async () => {
        try {
            const { data } = await api.get<Order[]>(ENDPOINTS.ORDERS.BASE, {
                params: { status: "pending" },
            });
            setOrders(data);
        } catch {
            // Error is handled by the API interceptor
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, POLL_INTERVAL);
        return () => clearInterval(interval);
    }, [fetchOrders]);

    const handleComplete = async (orderId: string) => {
        try {
            await api.patch(ENDPOINTS.ORDERS.STATUS(orderId), {
                status: "completed",
            });
            setOrders((prev) => prev.filter((o) => o.id !== orderId));
            setSelectedOrder(null);
        } catch {
            // Error is handled by the API interceptor
        }
    };

    const handleVoid = async (orderId: string, reason: string) => {
        try {
            await api.post(ENDPOINTS.ORDERS.VOID_REQUEST(orderId), { reason });
            setOrders((prev) => prev.filter((o) => o.id !== orderId));
            setSelectedOrder(null);
        } catch {
            // Error is handled by the API interceptor
        }
    };

    const handleCompleteClick = (orderId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        handleComplete(orderId);
    };

    const handleVoidClick = (orderId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        handleVoid(orderId, "Voided from queue");
    };

    if (isLoading) {
        return (
            <div className="flex h-full w-[220px] shrink-0 flex-col overflow-hidden border-r border-border bg-background">
                <div className="flex items-center justify-between border-b border-border px-3 py-3">
                    <div className="flex items-center gap-2">
                        <ListOrdered className="size-4 text-primary" />
                        <span className="font-sans text-sm font-bold text-foreground">
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

    return (
        <div className="flex h-full w-[220px] shrink-0 flex-col overflow-hidden border-r border-border bg-background">
            <div className="flex items-center justify-between border-b border-border px-3 py-3">
                <div className="flex items-center gap-2">
                    <ListOrdered className="size-4 text-primary" />
                    <span className="font-sans text-sm font-bold text-foreground">
                        Queue
                    </span>
                </div>
                <Badge variant="default">{orders.length}</Badge>
            </div>

            <div className="flex-1 overflow-y-auto px-2 py-2 pos-scroll">
                {orders.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                        <Coffee className="mb-2 size-8 opacity-50" />
                        <p className="text-xs">No orders in queue</p>
                    </div>
                ) : (
                    orders.map((order) => {
                        const urgent = isUrgent(order.createdAt);
                        const timeSince = getTimeSince(order.createdAt);
                        const TypeIcon =
                            order.diningOption === "dine_in"
                                ? UtensilsCrossed
                                : ShoppingBag;
                        return (
                            <div
                                key={order.id}
                                onClick={() => setSelectedOrder(order)}
                                className={cn(
                                    "mb-2 flex w-full cursor-pointer flex-col rounded-xl border p-2.5 text-left transition-transform hover:scale-[1.01] active:scale-[0.99]",
                                    urgent
                                        ? "border-destructive/30 bg-destructive/8"
                                        : "border-border bg-card",
                                )}
                            >
                                <div className="mb-1.5 flex items-center justify-between">
                                    <span className="font-mono text-xs font-bold tabular-nums text-primary">
                                        #{order.orderNumber}
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                        <TypeIcon className="size-3 text-muted-foreground" />
                                        <span className="text-[10px] capitalize text-muted-foreground">
                                            {order.diningOption === "dine_in"
                                                ? "dine-in"
                                                : "takeout"}
                                        </span>
                                    </div>
                                </div>
                                <div className="mb-2 flex flex-col gap-0.5">
                                    {order.items.map((item: OrderItem) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center gap-1"
                                        >
                                            <Coffee className="size-3 shrink-0 text-muted-foreground" />
                                            <span className="truncate text-[11px] font-medium text-foreground">
                                                {item.quantity > 1 &&
                                                    `${item.quantity}× `}
                                                {item.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1">
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
                                                "font-mono text-[10px] font-medium tabular-nums",
                                                urgent
                                                    ? "text-destructive"
                                                    : "text-muted-foreground",
                                            )}
                                        >
                                            {timeSince}
                                        </span>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon-xs"
                                            onClick={(e) =>
                                                handleCompleteClick(order.id, e)
                                            }
                                            title="Done"
                                        >
                                            <CheckCircle2 className="text-chart-4" />
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="icon-xs"
                                            onClick={(e) =>
                                                handleVoidClick(order.id, e)
                                            }
                                            title="Void"
                                        >
                                            <XCircle />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
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
