import { useState, useMemo } from "react";
import { Search, Loader2, AlertCircle, RotateCw } from "lucide-react";
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
                <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5">
                    <Search className="size-4 shrink-0 text-muted-foreground" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search menu..."
                        className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                    />
                </div>
            </div>

            <div className="flex gap-1 overflow-x-auto px-4 py-3 scrollbar-hide">
                {categories.map((cat) => (
                    <Button
                        key={cat.id}
                        variant={
                            activeCategory === cat.id ? "default" : "outline"
                        }
                        size="default"
                        onClick={() => setActiveCategory(cat.id)}
                        className="shrink-0 text-xs"
                    >
                        {cat.label}
                    </Button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-4 pos-scroll">
                {isLoading ? (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <Card key={i} className="overflow-hidden">
                                <Skeleton className="aspect-4/3 rounded-none" />
                                <div className="flex flex-col gap-2 p-3">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-4 w-1/3" />
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-16">
                        <AlertCircle className="size-10 text-destructive" />
                        <p className="text-sm font-medium text-muted-foreground">
                            {error.message}
                        </p>
                        <Button
                            variant="outline"
                            size="default"
                            onClick={() => refetch()}
                        >
                            <RotateCw />
                            Retry
                        </Button>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <Search className="mb-3 size-10 text-muted-foreground" />
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
                                    className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card text-left transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
                                >
                                    <div className="relative aspect-4/3 overflow-hidden">
                                        <img
                                            src={
                                                item.imageUrl ??
                                                "https://placehold.co/400x300/3a2518/3a2518"
                                            }
                                            alt={item.name}
                                            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            loading="lazy"
                                        />
                                        {isFetching && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                                <Loader2 className="size-6 animate-spin text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-1 flex-col gap-1 p-3">
                                        <p className="font-sans text-sm font-bold leading-tight text-foreground">
                                            {item.name}
                                        </p>
                                        <p className="font-mono text-sm font-semibold tabular-nums text-primary">
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
