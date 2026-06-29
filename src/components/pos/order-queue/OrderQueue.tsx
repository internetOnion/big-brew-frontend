import { useState } from "react";
import {
    ListNumbersIcon,
    CoffeeIcon,
    ReceiptIcon,
} from "@phosphor-icons/react";
import type { Order } from "@/types/order";
import { usePendingOrders } from "@/hooks/usePendingOrders";
import { useSettings } from "@/hooks/useSettings";
import { useCompleteOrder, useVoidWithPin } from "@/hooks/useOrderMutations";
import { getTimeSince, isUrgent } from "@/lib/order-utils";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import OrderDetailModal from "./OrderDetailModal";
import { OrderQueueCard } from "./OrderQueueCard";
import { VoidConfirmForm } from "./VoidConfirmForm";
import { Skeleton } from "@/components/ui/skeleton";
import { PinDialog } from "@/components/common/PinDialog";
import OrderReceipt from "../payment/OrderReceipt";

export const OrderQueue = () => {
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
    const [voidOrder, setVoidOrder] = useState<Order | null>(null);
    const [pinDialogOpen, setPinDialogOpen] = useState(false);
    const [pendingVoid, setPendingVoid] = useState<{
        orderId: string;
        reason: string;
    } | null>(null);
    const { data: orders, isLoading } = usePendingOrders();
    const { data: settings } = useSettings();
    const completeMutation = useCompleteOrder();
    const voidWithPinMutation = useVoidWithPin();

    const handleComplete = (orderId: string) => {
        setSelectedOrder(null);
        completeMutation.mutate(orderId);
    };

    const handleVoid = (orderId: string, reason: string) => {
        setPendingVoid({ orderId, reason });
        setPinDialogOpen(true);
    };

    const handlePinVerified = ({
        pin,
    }: {
        id: string;
        name: string;
        role: string;
        pin: string;
    }) => {
        setPinDialogOpen(false);
        if (!pendingVoid) return;

        const { orderId, reason } = pendingVoid;
        setPendingVoid(null);

        voidWithPinMutation.mutate({ orderId, pin, reason });
        setSelectedOrder(null);
    };

    if (isLoading) {
        return (
            <div className="flex h-full w-[220px] shrink-0 flex-col overflow-hidden border-r border-(--pos-border) bg-(--pos-card)">
                <div className="flex items-center justify-between border-b border-(--pos-border) px-4 py-2.5">
                    <div className="flex items-center gap-2">
                        <ListNumbersIcon className="size-4 text-(--pos-primary)" />
                        <span className="font-sans text-[13px] font-medium text-(--pos-text)">
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
        <div className="flex h-full w-[220px] shrink-0 flex-col overflow-hidden border-r border-(--pos-border) bg-(--pos-card)">
            <div className="flex items-center justify-between border-b border-(--pos-border) px-4 py-2.5">
                <div className="flex items-center gap-2">
                    <ListNumbersIcon className="size-4 text-(--pos-primary)" />
                    <span className="font-sans text-[13px] font-medium text-(--pos-text)">
                        Queue
                    </span>
                </div>
                <span className="rounded-md border border-(--pos-border) bg-(--pos-hover) px-1.5 py-0.5 font-sans text-[10px] font-medium text-(--pos-text-muted)">
                    {pendingOrders.length}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto px-2 py-2 pos-scroll">
                {pendingOrders.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center gap-2">
                        <CoffeeIcon className="size-7 text-(--pos-text-muted)/40" />
                        <p className="text-[11px] text-(--pos-text-muted)">
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
                                setVoidOrder(order);
                            }}
                            onReceipt={(e) => {
                                e.stopPropagation();
                                setReceiptOrder(order);
                            }}
                        />
                    ))
                )}
            </div>

            {selectedOrder && (
                <OrderDetailModal
                    order={selectedOrder}
                    settings={settings}
                    onComplete={() => handleComplete(selectedOrder.id)}
                    onVoid={() => setVoidOrder(selectedOrder)}
                    onCancel={() => setSelectedOrder(null)}
                />
            )}

            <PinDialog
                open={pinDialogOpen}
                onOpenChange={setPinDialogOpen}
                onVerified={handlePinVerified}
                title="Enter Pin"
            />

            <Dialog
                open={!!receiptOrder}
                onOpenChange={(open) => {
                    if (!open) setReceiptOrder(null);
                }}
            >
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ReceiptIcon size={18} />
                            Receipt
                        </DialogTitle>
                    </DialogHeader>
                    {receiptOrder && settings && (
                        <OrderReceipt
                            order={receiptOrder}
                            settings={settings}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <Dialog
                open={!!voidOrder}
                onOpenChange={(open) => {
                    if (!open) setVoidOrder(null);
                }}
            >
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>
                            Void Order
                            {voidOrder && ` #${voidOrder.orderNumber}`}
                        </DialogTitle>
                    </DialogHeader>
                    <VoidConfirmForm
                        onConfirm={(reason) => {
                            if (voidOrder) {
                                handleVoid(voidOrder.id, reason);
                            }
                            setVoidOrder(null);
                        }}
                        onCancel={() => setVoidOrder(null)}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default OrderQueue;
