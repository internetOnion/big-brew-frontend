import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const AdminRoute = () => {
    const { userType } = useAuth();

    if (userType === "terminal") {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default AdminRoute;
