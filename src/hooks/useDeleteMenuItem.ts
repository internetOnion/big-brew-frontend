import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import { menuItemKeys } from "@/lib/query-keys";
import type { MenuItemListResponse } from "@/types/menu";

export const useDeleteMenuItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(ENDPOINTS.MENU.BY_ID(id));
        },
        onMutate: async (id) => {
            await queryClient.cancelQueries({
                queryKey: menuItemKeys.all,
            });
            const previous = queryClient.getQueryData<MenuItemListResponse[]>(
                menuItemKeys.all,
            );
            queryClient.setQueryData<MenuItemListResponse[]>(
                menuItemKeys.all,
                (old) => old?.filter((item) => item.id !== id) ?? [],
            );
            return { previous };
        },
        onError: (_err, _id, context) => {
            if (context?.previous) {
                queryClient.setQueryData(menuItemKeys.all, context.previous);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: menuItemKeys.all,
            });
        },
    });
};
