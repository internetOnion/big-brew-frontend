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

const ExpenseBreakdown = ({
    data,
    isLoading,
    currencySymbol = "$",
}: ExpenseBreakdownProps) => {
    const chartData =
        data?.map((d) => ({
            category: d.category ?? "Uncategorized",
            total: parseFloat(d.total),
            count: d.count,
        })) ?? [];

    return (
        <div className="admin-card p-4">
            <div className="mb-4">
                <h3 className="text-[11px] font-medium uppercase tracking-wide text-(--admin-text-muted)">
                    Expenses by Category
                </h3>
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
                            width={80}
                        />
                        <Tooltip
                            formatter={(value) => [
                                `${currencySymbol}${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
                                "Total",
                            ]}
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
