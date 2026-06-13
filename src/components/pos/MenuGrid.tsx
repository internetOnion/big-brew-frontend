import { useState, useMemo } from "react";
import { Search, Loader2, AlertCircle, RotateCw } from "lucide-react";
import { useCategories } from "./CategoryContext";
import { usePOS } from "@/hooks/usePos";
import { useMenuItems } from "@/hooks/useMenuItems";
import { toMenuItem } from "@/types/menu";

export const MenuGrid = () => {
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");
    const [fetchingItemId, setFetchingItemId] = useState<string | null>(null);
    const { categories } = useCategories();
    const { openCustomize } = usePOS();
    const { items, isLoading, error, refetch, fetchItemById } = useMenuItems();

    const filteredItems = useMemo(() => {
        return items.filter((item) => {
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
                <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5">
                    <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search menu..."
                        className="w-full bg-transparent text-sm text-foreground outline-none"
                    />
                </div>
            </div>

            <div className="flex gap-1 overflow-x-auto px-4 py-3 scrollbar-hide">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`shrink-0 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold transition-all ${
                            activeCategory === cat.id
                                ? "text-white"
                                : "bg-card text-foreground"
                        }`}
                        style={
                            activeCategory === cat.id
                                ? { background: cat.color }
                                : undefined
                        }
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-4">
                {isLoading ? (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div
                                key={i}
                                className="flex flex-col overflow-hidden rounded-xl border border-border bg-card"
                            >
                                <div className="aspect-4/3 animate-pulse bg-muted" />
                                <div className="flex flex-col gap-2 p-3">
                                    <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                                    <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-16">
                        <AlertCircle className="h-10 w-10 text-destructive" />
                        <p className="text-sm font-medium text-muted-foreground">
                            {error}
                        </p>
                        <button
                            onClick={refetch}
                            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                        >
                            <RotateCw className="h-3.5 w-3.5" />
                            Retry
                        </button>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <Search className="h-10 w-10 mb-3 text-muted-foreground" />
                        <p className="text-sm font-medium text-muted-foreground">
                            No items found
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
                        {filteredItems.map((item) => {
                            const isFetching = fetchingItemId === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleItemClick(item.id)}
                                    disabled={isFetching}
                                    className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card text-left transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
                                >
                                    <div className="relative aspect-4/3 overflow-hidden">
                                        <img
                                            src={
                                                item.imageUrl ??
                                                "https://placehold.co/400x300/3a2518/3a2518"
                                            }
                                            alt={item.name}
                                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            loading="lazy"
                                        />
                                        {isFetching && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                                <Loader2 className="h-6 w-6 animate-spin text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-1 flex-col gap-1 p-3">
                                        <p className="text-sm font-bold leading-tight font-sans text-foreground">
                                            {item.name}
                                        </p>
                                        <p className="text-sm font-semibold tabular-nums font-mono text-primary">
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
