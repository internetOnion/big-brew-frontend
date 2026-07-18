import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";
import { LoginBrandingPanel } from "@/components/common/LoginBrandingPanel";
import { LoginForm } from "@/components/common/LoginForm";
import { motion } from "motion/react";

const LoginPage = () => {
    const navigate = useNavigate();
    const {
        login,
        terminalLogin,
        isLoading,
        isAuthenticated,
        isInitialized,
        user,
        userType,
    } = useAuth();
    const [error, setError] = useState("");

    useEffect(() => {
        if (isInitialized && isAuthenticated && user) {
            if (userType === "terminal") {
                navigate(ROUTES.POS, { replace: true });
            } else {
                navigate(ROUTES.ADMIN, { replace: true });
            }
        }
    }, [isInitialized, isAuthenticated, user, userType, navigate]);

    if (!isInitialized || isAuthenticated) return null;

    const handleLogin = async (email: string, password: string) => {
        setError("");

        if (!email.trim() || !password.trim()) {
            setError("Email and password are required.");
            return;
        }

        try {
            // Try employee login first
            await login(email, password);
            navigate(ROUTES.ADMIN, { replace: true });
        } catch {
            try {
                // Fall back to terminal login
                await terminalLogin(email, password);
                navigate(ROUTES.POS, { replace: true });
            } catch {
                setError("Invalid email or password. Please try again.");
            }
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-background md:flex-row">
            <LoginBrandingPanel />
            <motion.div
                className="flex flex-1 items-center justify-center px-6 py-12 md:px-10"
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
