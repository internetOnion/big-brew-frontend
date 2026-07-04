import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
                <h2 className="text-[11px] font-medium text-(--admin-text-muted)">
                    Top Selling Items
                </h2>
                <div className="flex items-center gap-1">
                    <div className="flex gap-0.5 rounded-md bg-(--admin-hover) p-0.5">
                        {sortOptions.map((opt) => (
                            <Button
                                key={opt.value}
                                variant="ghost"
                                size="xs"
                                onClick={() => onSortByChange(opt.value)}
                                className={`h-6 max-md:min-h-[44px] px-2 text-[11px] ${
                                    sortBy === opt.value
                                        ? "bg-(--admin-card) font-medium text-(--admin-primary) shadow-sm"
                                        : "text-(--admin-text-muted) hover:text-(--admin-text-secondary)"
                                }`}
                            >
                                {opt.label}
                            </Button>
                        ))}
                    </div>
                    <Select
                        value={String(limit)}
                        onValueChange={(v) => onLimitChange(Number(v))}
                    >
                        <SelectTrigger
                            size="sm"
                            className="h-6 max-md:min-h-[44px] w-20 border-(--admin-border) bg-(--admin-card) text-[11px]"
                        >
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {limitOptions.map((n) => (
                                <SelectItem key={n} value={String(n)}>
                                    Top {n}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {isLoading ? (
                <div className="flex h-[260px] flex-col gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton
                            key={i}
                            className="h-7 w-full bg-(--admin-hover)"
                        />
                    ))}
                </div>
            ) : !data || data.length === 0 ? (
                <div className="flex h-[260px] items-center justify-center text-xs text-(--admin-text-muted)">
                    No data for this period
                </div>
            ) : (
                <div className="flex h-[260px] flex-col">
                    <div className="flex items-center gap-3 border-b border-(--admin-border) pb-2 text-[10px] text-(--admin-text-muted)">
                        <span className="w-5 text-right">#</span>
                        <span className="flex-1">Item</span>
                        <span className="w-16 text-right">Qty</span>
                        <span className="w-20 text-right">Revenue</span>
                    </div>
                    <div className="divide-y divide-(--admin-border) overflow-y-auto scrollbar-hide">
                        {data.map((item, i) => (
                            <div
                                key={item.menuItemId}
                                className="admin-table-row flex items-center gap-3 py-2 transition-colors"
                            >
                                <span className="w-5 text-right font-mono text-[10px] text-(--admin-text-muted)">
                                    {i + 1}
                                </span>
                                <span className="flex-1 truncate text-[12px] text-(--admin-text)">
                                    {item.name}
                                </span>
                                <span className="w-16 text-right font-mono text-[12px] text-(--admin-text-secondary)">
                                    {item.quantity}
                                </span>
                                <span className="w-20 text-right font-mono text-[12px] text-(--admin-text-secondary)">
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
