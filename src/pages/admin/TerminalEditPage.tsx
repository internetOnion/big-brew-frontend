import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeftIcon, EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";
import { useTerminals, useUpdateTerminal } from "@/hooks/useTerminals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

const TerminalEditPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: terminals, isLoading } = useTerminals();
    const updateMutation = useUpdateTerminal();

    const terminal = terminals?.find((t) => t.id === id);

    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (terminal) {
            setName(terminal.name);
            setPassword("");
        }
    }, [terminal]);

    const handleSubmit = () => {
        if (!id || !terminal) return;
        const payload: { id: string; name?: string; password?: string } = {
            id,
        };
        if (name.trim() !== terminal.name) payload.name = name.trim();
        if (password) payload.password = password;

        if (!payload.name && !payload.password) {
            toast.error("No changes to save");
            return;
        }

        updateMutation.mutate(payload, {
            onSuccess: () => {
                toast.success("Terminal updated");
                navigate("/admin/terminals");
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

    if (isLoading) {
        return (
            <div className="flex flex-col gap-5 p-5">
                <Skeleton className="h-5 w-40 bg-(--admin-hover)" />
                <Skeleton className="h-[300px] max-w-sm bg-(--admin-hover)" />
            </div>
        );
    }

    if (!terminal) {
        return (
            <div className="flex flex-col items-center gap-2 p-10">
                <p className="text-xs text-(--admin-text-muted)">
                    Terminal not found
                </p>
                <button
                    onClick={() => navigate("/admin/terminals")}
                    className="text-xs text-(--admin-primary) underline"
                >
                    Back to terminals
                </button>
            </div>
        );
    }

    const hasChanges = name.trim() !== terminal.name || !!password;

    return (
        <div className="flex flex-col gap-5 p-5">
            <div className="flex items-center gap-3">
                <button
                    onClick={() => navigate("/admin/terminals")}
                    className="flex size-7 items-center justify-center rounded-md border border-(--admin-border) text-(--admin-text-secondary) transition-colors hover:bg-(--admin-hover) hover:text-(--admin-text) cursor-pointer"
                >
                    <ArrowLeftIcon className="size-4" />
                </button>
                <h1 className="text-[13px] font-medium text-(--admin-primary)">
                    Edit Terminal
                </h1>
            </div>

            <div className="max-w-sm">
                <div className="admin-card flex flex-col gap-4 p-4">
                    <div className="grid gap-1.5">
                        <Label className="text-[11px] text-(--admin-text-secondary)">
                            Name
                        </Label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="h-8 border-(--admin-border) bg-(--admin-card) text-xs"
                        />
                    </div>
                    <div className="grid gap-1.5">
                        <Label className="text-[11px] text-(--admin-text-secondary)">
                            New Password{" "}
                            <span className="text-(--admin-text-muted)">
                                (leave blank to keep current)
                            </span>
                        </Label>
                        <div className="relative">
                            <Input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Leave blank to keep current"
                                className="h-8 border-(--admin-border) bg-(--admin-card) pr-8 text-xs"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute top-1/2 right-2 flex -translate-y-1/2 cursor-pointer items-center text-(--admin-text-muted) transition-colors hover:text-(--admin-text)"
                            >
                                {showPassword ? (
                                    <EyeSlashIcon className="size-3.5" />
                                ) : (
                                    <EyeIcon className="size-3.5" />
                                )}
                            </button>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="ghost"
                            onClick={() => navigate("/admin/terminals")}
                            className="text-(--admin-text-secondary)"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={!hasChanges || updateMutation.isPending}
                            className="bg-(--admin-primary) text-white hover:bg-(--admin-primary)/80"
                        >
                            {updateMutation.isPending
                                ? "Saving..."
                                : "Save Changes"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TerminalEditPage;
