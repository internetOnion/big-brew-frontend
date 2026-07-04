import { useState, useEffect, useRef } from "react";
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
import { useUpdateExpense } from "@/hooks/useExpenses";
import { useExpenseCategories } from "@/hooks/useExpenseCategories";
import type { Expense } from "@/types/admin";

interface ExpenseFormDialogProps {
    expense: Expense | null;
    open: boolean;
    onClose: () => void;
}

const ExpenseFormDialog = ({
    expense,
    open,
    onClose,
}: ExpenseFormDialogProps) => {
    const updateMutation = useUpdateExpense();
    const { data: categories } = useExpenseCategories();

    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState<string>("");
    const descRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open && expense) {
            setDescription(expense.description);
            setAmount(expense.amount);
            setCategory(expense.category ?? "");
            setTimeout(() => descRef.current?.focus(), 0);
        }
    }, [open, expense]);

    const canSubmit =
        description.trim() && amount && parseFloat(amount) > 0 && category;

    const handleSubmit = () => {
        if (!canSubmit || !expense) return;

        updateMutation.mutate(
            {
                id: expense.id,
                description: description.trim(),
                amount: parseFloat(amount),
                category,
            },
            {
                onSuccess: () => {
                    toast.success("Expense updated");
                    onClose();
                },
                onError: () => toast.error("Failed to update expense"),
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-sm border-(--admin-border) bg-(--admin-card)">
                <DialogHeader>
                    <DialogTitle className="text-(--admin-text)">
                        Edit Expense
                    </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <Label className="text-[11px] text-(--admin-text-secondary)">
                            Description
                        </Label>
                        <Input
                            ref={descRef}
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
                            key={categories?.length}
                            value={category || undefined}
                            onValueChange={(v) => setCategory(v ?? "")}
                        >
                            <SelectTrigger className="h-8 border-(--admin-border) bg-(--admin-card) text-xs">
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories?.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.name}>
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="text-(--admin-text-secondary)"
                        disabled={updateMutation.isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!canSubmit || updateMutation.isPending}
                        className="bg-(--admin-primary) text-white hover:bg-(--admin-primary)/80"
                    >
                        {updateMutation.isPending ? "Saving..." : "Save"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ExpenseFormDialog;
