import { useState } from "react";
import { endOfDay, format } from "date-fns";
import {
    useAnalyticsSummary,
    useRevenue,
    useTopItems,
    useExpenseBreakdown,
} from "@/hooks/useAnalytics";
import { useSettings } from "@/hooks/useSettings";
import DateRangePicker, {
    type DateRange,
} from "@/components/admin/dashboard/DateRangePicker";
import KPICards from "@/components/admin/dashboard/KPICards";
import RevenueChart from "@/components/admin/dashboard/RevenueChart";
import TopItems from "@/components/admin/dashboard/TopItems";
import ExpenseBreakdown from "@/components/admin/dashboard/ExpenseBreakdown";

const DashboardPage = () => {
    const [dateRange, setDateRange] = useState<DateRange>({
        from: new Date(),
        to: endOfDay(new Date()),
    });
    const [groupBy, setGroupBy] = useState("day");
    const [sortBy, setSortBy] = useState("quantity");
    const [topLimit, setTopLimit] = useState(10);

    const fromStr = format(dateRange.from, "yyyy-MM-dd'T'HH:mm:ss'Z'");
    const toStr = format(dateRange.to, "yyyy-MM-dd'T'HH:mm:ss'Z'");

    const { data: summary, isLoading: summaryLoading } = useAnalyticsSummary(
        fromStr,
        toStr,
    );
    const { data: revenue, isLoading: revenueLoading } = useRevenue(
        fromStr,
        toStr,
        groupBy,
    );
    const { data: topItems, isLoading: topItemsLoading } = useTopItems(
        fromStr,
        toStr,
        sortBy,
        topLimit,
    );
    const { data: expenses, isLoading: expensesLoading } = useExpenseBreakdown(
        fromStr,
        toStr,
    );
    const { data: settings } = useSettings();

    const currencySymbol = settings?.currencySymbol ?? "$";

    return (
        <div className="flex flex-col gap-4 p-5">
            {/* Header row */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-[13px] font-medium text-[var(--admin-primary)]">
                    Dashboard
                </h1>
                <DateRangePicker value={dateRange} onChange={setDateRange} />
            </div>

            {/* KPIs */}
            <KPICards
                summary={summary}
                isLoading={summaryLoading}
                currencySymbol={currencySymbol}
            />

            {/* Charts row */}
            <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
                <RevenueChart
                    data={revenue}
                    isLoading={revenueLoading}
                    groupBy={groupBy}
                    onGroupByChange={setGroupBy}
                    currencySymbol={currencySymbol}
                />
                <TopItems
                    data={topItems}
                    isLoading={topItemsLoading}
                    sortBy={sortBy}
                    onSortByChange={setSortBy}
                    limit={topLimit}
                    onLimitChange={setTopLimit}
                    currencySymbol={currencySymbol}
                />
            </div>

            {/* Bottom row */}
            <ExpenseBreakdown
                data={expenses}
                isLoading={expensesLoading}
                currencySymbol={currencySymbol}
            />
        </div>
    );
};

export default DashboardPage;
