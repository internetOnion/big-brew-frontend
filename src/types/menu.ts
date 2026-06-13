import type { MenuItem } from "@/components/pos/data";

export type MenuItemListResponse = {
    id: string;
    name: string;
    basePrice: string;
    isAvailable: boolean | null;
    imageUrl: string | null;
    imagePath: string | null;
    category: {
        id: string;
        name: string;
    };
};

export type MenuItemResponse = MenuItemListResponse & {
    modifierGroups: {
        id: string;
        name: string;
        selectionType: string;
        isRequired: boolean | null;
        sortOrder: number | null;
        options: {
            id: string;
            name: string;
            price: string;
            isAvailable: boolean | null;
            sortOrder: number | null;
            ingredients: {
                id: string;
                quantity: string;
                ingredient: {
                    id: string;
                    name: string;
                    unit: string;
                };
            }[];
        }[];
    }[];
    recipes: {
        id: string;
        quantity: string;
        ingredient: {
            id: string;
            name: string;
            unit: string;
        };
    }[];
};

const FALLBACK_IMAGE = "https://placehold.co/400x300/3a2518/3a2518";

export const toMenuItem = (item: MenuItemResponse): MenuItem => {
    const hasSizes = item.modifierGroups.some((g) =>
        /size/i.test(g.name),
    );
    const hasToppings = item.modifierGroups.some((g) =>
        /topping/i.test(g.name),
    );
    const hasSugar = item.modifierGroups.some((g) =>
        /sugar/i.test(g.name),
    );

    return {
        id: item.id,
        name: item.name,
        basePrice: parseFloat(item.basePrice),
        image: item.imageUrl ?? FALLBACK_IMAGE,
        category: item.category.id as MenuItem["category"],
        hasSizes,
        hasToppings,
        hasSugar,
    };
};
