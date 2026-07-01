import {
    ForkKnifeIcon,
    ShoppingBagIcon,
    CheckCircleIcon,
    XCircleIcon,
    ReceiptIcon,
    ClockIcon,
    CoffeeIcon,
} from "@phosphor-icons/react";
import type { Order, OrderItem } from "@/types/order";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface OrderQueueCardProps {
    order: Order;
    urgent: boolean;
    timeSince: string;
    onClick: () => void;
    onComplete: (e: React.MouseEvent) => void;
    onVoid: (e: React.MouseEvent) => void;
    onReceipt: (e: React.MouseEvent) => void;
}

export const OrderQueueCard = ({
    order,
    urgent,
    timeSince,
    onClick,
    onComplete,
    onVoid,
    onReceipt,
}: OrderQueueCardProps) => {
    const TypeIcon =
        order.diningOption === "dine_in" ? ForkKnifeIcon : ShoppingBagIcon;

    return (
        <div
            onClick={onClick}
            className={cn(
                "mb-2 flex w-full cursor-pointer flex-col rounded-lg border p-2.5 text-left transition-colors",
                urgent
                    ? "border-destructive/30 bg-destructive/8 hover:bg-destructive/12"
                    : "border-(--pos-border) bg-(--pos-card) hover:bg-(--pos-hover)",
            )}
        >
            <div className="mb-1.5 flex items-center justify-between">
                <span className="font-mono text-[12px] font-bold tabular-nums text-(--pos-primary)">
                    #{order.orderNumber}
                </span>
                <div className="flex items-center gap-1.5">
                    <TypeIcon className="size-3 text-(--pos-text-muted)" />
                    <span className="text-[10px] capitalize text-(--pos-text-muted)">
                        {order.diningOption === "dine_in"
                            ? "dine-in"
                            : "takeout"}
                    </span>
                </div>
            </div>
            <div className="mb-2 flex flex-col gap-0.5">
                {order.items.map((item: OrderItem) => (
                    <div key={item.id} className="flex items-center gap-1">
                        <CoffeeIcon className="size-3 shrink-0 text-(--pos-text-muted)" />
                        <span className="truncate text-[11px] font-medium text-(--pos-text)">
                            {item.quantity > 1 && `${item.quantity}× `}
                            {item.name}
                        </span>
                    </div>
                ))}
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                    <ClockIcon
                        className={cn(
                            "size-3",
                            urgent
                                ? "text-destructive"
                                : "text-(--pos-text-muted)",
                        )}
                    />
                    <span
                        className={cn(
                            "font-mono text-[10px] font-medium tabular-nums",
                            urgent
                                ? "text-destructive"
                                : "text-(--pos-text-muted)",
                        )}
                    >
                        {timeSince}
                    </span>
                </div>
                <div className="flex gap-1">
                    <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={onReceipt}
                        title="Receipt"
                    >
                        <ReceiptIcon className="text-(--pos-text-muted)" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={onComplete}
                        title="Done"
                    >
                        <CheckCircleIcon className="text-chart-4" />
                    </Button>
                    <Button
                        variant="destructive"
                        size="icon-xs"
                        onClick={onVoid}
                        title="Void"
                    >
                        <XCircleIcon />
                    </Button>
                </div>
            </div>
        </div>
    );
};
