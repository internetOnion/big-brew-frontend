import { motion } from "motion/react";
import {
    X,
    CheckCircle2,
    XCircle,
    UtensilsCrossed,
    ShoppingBag,
    Clock,
} from "lucide-react";
import { type QueueItem } from "./data";

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
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onCancel}
            />
            <motion.div
                className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl shadow-2xl"
                style={{
                    background: "#FFFFFF",
                    border: "1px solid #E2D8CC",
                }}
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between px-5 py-4"
                    style={{
                        background: urgent ? "rgba(192,57,43,0.08)" : "#F4EFE8",
                        borderBottom: urgent
                            ? "1px solid rgba(192,57,43,0.2)"
                            : "1px solid #E2D8CC",
                    }}
                >
                    <div className="flex items-center gap-3">
                        <div
                            className="flex h-10 w-10 items-center justify-center rounded-xl"
                            style={{ background: "#4A2512" }}
                        >
                            <span
                                className="text-sm font-bold text-white tabular-nums"
                                style={{ fontFamily: "'DM Mono', monospace" }}
                            >
                                #{order.queueNumber}
                            </span>
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5">
                                <TypeIcon
                                    className="h-3.5 w-3.5"
                                    style={{ color: "#8B7A67" }}
                                />
                                <span
                                    className="text-xs font-medium capitalize"
                                    style={{ color: "#8B7A67" }}
                                >
                                    {order.type}
                                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock
                                    className="h-3 w-3"
                                    style={{
                                        color: urgent ? "#c0392b" : "#8B7A67",
                                    }}
                                />
                                <span
                                    className="text-xs font-medium tabular-nums"
                                    style={{
                                        fontFamily: "'DM Mono', monospace",
                                        color: urgent ? "#c0392b" : "#8B7A67",
                                    }}
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
                        <X className="h-5 w-5" style={{ color: "#8B7A67" }} />
                    </button>
                </div>

                {/* Items */}
                <div className="px-5 py-4">
                    <h4
                        className="mb-2 text-xs font-bold uppercase tracking-wider"
                        style={{ color: "#8B7A67" }}
                    >
                        Items
                    </h4>
                    <div className="flex flex-col gap-2">
                        {order.lineItems.map((li, idx) => (
                            <div
                                key={idx}
                                className="flex items-center justify-between rounded-lg px-3 py-2"
                                style={{ background: "#F4EFE8" }}
                            >
                                <div>
                                    <p
                                        className="text-sm font-medium"
                                        style={{ color: "#1A0F0A" }}
                                    >
                                        {li.name}
                                    </p>
                                    <p
                                        className="text-[11px]"
                                        style={{ color: "#8B7A67" }}
                                    >
                                        {li.size && `Size: ${li.size} `}
                                        {li.sugarLevel &&
                                            `Sugar: ${li.sugarLevel} `}
                                        {li.toppings &&
                                            li.toppings.length > 0 &&
                                            `Toppings: ${li.toppings.join(", ")}`}
                                    </p>
                                </div>
                                <span
                                    className="text-sm font-semibold tabular-nums"
                                    style={{
                                        fontFamily: "'DM Mono', monospace",
                                        color: "#4A2512",
                                    }}
                                >
                                    ${li.price.toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div
                        className="mt-3 flex items-center justify-between rounded-lg px-3 py-2"
                        style={{ background: "#F0EBE3" }}
                    >
                        <span
                            className="text-sm font-bold"
                            style={{ color: "#1A0F0A" }}
                        >
                            Total
                        </span>
                        <span
                            className="text-base font-bold tabular-nums"
                            style={{
                                fontFamily: "'DM Mono', monospace",
                                color: "#4A2512",
                            }}
                        >
                            ${total.toFixed(2)}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div
                    className="flex gap-2 px-5 pb-5 pt-1"
                    style={{ borderTop: "1px solid #E2D8CC" }}
                >
                    <button
                        onClick={onVoid}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2.5 text-sm font-bold transition-all hover:bg-red-50"
                        style={{ borderColor: "#c0392b", color: "#c0392b" }}
                    >
                        <XCircle className="h-4 w-4" />
                        Void
                    </button>
                    <button
                        onClick={onComplete}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-bold text-white transition-all hover:brightness-110 active:scale-95"
                        style={{ background: "#5C8A5C" }}
                    >
                        <CheckCircle2 className="h-4 w-4" />
                        Complete
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default OrderDetailModal;
