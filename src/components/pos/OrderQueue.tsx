import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
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

    return (
        <div
            className="flex h-full w-[220px] shrink-0 flex-col overflow-hidden"
            style={{
                background: "#F4EFE8",
                borderRight: "1px solid #E2D8CC",
            }}
        >
            {/* Header */}
            <div
                className="flex items-center justify-between px-3 py-3"
                style={{ borderBottom: "1px solid #E2D8CC" }}
            >
                <div className="flex items-center gap-2">
                    <ListOrdered
                        className="h-4 w-4"
                        style={{ color: "#4A2512" }}
                    />
                    <span
                        className="text-sm font-bold"
                        style={{
                            fontFamily: "'Bricolage Grotesque', sans-serif",
                            color: "#1A0F0A",
                        }}
                    >
                        Queue
                    </span>
                </div>
                <span
                    className="flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold text-white"
                    style={{ background: "#4A2512" }}
                >
                    {queue.length}
                </span>
            </div>

            {/* Queue Items */}
            <div className="flex-1 overflow-y-auto px-2 py-2">
                <AnimatePresence initial={false}>
                    {queue.map((order) => {
                        const urgent = isUrgent(order.time);
                        const TypeIcon =
                            order.type === "dine-in"
                                ? UtensilsCrossed
                                : ShoppingBag;
                        return (
                            <motion.button
                                key={order.queueNumber}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{
                                    opacity: 0,
                                    x: -50,
                                    height: 0,
                                    marginBottom: 0,
                                }}
                                onClick={() => setSelectedOrder(order)}
                                className="mb-2 flex w-full flex-col rounded-xl p-2.5 text-left transition-transform hover:scale-[1.01] active:scale-[0.99]"
                                style={{
                                    background: urgent
                                        ? "rgba(192,57,43,0.06)"
                                        : "#FFFFFF",
                                    border: urgent
                                        ? "1px solid rgba(192,57,43,0.3)"
                                        : "1px solid #E2D8CC",
                                }}
                            >
                                <div className="mb-1.5 flex items-center justify-between">
                                    <span
                                        className="text-xs font-bold tabular-nums"
                                        style={{
                                            fontFamily: "'DM Mono', monospace",
                                            color: "#4A2512",
                                        }}
                                    >
                                        #{order.queueNumber}
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                        <TypeIcon
                                            className="h-3 w-3"
                                            style={{ color: "#8B7A67" }}
                                        />
                                        <span
                                            className="text-[10px] capitalize"
                                            style={{ color: "#8B7A67" }}
                                        >
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
                                                <CategoryIcon
                                                    className="h-3 w-3 shrink-0"
                                                    style={{ color: "#8B7A67" }}
                                                />
                                                <span
                                                    className="truncate text-[11px] font-medium"
                                                    style={{ color: "#1A0F0A" }}
                                                >
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
                                            className="h-3 w-3"
                                            style={{
                                                color: urgent
                                                    ? "#c0392b"
                                                    : "#8B7A67",
                                            }}
                                        />
                                        <span
                                            className="text-[10px] font-medium tabular-nums"
                                            style={{
                                                fontFamily:
                                                    "'DM Mono', monospace",
                                                color: urgent
                                                    ? "#c0392b"
                                                    : "#8B7A67",
                                            }}
                                        >
                                            {order.time}
                                        </span>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleComplete(
                                                    order.queueNumber,
                                                );
                                            }}
                                            className="flex h-6 w-6 items-center justify-center rounded-md transition-colors hover:bg-green-50"
                                            title="Done"
                                        >
                                            <CheckCircle2
                                                className="h-3.5 w-3.5"
                                                style={{ color: "#5C8A5C" }}
                                            />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleVoid(order.queueNumber);
                                            }}
                                            className="flex h-6 w-6 items-center justify-center rounded-md transition-colors hover:bg-red-50"
                                            title="Void"
                                        >
                                            <XCircle
                                                className="h-3.5 w-3.5"
                                                style={{ color: "#c0392b" }}
                                            />
                                        </button>
                                    </div>
                                </div>
                            </motion.button>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Order Detail Modal */}
            <AnimatePresence>
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
            </AnimatePresence>
        </div>
    );
};

export default OrderQueue;
