import { Outlet, useNavigate } from "react-router-dom";
import { Shield } from "@phosphor-icons/react";
import OrderQueue from "@/components/pos/order-queue";
import CustomizeModal from "@/components/pos/customize";
import { usePOS } from "@/hooks/usePos";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const POSLayout = () => {
    const { customizeItem, customizeInitial, closeCustomize, addItem } =
        usePOS();
    const { user } = useAuth();
    const navigate = useNavigate();

    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
    });
    const timeStr = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });

    return (
        <div className="pos-theme flex h-screen w-screen flex-col overflow-hidden bg-[var(--pos-bg)]">
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--pos-border)] bg-[var(--pos-card)] px-5 shadow-sm">
                <div className="flex items-center gap-3">
                    <img
                        src="/homebrew.svg"
                        alt="Homebrew"
                        className="size-7"
                    />
                    <span className="font-sans text-[13px] font-bold tracking-tight text-[var(--pos-primary)]">
                        Big Brew
                    </span>
                    <span className="rounded-md border border-[var(--pos-border)] bg-[var(--pos-hover)] px-1.5 py-0.5 font-sans text-[10px] font-medium text-[var(--pos-text-muted)]">
                        POS
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <span className="block font-mono text-[11px] tabular-nums text-[var(--pos-text)]">
                            {timeStr}
                        </span>
                        <span className="block font-sans text-[10px] text-[var(--pos-text-muted)]">
                            {dateStr}
                        </span>
                    </div>
                    <Separator
                        orientation="vertical"
                        className="h-5 bg-[var(--pos-border)]"
                    />
                    {user?.role !== "barista" && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate("/admin")}
                            className="h-8 gap-1.5 text-xs"
                        >
                            <Shield className="size-3.5 text-[var(--pos-text-muted)]" />
                            Admin
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                <OrderQueue />
                <Outlet />
            </div>

            {customizeItem && (
                <CustomizeModal
                    item={customizeItem}
                    initialOptions={customizeInitial}
                    onClose={closeCustomize}
                    onAdd={addItem}
                />
            )}
        </div>
    );
};

export default POSLayout;
