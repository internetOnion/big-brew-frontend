import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
    PlusIcon,
    MagnifyingGlassIcon,
    ClipboardTextIcon,
    ProhibitIcon,
    CheckCircleIcon,
    DotsThreeVerticalIcon,
    PencilSimpleIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useEmployees, useDeleteEmployee } from "@/hooks/useEmployees";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
type StatusFilter = "all" | "active" | "inactive";
import type { AdminEmployee } from "@/types/admin";

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "All Statuses" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
];

const ROLES = [
    { value: "", label: "All Roles" },
    { value: "barista", label: "Barista" },
    { value: "manager", label: "Manager" },
    { value: "owner", label: "Owner" },
] as const;

const roleBadge = (role: string) => {
    switch (role) {
        case "owner":
            return "border-(--admin-primary)/30 bg-(--admin-primary)/10 text-(--admin-primary)";
        case "manager":
            return "border-amber-200 bg-amber-50 text-amber-700";
        default:
            return "border-(--admin-border) bg-(--admin-hover) text-(--admin-text-secondary)";
    }
};

const EmployeesPage = () => {
    const navigate = useNavigate();
    const { data: employees, isLoading } = useEmployees();
    const deleteEmployee = useDeleteEmployee();

    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [confirmDialogEmployee, setConfirmDialogEmployee] =
        useState<AdminEmployee | null>(null);

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
            return true;
        });
    }, [employees, searchQuery, roleFilter, statusFilter]);
    const handleToggleStatus = (
        e: React.MouseEvent,
        employee: AdminEmployee,
    ) => {
        e.stopPropagation();
        setConfirmDialogEmployee(employee);
    };

    const handleConfirmToggle = () => {
        if (!confirmDialogEmployee) return;
        const employee = confirmDialogEmployee;
        setConfirmDialogEmployee(null);
        const isActive = employee.isActive !== false;
        if (isActive) {
            deactivateEmployee.mutate(employee.id, {
                onSuccess: () => toast.success(`${employee.name} deactivated`),
                onError: () => toast.error("Failed to deactivate"),
            });
        } else {
            reactivateEmployee.mutate(employee.id, {
                onSuccess: () => toast.success(`${employee.name} reactivated`),
                onError: () => toast.error("Failed to reactivate"),
            });
        }
    };
    const isLoadingRows = () => (
        <tr>
            <td
                colSpan={6}
                className="px-4 py-8 text-center text-xs text-(--admin-text-muted)"
            >
                Loading...
            </td>
        </tr>
    );

    const emptyRows = () => (
        <tr>
            <td colSpan={6} className="px-4 py-10 text-center">
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
            </td>
        </tr>
    );

    return (
        <div className="flex flex-col gap-4 p-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-[13px] font-medium text-(--admin-primary)">
                    Employees
                </h1>

                <Button
                    size="sm"
                    onClick={() => navigate("/admin/employees/new")}
                    className="h-7 gap-1.5 bg-(--admin-primary) text-[11px] text-white hover:bg-[#3a1d0e] cursor-pointer"
                >
                    <PlusIcon className="size-3" />
                    Add
                </Button>
            </div>

            {/* Filters row */}
            <div className="flex items-center gap-2">
                <Select
                    value={roleFilter}
                    onValueChange={(v) => setRoleFilter(v ?? "")}
                >
                    <SelectTrigger
                        size="sm"
                        className="h-7 w-28 border-(--admin-border) bg-(--admin-card) text-xs"
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

                <div className="flex gap-0.5 rounded-md bg-(--admin-hover) p-0.5">
                    {STATUS_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => setStatusFilter(opt.value)}
                            className={`h-6 rounded-md px-2 text-xs font-medium cursor-pointer transition-colors duration-150 ${
                                statusFilter === opt.value
                                    ? "bg-(--admin-card) font-medium text-(--admin-primary) shadow-sm"
                                    : "text-(--admin-text-muted) hover:text-(--admin-text-secondary)"
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                <div className="relative ml-auto">
                    <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-(--admin-text-muted)" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search..."
                        className="h-7 w-44 border-(--admin-border) bg-(--admin-card) pl-8 text-xs placeholder:text-xs"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="admin-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-(--admin-border) bg-(--admin-hover)">
                                <th className="px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-wide text-(--admin-text-muted)">
                                    Name
                                </th>
                                <th className="px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-wide text-(--admin-text-muted)">
                                    Role
                                </th>
                                <th className="px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-wide text-(--admin-text-muted)">
                                    Email
                                </th>
                                <th className="px-4 py-2.5 text-center text-[10px] font-medium uppercase tracking-wide text-(--admin-text-muted)">
                                    Status
                                </th>
                                <th className="w-32 px-2 py-2.5 text-right text-[10px] font-medium uppercase tracking-wide text-(--admin-text-muted)">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-(--admin-border)">
                            {isLoading
                                ? isLoadingRows()
                                : !filteredEmployees ||
                                    filteredEmployees.length === 0
                                  ? emptyRows()
                                  : filteredEmployees.map((emp) => {
                                        const isActive = emp.isActive !== false;
                                        return (
                                            <tr
                                                key={emp.id}
                                                onClick={() =>
                                                    navigate(
                                                        `/admin/employees/${emp.id}`,
                                                    )
                                                }
                                                className="admin-table-row cursor-pointer transition-colors hover:bg-(--admin-hover)"
                                            >
                                                <td className="px-4 py-2.5 text-[12px] font-medium text-(--admin-text)">
                                                    {emp.name}
                                                </td>
                                                <td className="px-4 py-2.5">
                                                    <Badge
                                                        variant="outline"
                                                        className={cn(
                                                            "text-[10px] capitalize",
                                                            roleBadge(emp.role),
                                                        )}
                                                    >
                                                        {emp.role}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-2.5 font-mono text-[11px] text-(--admin-text-secondary)">
                                                    {emp.email || "—"}
                                                </td>
                                                <td className="px-4 py-2.5 text-center">
                                                    <span
                                                        className={cn(
                                                            "text-[10px] font-medium",
                                                            isActive
                                                                ? "text-emerald-600"
                                                                : "text-(--admin-text-muted)",
                                                        )}
                                                    >
                                                        {isActive
                                                            ? "Active"
                                                            : "Inactive"}
                                                    </span>
                                                </td>
                                                <td className="px-2 py-2.5 text-right">
                                                    <div
                                                        className="flex justify-end"
                                                        onClick={(e) =>
                                                            e.stopPropagation()
                                                        }
                                                    >
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger className="flex size-7 shrink-0 items-center justify-center rounded-md border border-(--admin-border) text-(--admin-text-secondary) transition-colors hover:bg-(--admin-hover) hover:text-(--admin-text) cursor-pointer">
                                                                <DotsThreeVerticalIcon className="size-4" />
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent
                                                                align="end"
                                                                sideOffset={4}
                                                                className="border-(--admin-border) bg-(--admin-card)"
                                                            >
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        navigate(
                                                                            `/admin/employees/${emp.id}`,
                                                                        )
                                                                    }
                                                                >
                                                                    <PencilSimpleIcon className="size-4" />
                                                                    Edit
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    variant="destructive"
                                                                    onClick={() =>
                                                                        handleToggleStatus(
                                                                            {
                                                                                stopPropagation:
                                                                                    () => {},
                                                                            } as React.MouseEvent,
                                                                            emp,
                                                                        )
                                                                    }
                                                                >
                                                                    {isActive ? (
                                                                        <ProhibitIcon className="size-4" />
                                                                    ) : (
                                                                        <CheckCircleIcon className="size-4" />
                                                                    )}
                                                                    {isActive
                                                                        ? "Deactivate"
                                                                        : "Reactivate"}
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                        </tbody>
                    </table>
                </div>
            </div>

            <Dialog
                open={confirmDialogEmployee !== null}
                onOpenChange={(v) => !v && setConfirmDialogEmployee(null)}
            >
                <DialogContent className="max-w-sm border-(--admin-border) bg-(--admin-card)">
                    <DialogHeader>
                        <DialogTitle className="text-(--admin-text)">
                            {confirmDialogEmployee?.isActive !== false
                                ? "Deactivate"
                                : "Reactivate"}{" "}
                            Employee
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-xs text-(--admin-text-secondary)">
                        Are you sure you want to{" "}
                        {confirmDialogEmployee?.isActive !== false
                            ? "deactivate"
                            : "reactivate"}{" "}
                        <span className="font-medium text-(--admin-text)">
                            {confirmDialogEmployee?.name}
                        </span>
                        ?
                    </p>
                    <DialogFooter>
                        <Button
                            variant="ghost"
                            onClick={() => setConfirmDialogEmployee(null)}
                            className="text-(--admin-text-secondary)"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirmToggle}
                            className={
                                confirmDialogEmployee?.isActive !== false
                                    ? "bg-red-600 text-white hover:bg-red-700"
                                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                            }
                        >
                            {confirmDialogEmployee?.isActive !== false
                                ? "Deactivate"
                                : "Reactivate"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default EmployeesPage;
