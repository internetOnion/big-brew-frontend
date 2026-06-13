export const ENDPOINTS = {
    AUTH: {
        LOGIN: "/auth/login",
        LOGOUT: "/auth/logout",
        REFRESH: "/auth/refresh",
        PIN: "/auth/pin",
        ME: "/auth/me",
    },
    MENU: {
        ITEMS: "/menu-items",
    },
    ORDERS: {
        BASE: "/orders",
        BY_ID: (id: string) => `/orders/${id}`,
        STATUS: (id: string) => `/orders/${id}/status`,
        PAY: (id: string) => `/orders/${id}/pay`,
        VOID_REQUEST: (id: string) => `/orders/${id}/void-request`,
        VOID_APPROVE: (id: string) => `/orders/${id}/void-approve`,
        VOID_REJECT: (id: string) => `/orders/${id}/void-reject`,
    },
    DISCOUNTS: {
        BASE: "/discounts",
    },
    SETTINGS: {
        BASE: "/settings",
    },
} as const;
