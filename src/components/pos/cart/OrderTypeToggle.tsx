import { ForkKnife, ShoppingBag } from "@phosphor-icons/react";
import type { OrderType } from "@/types/order";
import { Button } from "@/components/ui/button";

interface OrderTypeToggleProps {
    value: OrderType;
    onChange: (type: OrderType) => void;
}

export const OrderTypeToggle = ({ value, onChange }: OrderTypeToggleProps) => (
    <div className="flex gap-1 px-3 py-1.5">
        <Button
            variant={value === "dine-in" ? "default" : "outline"}
            size="sm"
            onClick={() => onChange("dine-in")}
            className="flex-1 text-[11px]"
        >
            <ForkKnife className="size-3.5" />
            Dine In
        </Button>
        <Button
            variant={value === "takeout" ? "default" : "outline"}
            size="sm"
            onClick={() => onChange("takeout")}
            className="flex-1 text-[11px]"
        >
            <ShoppingBag className="size-3.5" />
            Takeout
        </Button>
    </div>
);
