import { cn } from "@/lib/utils";

interface AmountDisplayProps {
    totalDisplay: string;
    currency: "USD" | "KHR";
    totalUsd?: string;
    entered: string;
    enteredDisplay: string;
    change: number;
    changeDisplay: string;
    enteredAmount: number;
    currencySymbol: string;
}

export const AmountDisplay = ({
    totalDisplay,
    currency,
    totalUsd,
    entered,
    enteredDisplay,
    change,
    changeDisplay,
    enteredAmount,
}: AmountDisplayProps) => (
    <>
        <div className="text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                Total Due
            </p>
            <p className="font-mono text-4xl font-bold leading-none text-primary">
                {totalDisplay}
            </p>
            {currency === "KHR" && totalUsd && (
                <p className="mt-1 font-mono text-[13px] text-muted-foreground">
                    ≈ {totalUsd}
                </p>
            )}
        </div>

        <div className="flex gap-3">
            <div
                className={cn(
                    "flex-1 rounded-xl border-[1.5px] bg-secondary px-4 py-3 text-right transition-colors duration-150",
                    entered ? "border-accent" : "border-border",
                )}
            >
                <p className="mb-0.5 font-mono text-[10px] tracking-[0.1em] text-muted-foreground">
                    Amount Given
                </p>
                <p className="min-h-7 font-mono text-xl font-semibold text-foreground">
                    {entered ? (
                        enteredDisplay
                    ) : (
                        <span className="opacity-40 text-muted-foreground">
                            {currency === "USD" ? "$0.00" : "៛0"}
                        </span>
                    )}
                </p>
            </div>

            <div
                className={cn(
                    "flex-1 rounded-xl border-[1.5px] px-4 py-3 text-right transition-colors duration-150",
                    change >= 0 && enteredAmount > 0
                        ? "border-chart-4/30 bg-chart-4/8"
                        : change < 0
                          ? "border-destructive/30 bg-destructive/8"
                          : "border-border bg-secondary",
                )}
            >
                <p className="mb-0.5 font-mono text-[10px] tracking-[0.1em] text-muted-foreground">
                    Change
                </p>
                <p
                    className={cn(
                        "min-h-7 font-mono text-xl font-semibold",
                        change >= 0 && enteredAmount > 0
                            ? "text-chart-4"
                            : change < 0
                              ? "text-destructive"
                              : "text-muted-foreground",
                    )}
                >
                    {changeDisplay}
                </p>
            </div>
        </div>
    </>
);
