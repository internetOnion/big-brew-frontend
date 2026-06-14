import { createContext, useContext, type ReactNode } from "react";
import { useCategories as useCategoriesApi } from "@/hooks/useCategories";
import { getCategoryIconName } from "@/types/menu";
import type { Category as ApiCategory, UICategory } from "@/types/category";

interface CategoryContextType {
    categories: UICategory[];
    isLoading: boolean;
    error: string | null;
}

const CategoryContext = createContext<CategoryContextType | undefined>(
    undefined,
);

const mapCategory = (cat: ApiCategory): UICategory => ({
    id: cat.id,
    label: cat.name,
    iconName: getCategoryIconName(cat.name),
});

export const CategoryProvider = ({ children }: { children: ReactNode }) => {
    const { data, isLoading, error } = useCategoriesApi();

    const categories: UICategory[] = [
        {
            id: "all",
            label: "All",
            iconName: "Coffee",
        },
        ...(data ?? []).map((cat) => mapCategory(cat)),
    ];

    return (
        <CategoryContext.Provider
            value={{
                categories,
                isLoading,
                error: error?.message ?? null,
            }}
        >
            {children}
        </CategoryContext.Provider>
    );
};

export const useCategories = () => {
    const ctx = useContext(CategoryContext);
    if (!ctx)
        throw new Error("useCategories must be used within CategoryProvider");
    return ctx;
};
