import { useState } from "react";
import { endOfDay, format } from "date-fns";
import { toast } from "sonner";
import { PlusIcon, DotsThreeVerticalIcon } from "@phosphor-icons/react";
import {
    useExpenses,
    useExpenseSummary,
    useDeleteExpense,
} from "@/hooks/useExpenses";
import { useSettings } from "@/hooks/useSettings";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import DateRangePicker, {
    type DateRange,
} from "@/components/admin/dashboard/DateRangePicker";
import ExpenseSummaryCards from "@/components/admin/expenses/ExpenseSummaryCards";
import ExpenseFormDialog from "@/components/admin/expenses/ExpenseFormDialog";
import ExpenseBreakdown from "@/components/admin/dashboard/ExpenseBreakdown";
import { EXPENSE_CATEGORIES } from "@/types/admin";
import type { Expense } from "@/types/admin";

const ExpensesPage = () => {
    const [dateRange, setDateRange] = useState<DateRange>({
        from: new Date(),
        to: endOfDay(new Date()),
    });
    const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
    const [showFormDialog, setShowFormDialog] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [deletingExpense, setDeletingExpense] = useState<Expense | null>(
        null,
    );

    const fromStr = format(dateRange.from, "yyyy-MM-dd'T'HH:mm:ss'Z'");
    const toStr = format(dateRange.to, "yyyy-MM-dd'T'HH:mm:ss'Z'");

    const { data: expenses, isLoading } = useExpenses({
        from: fromStr,
        to: toStr,
        ...(categoryFilter ? { category: categoryFilter } : {}),
    });

    const { data: summary, isLoading: summaryLoading } = useExpenseSummary(
        fromStr,
        toStr,
    );
    const { data: settings } = useSettings();
    const deleteMutation = useDeleteExpense();

    const currencySymbol = settings?.currencySymbol ?? "$";

    const handleAdd = () => {
        setEditingExpense(null);
        setShowFormDialog(true);
    };

    const handleEdit = (expense: Expense) => {
        setEditingExpense(expense);
        setShowFormDialog(true);
    };

    const handleCloseForm = () => {
        setShowFormDialog(false);
        setEditingExpense(null);
    };

    const handleDelete = () => {
        if (!deletingExpense) return;
        deleteMutation.mutate(deletingExpense.id, {
            onSuccess: () => {
                toast.success("Expense deleted");
                setDeletingExpense(null);
            },
            onError: () => toast.error("Failed to delete expense"),
        });
    };

    const formatDate = (dateStr: string) =>
        format(new Date(dateStr), "MMM d, yyyy");

    const formatAmount = (amount: string) =>
        `${currencySymbol}${parseFloat(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    return (
        <div className="flex flex-col gap-4 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-[13px] font-medium text-(--admin-primary)">
                    Expenses
                </h1>
                <div className="flex items-center gap-3">
                    <DateRangePicker
                        value={dateRange}
                        onChange={setDateRange}
                    />
                    <Button
                        size="sm"
                        onClick={handleAdd}
                        className="bg-(--admin-primary) text-white hover:bg-(--admin-primary)/80"
                    >
                        <PlusIcon
                            className="size-3.5"
                            data-icon="inline-start"
                        />
                        Add Expense
                    </Button>
                </div>
            </div>

            <ExpenseSummaryCards
                summary={summary}
                isLoading={summaryLoading}
                currencySymbol={currencySymbol}
            />

            <div className="flex items-center gap-3">
                <Select
                    value={categoryFilter ?? "all"}
                    onValueChange={(v) =>
                        setCategoryFilter(v === "all" ? null : v)
                    }
                >
                    <SelectTrigger className="h-7 w-[160px] border-(--admin-border) bg-(--admin-card) text-xs">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {EXPENSE_CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                                {cat}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="admin-card overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-(--admin-border) text-[10px] font-medium uppercase tracking-wide text-(--admin-text-muted)">
                            <th className="px-4 py-2.5 text-left font-medium">
                                Description
                            </th>
                            <th className="px-4 py-2.5 text-right font-medium">
                                Amount
                            </th>
                            <th className="px-4 py-2.5 text-left font-medium">
                                Category
                            </th>
                            <th className="px-4 py-2.5 text-left font-medium">
                                By
                            </th>
                            <th className="px-4 py-2.5 text-left font-medium">
                                Date
                            </th>
                            <th className="w-10 px-4 py-2.5" />
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i}>
                                    <td className="px-4 py-3">
                                        <Skeleton className="h-3.5 w-32 bg-(--admin-hover)" />
                                    </td>
                                    <td className="px-4 py-3">
                                        <Skeleton className="ml-auto h-3.5 w-20 bg-(--admin-hover)" />
                                    </td>
                                    <td className="px-4 py-3">
                                        <Skeleton className="h-3.5 w-20 bg-(--admin-hover)" />
                                    </td>
                                    <td className="px-4 py-3">
                                        <Skeleton className="h-3.5 w-16 bg-(--admin-hover)" />
                                    </td>
                                    <td className="px-4 py-3">
                                        <Skeleton className="h-3.5 w-20 bg-(--admin-hover)" />
                                    </td>
                                    <td className="px-4 py-3" />
                                </tr>
                            ))
                        ) : !expenses || expenses.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="px-4 py-12 text-center"
                                >
                                    <p className="text-xs text-(--admin-text-muted)">
                                        {categoryFilter
                                            ? `No ${categoryFilter} expenses for this period`
                                            : "No expenses for this period"}
                                    </p>
                                </td>
                            </tr>
                        ) : (
                            expenses.map((expense) => (
                                <tr
                                    key={expense.id}
                                    className="admin-table-row border-b border-(--admin-border) last:border-0"
                                >
                                    <td className="px-4 py-3 text-[12px] text-(--admin-text)">
                                        {expense.description}
                                    </td>
                                    <td className="px-4 py-3 text-right font-mono text-[12px] text-(--admin-text)">
                                        {formatAmount(expense.amount)}
                                    </td>
                                    <td className="px-4 py-3 text-[12px] text-(--admin-text-secondary)">
                                        {expense.category ?? "—"}
                                    </td>
                                    <td className="px-4 py-3 text-[12px] text-(--admin-text-secondary)">
                                        {expense.recordedByName ?? "—"}
                                    </td>
                                    <td className="px-4 py-3 text-[12px] text-(--admin-text-secondary)">
                                        {formatDate(expense.recordedAt)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger className="flex size-7 shrink-0 items-center justify-center rounded-md border border-(--admin-border) text-(--admin-text-secondary) transition-colors hover:bg-(--admin-hover) hover:text-(--admin-text) cursor-pointer">
                                                <DotsThreeVerticalIcon className="size-3.5" />
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        handleEdit(expense)
                                                    }
                                                >
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        setDeletingExpense(
                                                            expense,
                                                        )
                                                    }
                                                    className="text-destructive"
                                                >
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <ExpenseBreakdown
                data={summary?.byCategory}
                isLoading={summaryLoading}
                currencySymbol={currencySymbol}
            />

            <ExpenseFormDialog
                expense={editingExpense}
                open={showFormDialog}
                onClose={handleCloseForm}
            />

            <Dialog
                open={!!deletingExpense}
                onOpenChange={(v) => !v && setDeletingExpense(null)}
            >
                <DialogContent className="max-w-sm border-(--admin-border) bg-(--admin-card)">
                    <DialogHeader>
                        <DialogTitle className="text-(--admin-text)">
                            Delete Expense
                        </DialogTitle>
                        <DialogDescription className="text-(--admin-text-secondary)">
                            Are you sure you want to delete &ldquo;
                            {deletingExpense?.description}
                            &rdquo;? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="ghost"
                            onClick={() => setDeletingExpense(null)}
                            className="text-(--admin-text-secondary)"
                            disabled={deleteMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending
                                ? "Deleting..."
                                : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ExpensesPage;
