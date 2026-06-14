import { Button } from "@/components/ui/button";

interface SugarLevelSelectorProps {
    label: string;
    options: { id: string; name: string }[];
    value: string;
    onSelect: (name: string, id: string) => void;
}

export const SugarLevelSelector = ({
    label,
    options,
    value,
    onSelect,
}: SugarLevelSelectorProps) => (
    <div className="mb-5">
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
        </label>
        <div className="flex gap-1.5">
            {options.map((sl) => (
                <Button
                    key={sl.id}
                    variant={value === sl.name ? "default" : "outline"}
                    size="default"
                    onClick={() => onSelect(sl.name, sl.id)}
                    className="flex-1"
                >
                    {sl.name}
                </Button>
            ))}
        </div>
    </div>
);
