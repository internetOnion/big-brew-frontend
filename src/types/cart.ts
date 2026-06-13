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
