import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format, endOfDay, startOfDay } from "date-fns";
import {
    ClipboardTextIcon,
    CaretLeftIcon,
    CaretRightIcon,
} from "@phosphor-icons/react";
import {
    useAdminOrders,
    useApproveVoid,
    useRejectVoid,
} from "@/hooks/useOrders";
import { useCompleteOrder } from "@/hooks/useOrderMutations";
import { useEmployees } from "@/hooks/useEmployees";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import DateRangePicker, {
    type DateRange,
} from "@/components/admin/dashboard/DateRangePicker";
import type { Order, OrderStatus } from "@/types/order";

const PAGE_SIZE = 20;

const ORDER_STATUSES: OrderStatus[] = [
    "pending",
    "completed",
    "void_requested",
    "voided",
];

const statusBadgeConfig: Record<
    OrderStatus,
    { label: string; className: string }
> = {
    pending: {
        label: "Pending",
        className: "bg-amber-50 text-amber-700 border-amber-200",
    },
    completed: {
        label: "Completed",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    void_requested: {
        label: "Void Requested",
        className: "bg-orange-50 text-orange-700 border-orange-200",
    },
    voided: {
        label: "Voided",
        className: "bg-red-50 text-red-700 border-red-200",
    },
};

const paymentStatusConfig: Record<
    string,
    { label: string; className: string }
> = {
    pending: {
        label: "Unpaid",
        className: "bg-amber-50 text-amber-700 border-amber-200",
    },
    paid: {
        label: "Paid",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    refunded: {
        label: "Refunded",
        className: "bg-red-50 text-red-700 border-red-200",
    },
};

const diningLabel: Record<string, string> = {
    dine_in: "Dine-in",
    take_away: "Take-away",
};

const OrdersPage = () => {
    const queryClient = useQueryClient();

    const [statusFilter, setStatusFilter] = useState("");
    const [employeeFilter, setEmployeeFilter] = useState("");
    const [page, setPage] = useState(0);
    const [dateRange, setDateRange] = useState<DateRange>({
        from: startOfDay(new Date()),
        to: endOfDay(new Date()),
    });

    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [completingId, setCompletingId] = useState<string | null>(null);

    const fromStr = dateRange.from.toISOString();
    const toStr = dateRange.to.toISOString();

    const { data: orders, isLoading } = useAdminOrders({
        status: statusFilter || undefined,
        created_by_id: employeeFilter || undefined,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
        from: fromStr,
        to: toStr,
    });
    const { data: employees } = useEmployees();

    const completeMutation = useCompleteOrder();
    const approveVoidMutation = useApproveVoid();
    const rejectVoidMutation = useRejectVoid();

    const hasNextPage = (orders?.length ?? 0) >= PAGE_SIZE;

    const handleFilterChange =
        (setter: (v: string) => void) => (val: string | null) => {
            setter(val ?? "");
            setPage(0);
        };

    const handleDateRangeChange = (range: DateRange) => {
        setDateRange(range);
        setPage(0);
    };

    const handleComplete = (e: React.MouseEvent, orderId: string) => {
        e.stopPropagation();
        setCompletingId(orderId);
        completeMutation.mutate(orderId, {
            onSuccess: () => {
                toast.success("Order completed");
                queryClient.invalidateQueries({ queryKey: ["orders"] });
            },
            onError: () => toast.error("Failed to complete order"),
            onSettled: () => setCompletingId(null),
        });
    };

    const handleApproveVoid = () => {
        if (!selectedOrder) return;
        approveVoidMutation.mutate(selectedOrder.id, {
            onSuccess: () => {
                toast.success("Void approved");
                setSelectedOrder(null);
            },
            onError: () => toast.error("Failed to approve void"),
        });
    };

    const handleRejectVoid = () => {
        if (!selectedOrder) return;
        rejectVoidMutation.mutate(selectedOrder.id, {
            onSuccess: () => {
                toast.success("Void rejected");
                setSelectedOrder(null);
            },
            onError: () => toast.error("Failed to reject void"),
        });
    };

    const handleModalComplete = () => {
        if (!selectedOrder) return;
        const id = selectedOrder.id;
        setSelectedOrder(null);
        completeMutation.mutate(id, {
            onSuccess: () => {
                toast.success("Order completed");
                queryClient.invalidateQueries({ queryKey: ["orders"] });
            },
            onError: () => toast.error("Failed to complete order"),
        });
    };

    return (
        <div className="flex flex-col gap-4 p-5">
            <h1 className="text-[13px] font-medium text-(--admin-primary)">
                Orders
            </h1>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
                <Select
                    value={statusFilter}
                    onValueChange={handleFilterChange(setStatusFilter)}
                >
                    <SelectTrigger
                        size="sm"
                        className="h-8 w-36 border-(--admin-border) bg-(--admin-card) text-xs"
                    >
                        <SelectValue placeholder="All Statuses">
                            {(val) =>
                                val && val in statusBadgeConfig
                                    ? statusBadgeConfig[val as OrderStatus]
                                          .label
                                    : "All Statuses"
                            }
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">All Statuses</SelectItem>
                        {ORDER_STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                                {statusBadgeConfig[s].label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={employeeFilter}
                    onValueChange={handleFilterChange(setEmployeeFilter)}
                >
                    <SelectTrigger
                        size="sm"
                        className="h-8 w-44 border-(--admin-border) bg-(--admin-card) text-xs"
                    >
                        <SelectValue placeholder="All Employees">
                            {(val) =>
                                val
                                    ? (employees?.find((e) => e.id === val)
                                          ?.name ?? val)
                                    : "All Employees"
                            }
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">All Employees</SelectItem>
                        {employees?.map((emp) => (
                            <SelectItem key={emp.id} value={emp.id}>
                                {emp.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <DateRangePicker
                    value={dateRange}
                    onChange={handleDateRangeChange}
                />
            </div>

            {/* Table */}
            <div className="admin-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-(--admin-border) bg-(--admin-hover)">
                                <th className="px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-wide text-(--admin-text-muted)">
                                    Order #
                                </th>
                                <th className="px-4 py-2.5 text-center text-[10px] font-medium uppercase tracking-wide text-(--admin-text-muted)">
                                    Status
                                </th>
                                <th className="px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-wide text-(--admin-text-muted)">
                                    Type
                                </th>
                                <th className="px-4 py-2.5 text-center text-[10px] font-medium uppercase tracking-wide text-(--admin-text-muted)">
                                    Items
                                </th>
                                <th className="px-4 py-2.5 text-right text-[10px] font-medium uppercase tracking-wide text-(--admin-text-muted)">
                                    Total
                                </th>
                                <th className="px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-wide text-(--admin-text-muted)">
                                    Created By
                                </th>
                                <th className="px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-wide text-(--admin-text-muted)">
                                    Time
                                </th>
                                <th className="w-20 px-2 py-2.5" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-(--admin-border)">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-4 py-3">
                                            <Skeleton className="h-4 w-12" />
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <Skeleton className="mx-auto h-5 w-16 rounded-full" />
                                        </td>
                                        <td className="px-4 py-3">
                                            <Skeleton className="h-4 w-16" />
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <Skeleton className="mx-auto h-4 w-6" />
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Skeleton className="ml-auto h-4 w-14" />
                                        </td>
                                        <td className="px-4 py-3">
                                            <Skeleton className="h-4 w-20" />
                                        </td>
                                        <td className="px-4 py-3">
                                            <Skeleton className="h-4 w-24" />
                                        </td>
                                        <td className="px-2 py-3" />
                                    </tr>
                                ))
                            ) : !orders || orders.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={8}
                                        className="px-4 py-10 text-center"
                                    >
                                        <div className="flex flex-col items-center gap-1.5">
                                            <ClipboardTextIcon className="size-5 text-(--admin-text-muted)" />
                                            <p className="text-xs text-(--admin-text-muted)">
                                                {statusFilter || employeeFilter
                                                    ? "No orders match your filters"
                                                    : "No orders yet"}
                                            </p>
                                            <p className="text-[10px] text-(--admin-text-muted)/70">
                                                {statusFilter || employeeFilter
                                                    ? "Try adjusting your filters"
                                                    : "Orders will appear here"}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => {
                                    const statusCfg =
                                        statusBadgeConfig[order.status];
                                    return (
                                        <tr
                                            key={order.id}
                                            onClick={() =>
                                                setSelectedOrder(order)
                                            }
                                            className="admin-table-row cursor-pointer transition-colors hover:bg-(--admin-hover)"
                                        >
                                            <td className="px-4 py-2.5 font-mono text-[12px] font-medium text-(--admin-text)">
                                                #{order.receiptNumber}
                                            </td>
                                            <td className="px-4 py-2.5 text-center">
                                                <span
                                                    className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium ${statusCfg.className}`}
                                                >
                                                    {statusCfg.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2.5 text-[12px] text-(--admin-text-secondary)">
                                                {diningLabel[
                                                    order.diningOption
                                                ] ?? order.diningOption}
                                            </td>
                                            <td className="px-4 py-2.5 text-center font-mono text-[12px] text-(--admin-text)">
                                                {order.items.length}
                                            </td>
                                            <td className="px-4 py-2.5 text-right font-mono text-[12px] text-(--admin-text)">
                                                {order.total}
                                            </td>
                                            <td className="px-4 py-2.5 text-[12px] text-(--admin-text-secondary)">
                                                {order.createdBy.name}
                                            </td>
                                            <td className="px-4 py-2.5 text-[11px] text-(--admin-text-muted)">
                                                {format(
                                                    new Date(order.createdAt),
                                                    "MMM d, h:mm a",
                                                )}
                                            </td>
                                            <td className="px-2 py-2.5 text-right">
                                                {order.status === "pending" && (
                                                    <Button
                                                        variant="outline"
                                                        size="xs"
                                                        disabled={
                                                            completingId ===
                                                            order.id
                                                        }
                                                        onClick={(e) =>
                                                            handleComplete(
                                                                e,
                                                                order.id,
                                                            )
                                                        }
                                                        className="border-(--admin-border) text-[11px] text-(--admin-text-secondary) hover:text-(--admin-text)"
                                                    >
                                                        {completingId ===
                                                        order.id
                                                            ? "..."
                                                            : "Complete"}
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
                <p className="text-[11px] text-(--admin-text-muted)">
                    Page {page + 1}
                </p>
                <div className="flex items-center gap-1">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page === 0 || isLoading}
                        onClick={() => setPage((p) => p - 1)}
                        className="h-7 border-(--admin-border) text-[11px] text-(--admin-text-secondary)"
                    >
                        <CaretLeftIcon className="size-3.5" />
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={!hasNextPage || isLoading}
                        onClick={() => setPage((p) => p + 1)}
                        className="h-7 border-(--admin-border) text-[11px] text-(--admin-text-secondary)"
                    >
                        Next
                        <CaretRightIcon className="size-3.5" />
                    </Button>
                </div>
            </div>

            {/* Detail Modal */}
            <Dialog
                open={selectedOrder !== null}
                onOpenChange={(v) => !v && setSelectedOrder(null)}
            >
                <DialogContent
                    className="max-w-lg border-(--admin-border) bg-(--admin-card) shadow-xl"
                    showCloseButton={false}
                >
                    {selectedOrder && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-[14px] font-medium text-(--admin-text)">
                                    Order #{selectedOrder.receiptNumber}
                                </DialogTitle>
                            </DialogHeader>

                            <div className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto">
                                {/* Status badges */}
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium ${statusBadgeConfig[selectedOrder.status].className}`}
                                    >
                                        {
                                            statusBadgeConfig[
                                                selectedOrder.status
                                            ].label
                                        }
                                    </span>
                                    {selectedOrder.paymentStatus in
                                        paymentStatusConfig && (
                                        <span
                                            className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium ${paymentStatusConfig[selectedOrder.paymentStatus].className}`}
                                        >
                                            {
                                                paymentStatusConfig[
                                                    selectedOrder.paymentStatus
                                                ].label
                                            }
                                        </span>
                                    )}
                                </div>

                                {/* Info grid */}
                                <div className="grid grid-cols-2 gap-2 text-[12px]">
                                    <div>
                                        <span className="text-(--admin-text-muted)">
                                            Type
                                        </span>
                                        <p className="text-(--admin-text-secondary)">
                                            {diningLabel[
                                                selectedOrder.diningOption
                                            ] ?? selectedOrder.diningOption}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-(--admin-text-muted)">
                                            Created by
                                        </span>
                                        <p className="text-(--admin-text-secondary)">
                                            {selectedOrder.createdBy.name}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-(--admin-text-muted)">
                                            Confirmed by
                                        </span>
                                        <p className="text-(--admin-text-secondary)">
                                            {selectedOrder.confirmedBy?.name ??
                                                "—"}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-(--admin-text-muted)">
                                            Created at
                                        </span>
                                        <p className="text-(--admin-text-secondary)">
                                            {format(
                                                new Date(
                                                    selectedOrder.createdAt,
                                                ),
                                                "MMM d, yyyy h:mm a",
                                            )}
                                        </p>
                                    </div>
                                </div>

                                {/* Financials */}
                                <div className="rounded-md border border-(--admin-border) bg-(--admin-hover) p-3">
                                    <div className="flex justify-between text-[12px]">
                                        <span className="text-(--admin-text-muted)">
                                            Subtotal
                                        </span>
                                        <span className="font-mono text-(--admin-text)">
                                            {selectedOrder.subtotal}
                                        </span>
                                    </div>
                                    {parseFloat(selectedOrder.discountAmount) >
                                        0 && (
                                        <div className="mt-1 flex justify-between text-[12px]">
                                            <span className="text-(--admin-text-muted)">
                                                Discount
                                            </span>
                                            <span className="font-mono text-red-600">
                                                -{selectedOrder.discountAmount}
                                            </span>
                                        </div>
                                    )}
                                    <div className="mt-1.5 flex justify-between border-t border-(--admin-border) pt-1.5 text-[13px] font-semibold">
                                        <span className="text-(--admin-text)">
                                            Total
                                        </span>
                                        <span className="font-mono text-(--admin-primary)">
                                            {selectedOrder.total}
                                        </span>
                                    </div>
                                </div>

                                {/* Items */}
                                <div>
                                    <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-(--admin-text-muted)">
                                        Items ({selectedOrder.items.length})
                                    </p>
                                    <div className="divide-y divide-(--admin-border) rounded-md border border-(--admin-border)">
                                        {selectedOrder.items.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex items-start justify-between px-3 py-2"
                                            >
                                                <div className="min-w-0">
                                                    <p className="truncate text-[12px] font-medium text-(--admin-text)">
                                                        {item.name}
                                                    </p>
                                                    {item.modifiers.length >
                                                        0 && (
                                                        <p className="text-[10px] text-(--admin-text-muted)">
                                                            {item.modifiers
                                                                .map(
                                                                    (m) =>
                                                                        m.name,
                                                                )
                                                                .join(", ")}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="ml-3 shrink-0 text-right">
                                                    <p className="text-[12px] text-(--admin-text-secondary)">
                                                        {item.quantity} ×{" "}
                                                        {item.unitPrice}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Payments */}
                                {selectedOrder.payments.length > 0 && (
                                    <div>
                                        <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-(--admin-text-muted)">
                                            Payments
                                        </p>
                                        <div className="divide-y divide-(--admin-border) rounded-md border border-(--admin-border)">
                                            {selectedOrder.payments.map((p) => (
                                                <div
                                                    key={p.id}
                                                    className="flex items-center justify-between px-3 py-2"
                                                >
                                                    <div>
                                                        <p className="text-[12px] font-medium capitalize text-(--admin-text)">
                                                            {p.method}
                                                        </p>
                                                        <p className="text-[10px] text-(--admin-text-muted)">
                                                            {format(
                                                                new Date(
                                                                    p.createdAt,
                                                                ),
                                                                "h:mm a",
                                                            )}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[12px] text-(--admin-text-secondary)">
                                                            {p.amount}
                                                        </p>
                                                        {p.changeAmount &&
                                                            parseFloat(
                                                                p.changeAmount,
                                                            ) > 0 && (
                                                                <p className="text-[10px] text-(--admin-text-muted)">
                                                                    Change:{" "}
                                                                    {
                                                                        p.changeAmount
                                                                    }
                                                                </p>
                                                            )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Void info */}
                                {(selectedOrder.status === "void_requested" ||
                                    selectedOrder.status === "voided") && (
                                    <div className="rounded-md border border-red-200 bg-red-50 p-3">
                                        {selectedOrder.voidReason && (
                                            <p className="text-[12px] text-red-700">
                                                <span className="font-medium">
                                                    Reason:
                                                </span>{" "}
                                                {selectedOrder.voidReason}
                                            </p>
                                        )}
                                        {selectedOrder.voidRequestedBy && (
                                            <p className="mt-0.5 text-[11px] text-red-600">
                                                Requested by{" "}
                                                {
                                                    selectedOrder
                                                        .voidRequestedBy.name
                                                }
                                                {selectedOrder.voidRequestedAt &&
                                                    ` on ${format(new Date(selectedOrder.voidRequestedAt), "MMM d, h:mm a")}`}
                                            </p>
                                        )}
                                        {selectedOrder.voidApprovedBy && (
                                            <p className="mt-0.5 text-[11px] text-emerald-600">
                                                Approved by{" "}
                                                {
                                                    selectedOrder.voidApprovedBy
                                                        .name
                                                }
                                                {selectedOrder.voidApprovedAt &&
                                                    ` on ${format(new Date(selectedOrder.voidApprovedAt), "MMM d, h:mm a")}`}
                                            </p>
                                        )}
                                        {selectedOrder.voidRejectedAt && (
                                            <p className="mt-0.5 text-[11px] text-red-600">
                                                Rejected on{" "}
                                                {format(
                                                    new Date(
                                                        selectedOrder.voidRejectedAt,
                                                    ),
                                                    "MMM d, h:mm a",
                                                )}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Footer actions */}
                            {selectedOrder.status === "pending" && (
                                <DialogFooter className="border-(--admin-border) bg-(--admin-card)">
                                    <Button
                                        variant="ghost"
                                        className="text-(--admin-text-secondary)"
                                        onClick={() => setSelectedOrder(null)}
                                    >
                                        Close
                                    </Button>
                                    <Button
                                        disabled={completeMutation.isPending}
                                        onClick={handleModalComplete}
                                        className="bg-emerald-600 text-white hover:bg-emerald-700"
                                    >
                                        {completeMutation.isPending
                                            ? "Completing..."
                                            : "Mark Complete"}
                                    </Button>
                                </DialogFooter>
                            )}

                            {selectedOrder.status === "void_requested" && (
                                <DialogFooter className="border-(--admin-border) bg-(--admin-card)">
                                    <Button
                                        variant="ghost"
                                        className="text-(--admin-text-secondary)"
                                        onClick={() => setSelectedOrder(null)}
                                    >
                                        Close
                                    </Button>
                                    <Button
                                        variant="outline"
                                        disabled={rejectVoidMutation.isPending}
                                        onClick={handleRejectVoid}
                                        className="border-red-200 text-red-700 hover:bg-red-50"
                                    >
                                        {rejectVoidMutation.isPending
                                            ? "..."
                                            : "Reject Void"}
                                    </Button>
                                    <Button
                                        disabled={approveVoidMutation.isPending}
                                        onClick={handleApproveVoid}
                                        className="bg-emerald-600 text-white hover:bg-emerald-700"
                                    >
                                        {approveVoidMutation.isPending
                                            ? "..."
                                            : "Approve Void"}
                                    </Button>
                                </DialogFooter>
                            )}

                            {(selectedOrder.status === "completed" ||
                                selectedOrder.status === "voided") && (
                                <DialogFooter
                                    className="border-(--admin-border) bg-(--admin-card)"
                                    showCloseButton
                                />
                            )}
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default OrdersPage;
