export interface ExpenseCategory {
    id: string;
    name: string;
    createdAt: string;
}

export interface AdminEmployee {
    id: string;
    name: string;
    role: "barista" | "manager" | "owner";
    supabaseUid: string | null;
    email?: string;
    isActive?: boolean;
}

export interface CreateEmployeePayload {
    name: string;
    email: string;
    password: string;
    role: "barista" | "manager" | "owner";
    pin?: string;
}

export interface UpdateEmployeePayload {
    name?: string;
    email?: string;
    role?: "barista" | "manager" | "owner";
    pin?: string;
    password?: string;
}

export interface Expense {
    id: string;
    description: string;
    amount: string;
    category: string | null;
    recordedBy: string;
    recordedByName: string | null;
    recordedAt: string;
    createdAt: string;
}

export interface CreateExpensePayload {
    description: string;
    amount: number;
    category: string;
    recordedAt?: string;
}

export interface UpdateExpensePayload {
    description?: string;
    amount?: number;
    category?: string;
}

export interface ExpenseSummary {
    total: string;
    byCategory: { category: string | null; total: string; count: number }[];
}

export interface StockMovement {
    id: string;
    ingredientId: string;
    ingredientName: string;
    ingredientUnit: string;
    quantityChange: string;
    reason: string;
    referenceOrderId: string | null;
    notes: string | null;
    createdAt: string;
}

export interface StockAdjustPayload {
    quantityChange: number;
    reason: "manual_restock" | "manual_deduction" | "manual_adjustment";
    notes?: string;
}

export interface RevenueDataPoint {
    period: string;
    revenue: string;
    orderCount: number;
}

export interface TopItem {
    menuItemId: string;
    name: string;
    quantity: number;
    revenue: string;
}

export interface AnalyticsSummary {
    totalRevenue: string;
    totalExpenses: string;
    netIncome: string;
    orderCount: number;
    averageOrderValue: string;
}

export interface AdminDiscount {
    id: string;
    name: string;
    type: "percentage" | "fixed_amount" | "bogo";
    value: string | null;
    buyItemId: string | null;
    freeItemId: string | null;
    isActive: boolean;
    startsAt: string | null;
    endsAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateDiscountPayload {
    name: string;
    type: "percentage" | "fixed_amount" | "bogo";
    value: number | null;
    buy_item_id: string | null;
    free_item_id: string | null;
    is_active?: boolean;
    starts_at?: string | null;
    ends_at?: string | null;
}

export type UpdateDiscountPayload = Partial<CreateDiscountPayload>;

export interface InventoryItem {
    id: string;
    name: string;
    unit: string;
    stockQuantity: string;
    lowStockThreshold: string;
}
