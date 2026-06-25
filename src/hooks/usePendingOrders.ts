import { useQuery } from "@tanstack/react-query";
import api from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import { orderKeys } from "@/lib/query-keys";
import type { Order, PaginatedOrdersResponse } from "@/types/order";

const fetchPendingOrders = async (): Promise<Order[]> => {
    const { data } = await api.get<PaginatedOrdersResponse>(
        ENDPOINTS.ORDERS.BASE,
        {
            params: { status: "pending", limit: 1000 },
        },
    );
    return data.data;
};

export const usePendingOrders = () => {
    return useQuery({
        queryKey: orderKeys.pending,
        queryFn: fetchPendingOrders,
        refetchInterval: 10_000,
    });
};
