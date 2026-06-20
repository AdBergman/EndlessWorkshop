import { entryHasCodexFactValue, getCodexFactValues } from "@/lib/codex/codexFactValues";
import type { CodexEntry } from "@/types/dataTypes";

export type StatusScopeFilterOption = {
    value: string;
    label: string;
    count: number;
    scopeValues: string[];
    isGrouped?: boolean;
};

export const STATUS_SCOPE_FACT_LABEL = "Scope";
export const STATUS_SCOPE_OTHER_VALUE = "__status_scope_other__";
const STATUS_SCOPE_GROUP_THRESHOLD = 4;

const STATUS_SCOPE_LABELS = new Map<string, string>([
    ["Major Empire", "Empire"],
    ["Diplomatic Ambassy", "Diplomacy"],
]);

export function getStatusScopeDisplayLabel(value: string): string {
    const trimmedValue = value.trim();
    return STATUS_SCOPE_LABELS.get(trimmedValue) ?? trimmedValue;
}

export function buildStatusScopeFilterOptions(entries: readonly CodexEntry[]): StatusScopeFilterOption[] {
    const counts = entries.reduce<Map<string, number>>((acc, entry) => {
        const seen = new Set<string>();

        for (const value of getCodexFactValues(entry, STATUS_SCOPE_FACT_LABEL)) {
            if (seen.has(value)) continue;

            seen.add(value);
            acc.set(value, (acc.get(value) ?? 0) + 1);
        }

        return acc;
    }, new Map<string, number>());

    const individualOptions = Array.from(counts.entries())
        .filter(([, count]) => count > STATUS_SCOPE_GROUP_THRESHOLD)
        .map(([value, count]) => ({
            value,
            label: getStatusScopeDisplayLabel(value),
            count,
            scopeValues: [value],
        }))
        .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label));

    const groupedValues = Array.from(counts.entries())
        .filter(([, count]) => count <= STATUS_SCOPE_GROUP_THRESHOLD)
        .sort(([leftValue], [rightValue]) =>
            getStatusScopeDisplayLabel(leftValue).localeCompare(getStatusScopeDisplayLabel(rightValue))
        );

    if (groupedValues.length === 0) return individualOptions;

    const otherCount = groupedValues.reduce((total, [, count]) => total + count, 0);

    return [
        ...individualOptions,
        {
            value: STATUS_SCOPE_OTHER_VALUE,
            label: "Other",
            count: otherCount,
            scopeValues: groupedValues.map(([value]) => value),
            isGrouped: true,
        },
    ];
}

export function filterStatusEntriesByScope(
    entries: readonly CodexEntry[],
    activeScope: string | null
): CodexEntry[] {
    const exactScope = activeScope?.trim();
    if (!exactScope) return [...entries];

    if (exactScope === STATUS_SCOPE_OTHER_VALUE) {
        const groupedScopeValues = new Set(
            buildStatusScopeFilterOptions(entries)
                .find((option) => option.value === STATUS_SCOPE_OTHER_VALUE)
                ?.scopeValues ?? []
        );

        if (groupedScopeValues.size === 0) return [];

        return entries.filter((entry) =>
            getCodexFactValues(entry, STATUS_SCOPE_FACT_LABEL)
                .some((value) => groupedScopeValues.has(value))
        );
    }

    return entries.filter((entry) =>
        entryHasCodexFactValue(entry, STATUS_SCOPE_FACT_LABEL, exactScope)
    );
}
