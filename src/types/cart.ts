export interface CartModifierOption {
    id: string;
    name: string;
    price: number;
    isAvailable: boolean;
    sortOrder: number | null;
}

export interface CartModifierGroup {
    id: string;
    name: string;
    selectionType: "single" | "multiple";
    isRequired: boolean;
    sortOrder: number | null;
    options: CartModifierOption[];
}

export interface CartItem {
    id: string;
    menuId: string;
    name: string;
    category: string;
    size?: string;
    sizeOptionId?: string;
    toppings: {
        name: string;
        qty: number;
        price: number;
        modifierOptionId: string;
    }[];
    sugarLevel?: string;
    sugarOptionId?: string;
    note?: string;
    quantity: number;
    unitPrice: number;
    price: number;
    modifierGroups: CartModifierGroup[];
    selectedModifiers: Record<string, string[]>;
}

export interface CustomizeOptions {
    size: string;
    sizeOptionId: string;
    toppings: {
        name: string;
        qty: number;
        price: number;
        modifierOptionId: string;
    }[];
    sugarLevel: string;
    sugarOptionId: string;
    quantity: number;
    finalPrice: number;
    note: string;
    modifiers: Record<string, string[]>;
}
