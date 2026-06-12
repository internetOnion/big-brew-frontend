import {
    createContext,
    useState,
    useCallback,
    useMemo,
    type ReactNode,
} from "react";
import type { MenuItem, CartItem } from "@/components/pos/data";
import { SIZE_PRICES, generateCartId } from "@/components/pos/data";
import type { CustomizeOptions } from "@/components/pos/CustomizeModal";

interface POSContextValue {
    cartItems: CartItem[];
    orderType: "dine-in" | "takeout";
    editingItemId: string | null;
    customizeItem: MenuItem | null;
    customizeInitial: CustomizeOptions | undefined;
    total: number;
    setOrderType: (t: "dine-in" | "takeout") => void;
    addItem: (item: MenuItem, options: CustomizeOptions) => void;
    removeItem: (id: string) => void;
    changeQuantity: (id: string, delta: number) => void;
    startEdit: (id: string) => void;
    resetCart: () => void;
    openCustomize: (item: MenuItem) => void;
    closeCustomize: () => void;
}

const POSContext = createContext<POSContextValue | null>(null);

const POSProvider = ({ children }: { children: ReactNode }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [orderType, setOrderType] = useState<"dine-in" | "takeout">(
        "dine-in",
    );
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const [customizeItem, setCustomizeItem] = useState<MenuItem | null>(null);
    const [customizeInitial, setCustomizeInitial] = useState<
        CustomizeOptions | undefined
    >(undefined);

    const total = useMemo(() => {
        const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);
        return subtotal * 1.07;
    }, [cartItems]);

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
            const menuItem: MenuItem = {
                id: item.menuId,
                name: item.name,
                category: item.category as MenuItem["category"],
                basePrice: item.unitPrice,
                hasSizes: !!item.size,
                hasToppings: item.toppings.length > 0,
                hasSugar: !!item.sugarLevel,
                image: "",
            };
            const sizePrice = item.size ? SIZE_PRICES[item.size] || 0 : 0;
            const toppingsPrice = item.toppings.reduce(
                (sum, t) => sum + t.price * t.qty,
                0,
            );
            menuItem.basePrice = item.unitPrice - sizePrice - toppingsPrice;

            setEditingItemId(id);
            setCustomizeInitial({
                size: item.size || "M",
                toppings: item.toppings,
                sugarLevel: item.sugarLevel || "50%",
                quantity: item.quantity,
                finalPrice: item.price,
                note: item.note || "",
            });
            setCustomizeItem(menuItem);
        },
        [cartItems],
    );

    const resetCart = useCallback(() => {
        setCartItems([]);
    }, []);

    const openCustomize = useCallback((item: MenuItem) => {
        setCustomizeItem(item);
    }, []);

    const closeCustomize = useCallback(() => {
        setCustomizeItem(null);
        setCustomizeInitial(undefined);
        setEditingItemId(null);
    }, []);

    return (
        <POSContext.Provider
            value={{
                cartItems,
                orderType,
                editingItemId,
                customizeItem,
                customizeInitial,
                total,
                setOrderType,
                addItem,
                removeItem,
                changeQuantity,
                startEdit,
                resetCart,
                openCustomize,
                closeCustomize,
            }}
        >
            {children}
        </POSContext.Provider>
    );
};

export { POSContext, POSProvider };
