import { useState } from "react";
import { ForkKnifeIcon, TrashIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import type { MenuItemListResponse } from "@/types/menu";

interface MenuItemCardProps {
    item: MenuItemListResponse;
    onEdit: (item: MenuItemListResponse) => void;
    onDelete: (item: MenuItemListResponse) => void;
    isDeleting?: boolean;
}

const MenuItemCard = ({
    item,
    onEdit,
    onDelete,
    isDeleting,
}: MenuItemCardProps) => {
    const [imgError, setImgError] = useState(false);
    const price = parseFloat(item.basePrice);

    return (
        <div className="group relative overflow-hidden rounded-lg border border-[var(--admin-border)] bg-[var(--admin-card)] transition-colors hover:border-[var(--admin-accent)]">
            {/* Image */}
            <div className="relative aspect-[4/3] overflow-hidden bg-[var(--admin-hover)]">
                {item.imageUrl && !imgError ? (
                    <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="size-full object-cover"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="flex size-full items-center justify-center">
                        <ForkKnifeIcon className="size-8 text-[var(--admin-text-muted)]" />
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
                    <p className="truncate text-[13px] font-medium text-[var(--admin-text)]">
                        {item.name}
                    </p>
                    <p className="font-mono text-[12px] text-[var(--admin-text-secondary)]">
                        ${price.toFixed(2)}
                    </p>
                </div>
                <div className="flex shrink-0 gap-1">
                    <Button
                        variant="outline"
                        size="xs"
                        onClick={() => onEdit(item)}
                        className="border-[var(--admin-border)] text-[11px] text-[var(--admin-text-secondary)] hover:text-[var(--admin-text)]"
                    >
                        Edit
                    </Button>
                    <Button
                        variant="outline"
                        size="xs"
                        onClick={() => onDelete(item)}
                        disabled={isDeleting}
                        className="border-[var(--admin-border)] text-red-500 hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                    >
                        <TrashIcon className="size-3" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default MenuItemCard;
