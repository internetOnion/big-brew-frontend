import { format, parseISO } from "date-fns";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { RevenueDataPoint } from "@/types/admin";

interface RevenueChartProps {
    data: RevenueDataPoint[] | undefined;
    isLoading: boolean;
    groupBy: string;
    onGroupByChange: (value: string) => void;
    currencySymbol?: string;
}

const groupByOptions = [
    { value: "day", label: "Day" },
    { value: "week", label: "Week" },
    { value: "month", label: "Month" },
    { value: "year", label: "Year" },
];

const formatPeriod = (period: string, groupBy: string) => {
    try {
        const date = parseISO(period);
        switch (groupBy) {
            case "day":
                return format(date, "MMM d");
            case "week":
                return format(date, "MMM d");
            case "month":
                return format(date, "MMM yyyy");
            case "year":
                return format(date, "yyyy");
            default:
                return format(date, "MMM d");
        }
    } catch {
        return period;
    }
};

const RevenueChart = ({
    data,
    isLoading,
    groupBy,
    onGroupByChange,
    currencySymbol = "$",
}: RevenueChartProps) => {
    const chartData =
        data?.map((d) => ({
            ...d,
            revenue: parseFloat(d.revenue),
            periodLabel: formatPeriod(d.period, groupBy),
        })) ?? [];

    return (
        <div className="admin-card p-4">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-[11px] font-medium uppercase tracking-wide text-[var(--admin-text-muted)]">
                    Revenue Over Time
                </h3>
                <div className="flex gap-0.5 rounded-md bg-[var(--admin-hover)] p-0.5">
                    {groupByOptions.map((opt) => (
                        <Button
                            key={opt.value}
                            variant="ghost"
                            size="xs"
                            onClick={() => onGroupByChange(opt.value)}
                            className={`h-6 px-2 text-[11px] ${
                                groupBy === opt.value
                                    ? "bg-[var(--admin-card)] font-medium text-[var(--admin-primary)] shadow-sm"
                                    : "text-[var(--admin-text-muted)] hover:text-[var(--admin-text-secondary)]"
                            }`}
                        >
                            {opt.label}
                        </Button>
                    ))}
                </div>
            </div>

            {isLoading ? (
                <Skeleton className="h-[260px] w-full bg-[var(--admin-hover)]" />
            ) : chartData.length === 0 ? (
                <div className="flex h-[260px] items-center justify-center text-xs text-[var(--admin-text-muted)]">
                    No revenue data for this period
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={chartData}>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="var(--admin-border)"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="periodLabel"
                            tick={{
                                fontSize: 10,
                                fill: "var(--admin-text-muted)",
                            }}
                            stroke="var(--admin-border)"
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            tick={{
                                fontSize: 10,
                                fill: "var(--admin-text-muted)",
                            }}
                            stroke="var(--admin-border)"
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(v) =>
                                `${currencySymbol}${v.toLocaleString()}`
                            }
                            width={55}
                        />
                        <Tooltip
                            formatter={(value) => [
                                `${currencySymbol}${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
                                "Revenue",
                            ]}
                            labelFormatter={(label) => label}
                            contentStyle={{
                                borderRadius: "6px",
                                border: "1px solid var(--admin-border)",
                                backgroundColor: "var(--admin-card)",
                                color: "var(--admin-text)",
                                fontSize: "11px",
                                fontFamily: "DM Mono, monospace",
                                boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.05)",
                            }}
                            itemStyle={{ color: "var(--admin-text)" }}
                            labelStyle={{
                                color: "var(--admin-text-muted)",
                                marginBottom: "4px",
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="revenue"
                            stroke="var(--admin-accent)"
                            strokeWidth={1.5}
                            dot={false}
                            activeDot={{
                                r: 3,
                                fill: "var(--admin-accent)",
                                stroke: "var(--admin-card)",
                                strokeWidth: 2,
                            }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

export default RevenueChart;
