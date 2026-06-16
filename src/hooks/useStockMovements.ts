import { useQuery } from "@tanstack/react-query";
import api from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import { stockMovementKeys } from "@/lib/query-keys";
import type { StockMovement } from "@/types/admin";

interface StockMovementFilters {
    ingredientId?: string;
    reason?: string;
    from?: string;
    to?: string;
}

const fetchStockMovements = async (
    filters?: StockMovementFilters,
): Promise<StockMovement[]> => {
    const params = new URLSearchParams();
    if (filters?.ingredientId) params.set("ingredientId", filters.ingredientId);
    if (filters?.reason) params.set("reason", filters.reason);
    if (filters?.from) params.set("from", filters.from);
    if (filters?.to) params.set("to", filters.to);
    const qs = params.toString();
    const { data } = await api.get<StockMovement[]>(
        `${ENDPOINTS.STOCK_MOVEMENTS.BASE}${qs ? `?${qs}` : ""}`,
    );
    return data;
};

export const useStockMovements = (filters?: StockMovementFilters) => {
    return useQuery({
        queryKey: stockMovementKeys.all(filters as Record<string, unknown>),
        queryFn: () => fetchStockMovements(filters),
    });
};
