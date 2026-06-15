import { Money, QrCode } from "@phosphor-icons/react";
import type { PaymentMethod } from "@/types/order";
import { Button } from "@/components/ui/button";

interface PaymentMethodToggleProps {
    value: PaymentMethod;
    onChange: (method: PaymentMethod) => void;
    onQrSelect: () => void;
}

export const PaymentMethodToggle = ({
    value,
    onChange,
    onQrSelect,
}: PaymentMethodToggleProps) => (
    <div className="flex overflow-hidden rounded-lg bg-secondary p-0.5 gap-0.5">
        <Button
            variant={value === "cash" ? "default" : "ghost"}
            size="default"
            onClick={() => onChange("cash")}
            className="flex-1 text-xs"
        >
            <Money />
            Cash
        </Button>
        <Button
            variant={value === "qr" ? "default" : "ghost"}
            size="default"
            onClick={() => {
                onChange("qr");
                onQrSelect();
            }}
            className="flex-1 text-xs"
        >
            <QrCode />
            QR Code
        </Button>
    </div>
);
