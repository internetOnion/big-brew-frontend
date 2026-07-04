import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeftIcon, TrashIcon } from "@phosphor-icons/react";
import api from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import { useMenuItem } from "@/hooks/useMenuItem";
import { useIngredients } from "@/hooks/useInventory";
import { useCategories } from "@/hooks/useCategories";
import { useDeleteMenuItem } from "@/hooks/useDeleteMenuItem";
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import MenuItemImageUpload from "@/components/admin/menu/MenuItemImageUpload";
import RecipeTab from "@/components/admin/menu/RecipeTab";
import type { RecipeEntry } from "@/components/admin/menu/RecipeTab";
import ModifierTab from "@/components/admin/menu/ModifierTab";
import type {
    DetailGroup,
    DetailIngredient,
} from "@/components/admin/menu/ModifierGroupDetail";
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

    const [recipes, setRecipes] = useState<RecipeEntry[]>([]);
    const [newRecipeIngredient, setNewRecipeIngredient] = useState("");
    const [newRecipeQuantity, setNewRecipeQuantity] = useState("");

    const [groups, setGroups] = useState<MenuItemResponse["modifierGroups"]>(
        [],
    );

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const deleteMutation = useDeleteMenuItem();

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

    const handleDelete = () => {
        if (!id) return;
        setDeleting(true);
        setShowDeleteDialog(false);
        deleteMutation.mutate(id, {
            onSuccess: () => {
                toast.success("Item removed from menu");
                navigate("/admin/menu");
            },
            onError: () => {
                toast.error("Failed to remove item");
                setDeleting(false);
            },
        });
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

    const handleRemoveRecipe = async (entry: RecipeEntry) => {
        if (!id) return;
        const previous = [...recipes];
        setRecipes((prev) =>
            prev.filter((r) => r.ingredientId !== entry.ingredientId),
        );
        try {
            await api.delete(ENDPOINTS.MENU.RECIPE(id, entry.ingredientId));
            toast.success("Ingredient removed");
        } catch {
            setRecipes(previous);
            toast.error("Failed to remove ingredient");
        }
    };

    const handleAddGroup = async (
        name: string,
        type: "single" | "multiple",
        required: boolean,
    ) => {
        if (!id) return;
        try {
            await api.post(ENDPOINTS.MENU.MODIFIER_GROUPS(id), {
                name,
                selectionType: type,
                isRequired: required,
            });
            toast.success("Group added");
            await refreshGroups();
        } catch {
            toast.error("Failed to add group");
        }
    };

    const handleUpdateGroup = async (
        groupId: string,
        name: string,
        type: "single" | "multiple",
        required: boolean,
    ) => {
        if (!id) return;
        try {
            await api.put(ENDPOINTS.MENU.MODIFIER_GROUP(id, groupId), {
                name,
                selectionType: type,
                isRequired: required,
            });
            toast.success("Group updated");
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

    const handleAddOption = async (
        groupId: string,
        name: string,
        price: string,
    ) => {
        if (!id) return;
        try {
            await api.post(ENDPOINTS.MENU.OPTIONS(id, groupId), {
                name,
                price: parseFloat(price) || 0,
            });
            toast.success("Option added");
            await refreshGroups();
        } catch {
            toast.error("Failed to add option");
        }
    };

    const handleUpdateOption = async (
        groupId: string,
        optionId: string,
        name: string,
        price: string,
    ) => {
        if (!id) return;
        try {
            await api.put(ENDPOINTS.MENU.OPTION(id, groupId, optionId), {
                name,
                price: parseFloat(price) || 0,
            });
            toast.success("Option updated");
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
            await api.delete(ENDPOINTS.MENU.OPTION(id, groupId, optionId));
            toast.success("Option deleted");
        } catch {
            setGroups(previous);
            toast.error("Failed to delete option");
        }
    };

    const handleAddOptionIngredient = async (
        groupId: string,
        optionId: string,
        ingredientId: string,
        quantity: string,
    ) => {
        if (!id) return;
        const qty = parseFloat(quantity);
        if (isNaN(qty) || qty <= 0) {
            toast.error("Quantity must be greater than 0");
            return;
        }
        try {
            await api.post(
                ENDPOINTS.MENU.OPTION_INGREDIENTS(id, groupId, optionId),
                { ingredientId, quantity: qty },
            );
            toast.success("Ingredient added");
            await refreshGroups();
        } catch {
            toast.error("Failed to add ingredient");
        }
    };

    const handleUpdateOptionIngredient = async (
        groupId: string,
        optionId: string,
        ingredientId: string,
        quantity: string,
    ) => {
        if (!id) return;
        const qty = parseFloat(quantity);
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
                                            (i) =>
                                                i.ingredient.id !==
                                                ingredientId,
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

    if (!id) {
        navigate("/admin/menu");
        return null;
    }

    const detailGroups: DetailGroup[] = groups.map((g) => ({
        id: g.id,
        name: g.name,
        selectionType: g.selectionType as "single" | "multiple",
        isRequired: g.isRequired ?? false,
        options: g.options.map((o) => ({
            id: o.id,
            name: o.name,
            price: o.price,
            ingredients: o.ingredients.map(
                (i): DetailIngredient => ({
                    id: i.id,
                    ingredientId: i.ingredient.id,
                    name: i.ingredient.name,
                    unit: i.ingredient.unit,
                    quantity: i.quantity,
                }),
            ),
        })),
    }));

    return (
        <div className="flex flex-col gap-5 p-5">
            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => navigate("/admin/menu")}
                    className="text-(--admin-text-muted) hover:text-(--admin-text)"
                >
                    <ArrowLeftIcon className="size-4" />
                </Button>
                <h1 className="text-[13px] font-medium text-(--admin-primary)">
                    {isLoading ? "Loading..." : name}
                </h1>
                {!isLoading && (
                    <>
                        <span
                            className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                isAvailable
                                    ? "bg-(--admin-primary)/10 text-(--admin-primary)"
                                    : "bg-destructive/10 text-destructive"
                            }`}
                        >
                            {isAvailable ? "Available" : "Unavailable"}
                        </span>
                        <Button
                            variant="outline"
                            size="xs"
                            onClick={() => setShowDeleteDialog(true)}
                            className="border-destructive/30 text-[11px] text-destructive hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
                        >
                            <TrashIcon className="size-3" />
                            Delete
                        </Button>
                    </>
                )}
            </div>

            {isLoading ? (
                <div className="flex h-64 items-center justify-center text-sm text-(--admin-text-muted)">
                    Loading...
                </div>
            ) : (
                <>
                    <div className="rounded-lg border border-(--admin-border) bg-(--admin-card) p-4">
                        <h2 className="mb-3 text-[11px] font-medium tracking-tight text-(--admin-text-secondary)">
                            Image
                        </h2>
                        <MenuItemImageUpload
                            itemId={id}
                            imageUrl={imageUrl}
                            onImageUpdated={setImageUrl}
                        />
                    </div>

                    <Tabs defaultValue="basic" className="flex flex-col">
                        <TabsList className="mb-4 shrink-0 bg-(--admin-hover)">
                            <TabsTrigger value="basic">Basic Info</TabsTrigger>
                            <TabsTrigger value="recipe">Recipe</TabsTrigger>
                            <TabsTrigger value="modifiers">
                                Modifiers
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="basic">
                            <div className="rounded-lg border border-(--admin-border) bg-(--admin-card) p-4">
                                <h2 className="mb-3 text-[11px] font-medium tracking-tight text-(--admin-text-secondary)">
                                    Basic Info
                                </h2>
                                <div className="grid gap-1.5">
                                    <Label
                                        htmlFor="edit-item-name"
                                        className="text-[11px] text-(--admin-text-secondary)"
                                    >
                                        Name
                                    </Label>
                                    <Input
                                        id="edit-item-name"
                                        required
                                        onChange={(e) =>
                                            setName(e.target.value)
                                        }
                                        className="h-8 border-(--admin-border) bg-(--admin-card) text-xs"
                                    />
                                </div>
                                <div className="mt-3 grid grid-cols-2 gap-3">
                                    <div className="grid gap-1.5">
                                        <Label
                                            htmlFor="edit-item-price"
                                            className="text-[11px] text-(--admin-text-secondary)"
                                        >
                                            Base Price
                                        </Label>
                                        <Input
                                            id="edit-item-price"
                                            required
                                            step="0.01"
                                            min="0"
                                            value={basePrice}
                                            onChange={(e) =>
                                                setBasePrice(e.target.value)
                                            }
                                            className="h-8 border-(--admin-border) bg-(--admin-card) font-mono text-xs"
                                        />
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label
                                            htmlFor="edit-item-category"
                                            className="text-[11px] text-(--admin-text-secondary)"
                                        >
                                            Category
                                        </Label>
                                        <Select
                                            key={categories?.length}
                                            value={categoryId}
                                            onValueChange={(v) =>
                                                setCategoryId(v ?? "")
                                            }
                                        >
                                            <SelectTrigger
                                                id="edit-item-category"
                                                aria-required="true"
                                                className="h-8 w-full border-(--admin-border) bg-(--admin-card) text-xs"
                                            >
                                                <SelectValue>
                                                    {(val) =>
                                                        categories?.find(
                                                            (c) => c.id === val,
                                                        )?.name ??
                                                        "Select category"
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
                                <div className="mt-4">
                                    <Button
                                        onClick={handleSaveBasic}
                                        className="h-8 bg-(--admin-primary) text-xs text-white hover:bg-(--admin-primary)/80"
                                    >
                                        Save Changes
                                    </Button>
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
                            className="h-[520px] overflow-hidden"
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
                                onUpdateIngredient={
                                    handleUpdateOptionIngredient
                                }
                                onDeleteIngredient={
                                    handleDeleteOptionIngredient
                                }
                                ingredients={ingredients}
                            />
                        </TabsContent>
                    </Tabs>

                    <Dialog
                        open={showDeleteDialog}
                        onOpenChange={(v) =>
                            !v && !deleting && setShowDeleteDialog(false)
                        }
                    >
                        <DialogContent className="max-w-sm border-(--admin-border) bg-(--admin-card) shadow-xl">
                            <DialogHeader>
                                <DialogTitle className="text-[14px] font-medium text-(--admin-text)">
                                    Remove Item
                                </DialogTitle>
                            </DialogHeader>
                            <p className="text-[13px] text-(--admin-text-secondary)">
                                Are you sure you want to remove{" "}
                                <span className="font-medium text-(--admin-text)">
                                    {name}
                                </span>{" "}
                                from the menu?
                            </p>
                            <div className="flex justify-end gap-2 border-t border-(--admin-border) pt-3">
                                <Button
                                    variant="ghost"
                                    onClick={() => setShowDeleteDialog(false)}
                                    disabled={deleting}
                                    className="text-(--admin-text-secondary)"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    {deleting ? "Removing..." : "Remove"}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </>
            )}
        </div>
    );
};

export default MenuItemEditPage;
