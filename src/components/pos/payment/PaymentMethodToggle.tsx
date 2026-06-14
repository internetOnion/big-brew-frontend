import { Banknote, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaymentMethodToggleProps {
    value: "cash" | "qr";
    onChange: (method: "cash" | "qr") => void;
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
            <Banknote />
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
