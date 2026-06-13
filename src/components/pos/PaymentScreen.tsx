import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
    Delete,
    ArrowLeft,
    CheckCircle2,
    Coffee,
    Milk,
    Leaf,
    GlassWater,
    Croissant,
    QrCode,
    Banknote,
    type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { usePOS } from "@/hooks/usePos";
import type { CartItem } from "@/components/pos/data";
import api from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import type { Settings, Order } from "@/types/order";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
    espresso: Coffee,
    milk: Milk,
    tea: Leaf,
    cold: GlassWater,
    food: Croissant,
};

const KHR_RATE = 4100;

const KEYS = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    [".", "0", "\u232B"],
];

const PaymentScreen = () => {
    const { total, subtotal, cartItems, submitOrder } = usePOS();
    const navigate = useNavigate();
    const [entered, setEntered] = useState("");
    const [currency, setCurrency] = useState<"USD" | "KHR">("USD");
    const [paymentMethod, setPaymentMethod] = useState<"cash" | "qr">("cash");
    const [success, setSuccess] = useState(false);
    const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [settings, setSettings] = useState<Settings | null>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await api.get<Settings>(
                    ENDPOINTS.SETTINGS.BASE,
                );
                setSettings(data);
            } catch {
                // Settings fetch failed, QR code won't be available
            }
        };
        fetchSettings();
    }, []);

    const totalInCurrency = currency === "KHR" ? total * KHR_RATE : total;
    const enteredAmount = parseFloat(entered) || 0;
    const change = enteredAmount - totalInCurrency;
    const isFullyPaid = enteredAmount >= totalInCurrency && enteredAmount > 0;

    const handleKey = (k: string) => {
        if (currency === "KHR") {
            if (k === ".") return;
            setEntered((prev) => prev + k);
            return;
        }
        if (k === "." && entered.includes(".")) return;
        if (k === "." && entered === "") {
            setEntered("0.");
            return;
        }
        if (entered.split(".")[1]?.length >= 2) return;
        setEntered((prev) => prev + k);
    };

    const handleDelete = () => setEntered((prev) => prev.slice(0, -1));

    const handleConfirmPayment = async () => {
        if (isProcessing) return;

        setIsProcessing(true);
        try {
            const amountReceived =
                paymentMethod === "cash"
                    ? currency === "KHR"
                        ? enteredAmount / KHR_RATE
                        : enteredAmount
                    : undefined;

            const order = await submitOrder(paymentMethod, amountReceived);
            setCompletedOrder(order);
            setSuccess(true);
        } catch (error) {
            // Error is handled by the API interceptor
            setIsProcessing(false);
        }
    };

    const handleQrConfirm = async () => {
        if (isProcessing) return;

        setIsProcessing(true);
        try {
            const order = await submitOrder("qr");
            setCompletedOrder(order);
            setSuccess(true);
        } catch (error) {
            setIsProcessing(false);
        }
    };

    const currencySymbol = currency === "USD" ? "$" : "៛";

    const formatDisplay = (val: number) =>
        currency === "USD"
            ? `$${val.toFixed(2)}`
            : `៛${Math.round(val).toLocaleString()}`;

    const itemCount = cartItems.reduce((s: number, i) => s + i.quantity, 0);

    if (success && completedOrder) {
        const cashPayment = completedOrder.payments.find(
            (p) => p.method === "cash",
        );
        const changeAmount = cashPayment?.changeAmount;

        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-background">
                <div className="flex flex-col items-center gap-4 relative">
                    <motion.div
                        className="absolute w-20 h-20 rounded-full bg-amber-800/20 top-0"
                        animate={{ scale: [1, 1.7], opacity: [0.4, 0] }}
                        transition={{
                            duration: 1.2,
                            repeat: Infinity,
                            ease: "easeOut",
                        }}
                    />
                    <CheckCircle2
                        size={80}
                        strokeWidth={1.5}
                        className="text-accent relative z-10"
                    />
                    <p className="text-2xl text-foreground font-bold">
                        Payment Complete
                    </p>
                    <p className="font-mono text-sm text-muted-foreground">
                        Order #{completedOrder.orderNumber}
                    </p>
                    {paymentMethod === "cash" &&
                        changeAmount &&
                        parseFloat(changeAmount) > 0 && (
                            <p className="font-mono text-base text-primary">
                                Change: ${parseFloat(changeAmount).toFixed(2)}
                            </p>
                        )}
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-background">
            <div className="px-8 pt-6 pb-4 flex items-center gap-4 border-b border-border">
                <button
                    onClick={() => navigate(ROUTES.POS)}
                    className="hover:opacity-60 transition-opacity flex items-center gap-2 text-muted-foreground text-[13px]"
                >
                    <ArrowLeft size={16} /> Back to Menu
                </button>
                <div className="flex-1" />
                <p className="font-mono text-[11px] text-muted-foreground tracking-[0.1em] uppercase">
                    Payment
                </p>
                <span className="font-mono text-[11px] text-muted-foreground">
                    {itemCount} item{itemCount !== 1 ? "s" : ""} · $
                    {subtotal.toFixed(2)}
                </span>
            </div>

            <div className="flex-1 flex items-stretch">
                <div className="flex-1 flex flex-col px-8 py-6 gap-4 max-w-sm mx-auto">
                    {/* Payment Method Toggle */}
                    <div className="flex rounded-lg overflow-hidden bg-secondary p-0.5 gap-0.5">
                        <button
                            onClick={() => setPaymentMethod("cash")}
                            className={cn(
                                "flex-1 py-2.5 rounded-md transition-all font-mono text-xs font-semibold border-none cursor-pointer flex items-center justify-center gap-2",
                                paymentMethod === "cash"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-transparent text-muted-foreground",
                            )}
                        >
                            <Banknote size={14} />
                            Cash
                        </button>
                        <button
                            onClick={() => setPaymentMethod("qr")}
                            className={cn(
                                "flex-1 py-2.5 rounded-md transition-all font-mono text-xs font-semibold border-none cursor-pointer flex items-center justify-center gap-2",
                                paymentMethod === "qr"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-transparent text-muted-foreground",
                            )}
                        >
                            <QrCode size={14} />
                            QR Code
                        </button>
                    </div>

                    {paymentMethod === "qr" ? (
                        /* QR Code Display */
                        <div className="flex-1 flex flex-col items-center justify-center gap-4">
                            {settings?.qrCodeUrl ? (
                                <div className="bg-white p-4 rounded-xl">
                                    <img
                                        src={settings.qrCodeUrl}
                                        alt="QR Code"
                                        className="w-48 h-48 object-contain"
                                    />
                                </div>
                            ) : (
                                <div className="w-48 h-48 bg-secondary rounded-xl flex items-center justify-center">
                                    <QrCode
                                        size={64}
                                        className="text-muted-foreground"
                                    />
                                </div>
                            )}
                            <p className="text-sm text-muted-foreground text-center">
                                Scan to pay ${total.toFixed(2)}
                            </p>
                            <motion.button
                                onClick={handleQrConfirm}
                                disabled={isProcessing}
                                animate={
                                    !isProcessing
                                        ? { scale: [1, 1.01, 1] }
                                        : { scale: 1 }
                                }
                                transition={
                                    !isProcessing
                                        ? {
                                              duration: 1.6,
                                              repeat: Infinity,
                                              ease: "easeInOut",
                                          }
                                        : {}
                                }
                                className={cn(
                                    "w-full rounded-xl flex flex-col items-center gap-1 bg-primary text-primary-foreground border-none py-4 transition-none",
                                    isProcessing
                                        ? "cursor-not-allowed opacity-50"
                                        : "cursor-pointer opacity-100",
                                )}
                            >
                                <span className="font-bold text-[15px]">
                                    {isProcessing
                                        ? "Processing..."
                                        : "Confirm Payment Received"}
                                </span>
                            </motion.button>
                        </div>
                    ) : (
                        /* Cash Payment */
                        <>
                            <div className="text-center">
                                <p className="text-[10px] text-muted-foreground font-mono tracking-[0.12em] uppercase mb-1">
                                    Total Due
                                </p>
                                <p className="font-mono text-4xl text-primary font-bold leading-none">
                                    {formatDisplay(totalInCurrency)}
                                </p>
                                {currency === "KHR" && (
                                    <p className="font-mono text-[13px] text-muted-foreground mt-1">
                                        ≈ ${total.toFixed(2)}
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <div
                                    className={cn(
                                        "flex-1 rounded-xl px-4 py-3 text-right bg-secondary transition-colors duration-150",
                                        entered
                                            ? "border-[1.5px] border-accent"
                                            : "border-[1.5px] border-border",
                                    )}
                                >
                                    <p className="text-[10px] text-muted-foreground font-mono tracking-[0.1em] mb-0.5">
                                        Amount Given
                                    </p>
                                    <p className="font-mono text-xl text-foreground font-semibold min-h-7">
                                        {entered ? (
                                            `${currencySymbol}${currency === "KHR" ? parseInt(entered || "0").toLocaleString() : entered}`
                                        ) : (
                                            <span className="text-muted-foreground opacity-40">
                                                {formatDisplay(0)}
                                            </span>
                                        )}
                                    </p>
                                </div>

                                <div
                                    className={cn(
                                        "flex-1 rounded-xl px-4 py-3 text-right transition-colors duration-150",
                                        change >= 0 && enteredAmount > 0
                                            ? "bg-green-50 border-[1.5px] border-green-200"
                                            : change < 0
                                              ? "bg-red-50 border-[1.5px] border-red-200"
                                              : "bg-secondary border-[1.5px] border-border",
                                    )}
                                >
                                    <p className="text-[10px] text-muted-foreground font-mono tracking-[0.1em] mb-0.5">
                                        Change
                                    </p>
                                    <p
                                        className={cn(
                                            "font-mono text-xl font-semibold min-h-7",
                                            change >= 0 && enteredAmount > 0
                                                ? "text-green-700"
                                                : change < 0
                                                  ? "text-red-600"
                                                  : "text-muted-foreground",
                                        )}
                                    >
                                        {enteredAmount === 0
                                            ? "—"
                                            : change >= 0
                                              ? formatDisplay(change)
                                              : `-${currency === "USD" ? "$" : ""}${currency === "KHR" ? "៛" + Math.round(Math.abs(change)).toLocaleString() : Math.abs(change).toFixed(2)}`}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-1.5">
                                {KEYS.flat().map((k) => (
                                    <motion.button
                                        key={k}
                                        whileTap={{ scale: 0.93 }}
                                        onClick={() =>
                                            k === "⌫"
                                                ? handleDelete()
                                                : handleKey(k)
                                        }
                                        className={cn(
                                            "py-3.5 rounded-lg flex items-center justify-center border border-border font-mono text-lg font-semibold cursor-pointer transition-none",
                                            k === "⌫"
                                                ? "bg-destructive/12 text-destructive"
                                                : "bg-secondary text-foreground",
                                            k === "." &&
                                                currency === "KHR" &&
                                                "opacity-25 pointer-events-none",
                                        )}
                                    >
                                        {k === "⌫" ? <Delete size={16} /> : k}
                                    </motion.button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                <div className="flex flex-col w-[280px] border-l border-border">
                    <div className="pt-4 px-4">
                        <p className="text-[11px] text-muted-foreground font-mono tracking-[0.1em] uppercase mb-2">
                            Order Summary
                        </p>
                        {paymentMethod === "cash" && (
                            <div className="flex rounded-lg overflow-hidden bg-secondary p-0.5 gap-0.5 mb-3">
                                {(["USD", "KHR"] as const).map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => {
                                            setCurrency(c);
                                            setEntered("");
                                        }}
                                        className={cn(
                                            "flex-1 py-1.5 rounded-md transition-all font-mono text-xs font-semibold border-none cursor-pointer",
                                            currency === c
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-transparent text-muted-foreground",
                                        )}
                                    >
                                        {c === "USD" ? "$ USD" : "៛ KHR"}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto flex flex-col gap-2 px-4 pb-3 [scrollbar-width:none]">
                        {cartItems.map((item: CartItem) => {
                            const Icon =
                                CATEGORY_ICONS[item.category] ?? Coffee;
                            return (
                                <div
                                    key={item.id}
                                    className="flex items-start gap-2 py-2 border-b border-border pl-1"
                                >
                                    <Icon
                                        size={14}
                                        strokeWidth={1.5}
                                        className="text-primary mt-0.5 shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[13px] text-foreground font-medium">
                                            {item.quantity > 1 && (
                                                <span className="text-accent font-bold">
                                                    {item.quantity}×{" "}
                                                </span>
                                            )}
                                            {item.name}
                                        </p>
                                        <div className="flex flex-wrap gap-[3px_4px] mt-[3px]">
                                            {item.size && (
                                                <span className="text-[10px] text-muted-foreground font-mono bg-secondary rounded px-[5px] py-px border border-border">
                                                    {item.size}
                                                </span>
                                            )}
                                            {item.sugarLevel &&
                                                item.sugarLevel !== "50%" && (
                                                    <span className="text-[10px] text-muted-foreground bg-secondary rounded px-[5px] py-px border border-border">
                                                        Sugar {item.sugarLevel}
                                                    </span>
                                                )}
                                            {item.toppings.map(
                                                (
                                                    topping: (typeof item.toppings)[number],
                                                ) => (
                                                    <span
                                                        key={topping.name}
                                                        className="text-[10px] text-muted-foreground bg-secondary rounded px-[5px] py-px border border-border"
                                                    >
                                                        {topping.qty > 1
                                                            ? `${topping.qty}× `
                                                            : "+"}
                                                        {topping.name}
                                                    </span>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                    <span className="font-mono text-xs text-foreground font-semibold shrink-0 text-right">
                                        {currency === "KHR" &&
                                        paymentMethod === "cash"
                                            ? "៛" +
                                              Math.round(
                                                  item.price * KHR_RATE,
                                              ).toLocaleString()
                                            : "$" + item.price.toFixed(2)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    <div className="p-4 pb-5 border-t border-border">
                        {paymentMethod === "cash" && (
                            <motion.button
                                onClick={handleConfirmPayment}
                                disabled={!isFullyPaid || isProcessing}
                                animate={
                                    isFullyPaid && !isProcessing
                                        ? { scale: [1, 1.01, 1] }
                                        : { scale: 1 }
                                }
                                transition={
                                    isFullyPaid && !isProcessing
                                        ? {
                                              duration: 1.6,
                                              repeat: Infinity,
                                              ease: "easeInOut",
                                          }
                                        : {}
                                }
                                className={cn(
                                    "w-full rounded-xl flex flex-col items-center gap-1 bg-primary text-primary-foreground border-none py-4 transition-none",
                                    isFullyPaid && !isProcessing
                                        ? "cursor-pointer opacity-100"
                                        : "cursor-not-allowed opacity-30",
                                )}
                            >
                                <span className="font-bold text-[15px]">
                                    {isProcessing
                                        ? "Processing..."
                                        : "Confirm Payment"}
                                </span>
                                {!isFullyPaid && !isProcessing && (
                                    <span className="text-[10px] opacity-70">
                                        Enter full amount
                                    </span>
                                )}
                            </motion.button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentScreen;
