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
    "heroes",
    "improvements",
    "minorfactions",
    "populations",
    "quests",
    "statuses",
    "tech",
    "traits",
    "units",
    "victoryconditions",
    "victorypaths",
    "naturalwonders",
];

export type CodexTopLevelVisibility = "public" | "localOnly" | "hidden";

const HIDDEN_TOP_LEVEL_CODEX_KINDS = new Set(["bonuses", "extractors", "modifiers", "quests"]);
const LOCAL_ONLY_TOP_LEVEL_CODEX_KINDS = new Set(["victoryconditions", "victorypaths"]);
const DIRECT_ROUTABLE_HIDDEN_CODEX_KINDS = new Set(["extractors", "quests"]);
const FULL_WIDTH_REFERENCE_OVERVIEW_KINDS = new Set([
    "counciloreffects",
    "naturalwonders",
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

export function getCodexTopLevelVisibility(kind: string): CodexTopLevelVisibility {
    const normalizedKind = normalizeCodexKind(kind);

    if (HIDDEN_TOP_LEVEL_CODEX_KINDS.has(normalizedKind)) {
        return "hidden";
    }

    if (LOCAL_ONLY_TOP_LEVEL_CODEX_KINDS.has(normalizedKind)) {
        return "localOnly";
    }

    return "public";
}

export function isLocalCodexTopLevelVisibilityEnabled(): boolean {
    return import.meta.env.DEV;
}

export function isVisibleTopLevelCodexKind(
    kind: string,
    options: { includeLocalOnly?: boolean } = {}
): boolean {
    const visibility = getCodexTopLevelVisibility(kind);

    return visibility === "public" || (visibility === "localOnly" && options.includeLocalOnly === true);
}

export function isDirectRoutableHiddenCodexKind(kind: string): boolean {
    const normalizedKind = normalizeCodexKind(kind);

    return DIRECT_ROUTABLE_HIDDEN_CODEX_KINDS.has(normalizedKind) ||
        LOCAL_ONLY_TOP_LEVEL_CODEX_KINDS.has(normalizedKind);
}
