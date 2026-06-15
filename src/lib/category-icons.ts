import { Coffee, Leaf, Wine, Bread } from "@phosphor-icons/react";
import type { ElementType } from "react";

export const categoryIconMap: Record<string, ElementType> = {
    Coffee,
    Milk: Coffee,
    Leaf,
    Wine,
    Bread,
};

export const getCategoryIcon = (category: string): ElementType =>
    categoryIconMap[category] ?? Coffee;
