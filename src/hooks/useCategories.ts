import { useState, useEffect, useCallback } from "react";
import api from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";

export interface Category {
    id: string;
    name: string;
    sortOrder: number;
}

const useCategories = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCategories = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data } = await api.get<Category[]>(
                ENDPOINTS.CATEGORIES.BASE,
            );
            // Sort by sortOrder
            const sorted = [...data].sort((a, b) => a.sortOrder - b.sortOrder);
            setCategories(sorted);
        } catch {
            setError("Failed to load categories");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    return { categories, isLoading, error, refetch: fetchCategories };
};

export default useCategories;
