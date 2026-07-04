import { useRef, useState } from "react";
import { toast } from "sonner";
import { UploadSimpleIcon, TrashIcon, ImageIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
    imageUrl: string | null;
    onUpload: (file: File) => Promise<void>;
    onRemove: () => Promise<void>;
    uploading?: boolean;
    label?: string;
}

const ImageUpload = ({
    imageUrl,
    onUpload,
    onRemove,
    uploading = false,
    label = "Image",
}: ImageUploadProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imgError, setImgError] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image must be under 5MB");
            return;
        }

        try {
            await onUpload(file);
            setImgError(false);
        } catch {
            toast.error(`Failed to upload ${label.toLowerCase()}`);
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    return (
        <div className="flex items-start gap-4">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-(--admin-border) bg-(--admin-hover)">
                {imageUrl && !imgError ? (
                    <img
                        src={imageUrl}
                        alt={label}
                        loading="lazy"
                        className="size-full object-contain"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="flex size-full items-center justify-center">
                        <ImageIcon className="size-6 text-(--admin-text-muted)" />
                    </div>
                )}

                {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-(--admin-text)/30">
                        <div className="size-5 animate-spin rounded-full border-2 border-(--admin-card) border-t-transparent" />
                    </div>
                )}

                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    aria-label={imageUrl ? "Replace image" : "Upload image"}
                    className="absolute inset-0 flex cursor-pointer items-center justify-center bg-(--admin-text)/0 opacity-0 transition-opacity hover:bg-(--admin-text)/40 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-(--admin-primary) focus-visible:outline"
                >
                    <UploadSimpleIcon className="size-5 text-(--admin-card)" />
                </button>
            </div>

            <div className="flex flex-col gap-2">
                <p className="text-[11px] text-(--admin-text-secondary)">
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
                            onClick={onRemove}
                            disabled={uploading}
                            className="border-destructive/30 text-[11px] text-destructive hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
                        >
                            <TrashIcon className="size-3" />
                            Remove
                        </Button>
                    )}
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                />
            </div>
        </div>
    );
};

export default ImageUpload;
