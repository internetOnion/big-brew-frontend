import { Outlet, useNavigate } from "react-router-dom";
import OrderQueue from "@/components/pos/order-queue";
import CustomizeModal from "@/components/pos/customize";
import { usePOS } from "@/hooks/usePos";
import { useAuth } from "@/hooks/useAuth";
import { Separator } from "@/components/ui/separator";
import { MonitorIcon } from "@phosphor-icons/react";

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
                    <div className="flex flex-col items-end">
                        <span className="font-mono text-[11px] tabular-nums whitespace-nowrap text-[var(--pos-text)]">
                            {timeStr}
                        </span>
                        <span className="font-sans text-[10px] whitespace-nowrap text-[var(--pos-text-muted)]">
                            {dateStr}
                        </span>
                    </div>
                    <Separator
                        orientation="vertical"
                        className="h-6 bg-[var(--pos-border)]"
                    />
                    {user?.role !== "barista" && (
                        <button
                            onClick={() => navigate("/admin")}
                            className="flex w-full items-center gap-2.5 rounded-lg bg-[var(--pos-accent)] px-2.5 py-1.5 text-[13px] text-white transition-opacity duration-150 hover:opacity-85 cursor-pointer"
                        >
                            <MonitorIcon className="size-[15px] shrink-0" />
                            Admin
                        </button>
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
