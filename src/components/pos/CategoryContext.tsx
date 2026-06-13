import { createContext, useContext, type ReactNode } from "react";
import useCategoriesApi from "@/hooks/useCategories";
import { getCategoryIconName } from "@/types/menu";
import type { Category as ApiCategory } from "@/hooks/useCategories";

export interface Category {
    id: string;
    label: string;
    color: string;
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

// Warm palette cycle for category pills
const CATEGORY_COLORS = [
    "#4A2512",
    "#6B3A1F",
    "#8B5E3C",
    "#5C8A5C",
    "#3A7CA5",
    "#C07830",
    "#7B4F8A",
    "#A0522D",
];

const mapCategory = (cat: ApiCategory, index: number): Category => ({
    id: cat.id,
    label: cat.name,
    color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    iconName: getCategoryIconName(cat.name),
});

export const CategoryProvider = ({ children }: { children: ReactNode }) => {
    const { categories: apiCategories, isLoading, error } = useCategoriesApi();

    const categories: Category[] = [
        {
            id: "all",
            label: "All",
            color: "#4A2512",
            iconName: "Coffee",
        },
        ...apiCategories.map((cat, i) => mapCategory(cat, i)),
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
