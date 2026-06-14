import { cn } from "@/lib/utils";
import type { ModifierGroup } from "@/types/menu";

interface ModifierGroupSelectorProps {
    group: ModifierGroup;
    selectedIds: string[];
    onToggle: (groupId: string, optId: string) => void;
}

export const ModifierGroupSelector = ({
    group,
    selectedIds,
    onToggle,
}: ModifierGroupSelectorProps) => (
    <div className="mb-5">
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {group.name}
        </label>
        <div className="flex flex-col gap-1.5">
            {group.options.map((opt) => {
                const isSelected = selectedIds.includes(opt.id);
                return (
                    <button
                        key={opt.id}
                        onClick={() => onToggle(group.id, opt.id)}
                        className={cn(
                            "flex items-center justify-between rounded-xl border px-3 py-2.5 text-left transition-all",
                            isSelected
                                ? "border-primary bg-primary/8 text-foreground"
                                : "border-border bg-secondary text-foreground hover:bg-muted",
                        )}
                    >
                        <div className="flex items-center gap-2.5">
                            <div
                                className={cn(
                                    "flex size-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                                    isSelected
                                        ? "border-primary bg-primary"
                                        : "border-muted-foreground/30",
                                )}
                            >
                                {isSelected && (
                                    <div className="size-1.5 rounded-full bg-primary-foreground" />
                                )}
                            </div>
                            <span className="text-sm font-medium">
                                {opt.name}
                            </span>
                        </div>
                        {opt.price > 0 && (
                            <span className="text-xs text-muted-foreground">
                                +${opt.price.toFixed(2)}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    </div>
);
