import { useState, type SubmitEvent } from "react";
import { motion } from "motion/react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface LoginFormProps {
    onSubmit: (email: string, password: string) => Promise<void>;
    isLoading: boolean;
    error: string;
}

export const LoginForm = ({ onSubmit, isLoading, error }: LoginFormProps) => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!email.trim() || !password.trim()) return;
        await onSubmit(email, password);
    };

    return (
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

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
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
                                onChange={(e) => setPassword(e.target.value)}
                                className="h-12 rounded-xl border-border bg-secondary pr-12 pl-4 font-mono text-sm"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
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
    );
};
