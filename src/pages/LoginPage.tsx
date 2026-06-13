import { useState, useEffect, type SubmitEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Eye, EyeOff } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const LoginPage = () => {
    const navigate = useNavigate();
    const { login, isLoading, isAuthenticated, isInitialized } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (isInitialized && isAuthenticated) {
            navigate(ROUTES.POS, { replace: true });
        }
    }, [isInitialized, isAuthenticated, navigate]);

    if (!isInitialized || isAuthenticated) return null;

    const handleLogin = async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
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
        <div className="flex min-h-screen bg-background">
            {/* Left Branding Panel */}
            <div className="relative flex w-[42%] flex-col items-center justify-center overflow-hidden bg-primary">
                {/* Decorative Rings */}
                <motion.div
                    className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary-foreground/8"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                />
                <motion.div
                    className="absolute top-1/2 left-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary-foreground/12"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.2, delay: 0.1, ease: "easeOut" }}
                />
                <motion.div
                    className="absolute top-1/2 left-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary-foreground/16"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
                />
                <motion.div
                    className="absolute top-1/2 left-1/2 h-[240px] w-[240px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary-foreground/20"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
                />

                {/* Brand Content */}
                <motion.div
                    className="relative z-10 flex flex-col items-center gap-6"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                >
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-primary-foreground/25 bg-primary-foreground/15">
                        <img
                            src="/homebrew.svg"
                            alt="Homebrew"
                            className="size-12 brightness-0 invert"
                        />
                    </div>
                    <div className="text-center">
                        <h1 className="font-sans text-5xl font-extrabold leading-none tracking-tight text-primary-foreground">
                            Big Brew
                        </h1>
                        <p className="mt-3 font-mono text-xs uppercase tracking-[0.15em] text-primary-foreground/70">
                            Point of Sale
                        </p>
                    </div>
                </motion.div>

                {/* Bottom tagline */}
                <motion.p
                    className="absolute bottom-10 font-mono text-[11px] tracking-[0.1em] text-primary-foreground/40"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                >
                    crafted with care since 2024
                </motion.p>
            </div>

            {/* Right Login Form Panel */}
            <div className="flex flex-1 items-center justify-center p-12">
                <motion.div
                    className="w-full max-w-[400px]"
                    initial={{ x: 30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                >
                    <div className="mb-12">
                        <h2 className="font-sans text-3xl font-bold text-foreground">
                            Welcome back
                        </h2>
                        <p className="mt-2 font-mono text-sm text-muted-foreground">
                            Sign in to open the register
                        </p>
                    </div>

                    {error && (
                        <motion.div
                            className="mb-6 rounded-xl border border-destructive/20 bg-destructive/8 px-5 py-3.5 font-mono text-sm text-destructive"
                            initial={{ y: -8, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            {error}
                        </motion.div>
                    )}

                    <form
                        onSubmit={handleLogin}
                        className="flex flex-col gap-6"
                    >
                        <div className="flex flex-col gap-2">
                            <label className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
                                Email
                            </label>
                            <Input
                                type="email"
                                placeholder="admin@brewpoint.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-12 rounded-xl border-border bg-secondary px-4 font-mono text-sm"
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
                                Password
                            </label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    className="h-12 rounded-xl border-border bg-secondary pr-12 pl-4 font-mono text-sm"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute top-1/2 right-4 flex -translate-y-1/2 items-center text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    {showPassword ? (
                                        <EyeOff size={18} />
                                    ) : (
                                        <Eye size={18} />
                                    )}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="mt-2 h-12 rounded-xl bg-primary font-sans text-sm font-bold"
                        >
                            {isLoading ? (
                                <>
                                    <div className="size-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                                    Signing in...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </Button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default LoginPage;
