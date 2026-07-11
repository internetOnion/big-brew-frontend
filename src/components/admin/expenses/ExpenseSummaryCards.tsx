import { useMemo } from "react";
import {
    CurrencyDollarIcon,
    TagIcon,
    ArticleIcon,
} from "@phosphor-icons/react";
import { Skeleton } from "@/components/ui/skeleton";
import type { ExpenseSummary } from "@/types/admin";

interface ExpenseSummaryCardsProps {
    summary: ExpenseSummary | undefined;
    isLoading: boolean;
    currencySymbol?: string;
}

const fmt = (value: string, symbol: string = "$") => {
    const num = parseFloat(value);
    return `${symbol}${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const ExpenseSummaryCards = ({
    summary,
    isLoading,
    currencySymbol = "$",
}: ExpenseSummaryCardsProps) => {
    const topCategory = useMemo(
        () =>
            summary?.byCategory
                ? [...summary.byCategory].sort(
                      (a, b) => parseFloat(b.total) - parseFloat(a.total),
                  )[0]
                : null,
        [summary],
    );

    const entryCount = useMemo(
        () => summary?.byCategory?.reduce((sum, c) => sum + c.count, 0) ?? 0,
        [summary],
    );

    if (isLoading) {
        return (
            <div className="grid gap-px grid-cols-1 sm:grid-cols-3 overflow-hidden rounded-lg border border-(--admin-border) bg-(--admin-border)">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-(--admin-card) p-4">
                        <Skeleton className="mb-3 h-3 w-20 bg-(--admin-hover)" />
                        <Skeleton className="h-6 w-28 bg-(--admin-hover)" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid gap-px grid-cols-1 sm:grid-cols-3 overflow-hidden rounded-lg border border-(--admin-border) bg-(--admin-border)">
            <div className="bg-(--admin-card) p-4 transition-colors duration-150 hover:bg-(--admin-hover)">
                <div className="mb-2 flex items-center gap-2">
                    <CurrencyDollarIcon className="size-3.5 text-(--admin-primary)" />
                    <span className="text-[11px] text-(--admin-text-muted)">
                        Total Expenses
                    </span>
                </div>
                <p className="font-mono text-lg font-medium tracking-tight text-(--admin-text)">
                    {fmt(summary?.total ?? "0", currencySymbol)}
                </p>
            </div>
            <div className="bg-(--admin-card) p-4 transition-colors duration-150 hover:bg-(--admin-hover)">
                <div className="mb-2 flex items-center gap-2">
                    <TagIcon className="size-3.5 text-(--admin-accent)" />
                    <span className="text-[11px] text-(--admin-text-muted)">
                        Top Category
                    </span>
                </div>
                <p className="font-mono text-sm font-medium text-(--admin-text)">
                    {topCategory?.category ?? "—"}
                </p>
                <p className="font-mono text-[11px] text-(--admin-text-secondary)">
                    {topCategory
                        ? fmt(topCategory.total, currencySymbol)
                        : `${currencySymbol}0.00`}
                </p>
            </div>
            <div className="bg-(--admin-card) p-4 transition-colors duration-150 hover:bg-(--admin-hover)">
                <div className="mb-2 flex items-center gap-2">
                    <ArticleIcon className="size-3.5 text-(--admin-primary)" />
                    <span className="text-[11px] text-(--admin-text-muted)">
                        Entries
                    </span>
                </div>
                <p className="font-mono text-lg font-medium tracking-tight text-(--admin-text)">
                    {entryCount.toLocaleString()}
                </p>
            </div>
        </div>
    );
};

export default ExpenseSummaryCards;
