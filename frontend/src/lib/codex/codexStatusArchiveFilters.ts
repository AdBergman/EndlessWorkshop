import { entryHasCodexFactValue, getCodexFactValues } from "@/lib/codex/codexFactValues";
import type { CodexEntry } from "@/types/dataTypes";

export type StatusScopeFilterOption = {
    value: string;
    label: string;
    count: number;
};

export const STATUS_SCOPE_FACT_LABEL = "Scope";

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

    return Array.from(counts.entries())
        .map(([value, count]) => ({
            value,
            label: getStatusScopeDisplayLabel(value),
            count,
        }))
        .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label));
}

export function filterStatusEntriesByScope(
    entries: readonly CodexEntry[],
    activeScope: string | null
): CodexEntry[] {
    const exactScope = activeScope?.trim();
    if (!exactScope) return [...entries];

    return entries.filter((entry) =>
        entryHasCodexFactValue(entry, STATUS_SCOPE_FACT_LABEL, exactScope)
    );
}
