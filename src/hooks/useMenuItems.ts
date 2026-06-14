import { useQuery } from "@tanstack/react-query";
import api from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import { menuItemKeys } from "@/lib/query-keys";
import type { MenuItemListResponse, MenuItemResponse } from "@/types/menu";

const fetchMenuItems = async (): Promise<MenuItemListResponse[]> => {
    const { data } = await api.get<{ data: MenuItemListResponse[] }>(
        ENDPOINTS.MENU.ITEMS,
    );
    return data.data;
};

const fetchItemById = async (id: string): Promise<MenuItemResponse> => {
    const { data } = await api.get<{ data: MenuItemResponse }>(
        `${ENDPOINTS.MENU.ITEMS}/${id}`,
    );
    return data.data;
};

export const useMenuItems = () => {
    const query = useQuery({
        queryKey: menuItemKeys.all,
        queryFn: fetchMenuItems,
    });

    return { ...query, fetchItemById };
};
