import { motion } from "motion/react";
import { BackspaceIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const KEYS = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    [".", "0", "\u232B"],
];

interface NumericKeypadProps {
    onKeyPress: (key: string) => void;
    onDelete: () => void;
    disableDecimal?: boolean;
}

export const NumericKeypad = ({
    onKeyPress,
    onDelete,
    disableDecimal,
}: NumericKeypadProps) => (
    <div className="grid grid-cols-3 gap-1.5">
        {KEYS.flat().map((k) => (
            <motion.button
                key={k}
                whileTap={{ scale: 0.93 }}
                onClick={() => (k === "\u232B" ? onDelete() : onKeyPress(k))}
                className={cn(
                    "flex cursor-pointer items-center justify-center rounded-lg border border-border py-3.5 font-mono text-lg font-semibold",
                    k === "\u232B"
                        ? "bg-destructive/12 text-destructive"
                        : "bg-secondary text-foreground",
                    k === "." &&
                        disableDecimal &&
                        "pointer-events-none opacity-25",
                )}
            >
                {k === "\u232B" ? <BackspaceIcon size={16} /> : k}
            </motion.button>
        ))}
    </div>
);
