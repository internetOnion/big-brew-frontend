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
        // For quick void from queue, use a default reason
        handleVoid(orderId, "Voided from queue");
    };

    if (isLoading) {
        return (
            <div className="flex h-full w-[220px] shrink-0 flex-col overflow-hidden border-r border-border bg-background">
                <div className="flex items-center justify-between border-b border-border px-3 py-3">
                    <div className="flex items-center gap-2">
                        <ListOrdered className="h-4 w-4 text-primary" />
                        <span className="font-sans text-sm font-bold text-foreground">
                            Queue
                        </span>
                    </div>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full w-[220px] shrink-0 flex-col overflow-hidden border-r border-border bg-background">
            <div className="flex items-center justify-between border-b border-border px-3 py-3">
                <div className="flex items-center gap-2">
                    <ListOrdered className="h-4 w-4 text-primary" />
                    <span className="font-sans text-sm font-bold text-foreground">
                        Queue
                    </span>
                </div>
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-white">
                    {orders.length}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto px-2 py-2">
                {orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <Coffee className="h-8 w-8 mb-2 opacity-50" />
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
                                className={`mb-2 flex w-full cursor-pointer flex-col rounded-xl p-2.5 text-left transition-transform hover:scale-[1.01] active:scale-[0.99] ${urgent ? "border border-destructive/30 bg-destructive/6" : "border border-border bg-card"}`}
                            >
                                <div className="mb-1.5 flex items-center justify-between">
                                    <span className="font-mono text-xs font-bold tabular-nums text-primary">
                                        #{order.orderNumber}
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                        <TypeIcon className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-[10px] capitalize text-muted-foreground">
                                            {order.diningOption === "dine_in"
                                                ? "dine-in"
                                                : "takeout"}
                                        </span>
                                    </div>
                                </div>
                                <div className="mb-2 flex flex-col gap-0.5">
                                    {order.items.map((item: OrderItem) => {
                                        const CategoryIcon = Coffee;
                                        return (
                                            <div
                                                key={item.id}
                                                className="flex items-center gap-1"
                                            >
                                                <CategoryIcon className="h-3 w-3 shrink-0 text-muted-foreground" />
                                                <span className="truncate text-[11px] font-medium text-foreground">
                                                    {item.quantity > 1 &&
                                                        `${item.quantity}× `}
                                                    {item.name}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                        <Clock
                                            className={`h-3 w-3 ${urgent ? "text-destructive" : "text-muted-foreground"}`}
                                        />
                                        <span
                                            className={`font-mono text-[10px] font-medium tabular-nums ${urgent ? "text-destructive" : "text-muted-foreground"}`}
                                        >
                                            {timeSince}
                                        </span>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={(e) =>
                                                handleCompleteClick(order.id, e)
                                            }
                                            className="flex h-6 w-6 items-center justify-center rounded-md transition-colors hover:bg-green-50"
                                            title="Done"
                                        >
                                            <CheckCircle2 className="h-3.5 w-3.5 text-[#5C8A5C]" />
                                        </button>
                                        <button
                                            onClick={(e) =>
                                                handleVoidClick(order.id, e)
                                            }
                                            className="flex h-6 w-6 items-center justify-center rounded-md transition-colors hover:bg-red-50"
                                            title="Void"
                                        >
                                            <XCircle className="h-3.5 w-3.5 text-destructive" />
                                        </button>
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
