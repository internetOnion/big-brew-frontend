import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useDiscounts, useUpdateDiscount } from "@/hooks/useDiscounts";
import DiscountForm from "@/components/admin/discounts/DiscountForm";
import { Skeleton } from "@/components/ui/skeleton";
import type { CreateDiscountPayload } from "@/types/admin";

const DiscountEditPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: discounts, isLoading } = useDiscounts();
    const updateMutation = useUpdateDiscount();

    const discount = discounts?.find((d) => d.id === id);

    const handleSubmit = (payload: CreateDiscountPayload) => {
        if (!id) return;
        updateMutation.mutate(
            { id, ...payload },
            {
                onSuccess: () => {
                    toast.success("Discount updated");
                    navigate("/admin/discounts");
                },
                onError: () => toast.error("Failed to update discount"),
            },
        );
    };

    if (isLoading) {
        return (
            <div className="flex flex-col gap-5 p-5">
                <Skeleton className="h-5 w-40 bg-(--admin-hover)" />
                <Skeleton className="h-[400px] max-w-lg bg-(--admin-hover)" />
            </div>
        );
    }

    if (!discount) {
        return (
            <div className="flex flex-col items-center gap-2 p-10">
                <p className="text-xs text-(--admin-text-muted)">
                    Discount not found
                </p>
                <button
                    onClick={() => navigate("/admin/discounts")}
                    className="text-xs text-(--admin-primary) underline"
                >
                    Back to discounts
                </button>
            </div>
        );
    }

    return (
        <DiscountForm
            initialData={discount}
            onSubmit={handleSubmit}
            isPending={updateMutation.isPending}
            submitLabel="Save Changes"
        />
    );
};

export default DiscountEditPage;
