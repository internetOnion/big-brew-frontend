import { cn } from "@/lib/utils";
import type { Currency } from "@/types/order";
import { Button } from "@/components/ui/button";

interface QuickTenderProps {
    currency: Currency;
    onTender: (amount: string) => void;
    onExact: () => void;
    onClear: () => void;
    disabled?: boolean;
    className?: string;
}

const USD_PRESETS = [
    { label: "$1", value: "1" },
    { label: "$5", value: "5" },
    { label: "$10", value: "10" },
    { label: "$20", value: "20" },
];

const KHR_PRESETS = [
    { label: "៛10K", value: "10000" },
    { label: "៛20K", value: "20000" },
    { label: "៛50K", value: "50000" },
    { label: "៛100K", value: "100000" },
];

export const QuickTender = ({
    currency,
    onTender,
    onExact,
    onClear,
    disabled,
    className,
}: QuickTenderProps) => {
    const presets = currency === "USD" ? USD_PRESETS : KHR_PRESETS;

    return (
        <div className={cn("flex flex-wrap gap-1.5", className)}>
            {presets.map((p) => (
                <Button
                    key={p.label}
                    variant="secondary"
                    size="sm"
                    onClick={() => onTender(p.value)}
                    disabled={disabled}
                    className="flex-1 font-mono text-xs font-semibold min-w-[48px]"
                >
                    {p.label}
                </Button>
            ))}
            <Button
                variant="default"
                size="sm"
                onClick={onExact}
                disabled={disabled}
                className="flex-1 bg-(--pos-accent) font-sans text-xs font-bold min-w-[48px] text-white"
            >
                Exact
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={onClear}
                disabled={disabled}
                className="flex-1 font-sans text-xs min-w-[48px]"
            >
                Clear
            </Button>
        </div>
    );
};
