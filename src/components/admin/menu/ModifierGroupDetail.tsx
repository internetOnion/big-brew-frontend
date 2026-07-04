import { useState } from "react";
import { toast } from "sonner";
import {
    ArrowLeftIcon,
    CaretDownIcon,
    CaretRightIcon,
    PencilSimpleIcon,
    TrashIcon,
    PlusIcon,
    CheckIcon,
    XIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { InventoryItem } from "@/types/admin";

type DetailIngredient = {
    id: string;
    ingredientId: string;
    name: string;
    unit: string;
    quantity: string;
};

type DetailOption = {
    id: string;
    name: string;
    price: string;
    ingredients: DetailIngredient[];
};

type DetailGroup = {
    id: string;
    name: string;
    selectionType: "single" | "multiple";
    isRequired: boolean;
    options: DetailOption[];
};

type ModifierGroupDetailProps = {
    group: DetailGroup;
    onBack?: () => void;
    onUpdate: (
        groupId: string,
        name: string,
        type: "single" | "multiple",
        required: boolean,
    ) => void;
    onDelete: (groupId: string) => void;
    onAddOption: (groupId: string, name: string, price: string) => void;
    onUpdateOption: (
        groupId: string,
        optionId: string,
        name: string,
        price: string,
    ) => void;
    onDeleteOption: (groupId: string, optionId: string) => void;
    onAddIngredient: (
        groupId: string,
        optionId: string,
        ingredientId: string,
        quantity: string,
    ) => void;
    onUpdateIngredient?: (
        groupId: string,
        optionId: string,
        ingredientId: string,
        quantity: string,
    ) => void;
    onDeleteIngredient: (
        groupId: string,
        optionId: string,
        ingredientId: string,
    ) => void;
    ingredients: InventoryItem[] | undefined;
};

const ModifierGroupDetail = ({
    group,
    onBack,
    onUpdate,
    onDelete,
    onAddOption,
    onUpdateOption,
    onDeleteOption,
    onAddIngredient,
    onUpdateIngredient,
    onDeleteIngredient,
    ingredients,
}: ModifierGroupDetailProps) => {
    const [editing, setEditing] = useState(false);
    const [editName, setEditName] = useState("");
    const [editType, setEditType] = useState<"single" | "multiple">(
        group.selectionType,
    );
    const [editRequired, setEditRequired] = useState(group.isRequired);

    const [expandedOptions, setExpandedOptions] = useState<Set<string>>(
        new Set(),
    );
    const [editingOptionId, setEditingOptionId] = useState<string | null>(null);
    const [editOptionName, setEditOptionName] = useState("");
    const [editOptionPrice, setEditOptionPrice] = useState("");

    const [showAddOption, setShowAddOption] = useState(false);
    const [newOptionName, setNewOptionName] = useState("");
    const [newOptionPrice, setNewOptionPrice] = useState("0");

    const [addingIngredientToOption, setAddingIngredientToOption] = useState<
        string | null
    >(null);
    const [newIngId, setNewIngId] = useState("");
    const [newIngQty, setNewIngQty] = useState("");

    const [editingIngredientId, setEditingIngredientId] = useState<
        string | null
    >(null);
    const [editIngQty, setEditIngQty] = useState("");

    const startEdit = () => {
        setEditName(group.name);
        setEditType(group.selectionType);
        setEditRequired(group.isRequired);
        setEditing(true);
    };

    const saveEdit = () => {
        if (!editName.trim()) {
            toast.error("Group name is required");
            return;
        }
        onUpdate(group.id, editName.trim(), editType, editRequired);
        setEditing(false);
    };

    const cancelEdit = () => {
        setEditing(false);
    };

    const toggleOption = (optionId: string) => {
        setExpandedOptions((prev) => {
            const next = new Set(prev);
            if (next.has(optionId)) next.delete(optionId);
            else next.add(optionId);
            return next;
        });
    };

    const startEditOption = (option: DetailOption) => {
        setEditingOptionId(option.id);
        setEditOptionName(option.name);
        setEditOptionPrice(option.price);
    };

    const saveOption = () => {
        if (!editingOptionId || !editOptionName.trim()) {
            toast.error("Option name is required");
            return;
        }
        onUpdateOption(
            group.id,
            editingOptionId,
            editOptionName.trim(),
            editOptionPrice || "0",
        );
        setEditingOptionId(null);
    };

    const handleAddOption = () => {
        if (!newOptionName.trim()) {
            toast.error("Option name is required");
            return;
        }
        onAddOption(group.id, newOptionName.trim(), newOptionPrice || "0");
        setNewOptionName("");
        setNewOptionPrice("0");
        setShowAddOption(false);
    };

    const handleAddIngredient = (optionId: string) => {
        if (!newIngId || !newIngQty) {
            toast.error("Select an ingredient and enter quantity");
            return;
        }
        if (parseFloat(newIngQty) <= 0) {
            toast.error("Quantity must be greater than 0");
            return;
        }
        onAddIngredient(group.id, optionId, newIngId, newIngQty);
        setNewIngId("");
        setNewIngQty("");
        setAddingIngredientToOption(null);
    };

    const startEditIngredient = (ingredient: DetailIngredient) => {
        setEditingIngredientId(ingredient.id);
        setEditIngQty(ingredient.quantity);
    };

    const saveIngredient = (optionId: string, ingredient: DetailIngredient) => {
        if (!onUpdateIngredient || !editIngQty) {
            toast.error("Enter a valid quantity");
            return;
        }
        const qty = parseFloat(editIngQty);
        if (isNaN(qty) || qty <= 0) {
            toast.error("Quantity must be greater than 0");
            return;
        }
        onUpdateIngredient(
            group.id,
            optionId,
            ingredient.ingredientId,
            editIngQty,
        );
        setEditingIngredientId(null);
    };

    return (
        <div className="flex flex-col">
            {/* Group header */}
            <div className="border-b border-(--admin-border) px-4 py-3">
                {editing ? (
                    <div className="flex flex-wrap items-center gap-2">
                        <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            aria-label="Group name"
                            className="h-7 flex-1 min-w-32 border-(--admin-border) bg-(--admin-card) text-xs"
                            autoFocus
                        />
                        <Select
                            value={editType}
                            onValueChange={(v) =>
                                setEditType(v as "single" | "multiple")
                            }
                        >
                            <SelectTrigger className="h-7 w-24 border-(--admin-border) bg-(--admin-card) text-xs">
                                <SelectValue>
                                    {(val) =>
                                        val === "single" ? "Single" : "Multiple"
                                    }
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="single">Single</SelectItem>
                                <SelectItem value="multiple">
                                    Multiple
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <label className="flex items-center gap-1.5 text-xs text-(--admin-text-secondary)">
                            <Checkbox
                                checked={editRequired}
                                onCheckedChange={(c) =>
                                    setEditRequired(c === true)
                                }
                            />
                            Required
                        </label>
                        <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={saveEdit}
                            className="text-(--admin-accent) hover:text-(--admin-accent)/80"
                        >
                            <CheckIcon className="size-3.5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={cancelEdit}
                            className="text-(--admin-text-muted)"
                        >
                            <XIcon className="size-3.5" />
                        </Button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        {onBack && (
                            <Button
                                variant="ghost"
                                size="icon-xs"
                                onClick={onBack}
                                className="shrink-0 text-(--admin-text-muted) hover:text-(--admin-text) md:hidden"
                            >
                                <ArrowLeftIcon className="size-4" />
                            </Button>
                        )}
                        <div className="flex-1">
                            <h3 className="text-[13px] font-medium text-(--admin-text)">
                                {group.name}
                            </h3>
                            <span className="text-[11px] capitalize text-(--admin-text-muted)">
                                {group.selectionType}
                                {group.isRequired ? " · required" : ""}
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon-xs"
                                onClick={startEdit}
                                className="text-(--admin-text-muted) hover:text-(--admin-text)"
                            >
                                <PencilSimpleIcon className="size-3" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => onDelete(group.id)}
                                className="text-destructive hover:text-destructive/80"
                            >
                                <TrashIcon className="size-3" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Options list */}
            <div className="flex-1 overflow-y-auto divide-y divide-(--admin-border)">
                {group.options.length === 0 && !showAddOption ? (
                    <div className="px-4 py-8 text-center">
                        <p className="text-[12px] text-(--admin-text-muted)">
                            No options in this group.
                        </p>
                    </div>
                ) : (
                    group.options.map((option) => (
                        <div key={option.id}>
                            {/* Option row */}
                            {editingOptionId === option.id ? (
                                <div className="flex flex-wrap items-center gap-2 px-4 py-2.5">
                                    <Input
                                        value={editOptionName}
                                        onChange={(e) =>
                                            setEditOptionName(e.target.value)
                                        }
                                        aria-label="Option name"
                                        className="h-7 flex-1 border-(--admin-border) bg-(--admin-card) text-xs"
                                        autoFocus
                                    />
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={editOptionPrice}
                                        onChange={(e) =>
                                            setEditOptionPrice(e.target.value)
                                        }
                                        aria-label="Option price"
                                        placeholder="$0.00"
                                        className="h-7 w-20 border-(--admin-border) bg-(--admin-card) font-mono text-xs"
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon-xs"
                                        onClick={saveOption}
                                        className="text-(--admin-accent) hover:text-(--admin-accent)/80"
                                    >
                                        <CheckIcon className="size-3.5" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon-xs"
                                        onClick={() => setEditingOptionId(null)}
                                        className="text-(--admin-text-muted)"
                                    >
                                        <XIcon className="size-3.5" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex items-center">
                                    <button
                                        onClick={() => toggleOption(option.id)}
                                        className="flex flex-1 cursor-pointer items-center gap-2 px-4 py-2.5 text-left"
                                    >
                                        {expandedOptions.has(option.id) ? (
                                            <CaretDownIcon className="size-3 text-(--admin-text-muted)" />
                                        ) : (
                                            <CaretRightIcon className="size-3 text-(--admin-text-muted)" />
                                        )}
                                        <span className="text-[13px] text-(--admin-text)">
                                            {option.name}
                                        </span>
                                        <span className="ml-auto font-mono text-xs text-(--admin-text-secondary)">
                                            +$
                                            {parseFloat(option.price).toFixed(
                                                2,
                                            )}
                                        </span>
                                    </button>
                                    <Button
                                        variant="ghost"
                                        size="icon-xs"
                                        onClick={() => startEditOption(option)}
                                        className="mr-1 text-(--admin-text-muted) hover:text-(--admin-text)"
                                    >
                                        <PencilSimpleIcon className="size-3" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon-xs"
                                        onClick={() =>
                                            onDeleteOption(group.id, option.id)
                                        }
                                        className="mr-2 text-destructive hover:text-destructive/80"
                                    >
                                        <TrashIcon className="size-3" />
                                    </Button>
                                </div>
                            )}

                            {/* Option ingredients (expandable) */}
                            {expandedOptions.has(option.id) && (
                                <div className="border-t border-(--admin-border) bg-(--admin-hover)/50 px-4 py-2 md:px-8">
                                    {option.ingredients.map((ing) =>
                                        editingIngredientId === ing.id ? (
                                            <div
                                                key={ing.id}
                                                className="flex items-center justify-between py-0.5"
                                            >
                                                <span
                                                    id={`ing-name-${ing.id}`}
                                                    className="text-xs text-(--admin-text)"
                                                >
                                                    {ing.name}
                                                </span>
                                                <div className="flex items-center gap-1.5">
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        min="0.01"
                                                        value={editIngQty}
                                                        onChange={(e) =>
                                                            setEditIngQty(
                                                                e.target.value,
                                                            )
                                                        }
                                                        aria-labelledby={`ing-name-${ing.id}`}
                                                        className="h-6 w-16 border-(--admin-border) bg-(--admin-card) font-mono text-[11px]"
                                                    />
                                                    <span className="text-[11px] text-(--admin-text-muted)">
                                                        {ing.unit}
                                                    </span>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon-xs"
                                                        onClick={() =>
                                                            saveIngredient(
                                                                option.id,
                                                                ing,
                                                            )
                                                        }
                                                        className="text-(--admin-accent) hover:text-(--admin-accent)/80"
                                                    >
                                                        <CheckIcon className="size-3" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon-xs"
                                                        onClick={() =>
                                                            setEditingIngredientId(
                                                                null,
                                                            )
                                                        }
                                                        className="text-(--admin-text-muted)"
                                                    >
                                                        <XIcon className="size-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div
                                                key={ing.id}
                                                className="flex items-center justify-between py-0.5"
                                            >
                                                <span className="text-xs text-(--admin-text)">
                                                    {ing.name}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-[11px] text-(--admin-text-muted)">
                                                        {ing.quantity}{" "}
                                                        {ing.unit}
                                                    </span>
                                                    {onUpdateIngredient && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon-xs"
                                                            onClick={() =>
                                                                startEditIngredient(
                                                                    ing,
                                                                )
                                                            }
                                                            className="text-(--admin-text-muted) hover:text-(--admin-text)"
                                                        >
                                                            <PencilSimpleIcon className="size-2.5" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon-xs"
                                                        onClick={() =>
                                                            onDeleteIngredient(
                                                                group.id,
                                                                option.id,
                                                                ing.ingredientId,
                                                            )
                                                        }
                                                        className="text-destructive hover:text-destructive/80"
                                                    >
                                                        <TrashIcon className="size-2.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ),
                                    )}

                                    {addingIngredientToOption === option.id ? (
                                        <div className="flex flex-wrap items-center gap-2 py-1">
                                            <Select
                                                value={newIngId}
                                                onValueChange={(v) =>
                                                    setNewIngId(v ?? "")
                                                }
                                            >
                                                <SelectTrigger className="h-6 flex-1 border-(--admin-border) bg-(--admin-card) text-[11px]">
                                                    <SelectValue placeholder="Select..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {ingredients?.map((ing) => (
                                                        <SelectItem
                                                            key={ing.id}
                                                            value={ing.id}
                                                        >
                                                            {ing.name} (
                                                            {ing.unit})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min="0.01"
                                                value={newIngQty}
                                                onChange={(e) =>
                                                    setNewIngQty(e.target.value)
                                                }
                                                aria-label="New ingredient quantity"
                                                placeholder="Qty"
                                                className="h-6 w-16 border-(--admin-border) bg-(--admin-card) font-mono text-[11px]"
                                            />
                                            <Button
                                                variant="ghost"
                                                size="icon-xs"
                                                onClick={() =>
                                                    handleAddIngredient(
                                                        option.id,
                                                    )
                                                }
                                                className="text-(--admin-accent) hover:text-(--admin-accent)/80"
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
                                                    setNewIngId("");
                                                    setNewIngQty("");
                                                }}
                                                className="text-(--admin-text-muted)"
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
                                            className="mt-1 h-6 gap-1 text-[11px] text-(--admin-text-muted) hover:text-(--admin-text)"
                                        >
                                            <PlusIcon className="size-2.5" />
                                            Add ingredient
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}

                {/* Add option form / button */}
                {showAddOption ? (
                    <div className="flex flex-wrap items-center gap-2 px-4 py-2.5">
                        <Input
                            value={newOptionName}
                            onChange={(e) => setNewOptionName(e.target.value)}
                            aria-label="New option name"
                            placeholder="Option name"
                            className="h-7 flex-1 border-(--admin-border) bg-(--admin-card) text-xs"
                            autoFocus
                        />
                        <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={newOptionPrice}
                            onChange={(e) => setNewOptionPrice(e.target.value)}
                            aria-label="New option price"
                            placeholder="$0.00"
                            className="h-7 w-20 border-(--admin-border) bg-(--admin-card) font-mono text-xs"
                        />
                        <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={handleAddOption}
                            className="text-(--admin-accent) hover:text-(--admin-accent)/80"
                        >
                            <CheckIcon className="size-3.5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => {
                                setShowAddOption(false);
                                setNewOptionName("");
                                setNewOptionPrice("0");
                            }}
                            className="text-(--admin-text-muted)"
                        >
                            <XIcon className="size-3.5" />
                        </Button>
                    </div>
                ) : (
                    <button
                        onClick={() => setShowAddOption(true)}
                        className="flex w-full cursor-pointer items-center gap-1.5 px-4 py-2.5 text-left text-[11px] text-(--admin-text-muted) hover:bg-(--admin-hover)/30 hover:text-(--admin-text-secondary)"
                    >
                        <PlusIcon className="size-3" />
                        Add option
                    </button>
                )}
            </div>
        </div>
    );
};

export default ModifierGroupDetail;
export type { DetailGroup, DetailOption, DetailIngredient };
