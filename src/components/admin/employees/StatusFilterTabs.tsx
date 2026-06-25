export type StatusFilter = "all" | "active" | "inactive";

interface Tab {
    value: StatusFilter;
    label: string;
}

interface StatusFilterTabsProps {
    tabs: Tab[];
    value: StatusFilter;
    onChange: (value: StatusFilter) => void;
}

const StatusFilterTabs = ({ tabs, value, onChange }: StatusFilterTabsProps) => (
    <div className="flex rounded-lg border border-(--admin-border) bg-(--admin-card) p-0.5">
        {tabs.map((tab) => (
            <button
                key={tab.value}
                onClick={() => onChange(tab.value)}
                className={`
                    rounded-md px-3 py-1 text-[11px] font-medium cursor-pointer
                    transition-colors duration-150
                    ${
                        value === tab.value
                            ? "bg-(--admin-primary) text-white"
                            : "text-(--admin-text-secondary) hover:text-(--admin-text)"
                    }
                `}
            >
                {tab.label}
            </button>
        ))}
    </div>
);

export default StatusFilterTabs;
