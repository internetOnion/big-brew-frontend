import { motion } from "motion/react";
import { CheckCircle2 } from "lucide-react";
import type { PaymentMethod } from "@/types/order";

interface PaymentSuccessScreenProps {
    orderNumber: number;
    changeAmount?: string | null;
    paymentMethod: PaymentMethod;
}

export const PaymentSuccessScreen = ({
    orderNumber,
    changeAmount,
    paymentMethod,
}: PaymentSuccessScreenProps) => (
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
                Order #{orderNumber}
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
