import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/common/ProtectedRoute";
import { ROUTES } from "./lib/constants";
import { Skeleton } from "./components/ui/skeleton";

const LoginPage = lazy(() => import("./pages/LoginPage"));
const PinPage = lazy(() => import("./pages/PinPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const MenuPage = lazy(() => import("./pages/MenuPage"));

const SuspenseFallback = (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <Skeleton className="h-96 w-full max-w-md rounded-[2rem]" />
    </div>
);

const App = () => {
    return (
        <Suspense fallback={SuspenseFallback}>
            <Routes>
                <Route element={<AuthLayout />}>
                    <Route path={ROUTES.LOGIN} element={<LoginPage />} />
                    <Route path={ROUTES.PIN} element={<PinPage />} />
                </Route>
                <Route element={<ProtectedRoute />}>
                    <Route element={<DashboardLayout />}>
                        <Route
                            path={ROUTES.DASHBOARD}
                            element={<DashboardPage />}
                        />
                        <Route path={ROUTES.MENU} element={<MenuPage />} />
                    </Route>
                </Route>
                <Route
                    path="/"
                    element={<Navigate to={ROUTES.LOGIN} replace />}
                />
            </Routes>
        </Suspense>
    );
};

export default App;
