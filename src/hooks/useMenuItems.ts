import { useState, useEffect, useCallback } from "react";
import api from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import type { MenuItemListResponse, MenuItemResponse } from "@/types/menu";

interface UseMenuItemsResult {
    items: MenuItemListResponse[];
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
    fetchItemById: (id: string) => Promise<MenuItemResponse>;
}

export const useMenuItems = (): UseMenuItemsResult => {
    const [items, setItems] = useState<MenuItemListResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchItems = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data } = await api.get<{ data: MenuItemListResponse[] }>(
                ENDPOINTS.MENU.ITEMS,
            );
            setItems(data.data);
        } catch {
            setError("Failed to load menu items");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const fetchItemById = useCallback(
        async (id: string): Promise<MenuItemResponse> => {
            const { data } = await api.get<{ data: MenuItemResponse }>(
                `${ENDPOINTS.MENU.ITEMS}/${id}`,
            );
            return data.data;
        },
        [],
    );

    return { items, isLoading, error, refetch: fetchItems, fetchItemById };
};
