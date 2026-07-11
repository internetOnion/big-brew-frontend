import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useCreateDiscount } from "@/hooks/useDiscounts";
import DiscountForm from "@/components/admin/discounts/DiscountForm";
import type { CreateDiscountPayload } from "@/types/admin";

const DiscountCreatePage = () => {
    const navigate = useNavigate();
    const createMutation = useCreateDiscount();

    const handleSubmit = (payload: CreateDiscountPayload) => {
        createMutation.mutate(payload, {
            onSuccess: () => {
                toast.success("Discount created");
                navigate("/admin/discounts");
            },
            onError: () => toast.error("Failed to create discount"),
        });
    };

    return (
        <DiscountForm
            onSubmit={handleSubmit}
            isPending={createMutation.isPending}
            submitLabel="Create Discount"
        />
    );
};

export default DiscountCreatePage;
