import { MinusIcon, PlusIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

interface ToppingOption {
    id: string;
    name: string;
    price: number;
}

interface SelectedTopping {
    name: string;
    qty: number;
    price: number;
    modifierOptionId: string;
}

interface ToppingsPickerProps {
    label: string;
    options: ToppingOption[];
    selected: SelectedTopping[];
    onUpdate: (
        name: string,
        price: number,
        delta: number,
        modifierOptionId: string,
    ) => void;
}

export const ToppingsPicker = ({
    label,
    options,
    selected,
    onUpdate,
}: ToppingsPickerProps) => (
    <div className="mb-5">
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
        </label>
        <div className="flex flex-col gap-2">
            {options.map((t) => {
                const current = selected.find((x) => x.name === t.name);
                const qty = current?.qty || 0;
                return (
                    <div
                        key={t.id}
                        className="flex items-center justify-between rounded-xl bg-secondary px-3 py-2.5"
                    >
                        <div>
                            <p className="text-sm font-medium text-foreground">
                                {t.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                +${t.price.toFixed(2)}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="icon-sm"
                                onClick={() =>
                                    onUpdate(t.name, t.price, -1, t.id)
                                }
                                disabled={qty === 0}
                            >
                                <MinusIcon />
                            </Button>
                            <span className="w-4 text-center font-mono text-sm font-semibold tabular-nums text-foreground">
                                {qty}
                            </span>
                            <Button
                                variant="outline"
                                size="icon-sm"
                                onClick={() =>
                                    onUpdate(t.name, t.price, 1, t.id)
                                }
                            >
                                <PlusIcon />
                            </Button>
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
);
