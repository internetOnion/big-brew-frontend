import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeftIcon, ReceiptIcon } from "@phosphor-icons/react";
import { toast } from "sonner";
import { ROUTES } from "@/lib/constants";
import { usePOS } from "@/hooks/usePos";
import { useSettings } from "@/hooks/useSettings";
import type { Order, PaymentMethod, Currency } from "@/types/order";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import OrderReceipt from "./OrderReceipt";
import { PaymentMethodToggle } from "./PaymentMethodToggle";
import { NumericKeypad } from "./NumericKeypad";
import { AmountDisplay } from "./AmountDisplay";
import { PaymentOrderSummary } from "./PaymentOrderSummary";
import { QuickTender } from "./QuickTender";
import { PinDialog } from "@/components/common/PinDialog";
import type { VerifiedEmployee } from "@/components/common/PinDialog";

const DEFAULT_KHR_RATE = 4100;

const prefersReducedMotion =
    typeof window !== "undefined"
        ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
        : false;

const PaymentScreen = () => {
    const { total, subtotal, cartItems, submitOrder } = usePOS();
    const navigate = useNavigate();
    const [entered, setEntered] = useState("");
    const [currency, setCurrency] = useState<Currency>("USD");
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
    const [qrDialogOpen, setQrDialogOpen] = useState(false);
    const [success, setSuccess] = useState(false);
    const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [pinDialogOpen, setPinDialogOpen] = useState(false);
    const [pendingConfirm, setPendingConfirm] = useState<{
        method: PaymentMethod;
        amountReceived?: number;
    } | null>(null);
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

    const handleQuickTender = (amount: string) => setEntered(amount);

    const handleExact = () =>
        setEntered(
            currency === "KHR"
                ? String(Math.round(totalInCurrency))
                : totalInCurrency.toFixed(2),
        );

    const handleClear = () => setEntered("");

    const handleConfirmPayment = () => {
        if (isProcessing) return;

        const amountReceived =
            paymentMethod === "cash"
                ? currency === "KHR"
                    ? enteredAmount / khrRate
                    : enteredAmount
                : undefined;

        setPendingConfirm({ method: paymentMethod, amountReceived });
        setPinDialogOpen(true);
    };

    const handlePinVerified = async (employee: VerifiedEmployee) => {
        setPinDialogOpen(false);
        if (!pendingConfirm) return;

        const { method, amountReceived } = pendingConfirm;
        setPendingConfirm(null);
        setIsProcessing(true);

        try {
            const order = await submitOrder(
                method,
                amountReceived,
                employee.id,
            );
            setCompletedOrder(order);
            setSuccess(true);
            toast.success(`Payment complete · Order #${order.orderNumber}`);
        } catch {
            setIsProcessing(false);
        }
    };

    const handleQrConfirm = () => {
        if (isProcessing) return;

        setPendingConfirm({ method: "qr" });
        setPinDialogOpen(true);
    };

    const currencySymbol = currency === "USD" ? "$" : "៛";

    const formatDisplay = (val: number) =>
        currency === "USD"
            ? `$${val.toFixed(2)}`
            : `៛${Math.round(val).toLocaleString()}`;

    const itemCount = cartItems.reduce((s: number, i) => s + i.quantity, 0);

    const handleNewOrder = () => {
        setSuccess(false);
        setCompletedOrder(null);
        navigate(ROUTES.POS);
    };

    return (
        <div className="flex flex-1 flex-col overflow-hidden bg-(--pos-bg)">
            <div className="flex shrink-0 items-center gap-3 border-b border-(--pos-border) bg-(--pos-card) px-6 py-2.5">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(ROUTES.POS)}
                    className="gap-2 text-(--pos-text-muted)"
                >
                    <ArrowLeftIcon size={14} /> Back to Menu
                </Button>
                <div className="flex-1" />
                <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-(--pos-text-muted)">
                    Payment
                </p>
                <span className="rounded-md border border-(--pos-border) bg-(--pos-hover) px-1.5 py-0.5 font-sans text-[10px] font-medium text-(--pos-text-muted)">
                    {itemCount} item{itemCount !== 1 ? "s" : ""} · $
                    {subtotal.toFixed(2)}
                </span>
            </div>

            <div className="flex flex-1 items-stretch min-h-0">
                <div className="mx-auto flex max-w-sm flex-1 flex-col min-h-0">
                    <div className="sticky top-0 z-10 bg-(--pos-bg) pb-2 pt-4">
                        <PaymentMethodToggle
                            value={paymentMethod}
                            onChange={setPaymentMethod}
                            onQrSelect={() => setQrDialogOpen(true)}
                        />
                    </div>
                    <div className="flex flex-col gap-3 overflow-y-auto px-6 pb-4">
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
                        <QuickTender
                            currency={currency}
                            onTender={handleQuickTender}
                            onExact={handleExact}
                            onClear={handleClear}
                            disabled={isProcessing}
                        />
                        <NumericKeypad
                            onKeyPress={handleKey}
                            onDelete={handleDelete}
                            disableDecimal={currency === "KHR"}
                        />
                    </div>
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

            <PinDialog
                open={pinDialogOpen}
                onOpenChange={setPinDialogOpen}
                onVerified={handlePinVerified}
                title="Enter Pin"
            />

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
                            {settings?.qrCodeUrl ? (
                                <img
                                    src={settings.qrCodeUrl}
                                    alt="QR Code"
                                    className="size-96 object-contain"
                                />
                            ) : (
                                <div className="flex size-96 items-center justify-center text-sm text-muted-foreground">
                                    No QR code configured
                                </div>
                            )}
                        </div>
                        <p className="font-mono text-lg font-bold text-primary">
                            ${total.toFixed(2)}
                        </p>
                        <motion.div
                            animate={
                                !isProcessing && !prefersReducedMotion
                                    ? { scale: [1, 1.01, 1] }
                                    : { scale: 1 }
                            }
                            transition={
                                !isProcessing && !prefersReducedMotion
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

            <Dialog
                open={success && !!completedOrder}
                onOpenChange={(open) => {
                    if (!open) handleNewOrder();
                }}
            >
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ReceiptIcon size={18} />
                            Receipt
                        </DialogTitle>
                    </DialogHeader>
                    {completedOrder && settings && (
                        <OrderReceipt
                            order={completedOrder}
                            settings={settings}
                        />
                    )}
                    <DialogFooter>
                        <Button onClick={handleNewOrder} className="w-full">
                            New Order
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default PaymentScreen;
