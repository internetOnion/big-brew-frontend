import { useRef, useState } from "react";
import { toast } from "sonner";
import {
    UploadSimpleIcon,
    TrashIcon,
    ForkKnifeIcon,
} from "@phosphor-icons/react";
import api from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import { useQueryClient } from "@tanstack/react-query";
import { menuItemKeys } from "@/lib/query-keys";
import { Button } from "@/components/ui/button";

interface MenuItemImageUploadProps {
    itemId: string;
    imageUrl: string | null;
    onImageUpdated: (url: string | null) => void;
}

const MenuItemImageUpload = ({
    itemId,
    imageUrl,
    onImageUpdated,
}: MenuItemImageUploadProps) => {
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [imgError, setImgError] = useState(false);

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: menuItemKeys.all });
        queryClient.invalidateQueries({
            queryKey: menuItemKeys.detail(itemId),
        });
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image must be under 5MB");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        setUploading(true);
        try {
            const { data } = await api.put<{ data: { imageUrl: string } }>(
                ENDPOINTS.MENU.IMAGE(itemId),
                formData,
                { headers: { "Content-Type": undefined } },
            );
            onImageUpdated(data.data.imageUrl);
            setImgError(false);
            invalidate();
            toast.success("Image uploaded");
        } catch {
            toast.error("Failed to upload image");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleDelete = async () => {
        const previousUrl = imageUrl;
        onImageUpdated(null);
        setImgError(false);
        setUploading(true);
        try {
            await api.delete(ENDPOINTS.MENU.IMAGE(itemId));
            invalidate();
            toast.success("Image removed");
        } catch {
            onImageUpdated(previousUrl);
            toast.error("Failed to remove image");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex items-start gap-4">
            <div className="relative h-32 w-40 shrink-0 overflow-hidden rounded-lg border border-(--admin-border) bg-(--admin-hover)">
                {imageUrl && !imgError ? (
                    <img
                        src={imageUrl}
                        alt="Menu item"
                        className="size-full object-cover"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="flex size-full items-center justify-center">
                        <ForkKnifeIcon className="size-8 text-(--admin-text-muted)" />
                    </div>
                )}

                {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <div className="size-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    </div>
                )}

                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/0 opacity-0 transition-opacity hover:bg-black/40 hover:opacity-100"
                >
                    <UploadSimpleIcon className="size-5 text-white" />
                </button>
            </div>

            <div className="flex flex-col gap-2">
                <p className="text-[12px] text-(--admin-text-secondary)">
                    JPEG, PNG, GIF, WebP. Max 5MB.
                </p>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="xs"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="border-(--admin-border) text-[11px] text-(--admin-text-secondary)"
                    >
                        <UploadSimpleIcon className="size-3" />
                        {imageUrl ? "Replace" : "Upload"}
                    </Button>
                    {imageUrl && (
                        <Button
                            variant="outline"
                            size="xs"
                            onClick={handleDelete}
                            disabled={uploading}
                            className="border-red-200 text-[11px] text-red-500 hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                        >
                            <TrashIcon className="size-3" />
                            Remove
                        </Button>
                    )}
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml,image/bmp,image/tiff"
                    onChange={handleUpload}
                    className="hidden"
                />
            </div>
        </div>
    );
};

export default MenuItemImageUpload;
