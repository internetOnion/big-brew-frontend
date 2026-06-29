import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeftIcon, EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import { employeeKeys } from "@/lib/query-keys";
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

const EmployeeCreatePage = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [name, setName] = useState("");
    const [role, setRole] = useState("barista");
    const [pin, setPin] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const needsAccount = role !== "barista";

    const createBaristaMutation = useMutation({
        mutationFn: async () => {
            const { data } = await api.post(ENDPOINTS.EMPLOYEES.BASE, {
                name: name.trim(),
                role: "barista",
                pin: pin || undefined,
            });
            return data;
        },
        onSuccess: () => {
            toast.success(`${name.trim()} added`);
            queryClient.invalidateQueries({ queryKey: employeeKeys.all });
            navigate("/admin/employees");
        },
        onError: () => toast.error("Failed to create employee"),
    });

    const createAccountMutation = useMutation({
        mutationFn: async () => {
            const { data } = await api.post(ENDPOINTS.AUTH.SIGNUP, {
                name: name.trim(),
                email: email.trim(),
                password,
                role,
                pin: pin || undefined,
            });
            return data;
        },
        onSuccess: () => {
            toast.success(`${name.trim()} added`);
            queryClient.invalidateQueries({ queryKey: employeeKeys.all });
            navigate("/admin/employees");
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
        },
    });

    const handleSubmit = () => {
        if (needsAccount) {
            createAccountMutation.mutate();
        } else {
            createBaristaMutation.mutate();
        }
    };

    const isPasswordMismatch =
        confirmPassword.length > 0 && password !== confirmPassword;
    const isValid =
        name.trim() &&
        (!needsAccount ||
            (email.trim() &&
                password.length >= 6 &&
                password === confirmPassword));
    const isPending =
        createBaristaMutation.isPending || createAccountMutation.isPending;

    return (
        <div className="flex flex-col gap-5 p-5">
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
                    Add Employee
                </h1>
            </div>

            <div className="max-w-md rounded-lg border border-(--admin-border) bg-(--admin-card) p-4">
                <h2 className="mb-3 text-[11px] font-medium uppercase tracking-wide text-(--admin-text-secondary)">
                    Employee Info
                </h2>

                <div className="space-y-4">
                    <div className="grid gap-1.5">
                        <Label className="text-[11px] text-(--admin-text-secondary)">
                            Full Name
                        </Label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Jane Smith"
                            className="h-8 border-(--admin-border) bg-(--admin-card) text-xs"
                        />
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
                                                ?.label ?? val
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
                            <Label className="text-[11px] text-(--admin-text-secondary)">
                                PIN (6 digits)
                            </Label>
                            <Input
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                value={pin}
                                onChange={(e) =>
                                    setPin(
                                        e.target.value
                                            .replace(/\D/g, "")
                                            .slice(0, 6),
                                    )
                                }
                                placeholder="000000"
                                className="h-8 border-(--admin-border) bg-(--admin-card) font-mono text-xs tracking-widest"
                            />
                        </div>
                    </div>

                    {needsAccount && (
                        <>
                            <div className="grid gap-1.5">
                                <Label className="text-[11px] text-(--admin-text-secondary)">
                                    Email
                                </Label>
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="jane@bigbrew.com"
                                    className="h-8 border-(--admin-border) bg-(--admin-card) text-xs"
                                />
                            </div>

                            <div className="grid gap-1.5">
                                <Label className="text-[11px] text-(--admin-text-secondary)">
                                    Password
                                </Label>
                                <div className="relative">
                                    <Input
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        placeholder="Min 6 characters"
                                        className="h-8 border-(--admin-border) bg-(--admin-card) pr-8 text-xs"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
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
                                <Label className="text-[11px] text-(--admin-text-secondary)">
                                    Confirm Password
                                </Label>
                                <div className="relative">
                                    <Input
                                        type={
                                            showConfirmPassword
                                                ? "text"
                                                : "password"
                                        }
                                        value={confirmPassword}
                                        onChange={(e) =>
                                            setConfirmPassword(e.target.value)
                                        }
                                        placeholder="Re-enter password"
                                        className="h-8 border-(--admin-border) bg-(--admin-card) pr-8 text-xs"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                !showConfirmPassword,
                                            )
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
                                    <p className="text-[10px] font-medium text-red-600">
                                        Passwords don&apos;t match
                                    </p>
                                )}
                            </div>
                        </>
                    )}
                </div>

                <div className="mt-5 flex justify-end gap-2 border-t border-(--admin-border) pt-3">
                    <Button
                        variant="ghost"
                        onClick={() => navigate("/admin/employees")}
                        className="text-(--admin-text-secondary)"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!isValid || isPending}
                        className="bg-(--admin-primary) text-white hover:bg-[#3a1d0e]"
                    >
                        {isPending ? "Creating..." : "Create Employee"}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default EmployeeCreatePage;
