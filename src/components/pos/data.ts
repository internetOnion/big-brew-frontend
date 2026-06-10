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
        image: "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400&h=300&fit=crop&auto=format",
    },
    {
        id: "americano",
        name: "Americano",
        category: "espresso",
        basePrice: 4.0,
        hasSizes: true,
        hasToppings: true,
        hasSugar: true,
        image: "https://images.unsplash.com/photo-1551030173-122aabc4489c?w=400&h=300&fit=crop&auto=format",
    },
    {
        id: "cappuccino",
        name: "Cappuccino",
        category: "espresso",
        basePrice: 5.0,
        hasSizes: true,
        hasToppings: true,
        hasSugar: true,
        image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop&auto=format",
    },
    {
        id: "macchiato",
        name: "Macchiato",
        category: "espresso",
        basePrice: 4.5,
        hasSizes: true,
        hasToppings: true,
        hasSugar: true,
        image: "https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=400&h=300&fit=crop&auto=format",
    },
    {
        id: "latte",
        name: "Latte",
        category: "milk",
        basePrice: 5.5,
        hasSizes: true,
        hasToppings: true,
        hasSugar: true,
        image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop&auto=format",
    },
    {
        id: "flat-white",
        name: "Flat White",
        category: "milk",
        basePrice: 5.0,
        hasSizes: true,
        hasToppings: true,
        hasSugar: true,
        image: "https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=400&h=300&fit=crop&auto=format",
    },
    {
        id: "oat-latte",
        name: "Oat Latte",
        category: "milk",
        basePrice: 6.0,
        hasSizes: true,
        hasToppings: true,
        hasSugar: true,
        image: "https://images.unsplash.com/photo-1632054010678-7f2e5a1a7355?w=400&h=300&fit=crop&auto=format",
    },
    {
        id: "cortado",
        name: "Cortado",
        category: "milk",
        basePrice: 4.5,
        hasSizes: true,
        hasToppings: true,
        hasSugar: true,
        image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&h=300&fit=crop&auto=format",
    },
    {
        id: "matcha-latte",
        name: "Matcha Latte",
        category: "tea",
        basePrice: 5.5,
        hasSizes: true,
        hasToppings: true,
        hasSugar: true,
        image: "https://images.unsplash.com/photo-1515825838458-f2a94b20105a?w=400&h=300&fit=crop&auto=format",
    },
    {
        id: "chai-latte",
        name: "Chai Latte",
        category: "tea",
        basePrice: 5.0,
        hasSizes: true,
        hasToppings: true,
        hasSugar: true,
        image: "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=400&h=300&fit=crop&auto=format",
    },
    {
        id: "earl-grey",
        name: "Earl Grey",
        category: "tea",
        basePrice: 4.0,
        hasSizes: true,
        hasToppings: false,
        hasSugar: true,
        image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=300&fit=crop&auto=format",
    },
    {
        id: "cold-brew",
        name: "Cold Brew",
        category: "cold",
        basePrice: 5.5,
        hasSizes: true,
        hasToppings: true,
        hasSugar: true,
        image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop&auto=format",
    },
    {
        id: "iced-latte",
        name: "Iced Latte",
        category: "cold",
        basePrice: 6.0,
        hasSizes: true,
        hasToppings: true,
        hasSugar: true,
        image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400&h=300&fit=crop&auto=format",
    },
    {
        id: "frappuccino",
        name: "Frappuccino",
        category: "cold",
        basePrice: 6.5,
        hasSizes: true,
        hasToppings: true,
        hasSugar: true,
        image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=300&fit=crop&auto=format",
    },
    {
        id: "croissant",
        name: "Croissant",
        category: "food",
        basePrice: 3.5,
        hasSizes: false,
        hasToppings: false,
        hasSugar: false,
        image: "https://images.unsplash.com/photo-1623334044303-241021148842?w=400&h=300&fit=crop&auto=format",
    },
    {
        id: "banana-bread",
        name: "Banana Bread",
        category: "food",
        basePrice: 4.0,
        hasSizes: false,
        hasToppings: false,
        hasSugar: false,
        image: "https://images.unsplash.com/photo-1601314002592-b8734bca6604?w=400&h=300&fit=crop&auto=format",
    },
    {
        id: "avocado-toast",
        name: "Avocado Toast",
        category: "food",
        basePrice: 8.5,
        hasSizes: false,
        hasToppings: false,
        hasSugar: false,
        image: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400&h=300&fit=crop&auto=format",
    },
    {
        id: "granola-bowl",
        name: "Granola Bowl",
        category: "food",
        basePrice: 7.0,
        hasSizes: false,
        hasToppings: false,
        hasSugar: false,
        image: "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=400&h=300&fit=crop&auto=format",
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
