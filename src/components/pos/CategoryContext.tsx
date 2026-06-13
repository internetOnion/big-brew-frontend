import { createContext, useContext, useState, type ReactNode } from "react";

export interface Category {
    id: string;
    label: string;
    color: string;
}

interface CategoryContextType {
    categories: Category[];
}

const defaultCategories: Category[] = [
    { id: "all", label: "All", color: "#4A2512" },
    { id: "espresso", label: "Espresso", color: "#6B3A1F" },
    { id: "milk", label: "Milk Drinks", color: "#8B5E3C" },
    { id: "tea", label: "Tea", color: "#5C8A5C" },
    { id: "cold", label: "Cold Drinks", color: "#3A7CA5" },
    { id: "food", label: "Food", color: "#C07830" },
];

const CategoryContext = createContext<CategoryContextType | undefined>(
    undefined,
);

export const CategoryProvider = ({ children }: { children: ReactNode }) => {
    const [categories] = useState<Category[]>(defaultCategories);

    return (
        <CategoryContext.Provider value={{ categories }}>
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
