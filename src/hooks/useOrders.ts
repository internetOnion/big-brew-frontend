import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import { orderKeys } from "@/lib/query-keys";
import type { PaginatedOrdersResponse } from "@/types/order";

interface OrderFilters {
    status?: string;
    created_by_id?: string;
    limit?: number;
    offset?: number;
    from?: string;
    to?: string;
}

const fetchOrders = async (
    filters?: OrderFilters,
): Promise<PaginatedOrdersResponse> => {
    const params = new URLSearchParams();
    if (filters?.status) params.set("status", filters.status);
    if (filters?.created_by_id)
        params.set("created_by_id", filters.created_by_id);
    if (filters?.limit) params.set("limit", String(filters.limit));
    if (filters?.offset) params.set("offset", String(filters.offset));
    if (filters?.from) params.set("from", filters.from);
    if (filters?.to) params.set("to", filters.to);
    const qs = params.toString();
    const { data } = await api.get<PaginatedOrdersResponse>(
        `${ENDPOINTS.ORDERS.BASE}${qs ? `?${qs}` : ""}`,
    );
    return data;
};

export const useAdminOrders = (filters?: OrderFilters) => {
    return useQuery({
        queryKey: orderKeys.list(filters as Record<string, unknown>),
        queryFn: () => fetchOrders(filters),
    });
};

export const useApproveVoid = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { data } = await api.post(ENDPOINTS.ORDERS.VOID_APPROVE(id));
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["orders"] });
        },
    });
};

export const useRejectVoid = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { data } = await api.post(ENDPOINTS.ORDERS.VOID_REJECT(id));
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["orders"] });
        },
    });
};
