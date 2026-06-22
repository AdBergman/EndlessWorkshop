import type { CodexEntry, RichFaction } from "@/types/dataTypes";

export type CodexFactionPackageGroup = {
    id: string;
    label: string;
    entries: CodexEntry[];
    visibleEntries: CodexEntry[];
    totalCount: number;
    cap: number;
};

const GROUP_CAPS = {
    traits: 4,
    population: 2,
    units: 4,
    tech: 4,
    heroes: 3,
    quests: 3,
    councilors: 3,
    statuses: 3,
} as const;

function normalizeKind(value: string | null | undefined): string {
    return (value ?? "").trim().toLowerCase();
}

function visibleCategory(entry: CodexEntry): string {
    const exportKind = normalizeKind(entry.exportKind);
    if (exportKind !== "bonuses") return exportKind;

    const descriptor = `${entry.category ?? ""} ${entry.kind ?? ""} ${entry.entryKey ?? ""}`.toLowerCase();
    if (descriptor.includes("status")) return "statuses";
    if (descriptor.includes("modifier")) return "modifiers";
    return "bonuses";
}

function relationshipKeys(entry: CodexEntry): string[] {
    return [
        ...(entry.referenceKeys ?? []),
        ...(entry.publicContextKeys ?? []),
    ].map((key) => key.trim()).filter(Boolean);
}

function mergeEntries(...groups: CodexEntry[][]): CodexEntry[] {
    const seen = new Set<string>();
    const out: CodexEntry[] = [];

    for (const group of groups) {
        for (const entry of group) {
            const key = entry.entryKey.trim();
            if (!key || seen.has(key)) continue;

            seen.add(key);
            out.push(entry);
        }
    }

    return out;
}

function byCategory(entries: CodexEntry[], category: string): CodexEntry[] {
    return entries.filter((entry) => visibleCategory(entry) === category);
}

function createGroup(
    id: keyof typeof GROUP_CAPS,
    label: string,
    entries: CodexEntry[],
    visibleSource: CodexEntry[] = entries
): CodexFactionPackageGroup | null {
    if (entries.length === 0) return null;

    const cap = GROUP_CAPS[id];
    return {
        id,
        label,
        entries,
        visibleEntries: visibleSource.slice(0, cap),
        totalCount: entries.length,
        cap,
    };
}

function resolveExactEntries(
    keys: readonly string[] | null | undefined,
    entryByKey: Map<string, CodexEntry>,
    expectedKind: string
): CodexEntry[] {
    const seen = new Set<string>();
    const entries: CodexEntry[] = [];

    for (const rawKey of keys ?? []) {
        const key = rawKey.trim();
        if (!key || seen.has(key)) continue;

        const entry = entryByKey.get(key);
        if (!entry || normalizeKind(entry.exportKind) !== expectedKind) continue;

        seen.add(key);
        entries.push(entry);
    }

    return entries;
}

function resolveExactEntry(
    key: string | null | undefined,
    entryByKey: Map<string, CodexEntry>,
    expectedKind: string
): CodexEntry[] {
    return resolveExactEntries(key ? [key] : [], entryByKey, expectedKind);
}

function questExampleEntries(entries: CodexEntry[]): CodexEntry[] {
    const seen = new Set<string>();
    const examples: CodexEntry[] = [];

    for (const entry of entries) {
        const key = (entry.displayName || entry.entryKey).trim().toLowerCase();
        if (!key || seen.has(key)) continue;

        seen.add(key);
        examples.push(entry);
    }

    return examples;
}

export function buildCodexFactionPackageGroups(
    faction: CodexEntry,
    allEntries: readonly CodexEntry[]
): CodexFactionPackageGroup[] {
    if (normalizeKind(faction.exportKind) !== "factions") return [];

    const factionKey = faction.entryKey.trim();
    if (!factionKey) return [];

    const entryByKey = new Map(allEntries.map((entry) => [entry.entryKey, entry]));
    const outboundEntries = mergeEntries(
        relationshipKeys(faction)
            .filter((key) => key !== factionKey)
            .map((key) => entryByKey.get(key))
            .filter((entry): entry is CodexEntry => Boolean(entry))
    );
    const reverseEntries = allEntries.filter((entry) =>
        entry.entryKey !== factionKey && relationshipKeys(entry).includes(factionKey)
    );

    const outboundUnits = byCategory(outboundEntries, "units");
    const reverseUnits = byCategory(reverseEntries, "units");
    const reverseQuests = byCategory(reverseEntries, "quests");
    const unitEntries = outboundUnits.length > 0 ? outboundUnits : reverseUnits;
    const unitLabel = outboundUnits.length > 0 ? "Core Units" : "Associated Units";

    return [
        createGroup("population", "Population", mergeEntries(
            byCategory(outboundEntries, "populations"),
            byCategory(reverseEntries, "populations")
        )),
        createGroup("units", unitLabel, unitEntries),
        createGroup("tech", "Faction Techs", mergeEntries(
            byCategory(outboundEntries, "tech"),
            byCategory(reverseEntries, "tech")
        )),
        createGroup("heroes", "Heroes", mergeEntries(
            byCategory(outboundEntries, "heroes"),
            byCategory(reverseEntries, "heroes")
        )),
        createGroup("quests", "Questline", reverseQuests, questExampleEntries(reverseQuests)),
        createGroup("councilors", "Councilors", mergeEntries(
            byCategory(outboundEntries, "councilors"),
            byCategory(reverseEntries, "councilors")
        )),
        createGroup("statuses", "Statuses", mergeEntries(
            byCategory(outboundEntries, "statuses"),
            byCategory(reverseEntries, "statuses")
        )),
    ].filter((group): group is CodexFactionPackageGroup => Boolean(group));
}

export function buildCodexRichFactionPackageGroups(
    faction: CodexEntry,
    richFaction: RichFaction | null | undefined,
    allEntries: readonly CodexEntry[]
): CodexFactionPackageGroup[] {
    if (!richFaction || faction.entryKey.trim() !== richFaction.factionKey.trim()) return [];

    const entryByKey = new Map(allEntries.map((entry) => [entry.entryKey.trim(), entry]));
    const factionKind = normalizeKind(richFaction.factionKind);

    if (factionKind === "minor") {
        return [
            createGroup("population", "Population", resolveExactEntries(richFaction.populationKeys, entryByKey, "populations")),
            createGroup("units", "Core Unit", resolveExactEntries(richFaction.baseUnitKeys, entryByKey, "units")),
            createGroup("heroes", "Heroes", resolveExactEntries(richFaction.heroKeys, entryByKey, "heroes")),
            createGroup(
                "traits",
                "Protectorate Traits",
                resolveExactEntries(richFaction.protectorateTraitKeys, entryByKey, "traits")
            ),
            createGroup("quests", "Quest", resolveExactEntries(richFaction.specificQuestKeys, entryByKey, "quests")),
        ].filter((group): group is CodexFactionPackageGroup => Boolean(group));
    }

    return [
        createGroup("traits", "Faction Traits", resolveExactEntries(richFaction.traitKeys, entryByKey, "traits")),
        createGroup("population", "Population", resolveExactEntries(richFaction.populationKeys, entryByKey, "populations")),
        createGroup("units", "Core Units", resolveExactEntries(richFaction.baseUnitKeys, entryByKey, "units")),
        createGroup("heroes", "Heroes", resolveExactEntries(richFaction.heroKeys, entryByKey, "heroes")),
        createGroup("tech", "Faction Techs", resolveExactEntries(richFaction.gatedTechnologyKeys, entryByKey, "tech")),
        createGroup("quests", "Questline", resolveExactEntry(richFaction.startingFactionQuestKey, entryByKey, "quests")),
    ].filter((group): group is CodexFactionPackageGroup => Boolean(group));
}

export function getCodexFactionPackageEntryKeys(groups: readonly CodexFactionPackageGroup[]): string[] {
    const seen = new Set<string>();
    const keys: string[] = [];

    for (const group of groups) {
        for (const entry of group.visibleEntries) {
            const key = entry.entryKey.trim();
            if (!key || seen.has(key)) continue;

            seen.add(key);
            keys.push(key);
        }
    }

    return keys;
}
