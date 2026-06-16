import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    MagnifyingGlassIcon,
    PlusIcon,
    PackageIcon,
} from "@phosphor-icons/react";
import { useIngredients } from "@/hooks/useInventory";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getStockStatus, stockStatusConfig } from "@/lib/format-stock";

const InventoryPage = () => {
    const navigate = useNavigate();
    const { data: ingredients, isLoading } = useIngredients();

    const [search, setSearch] = useState("");
    const [lowStockOnly, setLowStockOnly] = useState(false);

    const filtered = ingredients?.filter((ing) => {
        if (
            lowStockOnly &&
            parseFloat(ing.stockQuantity) > parseFloat(ing.lowStockThreshold)
        )
            return false;
        if (search && !ing.name.toLowerCase().includes(search.toLowerCase()))
            return false;
        return true;
    });

    return (
        <div className="flex flex-col gap-4 p-5">
            <div className="flex items-center justify-between">
                <h1 className="text-[13px] font-medium text-(--admin-primary)">
                    Inventory
                </h1>
                <Button
                    size="sm"
                    onClick={() => navigate("/admin/inventory/new")}
                    className="h-7 gap-1.5 bg-(--admin-primary) text-[11px] text-white hover:bg-[#3a1d0e] cursor-pointer"
                >
                    <PlusIcon className="size-3" />
                    Add Ingredient
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-(--admin-text-muted)" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search ingredients..."
                        className="h-8 w-48 border-(--admin-border) bg-(--admin-card) pl-8 text-xs placeholder:text-(--admin-text-muted)"
                    />
                </div>

                <Button
                    variant={lowStockOnly ? "default" : "outline"}
                    size="sm"
                    onClick={() => setLowStockOnly(!lowStockOnly)}
                    className={`h-7 text-[11px] ${
                        lowStockOnly
                            ? "bg-red-100 text-red-700 hover:bg-red-200"
                            : "border-(--admin-border) text-(--admin-text-secondary)"
                    }`}
                >
                    Low Stock Only
                </Button>
            </div>

            {/* Table */}
            <div className="admin-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-(--admin-border) bg-(--admin-hover)">
                                <th className="px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-wide text-(--admin-text-muted)">
                                    Name
                                </th>
                                <th className="px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-wide text-(--admin-text-muted)">
                                    Unit
                                </th>
                                <th className="px-4 py-2.5 text-right text-[10px] font-medium uppercase tracking-wide text-(--admin-text-muted)">
                                    Stock
                                </th>
                                <th className="px-4 py-2.5 text-right text-[10px] font-medium uppercase tracking-wide text-(--admin-text-muted)">
                                    Threshold
                                </th>
                                <th className="px-4 py-2.5 text-center text-[10px] font-medium uppercase tracking-wide text-(--admin-text-muted)">
                                    Status
                                </th>
                                <th className="w-16 px-2 py-2.5" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-(--admin-border)">
                            {isLoading ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-4 py-8 text-center text-xs text-(--admin-text-muted)"
                                    >
                                        Loading...
                                    </td>
                                </tr>
                            ) : !filtered || filtered.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-4 py-10 text-center"
                                    >
                                        <div className="flex flex-col items-center gap-1.5">
                                            <PackageIcon className="size-5 text-(--admin-text-muted)" />
                                            <p className="text-xs text-(--admin-text-muted)">
                                                No ingredients found
                                            </p>
                                            <p className="text-[10px] text-(--admin-text-muted)/70">
                                                Try adjusting your search or add
                                                a new ingredient
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((ing) => {
                                    const status = getStockStatus(
                                        ing.stockQuantity,
                                        ing.lowStockThreshold,
                                    );
                                    const config = stockStatusConfig[status];

                                    return (
                                        <tr
                                            key={ing.id}
                                            onClick={() =>
                                                navigate(
                                                    `/admin/inventory/${ing.id}`,
                                                )
                                            }
                                            className="admin-table-row cursor-pointer transition-colors hover:bg-(--admin-hover)"
                                        >
                                            <td className="px-4 py-2.5 text-[12px] font-medium text-(--admin-text)">
                                                {ing.name}
                                            </td>
                                            <td className="px-4 py-2.5 font-mono text-[11px] text-(--admin-text-secondary)">
                                                {ing.unit}
                                            </td>
                                            <td className="px-4 py-2.5 text-right font-mono text-[12px] text-(--admin-text)">
                                                {parseFloat(
                                                    ing.stockQuantity,
                                                ).toFixed(1)}
                                            </td>
                                            <td className="px-4 py-2.5 text-right font-mono text-[11px] text-(--admin-text-muted)">
                                                {parseFloat(
                                                    ing.lowStockThreshold,
                                                ).toFixed(1)}
                                            </td>
                                            <td className="px-4 py-2.5 text-center">
                                                <span
                                                    className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium ${config.className}`}
                                                >
                                                    {config.label}
                                                </span>
                                            </td>
                                            <td className="px-2 py-2.5 text-right">
                                                <Button
                                                    variant="outline"
                                                    size="xs"
                                                    className="border-(--admin-border) text-[11px] text-(--admin-text-secondary) hover:text-(--admin-text)"
                                                >
                                                    Edit
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default InventoryPage;
