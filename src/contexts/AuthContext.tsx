import { createContext, useState, useCallback, type ReactNode } from "react";
import type { UserProfile } from "@/types/auth";

export interface AuthContextValue {
    user: UserProfile | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (email: string) => void;
    verifyPin: (pin: string) => boolean;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const login = useCallback((email: string) => {
        setIsLoading(true);
        setError(null);
        // TODO: Replace with actual API call
        const mockUser: UserProfile = {
            id: "1",
            email,
            createdAt: new Date().toISOString(),
        };
        setUser(mockUser);
        setIsAuthenticated(true);
        setIsLoading(false);
    }, []);

    const verifyPin = useCallback((pin: string): boolean => {
        // TODO: Replace with actual PIN validation
        if (pin === "123456") {
            setIsAuthenticated(true);
            return true;
        }
        setError("Incorrect PIN");
        return false;
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        setIsAuthenticated(false);
        setError(null);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                isLoading,
                error,
                login,
                verifyPin,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
