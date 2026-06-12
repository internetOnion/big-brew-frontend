import { Navigate } from "react-router-dom";
import { usePOS } from "@/hooks/usePos";
import { ROUTES } from "@/lib/constants";
import PaymentScreen from "./PaymentScreen";

const PaymentView = () => {
    const { cartItems } = usePOS();

    if (cartItems.length === 0) {
        return <Navigate to={ROUTES.POS} replace />;
    }

    return (
        <div className="flex flex-1 overflow-hidden">
            <PaymentScreen />
        </div>
    );
};

export default PaymentView;
