import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format, endOfDay, startOfDay } from "date-fns";
import {
    ClipboardTextIcon,
    CaretLeftIcon,
    CaretRightIcon,
} from "@phosphor-icons/react";
import { useAdminOrders } from "@/hooks/useOrders";
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
import { toast } from "sonner";
import DateRangePicker, {
    type DateRange,
} from "@/components/admin/dashboard/DateRangePicker";
import type { Order, OrderStatus } from "@/types/order";
import {
    ORDER_STATUSES,
    statusBadgeConfig,
    diningLabel,
} from "@/components/admin/orders/order-constants";
import OrderDetailModal from "@/components/admin/orders/OrderDetailModal";

const PAGE_SIZE = 20;

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

    const { data: response, isLoading } = useAdminOrders({
        status: statusFilter || undefined,
        created_by_id: employeeFilter || undefined,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
        from: fromStr,
        to: toStr,
    });
    const orders = response?.data ?? [];
    const totalPages = response?.pagination?.totalPages ?? 0;
    const total = response?.pagination?.total ?? 0;
    const { data: employees } = useEmployees();

    const completeMutation = useCompleteOrder();

    const hasNextPage = page + 1 < totalPages;

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
                        aria-label="Filter by status"
                        className="h-7 max-md:min-h-[44px] w-36 border-(--admin-border) bg-(--admin-card) text-xs"
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
                        aria-label="Filter by employee"
                        className="h-7 max-md:min-h-[44px] w-44 border-(--admin-border) bg-(--admin-card) text-xs"
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
                                <th className="px-4 py-2.5 text-left text-[10px] font-medium text-(--admin-text-muted)">
                                    Order #
                                </th>
                                <th className="px-4 py-2.5 text-center text-[10px] font-medium text-(--admin-text-muted)">
                                    Status
                                </th>
                                <th className="px-4 py-2.5 text-left text-[10px] font-medium text-(--admin-text-muted)">
                                    Type
                                </th>
                                <th className="px-4 py-2.5 text-center text-[10px] font-medium text-(--admin-text-muted)">
                                    Items
                                </th>
                                <th className="px-4 py-2.5 text-right text-[10px] font-medium text-(--admin-text-muted)">
                                    Total
                                </th>
                                <th className="px-4 py-2.5 text-left text-[10px] font-medium text-(--admin-text-muted)">
                                    Created By
                                </th>
                                <th className="px-4 py-2.5 text-left text-[10px] font-medium text-(--admin-text-muted)">
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
                            ) : orders.length === 0 ? (
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
                                            <p className="text-[11px] text-(--admin-text-muted)/70">
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
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" || e.key === " ") {
                                                    e.preventDefault();
                                                    setSelectedOrder(order);
                                                }
                                            }}
                                            tabIndex={0}
                                            role="button"
                                            aria-label={`View order #${order.receiptNumber}`}
                                            className="admin-table-row cursor-pointer transition-colors hover:bg-(--admin-hover) focus-visible:outline-2 focus-visible:outline-(--admin-primary) focus-visible:-outline-offset-2"
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
                    {total} orders · Page {page + 1} of {totalPages || 1}
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

            <OrderDetailModal
                order={selectedOrder}
                open={selectedOrder !== null}
                onClose={() => setSelectedOrder(null)}
            />
        </div>
    );
};

export default OrdersPage;
