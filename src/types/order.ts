export type OrderStatus = "pending" | "completed" | "void_requested" | "voided";

export type DiningOption = "dine_in" | "take_away";

export type PaymentMethod = "cash" | "qr";

export type PaymentStatus = "pending" | "paid" | "refunded";

export type DiscountType = "percentage" | "fixed_amount" | "bogo";

export interface OrderItemModifier {
    id: string;
    modifierOptionId: string;
    modifierGroupId: string;
    groupName: string;
    name: string;
    price: string;
}

export interface OrderItem {
    id: string;
    menuItemId: string;
    name: string;
    unitPrice: string;
    quantity: number;
    modifiers: OrderItemModifier[];
}

export interface OrderEmployee {
    id: string;
    name: string;
}

export interface Payment {
    id: string;
    orderId: string;
    method: PaymentMethod;
    amount: string;
    amountReceived: string | null;
    changeAmount: string | null;
    status: PaymentStatus;
    createdBy: OrderEmployee;
    createdAt: string;
    updatedAt: string;
}

export interface Order {
    id: string;
    orderNumber: number;
    receiptNumber: number;
    status: OrderStatus;
    diningOption: DiningOption;
    subtotal: string;
    discountId: string | null;
    discountAmount: string;
    total: string;
    paymentStatus: PaymentStatus;
    createdBy: OrderEmployee;
    voidRequestedBy: OrderEmployee | null;
    voidRequestedAt: string | null;
    voidApprovedBy: OrderEmployee | null;
    voidApprovedAt: string | null;
    voidRejectedAt: string | null;
    voidReason: string | null;
    items: OrderItem[];
    payments: Payment[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateOrderPayload {
    dining_option: DiningOption;
    discount_id?: string;
    items: {
        menu_item_id: string;
        quantity: number;
        unit_price: number;
        modifier_option_ids: string[];
    }[];
    payment_method?: PaymentMethod;
    amount_received?: number;
}

export interface ProcessPaymentPayload {
    payment_method: PaymentMethod;
    amount_received?: number;
    notes?: string;
}

export interface RequestVoidPayload {
    reason: string;
}

export interface Discount {
    id: string;
    name: string;
    type: DiscountType;
    value: string | null;
    buyItemId: string | null;
    freeItemId: string | null;
    isActive: boolean;
    startsAt: string | null;
    endsAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface Settings {
    id: number;
    storeName: string;
    storeAddress: string | null;
    currencySymbol: string;
    receiptHeader: string | null;
    receiptFooter: string | null;
    taxLabel: string;
    logoUrl: string | null;
    qrCodeUrl: string | null;
    createdAt: string;
    updatedAt: string;
}
