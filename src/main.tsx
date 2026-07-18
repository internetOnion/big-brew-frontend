import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "sonner";
import { IconProvider } from "@/components/providers/IconProvider";
import { useAuth } from "@/hooks/useAuth";
import LoadingScreen from "@/components/common/LoadingScreen";
import "./index.css";
import App from "./App.tsx";

import "@fontsource-variable/bricolage-grotesque/wght.css";
import "@fontsource/dm-mono/400.css";
import "@fontsource/dm-mono/500.css";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

const Root = () => {
    const { isInitialized } = useAuth();
    if (!isInitialized) return <LoadingScreen />;
    return (
        <BrowserRouter>
            <App />
            <Toaster />
        </BrowserRouter>
    );
};

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <IconProvider>
                    <Root />
                </IconProvider>
            </AuthProvider>
        </QueryClientProvider>
    </StrictMode>,
);
