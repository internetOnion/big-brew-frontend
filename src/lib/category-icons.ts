import {
    Coffee,
    Milk,
    Leaf,
    GlassWater,
    Croissant,
    type LucideIcon,
} from "lucide-react";

export const categoryIconMap: Record<string, LucideIcon> = {
    Coffee,
    Milk,
    Leaf,
    GlassWater,
    Croissant,
};

export const getCategoryIcon = (category: string): LucideIcon =>
    categoryIconMap[category] ?? Coffee;
