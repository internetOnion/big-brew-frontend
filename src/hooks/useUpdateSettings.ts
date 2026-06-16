import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import { settingKeys } from "@/lib/query-keys";
import type { Settings } from "@/types/order";

export const useUpdateSettings = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: Partial<Settings>) => {
            const { data } = await api.patch(ENDPOINTS.SETTINGS.BASE, payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: settingKeys.all });
        },
    });
};
