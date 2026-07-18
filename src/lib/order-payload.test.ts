import { describe, it, expect } from "vitest";
import { buildOrderPayload } from "@/lib/order-payload";
import type { CartItem } from "@/types/cart";

const makeCartItem = (overrides: Partial<CartItem> = {}): CartItem => ({
    id: "cart-1",
    menuId: "menu-1",
    name: "Green Tea",
    category: "Drinks",
    toppings: [],
    quantity: 2,
    unitPrice: 5,
    price: 10,
    modifierGroups: [],
    selectedModifiers: {},
    ...overrides,
});

describe("buildOrderPayload", () => {
    it("maps dine-in to dine_in", () => {
        const payload = buildOrderPayload(
            [makeCartItem()],
            "dine-in",
            null,
            "cash",
            "123456",
            10,
        );
        expect(payload.dining_option).toBe("dine_in");
    });

    it("maps takeout to take_away", () => {
        const payload = buildOrderPayload(
            [makeCartItem()],
            "takeout",
            null,
            "cash",
            "123456",
        );
        expect(payload.dining_option).toBe("take_away");
    });

    it("includes amount_received only for cash", () => {
        const cash = buildOrderPayload(
            [],
            "dine-in",
            null,
            "cash",
            "123456",
            20,
        );
        expect(cash.amount_received).toBe(20);

        const qr = buildOrderPayload([], "dine-in", null, "qr", "123456", 20);
        expect(qr.amount_received).toBeUndefined();
    });

    it("deduplicates modifier_option_ids", () => {
        const item = makeCartItem({
            sizeOptionId: "size-1",
            sugarOptionId: "sugar-1",
            toppings: [
                { name: "Boba", qty: 1, price: 0.5, modifierOptionId: "top-1" },
            ],
            selectedModifiers: { group: ["top-1", "top-2"] },
        });

        const payload = buildOrderPayload(
            [item],
            "dine-in",
            null,
            "cash",
            "123456",
        );
        const ids = payload.items[0].modifier_option_ids;
        expect(ids).toEqual(["size-1", "sugar-1", "top-1", "top-2"]);
    });

    it("passes discount_id when set", () => {
        const payload = buildOrderPayload(
            [],
            "dine-in",
            "disc-42",
            "cash",
            "123456",
        );
        expect(payload.discount_id).toBe("disc-42");
    });
});
