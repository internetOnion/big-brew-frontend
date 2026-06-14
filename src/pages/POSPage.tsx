import { POSProvider } from "@/contexts/POSContext";
import { CategoryProvider } from "@/contexts/CategoryContext";
import POSLayout from "@/layouts/POSLayout";

export const POSPage = () => {
    return (
        <CategoryProvider>
            <POSProvider>
                <POSLayout />
            </POSProvider>
        </CategoryProvider>
    );
};

export default POSPage;
