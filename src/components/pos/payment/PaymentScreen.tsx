import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { usePOS } from "@/hooks/usePos";
import { useSettings } from "@/hooks/useSettings";
import type { Order } from "@/types/order";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { PaymentSuccessScreen } from "./PaymentSuccessScreen";
import { PaymentMethodToggle } from "./PaymentMethodToggle";
import { NumericKeypad } from "./NumericKeypad";
import { AmountDisplay } from "./AmountDisplay";
import { PaymentOrderSummary } from "./PaymentOrderSummary";

const DEFAULT_KHR_RATE = 4100;
const STATIC_QR_CODE_URL =
    "https://djscleluxtunyhuqrfrq.supabase.co/storage/v1/object/public/assets/uploads/3bffaf1b-aef9-4fc9-b721-f55316fde49a.png";

const PaymentScreen = () => {
    const { total, subtotal, cartItems, submitOrder } = usePOS();
    const navigate = useNavigate();
    const [entered, setEntered] = useState("");
    const [currency, setCurrency] = useState<"USD" | "KHR">("USD");
    const [paymentMethod, setPaymentMethod] = useState<"cash" | "qr">("cash");
    const [qrDialogOpen, setQrDialogOpen] = useState(false);
    const [success, setSuccess] = useState(false);
    const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const { data: settings } = useSettings();
    const khrRate = settings?.khrRate ?? DEFAULT_KHR_RATE;

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
        return (
            <PaymentSuccessScreen
                orderNumber={completedOrder.orderNumber}
                changeAmount={cashPayment?.changeAmount}
                paymentMethod={paymentMethod}
            />
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
                    <PaymentMethodToggle
                        value={paymentMethod}
                        onChange={setPaymentMethod}
                        onQrSelect={() => setQrDialogOpen(true)}
                    />

                    <AmountDisplay
                        totalDisplay={formatDisplay(totalInCurrency)}
                        currency={currency}
                        totalUsd={
                            currency === "KHR"
                                ? `$${total.toFixed(2)}`
                                : undefined
                        }
                        entered={entered}
                        enteredDisplay={`${currencySymbol}${currency === "KHR" ? parseInt(entered || "0").toLocaleString() : entered}`}
                        change={change}
                        changeDisplay={
                            enteredAmount === 0
                                ? "—"
                                : change >= 0
                                  ? formatDisplay(change)
                                  : `-${currency === "USD" ? "$" : ""}${currency === "KHR" ? "៛" + Math.round(Math.abs(change)).toLocaleString() : Math.abs(change).toFixed(2)}`
                        }
                        enteredAmount={enteredAmount}
                        currencySymbol={currencySymbol}
                    />

                    <NumericKeypad
                        onKeyPress={handleKey}
                        onDelete={handleDelete}
                        disableDecimal={currency === "KHR"}
                    />
                </div>

                <PaymentOrderSummary
                    cartItems={cartItems}
                    currency={currency}
                    onCurrencyChange={setCurrency}
                    khrRate={khrRate}
                    isFullyPaid={isFullyPaid}
                    isProcessing={isProcessing}
                    onConfirm={handleConfirmPayment}
                    resetInput={() => setEntered("")}
                />
            </div>

            <Dialog
                open={qrDialogOpen}
                onOpenChange={(open) => {
                    setQrDialogOpen(open);
                    if (!open) setPaymentMethod("cash");
                }}
            >
                <DialogContent className="w-fit sm:max-w-none">
                    <DialogHeader>
                        <DialogTitle>Scan to Pay</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col items-center gap-4 py-2">
                        <div className="rounded-xl bg-white p-4">
                            <img
                                src={STATIC_QR_CODE_URL}
                                alt="QR Code"
                                className="size-96 object-contain"
                            />
                        </div>
                        <p className="font-mono text-lg font-bold text-primary">
                            ${total.toFixed(2)}
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
                                className="h-auto w-full flex-col gap-1 py-4"
                            >
                                <span className="text-[15px] font-bold">
                                    {isProcessing
                                        ? "Processing..."
                                        : "Confirm Payment Received"}
                                </span>
                            </Button>
                        </motion.div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default PaymentScreen;
