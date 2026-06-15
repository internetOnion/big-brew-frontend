import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
    SquaresFourIcon,
    ForkKnifeIcon,
    PackageIcon,
    UsersIcon,
    ClipboardTextIcon,
    ReceiptIcon,
    GearSixIcon,
    ListIcon,
    SignOutIcon,
    MonitorIcon,
} from "@phosphor-icons/react";
import { motion } from "motion/react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetTitle,
} from "@/components/ui/sheet";

const navItems = [
    { to: "/admin", icon: SquaresFourIcon, label: "Dashboard", end: true },
    { to: "/admin/menu", icon: ForkKnifeIcon, label: "Menu" },
    { to: "/admin/inventory", icon: PackageIcon, label: "Inventory" },
    { to: "/admin/employees", icon: UsersIcon, label: "Employees" },
    { to: "/admin/orders", icon: ClipboardTextIcon, label: "Orders" },
    { to: "/admin/expenses", icon: ReceiptIcon, label: "Expenses" },
    { to: "/admin/settings", icon: GearSixIcon, label: "Settings" },
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
            {/* Brand */}
            <div className="flex h-11 shrink-0 items-center gap-2.5 px-3.5">
                <img src="/homebrew.svg" alt="Homebrew" className="size-6" />
                <span className="font-sans text-[13px] font-bold tracking-tight text-[var(--admin-primary)]">
                    Big Brew
                </span>
                <span className="ml-auto rounded border border-[var(--admin-sidebar-border)] bg-[var(--admin-hover)] px-1.5 py-0.5 font-sans text-[10px] font-medium text-[var(--admin-text-muted)]">
                    admin
                </span>
            </div>

            <Separator className="bg-[var(--admin-sidebar-border)]" />

            {/* Navigation */}
            <nav className="flex-1 space-y-0.5 px-2.5 py-3">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        onClick={() => setSidebarOpen(false)}
                        className={({ isActive }) =>
                            `admin-nav-item relative flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] ${
                                isActive ? "data-[active=true] font-medium" : ""
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                {isActive && (
                                    <motion.div
                                        layoutId="active-nav"
                                        className="absolute inset-y-1 -left-px w-0.5 rounded-full bg-[var(--admin-primary)]"
                                        transition={{
                                            type: "spring",
                                            stiffness: 380,
                                            damping: 30,
                                        }}
                                    />
                                )}
                                <item.icon
                                    className={`size-[15px] shrink-0 ${
                                        isActive
                                            ? "text-[var(--admin-primary)]"
                                            : ""
                                    }`}
                                />
                                {item.label}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            <Separator className="bg-[var(--admin-sidebar-border)]" />

            {/* Bottom actions */}
            <div className="space-y-0.5 px-2.5 py-3">
                <NavLink
                    to="/"
                    onClick={() => setSidebarOpen(false)}
                    className="flex w-full items-center gap-2.5 rounded-lg bg-[var(--admin-accent)] px-2.5 py-1.5 text-[13px] text-white transition-opacity duration-150 hover:opacity-85"
                >
                    <MonitorIcon className="size-[15px] shrink-0" />
                    Switch to POS
                </NavLink>
                <button
                    onClick={handleLogout}
                    className="admin-nav-item flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px]"
                >
                    <SignOutIcon className="size-[15px] shrink-0" />
                    Logout
                </button>
            </div>

            {/* User info */}
            {user && (
                <div className="border-t border-[var(--admin-sidebar-border)] px-3.5 py-2.5">
                    <div className="flex items-center gap-2.5">
                        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--admin-primary)] font-sans text-[11px] font-semibold text-white">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-[12px] font-medium text-[var(--admin-text)]">
                                {user.name}
                            </p>
                            <p className="font-sans text-[10px] capitalize text-[var(--admin-text-muted)]">
                                {user.role}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="admin-theme flex h-screen w-screen overflow-hidden">
            {/* Desktop sidebar */}
            <aside className="admin-sidebar hidden w-56 shrink-0 bg-[var(--admin-sidebar)] md:block">
                <SidebarContent />
            </aside>

            {/* Mobile sidebar */}
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <div className="flex flex-1 flex-col overflow-hidden">
                    {/* Mobile header */}
                    <div className="flex h-11 shrink-0 items-center gap-3 border-b border-[var(--admin-border)] bg-[var(--admin-card)] px-4 md:hidden">
                        <SheetTrigger
                            render={
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8 text-[var(--admin-text-secondary)]"
                                />
                            }
                        >
                            <ListIcon className="size-4" />
                        </SheetTrigger>
                        <div className="flex items-center gap-2">
                            <img
                                src="/homebrew.svg"
                                alt="Homebrew"
                                className="size-6"
                            />
                            <span className="font-sans text-[13px] font-bold text-[var(--admin-primary)]">
                                BigBrew
                            </span>
                        </div>
                    </div>

                    {/* Page content */}
                    <main className="flex-1 overflow-auto bg-[var(--admin-bg)]">
                        <Outlet />
                    </main>
                </div>

                <SheetContent
                    side="left"
                    className="w-56 border-r border-[var(--admin-sidebar-border)] bg-[var(--admin-sidebar)] p-0"
                >
                    <SheetTitle className="sr-only">Navigation</SheetTitle>
                    <SidebarContent />
                </SheetContent>
            </Sheet>
        </div>
    );
};

export default AdminLayout;
