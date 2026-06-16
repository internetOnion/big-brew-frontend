import { useState } from "react";
import { PlusIcon, CheckIcon, XIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export type GroupListItem = {
    id: string;
    name: string;
    selectionType: "single" | "multiple";
    isRequired: boolean;
    optionCount: number;
};

type ModifierGroupListProps = {
    groups: GroupListItem[];
    selectedGroupId: string | null;
    onSelect: (groupId: string) => void;
    onAdd: (
        name: string,
        type: "single" | "multiple",
        required: boolean,
    ) => void;
};

const ModifierGroupList = ({
    groups,
    selectedGroupId,
    onSelect,
    onAdd,
}: ModifierGroupListProps) => {
    const [showAdd, setShowAdd] = useState(false);
    const [newName, setNewName] = useState("");
    const [newType, setNewType] = useState<"single" | "multiple">("single");
    const [newRequired, setNewRequired] = useState(false);

    const handleAdd = () => {
        if (!newName.trim()) return;
        onAdd(newName.trim(), newType, newRequired);
        setNewName("");
        setNewType("single");
        setNewRequired(false);
        setShowAdd(false);
    };

    const handleCancel = () => {
        setShowAdd(false);
        setNewName("");
        setNewRequired(false);
    };

    return (
        <div className="flex flex-col border-r border-(--admin-border)">
            <div className="flex items-center justify-between border-b border-(--admin-border) px-4 py-3">
                <h3 className="text-[11px] font-medium uppercase tracking-wide text-(--admin-text-secondary)">
                    Modifier Groups
                </h3>
            </div>

            <div className="flex-1 overflow-y-auto">
                {groups.length === 0 && !showAdd ? (
                    <div className="px-4 py-8 text-center">
                        <p className="text-[12px] text-(--admin-text-muted)">
                            No modifier groups yet.
                        </p>
                        <p className="mt-1 text-[11px] text-(--admin-text-muted)">
                            Add your first group below.
                        </p>
                    </div>
                ) : (
                    groups.map((group) => (
                        <button
                            key={group.id}
                            onClick={() => onSelect(group.id)}
                            className={`flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-(--admin-hover) ${
                                selectedGroupId === group.id
                                    ? "border-l-2 border-(--admin-accent) bg-(--admin-hover)"
                                    : "border-l-2 border-transparent"
                            }`}
                        >
                            <div className="flex flex-1 flex-col">
                                <span className="text-[12px] font-medium text-(--admin-text)">
                                    {group.name}
                                </span>
                                <span className="text-[10px] text-(--admin-text-muted)">
                                    {group.selectionType === "single"
                                        ? "Single"
                                        : "Multiple"}
                                    {group.isRequired ? " · Required" : ""} ·{" "}
                                    {group.optionCount}{" "}
                                    {group.optionCount === 1
                                        ? "option"
                                        : "options"}
                                </span>
                            </div>
                        </button>
                    ))
                )}
            </div>

            <div className="border-t border-(--admin-border) p-3">
                {showAdd ? (
                    <div className="flex flex-col gap-2">
                        <Input
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Group name"
                            className="h-7 border-(--admin-border) bg-(--admin-card) text-xs"
                            autoFocus
                        />
                        <div className="flex items-center gap-2">
                            <Select
                                value={newType}
                                onValueChange={(v) =>
                                    setNewType(v as "single" | "multiple")
                                }
                            >
                                <SelectTrigger className="h-7 w-24 border-(--admin-border) bg-(--admin-card) text-xs">
                                    <SelectValue>
                                        {(val) =>
                                            val === "single"
                                                ? "Single"
                                                : "Multiple"
                                        }
                                    </SelectValue>
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
                            <label className="flex items-center gap-1 text-[11px] text-(--admin-text-secondary)">
                                <input
                                    type="checkbox"
                                    checked={newRequired}
                                    onChange={(e) =>
                                        setNewRequired(e.target.checked)
                                    }
                                    className="size-3 accent-(--admin-accent)"
                                />
                                Req
                            </label>
                            <div className="ml-auto flex gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon-xs"
                                    onClick={handleAdd}
                                    className="text-green-600 hover:text-green-700"
                                >
                                    <CheckIcon className="size-3.5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon-xs"
                                    onClick={handleCancel}
                                    className="text-(--admin-text-muted)"
                                >
                                    <XIcon className="size-3.5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAdd(true)}
                        className="w-full border-dashed border-(--admin-border) text-[11px] text-(--admin-text-secondary)"
                    >
                        <PlusIcon className="size-3.5" />
                        Add Group
                    </Button>
                )}
            </div>
        </div>
    );
};

export default ModifierGroupList;
