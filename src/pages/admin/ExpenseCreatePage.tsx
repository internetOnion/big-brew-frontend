import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeftIcon } from "@phosphor-icons/react";
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
import { useCreateExpense } from "@/hooks/useExpenses";
import { useExpenseCategories } from "@/hooks/useExpenseCategories";
import { format } from "date-fns";

const todayStr = format(new Date(), "yyyy-MM-dd");

const ExpenseCreatePage = () => {
    const navigate = useNavigate();
    const createMutation = useCreateExpense();
    const { data: categories } = useExpenseCategories();

    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("");
    const [recordedAt, setRecordedAt] = useState(todayStr);

    const canSubmit =
        description.trim() && amount && parseFloat(amount) > 0 && category;

    const handleSubmit = async () => {
        if (!canSubmit) return;
        try {
            await createMutation.mutateAsync({
                description: description.trim(),
                amount: parseFloat(amount),
                category,
                recordedAt: new Date(recordedAt).toISOString(),
            });
            toast.success("Expense created");
            navigate("/admin/expenses");
        } catch {
            toast.error("Failed to create expense");
        }
    };

    return (
        <div className="flex flex-col gap-5 p-5">
            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => navigate("/admin/expenses")}
                    aria-label="Back to expenses"
                    className="text-(--admin-text-muted) hover:text-(--admin-text)"
                >
                    <ArrowLeftIcon className="size-4" />
                </Button>
                <h1 className="text-[13px] font-medium text-(--admin-primary)">
                    New Expense
                </h1>
            </div>

            <div className="rounded-lg border border-(--admin-border) bg-(--admin-card) p-4">
                <h2 className="mb-3 text-xs font-semibold text-(--admin-text-secondary)">
                    Expense Details
                </h2>
                <div className="grid gap-3">
                    <div className="grid gap-1.5">
                        <Label htmlFor="expense-description" className="text-[11px] text-(--admin-text-secondary)">
                            Description
                        </Label>
                        <Input
                            id="expense-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="e.g. Coffee beans"
                            autoFocus
                            className="h-8 max-md:min-h-[44px] border-(--admin-border) bg-(--admin-card) text-xs"
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="grid gap-1.5">
                            <Label htmlFor="expense-amount" className="text-[11px] text-(--admin-text-secondary)">
                                Amount
                            </Label>
                            <Input
                                id="expense-amount"
                                type="number"
                                inputMode="decimal"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                className="h-8 max-md:min-h-[44px] border-(--admin-border) bg-(--admin-card) font-mono text-xs"
                            />
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="expense-category" className="text-[11px] text-(--admin-text-secondary)">
                                Category
                            </Label>
                            <Select
                                value={category || undefined}
                                onValueChange={(v) => setCategory(v ?? "")}
                            >
                                <SelectTrigger id="expense-category" className="h-8 max-md:min-h-[44px] border-(--admin-border) bg-(--admin-card) text-xs">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories?.map((cat) => (
                                        <SelectItem
                                            key={cat.id}
                                            value={cat.name}
                                        >
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid gap-1.5">
                        <Label htmlFor="expense-date" className="text-[11px] text-(--admin-text-secondary)">
                            Date
                        </Label>
                        <Input
                            id="expense-date"
                            type="date"
                            value={recordedAt}
                            onChange={(e) => setRecordedAt(e.target.value)}
                            className="h-8 max-md:min-h-[44px] w-full max-w-[200px] border-(--admin-border) bg-(--admin-card) text-xs"
                        />
                    </div>
                </div>
            </div>

            <div className="flex gap-2">
                <Button
                    onClick={handleSubmit}
                    disabled={!canSubmit || createMutation.isPending}
                    className="h-8 max-md:min-h-[44px] bg-(--admin-primary) text-xs text-white hover:bg-(--admin-primary)/80"
                >
                    {createMutation.isPending ? "Creating..." : "Create Expense"}
                </Button>
                <Button
                    variant="ghost"
                    onClick={() => navigate("/admin/expenses")}
                    disabled={createMutation.isPending}
                    className="h-8 max-md:min-h-[44px] text-xs text-(--admin-text-secondary)"
                >
                    Cancel
                </Button>
            </div>
        </div>
    );
};

export default ExpenseCreatePage;
