import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { TopItem } from "@/types/admin";

interface TopItemsProps {
    data: TopItem[] | undefined;
    isLoading: boolean;
    sortBy: string;
    onSortByChange: (value: string) => void;
    limit: number;
    onLimitChange: (value: number) => void;
    currencySymbol?: string;
}

const sortOptions = [
    { value: "quantity", label: "Qty" },
    { value: "revenue", label: "Rev" },
];

const limitOptions = [5, 10, 20];

const TopItems = ({
    data,
    isLoading,
    sortBy,
    onSortByChange,
    limit,
    onLimitChange,
    currencySymbol = "$",
}: TopItemsProps) => {
    return (
        <div className="admin-card p-4">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-[11px] font-medium uppercase tracking-wide text-[var(--admin-text-muted)]">
                    Top Selling Items
                </h3>
                <div className="flex items-center gap-1">
                    <div className="flex gap-0.5 rounded-md bg-[var(--admin-hover)] p-0.5">
                        {sortOptions.map((opt) => (
                            <Button
                                key={opt.value}
                                variant="ghost"
                                size="xs"
                                onClick={() => onSortByChange(opt.value)}
                                className={`h-6 px-2 text-[11px] ${
                                    sortBy === opt.value
                                        ? "bg-[var(--admin-card)] font-medium text-[var(--admin-primary)] shadow-sm"
                                        : "text-[var(--admin-text-muted)] hover:text-[var(--admin-text-secondary)]"
                                }`}
                            >
                                {opt.label}
                            </Button>
                        ))}
                    </div>
                    <select
                        value={limit}
                        onChange={(e) => onLimitChange(Number(e.target.value))}
                        className="h-6 rounded border border-[var(--admin-border)] bg-[var(--admin-card)] px-1.5 font-mono text-[11px] text-[var(--admin-text-secondary)] outline-none"
                    >
                        {limitOptions.map((n) => (
                            <option key={n} value={n}>
                                Top {n}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {isLoading ? (
                <div className="space-y-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton
                            key={i}
                            className="h-7 w-full bg-[var(--admin-hover)]"
                        />
                    ))}
                </div>
            ) : !data || data.length === 0 ? (
                <div className="flex h-[200px] items-center justify-center text-xs text-[var(--admin-text-muted)]">
                    No data for this period
                </div>
            ) : (
                <div>
                    <div className="flex items-center gap-3 border-b border-[var(--admin-border)] pb-2 text-[10px] text-[var(--admin-text-muted)]">
                        <span className="w-5 text-right">#</span>
                        <span className="flex-1">Item</span>
                        <span className="w-16 text-right">Qty</span>
                        <span className="w-20 text-right">Revenue</span>
                    </div>
                    <div className="divide-y divide-[var(--admin-border)]">
                        {data.map((item, i) => (
                            <div
                                key={item.menuItemId}
                                className="admin-table-row flex items-center gap-3 py-2 transition-colors"
                            >
                                <span className="w-5 text-right font-mono text-[10px] text-[var(--admin-text-muted)]">
                                    {i + 1}
                                </span>
                                <span className="flex-1 truncate text-[12px] text-[var(--admin-text)]">
                                    {item.name}
                                </span>
                                <span className="w-16 text-right font-mono text-[12px] text-[var(--admin-text-secondary)]">
                                    {item.quantity}
                                </span>
                                <span className="w-20 text-right font-mono text-[12px] text-[var(--admin-text-secondary)]">
                                    {currencySymbol}
                                    {parseFloat(item.revenue).toLocaleString(
                                        "en-US",
                                        { minimumFractionDigits: 2 },
                                    )}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TopItems;
