import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";
import {
    ArrowLeftIcon,
    CheckCircleIcon,
    XCircleIcon,
    KeyIcon,
    EyeIcon,
    TrashIcon,
} from "@phosphor-icons/react";
import {
    useEmployees,
    useUpdateEmployee,
    useReactivateEmployee,
    useDeactivateEmployee,
    useDeleteEmployee,
    useResetEmployeePin,
} from "@/hooks/useEmployees";
import { useAdminOrders } from "@/hooks/useOrders";
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
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import OrderDetailModal from "@/components/admin/orders/OrderDetailModal";
import type { Order } from "@/types/order";

const ROLES = [
    { value: "barista", label: "Barista" },
    { value: "manager", label: "Manager" },
    { value: "owner", label: "Owner" },
] as const;

const statusBadgeVariant = (status: string) => {
    switch (status) {
        case "completed":
            return "border-(--admin-success)/30 bg-(--admin-success)/10 text-(--admin-success) text-[10px]";
        case "voided":
            return "border-destructive/30 bg-destructive/10 text-destructive text-[10px]";
        case "void_requested":
            return "border-(--admin-warning)/30 bg-(--admin-warning)/10 text-(--admin-warning) text-[10px]";
        default:
            return "border-(--admin-primary)/30 bg-(--admin-primary)/10 text-(--admin-primary) text-[10px]";
    }
};

const formatDate = (dateString: string) => {
    try {
        return format(new Date(dateString), "MMM d, yyyy");
    } catch {
        return dateString;
    }
};

const formatTime = (dateString: string) => {
    try {
        return format(new Date(dateString), "h:mm a");
    } catch {
        return "";
    }
};

const EmployeeDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: employees, isLoading } = useEmployees();
    const updateMutation = useUpdateEmployee();
    const deactivateMutation = useDeactivateEmployee();
    const reactivateMutation = useReactivateEmployee();
    const deleteMutation = useDeleteEmployee();
    const resetPinMutation = useResetEmployeePin();

    const employee = employees?.find((e) => e.id === id);

    const [name, setName] = useState("");
    const [role, setRole] = useState("barista");
    const [newPin, setNewPin] = useState("");
    const [detailOrder, setDetailOrder] = useState<Order | null>(null);
    const [showToggleDialog, setShowToggleDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    useEffect(() => {
        if (!employee) return;
        setName(employee.name);
        setRole(employee.role);
    }, [employee]);

    const { data: ordersResponse, isLoading: ordersLoading } = useAdminOrders({
        created_by_id: id,
        limit: 50,
        offset: 0,
    });
    const orders = ordersResponse?.data ?? [];

    if (!id) {
        navigate("/admin/employees");
        return null;
    }

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center text-sm text-(--admin-text-muted)">
                Loading...
            </div>
        );
    }

    if (!employee) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 py-20">
                <p className="text-sm text-(--admin-text-muted)">
                    Employee not found
                </p>
                <Button
                    variant="ghost"
                    onClick={() => navigate("/admin/employees")}
                    className="text-xs text-(--admin-text-secondary)"
                >
                    Back to Employees
                </Button>
            </div>
        );
    }

    const isActive = employee.isActive !== false;

    const completedOrders = orders.filter(
        (o) => o.status === "completed",
    ).length;
    const voidedOrders = orders.filter(
        (o) => o.status === "voided" || o.status === "void_requested",
    ).length;

    const handleSave = async () => {
        if (!name.trim()) return;
        try {
            await updateMutation.mutateAsync({
                id,
                name: name.trim(),
                role: role as "barista" | "manager" | "owner",
            });
            toast.success("Employee updated");
        } catch {
            // error handled by hook
        }
    };

    const handleToggleStatus = () => {
        setShowToggleDialog(true);
    };

    const handleConfirmToggle = () => {
        setShowToggleDialog(false);
        if (isActive) {
            deactivateMutation.mutate(id);
        } else {
            reactivateMutation.mutate(id);
        }
    };

    const handleDelete = () => {
        setShowDeleteDialog(false);
        deleteMutation.mutate(id, {
            onSuccess: () => navigate("/admin/employees"),
        });
    };

    const handleResetPin = () => {
        if (newPin.length < 4) {
            toast.error("PIN must be at least 4 digits");
            return;
        }
        resetPinMutation.mutate(
            { id, pin: newPin },
            {
                onSuccess: () => {
                    toast.success(`PIN updated for ${employee.name}`);
                    setNewPin("");
                },
                onError: () => toast.error("Failed to reset PIN"),
            },
        );
    };

    return (
        <div className="flex flex-col gap-5 p-5">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => navigate("/admin/employees")}
                    className="text-(--admin-text-muted) hover:text-(--admin-text)"
                >
                    <ArrowLeftIcon className="size-4" />
                </Button>
                <h1 className="text-[13px] font-medium text-(--admin-primary)">
                    {employee.name}
                </h1>
                <Badge
                    variant="outline"
                    className="text-[10px] border-(--admin-border) bg-(--admin-hover) text-(--admin-text-secondary) capitalize"
                >
                    {employee.role}
                </Badge>
                <span
                    className={`text-[10px] font-medium ${isActive ? "text-(--admin-success)" : "text-(--admin-text-muted)"}`}
                >
                    {isActive ? "Active" : "Inactive"}
                </span>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
                {/* Left column: Edit form + PIN */}
                <div className="flex flex-col gap-5">
                    {/* Basic Info */}
                    <div className="rounded-lg border border-(--admin-border) bg-(--admin-card) p-4">
                        <h2 className="mb-3 text-[11px] font-medium uppercase tracking-wide text-(--admin-text-secondary)">
                            Edit Details
                        </h2>
                        <div className="flex flex-col gap-3">
                            <div className="grid gap-1.5">
                                <Label htmlFor="detail-name" className="text-[11px] text-(--admin-text-secondary)">
                                    Name
                                </Label>
                                <Input
                                    id="detail-name"
                                    onChange={(e) => setName(e.target.value)}
                                    className="h-8 border-(--admin-border) bg-(--admin-card) text-xs"
                                />
                            </div>
                            <div className="grid gap-1.5">
                                <Label className="text-[11px] text-(--admin-text-secondary)">
                                    Role
                                </Label>
                                <Select
                                    value={role}
                                    onValueChange={(v) =>
                                        setRole(v ?? "barista")
                                    }
                                >
                                    <SelectTrigger className="h-8 border-(--admin-border) bg-(--admin-card) text-xs">
                                        <SelectValue>
                                            {(val) =>
                                                ROLES.find(
                                                    (r) => r.value === val,
                                                )?.label ?? val
                                            }
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ROLES.map((r) => (
                                            <SelectItem
                                                key={r.value}
                                                value={r.value}
                                            >
                                                {r.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {employee.email && (
                                <div className="grid gap-1.5">
                                    <Label className="text-[11px] text-(--admin-text-muted)">
                                        Email
                                    </Label>
                                    <p className="text-[12px] text-(--admin-text-secondary)">
                                        {employee.email}
                                    </p>
                                </div>
                            )}
                            <div className="flex flex-wrap items-center gap-2 pt-1">
                                <Button
                                    onClick={handleSave}
                                    disabled={updateMutation.isPending}
                                    className="h-8 bg-(--admin-primary) text-xs text-white hover:bg-[#3a1d0e]"
                                >
                                    {updateMutation.isPending
                                        ? "Saving..."
                                        : "Save Changes"}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleToggleStatus}
                                    disabled={
                                        isActive
                                            ? deactivateMutation.isPending
                                            : reactivateMutation.isPending
                                    }
                                    className={`h-8 text-xs ${isActive ? "border-destructive/30 text-destructive hover:bg-destructive/10" : "border-(--admin-success)/30 text-(--admin-success) hover:bg-(--admin-success)/10"}`}
                                >
                                    {isActive ? "Deactivate" : "Reactivate"}
                                </Button>
                                {employee.role !== "owner" && (
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            setShowDeleteDialog(true)
                                        }
                                        disabled={deleteMutation.isPending}
                                        className="h-8 border-destructive/30 text-xs text-destructive hover:bg-destructive/10"
                                    >
                                        <TrashIcon className="size-3" />
                                        Delete
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Reset PIN */}
                    <div className="rounded-lg border border-(--admin-border) bg-(--admin-card) p-4">
                        <h2 className="mb-3 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-(--admin-text-secondary)">
                            <KeyIcon className="size-3" />
                            Reset PIN
                        </h2>
                        <div className="flex flex-col gap-3">
                            <div className="grid gap-1.5">
                                <Label htmlFor="detail-new-pin" className="text-[11px] text-(--admin-text-secondary)">
                                    New PIN (4-6 digits)
                                </Label>
                                <Input
                                    id="detail-new-pin"
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={newPin}
                                    onChange={(e) =>
                                        setNewPin(
                                            e.target.value
                                                .replace(/\D/g, "")
                                                .slice(0, 6),
                                        )
                                    }
                                    placeholder="0000"
                                    className="h-8 w-36 border-(--admin-border) bg-(--admin-card) font-mono text-xs tracking-widest"
                                />
                            </div>
                            <Button
                                onClick={handleResetPin}
                                disabled={!newPin || resetPinMutation.isPending}
                                variant="outline"
                                className="h-8 border-(--admin-border) text-xs text-(--admin-text-secondary)"
                            >
                                {resetPinMutation.isPending
                                    ? "Saving..."
                                    : "Save PIN"}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Right column: Order history */}
                <div>
                    <div className="rounded-lg border border-(--admin-border) bg-(--admin-card) p-4">
                        <h2 className="mb-3 text-[11px] font-medium uppercase tracking-wide text-(--admin-text-secondary)">
                            Order History
                        </h2>

                        {/* Summary chips */}
                        <div className="mb-4 flex gap-3">
                            <div className="flex items-center gap-1.5 rounded-full border border-(--admin-success)/30 bg-(--admin-success)/10 px-3 py-1">
                                <CheckCircleIcon className="size-3 text-(--admin-success)" />
                                <span className="text-[10px] text-(--admin-success)">
                                    {completedOrders} completed
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1">
                                <XCircleIcon className="size-3 text-destructive" />
                                <span className="text-[10px] text-destructive">
                                    {voidedOrders} voided
                                </span>
                            </div>
                        </div>

                        {ordersLoading ? (
                            <div className="flex h-32 items-center justify-center text-xs text-(--admin-text-muted)">
                                Loading...
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="flex h-32 items-center justify-center text-xs text-(--admin-text-muted)">
                                No orders yet
                            </div>
                        ) : (
                            <div className="max-h-[500px] overflow-y-auto">
                                <div className="divide-y divide-(--admin-border) rounded-md border border-(--admin-border)">
                                    {orders.map((order) => (
                                        <button
                                            key={order.id}
                                            onClick={() =>
                                                setDetailOrder(order)
                                            }
                                            className="flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-(--admin-hover)"
                                        >
                                            <span className="shrink-0 font-mono text-[11px] font-medium text-(--admin-primary)">
                                                #
                                                {order.receiptNumber ||
                                                    order.orderNumber}
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="truncate text-[11px] text-(--admin-text)">
                                                        {order.items
                                                            ?.map((i) => i.name)
                                                            .join(", ") || "—"}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] text-(--admin-text-muted)">
                                                    {formatDate(
                                                        order.createdAt,
                                                    )}{" "}
                                                    {formatTime(
                                                        order.createdAt,
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex shrink-0 items-center gap-2">
                                                <span className="font-mono text-[11px] font-medium text-(--admin-text)">
                                                    ${order.total}
                                                </span>
                                                <Badge
                                                    variant="outline"
                                                    className={statusBadgeVariant(
                                                        order.status,
                                                    )}
                                                >
                                                    {order.status.replace(
                                                        /_/g,
                                                        " ",
                                                    )}
                                                </Badge>
                                            </div>
                                            <EyeIcon className="size-3 shrink-0 text-(--admin-text-muted)" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Order detail modal */}
            <OrderDetailModal
                order={detailOrder}
                open={detailOrder !== null}
                onClose={() => setDetailOrder(null)}
            />

            <Dialog
                open={showToggleDialog}
                onOpenChange={(v) => !v && setShowToggleDialog(false)}
            >
                <DialogContent className="max-w-sm border-(--admin-border) bg-(--admin-card)">
                    <DialogHeader>
                        <DialogTitle className="text-(--admin-text)">
                            {isActive ? "Deactivate" : "Reactivate"} Employee
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-xs text-(--admin-text-secondary)">
                        Are you sure you want to{" "}
                        {isActive ? "deactivate" : "reactivate"}{" "}
                        <span className="font-medium text-(--admin-text)">
                            {employee.name}
                        </span>
                        ?
                    </p>
                    <DialogFooter>
                        <Button
                            variant="ghost"
                            onClick={() => setShowToggleDialog(false)}
                            className="text-(--admin-text-secondary)"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirmToggle}
                            className={
                                isActive
                                    ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    : "bg-(--admin-success) text-white hover:bg-(--admin-success)/80"
                            }
                        >
                            {isActive ? "Deactivate" : "Reactivate"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={showDeleteDialog}
                onOpenChange={(v) => !v && setShowDeleteDialog(false)}
            >
                <DialogContent className="max-w-sm border-(--admin-border) bg-(--admin-card)">
                    <DialogHeader>
                        <DialogTitle className="text-(--admin-text)">
                            Delete Employee
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-xs text-(--admin-text-secondary)">
                        Are you sure you want to permanently delete{" "}
                        <span className="font-medium text-(--admin-text)">
                            {employee.name}
                        </span>
                        ? This action cannot be undone.
                    </p>
                    <DialogFooter>
                        <Button
                            variant="ghost"
                            onClick={() => setShowDeleteDialog(false)}
                            className="text-(--admin-text-secondary)"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default EmployeeDetailPage;
