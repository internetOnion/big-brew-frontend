import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
    PlusIcon,
    MagnifyingGlassIcon,
    ClipboardTextIcon,
    UsersIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import {
    useEmployees,
    useDeactivateEmployee,
    useReactivateEmployee,
} from "@/hooks/useEmployees";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import StatusFilterTabs from "@/components/admin/employees/StatusFilterTabs";
import type { StatusFilter } from "@/components/admin/employees/StatusFilterTabs";
import EmployeeCard from "@/components/admin/employees/EmployeeCard";
import CreateEmployeeDialog from "@/components/admin/employees/CreateEmployeeDialog";
import ResetPinDialog from "@/components/admin/employees/ResetPinDialog";
import EmployeeDetailPanel from "@/components/admin/employees/EmployeeDetailPanel";
import OrderDetailModal from "@/components/admin/orders/OrderDetailModal";
import type { AdminEmployee } from "@/types/admin";
import type { Order } from "@/types/order";

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
];

const ROLES = [
    { value: "", label: "All Roles" },
    { value: "barista", label: "Barista" },
    { value: "manager", label: "Manager" },
    { value: "owner", label: "Owner" },
] as const;

const EmployeesPage = () => {
    const { data: employees, isLoading } = useEmployees();
    const deactivateEmployee = useDeactivateEmployee();
    const reactivateEmployee = useReactivateEmployee();

    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

    const [selectedEmployee, setSelectedEmployee] =
        useState<AdminEmployee | null>(null);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [resetPinEmployee, setResetPinEmployee] =
        useState<AdminEmployee | null>(null);
    const [detailOrder, setDetailOrder] = useState<Order | null>(null);

    const filteredEmployees = useMemo(() => {
        if (!employees) return [];
        return employees.filter((emp) => {
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                const matchesName = emp.name.toLowerCase().includes(q);
                const matchesEmail = emp.email?.toLowerCase().includes(q);
                if (!matchesName && !matchesEmail) return false;
            }
            if (roleFilter && emp.role !== roleFilter) return false;
            const isActive = emp.isActive !== false;
            if (statusFilter === "active" && !isActive) return false;
            if (statusFilter === "inactive" && isActive) return false;
            return true;
        });
    }, [employees, searchQuery, roleFilter, statusFilter]);

    const handleToggleStatus = (employee: AdminEmployee) => {
        const isActive = employee.isActive !== false;
        if (isActive) {
            deactivateEmployee.mutate(employee.id, {
                onSuccess: () =>
                    toast.success(`${employee.name} deactivated`),
                onError: () => toast.error("Failed to deactivate"),
            });
        } else {
            reactivateEmployee.mutate(employee.id, {
                onSuccess: () =>
                    toast.success(`${employee.name} reactivated`),
                onError: () => toast.error("Failed to reactivate"),
            });
        }
    };

    const handleResetPin = (employee: AdminEmployee) => {
        setResetPinEmployee(employee);
    };

    const handleOrderClick = (order: Order) => {
        setDetailOrder(order);
    };

    const hasDetailPanel = selectedEmployee !== null;

    return (
        <div className="flex h-full flex-col">
            {/* Header */}
            <div className="shrink-0 space-y-3 p-5 pb-3">
                <div className="flex flex-wrap items-center gap-2">
                    <h1 className="flex items-center gap-2 text-[13px] font-medium text-(--admin-primary)">
                        <UsersIcon className="size-4" />
                        Employees
                    </h1>

                    {employees && (
                        <span className="rounded-full border border-(--admin-border) bg-(--admin-hover) px-2 py-0.5 font-mono text-[10px] text-(--admin-text-muted)">
                            {employees.length}
                        </span>
                    )}

                    <div className="ml-auto flex items-center gap-2">
                        <div className="relative">
                            <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-(--admin-text-muted)" />
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search name or email..."
                                className="h-7.5 w-44 border-(--admin-border) bg-(--admin-card) pl-7.5 text-[11px] placeholder:text-[10px]"
                            />
                        </div>

                        <Select
                            value={roleFilter}
                            onValueChange={(v) => setRoleFilter(v ?? "")}
                        >
                            <SelectTrigger
                                size="sm"
                                className="h-7.5 w-28 border-(--admin-border) bg-(--admin-card) text-[11px]"
                            >
                                <SelectValue placeholder="All Roles">
                                    {(val) =>
                                        val
                                            ? (ROLES.find((r) => r.value === val)
                                                  ?.label ?? val)
                                            : "All Roles"
                                    }
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {ROLES.map((r) => (
                                    <SelectItem key={r.value} value={r.value}>
                                        {r.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Button
                            onClick={() => setCreateDialogOpen(true)}
                            size="xs"
                            className="gap-1.5 bg-(--admin-primary) text-white hover:bg-[#3a1d0e]"
                        >
                            <PlusIcon className="size-3.5" />
                            Add
                        </Button>
                    </div>
                </div>

                <StatusFilterTabs
                    tabs={STATUS_TABS}
                    value={statusFilter}
                    onChange={setStatusFilter}
                />
            </div>

            {/* Content */}
            <div className="flex flex-1 overflow-hidden min-h-0">
                {/* Employee list */}
                <div
                    onClick={() => setSelectedEmployee(null)}
                    className={cn(
                        "flex-1 overflow-auto p-5 pt-0",
                        hasDetailPanel && "hidden lg:block",
                    )}
                >
                    {isLoading ? (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="rounded-xl border border-(--admin-border) bg-(--admin-card) p-4"
                                >
                                    <div className="flex items-start gap-3">
                                        <Skeleton className="size-10 shrink-0 rounded-full" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-4 w-24" />
                                            <Skeleton className="h-3 w-32" />
                                        </div>
                                    </div>
                                    <div className="mt-3 flex items-center gap-2">
                                        <Skeleton className="h-5 w-14 rounded-full" />
                                        <Skeleton className="h-3 w-12" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredEmployees.length === 0 ? (
                        <div className="flex h-full items-center justify-center">
                            <div className="flex flex-col items-center gap-1.5">
                                <ClipboardTextIcon className="size-5 text-(--admin-text-muted)" />
                                <p className="text-xs text-(--admin-text-muted)">
                                    {searchQuery || roleFilter
                                        ? "No employees match your filters"
                                        : "No employees yet"}
                                </p>
                                <p className="text-[10px] text-(--admin-text-muted)/70">
                                    {searchQuery || roleFilter
                                        ? "Try adjusting your search or filters"
                                        : 'Click "Add" to onboard your first staff'}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div
                            className={cn(
                                "grid grid-cols-1 gap-3 sm:grid-cols-2",
                                hasDetailPanel
                                    ? "xl:grid-cols-2"
                                    : "xl:grid-cols-3",
                            )}
                        >
                            {filteredEmployees.map((emp) => (
                                <EmployeeCard
                                    key={emp.id}
                                    employee={emp}
                                    isSelected={selectedEmployee?.id === emp.id}
                                    onSelect={() => setSelectedEmployee(emp)}
                                    onResetPin={() => handleResetPin(emp)}
                                    onToggleStatus={() =>
                                        handleToggleStatus(emp)
                                    }
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Detail panel (desktop) */}
                {selectedEmployee && (
                    <div className="hidden w-[400px] shrink-0 overflow-auto border-l border-(--admin-border) bg-(--admin-card) p-5 lg:block">
                        <EmployeeDetailPanel
                            employee={selectedEmployee}
                            onClose={() => setSelectedEmployee(null)}
                            onOrderClick={handleOrderClick}
                        />
                    </div>
                )}

                {/* Detail panel (mobile) */}
                {selectedEmployee && (
                    <div className="flex-1 overflow-auto bg-(--admin-card) p-5 lg:hidden">
                        <EmployeeDetailPanel
                            employee={selectedEmployee}
                            onClose={() => setSelectedEmployee(null)}
                            onOrderClick={handleOrderClick}
                        />
                    </div>
                )}
            </div>

            {/* Create employee dialog */}
            <CreateEmployeeDialog
                open={createDialogOpen}
                onClose={() => setCreateDialogOpen(false)}
            />

            {/* Reset PIN dialog */}
            <ResetPinDialog
                open={resetPinEmployee !== null}
                onClose={() => setResetPinEmployee(null)}
                employeeId={resetPinEmployee?.id ?? null}
                employeeName={resetPinEmployee?.name ?? ""}
            />

            {/* Order detail modal */}
            <OrderDetailModal
                order={detailOrder}
                open={detailOrder !== null}
                onClose={() => setDetailOrder(null)}
            />
        </div>
    );
};

export default EmployeesPage;
