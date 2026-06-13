import { useState } from "react";
import {
    ListOrdered,
    UtensilsCrossed,
    ShoppingBag,
    CheckCircle2,
    XCircle,
    Clock,
    Coffee,
    Milk,
    Leaf,
    GlassWater,
    Croissant,
} from "lucide-react";
import { type QueueItem, CATEGORY_ICONS, INITIAL_QUEUE } from "./data";
import OrderDetailModal from "./OrderDetailModal";

const categoryIconMap: Record<string, React.ElementType> = {
    Coffee,
    Milk,
    Leaf,
    GlassWater,
    Croissant,
};

const parseTime = (timeStr: string): number => {
    const match = timeStr.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
};

const nameToCategory: Record<string, string> = {
    espresso: "espresso",
    americano: "espresso",
    cappuccino: "espresso",
    macchiato: "espresso",
    latte: "milk",
    "flat white": "milk",
    "oat latte": "milk",
    cortado: "milk",
    "matcha latte": "tea",
    "chai latte": "tea",
    "earl grey": "tea",
    "cold brew": "cold",
    "iced latte": "cold",
    frappuccino: "cold",
    croissant: "food",
    "banana bread": "food",
    "avocado toast": "food",
    "granola bowl": "food",
};

export const OrderQueue = () => {
    const [queue, setQueue] = useState<QueueItem[]>(INITIAL_QUEUE);
    const [selectedOrder, setSelectedOrder] = useState<QueueItem | null>(null);

    const handleComplete = (queueNumber: number) => {
        setQueue((prev) => prev.filter((q) => q.queueNumber !== queueNumber));
        setSelectedOrder(null);
    };

    const handleVoid = (queueNumber: number) => {
        setQueue((prev) => prev.filter((q) => q.queueNumber !== queueNumber));
        setSelectedOrder(null);
    };

    const isUrgent = (time: string) => parseTime(time) >= 8;

    const handleCompleteClick = (queueNumber: number, e: React.MouseEvent) => {
        e.stopPropagation();
        handleComplete(queueNumber);
    };

    const handleVoidClick = (queueNumber: number, e: React.MouseEvent) => {
        e.stopPropagation();
        handleVoid(queueNumber);
    };

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
                    {queue.length}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto px-2 py-2">
                    {queue.map((order) => {
                        const urgent = isUrgent(order.time);
                        const TypeIcon =
                            order.type === "dine-in"
                                ? UtensilsCrossed
                                : ShoppingBag;
                        return (
                            <div
                                key={order.queueNumber}
                                onClick={() => setSelectedOrder(order)}
                                className={`mb-2 flex w-full cursor-pointer flex-col rounded-xl p-2.5 text-left transition-transform hover:scale-[1.01] active:scale-[0.99] ${urgent ? "border border-destructive/30 bg-destructive/6" : "border border-border bg-card"}`}
                            >
                                <div className="mb-1.5 flex items-center justify-between">
                                    <span className="font-mono text-xs font-bold tabular-nums text-primary">
                                        #{order.queueNumber}
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                        <TypeIcon className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-[10px] capitalize text-muted-foreground">
                                            {order.type}
                                        </span>
                                    </div>
                                </div>
                                <div className="mb-2 flex flex-col gap-0.5">
                                    {order.lineItems.map((li, idx) => {
                                        const cat =
                                            nameToCategory[
                                                li.name.toLowerCase()
                                            ] || "espresso";
                                        const CategoryIcon =
                                            categoryIconMap[
                                                CATEGORY_ICONS[cat]
                                            ] || Coffee;
                                        return (
                                            <div
                                                key={idx}
                                                className="flex items-center gap-1"
                                            >
                                                <CategoryIcon className="h-3 w-3 shrink-0 text-muted-foreground" />
                                                <span className="truncate text-[11px] font-medium text-foreground">
                                                    {li.name}
                                                    {li.size && ` (${li.size})`}
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
                                            {order.time}
                                        </span>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={(e) =>
                                                handleCompleteClick(
                                                    order.queueNumber,
                                                    e,
                                                )
                                            }
                                            className="flex h-6 w-6 items-center justify-center rounded-md transition-colors hover:bg-green-50"
                                            title="Done"
                                        >
                                            <CheckCircle2 className="h-3.5 w-3.5 text-[#5C8A5C]" />
                                        </button>
                                        <button
                                            onClick={(e) =>
                                                handleVoidClick(
                                                    order.queueNumber,
                                                    e,
                                                )
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
                    })}
            </div>

            {selectedOrder && (
                    <OrderDetailModal
                        order={selectedOrder}
                        onComplete={() =>
                            handleComplete(selectedOrder.queueNumber)
                        }
                        onVoid={() => handleVoid(selectedOrder.queueNumber)}
                        onCancel={() => setSelectedOrder(null)}
                    />
                )}
        </div>
    );
};

export default OrderQueue;
