import {
    createContext,
    useState,
    useCallback,
    useMemo,
    useEffect,
    type ReactNode,
} from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { MenuItem } from "@/types/menu";
import type { CartItem } from "@/types/cart";
import { generateCartId } from "@/lib/utils";
import type { CustomizeOptions } from "@/types/cart";
import api from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import { orderKeys, discountKeys } from "@/lib/query-keys";
import type {
    Order,
    CreateOrderPayload,
    OrderType,
    PaymentMethod,
    Discount,
} from "@/types/order";
import {
    loadCart,
    saveCart,
    loadOrderType,
    saveOrderType,
    clearCart,
} from "@/lib/cart-storage";
import {
    buildOrderPayload,
    buildCartItemModifierGroups,
} from "@/lib/order-payload";

interface POSContextValue {
    cartItems: CartItem[];
    orderType: OrderType;
    editingItemId: string | null;
    customizeItem: MenuItem | null;
    customizeInitial: CustomizeOptions | undefined;
    discountId: string | null;
    activeDiscounts: Discount[];
    discountAmount: number;
    discountQualified: boolean;
    discountHint: string | null;
    subtotal: number;
    total: number;
    setOrderType: (t: OrderType) => void;
    setDiscountId: (id: string | null) => void;
    addItem: (item: MenuItem, options: CustomizeOptions) => void;
    removeItem: (id: string) => void;
    changeQuantity: (id: string, delta: number) => void;
    startEdit: (id: string) => void;
    resetCart: () => void;
    openCustomize: (item: MenuItem) => void;
    closeCustomize: () => void;
    submitOrder: (
        paymentMethod: PaymentMethod,
        amountReceived?: number,
        confirmedBy?: string,
    ) => Promise<Order>;
}

const POSContext = createContext<POSContextValue | null>(null);

const POSProvider = ({ children }: { children: ReactNode }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>(loadCart);
    const [orderType, setOrderType] = useState<OrderType>(loadOrderType);
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const [customizeItem, setCustomizeItem] = useState<MenuItem | null>(null);
    const [customizeInitial, setCustomizeInitial] = useState<
        CustomizeOptions | undefined
    >(undefined);
    const [discountId, setDiscountId] = useState<string | null>(null);

    const { data: activeDiscounts = [] } = useQuery<Discount[]>({
        queryKey: discountKeys.active,
        queryFn: async () => {
            const { data } = await api.get<Discount[]>(
                ENDPOINTS.DISCOUNTS.ACTIVE,
                { silent: true },
            );
            return data;
        },
        staleTime: 10_000,
        refetchInterval: 15_000,
        refetchOnWindowFocus: true,
    });

    const subtotal = useMemo(() => {
        return cartItems.reduce((sum, item) => sum + item.price, 0);
    }, [cartItems]);

    const discountAmount = useMemo(() => {
        if (!discountId) return 0;
        const discount = activeDiscounts.find((d) => d.id === discountId);
        if (!discount) return 0;

        // Order-level percentage
        if (
            discount.type === "percentage" &&
            discount.appliesTo === "order" &&
            discount.value
        ) {
            const raw = subtotal * (parseFloat(discount.value) / 100);
            return discount.maxDiscountAmount
                ? Math.min(raw, parseFloat(discount.maxDiscountAmount))
                : raw;
        }
        // Item-level percentage
        if (
            discount.type === "percentage" &&
            discount.appliesTo === "item" &&
            discount.itemId &&
            discount.value
        ) {
            const itemTotal = cartItems
                .filter((ci) => ci.menuId === discount.itemId)
                .reduce((sum, ci) => sum + ci.price, 0);
            const raw = itemTotal * (parseFloat(discount.value) / 100);
            return discount.maxDiscountAmount
                ? Math.min(raw, parseFloat(discount.maxDiscountAmount))
                : raw;
        }
        // Order-level fixed
        if (
            discount.type === "fixed_amount" &&
            discount.appliesTo === "order" &&
            discount.value
        ) {
            return Math.min(parseFloat(discount.value), subtotal);
        }
        // Item-level fixed
        if (
            discount.type === "fixed_amount" &&
            discount.appliesTo === "item" &&
            discount.itemId &&
            discount.value
        ) {
            const itemTotal = cartItems
                .filter((ci) => ci.menuId === discount.itemId)
                .reduce((sum, ci) => sum + ci.price, 0);
            return Math.min(parseFloat(discount.value), itemTotal);
        }
        // BOGO
        if (discount.type === "bogo") {
            const buyCartItems = discount.buyItemId
                ? cartItems.filter((ci) => ci.menuId === discount.buyItemId)
                : cartItems;
            const buyQty = buyCartItems.reduce(
                (sum, ci) => sum + ci.quantity,
                0,
            );

            if (discount.buyItemId && discount.freeItemId) {
                // Both specific
                if (discount.buyItemId === discount.freeItemId) {
                    if (buyQty < 2) return 0;
                    return (
                        Math.floor(buyQty / 2) *
                        (buyCartItems[0]?.unitPrice ?? 0)
                    );
                }
                const freeCartItem = cartItems.find(
                    (ci) => ci.menuId === discount.freeItemId,
                );
                if (!freeCartItem) return 0;
                return freeCartItem.unitPrice;
            }

            if (discount.freeItemId) {
                // Buy any, get specific free
                if (buyQty < 2) return 0;
                const freeCartItem = cartItems.find(
                    (ci) => ci.menuId === discount.freeItemId,
                );
                return freeCartItem?.unitPrice ?? 0;
            }

            // Buy specific or any, get cheapest free
            if (buyQty === 0) return 0;
            const cheapest = [...cartItems].sort(
                (a, b) => a.unitPrice - b.unitPrice,
            )[0];
            if (!cheapest) return 0;
            return discount.buyItemId
                ? cheapest.unitPrice
                : buyQty >= 2
                  ? cheapest.unitPrice
                  : 0;
        }

        return 0;
    }, [discountId, activeDiscounts, subtotal, cartItems]);

    const discountQualified = useMemo(() => {
        if (!discountId) return true;
        const discount = activeDiscounts.find((d) => d.id === discountId);
        if (!discount) return true;
        if (discount.type !== "bogo") return true;

        const buyCartItems = discount.buyItemId
            ? cartItems.filter((ci) => ci.menuId === discount.buyItemId)
            : cartItems;
        const buyQty = buyCartItems.reduce((sum, ci) => sum + ci.quantity, 0);

        if (discount.buyItemId && discount.freeItemId) {
            if (discount.buyItemId === discount.freeItemId) {
                return buyQty >= 2;
            }
            return (
                buyQty > 0 &&
                cartItems.some((ci) => ci.menuId === discount.freeItemId)
            );
        }

        if (discount.freeItemId) {
            return (
                buyQty >= 2 &&
                cartItems.some((ci) => ci.menuId === discount.freeItemId)
            );
        }

        // Buy specific or any, get cheapest free
        return discount.buyItemId ? buyQty > 0 : buyQty >= 2;
    }, [discountId, activeDiscounts, cartItems]);

    const discountHint = useMemo(() => {
        if (!discountId) return null;
        const discount = activeDiscounts.find((d) => d.id === discountId);
        if (!discount || discount.type !== "bogo") return null;
        if (discountQualified) return null;

        const buyCartItems = discount.buyItemId
            ? cartItems.filter((ci) => ci.menuId === discount.buyItemId)
            : cartItems;
        const buyQty = buyCartItems.reduce((sum, ci) => sum + ci.quantity, 0);
        const buyItemName = buyCartItems[0]?.name ?? "the buy item";

        if (discount.buyItemId && discount.freeItemId) {
            if (discount.buyItemId === discount.freeItemId) {
                return `Add 1 more ${buyItemName} to qualify`;
            }
            const freeItemName =
                cartItems.find((ci) => ci.menuId === discount.freeItemId)
                    ?.name ?? "the free item";
            if (!cartItems.some((ci) => ci.menuId === discount.buyItemId)) {
                return `Add ${buyItemName} to qualify`;
            }
            return `Add ${freeItemName} to qualify`;
        }

        if (discount.freeItemId) {
            // Buy any, get specific free
            if (buyQty < 2)
                return `Add ${2 - buyQty} more item${buyQty === 0 ? "s" : ""} to qualify`;
            const freeItemName =
                cartItems.find((ci) => ci.menuId === discount.freeItemId)
                    ?.name ?? "the free item";
            if (!cartItems.some((ci) => ci.menuId === discount.freeItemId)) {
                return `Add ${freeItemName} to qualify`;
            }
            return null;
        }

        // Buy specific or any, get cheapest free
        if (discount.buyItemId) {
            return buyQty > 0 ? null : `Add ${buyItemName} to qualify`;
        }
        // Buy any, get any
        return buyQty >= 2
            ? null
            : `Add ${2 - buyQty} more item${buyQty === 0 ? "s" : ""} to qualify`;
    }, [discountId, activeDiscounts, cartItems, discountQualified]);

    const total = useMemo(() => {
        return subtotal - discountAmount;
    }, [subtotal, discountAmount]);

    useEffect(() => {
        saveCart(cartItems);
    }, [cartItems]);

    useEffect(() => {
        saveOrderType(orderType);
    }, [orderType]);

    const addItem = useCallback(
        (item: MenuItem, options: CustomizeOptions) => {
            const modifierGroups = buildCartItemModifierGroups(
                item.modifierGroups ?? [],
            );

            if (editingItemId) {
                setCartItems((prev) =>
                    prev.map((ci) =>
                        ci.id === editingItemId
                            ? {
                                  ...ci,
                                  size: options.size || undefined,
                                  sizeOptionId:
                                      options.sizeOptionId || undefined,
                                  toppings: options.toppings,
                                  sugarLevel: options.sugarLevel || undefined,
                                  sugarOptionId:
                                      options.sugarOptionId || undefined,
                                  note: options.note || undefined,
                                  quantity: options.quantity,
                                  unitPrice:
                                      options.finalPrice / options.quantity,
                                  price: options.finalPrice,
                                  modifierGroups,
                                  selectedModifiers: {
                                      ...options.modifiers,
                                  },
                              }
                            : ci,
                    ),
                );
                setEditingItemId(null);
                setCustomizeItem(null);
                return;
            }
            const cartItem: CartItem = {
                id: generateCartId(),
                menuId: item.id,
                name: item.name,
                category: item.category,
                size: options.size || undefined,
                sizeOptionId: options.sizeOptionId || undefined,
                toppings: options.toppings,
                sugarLevel: options.sugarLevel || undefined,
                sugarOptionId: options.sugarOptionId || undefined,
                note: options.note || undefined,
                quantity: options.quantity,
                unitPrice: options.finalPrice / options.quantity,
                price: options.finalPrice,
                modifierGroups,
                selectedModifiers: { ...options.modifiers },
            };
            setCartItems((prev) => [...prev, cartItem]);
            setCustomizeItem(null);
        },
        [editingItemId],
    );

    const removeItem = useCallback((id: string) => {
        setCartItems((prev) => prev.filter((ci) => ci.id !== id));
    }, []);

    const changeQuantity = useCallback((id: string, delta: number) => {
        setCartItems((prev) => {
            const item = prev.find((ci) => ci.id === id);
            if (!item) return prev;
            const newQty = item.quantity + delta;
            if (newQty <= 0) {
                return prev.filter((ci) => ci.id !== id);
            }
            return prev.map((ci) =>
                ci.id === id
                    ? {
                          ...ci,
                          quantity: newQty,
                          price: ci.unitPrice * newQty,
                      }
                    : ci,
            );
        });
    }, []);

    const startEdit = useCallback(
        (id: string) => {
            const item = cartItems.find((ci) => ci.id === id);
            if (!item) return;
            const menuItem: MenuItem = {
                id: item.menuId,
                name: item.name,
                category: item.category,
                basePrice: item.unitPrice,
                hasSizes: !!item.size,
                hasToppings: item.toppings.length > 0,
                hasSugar: !!item.sugarLevel,
                image: "",
                modifierGroups: item.modifierGroups,
            };

            setEditingItemId(id);
            setCustomizeInitial({
                size: item.size || "",
                sizeOptionId: item.sizeOptionId || "",
                toppings: item.toppings,
                sugarLevel: item.sugarLevel || "",
                sugarOptionId: item.sugarOptionId || "",
                quantity: item.quantity,
                finalPrice: item.price,
                note: item.note || "",
                modifiers: { ...item.selectedModifiers },
            });
            setCustomizeItem(menuItem);
        },
        [cartItems],
    );

    const resetCart = useCallback(() => {
        setCartItems([]);
        clearCart();
    }, []);

    const openCustomize = useCallback((item: MenuItem) => {
        setCustomizeItem(item);
    }, []);

    const closeCustomize = useCallback(() => {
        setCustomizeItem(null);
        setCustomizeInitial(undefined);
        setEditingItemId(null);
    }, []);

    const queryClient = useQueryClient();

    const submitOrderMutation = useMutation({
        mutationFn: async (payload: CreateOrderPayload) => {
            const { data: order } = await api.post<Order>(
                ENDPOINTS.ORDERS.BASE,
                payload,
            );
            return order;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: orderKeys.pending });
            resetCart();
            setDiscountId(null);
        },
    });

    const submitOrder = useCallback(
        async (
            paymentMethod: "cash" | "qr",
            amountReceived?: number,
            confirmedBy?: string,
        ): Promise<Order> => {
            const payload = buildOrderPayload(
                cartItems,
                orderType,
                discountId,
                paymentMethod,
                amountReceived,
                confirmedBy,
            );

            return submitOrderMutation.mutateAsync(payload);
        },
        [cartItems, orderType, discountId, submitOrderMutation],
    );

    return (
        <POSContext.Provider
            value={{
                cartItems,
                orderType,
                editingItemId,
                customizeItem,
                customizeInitial,
                discountId,
                activeDiscounts,
                discountAmount,
                discountQualified,
                discountHint,
                subtotal,
                total,
                setOrderType,
                setDiscountId,
                addItem,
                removeItem,
                changeQuantity,
                startEdit,
                resetCart,
                openCustomize,
                closeCustomize,
                submitOrder,
            }}
        >
            {children}
        </POSContext.Provider>
    );
};

export { POSContext, POSProvider };
