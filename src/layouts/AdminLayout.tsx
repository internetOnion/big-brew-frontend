import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
    SquaresFourIcon,
    ForkKnifeIcon,
    PackageIcon,
    UsersIcon,
    ClipboardTextIcon,
    ReceiptIcon,
    TagIcon,
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
    { to: "/admin/discounts", icon: TagIcon, label: "Discounts" },
    { to: "/admin/settings", icon: GearSixIcon, label: "Settings" },
];

const SidebarContent = ({
    onNavClick,
    onLogout,
}: {
    onNavClick: () => void;
    onLogout: () => void;
}) => {
    return (
        <div className="flex h-full flex-col">
            {/* Brand */}
            <div className="flex h-11 shrink-0 items-center gap-2.5 px-3.5">
                <img src="/homebrew.svg" alt="Homebrew" className="size-6" />
                <span className="text-[13px] font-bold tracking-tight text-(--admin-primary)">
                    Big Brew
                </span>
                <span className="ml-auto rounded border border-(--admin-sidebar-border) bg-(--admin-hover) px-1.5 py-0.5 text-[10px] font-medium text-(--admin-text-muted)">
                    admin
                </span>
            </div>

            <Separator className="bg-(--admin-sidebar-border)" />

            {/* Navigation */}
            <nav className="flex-1 space-y-0.5 px-2.5 py-3">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        onClick={onNavClick}
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
                                        className="absolute inset-y-1 -left-px w-px rounded-full bg-(--admin-primary)"
                                        transition={{
                                            duration: 0.2,
                                            ease: [0.25, 0.1, 0.25, 1],
                                        }}
                                    />
                                )}
                                <item.icon
                                    className={`size-[15px] shrink-0 ${
                                        isActive ? "text-(--admin-primary)" : ""
                                    }`}
                                />
                                {item.label}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            <Separator className="bg-(--admin-sidebar-border)" />

            {/* Bottom actions */}
            <div className="space-y-0.5 px-2.5 py-3">
                <NavLink
                    to="/"
                    onClick={onNavClick}
                    className="flex w-full items-center gap-2.5 rounded-lg bg-(--admin-accent) px-2.5 py-1.5 text-[13px] text-white transition-opacity duration-150 hover:opacity-85"
                >
                    <MonitorIcon className="size-[15px] shrink-0" />
                    Switch to POS
                </NavLink>
                <button
                    onClick={onLogout}
                    className="admin-nav-item flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px]"
                >
                    <SignOutIcon className="size-[15px] shrink-0" />
                    Logout
                </button>
            </div>
        </div>
    );
};

const AdminLayout = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    const closeSidebar = () => setSidebarOpen(false);

    return (
        <div className="admin-theme flex h-screen w-screen overflow-hidden">
            {/* Skip to content */}
            <a
                href="#admin-content"
                className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-(--admin-primary) focus:px-4 focus:py-2 focus:text-sm focus:text-white focus:outline-none"
            >
                Skip to content
            </a>

            {/* Desktop sidebar */}
            <aside className="admin-sidebar hidden w-56 shrink-0 bg-(--admin-sidebar) md:block">
                <SidebarContent
                    onNavClick={closeSidebar}
                    onLogout={handleLogout}
                />
            </aside>

            {/* Mobile sidebar */}
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <div className="flex flex-1 flex-col overflow-hidden">
                    {/* Mobile header */}
                    <div className="flex h-11 shrink-0 items-center gap-3 border-b border-(--admin-border) bg-(--admin-card) px-4 md:hidden">
                        <SheetTrigger
                            render={
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label="Open navigation"
                                    className="size-8 text-(--admin-text-secondary)"
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
                            <span className="text-[13px] font-bold text-(--admin-primary)">
                                BigBrew
                            </span>
                        </div>
                    </div>

                    {/* Page content */}
                    <main
                        id="admin-content"
                        className="flex-1 overflow-auto bg-(--admin-bg)"
                    >
                        <Outlet />
                    </main>
                </div>

                <SheetContent
                    side="left"
                    className="w-56 border-r border-(--admin-sidebar-border) bg-(--admin-sidebar) p-0"
                >
                    <SheetTitle className="sr-only">Navigation</SheetTitle>
                    <SidebarContent
                        onNavClick={closeSidebar}
                        onLogout={handleLogout}
                    />
                </SheetContent>
            </Sheet>
        </div>
    );
};

export default AdminLayout;
