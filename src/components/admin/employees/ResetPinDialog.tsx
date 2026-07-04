import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import api from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import { useResetEmployeePin } from "@/hooks/useEmployees";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { NumericKeypad } from "@/components/pos/payment/NumericKeypad";
import { cn } from "@/lib/utils";

const PIN_LENGTH = 6;

interface ResetPinDialogProps {
    open: boolean;
    onClose: () => void;
    employeeId: string | null;
    employeeName: string;
}

const ResetPinDialog = ({
    open,
    onClose,
    employeeId,
    employeeName,
}: ResetPinDialogProps) => {
    const resetPin = useResetEmployeePin();
    const [step, setStep] = useState<1 | 2>(1);
    const [oldPin, setOldPin] = useState("");
    const [newPin, setNewPin] = useState("");
    const [error, setError] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open) {
            setStep(1);
            setOldPin("");
            setNewPin("");
            setError("");
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [open]);

    const handleVerify = async (pinValue: string) => {
        if (pinValue.length !== PIN_LENGTH || !employeeId) return;
        setIsVerifying(true);
        setError("");
        try {
            const { data } = await api.post(ENDPOINTS.AUTH.VERIFY_PIN, {
                pin: pinValue,
            });
            const verifiedId = data?.data?.id ?? data?.id;
            if (verifiedId === employeeId) {
                setStep(2);
                setOldPin("");
            } else {
                setError("PIN doesn't match this employee");
                setOldPin("");
            }
        } catch {
            setError("Invalid PIN. Please try again.");
            setOldPin("");
        } finally {
            setIsVerifying(false);
        }
    };

    const handleSubmit = () => {
        if (!employeeId || newPin.length !== PIN_LENGTH) return;
        resetPin.mutate(
            { id: employeeId, pin: newPin },
            {
                onSuccess: () => {
                    toast.success(`PIN reset for ${employeeName}`);
                    onClose();
                },
                onError: () => {
                    toast.error("Failed to reset PIN");
                    setNewPin("");
                },
            },
        );
    };

    const handleKey = (key: string) => {
        if (!/^\d$/.test(key)) return;

        if (step === 1) {
            if (oldPin.length >= PIN_LENGTH) return;
            const val = oldPin + key;
            setOldPin(val);
            setError("");
            if (val.length === PIN_LENGTH) {
                handleVerify(val);
            }
        } else {
            if (newPin.length >= PIN_LENGTH) return;
            setNewPin((prev) => prev + key);
        }
    };

    const handleDelete = () => {
        if (step === 1) {
            setOldPin((prev) => prev.slice(0, -1));
            setError("");
        } else {
            setNewPin((prev) => prev.slice(0, -1));
        }
    };

    const handleBack = () => {
        setStep(1);
        setOldPin("");
        setNewPin("");
        setError("");
    };

    const pinValue = step === 1 ? oldPin : newPin;

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-sm border-(--admin-border) bg-(--admin-card)">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        {step === 2 && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleBack}
                                className="size-7 text-(--admin-text-secondary) hover:text-(--admin-text)"
                            >
                                <ArrowLeftIcon className="size-4" />
                            </Button>
                        )}
                        <DialogTitle className="text-(--admin-text)">
                            {step === 1 ? "Verify PIN" : "New PIN"}
                        </DialogTitle>
                    </div>
                </DialogHeader>

                <div className="flex flex-col items-center gap-4">
                    {/* Step indicator */}
                    <div className="flex items-center gap-2">
                        <div
                            className={cn(
                                "flex size-5 items-center justify-center rounded-full text-[10px] font-medium",
                                step === 1
                                    ? "bg-(--admin-primary) text-white"
                                    : "bg-(--admin-success) text-white",
                            )}
                        >
                            {step === 1 ? "1" : "✓"}
                        </div>
                        <div className="h-px w-8 bg-(--admin-border)" />
                        <div
                            className={cn(
                                "flex size-5 items-center justify-center rounded-full text-[10px] font-medium",
                                step === 2
                                    ? "bg-(--admin-primary) text-white"
                                    : "bg-(--admin-hover) text-(--admin-text-muted)",
                            )}
                        >
                            2
                        </div>
                    </div>

                    <p className="text-center text-[11px] text-(--admin-text-secondary)">
                        {step === 1
                            ? `Enter current PIN for `
                            : `Set new PIN for `}
                        <span className="font-medium text-(--admin-text)">
                            {employeeName}
                        </span>
                    </p>

                    {/* PIN dots */}
                    <div className="flex gap-2">
                        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "flex size-10 items-center justify-center rounded-lg border-2 font-mono text-xl font-bold transition-colors",
                                    i < pinValue.length
                                        ? "border-(--admin-primary) bg-(--admin-primary)/10 text-(--admin-primary)"
                                        : "border-(--admin-border) bg-(--admin-hover) text-transparent",
                                    error && "border-destructive",
                                )}
                            >
                                {i < pinValue.length ? "•" : ""}
                            </div>
                        ))}
                    </div>

                    {/* Error message */}
                    {error && (
                        <p className="text-center text-[10px] font-medium text-destructive">
                            {error}
                        </p>
                    )}

                    {/* Loading */}
                    {isVerifying && (
                        <p className="text-[11px] text-(--admin-text-muted)">
                            Verifying...
                        </p>
                    )}

                    {/* Hidden input */}
                    <input
                        ref={inputRef}
                        type="text"
                        inputMode="numeric"
                        pattern="\d*"
                        maxLength={PIN_LENGTH}
                        value={pinValue}
                        onChange={(e) => {
                            const val = e.target.value
                                .replace(/\D/g, "")
                                .slice(0, PIN_LENGTH);
                            if (step === 1) {
                                setOldPin(val);
                                setError("");
                                if (val.length === PIN_LENGTH) {
                                    handleVerify(val);
                                }
                            } else {
                                setNewPin(val);
                            }
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Backspace") {
                                e.preventDefault();
                                handleDelete();
                            }
                        }}
                        className="sr-only"
                        autoFocus
                        disabled={isVerifying || resetPin.isPending}
                    />

                    {/* Keypad */}
                    <NumericKeypad
                        onKeyPress={handleKey}
                        onDelete={handleDelete}
                        disableDecimal
                        className="w-full [&_button]:py-2.5"
                    />
                </div>

                {step === 2 && (
                    <DialogFooter>
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            className="text-(--admin-text-secondary)"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={
                                newPin.length !== PIN_LENGTH ||
                                resetPin.isPending
                            }
                            className="bg-(--admin-primary) text-white hover:bg-(--admin-primary)/80"
                        >
                            {resetPin.isPending ? "Saving..." : "Save PIN"}
                        </Button>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default ResetPinDialog;
