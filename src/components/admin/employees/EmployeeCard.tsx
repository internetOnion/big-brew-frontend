import {
    DotsThreeVerticalIcon,
    EyeIcon,
    KeyIcon,
    ProhibitIcon,
    CheckCircleIcon,
} from "@phosphor-icons/react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AdminEmployee } from "@/types/admin";

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

interface EmployeeCardProps {
    employee: AdminEmployee;
    isSelected: boolean;
    onSelect: () => void;
    onResetPin: () => void;
    onToggleStatus: () => void;
}

const EmployeeCard = ({
    employee,
    isSelected,
    onSelect,
    onResetPin,
    onToggleStatus,
}: EmployeeCardProps) => {
    const isActive = employee.isActive !== false;
    const initials = employee.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <div
            className={cn(
                "group relative flex flex-col gap-3 rounded-xl border bg-(--admin-card) p-4",
                "shadow-sm transition-shadow duration-200",
                isSelected
                    ? "border-(--admin-primary)/40 ring-1 ring-(--admin-primary)/20"
                    : "border-(--admin-border) hover:border-(--admin-border)/80 hover:shadow-md",
            )}
        >
            {/* Header row */}
            <div className="flex items-start gap-3">
                <div
                    className={cn(
                        "flex size-10 shrink-0 items-center justify-center rounded-full",
                        "font-sans text-[14px] font-bold text-white",
                        isActive ? "bg-(--admin-primary)" : "bg-(--admin-text-muted)",
                    )}
                >
                    {initials}
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <h3 className="truncate text-[13px] font-medium text-(--admin-text)">
                            {employee.name}
                        </h3>
                        <div
                            className={cn(
                                "size-1.5 shrink-0 rounded-full",
                                isActive ? "bg-emerald-500" : "bg-(--admin-text-muted)",
                            )}
                        />
                    </div>
                    {employee.email && (
                        <p className="truncate text-[11px] text-(--admin-text-muted)">
                            {employee.email}
                        </p>
                    )}
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={
                            <button className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-lg opacity-0 transition-opacity group-hover:opacity-100 hover:bg-(--admin-hover)">
                                <DotsThreeVerticalIcon className="size-4 text-(--admin-text-secondary)" />
                            </button>
                        }
                    />
                    <DropdownMenuContent
                        align="end"
                        className="w-44 border-(--admin-border) bg-(--admin-card)"
                    >
                        <DropdownMenuItem
                            onClick={onSelect}
                            className="gap-2 text-[12px] text-(--admin-text)"
                        >
                            <EyeIcon className="size-3.5" />
                            View Activity
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={onResetPin}
                            className="gap-2 text-[12px] text-(--admin-text)"
                        >
                            <KeyIcon className="size-3.5" />
                            Reset PIN
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={onToggleStatus}
                            className="gap-2 text-[12px]"
                        >
                            {isActive ? (
                                <>
                                    <ProhibitIcon className="size-3.5 text-destructive" />
                                    <span className="text-destructive">
                                        Deactivate
                                    </span>
                                </>
                            ) : (
                                <>
                                    <CheckCircleIcon className="size-3.5 text-emerald-600" />
                                    <span className="text-emerald-600">
                                        Reactivate
                                    </span>
                                </>
                            )}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Footer row */}
            <div className="flex items-center gap-2">
                <Badge
                    variant="outline"
                    className={cn("text-[10px]", roleBadge(employee.role))}
                >
                    {employee.role}
                </Badge>
                <span
                    className={cn(
                        "text-[10px] font-medium",
                        isActive ? "text-emerald-600" : "text-(--admin-text-muted)",
                    )}
                >
                    {isActive ? "Active" : "Inactive"}
                </span>

                <button
                    onClick={onSelect}
                    className="ml-auto cursor-pointer text-[11px] font-medium text-(--admin-primary)/70 transition-colors hover:text-(--admin-primary)"
                >
                    View details →
                </button>
            </div>
        </div>
    );
};

export default EmployeeCard;
