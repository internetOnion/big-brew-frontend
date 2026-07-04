export const categoryKeys = {
    all: ["categories"] as const,
};

export const menuItemKeys = {
    all: ["menu-items"] as const,
    detail: (id: string) => ["menu-items", id] as const,
};

export const orderKeys = {
    pending: ["orders", "pending"] as const,
    list: (filters?: Record<string, unknown>) =>
        ["orders", "admin", filters] as const,
};

export const settingKeys = {
    all: ["settings"] as const,
};

export const employeeKeys = {
    all: ["employees"] as const,
};

export const expenseKeys = {
    all: (filters?: Record<string, unknown>) => ["expenses", filters] as const,
    summary: (from: string, to: string) =>
        ["expenses", "summary", from, to] as const,
};

export const stockMovementKeys = {
    all: (filters?: Record<string, unknown>) =>
        ["stock-movements", filters] as const,
};

export const analyticsKeys = {
    revenue: (from: string, to: string, groupBy: string) =>
        ["analytics", "revenue", from, to, groupBy] as const,
    topItems: (from: string, to: string, sortBy: string, limit: number) =>
        ["analytics", "top-items", from, to, sortBy, limit] as const,
    expenses: (from: string, to: string) =>
        ["analytics", "expenses", from, to] as const,
    summary: (from: string, to: string) =>
        ["analytics", "summary", from, to] as const,
};

export const ingredientKeys = {
    all: ["ingredients"] as const,
};

export const expenseCategoryKeys = {
    all: ["expense-categories"] as const,
};

export const discountKeys = {
    all: ["discounts"] as const,
};
