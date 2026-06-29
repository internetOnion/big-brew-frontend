import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface VoidConfirmFormProps {
    onConfirm: (reason: string) => void;
    onCancel: () => void;
}

export const VoidConfirmForm = ({
    onConfirm,
    onCancel,
}: VoidConfirmFormProps) => {
    const [reason, setReason] = useState("");

    const handleConfirm = () => {
        if (reason.trim()) {
            onConfirm(reason.trim());
            setReason("");
        }
    };

    return (
        <div>
            <p className="mb-3 text-xs text-muted-foreground">
                Please provide a reason for voiding this order.
            </p>
            <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason..."
                className="mb-3 border-border bg-background"
                rows={2}
            />
            <div className="flex gap-2">
                <Button
                    variant="outline"
                    onClick={() => {
                        onCancel();
                        setReason("");
                    }}
                    className="h-auto flex-1 py-2.5 font-bold"
                >
                    Cancel
                </Button>
                <Button
                    variant="destructive"
                    onClick={handleConfirm}
                    disabled={!reason.trim()}
                    className="h-auto flex-1 py-2.5 font-bold"
                >
                    Confirm Void
                </Button>
            </div>
        </div>
    );
};
