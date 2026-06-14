import { FileText } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface ItemNoteInputProps {
    value: string;
    onChange: (value: string) => void;
}

export const ItemNoteInput = ({ value, onChange }: ItemNoteInputProps) => (
    <div className="mb-5">
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Note
        </label>
        <div className="relative p-0.5">
            <FileText className="pointer-events-none absolute left-3.5 top-3 size-4 text-muted-foreground" />
            <Textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Any special requests..."
                className="min-h-[72px] resize-none border-border bg-secondary pl-9"
                rows={3}
            />
        </div>
    </div>
);
