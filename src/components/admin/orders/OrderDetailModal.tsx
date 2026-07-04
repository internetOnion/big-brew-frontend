import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCompleteOrder } from "@/hooks/useOrderMutations";
import { useApproveVoid, useRejectVoid } from "@/hooks/useOrders";
import { toast } from "sonner";
import type { Order } from "@/types/order";
import {
    statusBadgeConfig,
    paymentStatusConfig,
    diningLabel,
} from "@/components/admin/orders/order-constants";

interface OrderDetailModalProps {
    order: Order | null;
    open: boolean;
    onClose: () => void;
}

const OrderDetailModal = ({ order, open, onClose }: OrderDetailModalProps) => {
    const queryClient = useQueryClient();
    const completeMutation = useCompleteOrder();
    const approveVoidMutation = useApproveVoid();
    const rejectVoidMutation = useRejectVoid();

    const handleComplete = () => {
        if (!order) return;
        completeMutation.mutate(order.id, {
            onSuccess: () => {
                toast.success("Order completed");
                queryClient.invalidateQueries({ queryKey: ["orders"] });
                onClose();
            },
            onError: () => toast.error("Failed to complete order"),
        });
    };

    const handleApproveVoid = () => {
        if (!order) return;
        approveVoidMutation.mutate(order.id, {
            onSuccess: () => {
                toast.success("Void approved");
                onClose();
            },
            onError: () => toast.error("Failed to approve void"),
        });
    };

    const handleRejectVoid = () => {
        if (!order) return;
        rejectVoidMutation.mutate(order.id, {
            onSuccess: () => {
                toast.success("Void rejected");
                onClose();
            },
            onError: () => toast.error("Failed to reject void"),
        });
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent
                className="max-w-lg border-(--admin-border) bg-(--admin-card) shadow-xl"
                showCloseButton={false}
            >
                {order && (
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-[14px] font-medium text-(--admin-text)">
                                Order #{order.receiptNumber}
                            </DialogTitle>
                        </DialogHeader>

                        <div className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto">
                            {/* Status badges */}
                            <div className="flex items-center gap-2">
                                <span
                                    className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium ${statusBadgeConfig[order.status].className}`}
                                >
                                    {statusBadgeConfig[order.status].label}
                                </span>
                                {order.paymentStatus in paymentStatusConfig && (
                                    <span
                                        className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium ${paymentStatusConfig[order.paymentStatus].className}`}
                                    >
                                        {
                                            paymentStatusConfig[
                                                order.paymentStatus
                                            ].label
                                        }
                                    </span>
                                )}
                            </div>

                            {/* Info grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px]">
                                <div>
                                    <span className="text-(--admin-text-muted)">
                                        Type
                                    </span>
                                    <p className="text-(--admin-text-secondary)">
                                        {diningLabel[order.diningOption] ??
                                            order.diningOption}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-(--admin-text-muted)">
                                        Created by
                                    </span>
                                    <p className="text-(--admin-text-secondary)">
                                        {order.createdBy.name}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-(--admin-text-muted)">
                                        Confirmed by
                                    </span>
                                    <p className="text-(--admin-text-secondary)">
                                        {order.confirmedBy?.name ?? "—"}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-(--admin-text-muted)">
                                        Created at
                                    </span>
                                    <p className="text-(--admin-text-secondary)">
                                        {format(
                                            new Date(order.createdAt),
                                            "MMM d, yyyy h:mm a",
                                        )}
                                    </p>
                                </div>
                            </div>

                            {/* Financials */}
                            <div className="rounded-md border border-(--admin-border) bg-(--admin-hover) p-3">
                                <div className="flex justify-between text-[12px]">
                                    <span className="text-(--admin-text-muted)">
                                        Subtotal
                                    </span>
                                    <span className="font-mono text-(--admin-text)">
                                        {order.subtotal}
                                    </span>
                                </div>
                                {parseFloat(order.discountAmount) > 0 && (
                                    <div className="mt-1 flex justify-between text-[12px]">
                                        <span className="text-(--admin-text-muted)">
                                            Discount
                                        </span>
                                        <span className="font-mono text-destructive">
                                            -{order.discountAmount}
                                        </span>
                                    </div>
                                )}
                                <div className="mt-1.5 flex justify-between border-t border-(--admin-border) pt-1.5 text-[13px] font-semibold">
                                    <span className="text-(--admin-text)">
                                        Total
                                    </span>
                                    <span className="font-mono text-(--admin-primary)">
                                        {order.total}
                                    </span>
                                </div>
                            </div>

                            {/* Items */}
                            <div>
                                <p className="mb-1.5 text-[11px] font-medium text-(--admin-text-muted)">
                                    Items ({order.items.length})
                                </p>
                                <div className="divide-y divide-(--admin-border) rounded-md border border-(--admin-border)">
                                    {order.items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-start justify-between px-3 py-2"
                                        >
                                            <div className="min-w-0">
                                                <p className="truncate text-[12px] font-medium text-(--admin-text)">
                                                    {item.name}
                                                </p>
                                                {item.modifiers.length > 0 && (
                                                    <p className="text-[10px] text-(--admin-text-muted)">
                                                        {item.modifiers
                                                            .map((m) => m.name)
                                                            .join(", ")}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="ml-3 shrink-0 text-right">
                                                <p className="text-[12px] text-(--admin-text-secondary)">
                                                    {item.quantity} ×{" "}
                                                    {item.unitPrice}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Payments */}
                            {order.payments.length > 0 && (
                                <div>
                                    <p className="mb-1.5 text-[11px] font-medium text-(--admin-text-muted)">
                                        Payments
                                    </p>
                                    <div className="divide-y divide-(--admin-border) rounded-md border border-(--admin-border)">
                                        {order.payments.map((p) => (
                                            <div
                                                key={p.id}
                                                className="flex items-center justify-between px-3 py-2"
                                            >
                                                <div>
                                                    <p className="text-[12px] font-medium capitalize text-(--admin-text)">
                                                        {p.method}
                                                    </p>
                                                    <p className="text-[10px] text-(--admin-text-muted)">
                                                        {format(
                                                            new Date(
                                                                p.createdAt,
                                                            ),
                                                            "h:mm a",
                                                        )}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[12px] text-(--admin-text-secondary)">
                                                        {p.amount}
                                                    </p>
                                                    {p.changeAmount &&
                                                        parseFloat(
                                                            p.changeAmount,
                                                        ) > 0 && (
                                                            <p className="text-[10px] text-(--admin-text-muted)">
                                                                Change:{" "}
                                                                {p.changeAmount}
                                                            </p>
                                                        )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Void info */}
                            {(order.status === "void_requested" ||
                                order.status === "voided") && (
                                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3">
                                    {order.voidReason && (
                                        <p className="text-[12px] text-destructive">
                                            <span className="font-medium">
                                                Reason:
                                            </span>{" "}
                                            {order.voidReason}
                                        </p>
                                    )}
                                    {order.voidRequestedBy && (
                                        <p className="mt-0.5 text-[11px] text-destructive">
                                            Requested by{" "}
                                            {order.voidRequestedBy.name}
                                            {order.voidRequestedAt &&
                                                ` on ${format(new Date(order.voidRequestedAt), "MMM d, h:mm a")}`}
                                        </p>
                                    )}
                                    {order.voidApprovedBy && (
                                        <p className="mt-0.5 text-[11px] text-(--admin-success)">
                                            Approved by{" "}
                                            {order.voidApprovedBy.name}
                                            {order.voidApprovedAt &&
                                                ` on ${format(new Date(order.voidApprovedAt), "MMM d, h:mm a")}`}
                                        </p>
                                    )}
                                    {order.voidRejectedAt && (
                                        <p className="mt-0.5 text-[11px] text-destructive">
                                            Rejected on{" "}
                                            {format(
                                                new Date(order.voidRejectedAt),
                                                "MMM d, h:mm a",
                                            )}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer actions */}
                        {order.status === "pending" && (
                            <DialogFooter className="border-(--admin-border) bg-(--admin-card)">
                                <Button
                                    variant="ghost"
                                    className="text-(--admin-text-secondary)"
                                    onClick={onClose}
                                >
                                    Close
                                </Button>
                                <Button
                                    disabled={completeMutation.isPending}
                                    onClick={handleComplete}
                                    className="bg-(--admin-success) text-white hover:bg-(--admin-success)/80"
                                >
                                    {completeMutation.isPending
                                        ? "Completing..."
                                        : "Mark Complete"}
                                </Button>
                            </DialogFooter>
                        )}

                        {order.status === "void_requested" && (
                            <DialogFooter className="border-(--admin-border) bg-(--admin-card)">
                                <Button
                                    variant="ghost"
                                    className="text-(--admin-text-secondary)"
                                    onClick={onClose}
                                >
                                    Close
                                </Button>
                                <Button
                                    variant="outline"
                                    disabled={rejectVoidMutation.isPending}
                                    onClick={handleRejectVoid}
                                    className="border-destructive/30 text-destructive hover:bg-destructive/10"
                                >
                                    {rejectVoidMutation.isPending
                                        ? "..."
                                        : "Reject Void"}
                                </Button>
                                <Button
                                    disabled={approveVoidMutation.isPending}
                                    onClick={handleApproveVoid}
                                    className="bg-(--admin-success) text-white hover:bg-(--admin-success)/80"
                                >
                                    {approveVoidMutation.isPending
                                        ? "..."
                                        : "Approve Void"}
                                </Button>
                            </DialogFooter>
                        )}

                        {(order.status === "completed" ||
                            order.status === "voided") && (
                            <DialogFooter
                                className="border-(--admin-border) bg-(--admin-card)"
                                showCloseButton
                            />
                        )}
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default OrderDetailModal;
