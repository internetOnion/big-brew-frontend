export type ModifierOption = {
    id: string;
    name: string;
    price: number;
    isAvailable: boolean;
    sortOrder: number | null;
};

export type ModifierGroup = {
    id: string;
    name: string;
    selectionType: "single" | "multiple";
    isRequired: boolean;
    sortOrder: number | null;
    options: ModifierOption[];
};

export interface MenuItem {
    id: string;
    name: string;
    basePrice: number;
    image: string;
    category: string;
    hasSizes: boolean;
    hasToppings: boolean;
    hasSugar: boolean;
    modifierGroups?: ModifierGroup[];
}

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
    const hasSizes = item.modifierGroups.some((g) => /size/i.test(g.name));
    const hasToppings = item.modifierGroups.some((g) =>
        /topping/i.test(g.name),
    );
    const hasSugar = item.modifierGroups.some((g) => /sugar/i.test(g.name));

    const modifierGroups: ModifierGroup[] = item.modifierGroups.map((g) => ({
        id: g.id,
        name: g.name,
        selectionType: g.selectionType as "single" | "multiple",
        isRequired: g.isRequired ?? false,
        sortOrder: g.sortOrder,
        options: g.options
            .filter((o) => o.isAvailable !== false)
            .map((o) => ({
                id: o.id,
                name: o.name,
                price: parseFloat(o.price),
                isAvailable: o.isAvailable ?? true,
                sortOrder: o.sortOrder,
            }))
            .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    }));

    return {
        id: item.id,
        name: item.name,
        basePrice: parseFloat(item.basePrice),
        image: item.imageUrl ?? FALLBACK_IMAGE,
        category: item.category.id,
        hasSizes,
        hasToppings,
        hasSugar,
        modifierGroups,
    };
};

/** Find a modifier group by matching its name against common patterns */
export const findModifierGroup = (
    groups: ModifierGroup[] | undefined,
    pattern: RegExp,
): ModifierGroup | undefined => groups?.find((g) => pattern.test(g.name));

/** Get the icon name for a category based on its name */
export const getCategoryIconName = (categoryName: string): string => {
    const name = categoryName.toLowerCase();
    if (/coffee|espresso|latte|cappuccino|mocha|americano/.test(name))
        return "Coffee";
    if (/tea|matcha/.test(name)) return "Leaf";
    if (/milk/.test(name)) return "Milk";
    if (/cold|ice|frap/.test(name)) return "GlassWater";
    if (
        /pastry|food|muffin|cookie|croissant|sandwich|wrap|bread|roll/.test(
            name,
        )
    )
        return "Croissant";
    return "Coffee";
};
