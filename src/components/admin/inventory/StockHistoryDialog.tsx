import { useStockMovements } from "@/hooks/useStockMovements";
import { format } from "date-fns";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface StockHistoryDialogProps {
    ingredientId: string | null;
    ingredientName: string | null;
    open: boolean;
    onClose: () => void;
}

const reasonLabels: Record<string, string> = {
    order_placed: "Order",
    order_voided: "Void",
    manual_restock: "Restock",
    manual_deduction: "Deduction",
    manual_adjustment: "Adjustment",
};

const StockHistoryDialog = ({
    ingredientId,
    ingredientName,
    open,
    onClose,
}: StockHistoryDialogProps) => {
    const { data: movements, isLoading } = useStockMovements(
        ingredientId ? { ingredientId } : undefined,
    );

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-lg border-(--admin-border) bg-(--admin-card)">
                <DialogHeader>
                    <DialogTitle className="text-(--admin-text)">
                        Stock History: {ingredientName}
                    </DialogTitle>
                </DialogHeader>

                <div className="max-h-[400px] overflow-y-auto">
                    {isLoading ? (
                        <div className="flex h-32 items-center justify-center text-xs text-(--admin-text-muted)">
                            Loading...
                        </div>
                    ) : !movements || movements.length === 0 ? (
                        <div className="flex h-32 items-center justify-center text-xs text-(--admin-text-muted)">
                            No stock movements recorded.
                        </div>
                    ) : (
                        <div className="divide-y divide-(--admin-border)">
                            {movements.map((m) => {
                                const qty = parseFloat(m.quantityChange);
                                const isPositive = qty > 0;

                                return (
                                    <div
                                        key={m.id}
                                        className="flex items-center justify-between px-1 py-2"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[12px] text-(--admin-text)">
                                                {reasonLabels[m.reason] ??
                                                    m.reason}
                                            </p>
                                            {m.notes && (
                                                <p className="truncate text-[10px] text-(--admin-text-muted)">
                                                    {m.notes}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span
                                                className={`font-mono text-[12px] font-medium ${isPositive ? "text-emerald-600" : "text-red-500"}`}
                                            >
                                                {isPositive ? "+" : ""}
                                                {qty.toFixed(2)}
                                            </span>
                                            <span className="text-[10px] text-(--admin-text-muted)">
                                                {format(
                                                    new Date(m.createdAt),
                                                    "MMM d, HH:mm",
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="text-(--admin-text-secondary)"
                    >
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default StockHistoryDialog;
