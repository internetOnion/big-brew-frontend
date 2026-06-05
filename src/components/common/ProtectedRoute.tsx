import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";

const ProtectedRoute = () => {
    const { isAuthenticated, isInitialized } = useAuth();

    if (!isInitialized) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background p-6">
                <Skeleton className="h-96 w-full max-w-md rounded-[2rem]" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to={ROUTES.LOGIN} replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
