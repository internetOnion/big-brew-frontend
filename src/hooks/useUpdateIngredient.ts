import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import { ingredientKeys } from "@/lib/query-keys";

interface UpdateIngredientPayload {
    name?: string;
    unit?: string;
    stockQuantity?: number;
    lowStockThreshold?: number;
}

export const useUpdateIngredient = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            ...payload
        }: UpdateIngredientPayload & { id: string }) => {
            const { data } = await api.patch(
                ENDPOINTS.INGREDIENTS.BY_ID(id),
                payload,
            );
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ingredientKeys.all });
        },
        onError: () => {
            toast.error("Failed to update ingredient");
        },
    });
};
