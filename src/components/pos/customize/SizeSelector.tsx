import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SizeSelectorProps {
    label: string;
    options: { id: string; name: string; price: number }[];
    value: string;
    onSelect: (name: string, id: string) => void;
}

export const SizeSelector = ({
    label,
    options,
    value,
    onSelect,
}: SizeSelectorProps) => (
    <div className="mb-5">
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
        </label>
        <div className="flex gap-2">
            {options.map((s) => (
                <Button
                    key={s.id}
                    variant={value === s.name ? "default" : "outline"}
                    onClick={() => onSelect(s.name, s.id)}
                    className="h-auto flex flex-1 flex-col items-center gap-1 py-2.5"
                >
                    <span className="text-sm font-bold">{s.name}</span>
                    <span
                        className={cn(
                            "text-xs",
                            value === s.name
                                ? "text-primary-foreground/80"
                                : "text-muted-foreground",
                        )}
                    >
                        +${s.price.toFixed(2)}
                    </span>
                </Button>
            ))}
        </div>
    </div>
);
