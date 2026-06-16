export type StockStatus = "ok" | "low" | "critical";

export const getStockStatus = (
    stock: string,
    threshold: string,
): StockStatus => {
    const s = parseFloat(stock);
    const t = parseFloat(threshold);
    if (s <= t / 2) return "critical";
    if (s <= t) return "low";
    return "ok";
};

export const stockStatusConfig: Record<
    StockStatus,
    { label: string; className: string }
> = {
    ok: {
        label: "OK",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    low: {
        label: "Low",
        className: "bg-amber-50 text-amber-700 border-amber-200",
    },
    critical: {
        label: "Critical",
        className: "bg-red-50 text-red-700 border-red-200",
    },
};
