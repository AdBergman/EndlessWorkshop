export type CodexCategoryMode =
    | "generic"
    | "actionArchive"
    | "abilityArchive"
    | "diplomacyArchive"
    | "districtArchive"
    | "equipmentArchive"
    | "heroArchive"
    | "improvementArchive"
    | "populationArchive"
    | "questArchive"
    | "statusArchive"
    | "techArchive"
    | "traitArchive"
    | "unitArchive"
    | "referenceSheet";

export const PREFERRED_CODEX_KIND_ORDER = [
    "abilities",
    "actions",
    "councilors",
    "counciloreffects",
    "partnereffects",
    "districts",
    "extractors",
    "resources",
    "equipment",
    "factions",
    "diplomatictreaties",
    "victorypaths",
    "victoryconditions",
    "heroes",
    "improvements",
    "minorfactions",
    "naturalwonders",
    "populations",
    "quests",
    "statuses",
    "tech",
    "traits",
    "units",
];

const HIDDEN_TOP_LEVEL_CODEX_KINDS = new Set(["bonuses", "extractors", "modifiers", "quests"]);
const DIRECT_ROUTABLE_HIDDEN_CODEX_KINDS = new Set(["extractors", "quests"]);
const FULL_WIDTH_REFERENCE_OVERVIEW_KINDS = new Set([
    "counciloreffects",
    "partnereffects",
    "resources",
]);

export function normalizeCodexKind(kind: string): string {
    return kind.trim().toLowerCase();
}

export function getCodexCategoryMode(kind: string): CodexCategoryMode {
    const normalizedKind = normalizeCodexKind(kind);

    if (normalizedKind === "actions") {
        return "actionArchive";
    }

    if (normalizedKind === "abilities") {
        return "abilityArchive";
    }

    if (normalizedKind === "diplomatictreaties") {
        return "diplomacyArchive";
    }

    if (normalizedKind === "districts") {
        return "districtArchive";
    }

    if (normalizedKind === "equipment") {
        return "equipmentArchive";
    }

    if (normalizedKind === "heroes") {
        return "heroArchive";
    }

    if (normalizedKind === "improvements") {
        return "improvementArchive";
    }

    if (normalizedKind === "populations") {
        return "populationArchive";
    }

    if (normalizedKind === "quests") {
        return "questArchive";
    }

    if (normalizedKind === "statuses") {
        return "statusArchive";
    }

    if (normalizedKind === "tech") {
        return "techArchive";
    }

    if (normalizedKind === "traits") {
        return "traitArchive";
    }

    if (normalizedKind === "units") {
        return "unitArchive";
    }

    if (supportsFullWidthReferenceOverview(normalizedKind)) {
        return "referenceSheet";
    }

    return "generic";
}

export function supportsFullWidthReferenceOverview(kind: string): boolean {
    return FULL_WIDTH_REFERENCE_OVERVIEW_KINDS.has(normalizeCodexKind(kind));
}

export function isVisibleTopLevelCodexKind(kind: string): boolean {
    return !HIDDEN_TOP_LEVEL_CODEX_KINDS.has(normalizeCodexKind(kind));
}

export function isDirectRoutableHiddenCodexKind(kind: string): boolean {
    return DIRECT_ROUTABLE_HIDDEN_CODEX_KINDS.has(normalizeCodexKind(kind));
}
