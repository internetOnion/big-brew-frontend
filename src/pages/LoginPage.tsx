import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";
import { LoginBrandingPanel } from "@/components/common/LoginBrandingPanel";
import { LoginForm } from "@/components/common/LoginForm";
import { motion } from "motion/react";

const LoginPage = () => {
    const navigate = useNavigate();
    const { login, isLoading, isAuthenticated, isInitialized } = useAuth();
    const [error, setError] = useState("");

    useEffect(() => {
        if (isInitialized && isAuthenticated) {
            navigate(ROUTES.POS, { replace: true });
        }
    }, [isInitialized, isAuthenticated, navigate]);

    if (!isInitialized || isAuthenticated) return null;

    const handleLogin = async (email: string, password: string) => {
        setError("");

        if (!email.trim() || !password.trim()) {
            setError("Email and password are required.");
            return;
        }

        try {
            await login(email, password);
            navigate(ROUTES.POS, { replace: true });
        } catch {
            setError("Invalid email or password. Please try again.");
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-background lg:flex-row">
            <LoginBrandingPanel />
            <motion.div
                className="flex flex-1 items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.15 }}
            >
                <LoginForm
                    onSubmit={handleLogin}
                    isLoading={isLoading}
                    error={error}
                />
            </motion.div>
        </div>
    );
};

export default LoginPage;
