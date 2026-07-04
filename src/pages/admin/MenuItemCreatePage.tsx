import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import api from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import { useIngredients } from "@/hooks/useInventory";
import { useCategories } from "@/hooks/useCategories";
import { useQueryClient } from "@tanstack/react-query";
import { menuItemKeys } from "@/lib/query-keys";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import RecipeTab from "@/components/admin/menu/RecipeTab";
import type { RecipeEntry } from "@/components/admin/menu/RecipeTab";
import ModifierTab from "@/components/admin/menu/ModifierTab";
import type {
    DetailGroup,
    DetailIngredient,
} from "@/components/admin/menu/ModifierGroupDetail";
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

    const [recipes, setRecipes] = useState<LocalRecipe[]>([]);
    const [newRecipeIngredient, setNewRecipeIngredient] = useState("");
    const [newRecipeQuantity, setNewRecipeQuantity] = useState("");

    const [groups, setGroups] = useState<LocalGroup[]>([]);

    const hasUnsaved = Boolean(
        name ||
        basePrice ||
        categoryId ||
        recipes.length > 0 ||
        groups.length > 0,
    );

    const confirmLeave = useCallback(() => {
        if (!hasUnsaved) return true;
        return window.confirm(
            "You have unsaved changes. Are you sure you want to leave?",
        );
    }, [hasUnsaved]);

    useEffect(() => {
        if (!hasUnsaved) return;
        const handler = (e: BeforeUnloadEvent) => {
            e.preventDefault();
        };
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [hasUnsaved]);

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

    const handleRemoveRecipe = (entry: RecipeEntry) => {
        setRecipes((prev) => prev.filter((r) => r.id !== entry.id));
    };

    const handleAddGroup = (
        name: string,
        type: "single" | "multiple",
        required: boolean,
    ) => {
        setGroups((prev) => [
            ...prev,
            {
                id: newId(),
                name,
                selectionType: type,
                isRequired: required,
                options: [],
            },
        ]);
    };

    const handleUpdateGroup = (
        groupId: string,
        name: string,
        type: "single" | "multiple",
        required: boolean,
    ) => {
        setGroups((prev) =>
            prev.map((g) =>
                g.id === groupId
                    ? { ...g, name, selectionType: type, isRequired: required }
                    : g,
            ),
        );
    };

    const handleDeleteGroup = (groupId: string) => {
        setGroups((prev) => prev.filter((g) => g.id !== groupId));
    };

    const handleAddOption = (groupId: string, name: string, price: string) => {
        setGroups((prev) =>
            prev.map((g) =>
                g.id === groupId
                    ? {
                          ...g,
                          options: [
                              ...g.options,
                              {
                                  id: newId(),
                                  name,
                                  price,
                                  ingredients: [],
                              },
                          ],
                      }
                    : g,
            ),
        );
    };

    const handleUpdateOption = (
        groupId: string,
        optionId: string,
        name: string,
        price: string,
    ) => {
        setGroups((prev) =>
            prev.map((g) =>
                g.id === groupId
                    ? {
                          ...g,
                          options: g.options.map((o) =>
                              o.id === optionId ? { ...o, name, price } : o,
                          ),
                      }
                    : g,
            ),
        );
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

    const handleAddOptionIngredient = (
        groupId: string,
        optionId: string,
        ingredientId: string,
        quantity: string,
    ) => {
        if (parseFloat(quantity) <= 0) {
            toast.error("Quantity must be greater than 0");
            return;
        }
        const ing = ingredients?.find((i) => i.id === ingredientId);
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
                                                quantity,
                                            },
                                        ],
                                    }
                                  : o,
                          ),
                      }
                    : g,
            ),
        );
    };

    const handleDeleteOptionIngredient = (
        groupId: string,
        optionId: string,
        ingredientId: string,
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
                                            (i) =>
                                                i.ingredientId !== ingredientId,
                                        ),
                                    }
                                  : o,
                          ),
                      }
                    : g,
            ),
        );
    };

    const handleUpdateOptionIngredient = (
        groupId: string,
        optionId: string,
        ingredientId: string,
        quantity: string,
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
                                        ingredients: o.ingredients.map((i) =>
                                            i.ingredientId === ingredientId
                                                ? { ...i, quantity }
                                                : i,
                                        ),
                                    }
                                  : o,
                          ),
                      }
                    : g,
            ),
        );
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

    const detailGroups: DetailGroup[] = groups.map((g) => ({
        id: g.id,
        name: g.name,
        selectionType: g.selectionType,
        isRequired: g.isRequired,
        options: g.options.map((o) => ({
            id: o.id,
            name: o.name,
            price: o.price,
            ingredients: o.ingredients.map(
                (i): DetailIngredient => ({
                    id: i.id,
                    ingredientId: i.ingredientId,
                    name: i.name,
                    unit: i.unit,
                    quantity: i.quantity,
                }),
            ),
        })),
    }));

    const handleBack = () => {
        if (confirmLeave()) navigate("/admin/menu");
    };

    return (
        <div className="flex flex-col gap-5 p-5">
            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={handleBack}
                    className="text-(--admin-text-muted) hover:text-(--admin-text)"
                >
                    <ArrowLeftIcon className="size-4" />
                </Button>
                <h1 className="text-sm font-semibold text-(--admin-primary)">
                    New Menu Item
                </h1>
            </div>

            <Tabs defaultValue="basic" className="flex flex-col">
                <TabsList className="mb-4 shrink-0 bg-(--admin-hover)">
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="recipe">Recipe</TabsTrigger>
                    <TabsTrigger value="modifiers">Modifiers</TabsTrigger>
                </TabsList>

                <TabsContent value="basic">
                    <div className="rounded-lg border border-(--admin-border) bg-(--admin-card) p-4">
                        <h2 className="mb-3 text-xs font-semibold text-(--admin-text-secondary)">
                            Basic Info
                        </h2>
                        <div className="grid gap-1.5">
                            <Label htmlFor="create-item-name" className="text-[11px] text-(--admin-text-secondary)">
                                Name
                            </Label>
                            <Input
                                id="create-item-name"
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Iced Caramel Latte"
                                maxLength={100}
                                className="h-8 border-(--admin-border) bg-(--admin-card) text-xs"
                            />
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-3">
                            <div className="grid gap-1.5">
                                <Label htmlFor="create-item-price" className="text-[11px] text-(--admin-text-secondary)">
                                    Base Price
                                </Label>
                                <Input
                                    id="create-item-price"
                                    step="0.01"
                                    min="0"
                                    value={basePrice}
                                    onChange={(e) =>
                                        setBasePrice(e.target.value)
                                    }
                                    placeholder="0.00"
                                    className="h-8 border-(--admin-border) bg-(--admin-card) font-mono text-xs"
                                />
                            </div>
                            <div className="grid gap-1.5">
                                <Label className="text-[11px] text-(--admin-text-secondary)">
                                    Category
                                </Label>
                                <Select
                                    key={categories?.length}
                                    value={categoryId}
                                    onValueChange={(v) =>
                                        setCategoryId(v ?? "")
                                    }
                                >
                                    <SelectTrigger className="h-8 w-full border-(--admin-border) bg-(--admin-card) text-xs">
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
                            <Checkbox
                                id="available"
                                checked={isAvailable}
                                onCheckedChange={(c) =>
                                    setIsAvailable(c === true)
                                }
                            />
                            <Label
                                htmlFor="available"
                                className="text-[12px] text-(--admin-text-secondary)"
                            >
                                Available for order
                            </Label>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="recipe">
                    <RecipeTab
                        entries={recipes}
                        onRemove={handleRemoveRecipe}
                        selectedIngredientId={newRecipeIngredient}
                        quantity={newRecipeQuantity}
                        onIngredientIdChange={setNewRecipeIngredient}
                        onQuantityChange={setNewRecipeQuantity}
                        onAdd={handleAddRecipe}
                        ingredients={ingredients}
                    />
                </TabsContent>

                <TabsContent
                    value="modifiers"
                    className="md:max-h-[520px] md:overflow-y-auto"
                >
                    <ModifierTab
                        groups={detailGroups}
                        onAddGroup={handleAddGroup}
                        onUpdateGroup={handleUpdateGroup}
                        onDeleteGroup={handleDeleteGroup}
                        onAddOption={handleAddOption}
                        onUpdateOption={handleUpdateOption}
                        onDeleteOption={handleDeleteOption}
                        onAddIngredient={handleAddOptionIngredient}
                        onUpdateIngredient={handleUpdateOptionIngredient}
                        onDeleteIngredient={handleDeleteOptionIngredient}
                        ingredients={ingredients}
                    />
                </TabsContent>
            </Tabs>

            <div className="flex gap-2">
                <Button
                    onClick={handleCreate}
                    disabled={creating}
                    className="h-8 bg-(--admin-primary) text-xs text-white hover:bg-(--admin-primary)/80 cursor-pointer"
                >
                    {creating ? "Creating..." : "Create Item"}
                </Button>
                <Button
                    variant="ghost"
                    onClick={handleBack}
                    disabled={creating}
                    className="h-8 text-xs text-(--admin-text-secondary)"
                >
                    Cancel
                </Button>
            </div>
        </div>
    );
};

export default MenuItemCreatePage;
