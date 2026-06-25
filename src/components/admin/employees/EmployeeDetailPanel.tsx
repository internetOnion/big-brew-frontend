import { useState } from "react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "motion/react";
import {
    XIcon,
    ClipboardTextIcon,
    CheckCircleIcon,
    XCircleIcon,
    EyeIcon,
} from "@phosphor-icons/react";
import { useAdminOrders } from "@/hooks/useOrders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AdminEmployee } from "@/types/admin";
import type { Order } from "@/types/order";

const statusBadgeVariant = (status: string) => {
    switch (status) {
        case "completed":
            return "border-emerald-200 bg-emerald-50 text-emerald-700 text-[10px]";
        case "voided":
            return "border-red-200 bg-red-50 text-red-700 text-[10px]";
        case "void_requested":
            return "border-amber-200 bg-amber-50 text-amber-700 text-[10px]";
        default:
            return "border-blue-200 bg-blue-50 text-blue-700 text-[10px]";
    }
};

interface EmployeeDetailPanelProps {
    employee: AdminEmployee;
    onClose: () => void;
    onOrderClick: (order: Order) => void;
}

const EmployeeDetailPanel = ({
    employee,
    onClose,
    onOrderClick,
}: EmployeeDetailPanelProps) => {
    const [limit] = useState(10);
    const isActive = employee.isActive !== false;
    const initials = employee.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const { data: orders = [], isLoading } = useAdminOrders({
        created_by_id: employee.id,
        limit,
        offset: 0,
    });

    const completedOrders = orders.filter(
        (o) => o.status === "completed",
    ).length;
    const voidedOrders = orders.filter(
        (o) => o.status === "voided" || o.status === "void_requested",
    ).length;

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), "MMM d, yyyy");
        } catch {
            return dateString;
        }
    };

    const formatTime = (dateString: string) => {
        try {
            return format(new Date(dateString), "h:mm a");
        } catch {
            return "";
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col h-full"
            >
                {/* Header */}
                <div className="flex items-start justify-between shrink-0 pb-4 border-b border-(--admin-border)">
                    <div className="flex items-center gap-3">
                        <div
                            className={`
                                flex size-10 shrink-0 items-center justify-center rounded-full
                                font-sans text-[14px] font-bold text-white
                                ${isActive ? "bg-(--admin-primary)" : "bg-(--admin-text-muted)"}
                            `}
                        >
                            {initials}
                        </div>
                        <div>
                            <h2 className="text-[13px] font-medium text-(--admin-text)">
                                {employee.name}
                            </h2>
                            <div className="flex items-center gap-2 mt-0.5">
                                <Badge
                                    variant="outline"
                                    className="text-[10px] border-(--admin-border) bg-(--admin-hover) text-(--admin-text-secondary) capitalize"
                                >
                                    {employee.role}
                                </Badge>
                                <span
                                    className={`text-[10px] font-medium ${isActive ? "text-emerald-600" : "text-(--admin-text-muted)"}`}
                                >
                                    {isActive ? "Active" : "Inactive"}
                                </span>
                            </div>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="size-7 text-(--admin-text-secondary) hover:text-(--admin-text)"
                    >
                        <XIcon className="size-4" />
                    </Button>
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-2 gap-2.5 py-4 shrink-0">
                    <div className="rounded-lg border border-(--admin-border) bg-(--admin-hover) p-3">
                        <div className="flex items-center gap-1.5">
                            <CheckCircleIcon className="size-3 text-emerald-600" />
                            <span className="text-[10px] text-(--admin-text-muted)">
                                Completed
                            </span>
                        </div>
                        <div className="mt-1 text-[16px] font-mono font-semibold text-(--admin-text)">
                            {completedOrders}
                        </div>
                    </div>
                    <div className="rounded-lg border border-(--admin-border) bg-(--admin-hover) p-3">
                        <div className="flex items-center gap-1.5">
                            <XCircleIcon className="size-3 text-red-500" />
                            <span className="text-[10px] text-(--admin-text-muted)">
                                Voided
                            </span>
                        </div>
                        <div className="mt-1 text-[16px] font-mono font-semibold text-(--admin-text)">
                            {voidedOrders}
                        </div>
                    </div>
                </div>

                {/* Recent orders */}
                <div className="flex-1 overflow-auto min-h-0">
                    <div className="flex items-center gap-1.5 mb-3">
                        <ClipboardTextIcon className="size-3 text-(--admin-text-muted)" />
                        <span className="text-[10px] font-medium text-(--admin-text-muted) uppercase tracking-wide">
                            Recent Orders
                        </span>
                    </div>

                    {isLoading ? (
                        <div className="space-y-2">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="h-12 animate-pulse rounded-lg bg-(--admin-hover)"
                                />
                            ))}
                        </div>
                    ) : orders.length === 0 ? (
                        <p className="text-[11px] text-(--admin-text-muted)">
                            No orders yet
                        </p>
                    ) : (
                        <div className="space-y-1.5">
                            {orders.map((order) => (
                                <button
                                    key={order.id}
                                    onClick={() => onOrderClick(order)}
                                    className="flex w-full items-center gap-3 rounded-lg border border-(--admin-border) bg-(--admin-card) p-2.5 text-left transition-colors hover:bg-(--admin-hover)"
                                >
                                    <span className="shrink-0 text-[11px] font-mono font-medium text-(--admin-primary)">
                                        #{order.orderNumber}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="truncate text-[11px] text-(--admin-text)">
                                                {order.items
                                                    ?.map((i) => i.name)
                                                    .join(", ") || "—"}
                                            </span>
                                        </div>
                                        <span className="text-[10px] text-(--admin-text-muted)">
                                            {formatDate(order.createdAt)}{" "}
                                            {formatTime(order.createdAt)}
                                        </span>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-2">
                                        <span className="text-[11px] font-mono font-medium text-(--admin-text)">
                                            ${order.total}
                                        </span>
                                        <Badge
                                            variant="outline"
                                            className={statusBadgeVariant(
                                                order.status,
                                            )}
                                        >
                                            {order.status.replace(/_/g, " ")}
                                        </Badge>
                                    </div>
                                    <EyeIcon className="size-3 shrink-0 text-(--admin-text-muted)" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default EmployeeDetailPanel;
