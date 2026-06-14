export const categoryKeys = {
    all: ["categories"] as const,
};

export const menuItemKeys = {
    all: ["menu-items"] as const,
    detail: (id: string) => ["menu-items", id] as const,
};

export const orderKeys = {
    pending: ["orders", "pending"] as const,
};

export const settingKeys = {
    all: ["settings"] as const,
};
