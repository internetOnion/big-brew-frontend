import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Coffee } from "lucide-react";
import { ROUTES } from "@/lib/constants";

const AUTH_KEY = "brewpoint_auth";

const VALID_EMAIL = "admin@brewpoint.com";
const VALID_PASSWORD = "brewpoint2024";

const LoginPage = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        if (!email.trim() || !password.trim()) {
            setError("Email and password are required.");
            return;
        }

        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 400));

        if (email === VALID_EMAIL && password === VALID_PASSWORD) {
            localStorage.setItem(AUTH_KEY, "true");
            navigate(ROUTES.POS);
        } else {
            setError("Invalid email or password. Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            display: "flex",
            minHeight: "100vh",
            background: "#F4EFE8",
        }}>
            {/* Left Branding Panel */}
            <div style={{
                width: "42%",
                background: "#2C1810",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
            }}>
                {/* Decorative Rings */}
                <div style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "600px",
                    height: "600px",
                    borderRadius: "50%",
                    border: "1px solid rgba(192, 120, 48, 0.08)",
                }} />
                <div style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "480px",
                    height: "480px",
                    borderRadius: "50%",
                    border: "1px solid rgba(192, 120, 48, 0.12)",
                }} />
                <div style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "360px",
                    height: "360px",
                    borderRadius: "50%",
                    border: "1px solid rgba(192, 120, 48, 0.16)",
                }} />
                <div style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "240px",
                    height: "240px",
                    borderRadius: "50%",
                    border: "1px solid rgba(192, 120, 48, 0.2)",
                }} />

                {/* Brand Content */}
                <div style={{
                    position: "relative",
                    zIndex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "24px",
                }}>
                    <div style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "24px",
                        background: "rgba(192, 120, 48, 0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid rgba(192, 120, 48, 0.25)",
                    }}>
                        <Coffee size={40} color="#C07830" />
                    </div>
                    <div style={{ textAlign: "center" }}>
                        <h1 style={{
                            fontFamily: "'Bricolage Grotesque', sans-serif",
                            fontSize: "48px",
                            fontWeight: 800,
                            color: "#F4EFE8",
                            margin: 0,
                            letterSpacing: "-0.03em",
                            lineHeight: 1,
                        }}>
                            Big Brew
                        </h1>
                        <p style={{
                            fontFamily: "'DM Mono', monospace",
                            fontSize: "13px",
                            color: "rgba(192, 120, 48, 0.7)",
                            marginTop: "12px",
                            letterSpacing: "0.15em",
                            textTransform: "uppercase",
                        }}>
                            Point of Sale
                        </p>
                    </div>
                </div>

                {/* Bottom tagline */}
                <p style={{
                    position: "absolute",
                    bottom: "40px",
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "11px",
                    color: "rgba(139, 122, 103, 0.5)",
                    letterSpacing: "0.1em",
                }}>
                    crafted with care since 2024
                </p>
            </div>

            {/* Right Login Form Panel */}
            <div style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "48px",
            }}>
                <div style={{ width: "100%", maxWidth: "400px" }}>
                    <div style={{ marginBottom: "48px" }}>
                        <h2 style={{
                            fontFamily: "'Bricolage Grotesque', sans-serif",
                            fontSize: "28px",
                            fontWeight: 700,
                            color: "#1A0F0A",
                            margin: 0,
                        }}>
                            Welcome back
                        </h2>
                        <p style={{
                            fontFamily: "'DM Mono', monospace",
                            fontSize: "13px",
                            color: "#8B7A67",
                            marginTop: "8px",
                        }}>
                            Sign in to open the register
                        </p>
                    </div>

                    {error && (
                        <div style={{
                            marginBottom: "24px",
                            padding: "14px 18px",
                            borderRadius: "10px",
                            background: "rgba(192, 57, 43, 0.06)",
                            border: "1px solid rgba(192, 57, 43, 0.15)",
                            color: "#c0392b",
                            fontSize: "13px",
                            fontFamily: "'DM Mono', monospace",
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "24px",
                    }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            <label style={{
                                fontFamily: "'DM Mono', monospace",
                                fontSize: "11px",
                                fontWeight: 500,
                                color: "#8B7A67",
                                letterSpacing: "0.1em",
                                textTransform: "uppercase",
                            }}>
                                Email
                            </label>
                            <input
                                type="email"
                                placeholder="admin@brewpoint.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{
                                    height: "52px",
                                    borderRadius: "10px",
                                    padding: "0 18px",
                                    fontSize: "14px",
                                    fontFamily: "'DM Mono', monospace",
                                    background: "#F0EBE3",
                                    border: "1px solid #E2D8CC",
                                    color: "#1A0F0A",
                                    outline: "none",
                                    transition: "border-color 0.2s",
                                }}
                                onFocus={(e) => e.currentTarget.style.borderColor = "#C07830"}
                                onBlur={(e) => e.currentTarget.style.borderColor = "#E2D8CC"}
                                required
                            />
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            <label style={{
                                fontFamily: "'DM Mono', monospace",
                                fontSize: "11px",
                                fontWeight: 500,
                                color: "#8B7A67",
                                letterSpacing: "0.1em",
                                textTransform: "uppercase",
                            }}>
                                Password
                            </label>
                            <div style={{ position: "relative" }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={{
                                        height: "52px",
                                        width: "100%",
                                        borderRadius: "10px",
                                        padding: "0 48px 0 18px",
                                        fontSize: "14px",
                                        fontFamily: "'DM Mono', monospace",
                                        background: "#F0EBE3",
                                        border: "1px solid #E2D8CC",
                                        color: "#1A0F0A",
                                        outline: "none",
                                        transition: "border-color 0.2s",
                                        boxSizing: "border-box",
                                    }}
                                    onFocus={(e) => e.currentTarget.style.borderColor = "#C07830"}
                                    onBlur={(e) => e.currentTarget.style.borderColor = "#E2D8CC"}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: "absolute",
                                        right: "16px",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        color: "#8B7A67",
                                        padding: 0,
                                        display: "flex",
                                        alignItems: "center",
                                    }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                height: "52px",
                                borderRadius: "10px",
                                background: "#2C1810",
                                color: "#F4EFE8",
                                fontSize: "14px",
                                fontWeight: 700,
                                fontFamily: "'Bricolage Grotesque', sans-serif",
                                border: "none",
                                cursor: isLoading ? "not-allowed" : "pointer",
                                opacity: isLoading ? 0.7 : 1,
                                transition: "all 0.2s",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "8px",
                                marginTop: "8px",
                            }}
                        >
                            {isLoading ? (
                                <>
                                    <div style={{
                                        width: "18px",
                                        height: "18px",
                                        border: "2px solid rgba(244, 239, 232, 0.3)",
                                        borderTopColor: "#F4EFE8",
                                        borderRadius: "50%",
                                        animation: "spin 0.8s linear infinite",
                                    }} />
                                    Signing in...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>

                    <div style={{
                        marginTop: "40px",
                        padding: "16px",
                        borderRadius: "10px",
                        background: "#F0EBE3",
                        border: "1px solid #E2D8CC",
                    }}>
                        <p style={{
                            fontFamily: "'DM Mono', monospace",
                            fontSize: "11px",
                            color: "#8B7A67",
                            margin: 0,
                            lineHeight: 1.6,
                        }}>
                            <span style={{ color: "#4A2512", fontWeight: 500 }}>Demo:</span>{" "}
                            admin@brewpoint.com / brewpoint2024
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes spin {
                    to { transform: translateY(-50%) rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default LoginPage;
