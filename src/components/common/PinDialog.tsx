import { useState, useEffect, useRef } from "react";
import api from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { NumericKeypad } from "@/components/pos/payment/NumericKeypad";
import { cn } from "@/lib/utils";

export interface VerifiedEmployee {
    id: string;
    name: string;
    role: string;
    pin: string;
}

interface PinDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onVerified: (employee: VerifiedEmployee) => void;
    title?: string;
    /** If true, dialog is not closable while verifying */
    preventClose?: boolean;
}

const PIN_LENGTH = 6;

export const PinDialog = ({
    open,
    onOpenChange,
    onVerified,
    title = "Enter PIN",
}: PinDialogProps) => {
    const [pin, setPin] = useState("");
    const [error, setError] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open) {
            setPin("");
            setError("");
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [open]);

    const handleVerify = async (pinValue: string) => {
        if (pinValue.length !== PIN_LENGTH) return;

        setIsVerifying(true);
        setError("");
        try {
            const { data } = await api.post(ENDPOINTS.AUTH.VERIFY_PIN, {
                pin: pinValue,
            });
            onVerified({ ...data.data, pin: pinValue } as VerifiedEmployee);
            onOpenChange(false);
        } catch {
            setError("Invalid PIN. Please try again.");
            setPin("");
        } finally {
            setIsVerifying(false);
        }
    };

    const handleKey = (key: string) => {
        if (!/^\d$/.test(key)) return;
        if (pin.length >= PIN_LENGTH) return;
        const newPin = pin + key;
        setPin(newPin);
        setError("");
        if (newPin.length === PIN_LENGTH) {
            handleVerify(newPin);
        }
    };

    const handleDelete = () => {
        setPin((prev) => prev.slice(0, -1));
        setError("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Backspace") {
            e.preventDefault();
            handleDelete();
        } else if (e.key === "Escape") {
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle className="text-center text-primary text-xl font-bold">
                        {title}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex w-full flex-col items-center gap-5">
                    {/* PIN dots */}
                    <div className="flex gap-2">
                        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "flex size-10 items-center justify-center rounded-lg border-2 font-mono text-xl font-bold tabular-nums transition-colors",
                                    i < pin.length
                                        ? "border-primary bg-primary/10 text-primary"
                                        : "border-border bg-muted/50 text-transparent",
                                    error && "border-destructive",
                                )}
                            >
                                {i < pin.length ? "•" : ""}
                            </div>
                        ))}
                    </div>

                    {/* Error message */}
                    {error && (
                        <p className="text-center text-xs font-medium text-destructive">
                            {error}
                        </p>
                    )}

                    {/* Hidden input for keyboard */}
                    <input
                        ref={inputRef}
                        type="text"
                        inputMode="numeric"
                        pattern="\d*"
                        maxLength={PIN_LENGTH}
                        value={pin}
                        onChange={(e) => {
                            const val = e.target.value
                                .replace(/\D/g, "")
                                .slice(0, PIN_LENGTH);
                            setPin(val);
                            setError("");
                            if (val.length === PIN_LENGTH) {
                                handleVerify(val);
                            }
                        }}
                        onKeyDown={handleKeyDown}
                        className="sr-only"
                        autoFocus
                        disabled={isVerifying}
                    />

                    {/* Numeric keypad */}
                    <NumericKeypad
                        onKeyPress={handleKey}
                        onDelete={handleDelete}
                        disableDecimal
                        className="w-full [&_button]:py-2.5"
                    />

                    {/* Status */}
                    {isVerifying && (
                        <p className="text-xs text-muted-foreground">
                            Verifying...
                        </p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
