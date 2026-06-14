import type { CartItem } from "@/types/cart";
import type { OrderType } from "@/types/order";

const CART_STORAGE_KEY = "pos-cart";
const ORDER_TYPE_STORAGE_KEY = "pos-order-type";

export const loadCart = (): CartItem[] => {
    try {
        const raw = localStorage.getItem(CART_STORAGE_KEY);
        if (!raw) return [];
        const items: CartItem[] = JSON.parse(raw);

        return items.map((item) => ({
            ...item,
            modifierGroups: item.modifierGroups ?? [],
            selectedModifiers: item.selectedModifiers ?? {},
            sizeOptionId: item.sizeOptionId ?? undefined,
            sugarOptionId: item.sugarOptionId ?? undefined,
        }));
    } catch {
        return [];
    }
};

export const saveCart = (cartItems: CartItem[]): void => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
};

export const loadOrderType = (): OrderType => {
    const raw = localStorage.getItem(ORDER_TYPE_STORAGE_KEY);
    return raw === "takeout" ? "takeout" : "dine-in";
};

export const saveOrderType = (orderType: OrderType): void => {
    localStorage.setItem(ORDER_TYPE_STORAGE_KEY, orderType);
};

export const clearCart = (): void => {
    localStorage.removeItem(CART_STORAGE_KEY);
};
