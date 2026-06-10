import {
    createContext,
    useContext,
    useState,
    useCallback,
    type ReactNode,
} from "react";

export interface Category {
    id: string;
    label: string;
    color: string;
}

export interface CategoryContextType {
    categories: Category[];
    addCategory: (
        label: string,
        color?: string,
    ) => { success: boolean; message?: string };
    deleteCategory: (categoryId: string, itemCount: number) => boolean;
}

const defaultCategories: Category[] = [
    { id: "all", label: "All", color: "#4A2512" },
    { id: "espresso", label: "Espresso", color: "#6B3A1F" },
    { id: "milk", label: "Milk Drinks", color: "#8B5E3C" },
    { id: "tea", label: "Tea", color: "#5C8A5C" },
    { id: "cold", label: "Cold Drinks", color: "#3A7CA5" },
    { id: "food", label: "Food", color: "#C07830" },
];

const STORAGE_KEY = "brewpoint_pos_categories";
const DELETED_KEY = "brewpoint_pos_deleted_categories";

const getStoredCategories = (): Category[] | null => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw) as Category[];
    } catch {
        // ignore
    }
    return null;
};

const getDeletedIds = (): string[] => {
    try {
        const raw = localStorage.getItem(DELETED_KEY);
        if (raw) return JSON.parse(raw) as string[];
    } catch {
        // ignore
    }
    return [];
};

const saveCategories = (cats: Category[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cats));
};

const saveDeletedIds = (ids: string[]) => {
    localStorage.setItem(DELETED_KEY, JSON.stringify(ids));
};

const buildInitialCategories = (): Category[] => {
    const stored = getStoredCategories();
    if (stored) return stored;
    const deleted = getDeletedIds();
    return defaultCategories.filter((c) => !deleted.includes(c.id));
};

const CategoryContext = createContext<CategoryContextType | undefined>(
    undefined,
);

export const CategoryProvider = ({ children }: { children: ReactNode }) => {
    const [categories, setCategories] = useState<Category[]>(
        buildInitialCategories,
    );

    const addCategory = useCallback(
        (label: string, color?: string) => {
            const trimmed = label.trim();
            if (!trimmed) {
                return { success: false, message: "Category name is required" };
            }
            const exists = categories.some(
                (c) => c.label.toLowerCase() === trimmed.toLowerCase(),
            );
            if (exists) {
                return { success: false, message: "Category already exists" };
            }
            const newCat: Category = {
                id: `custom-${Date.now()}`,
                label: trimmed,
                color: color || "#8B7A67",
            };
            const next = [...categories, newCat];
            setCategories(next);
            saveCategories(next);
            return { success: true };
        },
        [categories],
    );

    const deleteCategory = useCallback(
        (categoryId: string, itemCount: number) => {
            if (categoryId === "all") return false;
            if (itemCount > 0) return false;
            const next = categories.filter((c) => c.id !== categoryId);
            setCategories(next);
            saveCategories(next);
            const deleted = getDeletedIds();
            if (!deleted.includes(categoryId)) {
                saveDeletedIds([...deleted, categoryId]);
            }
            return true;
        },
        [categories],
    );

    return (
        <CategoryContext.Provider
            value={{ categories, addCategory, deleteCategory }}
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
