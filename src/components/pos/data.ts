export interface MenuItem {
    id: string;
    name: string;
    category: "espresso" | "milk" | "tea" | "cold" | "food";
    basePrice: number;
    hasSizes: boolean;
    hasToppings: boolean;
    hasSugar: boolean;
    image: string;
}

interface Topping {
    name: string;
    price: number;
    modifierOptionId: string;
}

export interface CartItem {
    id: string;
    menuId: string;
    name: string;
    category: string;
    size?: string;
    toppings: {
        name: string;
        qty: number;
        price: number;
        modifierOptionId: string;
    }[];
    sugarLevel?: string;
    note?: string;
    quantity: number;
    unitPrice: number;
    price: number;
}

export const TOPPINGS: Topping[] = [
    {
        name: "Whipped Cream",
        price: 0.5,
        modifierOptionId: "00000000-0000-0000-0000-000000000001",
    },
    {
        name: "Caramel Drizzle",
        price: 0.75,
        modifierOptionId: "00000000-0000-0000-0000-000000000002",
    },
    {
        name: "Chocolate Powder",
        price: 0.5,
        modifierOptionId: "00000000-0000-0000-0000-000000000003",
    },
    {
        name: "Cinnamon",
        price: 0.25,
        modifierOptionId: "00000000-0000-0000-0000-000000000004",
    },
    {
        name: "Vanilla Syrup",
        price: 0.75,
        modifierOptionId: "00000000-0000-0000-0000-000000000005",
    },
    {
        name: "Hazelnut Syrup",
        price: 0.75,
        modifierOptionId: "00000000-0000-0000-0000-000000000006",
    },
];

export const SIZES = ["S", "M", "L"] as const;
export const SUGAR_LEVELS = ["0%", "25%", "50%", "75%", "100%"] as const;

export const SIZE_PRICES: Record<string, number> = {
    S: 0,
    M: 0.5,
    L: 1.0,
};

export const CATEGORY_ICONS: Record<string, string> = {
    espresso: "Coffee",
    milk: "Milk",
    tea: "Leaf",
    cold: "GlassWater",
    food: "Croissant",
};

export const generateCartId = () => crypto.randomUUID();
