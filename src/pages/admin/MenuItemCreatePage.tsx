import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
    ArrowLeft,
    Plus,
    Trash,
    CaretDown,
    CaretRight,
    PencilSimple,
    X,
    Check,
} from "@phosphor-icons/react";
import api from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import { useIngredients } from "@/hooks/useInventory";
import { useCategories } from "@/hooks/useCategories";
import { useQueryClient } from "@tanstack/react-query";
import { menuItemKeys } from "@/lib/query-keys";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { MenuItemListResponse } from "@/types/menu";

const newId = () => crypto.randomUUID();

type LocalRecipe = {
    id: string;
    ingredientId: string;
    name: string;
    unit: string;
    quantity: string;
};

type LocalOptionIngredient = {
    id: string;
    ingredientId: string;
    name: string;
    unit: string;
    quantity: string;
};

type LocalOption = {
    id: string;
    name: string;
    price: string;
    ingredients: LocalOptionIngredient[];
};

type LocalGroup = {
    id: string;
    name: string;
    selectionType: "single" | "multiple";
    isRequired: boolean;
    options: LocalOption[];
};

const MenuItemCreatePage = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { data: categories } = useCategories();
    const { data: ingredients } = useIngredients();

    const [name, setName] = useState("");
    const [basePrice, setBasePrice] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [isAvailable, setIsAvailable] = useState(true);
    const [creating, setCreating] = useState(false);

    // Recipe
    const [recipes, setRecipes] = useState<LocalRecipe[]>([]);
    const [newRecipeIngredient, setNewRecipeIngredient] = useState("");
    const [newRecipeQuantity, setNewRecipeQuantity] = useState("");

    // Modifier groups
    const [groups, setGroups] = useState<LocalGroup[]>([]);
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
        new Set(),
    );
    const [expandedOptions, setExpandedOptions] = useState<Set<string>>(
        new Set(),
    );

    // Add group form
    const [showAddGroup, setShowAddGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState("");
    const [newGroupType, setNewGroupType] = useState<"single" | "multiple">(
        "single",
    );
    const [newGroupRequired, setNewGroupRequired] = useState(false);

    // Edit group state
    const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
    const [editGroupName, setEditGroupName] = useState("");
    const [editGroupType, setEditGroupType] = useState<"single" | "multiple">(
        "single",
    );
    const [editGroupRequired, setEditGroupRequired] = useState(false);

    // Add option form
    const [addingOptionToGroup, setAddingOptionToGroup] = useState<
        string | null
    >(null);
    const [newOptionName, setNewOptionName] = useState("");
    const [newOptionPrice, setNewOptionPrice] = useState("0");

    // Edit option state
    const [editingOptionId, setEditingOptionId] = useState<string | null>(null);
    const [editOptionName, setEditOptionName] = useState("");
    const [editOptionPrice, setEditOptionPrice] = useState("");

    // Add option ingredient form
    const [addingIngredientToOption, setAddingIngredientToOption] = useState<
        string | null
    >(null);
    const [newOptionIngId, setNewOptionIngId] = useState("");
    const [newOptionIngQty, setNewOptionIngQty] = useState("");

    // --- Recipe handlers ---
    const handleAddRecipe = () => {
        if (!newRecipeIngredient || !newRecipeQuantity) return;
        if (parseFloat(newRecipeQuantity) <= 0) {
            toast.error("Quantity must be greater than 0");
            return;
        }
        const ing = ingredients?.find((i) => i.id === newRecipeIngredient);
        if (!ing) {
            toast.error("Please select an ingredient");
            return;
        }
        setRecipes((prev) => [
            ...prev,
            {
                id: newId(),
                ingredientId: ing.id,
                name: ing.name,
                unit: ing.unit,
                quantity: newRecipeQuantity,
            },
        ]);
        setNewRecipeIngredient("");
        setNewRecipeQuantity("");
    };

    const handleRemoveRecipe = (recipeId: string) => {
        setRecipes((prev) => prev.filter((r) => r.id !== recipeId));
    };

    // --- Group handlers ---
    const handleAddGroup = () => {
        if (!newGroupName.trim()) return;
        setGroups((prev) => [
            ...prev,
            {
                id: newId(),
                name: newGroupName.trim(),
                selectionType: newGroupType,
                isRequired: newGroupRequired,
                options: [],
            },
        ]);
        setNewGroupName("");
        setNewGroupType("single");
        setNewGroupRequired(false);
        setShowAddGroup(false);
    };

    const handleUpdateGroup = (groupId: string) => {
        if (!editGroupName.trim()) return;
        setGroups((prev) =>
            prev.map((g) =>
                g.id === groupId
                    ? {
                          ...g,
                          name: editGroupName.trim(),
                          selectionType: editGroupType,
                          isRequired: editGroupRequired,
                      }
                    : g,
            ),
        );
        setEditingGroupId(null);
    };

    const handleDeleteGroup = (groupId: string) => {
        setGroups((prev) => prev.filter((g) => g.id !== groupId));
    };

    const startEditGroup = (group: LocalGroup) => {
        setEditingGroupId(group.id);
        setEditGroupName(group.name);
        setEditGroupType(group.selectionType);
        setEditGroupRequired(group.isRequired);
    };

    // --- Option handlers ---
    const handleAddOption = (groupId: string) => {
        if (!newOptionName.trim()) return;
        setGroups((prev) =>
            prev.map((g) =>
                g.id === groupId
                    ? {
                          ...g,
                          options: [
                              ...g.options,
                              {
                                  id: newId(),
                                  name: newOptionName.trim(),
                                  price: newOptionPrice || "0",
                                  ingredients: [],
                              },
                          ],
                      }
                    : g,
            ),
        );
        setNewOptionName("");
        setNewOptionPrice("0");
        setAddingOptionToGroup(null);
    };

    const handleUpdateOption = (groupId: string, optionId: string) => {
        if (!editOptionName.trim()) return;
        setGroups((prev) =>
            prev.map((g) =>
                g.id === groupId
                    ? {
                          ...g,
                          options: g.options.map((o) =>
                              o.id === optionId
                                  ? {
                                        ...o,
                                        name: editOptionName.trim(),
                                        price: editOptionPrice || "0",
                                    }
                                  : o,
                          ),
                      }
                    : g,
            ),
        );
        setEditingOptionId(null);
    };

    const handleDeleteOption = (groupId: string, optionId: string) => {
        setGroups((prev) =>
            prev.map((g) =>
                g.id === groupId
                    ? {
                          ...g,
                          options: g.options.filter((o) => o.id !== optionId),
                      }
                    : g,
            ),
        );
    };

    const startEditOption = (option: LocalOption) => {
        setEditingOptionId(option.id);
        setEditOptionName(option.name);
        setEditOptionPrice(option.price);
    };

    // --- Option ingredient handlers ---
    const handleAddOptionIngredient = (groupId: string, optionId: string) => {
        if (!newOptionIngId || !newOptionIngQty) return;
        if (parseFloat(newOptionIngQty) <= 0) {
            toast.error("Quantity must be greater than 0");
            return;
        }
        const ing = ingredients?.find((i) => i.id === newOptionIngId);
        if (!ing) {
            toast.error("Please select an ingredient");
            return;
        }
        setGroups((prev) =>
            prev.map((g) =>
                g.id === groupId
                    ? {
                          ...g,
                          options: g.options.map((o) =>
                              o.id === optionId
                                  ? {
                                        ...o,
                                        ingredients: [
                                            ...o.ingredients,
                                            {
                                                id: newId(),
                                                ingredientId: ing.id,
                                                name: ing.name,
                                                unit: ing.unit,
                                                quantity: newOptionIngQty,
                                            },
                                        ],
                                    }
                                  : o,
                          ),
                      }
                    : g,
            ),
        );
        setNewOptionIngId("");
        setNewOptionIngQty("");
        setAddingIngredientToOption(null);
    };

    const handleRemoveOptionIngredient = (
        groupId: string,
        optionId: string,
        ingId: string,
    ) => {
        setGroups((prev) =>
            prev.map((g) =>
                g.id === groupId
                    ? {
                          ...g,
                          options: g.options.map((o) =>
                              o.id === optionId
                                  ? {
                                        ...o,
                                        ingredients: o.ingredients.filter(
                                            (i) => i.id !== ingId,
                                        ),
                                    }
                                  : o,
                          ),
                      }
                    : g,
            ),
        );
    };

    const toggleGroup = (groupId: string) => {
        setExpandedGroups((prev) => {
            const next = new Set(prev);
            if (next.has(groupId)) next.delete(groupId);
            else next.add(groupId);
            return next;
        });
    };

    const toggleOption = (optionId: string) => {
        setExpandedOptions((prev) => {
            const next = new Set(prev);
            if (next.has(optionId)) next.delete(optionId);
            else next.add(optionId);
            return next;
        });
    };

    const handleCreate = async () => {
        if (!name.trim() || !basePrice || !categoryId) {
            toast.error("Please fill in all required fields");
            return;
        }

        const body: Record<string, unknown> = {
            name: name.trim(),
            basePrice: parseFloat(basePrice),
            categoryId,
            isAvailable,
        };

        if (recipes.length > 0) {
            body.recipes = recipes.map((r) => ({
                ingredientId: r.ingredientId,
                quantity: parseFloat(r.quantity),
            }));
        }

        if (groups.length > 0) {
            body.modifierGroups = groups.map((g) => ({
                name: g.name,
                selectionType: g.selectionType,
                isRequired: g.isRequired,
                options: g.options.map((o) => ({
                    name: o.name,
                    price: parseFloat(o.price) || 0,
                    ...(o.ingredients.length > 0
                        ? {
                              ingredients: o.ingredients.map((i) => ({
                                  ingredientId: i.ingredientId,
                                  quantity: parseFloat(i.quantity),
                              })),
                          }
                        : {}),
                })),
            }));
        }

        setCreating(true);
        try {
            const { data } = await api.post<{ data: MenuItemListResponse }>(
                ENDPOINTS.MENU.ITEMS,
                body,
            );
            queryClient.invalidateQueries({ queryKey: menuItemKeys.all });
            toast.success("Item created");
            navigate(`/admin/menu/${data.data.id}`);
        } catch {
            toast.error("Failed to create item");
            setCreating(false);
        }
    };

    return (
        <div className="flex flex-col gap-5 p-5">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => navigate("/admin/menu")}
                    className="text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]"
                >
                    <ArrowLeft className="size-4" />
                </Button>
                <h1 className="text-[13px] font-medium text-[var(--admin-primary)]">
                    New Menu Item
                </h1>
            </div>

            {/* Basic Info */}
            <div className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-card)] p-4">
                <h2 className="mb-3 text-[11px] font-medium uppercase tracking-wide text-[var(--admin-text-secondary)]">
                    Basic Info
                </h2>
                <div className="grid gap-1.5">
                    <Label className="text-[11px] text-[var(--admin-text-secondary)]">
                        Name
                    </Label>
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Iced Caramel Latte"
                        className="h-8 border-[var(--admin-border)] bg-[var(--admin-card)] text-xs"
                    />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="grid gap-1.5">
                        <Label className="text-[11px] text-[var(--admin-text-secondary)]">
                            Base Price
                        </Label>
                        <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={basePrice}
                            onChange={(e) => setBasePrice(e.target.value)}
                            placeholder="0.00"
                            className="h-8 border-[var(--admin-border)] bg-[var(--admin-card)] font-mono text-xs"
                        />
                    </div>
                    <div className="grid gap-1.5">
                        <Label className="text-[11px] text-[var(--admin-text-secondary)]">
                            Category
                        </Label>
                        <Select
                            key={categories?.length}
                            value={categoryId}
                            onValueChange={(v) => setCategoryId(v ?? "")}
                        >
                            <SelectTrigger className="h-8 w-full border-[var(--admin-border)] bg-[var(--admin-card)] text-xs">
                                <SelectValue>
                                    {(val) =>
                                        categories?.find((c) => c.id === val)
                                            ?.name ?? "Select category"
                                    }
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {categories?.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="available"
                        checked={isAvailable}
                        onChange={(e) => setIsAvailable(e.target.checked)}
                        className="size-3.5 accent-[var(--admin-accent)]"
                    />
                    <Label
                        htmlFor="available"
                        className="text-[12px] text-[var(--admin-text-secondary)]"
                    >
                        Available for order
                    </Label>
                </div>
            </div>

            {/* Recipe */}
            <div className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-card)] p-4">
                <h2 className="mb-3 text-[11px] font-medium uppercase tracking-wide text-[var(--admin-text-secondary)]">
                    Recipe
                </h2>
                <div className="space-y-1">
                    {recipes.length === 0 ? (
                        <p className="text-xs text-[var(--admin-text-muted)]">
                            No recipe ingredients configured.
                        </p>
                    ) : (
                        recipes.map((r) => (
                            <div
                                key={r.id}
                                className="flex items-center justify-between rounded border border-[var(--admin-border)] bg-[var(--admin-hover)] px-3 py-2"
                            >
                                <span className="text-[12px] text-[var(--admin-text)]">
                                    {r.name}
                                </span>
                                <div className="flex items-center gap-3">
                                    <span className="font-mono text-[11px] text-[var(--admin-text-secondary)]">
                                        {r.quantity} {r.unit}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="icon-xs"
                                        onClick={() => handleRemoveRecipe(r.id)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <Trash className="size-3.5" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <div className="mt-3 flex items-end gap-2">
                    <div className="grid flex-1 gap-1.5">
                        <Label className="text-[11px] text-[var(--admin-text-secondary)]">
                            Ingredient
                        </Label>
                        <Select
                            value={newRecipeIngredient}
                            onValueChange={(v) =>
                                setNewRecipeIngredient(v ?? "")
                            }
                        >
                            <SelectTrigger className="h-8 border-[var(--admin-border)] bg-[var(--admin-card)] text-xs">
                                <SelectValue placeholder="Select...">
                                    {(val) =>
                                        ingredients?.find((i) => i.id === val)
                                            ?.name ?? "Select..."
                                    }
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {ingredients?.map((ing) => (
                                    <SelectItem key={ing.id} value={ing.id}>
                                        {ing.name} ({ing.unit})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid w-24 gap-1.5">
                        <Label className="text-[11px] text-[var(--admin-text-secondary)]">
                            Qty
                        </Label>
                        <Input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={newRecipeQuantity}
                            onChange={(e) => {
                                const v = e.target.value;
                                if (
                                    v === "" ||
                                    (parseFloat(v) > 0 && !isNaN(parseFloat(v)))
                                ) {
                                    setNewRecipeQuantity(v);
                                }
                            }}
                            className="h-8 border-[var(--admin-border)] bg-[var(--admin-card)] font-mono text-xs"
                        />
                    </div>
                    {newRecipeIngredient && (
                        <span className="pb-1.5 font-mono text-[12px] font-medium text-[var(--admin-text-secondary)]">
                            {ingredients?.find(
                                (i) => i.id === newRecipeIngredient,
                            )?.unit ?? ""}
                        </span>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAddRecipe}
                        className="h-8 border-[var(--admin-border)] text-[var(--admin-text-secondary)]"
                    >
                        <Plus className="size-3.5" />
                    </Button>
                </div>
            </div>

            {/* Modifiers */}
            <div className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-card)] p-4">
                <h2 className="mb-3 text-[11px] font-medium uppercase tracking-wide text-[var(--admin-text-secondary)]">
                    Modifiers
                </h2>
                <div className="space-y-3">
                    {groups.map((group) => (
                        <div
                            key={group.id}
                            className="overflow-hidden rounded border border-[var(--admin-border)]"
                        >
                            {editingGroupId === group.id ? (
                                <div className="flex items-center gap-2 bg-[var(--admin-hover)] px-3 py-2">
                                    <Input
                                        value={editGroupName}
                                        onChange={(e) =>
                                            setEditGroupName(e.target.value)
                                        }
                                        className="h-7 flex-1 border-[var(--admin-border)] bg-[var(--admin-card)] text-xs"
                                    />
                                    <Select
                                        value={editGroupType}
                                        onValueChange={(v) =>
                                            setEditGroupType(
                                                v as "single" | "multiple",
                                            )
                                        }
                                    >
                                        <SelectTrigger className="h-7 w-24 border-[var(--admin-border)] bg-[var(--admin-card)] text-[11px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="single">
                                                Single
                                            </SelectItem>
                                            <SelectItem value="multiple">
                                                Multiple
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <label className="flex items-center gap-1 text-[11px] text-[var(--admin-text-secondary)]">
                                        <input
                                            type="checkbox"
                                            checked={editGroupRequired}
                                            onChange={(e) =>
                                                setEditGroupRequired(
                                                    e.target.checked,
                                                )
                                            }
                                            className="size-3 accent-[var(--admin-accent)]"
                                        />
                                        Req
                                    </label>
                                    <Button
                                        variant="ghost"
                                        size="icon-xs"
                                        onClick={() =>
                                            handleUpdateGroup(group.id)
                                        }
                                        className="text-green-600 hover:text-green-700"
                                    >
                                        <Check className="size-3.5" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon-xs"
                                        onClick={() => setEditingGroupId(null)}
                                        className="text-[var(--admin-text-muted)]"
                                    >
                                        <X className="size-3.5" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 bg-[var(--admin-hover)] px-3 py-2">
                                    <button
                                        onClick={() => toggleGroup(group.id)}
                                        className="flex flex-1 items-center gap-2 text-left"
                                    >
                                        {expandedGroups.has(group.id) ? (
                                            <CaretDown className="size-3.5 text-[var(--admin-text-muted)]" />
                                        ) : (
                                            <CaretRight className="size-3.5 text-[var(--admin-text-muted)]" />
                                        )}
                                        <span className="text-[12px] font-medium text-[var(--admin-text)]">
                                            {group.name}
                                        </span>
                                        <span className="text-[10px] capitalize text-[var(--admin-text-muted)]">
                                            {group.selectionType}
                                            {group.isRequired
                                                ? " · required"
                                                : ""}
                                        </span>
                                    </button>
                                    <Button
                                        variant="ghost"
                                        size="icon-xs"
                                        onClick={() => startEditGroup(group)}
                                        className="text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]"
                                    >
                                        <PencilSimple className="size-3" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon-xs"
                                        onClick={() =>
                                            handleDeleteGroup(group.id)
                                        }
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <Trash className="size-3" />
                                    </Button>
                                </div>
                            )}

                            {expandedGroups.has(group.id) && (
                                <div className="divide-y divide-[var(--admin-border)]">
                                    {group.options.map((option) => (
                                        <div key={option.id}>
                                            {editingOptionId === option.id ? (
                                                <div className="flex items-center gap-2 px-5 py-2">
                                                    <Input
                                                        value={editOptionName}
                                                        onChange={(e) =>
                                                            setEditOptionName(
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="h-7 flex-1 border-[var(--admin-border)] bg-[var(--admin-card)] text-xs"
                                                    />
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        value={editOptionPrice}
                                                        onChange={(e) =>
                                                            setEditOptionPrice(
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="h-7 w-20 border-[var(--admin-border)] bg-[var(--admin-card)] font-mono text-xs"
                                                    />
                                                    <Button
                                                        variant="ghost"
                                                        size="icon-xs"
                                                        onClick={() =>
                                                            handleUpdateOption(
                                                                group.id,
                                                                option.id,
                                                            )
                                                        }
                                                        className="text-green-600 hover:text-green-700"
                                                    >
                                                        <Check className="size-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon-xs"
                                                        onClick={() =>
                                                            setEditingOptionId(
                                                                null,
                                                            )
                                                        }
                                                        className="text-[var(--admin-text-muted)]"
                                                    >
                                                        <X className="size-3.5" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center">
                                                    <button
                                                        onClick={() =>
                                                            toggleOption(
                                                                option.id,
                                                            )
                                                        }
                                                        className="flex flex-1 items-center gap-2 px-5 py-2 text-left"
                                                    >
                                                        {expandedOptions.has(
                                                            option.id,
                                                        ) ? (
                                                            <CaretDown className="size-3 text-[var(--admin-text-muted)]" />
                                                        ) : (
                                                            <CaretRight className="size-3 text-[var(--admin-text-muted)]" />
                                                        )}
                                                        <span className="text-[12px] text-[var(--admin-text)]">
                                                            {option.name}
                                                        </span>
                                                        <span className="ml-auto font-mono text-[11px] text-[var(--admin-text-secondary)]">
                                                            +$
                                                            {parseFloat(
                                                                option.price,
                                                            ).toFixed(2)}
                                                        </span>
                                                    </button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon-xs"
                                                        onClick={() =>
                                                            startEditOption(
                                                                option,
                                                            )
                                                        }
                                                        className="mr-1 text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]"
                                                    >
                                                        <PencilSimple className="size-3" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon-xs"
                                                        onClick={() =>
                                                            handleDeleteOption(
                                                                group.id,
                                                                option.id,
                                                            )
                                                        }
                                                        className="mr-2 text-red-500 hover:text-red-700"
                                                    >
                                                        <Trash className="size-3" />
                                                    </Button>
                                                </div>
                                            )}

                                            {/* Option ingredients */}
                                            {expandedOptions.has(option.id) && (
                                                <div className="border-t border-[var(--admin-border)] bg-[var(--admin-hover)]/50 px-8 py-2">
                                                    {option.ingredients.map(
                                                        (ing) => (
                                                            <div
                                                                key={ing.id}
                                                                className="flex items-center justify-between py-0.5"
                                                            >
                                                                <span className="text-[11px] text-[var(--admin-text)]">
                                                                    {ing.name}
                                                                </span>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-mono text-[10px] text-[var(--admin-text-muted)]">
                                                                        {
                                                                            ing.quantity
                                                                        }{" "}
                                                                        {
                                                                            ing.unit
                                                                        }
                                                                    </span>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon-xs"
                                                                        onClick={() =>
                                                                            handleRemoveOptionIngredient(
                                                                                group.id,
                                                                                option.id,
                                                                                ing.id,
                                                                            )
                                                                        }
                                                                        className="text-red-500 hover:text-red-700"
                                                                    >
                                                                        <Trash className="size-2.5" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        ),
                                                    )}

                                                    {addingIngredientToOption ===
                                                    option.id ? (
                                                        <div className="mt-1 flex items-end gap-2">
                                                            <div className="grid flex-1 gap-1">
                                                                <Select
                                                                    value={
                                                                        newOptionIngId
                                                                    }
                                                                    onValueChange={(
                                                                        v,
                                                                    ) =>
                                                                        setNewOptionIngId(
                                                                            v ??
                                                                                "",
                                                                        )
                                                                    }
                                                                >
                                                                    <SelectTrigger className="h-7 border-[var(--admin-border)] bg-[var(--admin-card)] text-[11px]">
                                                                        <SelectValue placeholder="Ingredient...">
                                                                            {(
                                                                                val,
                                                                            ) =>
                                                                                ingredients?.find(
                                                                                    (
                                                                                        i,
                                                                                    ) =>
                                                                                        i.id ===
                                                                                        val,
                                                                                )
                                                                                    ?.name ??
                                                                                "Ingredient..."
                                                                            }
                                                                        </SelectValue>
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {ingredients?.map(
                                                                            (
                                                                                ing,
                                                                            ) => (
                                                                                <SelectItem
                                                                                    key={
                                                                                        ing.id
                                                                                    }
                                                                                    value={
                                                                                        ing.id
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        ing.name
                                                                                    }{" "}
                                                                                    (
                                                                                    {
                                                                                        ing.unit
                                                                                    }

                                                                                    )
                                                                                </SelectItem>
                                                                            ),
                                                                        )}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <Input
                                                                type="number"
                                                                step="0.01"
                                                                min="0.01"
                                                                value={
                                                                    newOptionIngQty
                                                                }
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    const v =
                                                                        e.target
                                                                            .value;
                                                                    if (
                                                                        v ===
                                                                            "" ||
                                                                        (parseFloat(
                                                                            v,
                                                                        ) > 0 &&
                                                                            !isNaN(
                                                                                parseFloat(
                                                                                    v,
                                                                                ),
                                                                            ))
                                                                    ) {
                                                                        setNewOptionIngQty(
                                                                            v,
                                                                        );
                                                                    }
                                                                }}
                                                                placeholder="Qty"
                                                                className="h-7 w-16 border-[var(--admin-border)] bg-[var(--admin-card)] font-mono text-[11px]"
                                                            />
                                                            {newOptionIngId && (
                                                                <span className="pb-0.5 font-mono text-[11px] font-medium text-[var(--admin-text-secondary)]">
                                                                    {ingredients?.find(
                                                                        (i) =>
                                                                            i.id ===
                                                                            newOptionIngId,
                                                                    )?.unit ??
                                                                        ""}
                                                                </span>
                                                            )}
                                                            <Button
                                                                variant="ghost"
                                                                size="icon-xs"
                                                                onClick={() =>
                                                                    handleAddOptionIngredient(
                                                                        group.id,
                                                                        option.id,
                                                                    )
                                                                }
                                                                className="text-green-600 hover:text-green-700"
                                                            >
                                                                <Check className="size-3" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon-xs"
                                                                onClick={() => {
                                                                    setAddingIngredientToOption(
                                                                        null,
                                                                    );
                                                                    setNewOptionIngId(
                                                                        "",
                                                                    );
                                                                    setNewOptionIngQty(
                                                                        "",
                                                                    );
                                                                }}
                                                                className="text-[var(--admin-text-muted)]"
                                                            >
                                                                <X className="size-3" />
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() =>
                                                                setAddingIngredientToOption(
                                                                    option.id,
                                                                )
                                                            }
                                                            className="mt-1 flex items-center gap-1 text-[10px] text-[var(--admin-text-muted)] hover:text-[var(--admin-text-secondary)]"
                                                        >
                                                            <Plus className="size-2.5" />
                                                            Add ingredient
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {addingOptionToGroup === group.id ? (
                                        <div className="flex items-center gap-2 bg-[var(--admin-hover)]/30 px-5 py-2">
                                            <Input
                                                value={newOptionName}
                                                onChange={(e) =>
                                                    setNewOptionName(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Option name"
                                                className="h-7 flex-1 border-[var(--admin-border)] bg-[var(--admin-card)] text-xs"
                                            />
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={newOptionPrice}
                                                onChange={(e) =>
                                                    setNewOptionPrice(
                                                        e.target.value,
                                                    )
                                                }
                                                className="h-7 w-20 border-[var(--admin-border)] bg-[var(--admin-card)] font-mono text-xs"
                                            />
                                            <Button
                                                variant="ghost"
                                                size="icon-xs"
                                                onClick={() =>
                                                    handleAddOption(group.id)
                                                }
                                                className="text-green-600 hover:text-green-700"
                                            >
                                                <Check className="size-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon-xs"
                                                onClick={() => {
                                                    setAddingOptionToGroup(
                                                        null,
                                                    );
                                                    setNewOptionName("");
                                                    setNewOptionPrice("0");
                                                }}
                                                className="text-[var(--admin-text-muted)]"
                                            >
                                                <X className="size-3.5" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() =>
                                                setAddingOptionToGroup(group.id)
                                            }
                                            className="flex w-full items-center gap-1.5 px-5 py-2 text-left text-[11px] text-[var(--admin-text-muted)] hover:bg-[var(--admin-hover)]/30 hover:text-[var(--admin-text-secondary)]"
                                        >
                                            <Plus className="size-3" />
                                            Add option
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}

                    {showAddGroup ? (
                        <div className="rounded border border-[var(--admin-border)] bg-[var(--admin-hover)]/30 p-3">
                            <div className="flex items-center gap-2">
                                <Input
                                    value={newGroupName}
                                    onChange={(e) =>
                                        setNewGroupName(e.target.value)
                                    }
                                    placeholder="Group name"
                                    className="h-7 flex-1 border-[var(--admin-border)] bg-[var(--admin-card)] text-xs"
                                />
                                <Select
                                    value={newGroupType}
                                    onValueChange={(v) =>
                                        setNewGroupType(
                                            v as "single" | "multiple",
                                        )
                                    }
                                >
                                    <SelectTrigger className="h-7 w-24 border-[var(--admin-border)] bg-[var(--admin-card)] text-[11px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="single">
                                            Single
                                        </SelectItem>
                                        <SelectItem value="multiple">
                                            Multiple
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <label className="flex items-center gap-1 text-[11px] text-[var(--admin-text-secondary)]">
                                    <input
                                        type="checkbox"
                                        checked={newGroupRequired}
                                        onChange={(e) =>
                                            setNewGroupRequired(
                                                e.target.checked,
                                            )
                                        }
                                        className="size-3 accent-[var(--admin-accent)]"
                                    />
                                    Req
                                </label>
                            </div>
                            <div className="mt-2 flex justify-end gap-2">
                                <Button
                                    variant="ghost"
                                    size="xs"
                                    onClick={() => {
                                        setShowAddGroup(false);
                                        setNewGroupName("");
                                    }}
                                    className="text-[11px] text-[var(--admin-text-muted)]"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="xs"
                                    onClick={handleAddGroup}
                                    className="bg-[var(--admin-primary)] text-[11px] text-white hover:bg-[#3a1d0e]"
                                >
                                    Add Group
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowAddGroup(true)}
                            className="w-full border-dashed border-[var(--admin-border)] text-[11px] text-[var(--admin-text-secondary)]"
                        >
                            <Plus className="size-3.5" />
                            Add Modifier Group
                        </Button>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                <Button
                    onClick={handleCreate}
                    disabled={creating}
                    className="h-8 bg-[var(--admin-primary)] text-xs text-white hover:bg-[#3a1d0e]"
                >
                    {creating ? "Creating..." : "Create Item"}
                </Button>
                <Button
                    variant="ghost"
                    onClick={() => navigate("/admin/menu")}
                    disabled={creating}
                    className="h-8 text-xs text-[var(--admin-text-secondary)]"
                >
                    Cancel
                </Button>
            </div>
        </div>
    );
};

export default MenuItemCreatePage;
