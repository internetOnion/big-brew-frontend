import { useQuery } from "@tanstack/react-query";
import api from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import { analyticsKeys } from "@/lib/query-keys";
import type {
    RevenueDataPoint,
    TopItem,
    AnalyticsSummary,
} from "@/types/admin";

interface ExpenseBreakdownItem {
    category: string | null;
    total: string;
    count: number;
}

export const useRevenue = (
    from: string,
    to: string,
    groupBy: string = "day",
) => {
    return useQuery({
        queryKey: analyticsKeys.revenue(from, to, groupBy),
        queryFn: async (): Promise<RevenueDataPoint[]> => {
            const { data } = await api.get<RevenueDataPoint[]>(
                `${ENDPOINTS.ANALYTICS.REVENUE}?from=${from}&to=${to}&groupBy=${groupBy}`,
            );
            return data;
        },
        enabled: !!from && !!to,
    });
};

export const useTopItems = (
    from: string,
    to: string,
    sortBy: string = "quantity",
    limit: number = 10,
) => {
    return useQuery({
        queryKey: analyticsKeys.topItems(from, to, sortBy, limit),
        queryFn: async (): Promise<TopItem[]> => {
            const { data } = await api.get<TopItem[]>(
                `${ENDPOINTS.ANALYTICS.TOP_ITEMS}?from=${from}&to=${to}&sortBy=${sortBy}&limit=${limit}`,
            );
            return data;
        },
        enabled: !!from && !!to,
    });
};

export const useExpenseBreakdown = (from: string, to: string) => {
    return useQuery({
        queryKey: analyticsKeys.expenses(from, to),
        queryFn: async (): Promise<ExpenseBreakdownItem[]> => {
            const { data } = await api.get<ExpenseBreakdownItem[]>(
                `${ENDPOINTS.ANALYTICS.EXPENSES}?from=${from}&to=${to}`,
            );
            return data;
        },
        enabled: !!from && !!to,
    });
};

export const useAnalyticsSummary = (from: string, to: string) => {
    return useQuery({
        queryKey: analyticsKeys.summary(from, to),
        queryFn: async (): Promise<AnalyticsSummary> => {
            const { data } = await api.get<AnalyticsSummary>(
                `${ENDPOINTS.ANALYTICS.SUMMARY}?from=${from}&to=${to}`,
            );
            return data;
        },
        enabled: !!from && !!to,
    });
};
