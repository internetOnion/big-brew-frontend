import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import { ingredientKeys } from "@/lib/query-keys";
import type { InventoryItem } from "@/types/admin";

export const useDeleteIngredient = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(ENDPOINTS.INGREDIENTS.BY_ID(id));
        },
        onMutate: async (id) => {
            await queryClient.cancelQueries({
                queryKey: ingredientKeys.all,
            });
            const previous = queryClient.getQueryData(ingredientKeys.all);
            queryClient.setQueryData(
                ingredientKeys.all,
                (old: InventoryItem[] | undefined) =>
                    old?.filter((ing) => ing.id !== id) ?? [],
            );
            return { previous };
        },
        onError: (_err, _id, context) => {
            if (context?.previous) {
                queryClient.setQueryData(ingredientKeys.all, context.previous);
            }
            toast.error("Failed to delete ingredient");
        },
        onSuccess: () => {
            toast.success("Ingredient deleted");
        },
        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: ingredientKeys.all,
            });
        },
    });
};
