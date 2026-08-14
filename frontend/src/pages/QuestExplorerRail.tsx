import type { QuestCategoryKey } from "@/features/quests/questCategories";
import type { QuestRailGroup } from "@/features/quests/questRail";
import { getEmpireLabel } from "@/lib/labels/empireLabels";

export function CategorySelector({
    value,
    options,
    onChange,
}: {
    value: QuestCategoryKey;
    options: Array<{ key: QuestCategoryKey; label: string; count: number }>;
    onChange: (value: QuestCategoryKey) => void;
}) {
    const scopeLabels: Record<QuestCategoryKey, string> = {
        faction: "Main",
        minorFaction: "Minor",
        world: "World",
        other: "Other",
    };

    return (
        <fieldset className="questExplorer-categorySelector" aria-label="Category">
            <legend>Scope</legend>
            <div className="questExplorer-categoryOptions">
                {options.map((option) => {
                    const label = scopeLabels[option.key] ?? option.label;
                    return (
                        <label
                            className={`questExplorer-categoryOption${option.key === value ? " is-selected" : ""}`}
                            key={option.key}
                        >
                            <input
                                aria-label={`${option.label} ${option.count}`}
                                type="radio"
                                name="quest-category"
                                value={option.key}
                                checked={option.key === value}
                                onChange={() => onChange(option.key)}
                            />
                            <span className="questExplorer-categoryGlyph" aria-hidden="true" />
                            <span className="questExplorer-categoryOptionText">{label}</span>
                            <small>{option.count}</small>
                        </label>
                    );
                })}
            </div>
        </fieldset>
    );
}

function railIndexLabel(item: QuestRailGroup["items"][number], index: number): string {
    const chapterNumber = item.progression?.chapter.chapterNumber ?? item.progression?.chapter.chapterOrder;
    return String(chapterNumber ?? index + 1);
}

function railStepCountParts(metaLabel: string): { count: string; label: string } {
    const match = metaLabel.match(/^(\d+)\s+(.+)$/);
    return match ? { count: match[1], label: match[2] } : { count: metaLabel, label: "" };
}

function cleanRailDisplayLabel(value: string | null | undefined): string | null {
    const trimmed = (value ?? "").trim();
    return trimmed.length > 0 ? trimmed : null;
}

function railFactionLabel(...keys: Array<string | null | undefined>): string | null {
    for (const key of keys) {
        const label = getEmpireLabel(key);
        if (label !== "Unknown" && label !== key) return label;
    }
    return null;
}

function railGroupDisplayTitle(group: QuestRailGroup): string {
    const firstItem = group.items[0] ?? null;
    const questline = firstItem?.progression?.questline ?? null;

    return cleanRailDisplayLabel(questline?.questLineName)
        ?? cleanRailDisplayLabel(firstItem?.entry.navigation.questLineName)
        ?? railFactionLabel(
            questline?.factionFamilyKey,
            questline?.factionKey,
            firstItem?.entry.navigation.factionKey
        )
        ?? cleanRailDisplayLabel(questline?.factionName)
        ?? cleanRailDisplayLabel(firstItem?.entry.navigation.factionName)
        ?? group.title;
}

export function QuestList({
    groups,
    selectedRailEntryKey,
    onSelectEntry,
}: {
    groups: QuestRailGroup[];
    selectedRailEntryKey: string | null;
    onSelectEntry: (entryKey: string) => void;
}) {
    if (groups.length === 0) {
        return <p className="questExplorer-emptyList">No quests match these filters.</p>;
    }

    return (
        <div className="questExplorer-list">
            {groups.map((group) => (
                <div className="questExplorer-listGroup" key={group.key}>
                    <div className="questExplorer-listGroupLabel">
                        <span>{railGroupDisplayTitle(group)}</span>
                        <small>{group.items.length} {group.items.length === 1 ? "record" : "records"}</small>
                    </div>
                    {group.items.map((item, index) => {
                        const stepCount = railStepCountParts(item.metaLabel);
                        return (
                            <button
                                type="button"
                                className={`questExplorer-listItem${item.entry.entryKey === selectedRailEntryKey ? " is-selected" : ""}`}
                                aria-current={item.entry.entryKey === selectedRailEntryKey ? "page" : undefined}
                                aria-label={`${item.title} ${item.chapterLabel} ${item.metaLabel}`}
                                onClick={() => onSelectEntry(item.entry.entryKey)}
                                key={item.key}
                            >
                                <span className="questExplorer-listItemBadge" aria-hidden="true">{railIndexLabel(item, index)}</span>
                                <span className="questExplorer-listItemCopy">
                                    <span className="questExplorer-listItemTitle">{item.title}</span>
                                    <span className="questExplorer-listItemSubtitle">{item.chapterLabel}</span>
                                </span>
                                <span className="questExplorer-listItemSteps" aria-hidden="true">
                                    <strong>{stepCount.count}</strong>
                                    {stepCount.label ? <small>{stepCount.label}</small> : null}
                                </span>
                                <span className="questExplorer-listItemStepText">{item.metaLabel}</span>
                            </button>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}

