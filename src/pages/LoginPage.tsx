import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";
import { LoginBrandingPanel } from "@/components/common/LoginBrandingPanel";
import { LoginForm } from "@/components/common/LoginForm";
import { motion } from "motion/react";

const getRedirectPath = (role: string): string => {
    if (role === "barista") return ROUTES.POS;
    return ROUTES.ADMIN;
};

const LoginPage = () => {
    const navigate = useNavigate();
    const { login, isLoading, isAuthenticated, isInitialized, user } =
        useAuth();
    const [error, setError] = useState("");

    useEffect(() => {
        if (isInitialized && isAuthenticated && user) {
            navigate(getRedirectPath(user.role), { replace: true });
        }
    }, [isInitialized, isAuthenticated, user, navigate]);

    if (!isInitialized || isAuthenticated) return null;

    const handleLogin = async (email: string, password: string) => {
        setError("");

        if (!email.trim() || !password.trim()) {
            setError("Email and password are required.");
            return;
        }

        try {
            const loggedInUser = await login(email, password);
            navigate(getRedirectPath(loggedInUser.role), { replace: true });
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
