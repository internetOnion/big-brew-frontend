import { describe, it, expect } from "vitest";
import {
    categoryKeys,
    menuItemKeys,
    orderKeys,
    expenseKeys,
    analyticsKeys,
    discountKeys,
} from "@/lib/query-keys";

describe("query-keys", () => {
    it("categoryKeys.all is stable", () => {
        expect(categoryKeys.all).toEqual(["categories"]);
        expect(categoryKeys.all).toBe(categoryKeys.all);
    });

    it("menuItemKeys.detail builds correct key", () => {
        expect(menuItemKeys.detail("abc")).toEqual(["menu-items", "abc"]);
    });

    it("orderKeys.pending is stable", () => {
        expect(orderKeys.pending).toEqual(["orders", "pending"]);
    });

    it("orderKeys.list with filters", () => {
        expect(orderKeys.list({ status: "pending" })).toEqual([
            "orders",
            "admin",
            { status: "pending" },
        ]);
    });

    it("expenseKeys.summary builds correct key", () => {
        expect(expenseKeys.summary("2026-01-01", "2026-01-31")).toEqual([
            "expenses",
            "summary",
            "2026-01-01",
            "2026-01-31",
        ]);
    });

    it("analyticsKeys.revenue builds correct key", () => {
        expect(
            analyticsKeys.revenue("2026-01-01", "2026-01-31", "day"),
        ).toEqual(["analytics", "revenue", "2026-01-01", "2026-01-31", "day"]);
    });

    it("discountKeys.active is stable", () => {
        expect(discountKeys.active).toEqual(["discounts", "active"]);
    });
});
