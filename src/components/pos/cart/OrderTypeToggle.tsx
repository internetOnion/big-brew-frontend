import { UtensilsCrossed, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrderTypeToggleProps {
    value: "dine-in" | "takeout";
    onChange: (type: "dine-in" | "takeout") => void;
}

export const OrderTypeToggle = ({ value, onChange }: OrderTypeToggleProps) => (
    <div className="flex gap-1 bg-background p-3">
        <Button
            variant={value === "dine-in" ? "default" : "outline"}
            size="default"
            onClick={() => onChange("dine-in")}
            className="flex-1 text-xs"
        >
            <UtensilsCrossed />
            Dine In
        </Button>
        <Button
            variant={value === "takeout" ? "default" : "outline"}
            size="default"
            onClick={() => onChange("takeout")}
            className="flex-1 text-xs"
        >
            <ShoppingBag />
            Takeout
        </Button>
    </div>
);
