import {
    createContext,
    useState,
    useEffect,
    useCallback,
    useRef,
    type ReactNode,
} from "react";
import type {
    UserProfile,
    TerminalProfile,
    AuthUser,
    AuthContextValue,
    UserType,
    EmployeeRole,
} from "@/types/auth";
import api, { setAccessToken, setOnTokenRefreshed } from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";

export type { AuthContextValue };

export const AuthContext = createContext<AuthContextValue | null>(null);

const mapUser = (data: Record<string, unknown>): AuthUser => {
    const type = data.type as string;
    if (type === "terminal") {
        return {
            id: data.id as string,
            name: data.name as string,
            type: "terminal",
        };
    }
    return {
        id: data.id as string,
        email: data.email as string,
        name: data.name as string,
        role: data.role as EmployeeRole,
        type: "employee",
    };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [userType, setUserType] = useState<UserType | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const initializedRef = useRef(false);

    const fetchUser = useCallback(async () => {
        const meRes = await api.get(ENDPOINTS.AUTH.ME);
        const mapped = mapUser(meRes.data.data as Record<string, unknown>);
        setUser(mapped);
        setUserType(mapped.type);
    }, []);

    useEffect(() => {
        if (initializedRef.current) return;
        initializedRef.current = true;

        setOnTokenRefreshed(() => {
            fetchUser().catch(() => {
                setAccessToken(null);
                setUser(null);
                setUserType(null);
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
                // ponytail: clear stale cookie so the next login isn't haunted
                // by "session expired". Add server-side reason code when we need
                // to differentiate expired vs revoked.
                document.cookie =
                    "refresh_token=; Path=/api/auth; Max-Age=0; SameSite=None; Secure";
                setAccessToken(null);
                setUser(null);
                setUserType(null);
            } finally {
                setIsInitialized(true);
            }
        };

        init();

        return () => setOnTokenRefreshed(null);
    }, [fetchUser]);

    const login = async (
        email: string,
        password: string,
    ): Promise<UserProfile> => {
        setIsLoading(true);
        setError(null);

        try {
            const { data } = await api.post(ENDPOINTS.AUTH.LOGIN, {
                email,
                password,
            });
            setAccessToken(data.data?.access_token);
            await fetchUser();
            return data.data?.user as UserProfile;
        } catch {
            setError("Invalid email or password");
            throw new Error("Login failed");
        } finally {
            setIsLoading(false);
        }
    };

    const terminalLogin = async (
        email: string,
        password: string,
    ): Promise<TerminalProfile> => {
        setIsLoading(true);
        setError(null);

        try {
            const { data } = await api.post(ENDPOINTS.AUTH.TERMINAL_LOGIN, {
                email,
                password,
            });
            setAccessToken(data.data?.access_token);
            await fetchUser();
            return data.data?.terminal as TerminalProfile;
        } catch {
            setError("Invalid email or password");
            throw new Error("Terminal login failed");
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
            setUserType(null);
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                userType,
                isAuthenticated: user !== null,
                isLoading,
                isInitialized,
                error,
                login,
                terminalLogin,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
