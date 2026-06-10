import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
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
import { type MenuItem, MENU_ITEMS, CATEGORY_ICONS } from "./data";
import { useCategories } from "./CategoryContext";

const categoryIconMap: Record<string, React.ElementType> = {
    Coffee,
    Milk,
    Leaf,
    GlassWater,
    Croissant,
};

interface MenuGridProps {
    onAddItem: (
        item: MenuItem,
        options: {
            size: string;
            toppings: { name: string; qty: number; price: number }[];
            sugarLevel: string;
            quantity: number;
            finalPrice: number;
            note: string;
        },
    ) => void;
    onEditItem?: (
        item: MenuItem,
        options: {
            size: string;
            toppings: { name: string; qty: number; price: number }[];
            sugarLevel: string;
            quantity: number;
            finalPrice: number;
            note: string;
        },
    ) => void;
    editingItemId?: string | null;
}

export const MenuGrid = ({ onAddItem }: MenuGridProps) => {
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");
    const { categories } = useCategories();

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
            {/* Search */}
            <div className="px-4 pt-4">
                <div
                    className="flex items-center gap-2 rounded-xl px-3 py-2.5"
                    style={{
                        background: "#FFFFFF",
                        border: "1px solid #E2D8CC",
                    }}
                >
                    <Search
                        className="h-4 w-4 shrink-0"
                        style={{ color: "#8B7A67" }}
                    />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search menu..."
                        className="w-full bg-transparent text-sm outline-none"
                        style={{ color: "#1A0F0A" }}
                    />
                </div>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-1 overflow-x-auto px-4 py-3 scrollbar-hide">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
                        style={{
                            background:
                                activeCategory === cat.id
                                    ? cat.color
                                    : "#FFFFFF",
                            color:
                                activeCategory === cat.id
                                    ? "#FFFFFF"
                                    : "#1A0F0A",
                            border: "1px solid #E2D8CC",
                        }}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto px-4 pb-4">
                <AnimatePresence mode="popLayout">
                    {filteredItems.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-16"
                        >
                            <Search
                                className="h-10 w-10 mb-3"
                                style={{ color: "#8B7A67" }}
                            />
                            <p
                                className="text-sm font-medium"
                                style={{ color: "#8B7A67" }}
                            >
                                No items found
                            </p>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
                            {filteredItems.map((item, idx) => {
                                const CategoryIcon =
                                    categoryIconMap[
                                        CATEGORY_ICONS[item.category]
                                    ] || Coffee;
                                return (
                                    <motion.button
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{
                                            opacity: 1,
                                            y: 0,
                                            transition: { delay: idx * 0.02 },
                                        }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        onClick={() =>
                                            onAddItem(item, {
                                                size: "M",
                                                toppings: [],
                                                sugarLevel: "50%",
                                                quantity: 1,
                                                finalPrice: item.basePrice,
                                                note: "",
                                            })
                                        }
                                        className="group flex flex-col overflow-hidden rounded-xl text-left transition-transform hover:scale-[1.02] active:scale-[0.98]"
                                        style={{
                                            background: "#FFFFFF",
                                            border: "1px solid #E2D8CC",
                                        }}
                                    >
                                        <div className="relative aspect-[4/3] overflow-hidden">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                loading="lazy"
                                            />
                                            <div className="absolute top-2 left-2 flex gap-1">
                                                {item.hasSizes && (
                                                    <span
                                                        className="flex h-5 w-5 items-center justify-center rounded-md"
                                                        style={{
                                                            background:
                                                                "rgba(74,37,18,0.85)",
                                                        }}
                                                        title="Multiple sizes"
                                                    >
                                                        <Ruler className="h-3 w-3 text-white" />
                                                    </span>
                                                )}
                                                {item.hasToppings && (
                                                    <span
                                                        className="flex h-5 w-5 items-center justify-center rounded-md"
                                                        style={{
                                                            background:
                                                                "rgba(192,120,48,0.85)",
                                                        }}
                                                        title="Toppings available"
                                                    >
                                                        <Sparkles className="h-3 w-3 text-white" />
                                                    </span>
                                                )}
                                                {item.hasSugar && (
                                                    <span
                                                        className="flex h-5 w-5 items-center justify-center rounded-md"
                                                        style={{
                                                            background:
                                                                "rgba(139,122,103,0.85)",
                                                        }}
                                                        title="Sugar adjustable"
                                                    >
                                                        <Droplets className="h-3 w-3 text-white" />
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-1 flex-col gap-1 p-3">
                                            <div className="flex items-center gap-1.5">
                                                <CategoryIcon
                                                    className="h-3.5 w-3.5"
                                                    style={{ color: "#8B7A67" }}
                                                />
                                                <p
                                                    className="text-sm font-bold leading-tight"
                                                    style={{
                                                        fontFamily:
                                                            "'Bricolage Grotesque', sans-serif",
                                                        color: "#1A0F0A",
                                                    }}
                                                >
                                                    {item.name}
                                                </p>
                                            </div>
                                            <p
                                                className="text-sm font-semibold tabular-nums"
                                                style={{
                                                    fontFamily:
                                                        "'DM Mono', monospace",
                                                    color: "#4A2512",
                                                }}
                                            >
                                                ${item.basePrice.toFixed(2)}
                                            </p>
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default MenuGrid;
