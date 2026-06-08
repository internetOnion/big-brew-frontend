import {
    createContext,
    useState,
    useEffect,
    useCallback,
    useRef,
    type ReactNode,
} from "react";
import type { UserProfile } from "@/types/auth";
import api, { setAccessToken, setOnTokenRefreshed } from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";

export interface AuthContextValue {
    user: UserProfile | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isInitialized: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    verifyPin: (pin: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

const mapUser = (data: Record<string, unknown>): UserProfile => ({
    id: data.id as string,
    email: data.email as string,
    name: data.name as string,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const initializedRef = useRef(false);

    const fetchUser = useCallback(async () => {
        const meRes = await api.get(ENDPOINTS.AUTH.ME);
        setUser(mapUser(meRes.data.data as Record<string, unknown>));
    }, []);

    useEffect(() => {
        if (initializedRef.current) return;
        initializedRef.current = true;

        setOnTokenRefreshed(() => {
            fetchUser().catch(() => {
                setAccessToken(null);
                setUser(null);
            });
        });

        const init = async () => {
            try {
                const { data } = await api.post(
                    ENDPOINTS.AUTH.REFRESH,
                    {},
                    { silent: true },
                );
                setAccessToken(data.data?.access_token);
                await fetchUser();
            } catch {
                setAccessToken(null);
                setUser(null);
            } finally {
                setIsInitialized(true);
            }
        };

        init();

        return () => setOnTokenRefreshed(null);
    }, [fetchUser]);

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const { data } = await api.post(ENDPOINTS.AUTH.LOGIN, {
                email,
                password,
            });
            setAccessToken(data.data?.access_token);
            await fetchUser();
        } catch {
            setError("Invalid email or password");
            throw new Error("Login failed");
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await api.post(ENDPOINTS.AUTH.LOGOUT);
        } catch {
            // even if the logout call fails, clear local state
        } finally {
            setAccessToken(null);
            setUser(null);
            setIsLoading(false);
        }
    };

    const verifyPin = async (pin: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const { data } = await api.post(ENDPOINTS.AUTH.PIN, { pin });
            setAccessToken(data.data?.access_token);
            await fetchUser();
        } catch {
            setError("Invalid PIN.");
            throw new Error("PIN verification failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: user !== null,
                isLoading,
                isInitialized,
                error,
                login,
                logout,
                verifyPin,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
