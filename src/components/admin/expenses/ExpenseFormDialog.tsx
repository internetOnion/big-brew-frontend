import { useState, useEffect } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useCreateExpense, useUpdateExpense } from "@/hooks/useExpenses";
import { EXPENSE_CATEGORIES } from "@/types/admin";
import type { Expense, ExpenseCategory } from "@/types/admin";

interface ExpenseFormDialogProps {
    expense: Expense | null;
    open: boolean;
    onClose: () => void;
}

const todayStr = format(new Date(), "yyyy-MM-dd");

const ExpenseFormDialog = ({
    expense,
    open,
    onClose,
}: ExpenseFormDialogProps) => {
    const isEdit = !!expense;
    const createMutation = useCreateExpense();
    const updateMutation = useUpdateExpense();

    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState<string>("");
    const [recordedAt, setRecordedAt] = useState(todayStr);

    useEffect(() => {
        if (open) {
            if (expense) {
                setDescription(expense.description);
                setAmount(expense.amount);
                setCategory(expense.category ?? "");
                setRecordedAt(
                    format(new Date(expense.recordedAt), "yyyy-MM-dd"),
                );
            } else {
                setDescription("");
                setAmount("");
                setCategory("");
                setRecordedAt(todayStr);
            }
        }
    }, [open, expense]);

    const isPending = createMutation.isPending || updateMutation.isPending;
    const canSubmit =
        description.trim() && amount && parseFloat(amount) > 0 && category;

    const handleSubmit = () => {
        if (!canSubmit) return;

        const amountNum = parseFloat(amount);

        if (isEdit && expense) {
            updateMutation.mutate(
                {
                    id: expense.id,
                    description: description.trim(),
                    amount: amountNum,
                    category: category as ExpenseCategory,
                },
                {
                    onSuccess: () => {
                        toast.success("Expense updated");
                        onClose();
                    },
                    onError: () => toast.error("Failed to update expense"),
                },
            );
        } else {
            createMutation.mutate(
                {
                    description: description.trim(),
                    amount: amountNum,
                    category: category as ExpenseCategory,
                    recordedAt: new Date(recordedAt).toISOString(),
                },
                {
                    onSuccess: () => {
                        toast.success("Expense created");
                        onClose();
                    },
                    onError: () => toast.error("Failed to create expense"),
                },
            );
        }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-sm border-(--admin-border) bg-(--admin-card)">
                <DialogHeader>
                    <DialogTitle className="text-(--admin-text)">
                        {isEdit ? "Edit Expense" : "Add Expense"}
                    </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <Label className="text-[11px] text-(--admin-text-secondary)">
                            Description
                        </Label>
                        <Input
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Coffee beans"
                            className="h-8 border-(--admin-border) bg-(--admin-card) text-xs"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label className="text-[11px] text-(--admin-text-secondary)">
                            Amount
                        </Label>
                        <Input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            className="h-8 border-(--admin-border) bg-(--admin-card) text-xs"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label className="text-[11px] text-(--admin-text-secondary)">
                            Category
                        </Label>
                        <Select
                            value={category || undefined}
                            onValueChange={(v) => setCategory(v ?? "")}
                        >
                            <SelectTrigger className="h-8 border-(--admin-border) bg-(--admin-card) text-xs">
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                {EXPENSE_CATEGORIES.map((cat) => (
                                    <SelectItem key={cat} value={cat}>
                                        {cat}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {!isEdit && (
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-[11px] text-(--admin-text-secondary">
                                Date
                            </Label>
                            <Input
                                type="date"
                                value={recordedAt}
                                onChange={(e) => setRecordedAt(e.target.value)}
                                className="h-8 border-(--admin-border) bg-(--admin-card) text-xs"
                            />
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="text-(--admin-text-secondary)"
                        disabled={isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!canSubmit || isPending}
                        className="bg-(--admin-primary) text-white hover:bg-(--admin-primary)/80"
                    >
                        {isPending
                            ? isEdit
                                ? "Saving..."
                                : "Creating..."
                            : isEdit
                              ? "Save"
                              : "Create"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ExpenseFormDialog;
