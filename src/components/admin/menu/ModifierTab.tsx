import { useState, useEffect } from "react";
import ModifierGroupList, {
    type GroupListItem,
} from "@/components/admin/menu/ModifierGroupList";
import ModifierGroupDetail, {
    type DetailGroup,
} from "@/components/admin/menu/ModifierGroupDetail";
import type { InventoryItem } from "@/types/admin";

type ModifierTabProps = {
    groups: DetailGroup[];
    onAddGroup: (
        name: string,
        type: "single" | "multiple",
        required: boolean,
    ) => void;
    onUpdateGroup: (
        groupId: string,
        name: string,
        type: "single" | "multiple",
        required: boolean,
    ) => void;
    onDeleteGroup: (groupId: string) => void;
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

const ModifierTab = ({
    groups,
    onAddGroup,
    onUpdateGroup,
    onDeleteGroup,
    onAddOption,
    onUpdateOption,
    onDeleteOption,
    onAddIngredient,
    onUpdateIngredient,
    onDeleteIngredient,
    ingredients,
}: ModifierTabProps) => {
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

    const groupListItems: GroupListItem[] = groups.map((g) => ({
        id: g.id,
        name: g.name,
        selectionType: g.selectionType,
        isRequired: g.isRequired,
        optionCount: g.options.length,
    }));

    useEffect(() => {
        if (selectedGroupId && !groups.find((g) => g.id === selectedGroupId)) {
            setSelectedGroupId(groups[0]?.id ?? null);
        }
    }, [groups, selectedGroupId]);

    const selectedGroup = selectedGroupId
        ? (groups.find((g) => g.id === selectedGroupId) ?? null)
        : null;

    return (
        <div className="flex flex-col rounded-lg border border-(--admin-border) bg-(--admin-card) md:h-full md:min-h-0 md:flex-row">
            <div
                className={`shrink-0 overflow-hidden md:h-full md:w-56 ${selectedGroup ? "hidden md:block" : "block"}`}
            >
                <ModifierGroupList
                    groups={groupListItems}
                    selectedGroupId={selectedGroupId}
                    onSelect={setSelectedGroupId}
                    onAdd={onAddGroup}
                />
            </div>
            <div
                className={`flex flex-1 min-w-0 flex-col ${selectedGroup ? "block" : "hidden md:flex"}`}
            >
                {selectedGroup ? (
                    <ModifierGroupDetail
                        group={selectedGroup}
                        onBack={() => setSelectedGroupId(null)}
                        onUpdate={onUpdateGroup}
                        onDelete={onDeleteGroup}
                        onAddOption={onAddOption}
                        onUpdateOption={onUpdateOption}
                        onDeleteOption={onDeleteOption}
                        onAddIngredient={onAddIngredient}
                        onUpdateIngredient={onUpdateIngredient}
                        onDeleteIngredient={onDeleteIngredient}
                        ingredients={ingredients}
                    />
                ) : (
                    <div className="flex flex-1 items-center justify-center">
                        <div className="text-center">
                            <p className="text-[12px] text-(--admin-text-muted)">
                                {groups.length === 0
                                    ? "No modifier groups yet. Create one to get started."
                                    : "Select a modifier group from the left panel."}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ModifierTab;
