import { useState } from "react";
import { toast } from "sonner";
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
    const [role, setRole] = useState<string>("barista");
    const [pin, setPin] = useState("");

    const handlePinChange = (value: string) => {
        const digits = value.replace(/\D/g, "").slice(0, 6);
        setPin(digits);
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
                    setRole("barista");
                    setPin("");
                    onClose();
                },
                onError: () => {
                    toast.error("Failed to create employee");
                },
            },
        );
    };

    const isValid = name.trim() && email.trim() && password.length >= 6;

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
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Min 6 characters"
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
                                                ?.label ?? "Barista"
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
                        </div>

                        <div className="grid gap-1.5">
                            <Label className="text-[11px] text-(--admin-text-secondary)">
                                PIN (6 digits)
                            </Label>
                            <Input
                                type="text"
                                inputMode="numeric"
                                pattern="\d*"
                                maxLength={6}
                                value={pin}
                                onChange={(e) => handlePinChange(e.target.value)}
                                placeholder="000000"
                                className="h-8 border-(--admin-border) bg-(--admin-card) font-mono text-xs tracking-widest"
                            />
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
