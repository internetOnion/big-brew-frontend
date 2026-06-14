import { useQuery } from "@tanstack/react-query";
import api from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import { settingKeys } from "@/lib/query-keys";
import type { Settings } from "@/types/order";

const fetchSettings = async (): Promise<Settings> => {
    const { data } = await api.get<Settings>(ENDPOINTS.SETTINGS.BASE);
    return data;
};

export const useSettings = () => {
    return useQuery({
        queryKey: settingKeys.all,
        queryFn: fetchSettings,
    });
};
