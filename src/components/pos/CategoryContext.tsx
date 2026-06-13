import { createContext, useContext, type ReactNode } from "react";
import useCategoriesApi from "@/hooks/useCategories";
import { getCategoryIconName } from "@/types/menu";
import type { Category as ApiCategory } from "@/hooks/useCategories";

export interface Category {
    id: string;
    label: string;
    iconName: string;
}

interface CategoryContextType {
    categories: Category[];
    isLoading: boolean;
    error: string | null;
}

const CategoryContext = createContext<CategoryContextType | undefined>(
    undefined,
);

const mapCategory = (cat: ApiCategory): Category => ({
    id: cat.id,
    label: cat.name,
    iconName: getCategoryIconName(cat.name),
});

export const CategoryProvider = ({ children }: { children: ReactNode }) => {
    const { categories: apiCategories, isLoading, error } = useCategoriesApi();

    const categories: Category[] = [
        {
            id: "all",
            label: "All",
            iconName: "Coffee",
        },
        ...apiCategories.map((cat) => mapCategory(cat)),
    ];

    return (
        <CategoryContext.Provider value={{ categories, isLoading, error }}>
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
