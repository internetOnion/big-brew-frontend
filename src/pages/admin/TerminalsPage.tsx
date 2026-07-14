import { useState } from "react";
import { toast } from "sonner";
import {
    PlusIcon,
    ClipboardTextIcon,
    ProhibitIcon,
    CheckCircleIcon,
    DotsThreeVerticalIcon,
    PencilSimpleIcon,
    TrashIcon,
    EyeIcon,
    EyeSlashIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import {
    useTerminals,
    useCreateTerminal,
    useUpdateTerminal,
    useDeleteTerminal,
    type Terminal,
} from "@/hooks/useTerminals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
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

const TerminalsPage = () => {
    const { data: terminals, isLoading } = useTerminals();
    const createTerminal = useCreateTerminal();
    const updateTerminal = useUpdateTerminal();
    const deleteTerminal = useDeleteTerminal();

    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [editTerminal, setEditTerminal] = useState<Terminal | null>(null);
    const [deleteDialogTerminal, setDeleteDialogTerminal] =
        useState<Terminal | null>(null);
    const [toggleDialogTerminal, setToggleDialogTerminal] =
        useState<Terminal | null>(null);

    // Create form state
    const [createName, setCreateName] = useState("");
    const [createEmail, setCreateEmail] = useState("");
    const [createPassword, setCreatePassword] = useState("");
    const [showCreatePassword, setShowCreatePassword] = useState(false);

    // Edit form state
    const [editName, setEditName] = useState("");
    const [editPassword, setEditPassword] = useState("");
    const [showEditPassword, setShowEditPassword] = useState(false);

    const resetCreateForm = () => {
        setCreateName("");
        setCreateEmail("");
        setCreatePassword("");
        setShowCreatePassword(false);
    };

    const resetEditForm = () => {
        setEditName("");
        setEditPassword("");
        setShowEditPassword(false);
    };

    const handleCreate = () => {
        createTerminal.mutate(
            {
                name: createName.trim(),
                email: createEmail.trim(),
                password: createPassword,
            },
            {
                onSuccess: () => {
                    toast.success(`${createName.trim()} created`);
                    resetCreateForm();
                    setShowCreateDialog(false);
                },
                onError: (error) => {
                    const msg =
                        (
                            error as {
                                response?: {
                                    data?: {
                                        message?: string;
                                        error?: string;
                                    };
                                };
                            }
                        )?.response?.data?.message ||
                        (
                            error as {
                                response?: {
                                    data?: {
                                        message?: string;
                                        error?: string;
                                    };
                                };
                            }
                        )?.response?.data?.error ||
                        "Failed to create terminal";
                    toast.error(msg);
                },
            },
        );
    };

    const handleEditOpen = (terminal: Terminal) => {
        setEditTerminal(terminal);
        setEditName(terminal.name);
        setEditPassword("");
        setShowEditPassword(false);
    };

    const handleEdit = () => {
        if (!editTerminal) return;
        const payload: { id: string; name?: string; password?: string } = {
            id: editTerminal.id,
        };
        if (editName.trim() !== editTerminal.name) {
            payload.name = editName.trim();
        }
        if (editPassword) {
            payload.password = editPassword;
        }
        updateTerminal.mutate(payload, {
            onSuccess: () => {
                toast.success("Terminal updated");
                resetEditForm();
                setEditTerminal(null);
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
                    "Failed to update terminal";
                toast.error(msg);
            },
        });
    };

    const handleToggleStatus = () => {
        if (!toggleDialogTerminal) return;
        const terminal = toggleDialogTerminal;
        setToggleDialogTerminal(null);
        updateTerminal.mutate(
            { id: terminal.id, isActive: !terminal.isActive },
            {
                onSuccess: () => {
                    toast.success(
                        `${terminal.name} ${terminal.isActive ? "deactivated" : "reactivated"}`,
                    );
                },
            },
        );
    };

    const handleDelete = () => {
        if (!deleteDialogTerminal) return;
        const terminal = deleteDialogTerminal;
        setDeleteDialogTerminal(null);
        deleteTerminal.mutate(terminal.id);
    };

    const isCreateValid =
        createName.trim() && createEmail.trim() && createPassword.length >= 8;

    const isLoadingRows = () => (
        <>
            {Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}>
                    <td className="px-4 py-3">
                        <Skeleton className="h-4 w-32 bg-(--admin-hover)" />
                    </td>
                    <td className="px-4 py-3">
                        <Skeleton className="h-4 w-40 bg-(--admin-hover)" />
                    </td>
                    <td className="px-4 py-3 text-center">
                        <Skeleton className="mx-auto h-4 w-12 bg-(--admin-hover)" />
                    </td>
                    <td className="px-2 py-3" />
                </tr>
            ))}
        </>
    );

    const emptyRows = () => (
        <tr>
            <td colSpan={4} className="px-4 py-10 text-center">
                <div className="flex flex-col items-center gap-1.5">
                    <ClipboardTextIcon className="size-5 text-(--admin-text-muted)" />
                    <p className="text-xs text-(--admin-text-muted)">
                        No terminals yet
                    </p>
                    <p className="text-[11px] text-(--admin-text-muted)/70">
                        Click &quot;Add&quot; to set up a POS terminal
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
                    Terminals
                </h1>
                <Button
                    size="sm"
                    onClick={() => setShowCreateDialog(true)}
                    className="h-7 max-md:min-h-[44px] gap-1.5 bg-(--admin-primary) text-[11px] text-white hover:bg-(--admin-primary)/80 cursor-pointer"
                >
                    <PlusIcon className="size-3" />
                    Add
                </Button>
            </div>

            {/* Table */}
            <div className="admin-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-(--admin-border) bg-(--admin-hover)">
                                <th className="px-4 py-2.5 text-left text-[10px] font-medium text-(--admin-text-muted)">
                                    Name
                                </th>
                                <th className="px-4 py-2.5 text-left text-[10px] font-medium text-(--admin-text-muted)">
                                    Email
                                </th>
                                <th className="px-4 py-2.5 text-center text-[10px] font-medium text-(--admin-text-muted)">
                                    Status
                                </th>
                                <th className="w-20 px-2 py-2.5 text-right text-[10px] font-medium text-(--admin-text-muted)">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-(--admin-border)">
                            {isLoading
                                ? isLoadingRows()
                                : !terminals || terminals.length === 0
                                  ? emptyRows()
                                  : terminals.map((terminal) => {
                                        const isActive = terminal.isActive;
                                        return (
                                            <tr
                                                key={terminal.id}
                                                className="transition-colors hover:bg-(--admin-hover)"
                                            >
                                                <td className="px-4 py-2.5 text-[12px] font-medium text-(--admin-text)">
                                                    {terminal.name}
                                                </td>
                                                <td className="px-4 py-2.5 font-mono text-[11px] text-(--admin-text-secondary)">
                                                    {terminal.email}
                                                </td>
                                                <td className="px-4 py-2.5 text-center">
                                                    <span
                                                        className={cn(
                                                            "text-[10px] font-medium",
                                                            isActive
                                                                ? "text-(--admin-success)"
                                                                : "text-(--admin-text-muted)",
                                                        )}
                                                    >
                                                        {isActive
                                                            ? "Active"
                                                            : "Inactive"}
                                                    </span>
                                                </td>
                                                <td className="px-2 py-2.5 text-right">
                                                    <div className="flex justify-end">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger
                                                                aria-label="Actions"
                                                                className="flex size-7 max-md:min-h-[44px] max-md:min-w-[44px] shrink-0 items-center justify-center rounded-md border border-(--admin-border) text-(--admin-text-secondary) transition-colors hover:bg-(--admin-hover) hover:text-(--admin-text) cursor-pointer"
                                                            >
                                                                <DotsThreeVerticalIcon className="size-4" />
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent
                                                                align="end"
                                                                sideOffset={4}
                                                                className="border-(--admin-border) bg-(--admin-card)"
                                                            >
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        handleEditOpen(
                                                                            terminal,
                                                                        )
                                                                    }
                                                                >
                                                                    <PencilSimpleIcon className="size-4" />
                                                                    Edit
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    variant={
                                                                        isActive
                                                                            ? "destructive"
                                                                            : undefined
                                                                    }
                                                                    onClick={() =>
                                                                        setToggleDialogTerminal(
                                                                            terminal,
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
                                                                <DropdownMenuItem
                                                                    variant="destructive"
                                                                    onClick={() =>
                                                                        setDeleteDialogTerminal(
                                                                            terminal,
                                                                        )
                                                                    }
                                                                >
                                                                    <TrashIcon className="size-4" />
                                                                    Delete
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

            {/* Create Dialog */}
            <Dialog
                open={showCreateDialog}
                onOpenChange={(v) => {
                    if (!v) {
                        resetCreateForm();
                        setShowCreateDialog(false);
                    }
                }}
            >
                <DialogContent className="max-w-sm border-(--admin-border) bg-(--admin-card)">
                    <DialogHeader>
                        <DialogTitle className="text-(--admin-text)">
                            New Terminal
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-4">
                        <div className="grid gap-1.5">
                            <Label className="text-[11px] text-(--admin-text-secondary)">
                                Name
                            </Label>
                            <Input
                                value={createName}
                                onChange={(e) => setCreateName(e.target.value)}
                                placeholder="Front Counter"
                                className="h-8 border-(--admin-border) bg-(--admin-card) text-xs"
                            />
                        </div>
                        <div className="grid gap-1.5">
                            <Label className="text-[11px] text-(--admin-text-secondary)">
                                Email
                            </Label>
                            <Input
                                value={createEmail}
                                onChange={(e) => setCreateEmail(e.target.value)}
                                placeholder="pos@bigbrew.com"
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
                                        showCreatePassword ? "text" : "password"
                                    }
                                    value={createPassword}
                                    onChange={(e) =>
                                        setCreatePassword(e.target.value)
                                    }
                                    placeholder="Min 8 characters"
                                    className="h-8 border-(--admin-border) bg-(--admin-card) pr-8 text-xs"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowCreatePassword(
                                            !showCreatePassword,
                                        )
                                    }
                                    className="absolute top-1/2 right-2 flex cursor-pointer -translate-y-1/2 items-center text-(--admin-text-muted) transition-colors hover:text-(--admin-text)"
                                >
                                    {showCreatePassword ? (
                                        <EyeSlashIcon className="size-3.5" />
                                    ) : (
                                        <EyeIcon className="size-3.5" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="ghost"
                            onClick={() => {
                                resetCreateForm();
                                setShowCreateDialog(false);
                            }}
                            className="text-(--admin-text-secondary)"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreate}
                            disabled={
                                !isCreateValid || createTerminal.isPending
                            }
                            className="bg-(--admin-primary) text-white hover:bg-(--admin-primary)/80"
                        >
                            {createTerminal.isPending
                                ? "Creating..."
                                : "Create Terminal"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog
                open={editTerminal !== null}
                onOpenChange={(v) => {
                    if (!v) {
                        resetEditForm();
                        setEditTerminal(null);
                    }
                }}
            >
                <DialogContent className="max-w-sm border-(--admin-border) bg-(--admin-card)">
                    <DialogHeader>
                        <DialogTitle className="text-(--admin-text)">
                            Edit Terminal
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-4">
                        <div className="grid gap-1.5">
                            <Label className="text-[11px] text-(--admin-text-secondary)">
                                Name
                            </Label>
                            <Input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="h-8 border-(--admin-border) bg-(--admin-card) text-xs"
                            />
                        </div>
                        <div className="grid gap-1.5">
                            <Label className="text-[11px] text-(--admin-text-secondary)">
                                New Password (leave blank to keep current)
                            </Label>
                            <div className="relative">
                                <Input
                                    type={
                                        showEditPassword ? "text" : "password"
                                    }
                                    value={editPassword}
                                    onChange={(e) =>
                                        setEditPassword(e.target.value)
                                    }
                                    placeholder="Leave blank to keep current"
                                    className="h-8 border-(--admin-border) bg-(--admin-card) pr-8 text-xs"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowEditPassword(!showEditPassword)
                                    }
                                    className="absolute top-1/2 right-2 flex cursor-pointer -translate-y-1/2 items-center text-(--admin-text-muted) transition-colors hover:text-(--admin-text)"
                                >
                                    {showEditPassword ? (
                                        <EyeSlashIcon className="size-3.5" />
                                    ) : (
                                        <EyeIcon className="size-3.5" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="ghost"
                            onClick={() => {
                                resetEditForm();
                                setEditTerminal(null);
                            }}
                            className="text-(--admin-text-secondary)"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleEdit}
                            disabled={updateTerminal.isPending}
                            className="bg-(--admin-primary) text-white hover:bg-(--admin-primary)/80"
                        >
                            {updateTerminal.isPending
                                ? "Saving..."
                                : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Toggle Status Dialog */}
            <Dialog
                open={toggleDialogTerminal !== null}
                onOpenChange={(v) => !v && setToggleDialogTerminal(null)}
            >
                <DialogContent className="max-w-sm border-(--admin-border) bg-(--admin-card)">
                    <DialogHeader>
                        <DialogTitle className="text-(--admin-text)">
                            {toggleDialogTerminal?.isActive
                                ? "Deactivate"
                                : "Reactivate"}{" "}
                            Terminal
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-xs text-(--admin-text-secondary)">
                        Are you sure you want to{" "}
                        {toggleDialogTerminal?.isActive
                            ? "deactivate"
                            : "reactivate"}{" "}
                        <span className="font-medium text-(--admin-text)">
                            {toggleDialogTerminal?.name}
                        </span>
                        ?
                    </p>
                    <DialogFooter>
                        <Button
                            variant="ghost"
                            onClick={() => setToggleDialogTerminal(null)}
                            className="text-(--admin-text-secondary)"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleToggleStatus}
                            className={
                                toggleDialogTerminal?.isActive
                                    ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    : "bg-(--admin-success) text-white hover:bg-(--admin-success)/80"
                            }
                        >
                            {toggleDialogTerminal?.isActive
                                ? "Deactivate"
                                : "Reactivate"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog
                open={deleteDialogTerminal !== null}
                onOpenChange={(v) => !v && setDeleteDialogTerminal(null)}
            >
                <DialogContent className="max-w-sm border-(--admin-border) bg-(--admin-card)">
                    <DialogHeader>
                        <DialogTitle className="text-(--admin-text)">
                            Delete Terminal
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-xs text-(--admin-text-secondary)">
                        Are you sure you want to permanently delete{" "}
                        <span className="font-medium text-(--admin-text)">
                            {deleteDialogTerminal?.name}
                        </span>
                        ? This action cannot be undone.
                    </p>
                    <DialogFooter>
                        <Button
                            variant="ghost"
                            onClick={() => setDeleteDialogTerminal(null)}
                            className="text-(--admin-text-secondary)"
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleDelete} variant="destructive">
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default TerminalsPage;
