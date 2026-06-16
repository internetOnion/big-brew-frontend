import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import { categoryKeys } from "@/lib/query-keys";
import type { Category } from "@/types/category";

const fetchCategories = async (): Promise<Category[]> => {
    const { data } = await api.get<Category[]>(ENDPOINTS.CATEGORIES.BASE);
    return [...data].sort((a, b) => a.sortOrder - b.sortOrder);
};

export const useCategories = () => {
    return useQuery({
        queryKey: categoryKeys.all,
        queryFn: fetchCategories,
    });
};

export const useCreateCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            name,
            sortOrder,
        }: {
            name: string;
            sortOrder?: number;
        }) => {
            const { data } = await api.post(ENDPOINTS.CATEGORIES.BASE, {
                name,
                sortOrder: sortOrder ?? 0,
            });
            return data;
        },
        onSuccess: () => {
            toast.success("Category created");
            queryClient.invalidateQueries({ queryKey: categoryKeys.all });
        },
        onError: () => {
            toast.error("Failed to create category. Name may already exist.");
        },
    });
};

export const useUpdateCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            name,
            sortOrder,
        }: {
            id: string;
            name: string;
            sortOrder?: number;
        }) => {
            const { data } = await api.patch(ENDPOINTS.CATEGORIES.BY_ID(id), {
                name,
                sortOrder: sortOrder ?? 0,
            });
            return data;
        },
        onSuccess: () => {
            toast.success("Category updated");
            queryClient.invalidateQueries({ queryKey: categoryKeys.all });
        },
        onError: () => {
            toast.error("Failed to update category. Name may already exist.");
        },
    });
};

export const useDeleteCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(ENDPOINTS.CATEGORIES.BY_ID(id));
        },
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: categoryKeys.all });
            const previous = queryClient.getQueryData(categoryKeys.all);
            queryClient.setQueryData(
                categoryKeys.all,
                (old: Category[] | undefined) =>
                    old?.filter((cat) => cat.id !== id) ?? [],
            );
            return { previous };
        },
        onError: (_err, _id, context) => {
            if (context?.previous) {
                queryClient.setQueryData(categoryKeys.all, context.previous);
            }
            toast.error(
                "Failed to delete category. Make sure it has no menu items.",
            );
        },
        onSuccess: () => {
            toast.success("Category deleted");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: categoryKeys.all });
        },
    });
};
