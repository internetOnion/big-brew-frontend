export interface UserProfile {
    id: string;
    email: string;
    name: string;
}

export interface AuthState {
    user: UserProfile | null;
    isLoading: boolean;
    error: string | null;
}
