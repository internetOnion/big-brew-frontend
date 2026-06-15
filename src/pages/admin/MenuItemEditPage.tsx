import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
    ArrowLeftIcon,
    PlusIcon,
    TrashIcon,
    CaretDownIcon,
    CaretRightIcon,
    PencilSimpleIcon,
    XIcon,
    CheckIcon,
} from "@phosphor-icons/react";
import api from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import { useMenuItem } from "@/hooks/useMenuItem";
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import MenuItemImageUpload from "@/components/admin/menu/MenuItemImageUpload";
import type { MenuItemResponse } from "@/types/menu";

const MenuItemEditPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: item, isLoading } = useMenuItem(id!);
    const { data: ingredients } = useIngredients();
    const { data: categories } = useCategories();

    const [name, setName] = useState("");
    const [basePrice, setBasePrice] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [isAvailable, setIsAvailable] = useState(true);
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    const [recipes, setRecipes] = useState<
        {
            id: string;
            ingredientId: string;
            name: string;
            unit: string;
            quantity: string;
        }[]
    >([]);
    const [newRecipeIngredient, setNewRecipeIngredient] = useState("");
    const [newRecipeQuantity, setNewRecipeQuantity] = useState("");

    const [groups, setGroups] = useState<MenuItemResponse["modifierGroups"]>(
        [],
    );
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
        new Set(),
    );
    const [expandedOptions, setExpandedOptions] = useState<Set<string>>(
        new Set(),
    );

    const [showAddGroup, setShowAddGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState("");
    const [newGroupType, setNewGroupType] = useState<"single" | "multiple">(
        "single",
    );
    const [newGroupRequired, setNewGroupRequired] = useState(false);

    const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
    const [editGroupName, setEditGroupName] = useState("");
    const [editGroupType, setEditGroupType] = useState<"single" | "multiple">(
        "single",
    );
    const [editGroupRequired, setEditGroupRequired] = useState(false);

    const [addingOptionToGroup, setAddingOptionToGroup] = useState<
        string | null
    >(null);
    const [newOptionName, setNewOptionName] = useState("");
    const [newOptionPrice, setNewOptionPrice] = useState("0");

    const [editingOptionId, setEditingOptionId] = useState<string | null>(null);
    const [editOptionName, setEditOptionName] = useState("");
    const [editOptionPrice, setEditOptionPrice] = useState("");

    const [addingIngredientToOption, setAddingIngredientToOption] = useState<
        string | null
    >(null);
    const [newOptionIngId, setNewOptionIngId] = useState("");
    const [newOptionIngQty, setNewOptionIngQty] = useState("");

    const [editingOptionIngId, setEditingOptionIngId] = useState<string | null>(
        null,
    );
    const [editOptionIngQty, setEditOptionIngQty] = useState("");

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (!item) return;
        setName(item.name);
        setBasePrice(item.basePrice);
        setCategoryId(item.category.id);
        setIsAvailable(item.isAvailable ?? true);
        setImageUrl(item.imageUrl);
        setRecipes(
            item.recipes.map((r) => ({
                id: r.id,
                ingredientId: r.ingredient.id,
                name: r.ingredient.name,
                unit: r.ingredient.unit,
                quantity: r.quantity,
            })),
        );
        setGroups(item.modifierGroups);
    }, [item]);

    const refreshGroups = async () => {
        if (!id) return;
        const { data } = await api.get<{ data: MenuItemResponse }>(
            ENDPOINTS.MENU.BY_ID(id),
        );
        setGroups(data.data.modifierGroups);
    };

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: menuItemKeys.all });
        queryClient.invalidateQueries({ queryKey: menuItemKeys.detail(id!) });
    };

    const handleDelete = async () => {
        if (!id) return;
        setDeleting(true);
        await queryClient.cancelQueries({ queryKey: menuItemKeys.all });
        const previous = queryClient.getQueryData(menuItemKeys.all);
        queryClient.setQueryData(
            menuItemKeys.all,
            (old: { id: string }[] | undefined) =>
                old?.filter((item) => item.id !== id) ?? [],
        );
        setShowDeleteDialog(false);
        try {
            await api.delete(ENDPOINTS.MENU.BY_ID(id));
            toast.success("Item removed from menu");
            navigate("/admin/menu");
        } catch {
            queryClient.setQueryData(menuItemKeys.all, previous);
            toast.error("Failed to remove item");
            setDeleting(false);
        }
    };

    const handleSaveBasic = async () => {
        if (!id) return;
        try {
            await api.put(ENDPOINTS.MENU.BY_ID(id), {
                name,
                basePrice: parseFloat(basePrice),
                categoryId,
                isAvailable,
            });
            toast.success("Item updated");
            invalidate();
        } catch {
            toast.error("Failed to update item");
        }
    };

    const handleAddRecipe = async () => {
        if (!id || !newRecipeIngredient || !newRecipeQuantity) {
            toast.error("Please select an ingredient and enter a quantity");
            return;
        }
        if (parseFloat(newRecipeQuantity) <= 0) {
            toast.error("Quantity must be greater than 0");
            return;
        }
        try {
            await api.post(ENDPOINTS.MENU.RECIPES(id), [
                {
                    ingredientId: newRecipeIngredient,
                    quantity: parseFloat(newRecipeQuantity),
                },
            ]);
            toast.success("Ingredient added to recipe");
            setNewRecipeIngredient("");
            setNewRecipeQuantity("");
            const { data } = await api.get<{ data: MenuItemResponse }>(
                ENDPOINTS.MENU.BY_ID(id),
            );
            setRecipes(
                data.data.recipes.map((r) => ({
                    id: r.id,
                    ingredientId: r.ingredient.id,
                    name: r.ingredient.name,
                    unit: r.ingredient.unit,
                    quantity: r.quantity,
                })),
            );
        } catch {
            toast.error("Failed to add ingredient");
        }
    };

    const handleRemoveRecipe = async (ingredientId: string) => {
        if (!id) return;
        const previous = [...recipes];
        setRecipes((prev) =>
            prev.filter((r) => r.ingredientId !== ingredientId),
        );
        try {
            await api.delete(ENDPOINTS.MENU.RECIPE(id, ingredientId));
            toast.success("Ingredient removed");
        } catch {
            setRecipes(previous);
            toast.error("Failed to remove ingredient");
        }
    };

    const handleAddGroup = async () => {
        if (!id || !newGroupName.trim()) return;
        try {
            await api.post(ENDPOINTS.MENU.MODIFIER_GROUPS(id), {
                name: newGroupName.trim(),
                selectionType: newGroupType,
                isRequired: newGroupRequired,
            });
            toast.success("Group added");
            setNewGroupName("");
            setNewGroupType("single");
            setNewGroupRequired(false);
            setShowAddGroup(false);
            await refreshGroups();
        } catch {
            toast.error("Failed to add group");
        }
    };

    const handleUpdateGroup = async (groupId: string) => {
        if (!id || !editGroupName.trim()) return;
        try {
            await api.put(ENDPOINTS.MENU.MODIFIER_GROUP(id, groupId), {
                name: editGroupName.trim(),
                selectionType: editGroupType,
                isRequired: editGroupRequired,
            });
            toast.success("Group updated");
            setEditingGroupId(null);
            await refreshGroups();
        } catch {
            toast.error("Failed to update group");
        }
    };

    const handleDeleteGroup = async (groupId: string) => {
        if (!id) return;
        const previous = [...groups];
        setGroups((prev) => prev.filter((g) => g.id !== groupId));
        try {
            await api.delete(ENDPOINTS.MENU.MODIFIER_GROUP(id, groupId));
            toast.success("Group deleted");
        } catch {
            setGroups(previous);
            toast.error("Failed to delete group");
        }
    };

    const startEditGroup = (group: MenuItemResponse["modifierGroups"][0]) => {
        setEditingGroupId(group.id);
        setEditGroupName(group.name);
        setEditGroupType(group.selectionType as "single" | "multiple");
        setEditGroupRequired(group.isRequired ?? false);
    };

    const OPTION_ENDPOINTS = {
        BASE: (menuItemId: string, groupId: string) =>
            `/menu-items/${menuItemId}/modifier-groups/${groupId}/options`,
        BY_ID: (menuItemId: string, groupId: string, optionId: string) =>
            `/menu-items/${menuItemId}/modifier-groups/${groupId}/options/${optionId}`,
    };

    const handleAddOption = async (groupId: string) => {
        if (!id || !newOptionName.trim()) return;
        try {
            await api.post(OPTION_ENDPOINTS.BASE(id, groupId), {
                name: newOptionName.trim(),
                price: parseFloat(newOptionPrice) || 0,
            });
            toast.success("Option added");
            setNewOptionName("");
            setNewOptionPrice("0");
            setAddingOptionToGroup(null);
            await refreshGroups();
        } catch {
            toast.error("Failed to add option");
        }
    };

    const handleUpdateOption = async (groupId: string, optionId: string) => {
        if (!id || !editOptionName.trim()) return;
        try {
            await api.put(OPTION_ENDPOINTS.BY_ID(id, groupId, optionId), {
                name: editOptionName.trim(),
                price: parseFloat(editOptionPrice) || 0,
            });
            toast.success("Option updated");
            setEditingOptionId(null);
            await refreshGroups();
        } catch {
            toast.error("Failed to update option");
        }
    };

    const handleDeleteOption = async (groupId: string, optionId: string) => {
        if (!id) return;
        const previous = [...groups];
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
        try {
            await api.delete(OPTION_ENDPOINTS.BY_ID(id, groupId, optionId));
            toast.success("Option deleted");
        } catch {
            setGroups(previous);
            toast.error("Failed to delete option");
        }
    };

    const startEditOption = (
        option: MenuItemResponse["modifierGroups"][0]["options"][0],
    ) => {
        setEditingOptionId(option.id);
        setEditOptionName(option.name);
        setEditOptionPrice(option.price);
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

    const handleAddOptionIngredient = async (
        groupId: string,
        optionId: string,
    ) => {
        if (!id || !newOptionIngId || !newOptionIngQty) return;
        const qty = parseFloat(newOptionIngQty);
        if (isNaN(qty) || qty <= 0) {
            toast.error("Quantity must be greater than 0");
            return;
        }
        try {
            await api.post(
                ENDPOINTS.MENU.OPTION_INGREDIENTS(id, groupId, optionId),
                {
                    ingredientId: newOptionIngId,
                    quantity: qty,
                },
            );
            toast.success("Ingredient added");
            setNewOptionIngId("");
            setNewOptionIngQty("");
            setAddingIngredientToOption(null);
            await refreshGroups();
        } catch {
            toast.error("Failed to add ingredient");
        }
    };

    const handleUpdateOptionIngredient = async (
        groupId: string,
        optionId: string,
        ingredientId: string,
    ) => {
        if (!id || !editOptionIngQty) return;
        const qty = parseFloat(editOptionIngQty);
        if (isNaN(qty) || qty <= 0) {
            toast.error("Quantity must be greater than 0");
            return;
        }
        try {
            await api.put(
                ENDPOINTS.MENU.OPTION_INGREDIENT(
                    id,
                    groupId,
                    optionId,
                    ingredientId,
                ),
                { quantity: qty },
            );
            toast.success("Ingredient updated");
            setEditingOptionIngId(null);
            await refreshGroups();
        } catch {
            toast.error("Failed to update ingredient");
        }
    };

    const handleDeleteOptionIngredient = async (
        groupId: string,
        optionId: string,
        ingredientId: string,
    ) => {
        if (!id) return;
        const previous = [...groups];
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
                                            (i) => i.id !== ingredientId,
                                        ),
                                    }
                                  : o,
                          ),
                      }
                    : g,
            ),
        );
        try {
            await api.delete(
                ENDPOINTS.MENU.OPTION_INGREDIENT(
                    id,
                    groupId,
                    optionId,
                    ingredientId,
                ),
            );
            toast.success("Ingredient removed");
        } catch {
            setGroups(previous);
            toast.error("Failed to remove ingredient");
        }
    };

    const startEditOptionIngredient = (
        ingredient: MenuItemResponse["modifierGroups"][0]["options"][0]["ingredients"][0],
    ) => {
        setEditingOptionIngId(ingredient.id);
        setEditOptionIngQty(ingredient.quantity);
    };

    if (!id) {
        navigate("/admin/menu");
        return null;
    }

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
                    <ArrowLeftIcon className="size-4" />
                </Button>
                <h1 className="text-[13px] font-medium text-[var(--admin-primary)]">
                    {isLoading ? "Loading..." : name}
                </h1>
                {!isLoading && (
                    <>
                        <span
                            className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                isAvailable
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                            }`}
                        >
                            {isAvailable ? "Available" : "Unavailable"}
                        </span>
                        <Button
                            variant="outline"
                            size="xs"
                            onClick={() => setShowDeleteDialog(true)}
                            className="border-red-200 text-[11px] text-red-500 hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                        >
                            <TrashIcon className="size-3" />
                            Delete
                        </Button>
                    </>
                )}
            </div>

            {isLoading ? (
                <div className="flex h-64 items-center justify-center text-sm text-[var(--admin-text-muted)]">
                    Loading...
                </div>
            ) : (
                <>
                    {/* Image */}
                    <div className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-card)] p-4">
                        <h2 className="mb-3 text-[11px] font-medium uppercase tracking-wide text-[var(--admin-text-secondary)]">
                            Image
                        </h2>
                        <MenuItemImageUpload
                            itemId={id}
                            imageUrl={imageUrl}
                            onImageUpdated={setImageUrl}
                        />
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
                                    value={basePrice}
                                    onChange={(e) =>
                                        setBasePrice(e.target.value)
                                    }
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
                                    onValueChange={(v) =>
                                        setCategoryId(v ?? "")
                                    }
                                >
                                    <SelectTrigger className="h-8 w-full border-[var(--admin-border)] bg-[var(--admin-card)] text-xs">
                                        <SelectValue>
                                            {(val) =>
                                                categories?.find(
                                                    (c) => c.id === val,
                                                )?.name ?? "Select category"
                                            }
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories?.map((cat) => (
                                            <SelectItem
                                                key={cat.id}
                                                value={cat.id}
                                            >
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
                                onChange={(e) =>
                                    setIsAvailable(e.target.checked)
                                }
                                className="size-3.5 accent-[var(--admin-accent)]"
                            />
                            <Label
                                htmlFor="available"
                                className="text-[12px] text-[var(--admin-text-secondary)]"
                            >
                                Available for order
                            </Label>
                        </div>
                        <div className="mt-4">
                            <Button
                                onClick={handleSaveBasic}
                                className="h-8 bg-[var(--admin-primary)] text-xs text-white hover:bg-[#3a1d0e]"
                            >
                                Save Changes
                            </Button>
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
                                        key={r.ingredientId}
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
                                                onClick={() =>
                                                    handleRemoveRecipe(
                                                        r.ingredientId,
                                                    )
                                                }
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <TrashIcon className="size-3.5" />
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
                                                ingredients?.find(
                                                    (i) => i.id === val,
                                                )?.name ?? "Select..."
                                            }
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ingredients?.map((ing) => (
                                            <SelectItem
                                                key={ing.id}
                                                value={ing.id}
                                            >
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
                                            (parseFloat(v) > 0 &&
                                                !isNaN(parseFloat(v)))
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
                                <PlusIcon className="size-3.5" />
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
                                                    setEditGroupName(
                                                        e.target.value,
                                                    )
                                                }
                                                className="h-7 flex-1 border-[var(--admin-border)] bg-[var(--admin-card)] text-xs"
                                            />
                                            <Select
                                                value={editGroupType}
                                                onValueChange={(v) =>
                                                    setEditGroupType(
                                                        v as
                                                            | "single"
                                                            | "multiple",
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
                                                <CheckIcon className="size-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon-xs"
                                                onClick={() =>
                                                    setEditingGroupId(null)
                                                }
                                                className="text-[var(--admin-text-muted)]"
                                            >
                                                <XIcon className="size-3.5" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 bg-[var(--admin-hover)] px-3 py-2">
                                            <button
                                                onClick={() =>
                                                    toggleGroup(group.id)
                                                }
                                                className="flex flex-1 items-center gap-2 text-left"
                                            >
                                                {expandedGroups.has(
                                                    group.id,
                                                ) ? (
                                                    <CaretDownIcon className="size-3.5 text-[var(--admin-text-muted)]" />
                                                ) : (
                                                    <CaretRightIcon className="size-3.5 text-[var(--admin-text-muted)]" />
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
                                                onClick={() =>
                                                    startEditGroup(group)
                                                }
                                                className="text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]"
                                            >
                                                <PencilSimpleIcon className="size-3" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon-xs"
                                                onClick={() =>
                                                    handleDeleteGroup(group.id)
                                                }
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <TrashIcon className="size-3" />
                                            </Button>
                                        </div>
                                    )}

                                    {expandedGroups.has(group.id) && (
                                        <div className="divide-y divide-[var(--admin-border)]">
                                            {group.options.map((option) => (
                                                <div key={option.id}>
                                                    {editingOptionId ===
                                                    option.id ? (
                                                        <div className="flex items-center gap-2 px-5 py-2">
                                                            <Input
                                                                value={
                                                                    editOptionName
                                                                }
                                                                onChange={(e) =>
                                                                    setEditOptionName(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                className="h-7 flex-1 border-[var(--admin-border)] bg-[var(--admin-card)] text-xs"
                                                            />
                                                            <Input
                                                                type="number"
                                                                step="0.01"
                                                                value={
                                                                    editOptionPrice
                                                                }
                                                                onChange={(e) =>
                                                                    setEditOptionPrice(
                                                                        e.target
                                                                            .value,
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
                                                                <CheckIcon className="size-3.5" />
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
                                                                <XIcon className="size-3.5" />
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
                                                                    <CaretDownIcon className="size-3 text-[var(--admin-text-muted)]" />
                                                                ) : (
                                                                    <CaretRightIcon className="size-3 text-[var(--admin-text-muted)]" />
                                                                )}
                                                                <span className="text-[12px] text-[var(--admin-text)]">
                                                                    {
                                                                        option.name
                                                                    }
                                                                </span>
                                                                <span className="ml-auto font-mono text-[11px] text-[var(--admin-text-secondary)]">
                                                                    +$
                                                                    {parseFloat(
                                                                        option.price,
                                                                    ).toFixed(
                                                                        2,
                                                                    )}
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
                                                                <PencilSimpleIcon className="size-3" />
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
                                                                <TrashIcon className="size-3" />
                                                            </Button>
                                                        </div>
                                                    )}

                                                    {expandedOptions.has(
                                                        option.id,
                                                    ) && (
                                                        <div className="border-t border-[var(--admin-border)] bg-[var(--admin-hover)]/50 px-8 py-2">
                                                            {option.ingredients
                                                                .length === 0 &&
                                                            addingIngredientToOption !==
                                                                option.id ? (
                                                                <p className="text-[11px] text-[var(--admin-text-muted)]">
                                                                    No
                                                                    ingredients
                                                                </p>
                                                            ) : (
                                                                option.ingredients.map(
                                                                    (ing) =>
                                                                        editingOptionIngId ===
                                                                        ing.id ? (
                                                                            <div
                                                                                key={
                                                                                    ing.id
                                                                                }
                                                                                className="flex items-center justify-between py-0.5"
                                                                            >
                                                                                <span className="text-[11px] text-[var(--admin-text)]">
                                                                                    {
                                                                                        ing
                                                                                            .ingredient
                                                                                            .name
                                                                                    }
                                                                                </span>
                                                                                <div className="flex items-center gap-1.5">
                                                                                    <Input
                                                                                        type="number"
                                                                                        step="0.01"
                                                                                        value={
                                                                                            editOptionIngQty
                                                                                        }
                                                                                        onChange={(
                                                                                            e,
                                                                                        ) =>
                                                                                            setEditOptionIngQty(
                                                                                                e
                                                                                                    .target
                                                                                                    .value,
                                                                                            )
                                                                                        }
                                                                                        className="h-6 w-16 border-[var(--admin-border)] bg-[var(--admin-card)] font-mono text-[10px]"
                                                                                    />
                                                                                    <span className="text-[10px] text-[var(--admin-text-muted)]">
                                                                                        {
                                                                                            ing
                                                                                                .ingredient
                                                                                                .unit
                                                                                        }
                                                                                    </span>
                                                                                    <Button
                                                                                        variant="ghost"
                                                                                        size="icon-xs"
                                                                                        onClick={() =>
                                                                                            handleUpdateOptionIngredient(
                                                                                                group.id,
                                                                                                option.id,
                                                                                                ing
                                                                                                    .ingredient
                                                                                                    .id,
                                                                                            )
                                                                                        }
                                                                                        className="text-green-600 hover:text-green-700"
                                                                                    >
                                                                                        <CheckIcon className="size-3" />
                                                                                    </Button>
                                                                                    <Button
                                                                                        variant="ghost"
                                                                                        size="icon-xs"
                                                                                        onClick={() =>
                                                                                            setEditingOptionIngId(
                                                                                                null,
                                                                                            )
                                                                                        }
                                                                                        className="text-[var(--admin-text-muted)]"
                                                                                    >
                                                                                        <XIcon className="size-3" />
                                                                                    </Button>
                                                                                </div>
                                                                            </div>
                                                                        ) : (
                                                                            <div
                                                                                key={
                                                                                    ing.id
                                                                                }
                                                                                className="flex items-center justify-between py-0.5"
                                                                            >
                                                                                <span className="text-[11px] text-[var(--admin-text)]">
                                                                                    {
                                                                                        ing
                                                                                            .ingredient
                                                                                            .name
                                                                                    }
                                                                                </span>
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className="font-mono text-[10px] text-[var(--admin-text-muted)]">
                                                                                        {
                                                                                            ing.quantity
                                                                                        }{" "}
                                                                                        {
                                                                                            ing
                                                                                                .ingredient
                                                                                                .unit
                                                                                        }
                                                                                    </span>
                                                                                    <Button
                                                                                        variant="ghost"
                                                                                        size="icon-xs"
                                                                                        onClick={() =>
                                                                                            startEditOptionIngredient(
                                                                                                ing,
                                                                                            )
                                                                                        }
                                                                                        className="text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]"
                                                                                    >
                                                                                        <PencilSimpleIcon className="size-2.5" />
                                                                                    </Button>
                                                                                    <Button
                                                                                        variant="ghost"
                                                                                        size="icon-xs"
                                                                                        onClick={() =>
                                                                                            handleDeleteOptionIngredient(
                                                                                                group.id,
                                                                                                option.id,
                                                                                                ing
                                                                                                    .ingredient
                                                                                                    .id,
                                                                                            )
                                                                                        }
                                                                                        className="text-red-500 hover:text-red-700"
                                                                                    >
                                                                                        <TrashIcon className="size-2.5" />
                                                                                    </Button>
                                                                                </div>
                                                                            </div>
                                                                        ),
                                                                )
                                                            )}
                                                            {addingIngredientToOption ===
                                                            option.id ? (
                                                                <div className="flex items-center gap-2 py-1">
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
                                                                        <SelectTrigger className="h-6 flex-1 border-[var(--admin-border)] bg-[var(--admin-card)] text-[10px]">
                                                                            <SelectValue placeholder="Select..." />
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
                                                                    <Input
                                                                        type="number"
                                                                        step="0.01"
                                                                        value={
                                                                            newOptionIngQty
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            setNewOptionIngQty(
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            )
                                                                        }
                                                                        placeholder="Qty"
                                                                        className="h-6 w-16 border-[var(--admin-border)] bg-[var(--admin-card)] font-mono text-[10px]"
                                                                    />
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
                                                                        <CheckIcon className="size-3" />
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
                                                                        <XIcon className="size-3" />
                                                                    </Button>
                                                                </div>
                                                            ) : (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        setAddingIngredientToOption(
                                                                            option.id,
                                                                        )
                                                                    }
                                                                    className="mt-1 h-6 gap-1 text-[10px] text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]"
                                                                >
                                                                    <PlusIcon className="size-2.5" />
                                                                    Add
                                                                    ingredient
                                                                </Button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}

                                            {addingOptionToGroup ===
                                            group.id ? (
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
                                                            handleAddOption(
                                                                group.id,
                                                            )
                                                        }
                                                        className="text-green-600 hover:text-green-700"
                                                    >
                                                        <CheckIcon className="size-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon-xs"
                                                        onClick={() => {
                                                            setAddingOptionToGroup(
                                                                null,
                                                            );
                                                            setNewOptionName(
                                                                "",
                                                            );
                                                            setNewOptionPrice(
                                                                "0",
                                                            );
                                                        }}
                                                        className="text-[var(--admin-text-muted)]"
                                                    >
                                                        <XIcon className="size-3.5" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() =>
                                                        setAddingOptionToGroup(
                                                            group.id,
                                                        )
                                                    }
                                                    className="flex w-full items-center gap-1.5 px-5 py-2 text-left text-[11px] text-[var(--admin-text-muted)] hover:bg-[var(--admin-hover)]/30 hover:text-[var(--admin-text-secondary)]"
                                                >
                                                    <PlusIcon className="size-3" />
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
                                    <PlusIcon className="size-3.5" />
                                    Add Modifier Group
                                </Button>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Delete Confirmation */}
            <Dialog
                open={showDeleteDialog}
                onOpenChange={(v) =>
                    !v && !deleting && setShowDeleteDialog(false)
                }
            >
                <DialogContent className="max-w-sm border-[var(--admin-border)] bg-[var(--admin-card)] shadow-xl">
                    <DialogHeader>
                        <DialogTitle className="text-[14px] font-medium text-[var(--admin-text)]">
                            Remove Item
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-[13px] text-[var(--admin-text-secondary)]">
                        Are you sure you want to remove{" "}
                        <span className="font-medium text-[var(--admin-text)]">
                            {name}
                        </span>{" "}
                        from the menu?
                    </p>
                    <div className="flex justify-end gap-2 border-t border-[var(--admin-border)] pt-3">
                        <Button
                            variant="ghost"
                            onClick={() => setShowDeleteDialog(false)}
                            disabled={deleting}
                            className="text-[var(--admin-text-secondary)]"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="bg-red-600 text-white hover:bg-red-700"
                        >
                            {deleting ? "Removing..." : "Remove"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default MenuItemEditPage;
