import { useState } from "react";
import {
    format,
    startOfMonth,
    endOfDay,
    subDays,
    startOfWeek,
    startOfYear,
} from "date-fns";
import { CalendarIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

export interface DateRange {
    from: Date;
    to: Date;
}

interface DateRangePickerProps {
    value: DateRange;
    onChange: (range: DateRange) => void;
}

const presets = [
    {
        label: "Today",
        getRange: () => ({ from: new Date(), to: endOfDay(new Date()) }),
    },
    {
        label: "This Week",
        getRange: () => ({
            from: startOfWeek(new Date(), { weekStartsOn: 1 }),
            to: endOfDay(new Date()),
        }),
    },
    {
        label: "This Month",
        getRange: () => ({
            from: startOfMonth(new Date()),
            to: endOfDay(new Date()),
        }),
    },
    {
        label: "This Year",
        getRange: () => ({
            from: startOfYear(new Date()),
            to: endOfDay(new Date()),
        }),
    },
    {
        label: "Last 7d",
        getRange: () => ({
            from: subDays(new Date(), 6),
            to: endOfDay(new Date()),
        }),
    },
    {
        label: "Last 30d",
        getRange: () => ({
            from: subDays(new Date(), 29),
            to: endOfDay(new Date()),
        }),
    },
];

const DateRangePicker = ({ value, onChange }: DateRangePickerProps) => {
    const [fromOpen, setFromOpen] = useState(false);
    const [toOpen, setToOpen] = useState(false);
    const [activePreset, setActivePreset] = useState<string | null>("Today");

    const handlePresetClick = (label: string) => {
        const preset = presets.find((p) => p.label === label);
        if (preset) {
            setActivePreset(label);
            onChange(preset.getRange());
        }
    };

    const handleFromSelect = (date: Date | undefined) => {
        if (date) {
            setActivePreset(null);
            onChange({ ...value, from: date });
            setFromOpen(false);
        }
    };

    const handleToSelect = (date: Date | undefined) => {
        if (date) {
            setActivePreset(null);
            onChange({ ...value, to: endOfDay(date) });
            setToOpen(false);
        }
    };

    return (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
            {/* Date buttons */}
            <div className="flex items-center gap-1.5">
                <Popover open={fromOpen} onOpenChange={setFromOpen}>
                    <PopoverTrigger
                        render={
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-7 gap-1.5 border-(--admin-border) bg-(--admin-card) px-2.5 font-mono text-[11px] text-(--admin-text-secondary) hover:bg-(--admin-hover) hover:text-(--admin-text)"
                            />
                        }
                    >
                        <CalendarIcon className="size-3 text-(--admin-text-muted)" />
                        {format(value.from, "MMM d, yyyy")}
                    </PopoverTrigger>
                    <PopoverContent
                        className="w-auto border-(--admin-border) bg-(--admin-card) p-0"
                        align="start"
                    >
                        <Calendar
                            mode="single"
                            selected={value.from}
                            disabled={{ after: value.to }}
                            onSelect={handleFromSelect}
                        />
                    </PopoverContent>
                </Popover>

                <span className="text-[10px] text-(--admin-text-muted)">
                    &rarr;
                </span>

                <Popover open={toOpen} onOpenChange={setToOpen}>
                    <PopoverTrigger
                        render={
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-7 gap-1.5 border-(--admin-border) bg-(--admin-card) px-2.5 font-mono text-[11px] text-(--admin-text-secondary) hover:bg-(--admin-hover) hover:text-(--admin-text)"
                            />
                        }
                    >
                        <CalendarIcon className="size-3 text-(--admin-text-muted)" />
                        {format(value.to, "MMM d, yyyy")}
                    </PopoverTrigger>
                    <PopoverContent
                        className="w-auto border-(--admin-border) bg-(--admin-card) p-0"
                        align="start"
                    >
                        <Calendar
                            mode="single"
                            selected={value.to}
                            disabled={{ before: value.from }}
                            onSelect={handleToSelect}
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {/* Preset chips */}
            <div className="flex gap-0.5 rounded-md bg-(--admin-hover) p-0.5">
                {presets.map((preset) => (
                    <button
                        key={preset.label}
                        onClick={() => handlePresetClick(preset.label)}
                        className={`cursor-pointer rounded px-2 py-1 text-[11px] transition-colors ${
                            activePreset === preset.label
                                ? "bg-(--admin-card) font-medium text-(--admin-primary) shadow-sm"
                                : "text-(--admin-text-muted) hover:text-(--admin-text-secondary)"
                        }`}
                    >
                        {preset.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default DateRangePicker;
