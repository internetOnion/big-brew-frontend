import { describe, it, expect, beforeEach } from "vitest";
import {
    loadCart,
    saveCart,
    loadOrderType,
    saveOrderType,
    clearCart,
} from "@/lib/cart-storage";
import type { CartItem } from "@/types/cart";

const makeCartItem = (id: string): CartItem => ({
    id,
    menuId: `menu-${id}`,
    name: `Item ${id}`,
    category: "Drinks",
    toppings: [],
    quantity: 1,
    unitPrice: 5,
    price: 5,
    modifierGroups: [],
    selectedModifiers: {},
});

describe("cart-storage", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it("round-trips cart items through localStorage", () => {
        const items = [makeCartItem("1"), makeCartItem("2")];
        saveCart(items);
        expect(loadCart()).toEqual(items);
    });

    it("returns empty array when no cart stored", () => {
        expect(loadCart()).toEqual([]);
    });

    it("round-trips order type", () => {
        saveOrderType("takeout");
        expect(loadOrderType()).toBe("takeout");

        saveOrderType("dine-in");
        expect(loadOrderType()).toBe("dine-in");
    });

    it("defaults to dine-in for unknown order type", () => {
        localStorage.setItem("pos-order-type", "bogus");
        expect(loadOrderType()).toBe("dine-in");
    });

    it("clearCart removes stored cart", () => {
        saveCart([makeCartItem("1")]);
        clearCart();
        expect(loadCart()).toEqual([]);
    });

    it("handles corrupt JSON gracefully", () => {
        localStorage.setItem("pos-cart", "{{invalid");
        expect(loadCart()).toEqual([]);
    });
});
