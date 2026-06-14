import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import { ingredientKeys } from "@/lib/query-keys";
import type { InventoryItem, StockAdjustPayload } from "@/types/admin";

const fetchIngredients = async (): Promise<InventoryItem[]> => {
    const { data } = await api.get<InventoryItem[]>(ENDPOINTS.INGREDIENTS.BASE);
    return data;
};

export const useIngredients = () => {
    return useQuery({
        queryKey: ingredientKeys.all,
        queryFn: fetchIngredients,
    });
};

export const useAdjustStock = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            id,
            ...payload
        }: StockAdjustPayload & { id: string }) => {
            const { data } = await api.post(
                ENDPOINTS.INGREDIENTS.ADJUST(id),
                payload,
            );
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ingredientKeys.all,
            });
            queryClient.invalidateQueries({
                queryKey: ["stock-movements"],
            });
        },
    });
};
