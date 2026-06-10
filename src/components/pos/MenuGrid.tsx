import { useState, useMemo } from "react";
import {
    Search,
    Coffee,
    Milk,
    Leaf,
    GlassWater,
    Croissant,
    Ruler,
    Sparkles,
    Droplets,
} from "lucide-react";
import { MENU_ITEMS, CATEGORY_ICONS } from "./data";
import { useCategories } from "./CategoryContext";
import { usePOS } from "@/contexts/POSContext";

const categoryIconMap: Record<string, React.ElementType> = {
    Coffee,
    Milk,
    Leaf,
    GlassWater,
    Croissant,
};

export const MenuGrid = () => {
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");
    const { categories } = useCategories();
    const { openCustomize } = usePOS();

    const filteredItems = useMemo(() => {
        return MENU_ITEMS.filter((item) => {
            const matchesSearch = item.name
                .toLowerCase()
                .includes(search.toLowerCase());
            const matchesCategory =
                activeCategory === "all" || item.category === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }, [search, activeCategory]);

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
                {filteredItems.length === 0 ? (
                        <div
                            key="empty"
                            className="flex flex-col items-center justify-center py-16"
                        >
                            <Search className="h-10 w-10 mb-3 text-muted-foreground" />
                            <p className="text-sm font-medium text-muted-foreground">
                                No items found
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
                            {filteredItems.map((item) => {
                                const CategoryIcon =
                                    categoryIconMap[
                                        CATEGORY_ICONS[item.category]
                                    ] || Coffee;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() =>
                                            openCustomize(item)
                                        }
                                        className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card text-left transition-transform hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        <div className="relative aspect-4/3 overflow-hidden">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                loading="lazy"
                                            />
                                            <div className="absolute top-2 left-2 flex gap-1">
                                                {item.hasSizes && (
                                                    <span
                                                        className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/85"
                                                        title="Multiple sizes"
                                                    >
                                                        <Ruler className="h-3 w-3 text-white" />
                                                    </span>
                                                )}
                                                {item.hasToppings && (
                                                    <span
                                                        className="flex h-5 w-5 items-center justify-center rounded-md bg-accent/85"
                                                        title="Toppings available"
                                                    >
                                                        <Sparkles className="h-3 w-3 text-white" />
                                                    </span>
                                                )}
                                                {item.hasSugar && (
                                                    <span
                                                        className="flex h-5 w-5 items-center justify-center rounded-md bg-muted-foreground/85"
                                                        title="Sugar adjustable"
                                                    >
                                                        <Droplets className="h-3 w-3 text-white" />
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-1 flex-col gap-1 p-3">
                                            <div className="flex items-center gap-1.5">
                                                <CategoryIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                                <p className="text-sm font-bold leading-tight font-sans text-foreground">
                                                    {item.name}
                                                </p>
                                            </div>
                                            <p className="text-sm font-semibold tabular-nums font-mono text-primary">
                                                ${item.basePrice.toFixed(2)}
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
