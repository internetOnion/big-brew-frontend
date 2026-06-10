import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";

const LoginPage = lazy(() => import("./pages/LoginPage"));
const POSScreen = lazy(() => import("./components/pos/POSScreen"));

const SuspenseFallback = (
    <div
        style={{
            display: "flex",
            height: "100vh",
            width: "100vw",
            alignItems: "center",
            justifyContent: "center",
            background: "#F4EFE8",
        }}
    >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
            <div
                style={{
                    width: "40px",
                    height: "40px",
                    border: "4px solid #E2D8CC",
                    borderTopColor: "#4A2512",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                }}
            />
            <span style={{
                fontSize: "14px",
                fontWeight: 500,
                color: "#8B7A67",
                fontFamily: "'DM Mono', monospace",
            }}>
                Loading...
            </span>
        </div>
        <style>{`
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        `}</style>
    </div>
);

const App = () => {
    return (
        <Suspense fallback={SuspenseFallback}>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<POSScreen />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </Suspense>
    );
};

export default App;
