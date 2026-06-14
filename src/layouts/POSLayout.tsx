import { Outlet } from "react-router-dom";
import { Shield } from "lucide-react";
import OrderQueue from "@/components/pos/order-queue";
import CustomizeModal from "@/components/pos/customize";
import { usePOS } from "@/hooks/usePos";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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
                        <img
                            src="/homebrew.svg"
                            alt="Homebrew"
                            className="size-8"
                        />
                        <span className="font-sans text-base font-bold text-foreground">
                            BigBrew
                        </span>
                    </div>
                    <Badge
                        variant="default"
                        className="uppercase tracking-wider"
                    >
                        POS
                    </Badge>
                </div>

                <div className="flex items-center gap-4">
                    <span className="font-mono text-xs tabular-nums text-foreground">
                        {timeStr}
                    </span>
                    <Separator orientation="vertical" className="h-4" />
                    <Button variant="outline" size="default">
                        <Shield className="text-muted-foreground" />
                        Admin
                    </Button>
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
