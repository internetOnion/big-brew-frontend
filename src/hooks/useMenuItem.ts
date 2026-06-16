import { useQuery } from "@tanstack/react-query";
import api from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import { menuItemKeys } from "@/lib/query-keys";
import type { MenuItemResponse } from "@/types/menu";

const fetchMenuItem = async (id: string): Promise<MenuItemResponse> => {
    const { data } = await api.get<{ data: MenuItemResponse }>(
        ENDPOINTS.MENU.BY_ID(id),
    );
    return data.data;
};

export const useMenuItem = (id: string) => {
    return useQuery({
        queryKey: menuItemKeys.detail(id),
        queryFn: () => fetchMenuItem(id),
        enabled: !!id,
    });
};
