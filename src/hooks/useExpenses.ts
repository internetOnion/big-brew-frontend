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
    limit?: number;
    offset?: number;
}

export interface ExpensePagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

interface PaginatedResponse {
    data: Expense[];
    pagination: ExpensePagination;
}

const fetchExpenses = async (
    filters?: ExpenseFilters,
): Promise<PaginatedResponse> => {
    const params = new URLSearchParams();
    if (filters?.from) params.set("from", filters.from);
    if (filters?.to) params.set("to", filters.to);
    if (filters?.category) params.set("category", filters.category);
    if (filters?.limit) params.set("limit", String(filters.limit));
    if (filters?.offset !== undefined)
        params.set("offset", String(filters.offset));
    const qs = params.toString();
    const { data } = await api.get<PaginatedResponse>(
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
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ["expenses"] });
            const previous = queryClient.getQueriesData<PaginatedResponse>({
                queryKey: ["expenses"],
            });
            for (const [queryKey, cached] of previous) {
                if (!cached) continue;
                queryClient.setQueryData<PaginatedResponse>(queryKey, (old) =>
                    old
                        ? {
                              data: old.data.filter((e) => e.id !== id),
                              pagination: {
                                  ...old.pagination,
                                  total: Math.max(0, old.pagination.total - 1),
                              },
                          }
                        : old,
                );
            }
            return { previous };
        },
        onError: (_err, _id, context) => {
            if (context?.previous) {
                for (const [queryKey, cached] of context.previous) {
                    queryClient.setQueryData(queryKey, cached);
                }
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["expenses"] });
        },
    });
};
