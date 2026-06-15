import { useState, useEffect, useRef } from "react";
import api from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface VerifiedEmployee {
    id: string;
    name: string;
    role: string;
}

interface PinDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onVerified: (employee: VerifiedEmployee) => void;
    title?: string;
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
            onVerified(data.data as VerifiedEmployee);
            onOpenChange(false);
        } catch {
            setError("Invalid PIN. Please try again.");
            setPin("");
        } finally {
            setIsVerifying(false);
        }
    };

    const handleKey = (key: string) => {
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

    const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-fit max-w-xs sm:max-w-xs">
                <DialogHeader>
                    <DialogTitle className="text-center text-base">
                        {title}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col items-center gap-4">
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
                    <div className="grid w-full grid-cols-3 gap-1.5">
                        {keys.map((key, i) => {
                            if (key === "") {
                                return <div key={i} />;
                            }
                            if (key === "⌫") {
                                return (
                                    <Button
                                        key={i}
                                        variant="outline"
                                        size="lg"
                                        onClick={handleDelete}
                                        disabled={
                                            pin.length === 0 || isVerifying
                                        }
                                        className="h-14 text-lg font-bold"
                                    >
                                        ⌫
                                    </Button>
                                );
                            }
                            return (
                                <Button
                                    key={i}
                                    variant="outline"
                                    size="lg"
                                    onClick={() => handleKey(key)}
                                    disabled={
                                        pin.length >= PIN_LENGTH || isVerifying
                                    }
                                    className="h-14 text-lg font-bold tabular-nums"
                                >
                                    {key}
                                </Button>
                            );
                        })}
                    </div>

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
