import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import { discountKeys } from "@/lib/query-keys";
import type {
    AdminDiscount,
    CreateDiscountPayload,
    UpdateDiscountPayload,
} from "@/types/admin";

const fetchDiscounts = async (): Promise<AdminDiscount[]> => {
    const { data } = await api.get<AdminDiscount[]>(ENDPOINTS.DISCOUNTS.BASE);
    return data;
};

export const useDiscounts = () => {
    return useQuery({
        queryKey: discountKeys.all,
        queryFn: fetchDiscounts,
    });
};

export const useCreateDiscount = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: CreateDiscountPayload) => {
            const { data } = await api.post(ENDPOINTS.DISCOUNTS.BASE, payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: discountKeys.all,
            });
        },
    });
};

export const useUpdateDiscount = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            id,
            ...payload
        }: UpdateDiscountPayload & { id: string }) => {
            const { data } = await api.patch(
                ENDPOINTS.DISCOUNTS.BY_ID(id),
                payload,
            );
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: discountKeys.all,
            });
        },
    });
};

export const useDeleteDiscount = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(ENDPOINTS.DISCOUNTS.BY_ID(id));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: discountKeys.all,
            });
        },
    });
};
