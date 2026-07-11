import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
    value: Date | null;
    onChange: (date: Date | undefined) => void;
    placeholder?: string;
    disabled?: (date: Date) => boolean;
}

const DatePicker = ({
    value,
    onChange,
    placeholder = "Pick a date",
    disabled,
}: DatePickerProps) => {
    const [open, setOpen] = useState(false);

    const handleSelect = (date: Date | undefined) => {
        onChange(date);
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
                render={
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 max-md:min-h-[44px] w-full justify-start gap-1.5 border-(--admin-border) bg-(--admin-card) px-2.5 font-mono text-xs text-(--admin-text-secondary) hover:bg-(--admin-hover) hover:text-(--admin-text)"
                    />
                }
            >
                <CalendarIcon className="size-3 shrink-0 text-(--admin-text-muted)" />
                {value ? format(value, "MMM d, yyyy") : placeholder}
            </PopoverTrigger>
            <PopoverContent
                className="w-auto border-(--admin-border) bg-(--admin-card) p-0"
                align="start"
            >
                <Calendar
                    mode="single"
                    selected={value ?? undefined}
                    disabled={disabled}
                    onSelect={handleSelect}
                />
            </PopoverContent>
        </Popover>
    );
};

export { DatePicker };
