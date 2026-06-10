import { useState, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Coffee, Shield } from "lucide-react";
import {
    type MenuItem,
    type CartItem,
    SIZE_PRICES,
    getNextCartId,
    resetCartIdCounter,
} from "./data";
import { CategoryProvider } from "./CategoryContext";
import MenuGrid from "./MenuGrid";
import CustomizeModal from "./CustomizeModal";
import Cart from "./Cart";
import PaymentScreen from "./PaymentScreen";
import OrderQueue from "./OrderQueue";

const POSInner = () => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [orderType, setOrderType] = useState<"dine-in" | "takeout">(
        "dine-in",
    );
    const [screen, setScreen] = useState<"menu" | "payment">("menu");
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const [customizeItem, setCustomizeItem] = useState<MenuItem | null>(null);
    const [customizeInitial, setCustomizeInitial] = useState<
        Parameters<typeof CustomizeModal>[0]["initialOptions"] | undefined
    >(undefined);

    const total = useMemo(() => {
        const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);
        return subtotal * 1.07;
    }, [cartItems]);

    const handleAddItem = useCallback(
        (
            item: MenuItem,
            options: {
                size: string;
                toppings: { name: string; qty: number; price: number }[];
                sugarLevel: string;
                quantity: number;
                finalPrice: number;
                note: string;
            },
        ) => {
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
                id: getNextCartId(),
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

    const handleRemove = useCallback((id: string) => {
        setCartItems((prev) => prev.filter((ci) => ci.id !== id));
    }, []);

    const handleQuantityChange = useCallback((id: string, delta: number) => {
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

    const handleEdit = useCallback(
        (id: string) => {
            const item = cartItems.find((ci) => ci.id === id);
            if (!item) return;
            const menuItem = {
                id: item.menuId,
                name: item.name,
                category: item.category as MenuItem["category"],
                basePrice: item.unitPrice,
                hasSizes: !!item.size,
                hasToppings: item.toppings.length > 0,
                hasSugar: !!item.sugarLevel,
                image: "",
            };
            // Recalculate base price without size adjustment
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

    const handleReset = useCallback(() => {
        setCartItems([]);
        setScreen("menu");
        resetCartIdCounter();
    }, []);

    const handleConfirm = useCallback(() => {
        setScreen("payment");
    }, []);

    const handlePaymentComplete = useCallback(() => {
        setCartItems([]);
        setScreen("menu");
        resetCartIdCounter();
    }, []);

    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });

    return (
        <div
            className="flex h-screen w-screen flex-col overflow-hidden"
            style={{ background: "#F4EFE8" }}
        >
            {/* Header */}
            <div
                className="flex h-14 shrink-0 items-center justify-between px-4"
                style={{
                    background: "#FFFFFF",
                    borderBottom: "1px solid #E2D8CC",
                }}
            >
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <div
                            className="flex h-8 w-8 items-center justify-center rounded-lg"
                            style={{ background: "#4A2512" }}
                        >
                            <Coffee className="h-4 w-4 text-white" />
                        </div>
                        <span
                            className="text-base font-bold"
                            style={{
                                fontFamily: "'Bricolage Grotesque', sans-serif",
                                color: "#1A0F0A",
                            }}
                        >
                            BrewPoint
                        </span>
                    </div>
                    <span
                        className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
                        style={{ background: "#C07830" }}
                    >
                        POS
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        
                        <span
                            className="text-xs tabular-nums"
                            style={{
                                fontFamily: "'DM Mono', monospace",
                                color: "#1A0F0A",
                            }}
                        >
                            {timeStr}
                        </span>
                    </div>
                    <button
                        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-black/5"
                        style={{
                            border: "1px solid #E2D8CC",
                            color: "#1A0F0A",
                        }}
                    >
                        <Shield
                            className="h-3.5 w-3.5"
                            style={{ color: "#8B7A67" }}
                        />
                        Admin
                    </button>
                </div>
            </div>

            {/* Body */}
            <div className="flex flex-1 overflow-hidden">
                <OrderQueue />

                <div className="flex flex-1 overflow-hidden">
                    <AnimatePresence mode="wait">
                        {screen === "menu" ? (
                            <motion.div
                                key="menu"
                                className="flex flex-1 overflow-hidden"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                            >
                                <div className="flex flex-1 flex-col overflow-hidden">
                                    <MenuGrid
                                        onAddItem={(item) =>
                                            setCustomizeItem(item)
                                        }
                                    />
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="payment"
                                className="flex flex-1 overflow-hidden"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                            >
                                <PaymentScreen
                                    total={total}
                                    items={cartItems}
                                    onBack={() => setScreen("menu")}
                                    onComplete={handlePaymentComplete}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {screen === "menu" && (
                    <Cart
                        items={cartItems}
                        orderType={orderType}
                        onOrderTypeChange={setOrderType}
                        onRemove={handleRemove}
                        onQuantityChange={handleQuantityChange}
                        onEdit={handleEdit}
                        onConfirm={handleConfirm}
                        onReset={handleReset}
                    />
                )}
            </div>

            {/* Customize Modal */}
            <AnimatePresence>
                {customizeItem && (
                    <CustomizeModal
                        item={customizeItem}
                        initialOptions={customizeInitial}
                        onClose={() => {
                            setCustomizeItem(null);
                            setCustomizeInitial(undefined);
                            setEditingItemId(null);
                        }}
                        onAdd={handleAddItem}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export const POSScreen = () => {
    return (
        <CategoryProvider>
            <POSInner />
        </CategoryProvider>
    );
};

export default POSScreen;
