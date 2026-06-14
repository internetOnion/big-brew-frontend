import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import { expenseKeys } from "@/lib/query-keys";
import type {
    Expense,
    CreateExpensePayload,
    UpdateExpensePayload,
    ExpenseSummary,
} from "@/types/admin";

interface ExpenseFilters {
    from?: string;
    to?: string;
    category?: string;
}

const fetchExpenses = async (filters?: ExpenseFilters): Promise<Expense[]> => {
    const params = new URLSearchParams();
    if (filters?.from) params.set("from", filters.from);
    if (filters?.to) params.set("to", filters.to);
    if (filters?.category) params.set("category", filters.category);
    const qs = params.toString();
    const { data } = await api.get<Expense[]>(
        `${ENDPOINTS.EXPENSES.BASE}${qs ? `?${qs}` : ""}`,
    );
    return data;
};

const fetchExpenseSummary = async (
    from: string,
    to: string,
): Promise<ExpenseSummary> => {
    const { data } = await api.get<ExpenseSummary>(
        `${ENDPOINTS.EXPENSES.SUMMARY}?from=${from}&to=${to}`,
    );
    return data;
};

export const useExpenses = (filters?: ExpenseFilters) => {
    return useQuery({
        queryKey: expenseKeys.all(filters as Record<string, unknown>),
        queryFn: () => fetchExpenses(filters),
    });
};

export const useExpenseSummary = (from: string, to: string) => {
    return useQuery({
        queryKey: expenseKeys.summary(from, to),
        queryFn: () => fetchExpenseSummary(from, to),
        enabled: !!from && !!to,
    });
};

export const useCreateExpense = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: CreateExpensePayload) => {
            const { data } = await api.post(ENDPOINTS.EXPENSES.BASE, payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["expenses"] });
        },
    });
};

export const useUpdateExpense = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            id,
            ...payload
        }: UpdateExpensePayload & { id: string }) => {
            const { data } = await api.patch(
                ENDPOINTS.EXPENSES.BY_ID(id),
                payload,
            );
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["expenses"] });
        },
    });
};

export const useDeleteExpense = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(ENDPOINTS.EXPENSES.BY_ID(id));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["expenses"] });
        },
    });
};
