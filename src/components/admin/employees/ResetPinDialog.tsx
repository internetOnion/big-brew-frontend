import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
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
    const [pin, setPin] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open) {
            setPin("");
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [open]);

    const handleSubmit = () => {
        if (!employeeId || pin.length !== PIN_LENGTH) return;
        resetPin.mutate(
            { id: employeeId, pin },
            {
                onSuccess: () => {
                    toast.success(`PIN reset for ${employeeName}`);
                    onClose();
                },
                onError: () => {
                    toast.error("Failed to reset PIN");
                    setPin("");
                },
            },
        );
    };

    const handleKey = (key: string) => {
        if (!/^\d$/.test(key)) return;
        if (pin.length >= PIN_LENGTH) return;
        const newPin = pin + key;
        setPin(newPin);
    };

    const handleDelete = () => {
        setPin((prev) => prev.slice(0, -1));
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-sm border-(--admin-border) bg-(--admin-card)">
                <DialogHeader>
                    <DialogTitle className="text-(--admin-text)">
                        Reset PIN
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col items-center gap-4">
                    <p className="text-[11px] text-(--admin-text-secondary)">
                        New PIN for{" "}
                        <span className="font-medium text-(--admin-text)">
                            {employeeName}
                        </span>
                    </p>

                    <div className="flex gap-2">
                        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "flex size-10 items-center justify-center rounded-lg border-2 font-mono text-xl font-bold transition-colors",
                                    i < pin.length
                                        ? "border-(--admin-primary) bg-(--admin-primary)/10 text-(--admin-primary)"
                                        : "border-(--admin-border) bg-(--admin-hover) text-transparent",
                                )}
                            >
                                {i < pin.length ? "•" : ""}
                            </div>
                        ))}
                    </div>

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
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Backspace") {
                                e.preventDefault();
                                handleDelete();
                            }
                        }}
                        className="sr-only"
                        autoFocus
                        disabled={resetPin.isPending}
                    />

                    <NumericKeypad
                        onKeyPress={handleKey}
                        onDelete={handleDelete}
                        disableDecimal
                        className="w-full [&_button]:py-2.5"
                    />
                </div>

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
                        disabled={pin.length !== PIN_LENGTH || resetPin.isPending}
                        className="bg-(--admin-primary) text-white hover:bg-[#3a1d0e]"
                    >
                        {resetPin.isPending ? "Saving..." : "Save PIN"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ResetPinDialog;
