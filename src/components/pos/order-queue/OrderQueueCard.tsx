import {
    UtensilsCrossed,
    ShoppingBag,
    CheckCircle2,
    XCircle,
    Clock,
    Coffee,
} from "lucide-react";
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
}

export const OrderQueueCard = ({
    order,
    urgent,
    timeSince,
    onClick,
    onComplete,
    onVoid,
}: OrderQueueCardProps) => {
    const TypeIcon =
        order.diningOption === "dine_in" ? UtensilsCrossed : ShoppingBag;

    return (
        <div
            onClick={onClick}
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
                    <div key={item.id} className="flex items-center gap-1">
                        <Coffee className="size-3 shrink-0 text-muted-foreground" />
                        <span className="truncate text-[11px] font-medium text-foreground">
                            {item.quantity > 1 && `${item.quantity}× `}
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
                        onClick={onComplete}
                        title="Done"
                    >
                        <CheckCircle2 className="text-chart-4" />
                    </Button>
                    <Button
                        variant="destructive"
                        size="icon-xs"
                        onClick={onVoid}
                        title="Void"
                    >
                        <XCircle />
                    </Button>
                </div>
            </div>
        </div>
    );
};
