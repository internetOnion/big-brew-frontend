import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/loginform";
import PinPage from "./pages/pinpage";
import DashboardPage from "./pages/dashboard";
import MenuPage from "./pages/menu";

const App = () => {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/pin" element={<PinPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/menu" element={<MenuPage />} />
        </Routes>
    );
};

export default App;
