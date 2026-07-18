import type { CartItem } from "@/types/cart";
import type {
    CreateOrderPayload,
    OrderType,
    PaymentMethod,
} from "@/types/order";

export const buildOrderPayload = (
    cartItems: CartItem[],
    orderType: OrderType,
    discountId: string | null,
    paymentMethod: PaymentMethod,
    pin: string,
    amountReceived?: number,
): CreateOrderPayload => ({
    dining_option: orderType === "dine-in" ? "dine_in" : "take_away",
    discount_id: discountId || undefined,
    items: cartItems.map((item) => {
        const allIds = [
            item.sizeOptionId,
            item.sugarOptionId,
            ...item.toppings.map((t) => t.modifierOptionId),
            ...Object.values(item.selectedModifiers).flat(),
        ].filter((id): id is string => Boolean(id));
        const modifier_option_ids = [...new Set(allIds)];
        return {
            menu_item_id: item.menuId,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            modifier_option_ids,
        };
    }),
    payment_method: paymentMethod,
    amount_received: paymentMethod === "cash" ? amountReceived : undefined,
    pin,
});

export const buildCartItemModifierGroups = (
    modifierGroups: CartItem["modifierGroups"],
) =>
    modifierGroups.map((g) => ({
        id: g.id,
        name: g.name,
        selectionType: g.selectionType,
        isRequired: g.isRequired,
        sortOrder: g.sortOrder,
        options: g.options.map((o) => ({
            id: o.id,
            name: o.name,
            price: o.price,
            isAvailable: o.isAvailable,
            sortOrder: o.sortOrder,
        })),
    }));
