import { useState } from "react";
import {
    ForkKnifeIcon,
    DotsThreeVerticalIcon,
    PencilSimpleIcon,
    TrashIcon,
} from "@phosphor-icons/react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { MenuItemListResponse } from "@/types/menu";

interface MenuItemCardProps {
    item: MenuItemListResponse;
    onEdit: (item: MenuItemListResponse) => void;
    onDelete: (item: MenuItemListResponse) => void;
}

const MenuItemCard = ({ item, onEdit, onDelete }: MenuItemCardProps) => {
    const [imgError, setImgError] = useState(false);
    const price = parseFloat(item.basePrice);

    return (
        <div
            onClick={() => onEdit(item)}
            className="group relative cursor-pointer overflow-hidden rounded-lg border border-(--admin-border) bg-(--admin-card) transition-colors hover:border-(--admin-accent)"
        >
            {/* Image */}
            <div className="relative aspect-[4/3] overflow-hidden bg-(--admin-hover)">
                {item.imageUrl && !imgError ? (
                    <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="size-full object-cover"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="flex size-full items-center justify-center">
                        <ForkKnifeIcon className="size-8 text-(--admin-text-muted)" />
                    </div>
                )}
                {/* Category badge */}
                <span className="absolute left-2 top-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary backdrop-blur-sm">
                    {item.category.name}
                </span>
                {/* Availability badge */}
                {item.isAvailable === false && (
                    <span className="absolute right-2 top-2 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700">
                        Unavailable
                    </span>
                )}
            </div>

            {/* Info */}
            <div className="flex items-center justify-between p-3">
                <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-(--admin-text)">
                        {item.name}
                    </p>
                    <p className="font-mono text-[12px] text-(--admin-text-secondary)">
                        ${price.toFixed(2)}
                    </p>
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                        <DropdownMenuTrigger className="flex size-7 shrink-0 items-center justify-center rounded-md border border-(--admin-border) text-(--admin-text-secondary) transition-colors hover:bg-(--admin-hover) hover:text-(--admin-text) cursor-pointer">
                            <DotsThreeVerticalIcon className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            sideOffset={4}
                            className="border-(--admin-border) bg-(--admin-card)"
                        >
                            <DropdownMenuItem onClick={() => onEdit(item)}>
                                <PencilSimpleIcon className="size-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                variant="destructive"
                                onClick={() => onDelete(item)}
                            >
                                <TrashIcon className="size-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
};

export default MenuItemCard;
