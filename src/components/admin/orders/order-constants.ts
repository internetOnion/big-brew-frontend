import type { OrderStatus } from "@/types/order";

export const ORDER_STATUSES: OrderStatus[] = [
    "pending",
    "completed",
    "void_requested",
    "voided",
];

export const statusBadgeConfig: Record<
    OrderStatus,
    { label: string; className: string }
> = {
    pending: {
        label: "Pending",
        className:
            "bg-(--admin-warning)/10 text-(--admin-warning) border-(--admin-warning)/30",
    },
    completed: {
        label: "Completed",
        className:
            "bg-(--admin-success)/10 text-(--admin-success) border-(--admin-success)/30",
    },
    void_requested: {
        label: "Void Requested",
        className:
            "bg-(--admin-warning)/10 text-(--admin-warning) border-(--admin-warning)/30",
    },
    voided: {
        label: "Voided",
        className: "bg-destructive/10 text-destructive border-destructive/30",
    },
};

export const paymentStatusConfig: Record<
    string,
    { label: string; className: string }
> = {
    pending: {
        label: "Unpaid",
        className:
            "bg-(--admin-warning)/10 text-(--admin-warning) border-(--admin-warning)/30",
    },
    paid: {
        label: "Paid",
        className:
            "bg-(--admin-success)/10 text-(--admin-success) border-(--admin-success)/30",
    },
    refunded: {
        label: "Refunded",
        className: "bg-destructive/10 text-destructive border-destructive/30",
    },
};

export const diningLabel: Record<string, string> = {
    dine_in: "Dine-in",
    take_away: "Take-away",
};
