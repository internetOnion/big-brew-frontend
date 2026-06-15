import {
    CurrencyDollar,
    TrendDown,
    TrendUp,
    ShoppingCart,
} from "@phosphor-icons/react";
import { Skeleton } from "@/components/ui/skeleton";
import type { AnalyticsSummary } from "@/types/admin";

interface KPICardsProps {
    summary: AnalyticsSummary | undefined;
    isLoading: boolean;
    currencySymbol?: string;
}

const fmt = (value: string, symbol: string = "$") => {
    const num = parseFloat(value);
    return `${symbol}${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const kpis = [
    {
        key: "totalRevenue" as const,
        label: "Total Revenue",
        icon: CurrencyDollar,
        color: "text-emerald-600",
    },
    {
        key: "totalExpenses" as const,
        label: "Total Expenses",
        icon: TrendDown,
        color: "text-red-500",
    },
    {
        key: "netIncome" as const,
        label: "Net Income",
        icon: TrendUp,
        color: "text-blue-600",
    },
    {
        key: "averageOrderValue" as const,
        label: "Avg Order Value",
        icon: ShoppingCart,
        color: "text-[var(--admin-accent)]",
    },
];

const KPICards = ({
    summary,
    isLoading,
    currencySymbol = "$",
}: KPICardsProps) => {
    if (isLoading) {
        return (
            <div className="grid gap-px grid-cols-2 overflow-hidden rounded-lg border border-[var(--admin-border)] bg-[var(--admin-border)] lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-[var(--admin-card)] p-4">
                        <Skeleton className="mb-3 h-3 w-20 bg-[var(--admin-hover)]" />
                        <Skeleton className="h-6 w-28 bg-[var(--admin-hover)]" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid gap-px grid-cols-2 overflow-hidden rounded-lg border border-[var(--admin-border)] bg-[var(--admin-border)] lg:grid-cols-4">
            {kpis.map((kpi) => {
                const value = summary?.[kpi.key] ?? "0";
                const isNegative =
                    kpi.key === "netIncome" && parseFloat(value) < 0;

                return (
                    <div key={kpi.key} className="bg-[var(--admin-card)] p-4">
                        <div className="mb-2 flex items-center gap-2">
                            <kpi.icon
                                className={`size-3.5 ${isNegative ? "text-red-500" : kpi.color}`}
                            />
                            <span className="text-[11px] text-[var(--admin-text-muted)]">
                                {kpi.label}
                            </span>
                        </div>
                        <p
                            className={`font-mono text-lg font-medium tracking-tight ${
                                isNegative
                                    ? "text-red-500"
                                    : "text-[var(--admin-text)]"
                            }`}
                        >
                            {fmt(value, currencySymbol)}
                        </p>
                    </div>
                );
            })}

            {summary && (
                <div className="col-span-2 flex items-center justify-between bg-[var(--admin-card)] px-4 py-3 lg:col-span-4">
                    <span className="text-[11px] text-[var(--admin-text-muted)]">
                        Total Orders
                    </span>
                    <span className="font-mono text-sm font-medium text-[var(--admin-text)]">
                        {summary.orderCount.toLocaleString()}
                    </span>
                </div>
            )}
        </div>
    );
};

export default KPICards;
