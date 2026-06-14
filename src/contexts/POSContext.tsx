import {
    createContext,
    useState,
    useCallback,
    useMemo,
    useEffect,
    type ReactNode,
} from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { MenuItem } from "@/types/menu";
import type { CartItem } from "@/types/cart";
import { generateCartId } from "@/lib/utils";
import type { CustomizeOptions } from "@/types/cart";
import api from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import { orderKeys } from "@/lib/query-keys";
import type { Order, CreateOrderPayload } from "@/types/order";
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
    orderType: "dine-in" | "takeout";
    editingItemId: string | null;
    customizeItem: MenuItem | null;
    customizeInitial: CustomizeOptions | undefined;
    discountId: string | null;
    subtotal: number;
    total: number;
    setOrderType: (t: "dine-in" | "takeout") => void;
    setDiscountId: (id: string | null) => void;
    addItem: (item: MenuItem, options: CustomizeOptions) => void;
    removeItem: (id: string) => void;
    changeQuantity: (id: string, delta: number) => void;
    startEdit: (id: string) => void;
    resetCart: () => void;
    openCustomize: (item: MenuItem) => void;
    closeCustomize: () => void;
    submitOrder: (
        paymentMethod: "cash" | "qr",
        amountReceived?: number,
    ) => Promise<Order>;
}

const POSContext = createContext<POSContextValue | null>(null);

const POSProvider = ({ children }: { children: ReactNode }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>(loadCart);
    const [orderType, setOrderType] = useState<"dine-in" | "takeout">(
        loadOrderType,
    );
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const [customizeItem, setCustomizeItem] = useState<MenuItem | null>(null);
    const [customizeInitial, setCustomizeInitial] = useState<
        CustomizeOptions | undefined
    >(undefined);
    const [discountId, setDiscountId] = useState<string | null>(null);

    const subtotal = useMemo(() => {
        return cartItems.reduce((sum, item) => sum + item.price, 0);
    }, [cartItems]);

    const total = useMemo(() => {
        return subtotal;
    }, [subtotal]);

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
        ): Promise<Order> => {
            const payload = buildOrderPayload(
                cartItems,
                orderType,
                discountId,
                paymentMethod,
                amountReceived,
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
