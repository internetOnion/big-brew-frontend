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
} from "lucide-react";

const categoryIconMap: Record<string, React.ElementType> = {
    Coffee,
    Milk,
    Leaf,
    GlassWater,
    Croissant,
};
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { usePOS } from "@/hooks/usePos";
import type { CartItem } from "@/types/cart";
import api from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import type { Settings, Order } from "@/types/order";
import { getCategoryIconName } from "@/types/menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const DEFAULT_KHR_RATE = 4100;

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
    const [khrRate, setKhrRate] = useState(DEFAULT_KHR_RATE);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await api.get<Settings>(
                    ENDPOINTS.SETTINGS.BASE,
                );
                setSettings(data);
                if (data.khrRate) setKhrRate(data.khrRate);
            } catch {
                // Settings fetch failed, QR code won't be available
            }
        };
        fetchSettings();
    }, []);

    const totalInCurrency = currency === "KHR" ? total * khrRate : total;
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
                        ? enteredAmount / khrRate
                        : enteredAmount
                    : undefined;

            const order = await submitOrder(paymentMethod, amountReceived);
            setCompletedOrder(order);
            setSuccess(true);
        } catch {
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
        } catch {
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
            <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-background">
                <div className="relative flex flex-col items-center gap-4">
                    <motion.div
                        className="absolute top-0 size-20 rounded-full bg-accent/20"
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
                        className="relative z-10 text-accent"
                    />
                    <p className="text-2xl font-bold text-foreground">
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
        <div className="flex flex-1 flex-col bg-background">
            <div className="flex items-center gap-4 border-b border-border px-8 pb-4 pt-6">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(ROUTES.POS)}
                    className="gap-2 text-muted-foreground"
                >
                    <ArrowLeft size={16} /> Back to Menu
                </Button>
                <div className="flex-1" />
                <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                    Payment
                </p>
                <Badge variant="secondary" className="font-mono">
                    {itemCount} item{itemCount !== 1 ? "s" : ""} · $
                    {subtotal.toFixed(2)}
                </Badge>
            </div>

            <div className="flex flex-1 items-stretch">
                <div className="mx-auto flex max-w-sm flex-1 flex-col gap-4 px-8 py-6">
                    {/* Payment Method Toggle */}
                    <div className="flex overflow-hidden rounded-lg bg-secondary p-0.5 gap-0.5">
                        <Button
                            variant={
                                paymentMethod === "cash" ? "default" : "ghost"
                            }
                            size="default"
                            onClick={() => setPaymentMethod("cash")}
                            className="flex-1 text-xs"
                        >
                            <Banknote />
                            Cash
                        </Button>
                        <Button
                            variant={
                                paymentMethod === "qr" ? "default" : "ghost"
                            }
                            size="default"
                            onClick={() => setPaymentMethod("qr")}
                            className="flex-1 text-xs"
                        >
                            <QrCode />
                            QR Code
                        </Button>
                    </div>

                    {paymentMethod === "qr" ? (
                        <div className="flex flex-1 flex-col items-center justify-center gap-4">
                            {settings?.qrCodeUrl ? (
                                <div className="rounded-xl bg-white p-4">
                                    <img
                                        src={settings.qrCodeUrl}
                                        alt="QR Code"
                                        className="size-48 object-contain"
                                    />
                                </div>
                            ) : (
                                <div className="flex size-48 items-center justify-center rounded-xl bg-secondary">
                                    <QrCode
                                        size={64}
                                        className="text-muted-foreground"
                                    />
                                </div>
                            )}
                            <p className="text-center text-sm text-muted-foreground">
                                Scan to pay ${total.toFixed(2)}
                            </p>
                            <motion.div
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
                                className="w-full"
                            >
                                <Button
                                    onClick={handleQrConfirm}
                                    disabled={isProcessing}
                                    className={cn(
                                        "h-auto w-full flex-col gap-1 py-4",
                                        isProcessing &&
                                            "cursor-not-allowed opacity-50",
                                    )}
                                >
                                    <span className="text-[15px] font-bold">
                                        {isProcessing
                                            ? "Processing..."
                                            : "Confirm Payment Received"}
                                    </span>
                                </Button>
                            </motion.div>
                        </div>
                    ) : (
                        <>
                            <div className="text-center">
                                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                                    Total Due
                                </p>
                                <p className="font-mono text-4xl font-bold leading-none text-primary">
                                    {formatDisplay(totalInCurrency)}
                                </p>
                                {currency === "KHR" && (
                                    <p className="mt-1 font-mono text-[13px] text-muted-foreground">
                                        ≈ ${total.toFixed(2)}
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <div
                                    className={cn(
                                        "flex-1 rounded-xl border-[1.5px] bg-secondary px-4 py-3 text-right transition-colors duration-150",
                                        entered
                                            ? "border-accent"
                                            : "border-border",
                                    )}
                                >
                                    <p className="mb-0.5 font-mono text-[10px] tracking-[0.1em] text-muted-foreground">
                                        Amount Given
                                    </p>
                                    <p className="min-h-7 font-mono text-xl font-semibold text-foreground">
                                        {entered ? (
                                            `${currencySymbol}${currency === "KHR" ? parseInt(entered || "0").toLocaleString() : entered}`
                                        ) : (
                                            <span className="opacity-40 text-muted-foreground">
                                                {formatDisplay(0)}
                                            </span>
                                        )}
                                    </p>
                                </div>

                                <div
                                    className={cn(
                                        "flex-1 rounded-xl border-[1.5px] px-4 py-3 text-right transition-colors duration-150",
                                        change >= 0 && enteredAmount > 0
                                            ? "border-chart-4/30 bg-chart-4/8"
                                            : change < 0
                                              ? "border-destructive/30 bg-destructive/8"
                                              : "border-border bg-secondary",
                                    )}
                                >
                                    <p className="mb-0.5 font-mono text-[10px] tracking-[0.1em] text-muted-foreground">
                                        Change
                                    </p>
                                    <p
                                        className={cn(
                                            "min-h-7 font-mono text-xl font-semibold",
                                            change >= 0 && enteredAmount > 0
                                                ? "text-chart-4"
                                                : change < 0
                                                  ? "text-destructive"
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
                                            "flex items-center justify-center rounded-lg border border-border py-3.5 font-mono text-lg font-semibold",
                                            k === "⌫"
                                                ? "bg-destructive/12 text-destructive"
                                                : "bg-secondary text-foreground",
                                            k === "." &&
                                                currency === "KHR" &&
                                                "pointer-events-none opacity-25",
                                        )}
                                    >
                                        {k === "⌫" ? <Delete size={16} /> : k}
                                    </motion.button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                <div className="flex w-[280px] flex-col border-l border-border">
                    <div className="px-4 pt-4">
                        <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                            Order Summary
                        </p>
                        {paymentMethod === "cash" && (
                            <div className="mb-3 flex overflow-hidden rounded-lg bg-secondary p-0.5 gap-0.5">
                                {(["USD", "KHR"] as const).map((c) => (
                                    <Button
                                        key={c}
                                        variant={
                                            currency === c ? "default" : "ghost"
                                        }
                                        size="sm"
                                        onClick={() => {
                                            setCurrency(c);
                                            setEntered("");
                                        }}
                                        className="flex-1 font-mono font-semibold"
                                    >
                                        {c === "USD" ? "$ USD" : "៛ KHR"}
                                    </Button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 pb-3 scrollbar-hide">
                        {cartItems.map((item: CartItem) => {
                            const Icon =
                                categoryIconMap[
                                    getCategoryIconName(item.category)
                                ] ?? Coffee;
                            return (
                                <div
                                    key={item.id}
                                    className="flex items-start gap-2 border-b border-border py-2 pl-1"
                                >
                                    <Icon
                                        size={14}
                                        strokeWidth={1.5}
                                        className="mt-0.5 shrink-0 text-primary"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[13px] font-medium text-foreground">
                                            {item.quantity > 1 && (
                                                <span className="font-bold text-accent">
                                                    {item.quantity}×{" "}
                                                </span>
                                            )}
                                            {item.name}
                                        </p>
                                        <div className="mt-[3px] flex flex-wrap gap-[3px_4px]">
                                            {item.size && (
                                                <Badge
                                                    variant="secondary"
                                                    className="px-1.5 py-px text-[10px]"
                                                >
                                                    {item.size}
                                                </Badge>
                                            )}
                                            {item.sugarLevel &&
                                                item.sugarLevel !== "50%" && (
                                                    <Badge
                                                        variant="secondary"
                                                        className="px-1.5 py-px text-[10px]"
                                                    >
                                                        Sugar {item.sugarLevel}
                                                    </Badge>
                                                )}
                                            {item.toppings.map(
                                                (
                                                    topping: (typeof item.toppings)[number],
                                                ) => (
                                                    <Badge
                                                        key={topping.name}
                                                        variant="secondary"
                                                        className="px-1.5 py-px text-[10px]"
                                                    >
                                                        {topping.qty > 1
                                                            ? `${topping.qty}× `
                                                            : "+"}
                                                        {topping.name}
                                                    </Badge>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                    <span className="shrink-0 text-right font-mono text-xs font-semibold text-foreground">
                                        {currency === "KHR" &&
                                        paymentMethod === "cash"
                                            ? "៛" +
                                              Math.round(
                                                  item.price * khrRate,
                                              ).toLocaleString()
                                            : "$" + item.price.toFixed(2)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    <div className="border-t border-border p-4 pb-5">
                        {paymentMethod === "cash" && (
                            <motion.div
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
                            >
                                <Button
                                    onClick={handleConfirmPayment}
                                    disabled={!isFullyPaid || isProcessing}
                                    className={cn(
                                        "h-auto w-full flex-col gap-1 py-4",
                                        isFullyPaid && !isProcessing
                                            ? "cursor-pointer opacity-100"
                                            : "cursor-not-allowed opacity-30",
                                    )}
                                >
                                    <span className="text-[15px] font-bold">
                                        {isProcessing
                                            ? "Processing..."
                                            : "Confirm Payment"}
                                    </span>
                                    {!isFullyPaid && !isProcessing && (
                                        <span className="text-[10px] opacity-70">
                                            Enter full amount
                                        </span>
                                    )}
                                </Button>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentScreen;
