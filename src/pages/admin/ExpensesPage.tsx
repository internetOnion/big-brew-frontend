import { useState } from "react";
import { Link } from "react-router-dom";
import { endOfDay, format } from "date-fns";
import { toast } from "sonner";
import {
    DotsThreeVerticalIcon,
    DownloadSimpleIcon,
    ReceiptIcon,
    PlusCircleIcon,
    GearSixIcon,
} from "@phosphor-icons/react";
import {
    useExpenses,
    useExpenseSummary,
    useDeleteExpense,
} from "@/hooks/useExpenses";
import { useExpenseCategories } from "@/hooks/useExpenseCategories";
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
import type { Expense } from "@/types/admin";

const PAGE_SIZE = 20;

const ExpensesPage = () => {
    const [dateRange, setDateRange] = useState<DateRange>({
        from: new Date(),
        to: endOfDay(new Date()),
    });
    const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [deletingExpense, setDeletingExpense] = useState<Expense | null>(
        null,
    );

    const fromStr = format(dateRange.from, "yyyy-MM-dd'T'HH:mm:ss'Z'");
    const toStr = format(dateRange.to, "yyyy-MM-dd'T'HH:mm:ss'Z'");
    const offset = (page - 1) * PAGE_SIZE;

    const { data: paginated, isLoading } = useExpenses({
        from: fromStr,
        to: toStr,
        ...(categoryFilter ? { category: categoryFilter } : {}),
        limit: PAGE_SIZE,
        offset,
    });

    const expenses = paginated?.data ?? [];
    const pagination = paginated?.pagination;

    const { data: summary, isLoading: summaryLoading } = useExpenseSummary(
        fromStr,
        toStr,
    );
    const { data: categories } = useExpenseCategories();
    const { data: settings } = useSettings();
    const deleteMutation = useDeleteExpense();

    const currencySymbol = settings?.currencySymbol ?? "$";

    const totalPages = pagination?.totalPages ?? 1;

    const handleEdit = (expense: Expense) => {
        setEditingExpense(expense);
    };

    const handleCloseEdit = () => {
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

    const handleExport = () => {
        if (!expenses.length) return;
        const headers = [
            "Description",
            "Amount",
            "Category",
            "Recorded By",
            "Date",
        ];
        const rows = expenses.map((e) => [
            e.description,
            e.amount,
            e.category ?? "",
            e.recordedByName ?? "",
            format(new Date(e.recordedAt), "yyyy-MM-dd"),
        ]);
        const csv = [headers, ...rows]
            .map((r) =>
                r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","),
            )
            .join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `expenses-${format(dateRange.from, "yyyy-MM-dd")}-to-${format(dateRange.to, "yyyy-MM-dd")}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const formatDate = (dateStr: string) => {
        try {
            return format(new Date(dateStr), "MMM d, yyyy");
        } catch {
            return "—";
        }
    };

    const formatAmount = (amount: string) => {
        const num = parseFloat(amount);
        if (isNaN(num)) return `${currencySymbol}0.00`;
        return `${currencySymbol}${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return (
        <div className="flex flex-col gap-4 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-[13px] font-medium text-(--admin-primary)">
                    Expenses
                </h1>
                <div className="flex items-center gap-3">
                    <DateRangePicker
                        value={dateRange}
                        onChange={(r) => {
                            setDateRange(r);
                            setPage(1);
                        }}
                    />
                    <Link to="/admin/expenses/new">
                        <Button
                            size="sm"
                            className="bg-(--admin-primary) text-white hover:bg-(--admin-primary)/80"
                        >
                            <PlusCircleIcon
                                className="size-3.5"
                                data-icon="inline-start"
                            />
                            Add Expense
                        </Button>
                    </Link>
                </div>
            </div>

            <ExpenseSummaryCards
                summary={summary}
                isLoading={summaryLoading}
                currencySymbol={currencySymbol}
            />

            <ExpenseBreakdown
                data={summary?.byCategory}
                isLoading={summaryLoading}
                currencySymbol={currencySymbol}
            />

            <div className="flex flex-wrap items-center gap-3">
                <Select
                    value={categoryFilter ?? "all"}
                    onValueChange={(v) => {
                        setCategoryFilter(v === "all" ? null : v);
                        setPage(1);
                    }}
                >
                    <SelectTrigger className="h-7 w-[160px] border-(--admin-border) bg-(--admin-card) text-xs">
                        <SelectValue>{categoryFilter ?? "All Categories"}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories?.map((cat) => (
                            <SelectItem key={cat.id} value={cat.name}>
                                {cat.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <div className="ml-auto flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExport}
                        disabled={expenses.length === 0}
                        className="h-7 border-(--admin-border) bg-(--admin-card) text-[11px] text-(--admin-text-secondary) hover:bg-(--admin-hover)"
                    >
                        <DownloadSimpleIcon
                            className="size-3"
                            data-icon="inline-start"
                        />
                        Export
                    </Button>
                    <Link to="/admin/expenses/categories">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-7 border-(--admin-border) bg-(--admin-card) text-[11px] text-(--admin-text-secondary) hover:bg-(--admin-hover)"
                        >
                            <GearSixIcon
                                className="size-3"
                                data-icon="inline-start"
                            />
                            Categories
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="admin-card overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-(--admin-border) text-[11px] font-medium uppercase tracking-wide text-(--admin-text-muted)">
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
                        ) : !expenses.length ? (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="px-4 py-16 text-center"
                                >
                                    <div className="flex flex-col items-center gap-2">
                                        <ReceiptIcon className="size-8 text-(--admin-text-muted)" />
                                        <p className="text-xs font-medium text-(--admin-text-secondary)">
                                            {categoryFilter
                                                ? "No matching expenses"
                                                : "No expenses yet"}
                                        </p>
                                        <p className="text-[11px] text-(--admin-text-muted)">
                                            {categoryFilter
                                                ? "Try adjusting your filters or date range."
                                                : "Add your first expense to start tracking spending."}
                                        </p>
                                        {!categoryFilter && (
                                            <Link to="/admin/expenses/new">
                                                <Button
                                                    size="sm"
                                                    className="mt-1 bg-(--admin-primary) text-white hover:bg-(--admin-primary)/80"
                                                >
                                                    <PlusCircleIcon
                                                        className="size-3.5"
                                                        data-icon="inline-start"
                                                    />
                                                    Add Expense
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
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
                                            <DropdownMenuTrigger
                                                aria-label="Actions"
                                                className="flex size-7 shrink-0 items-center justify-center rounded-md border border-(--admin-border) text-(--admin-text-secondary) transition-colors hover:bg-(--admin-hover) hover:text-(--admin-text) cursor-pointer"
                                            >
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
                {totalPages > 1 && !isLoading && expenses.length > 0 && (
                    <div className="flex items-center justify-between border-t border-(--admin-border) px-4 py-2.5">
                        <span className="text-[11px] text-(--admin-text-muted)">
                            {pagination?.total ?? 0} expenses
                        </span>
                        <div className="flex items-center gap-1.5">
                            <Button
                                variant="outline"
                                size="xs"
                                onClick={() =>
                                    setPage((p) => Math.max(1, p - 1))
                                }
                                disabled={page <= 1}
                                className="h-6 border-(--admin-border) bg-(--admin-card) text-[11px] text-(--admin-text-secondary)"
                            >
                                Previous
                            </Button>
                            <span className="text-[11px] tabular-nums text-(--admin-text-secondary) px-1">
                                {page} of {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="xs"
                                onClick={() =>
                                    setPage((p) => Math.min(totalPages, p + 1))
                                }
                                disabled={page >= totalPages}
                                className="h-6 border-(--admin-border) bg-(--admin-card) text-[11px] text-(--admin-text-secondary)"
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <ExpenseFormDialog
                expense={editingExpense}
                open={!!editingExpense}
                onClose={handleCloseEdit}
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
