import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import LoadingScreen from "@/components/common/LoadingScreen";
import LoginPage from "./pages/LoginPage";

const POSPage = lazy(() => import("./pages/POSPage"));
const MenuView = lazy(() => import("./components/pos/MenuView"));
const PaymentView = lazy(() => import("./components/pos/PaymentView"));

const App = () => {
    return (
        <Suspense fallback={<LoadingScreen />}>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<POSPage />}>
                        <Route index element={<MenuView />} />
                        <Route path="payment" element={<PaymentView />} />
                    </Route>
                </Route>
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </Suspense>
    );
};

export default App;
