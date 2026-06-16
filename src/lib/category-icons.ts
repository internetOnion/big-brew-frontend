import {
    CoffeeIcon,
    LeafIcon,
    WineIcon,
    BreadIcon,
} from "@phosphor-icons/react";
import type { ElementType } from "react";

export const categoryIconMap: Record<string, ElementType> = {
    Coffee: CoffeeIcon,
    Leaf: LeafIcon,
    Milk: CoffeeIcon,
    Croissant: BreadIcon,
    Wine: WineIcon,
};

export const getCategoryIcon = (category: string): ElementType =>
    categoryIconMap[category] ?? CoffeeIcon;
