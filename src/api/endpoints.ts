export const ENDPOINTS = {
    HEALTH: "/health",
    SETTINGS: "/settings",
    AUTH: {
        LOGIN: "/auth/login",
        LOGOUT: "/auth/logout",
        REFRESH: "/auth/refresh",
        PIN: "/auth/pin",
        ME: "/auth/me",
    },
} as const;
export default ENDPOINTS;
