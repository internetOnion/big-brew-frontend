import {
    createContext,
    useState,
    useCallback,
    useMemo,
    useEffect,
    type ReactNode,
} from "react";
import type { MenuItem } from "@/types/menu";
import type { CartItem } from "@/types/cart";
import { generateCartId } from "@/lib/utils";
import type { CustomizeOptions } from "@/components/pos/CustomizeModal";
import api from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import type { Order, CreateOrderPayload } from "@/types/order";

const CART_STORAGE_KEY = "pos-cart";
const ORDER_TYPE_STORAGE_KEY = "pos-order-type";

const loadCart = (): CartItem[] => {
    try {
        const raw = localStorage.getItem(CART_STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

const loadOrderType = (): "dine-in" | "takeout" => {
    const raw = localStorage.getItem(ORDER_TYPE_STORAGE_KEY);
    return raw === "takeout" ? "takeout" : "dine-in";
};

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
        // Tax is included in prices, so total = subtotal
        // Discount will be applied by the backend
        return subtotal;
    }, [subtotal]);

    useEffect(() => {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    }, [cartItems]);

    useEffect(() => {
        localStorage.setItem(ORDER_TYPE_STORAGE_KEY, orderType);
    }, [orderType]);

    const addItem = useCallback(
        (item: MenuItem, options: CustomizeOptions) => {
            if (editingItemId) {
                setCartItems((prev) =>
                    prev.map((ci) =>
                        ci.id === editingItemId
                            ? {
                                  ...ci,
                                  size: options.size || undefined,
                                  toppings: options.toppings,
                                  sugarLevel: options.sugarLevel || undefined,
                                  note: options.note || undefined,
                                  quantity: options.quantity,
                                  unitPrice:
                                      options.finalPrice / options.quantity,
                                  price: options.finalPrice,
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
                toppings: options.toppings,
                sugarLevel: options.sugarLevel || undefined,
                note: options.note || undefined,
                quantity: options.quantity,
                unitPrice: options.finalPrice / options.quantity,
                price: options.finalPrice,
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
            // Reconstruct a minimal MenuItem for the modal.
            // The modal will use the modifierGroups from the original item data
            // if available, or display what it can from the cart item.
            const menuItem: MenuItem = {
                id: item.menuId,
                name: item.name,
                category: item.category,
                basePrice: item.unitPrice,
                hasSizes: !!item.size,
                hasToppings: item.toppings.length > 0,
                hasSugar: !!item.sugarLevel,
                image: "",
            };

            setEditingItemId(id);
            setCustomizeInitial({
                size: item.size || "M",
                toppings: item.toppings,
                sugarLevel: item.sugarLevel || "50%",
                quantity: item.quantity,
                finalPrice: item.price,
                note: item.note || "",
                modifiers: {},
            });
            setCustomizeItem(menuItem);
        },
        [cartItems],
    );

    const resetCart = useCallback(() => {
        setCartItems([]);
        localStorage.removeItem(CART_STORAGE_KEY);
    }, []);

    const openCustomize = useCallback((item: MenuItem) => {
        setCustomizeItem(item);
    }, []);

    const closeCustomize = useCallback(() => {
        setCustomizeItem(null);
        setCustomizeInitial(undefined);
        setEditingItemId(null);
    }, []);

    const submitOrder = useCallback(
        async (
            paymentMethod: "cash" | "qr",
            amountReceived?: number,
        ): Promise<Order> => {
            // Build the order payload with payment
            const payload: CreateOrderPayload = {
                dining_option:
                    orderType === "dine-in" ? "dine_in" : "take_away",
                discount_id: discountId || undefined,
                items: cartItems.map((item) => ({
                    menu_item_id: item.menuId,
                    quantity: item.quantity,
                    unit_price: item.unitPrice,
                    modifier_option_ids: item.toppings.map(
                        (t) => t.modifierOptionId,
                    ),
                })),
                payment_method: paymentMethod,
                amount_received:
                    paymentMethod === "cash" ? amountReceived : undefined,
            };

            // Create order and process payment in one call
            const { data: order } = await api.post<Order>(
                ENDPOINTS.ORDERS.BASE,
                payload,
            );

            // Clear cart after successful order
            resetCart();
            setDiscountId(null);

            return order;
        },
        [cartItems, orderType, discountId, resetCart],
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
