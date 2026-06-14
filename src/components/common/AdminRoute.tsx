import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const AdminRoute = () => {
    const { user } = useAuth();

    if (user?.role === "barista") {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default AdminRoute;
