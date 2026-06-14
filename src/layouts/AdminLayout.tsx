import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    UtensilsCrossed,
    Package,
    Users,
    ClipboardList,
    Receipt,
    Settings,
    ArrowLeft,
    Menu,
    LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetTitle,
} from "@/components/ui/sheet";

const navItems = [
    { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
    { to: "/admin/menu", icon: UtensilsCrossed, label: "Menu" },
    { to: "/admin/inventory", icon: Package, label: "Inventory" },
    { to: "/admin/employees", icon: Users, label: "Employees" },
    { to: "/admin/orders", icon: ClipboardList, label: "Orders" },
    { to: "/admin/expenses", icon: Receipt, label: "Expenses" },
    { to: "/admin/settings", icon: Settings, label: "Settings" },
];

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    const SidebarContent = () => (
        <div className="flex h-full flex-col">
            <div className="flex items-center gap-2 px-4 py-4">
                <img src="/homebrew.svg" alt="Homebrew" className="size-8" />
                <span className="font-sans text-base font-bold text-foreground">
                    BigBrew
                </span>
                <Badge
                    variant="default"
                    className="ml-1 uppercase tracking-wider"
                >
                    Admin
                </Badge>
            </div>
            <Separator />

            <nav className="flex-1 space-y-1 px-2 py-4">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        onClick={() => setSidebarOpen(false)}
                        className={({ isActive }) =>
                            `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                isActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`
                        }
                    >
                        <item.icon className="size-4" />
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <Separator />
            <div className="space-y-1 px-2 py-4">
                <NavLink
                    to="/"
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                    <ArrowLeft className="size-4" />
                    Back to POS
                </NavLink>
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                    <LogOut className="size-4" />
                    Logout
                </button>
            </div>

            {user && (
                <div className="border-t border-border px-4 py-3">
                    <p className="text-sm font-medium text-foreground">
                        {user.name}
                    </p>
                    <p className="text-xs capitalize text-muted-foreground">
                        {user.role}
                    </p>
                </div>
            )}
        </div>
    );

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-background">
            {/* Desktop sidebar */}
            <aside className="hidden w-60 shrink-0 border-r border-border bg-card md:block">
                <SidebarContent />
            </aside>

            {/* Mobile sidebar */}
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <div className="flex flex-1 flex-col overflow-hidden">
                    <div className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card px-4 md:hidden">
                        <SheetTrigger
                            render={<Button variant="ghost" size="icon" />}
                        >
                            <Menu className="size-5" />
                        </SheetTrigger>
                        <img
                            src="/homebrew.svg"
                            alt="Homebrew"
                            className="size-7"
                        />
                        <span className="font-sans text-sm font-bold text-foreground">
                            BigBrew Admin
                        </span>
                    </div>

                    <main className="flex-1 overflow-auto">
                        <Outlet />
                    </main>
                </div>

                <SheetContent side="left" className="w-60 p-0">
                    <SheetTitle className="sr-only">Navigation</SheetTitle>
                    <SidebarContent />
                </SheetContent>
            </Sheet>
        </div>
    );
};

export default AdminLayout;
