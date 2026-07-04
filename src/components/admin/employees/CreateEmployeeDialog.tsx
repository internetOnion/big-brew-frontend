import { useState, useEffect } from "react";
import { toast } from "sonner";
import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";
import { useCreateEmployee } from "@/hooks/useEmployees";
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

const ROLES = [
    { value: "barista", label: "Barista" },
    { value: "manager", label: "Manager" },
    { value: "owner", label: "Owner" },
] as const;

interface CreateEmployeeDialogProps {
    open: boolean;
    onClose: () => void;
}

const CreateEmployeeDialog = ({ open, onClose }: CreateEmployeeDialogProps) => {
    const createEmployee = useCreateEmployee();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [role, setRole] = useState<string>("barista");
    const [pin, setPin] = useState("");
    const [pinError, setPinError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) setPinError(null);
    }, [open]);

    const handlePinChange = (value: string) => {
        const digits = value.replace(/\D/g, "").slice(0, 6);
        setPin(digits);
        setPinError(null);
    };

    const handleSubmit = () => {
        createEmployee.mutate(
            {
                name: name.trim(),
                email: email.trim(),
                password,
                role: role as "barista" | "manager" | "owner",
                pin: pin || undefined,
            },
            {
                onSuccess: () => {
                    toast.success(`${name.trim()} added to the team`);
                    setName("");
                    setEmail("");
                    setPassword("");
                    setConfirmPassword("");
                    setShowPassword(false);
                    setShowConfirmPassword(false);
                    setRole("barista");
                    setPin("");
                    setPinError(null);
                    onClose();
                },
                onError: (error) => {
                    const msg =
                        (
                            error as {
                                response?: {
                                    data?: { message?: string; error?: string };
                                };
                            }
                        )?.response?.data?.message ||
                        (
                            error as {
                                response?: {
                                    data?: { message?: string; error?: string };
                                };
                            }
                        )?.response?.data?.error ||
                        "Failed to create employee";
                    toast.error(msg);
                    setPinError(msg);
                },
            },
        );
    };

    const isPasswordMismatch =
        confirmPassword.length > 0 && password !== confirmPassword;
    const isValid =
        name.trim() &&
        email.trim() &&
        password.length >= 6 &&
        password === confirmPassword;

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-sm border-(--admin-border) bg-(--admin-card)">
                <DialogHeader>
                    <DialogTitle className="text-(--admin-text)">
                        New Employee
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4">
                    <div className="grid gap-1.5">
                        <Label htmlFor="dialog-full-name" className="text-[11px] text-(--admin-text-secondary)">
                            Full Name
                        </Label>
                        <Input
                            id="dialog-full-name"
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Jane Smith"
                            className="h-8 border-(--admin-border) bg-(--admin-card) text-xs"
                        />
                    </div>

                    <div className="grid gap-1.5">
                        <Label htmlFor="dialog-email" className="text-[11px] text-(--admin-text-secondary)">
                            Email
                        </Label>
                        <Input
                            id="dialog-email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="jane@bigbrew.com"
                            className="h-8 border-(--admin-border) bg-(--admin-card) text-xs"
                        />
                    </div>

                    <div className="grid gap-1.5">
                        <Label htmlFor="dialog-password" className="text-[11px] text-(--admin-text-secondary)">
                            Password
                        </Label>
                        <div className="relative">
                            <Input
                                id="dialog-password"
                                type={showPassword ? "text" : "password"}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Min 6 characters"
                                className="h-8 border-(--admin-border) bg-(--admin-card) pr-8 text-xs"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute top-1/2 right-2 flex cursor-pointer -translate-y-1/2 items-center text-(--admin-text-muted) transition-colors hover:text-(--admin-text)"
                            >
                                {showPassword ? (
                                    <EyeSlashIcon className="size-3.5" />
                                ) : (
                                    <EyeIcon className="size-3.5" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="grid gap-1.5">
                        <Label htmlFor="dialog-confirm-password" className="text-[11px] text-(--admin-text-secondary)">
                            Confirm Password
                        </Label>
                        <div className="relative">
                            <Input
                                id="dialog-confirm-password"
                                type={showConfirmPassword ? "text" : "password"}
                                onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                }
                                placeholder="Re-enter password"
                                className="h-8 border-(--admin-border) bg-(--admin-card) pr-8 text-xs"
                            />
                            <button
                                type="button"
                                onClick={() =>
                                    setShowConfirmPassword(!showConfirmPassword)
                                }
                                className="absolute top-1/2 right-2 flex cursor-pointer -translate-y-1/2 items-center text-(--admin-text-muted) transition-colors hover:text-(--admin-text)"
                            >
                                {showConfirmPassword ? (
                                    <EyeSlashIcon className="size-3.5" />
                                ) : (
                                    <EyeIcon className="size-3.5" />
                                )}
                            </button>
                        </div>
                        {isPasswordMismatch && (
                            <p className="text-[10px] font-medium text-destructive">
                                Passwords don&apos;t match
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-1.5">
                            <Label className="text-[11px] text-(--admin-text-secondary)">
                                Role
                            </Label>
                            <Select
                                value={role}
                                onValueChange={(v) => setRole(v ?? "barista")}
                            >
                                <SelectTrigger className="h-8 border-(--admin-border) bg-(--admin-card) text-xs">
                                    <SelectValue>
                                        {(val) =>
                                            ROLES.find((r) => r.value === val)
                                                ?.label ?? "Barista"
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

                        <div className="grid gap-1.5">
                            <Label htmlFor="dialog-pin" className="text-[11px] text-(--admin-text-secondary)">
                                PIN (6 digits)
                            </Label>
                            <Input
                                id="dialog-pin"
                                inputMode="numeric"
                                pattern="\d*"
                                maxLength={6}
                                value={pin}
                                onChange={(e) =>
                                    handlePinChange(e.target.value)
                                }
                                placeholder="000000"
                                className="h-8 border-(--admin-border) bg-(--admin-card) font-mono text-xs tracking-widest"
                            />
                            {pinError && (
                                <p className="text-[10px] font-medium text-destructive">
                                    {pinError}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="text-(--admin-text-secondary)"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!isValid || createEmployee.isPending}
                        className="bg-(--admin-primary) text-white hover:bg-[#3a1d0e]"
                    >
                        {createEmployee.isPending
                            ? "Creating..."
                            : "Create Employee"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CreateEmployeeDialog;
