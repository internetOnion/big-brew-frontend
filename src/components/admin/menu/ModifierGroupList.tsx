import { useState } from "react";
import { toast } from "sonner";
import { PlusIcon, CheckIcon, XIcon } from "@phosphor-icons/react";
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
        if (!newName.trim()) {
            toast.error("Group name is required");
            return;
        }
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
        <div className="flex h-full flex-col border-b border-(--admin-border) md:border-b-0 md:border-r">
            <div className="flex items-center justify-between border-b border-(--admin-border) px-4 py-3">
                <h2 className="text-xs font-semibold text-(--admin-text-secondary)">
                    Modifier Groups
                </h2>
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
                                    ? "bg-(--admin-hover) font-medium"
                                    : ""
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
                            aria-label="New group name"
                            placeholder="Group name"
                            className="h-7 border-(--admin-border) bg-(--admin-card) text-xs"
                            autoFocus
                        />
                        <div className="flex items-center gap-2 overflow-hidden">
                            <Select
                                value={newType}
                                onValueChange={(v) =>
                                    setNewType(v as "single" | "multiple")
                                }
                            >
                                <SelectTrigger className="h-7 flex-1 min-w-0 border-(--admin-border) bg-(--admin-card) text-xs">
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
                            <label className="flex shrink-0 items-center gap-1.5 text-xs text-(--admin-text-secondary)">
                                <Checkbox
                                    checked={newRequired}
                                    onCheckedChange={(c) =>
                                        setNewRequired(c === true)
                                    }
                                />
                                Required
                            </label>
                            <div className="ml-auto flex shrink-0 gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon-xs"
                                    onClick={handleAdd}
                                    className="text-(--admin-accent) hover:text-(--admin-accent)/80"
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
