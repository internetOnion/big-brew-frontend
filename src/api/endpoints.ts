export const ENDPOINTS = {
    AUTH: {
        LOGIN: "/auth/login",
        LOGOUT: "/auth/logout",
        REFRESH: "/auth/refresh",
        PIN: "/auth/pin",
        ME: "/auth/me",
        SIGNUP: "/auth/signup",
    },
    MENU: {
        ITEMS: "/menu-items",
        BY_ID: (id: string) => `/menu-items/${id}`,
        IMAGE: (id: string) => `/menu-items/${id}/image`,
        RECIPES: (id: string) => `/menu-items/${id}/recipes`,
        RECIPE: (menuItemId: string, ingredientId: string) =>
            `/menu-items/${menuItemId}/recipes/${ingredientId}`,
        MODIFIER_GROUPS: (id: string) => `/menu-items/${id}/modifier-groups`,
        MODIFIER_GROUP: (menuItemId: string, groupId: string) =>
            `/menu-items/${menuItemId}/modifier-groups/${groupId}`,
        OPTION_INGREDIENTS: (
            menuItemId: string,
            groupId: string,
            optionId: string,
        ) =>
            `/menu-items/${menuItemId}/modifier-groups/${groupId}/options/${optionId}/ingredients`,
        OPTION_INGREDIENT: (
            menuItemId: string,
            groupId: string,
            optionId: string,
            ingredientId: string,
        ) =>
            `/menu-items/${menuItemId}/modifier-groups/${groupId}/options/${optionId}/ingredients/${ingredientId}`,
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
    EMPLOYEES: {
        BASE: "/employees",
        BY_ID: (id: string) => `/employees/${id}`,
    },
    EXPENSES: {
        BASE: "/expenses",
        BY_ID: (id: string) => `/expenses/${id}`,
        SUMMARY: "/expenses/summary",
    },
    STOCK_MOVEMENTS: {
        BASE: "/stock-movements",
    },
    ANALYTICS: {
        REVENUE: "/analytics/revenue",
        TOP_ITEMS: "/analytics/top-items",
        EXPENSES: "/analytics/expenses",
        SUMMARY: "/analytics/summary",
    },
    INGREDIENTS: {
        BASE: "/ingredients",
        BY_ID: (id: string) => `/ingredients/${id}`,
        ADJUST: (id: string) => `/ingredients/${id}/adjust`,
    },
    DISCOUNTS: {
        BASE: "/discounts",
        BY_ID: (id: string) => `/discounts/${id}`,
    },
    CATEGORIES: {
        BASE: "/categories",
    },
    MODIFIER_GROUPS: {
        BASE: "/modifier-groups",
    },
    SETTINGS: {
        BASE: "/settings",
        LOGO: "/settings/logo",
    },
} as const;
