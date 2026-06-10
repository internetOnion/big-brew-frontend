import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { useAuth } from "@/hooks/useAuth";
import LoadingScreen from "@/components/common/LoadingScreen";
import "./index.css";
import App from "./App.tsx";

import "@fontsource-variable/bricolage-grotesque/wght.css";
import "@fontsource/dm-mono/400.css";
import "@fontsource/dm-mono/500.css";

const Root = () => {
    const { isInitialized } = useAuth();
    if (!isInitialized) return <LoadingScreen />;
    return (
        <BrowserRouter>
            <App />
        </BrowserRouter>
    );
};

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <AuthProvider>
            <Root />
        </AuthProvider>
    </StrictMode>,
);
