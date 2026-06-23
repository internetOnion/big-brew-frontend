import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import { orderKeys } from "@/lib/query-keys";
import type { Order } from "@/types/order";

export const useCompleteOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (orderId: string) => {
            await api.patch(ENDPOINTS.ORDERS.STATUS(orderId), {
                status: "completed",
            });
        },
        onMutate: async (orderId) => {
            await queryClient.cancelQueries({
                queryKey: orderKeys.pending,
            });
            const snapshot = queryClient.getQueryData<Order[]>(
                orderKeys.pending,
            );
            queryClient.setQueryData<Order[]>(
                orderKeys.pending,
                (old) => old?.filter((o) => o.id !== orderId) ?? [],
            );
            return { snapshot };
        },
        onError: (_error, _orderId, context) => {
            if (context?.snapshot) {
                queryClient.setQueryData(orderKeys.pending, context.snapshot);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: orderKeys.pending });
        },
    });
};

export const useVoidOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            orderId,
            reason,
            verifiedEmployeeId,
        }: {
            orderId: string;
            reason: string;
            verifiedEmployeeId?: string;
        }) => {
            await api.post(ENDPOINTS.ORDERS.VOID_REQUEST(orderId), {
                reason,
                verified_employee_id: verifiedEmployeeId,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: orderKeys.pending });
        },
    });
};

export const useVoidWithPin = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            orderId,
            pin,
            reason,
        }: {
            orderId: string;
            pin: string;
            reason: string;
        }) => {
            await api.post(ENDPOINTS.ORDERS.VOID_WITH_PIN(orderId), {
                pin,
                reason,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: orderKeys.pending });
        },
    });
};
