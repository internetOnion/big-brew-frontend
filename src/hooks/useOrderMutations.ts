import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import { orderKeys } from "@/lib/query-keys";

export const useCompleteOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (orderId: string) => {
            await api.patch(ENDPOINTS.ORDERS.STATUS(orderId), {
                status: "completed",
            });
        },
        onSuccess: () => {
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
