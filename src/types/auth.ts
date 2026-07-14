export type EmployeeRole = "barista" | "manager";

export type UserType = "employee" | "terminal";

export interface UserProfile {
    id: string;
    email: string;
    name: string;
    role: EmployeeRole;
    type: "employee";
}

export interface TerminalProfile {
    id: string;
    name: string;
    type: "terminal";
}

export type AuthUser = UserProfile | TerminalProfile;

export interface AuthContextValue {
    user: AuthUser | null;
    userType: UserType | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isInitialized: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<UserProfile>;
    terminalLogin: (
        email: string,
        password: string,
    ) => Promise<TerminalProfile>;
    logout: () => Promise<void>;
}
