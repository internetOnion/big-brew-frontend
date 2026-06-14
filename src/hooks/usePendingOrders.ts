import { useQuery } from "@tanstack/react-query";
import api from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import { orderKeys } from "@/lib/query-keys";
import type { Order } from "@/types/order";

const fetchPendingOrders = async (): Promise<Order[]> => {
    const { data } = await api.get<Order[]>(ENDPOINTS.ORDERS.BASE, {
        params: { status: "pending" },
    });
    return data;
};

export const usePendingOrders = () => {
    return useQuery({
        queryKey: orderKeys.pending,
        queryFn: fetchPendingOrders,
        refetchInterval: 10_000,
    });
};
