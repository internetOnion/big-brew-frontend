import { Trash2, Pencil } from "lucide-react";
import { getCategoryIconName } from "@/types/menu";
import { getCategoryIcon } from "@/lib/category-icons";
import type { CartItem } from "@/types/cart";
import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/common/QuantityStepper";

interface CartItemCardProps {
    item: CartItem;
    onEdit: (id: string) => void;
    onRemove: (id: string) => void;
    onQuantityChange: (id: string, delta: number) => void;
}

export const CartItemCard = ({
    item,
    onEdit,
    onRemove,
    onQuantityChange,
}: CartItemCardProps) => {
    const CategoryIcon = getCategoryIcon(getCategoryIconName(item.category));

    return (
        <div className="mb-2 rounded-xl border border-border bg-background p-2.5">
            <div className="flex items-start gap-2">
                <CategoryIcon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                    <p className="truncate font-sans text-xs font-bold text-foreground">
                        {item.name}
                    </p>
                    <div className="mt-0.5 flex flex-wrap gap-x-2 gap-y-0.5">
                        {item.size && (
                            <span className="text-[10px] text-muted-foreground">
                                Size {item.size}
                            </span>
                        )}
                        {item.sugarLevel && (
                            <span className="text-[10px] text-muted-foreground">
                                Sugar {item.sugarLevel}
                            </span>
                        )}
                        {item.toppings.length > 0 && (
                            <span className="truncate text-[10px] text-muted-foreground">
                                {item.toppings.map((t) => t.name).join(", ")}
                            </span>
                        )}
                        {item.modifierGroups
                            .flatMap((g) => {
                                const selected =
                                    item.selectedModifiers[g.id] ?? [];
                                return selected.map((optId) => {
                                    const opt = g.options.find(
                                        (o) => o.id === optId,
                                    );
                                    return opt?.name;
                                });
                            })
                            .filter(Boolean)
                            .map((name) => (
                                <span
                                    key={name}
                                    className="text-[10px] text-muted-foreground"
                                >
                                    {name}
                                </span>
                            ))}
                    </div>
                    {item.note && (
                        <p className="mt-0.5 truncate text-[10px] italic text-muted-foreground">
                            &ldquo;{item.note}&rdquo;
                        </p>
                    )}
                </div>
                <div className="flex flex-col items-end gap-1">
                    <p className="font-mono text-xs font-bold tabular-nums text-primary">
                        ${item.price.toFixed(2)}
                    </p>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => onEdit(item.id)}
                        >
                            <Pencil className="text-muted-foreground" />
                        </Button>
                        <Button
                            variant="destructive"
                            size="icon-xs"
                            onClick={() => onRemove(item.id)}
                        >
                            <Trash2 />
                        </Button>
                    </div>
                </div>
            </div>
            <div className="mt-2 flex items-center justify-end">
                <QuantityStepper
                    value={item.quantity}
                    onChange={(delta) => onQuantityChange(item.id, delta)}
                    size="icon-xs"
                />
            </div>
        </div>
    );
};
