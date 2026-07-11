import { useMemo } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

interface ExpenseBreakdownItem {
    category: string | null;
    total: string;
    count: number;
}

interface ExpenseBreakdownProps {
    data: ExpenseBreakdownItem[] | undefined;
    isLoading: boolean;
    currencySymbol?: string;
}

const CustomTooltip = ({
    active,
    payload,
    label,
    currencySymbol = "$",
}: {
    active?: boolean;
    payload?: { value?: number; name?: string }[];
    label?: string;
    currencySymbol?: string;
}) => {
    if (!active || !payload?.length) return null;
    const value = payload[0].value ?? 0;
    return (
        <div className="rounded-md border border-(--admin-border) bg-(--admin-card) px-2.5 py-1.5 font-mono text-[11px] text-(--admin-text) shadow-xs">
            <p className="mb-0.5 text-(--admin-text-muted)">{label}</p>
            <p className="text-(--admin-text)">
                {currencySymbol}
                {Number(value).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                })}
            </p>
        </div>
    );
};

const ExpenseBreakdown = ({
    data,
    isLoading,
    currencySymbol = "$",
}: ExpenseBreakdownProps) => {
    const chartData = useMemo(
        () =>
            data?.map((d) => ({
                category: d.category ?? "Uncategorized",
                total: parseFloat(d.total),
                count: d.count,
            })) ?? [],
        [data],
    );

    const yAxisWidth = useMemo(() => {
        const maxLabelLen = Math.max(
            ...chartData.map((d) => d.category.length),
            0,
        );
        return Math.max(60, Math.min(maxLabelLen * 7 + 8, 160));
    }, [chartData]);

    return (
        <div className="admin-card p-4">
            <div className="mb-4">
                <h2 className="text-[11px] font-medium text-(--admin-text-muted)">
                    Expenses by Category
                </h2>
            </div>

            {isLoading ? (
                <Skeleton className="h-[260px] w-full bg-(--admin-hover)" />
            ) : chartData.length === 0 ? (
                <div className="flex h-[200px] items-center justify-center text-xs text-(--admin-text-muted)">
                    No expense data for this period
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={260}>
                    <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ left: 10, right: 20 }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="var(--admin-border)"
                            horizontal={false}
                        />
                        <XAxis
                            type="number"
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
                        />
                        <YAxis
                            type="category"
                            dataKey="category"
                            tick={{
                                fontSize: 10,
                                fill: "var(--admin-text-secondary)",
                            }}
                            stroke="var(--admin-border)"
                            tickLine={false}
                            axisLine={false}
                            width={yAxisWidth}
                        />
                        <Tooltip
                            content={
                                <CustomTooltip
                                    currencySymbol={currencySymbol}
                                />
                            }
                        />
                        <Bar
                            dataKey="total"
                            fill="var(--admin-primary)"
                            radius={[0, 3, 3, 0]}
                            barSize={16}
                        />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

export default ExpenseBreakdown;
