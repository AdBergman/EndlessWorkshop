import { entryHasCodexFactValue, getCodexFactValues } from "@/lib/codex/codexFactValues";
import type { CodexEntry } from "@/types/dataTypes";

export type TraitArchiveType = "Faction" | "Protectorate";

export type TraitTypeFilterOption = {
    value: TraitArchiveType;
    label: TraitArchiveType;
    count: number;
};

export const TRAIT_TYPE_FACT_LABEL = "Trait type";

const TRAIT_TYPE_ORDER: TraitArchiveType[] = ["Faction", "Protectorate"];

function normalizeTraitArchiveType(value: string): TraitArchiveType | null {
    const trimmedValue = value.trim();
    return TRAIT_TYPE_ORDER.find((candidate) => candidate.toLowerCase() === trimmedValue.toLowerCase()) ?? null;
}

export function buildTraitTypeFilterOptions(entries: readonly CodexEntry[]): TraitTypeFilterOption[] {
    const counts = entries.reduce<Map<TraitArchiveType, number>>((acc, entry) => {
        const seenTypes = new Set<TraitArchiveType>();

        for (const value of getCodexFactValues(entry, TRAIT_TYPE_FACT_LABEL)) {
            const type = normalizeTraitArchiveType(value);
            if (!type || seenTypes.has(type)) continue;

            seenTypes.add(type);
            acc.set(type, (acc.get(type) ?? 0) + 1);
        }

        return acc;
    }, new Map<TraitArchiveType, number>());

    return TRAIT_TYPE_ORDER.map((value) => ({
        value,
        label: value,
        count: counts.get(value) ?? 0,
    }));
}

export function filterTraitEntriesByType(
    entries: readonly CodexEntry[],
    activeType: TraitArchiveType | null
): CodexEntry[] {
    if (!activeType) return [...entries];

    return entries.filter((entry) =>
        entryHasCodexFactValue(entry, TRAIT_TYPE_FACT_LABEL, activeType)
    );
}
