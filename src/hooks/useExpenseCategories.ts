import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import { expenseCategoryKeys } from "@/lib/query-keys";
import type { ExpenseCategory } from "@/types/admin";

const fetchExpenseCategories = async (): Promise<ExpenseCategory[]> => {
    const { data } = await api.get<ExpenseCategory[]>(
        ENDPOINTS.EXPENSES.CATEGORIES,
    );
    return data;
};

export const useExpenseCategories = () => {
    return useQuery({
        queryKey: expenseCategoryKeys.all,
        queryFn: fetchExpenseCategories,
    });
};

export const useCreateExpenseCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ name }: { name: string }) => {
            const { data } = await api.post(ENDPOINTS.EXPENSES.CATEGORIES, {
                name,
            });
            return data;
        },
        onSuccess: () => {
            toast.success("Category created");
            queryClient.invalidateQueries({
                queryKey: expenseCategoryKeys.all,
            });
        },
        onError: () => {
            toast.error("Failed to create category. Name may already exist.");
        },
    });
};

export const useUpdateExpenseCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, name }: { id: string; name: string }) => {
            const { data } = await api.patch(
                ENDPOINTS.EXPENSES.CATEGORY_BY_ID(id),
                { name },
            );
            return data;
        },
        onSuccess: () => {
            toast.success("Category updated");
            queryClient.invalidateQueries({
                queryKey: expenseCategoryKeys.all,
            });
        },
        onError: () => {
            toast.error("Failed to update category. Name may already exist.");
        },
    });
};

export const useDeleteExpenseCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(ENDPOINTS.EXPENSES.CATEGORY_BY_ID(id));
        },
        onMutate: async (id) => {
            await queryClient.cancelQueries({
                queryKey: expenseCategoryKeys.all,
            });
            const previous = queryClient.getQueryData(expenseCategoryKeys.all);
            queryClient.setQueryData(
                expenseCategoryKeys.all,
                (old: ExpenseCategory[] | undefined) =>
                    old?.filter((cat) => cat.id !== id) ?? [],
            );
            return { previous };
        },
        onError: (_err, _id, context) => {
            if (context?.previous) {
                queryClient.setQueryData(
                    expenseCategoryKeys.all,
                    context.previous,
                );
            }
            toast.error("Failed to delete category.");
        },
        onSuccess: () => {
            toast.success("Category deleted");
        },
        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: expenseCategoryKeys.all,
            });
        },
    });
};
