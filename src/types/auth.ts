export interface UserProfile {
    id: string;
    email: string;
    name: string;
}

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
