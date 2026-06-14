import { useQuery } from "@tanstack/react-query";
import api from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import { categoryKeys } from "@/lib/query-keys";
import type { Category } from "@/types/category";

const fetchCategories = async (): Promise<Category[]> => {
    const { data } = await api.get<Category[]>(ENDPOINTS.CATEGORIES.BASE);
    return [...data].sort((a, b) => a.sortOrder - b.sortOrder);
};

export const useCategories = () => {
    return useQuery({
        queryKey: categoryKeys.all,
        queryFn: fetchCategories,
    });
};
