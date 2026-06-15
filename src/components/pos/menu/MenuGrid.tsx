import { useState, useMemo } from "react";
import {
    MagnifyingGlassIcon,
    SpinnerIcon,
    WarningCircleIcon,
    ArrowClockwiseIcon,
} from "@phosphor-icons/react";
import { useCategories } from "@/contexts/CategoryContext";
import { usePOS } from "@/hooks/usePos";
import { useMenuItems } from "@/hooks/useMenuItems";
import { toMenuItem } from "@/types/menu";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const MenuGrid = () => {
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");
    const [fetchingItemId, setFetchingItemId] = useState<string | null>(null);
    const { categories } = useCategories();
    const { openCustomize } = usePOS();
    const {
        data: items,
        isLoading,
        error,
        refetch,
        fetchItemById,
    } = useMenuItems();

    const filteredItems = useMemo(() => {
        return (items ?? []).filter((item) => {
            const matchesSearch = item.name
                .toLowerCase()
                .includes(search.toLowerCase());
            const matchesCategory =
                activeCategory === "all" || item.category.id === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }, [items, search, activeCategory]);

    const handleItemClick = async (id: string) => {
        setFetchingItemId(id);
        try {
            const fullItem = await fetchItemById(id);
            openCustomize(toMenuItem(fullItem));
        } catch {
            // error toast is handled by the api interceptor
        } finally {
            setFetchingItemId(null);
        }
    };

    return (
        <div className="flex h-full flex-col overflow-hidden">
            <div className="px-4 pt-4">
                <div className="flex items-center gap-2 rounded-lg border border-[var(--pos-border)] bg-[var(--pos-card)] px-3 py-2">
                    <MagnifyingGlassIcon className="size-4 shrink-0 text-[var(--pos-text-muted)]" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search menu..."
                        className="w-full bg-transparent text-[13px] text-[var(--pos-text)] outline-none placeholder:text-[var(--pos-text-muted)]"
                    />
                </div>
            </div>

            <div className="flex gap-1 overflow-x-auto px-4 py-2.5 scrollbar-hide">
                {categories.map((cat) => (
                    <Button
                        key={cat.id}
                        variant={
                            activeCategory === cat.id ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setActiveCategory(cat.id)}
                        className="shrink-0 text-[11px]"
                    >
                        {cat.label}
                    </Button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-4 pos-scroll">
                {isLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-2">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <Card key={i} className="overflow-hidden">
                                <Skeleton className="aspect-4/3 rounded-none" />
                                <div className="flex flex-col gap-2 p-3 md:gap-1.5 md:p-2 lg:gap-1 lg:p-1.5">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-4 w-1/3" />
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-16">
                        <WarningCircleIcon className="size-10 text-destructive" />
                        <p className="text-sm font-medium text-muted-foreground">
                            {error.message}
                        </p>
                        <Button
                            variant="outline"
                            size="default"
                            onClick={() => refetch()}
                        >
                            <ArrowClockwiseIcon />
                            Retry
                        </Button>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-16">
                        <svg
                            viewBox="0 0 32 32"
                            className="size-10"
                            fill="none"
                        >
                            <ellipse
                                cx="16"
                                cy="18"
                                rx="8"
                                ry="5"
                                className="fill-muted-foreground/30"
                            />
                            <path
                                d="M8 18c0-4 3.5-7 8-7s8 3 8 7"
                                className="fill-transparent stroke-muted-foreground/40"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                            />
                            <line
                                x1="16"
                                y1="9"
                                x2="16"
                                y2="14"
                                className="stroke-muted-foreground/50"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                            />
                        </svg>
                        <p className="text-sm font-medium text-muted-foreground">
                            Nothing brewing here
                        </p>
                        <p className="-mt-2 text-xs text-muted-foreground/70">
                            Try a different search or category
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-2">
                        {filteredItems.map((item) => {
                            const isFetching = fetchingItemId === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleItemClick(item.id)}
                                    disabled={isFetching}
                                    className="group flex flex-col overflow-hidden rounded-lg border border-[var(--pos-border)] bg-[var(--pos-card)] text-left transition-colors hover:bg-[var(--pos-hover)] active:bg-[var(--pos-hover)] disabled:pointer-events-none disabled:opacity-60"
                                >
                                    <div className="relative aspect-4/3 overflow-hidden">
                                        {item.imageUrl ? (
                                            <img
                                                src={item.imageUrl}
                                                alt={item.name}
                                                className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="flex size-full flex-col items-center justify-center gap-2 bg-[#3a2518]">
                                                <svg
                                                    viewBox="0 0 48 52"
                                                    className="size-10"
                                                    fill="none"
                                                >
                                                    <path
                                                        d="M8 12h32l-3 28c-0.5 4-3.5 7-7.5 7h-11c-4 0-7-3-7.5-7L8 12Z"
                                                        className="fill-[var(--admin-accent)]/30"
                                                    />
                                                    <rect
                                                        x="10"
                                                        y="2"
                                                        width="28"
                                                        height="4"
                                                        rx="1"
                                                        className="fill-[var(--admin-accent)]/40"
                                                    />
                                                </svg>
                                                <svg
                                                    viewBox="0 0 24 24"
                                                    className="steam-wisp absolute top-[30%] left-[40%] size-3"
                                                >
                                                    <path
                                                        d="M4 12c0-2 1-4 3-5"
                                                        stroke="white"
                                                        strokeWidth="1.2"
                                                        strokeLinecap="round"
                                                        fill="none"
                                                        opacity="0.5"
                                                    />
                                                </svg>
                                                <svg
                                                    viewBox="0 0 24 24"
                                                    className="steam-wisp absolute top-[28%] left-[52%] size-2.5"
                                                >
                                                    <path
                                                        d="M4 12c0-2 1-4 3-5"
                                                        stroke="white"
                                                        strokeWidth="1"
                                                        strokeLinecap="round"
                                                        fill="none"
                                                        opacity="0.4"
                                                    />
                                                </svg>
                                                <svg
                                                    viewBox="0 0 24 24"
                                                    className="steam-wisp absolute top-[32%] left-[46%] size-2"
                                                >
                                                    <path
                                                        d="M4 12c0-2 1-4 3-5"
                                                        stroke="white"
                                                        strokeWidth="0.8"
                                                        strokeLinecap="round"
                                                        fill="none"
                                                        opacity="0.35"
                                                    />
                                                </svg>
                                            </div>
                                        )}
                                        {isFetching && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                                <SpinnerIcon className="size-6 animate-spin text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-1 flex-col gap-1 p-3 md:gap-0.5 md:p-2 lg:gap-0.5 lg:p-1.5">
                                        <p className="font-sans text-[13px] font-medium leading-tight text-[var(--pos-text)] md:text-[12px] lg:text-[11px]">
                                            {item.name}
                                        </p>
                                        <p className="font-mono text-[12px] font-bold tabular-nums text-[var(--pos-primary)] md:text-[11px] lg:text-[10px]">
                                            $
                                            {parseFloat(item.basePrice).toFixed(
                                                2,
                                            )}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MenuGrid;
