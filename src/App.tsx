import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import AdminRoute from "@/components/common/AdminRoute";
import LoadingScreen from "@/components/common/LoadingScreen";
import LoginPage from "./pages/LoginPage";

const POSPage = lazy(() => import("./pages/POSPage"));
const MenuView = lazy(() => import("./components/pos/menu"));
const PaymentView = lazy(() => import("./components/pos/payment"));
const AdminLayout = lazy(() => import("./layouts/AdminLayout"));
const DashboardPage = lazy(() => import("./pages/admin/DashboardPage"));
const MenuPage = lazy(() => import("./pages/admin/MenuPage"));
const InventoryPage = lazy(() => import("./pages/admin/InventoryPage"));
const IngredientDetailPage = lazy(
    () => import("./pages/admin/IngredientDetailPage"),
);
const IngredientCreatePage = lazy(
    () => import("./pages/admin/IngredientCreatePage"),
);
const EmployeesPage = lazy(() => import("./pages/admin/EmployeesPage"));
const EmployeeCreatePage = lazy(
    () => import("./pages/admin/EmployeeCreatePage"),
);
const EmployeeDetailPage = lazy(
    () => import("./pages/admin/EmployeeDetailPage"),
);
const OrdersPage = lazy(() => import("./pages/admin/OrdersPage"));
const ExpensesPage = lazy(() => import("./pages/admin/ExpensesPage"));
const AdminSettingsPage = lazy(() => import("./pages/admin/SettingsPage"));
const MenuItemEditPage = lazy(() => import("./pages/admin/MenuItemEditPage"));
const MenuItemCreatePage = lazy(
    () => import("./pages/admin/MenuItemCreatePage"),
);
const CategoriesPage = lazy(() => import("./pages/admin/CategoriesPage"));

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
                    <Route element={<AdminRoute />}>
                        <Route path="/admin" element={<AdminLayout />}>
                            <Route index element={<DashboardPage />} />
                            <Route path="menu" element={<MenuPage />} />
                            <Route
                                path="menu/new"
                                element={<MenuItemCreatePage />}
                            />
                            <Route
                                path="menu/categories"
                                element={<CategoriesPage />}
                            />
                            <Route
                                path="menu/:id"
                                element={<MenuItemEditPage />}
                            />
                            <Route
                                path="inventory"
                                element={<InventoryPage />}
                            />
                            <Route
                                path="inventory/new"
                                element={<IngredientCreatePage />}
                            />
                            <Route
                                path="inventory/:id"
                                element={<IngredientDetailPage />}
                            />
                            <Route
                                path="employees"
                                element={<EmployeesPage />}
                            />
                            <Route
                                path="employees/new"
                                element={<EmployeeCreatePage />}
                            />
                            <Route
                                path="employees/:id"
                                element={<EmployeeDetailPage />}
                            />
                            <Route path="orders" element={<OrdersPage />} />
                            <Route path="expenses" element={<ExpensesPage />} />
                            <Route
                                path="settings"
                                element={<AdminSettingsPage />}
                            />
                        </Route>
                    </Route>
                </Route>
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </Suspense>
    );
};

export default App;
