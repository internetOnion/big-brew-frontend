import { MinusIcon, PlusIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

interface QuantityStepperProps {
    value: number;
    onChange: (delta: number) => void;
    min?: number;
    max?: number;
    size?: "icon" | "icon-sm" | "icon-xs";
}

export const QuantityStepper = ({
    value,
    onChange,
    min = 1,
    max,
    size = "icon",
}: QuantityStepperProps) => {
    const canDecrease = value > min;
    const canIncrease = max === undefined || value < max;

    return (
        <div className="flex items-center gap-2">
            <Button
                variant="outline"
                size={size}
                onClick={() => onChange(-1)}
                disabled={!canDecrease}
            >
                <MinusIcon />
            </Button>
            <span className="w-4 text-center font-mono text-sm font-bold tabular-nums text-foreground">
                {value}
            </span>
            <Button
                variant="outline"
                size={size}
                onClick={() => onChange(1)}
                disabled={!canIncrease}
            >
                <PlusIcon />
            </Button>
        </div>
    );
};
