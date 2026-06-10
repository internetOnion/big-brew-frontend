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
}

export interface CartItem {
    id: string;
    menuId: string;
    name: string;
    category: string;
    size?: string;
    toppings: { name: string; qty: number; price: number }[];
    sugarLevel?: string;
    note?: string;
    quantity: number;
    unitPrice: number;
    price: number;
}

interface OrderLineItem {
    name: string;
    size?: string;
    sugarLevel?: string;
    toppings?: string[];
    price: number;
}

export interface QueueItem {
    queueNumber: number;
    lineItems: OrderLineItem[];
    type: "dine-in" | "takeout";
    time: string;
}

export const MENU_ITEMS: MenuItem[] = [
    {
        id: "espresso",
        name: "Espresso",
        category: "espresso",
        basePrice: 3.5,
        hasSizes: true,
        hasToppings: false,
        hasSugar: true,
        image: "https://placehold.co/400x300/3a2518/3a2518",
    },
    {
        id: "americano",
        name: "Americano",
        category: "espresso",
        basePrice: 4.0,
        hasSizes: true,
        hasToppings: true,
        hasSugar: true,
        image: "https://placehold.co/400x300/3a2518/3a2518",
    },
    {
        id: "cappuccino",
        name: "Cappuccino",
        category: "espresso",
        basePrice: 5.0,
        hasSizes: true,
        hasToppings: true,
        hasSugar: true,
        image: "https://placehold.co/400x300/3a2518/3a2518",
    },
    {
        id: "macchiato",
        name: "Macchiato",
        category: "espresso",
        basePrice: 4.5,
        hasSizes: true,
        hasToppings: true,
        hasSugar: true,
        image: "https://placehold.co/400x300/3a2518/3a2518",
    },
    {
        id: "latte",
        name: "Latte",
        category: "milk",
        basePrice: 5.5,
        hasSizes: true,
        hasToppings: true,
        hasSugar: true,
        image: "https://placehold.co/400x300/3a2518/3a2518",
    },
    {
        id: "flat-white",
        name: "Flat White",
        category: "milk",
        basePrice: 5.0,
        hasSizes: true,
        hasToppings: true,
        hasSugar: true,
        image: "https://placehold.co/400x300/3a2518/3a2518",
    },
    {
        id: "oat-latte",
        name: "Oat Latte",
        category: "milk",
        basePrice: 6.0,
        hasSizes: true,
        hasToppings: true,
        hasSugar: true,
        image: "https://placehold.co/400x300/3a2518/3a2518",
    },
    {
        id: "cortado",
        name: "Cortado",
        category: "milk",
        basePrice: 4.5,
        hasSizes: true,
        hasToppings: true,
        hasSugar: true,
        image: "https://placehold.co/400x300/3a2518/3a2518",
    },
    {
        id: "matcha-latte",
        name: "Matcha Latte",
        category: "tea",
        basePrice: 5.5,
        hasSizes: true,
        hasToppings: true,
        hasSugar: true,
        image: "https://placehold.co/400x300/3a2518/3a2518",
    },
    {
        id: "chai-latte",
        name: "Chai Latte",
        category: "tea",
        basePrice: 5.0,
        hasSizes: true,
        hasToppings: true,
        hasSugar: true,
        image: "https://placehold.co/400x300/3a2518/3a2518",
    },
    {
        id: "earl-grey",
        name: "Earl Grey",
        category: "tea",
        basePrice: 4.0,
        hasSizes: true,
        hasToppings: false,
        hasSugar: true,
        image: "https://placehold.co/400x300/3a2518/3a2518",
    },
    {
        id: "cold-brew",
        name: "Cold Brew",
        category: "cold",
        basePrice: 5.5,
        hasSizes: true,
        hasToppings: true,
        hasSugar: true,
        image: "https://placehold.co/400x300/3a2518/3a2518",
    },
    {
        id: "iced-latte",
        name: "Iced Latte",
        category: "cold",
        basePrice: 6.0,
        hasSizes: true,
        hasToppings: true,
        hasSugar: true,
        image: "https://placehold.co/400x300/3a2518/3a2518",
    },
    {
        id: "frappuccino",
        name: "Frappuccino",
        category: "cold",
        basePrice: 6.5,
        hasSizes: true,
        hasToppings: true,
        hasSugar: true,
        image: "https://placehold.co/400x300/3a2518/3a2518",
    },
    {
        id: "croissant",
        name: "Croissant",
        category: "food",
        basePrice: 3.5,
        hasSizes: false,
        hasToppings: false,
        hasSugar: false,
        image: "https://placehold.co/400x300/3a2518/3a2518",
    },
    {
        id: "banana-bread",
        name: "Banana Bread",
        category: "food",
        basePrice: 4.0,
        hasSizes: false,
        hasToppings: false,
        hasSugar: false,
        image: "https://placehold.co/400x300/3a2518/3a2518",
    },
    {
        id: "avocado-toast",
        name: "Avocado Toast",
        category: "food",
        basePrice: 8.5,
        hasSizes: false,
        hasToppings: false,
        hasSugar: false,
        image: "https://placehold.co/400x300/3a2518/3a2518",
    },
    {
        id: "granola-bowl",
        name: "Granola Bowl",
        category: "food",
        basePrice: 7.0,
        hasSizes: false,
        hasToppings: false,
        hasSugar: false,
        image: "https://placehold.co/400x300/3a2518/3a2518",
    },
];

export const TOPPINGS: Topping[] = [
    { name: "Whipped Cream", price: 0.5 },
    { name: "Caramel Drizzle", price: 0.75 },
    { name: "Chocolate Powder", price: 0.5 },
    { name: "Cinnamon", price: 0.25 },
    { name: "Vanilla Syrup", price: 0.75 },
    { name: "Hazelnut Syrup", price: 0.75 },
];

export const SIZES = ["S", "M", "L"] as const;
export const SUGAR_LEVELS = ["0%", "25%", "50%", "75%", "100%"] as const;

export const SIZE_PRICES: Record<string, number> = {
    S: 0,
    M: 0.5,
    L: 1.0,
};

export const INITIAL_QUEUE: QueueItem[] = [
    {
        queueNumber: 42,
        lineItems: [
            { name: "Latte", size: "M", price: 6.0 },
            { name: "Croissant", price: 3.5 },
        ],
        type: "dine-in",
        time: "2m",
    },
    {
        queueNumber: 43,
        lineItems: [
            { name: "Matcha Latte", size: "L", sugarLevel: "25%", price: 6.5 },
            { name: "Oat Latte", size: "M", sugarLevel: "75%", price: 6.5 },
        ],
        type: "takeout",
        time: "4m",
    },
    {
        queueNumber: 44,
        lineItems: [
            { name: "Americano", size: "L", sugarLevel: "0%", price: 5.0 },
        ],
        type: "dine-in",
        time: "6m",
    },
    {
        queueNumber: 45,
        lineItems: [
            { name: "Cold Brew", size: "M", sugarLevel: "50%", price: 6.0 },
            { name: "Banana Bread", price: 4.0 },
            { name: "Granola Bowl", price: 7.0 },
        ],
        type: "takeout",
        time: "8m",
    },
    {
        queueNumber: 46,
        lineItems: [
            { name: "Cappuccino", size: "S", sugarLevel: "25%", price: 5.25 },
        ],
        type: "dine-in",
        time: "10m",
    },
];

export const CATEGORY_ICONS: Record<string, string> = {
    espresso: "Coffee",
    milk: "Milk",
    tea: "Leaf",
    cold: "GlassWater",
    food: "Croissant",
};

export const generateCartId = () => crypto.randomUUID();
