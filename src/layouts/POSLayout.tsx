import { Outlet } from "react-router-dom";
import { Coffee, Shield } from "lucide-react";
import OrderQueue from "@/components/pos/OrderQueue";
import CustomizeModal from "@/components/pos/CustomizeModal";
import { usePOS } from "@/hooks/usePos";

const POSLayout = () => {
    const { customizeItem, customizeInitial, closeCustomize, addItem } =
        usePOS();

    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });

    return (
        <div className="flex h-screen w-screen flex-col overflow-hidden bg-background">
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-4">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                            <Coffee className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-sans text-base font-bold text-foreground">
                            BrewPoint
                        </span>
                    </div>
                    <span className="rounded-md bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                        POS
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs tabular-nums text-foreground">
                            {timeStr}
                        </span>
                    </div>
                    <button className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-black/5">
                        <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                        Admin
                    </button>
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
