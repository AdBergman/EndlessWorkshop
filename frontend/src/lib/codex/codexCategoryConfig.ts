export type CodexCategoryMode = "generic" | "abilityArchive" | "statusArchive" | "referenceSheet";

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
];

const HIDDEN_TOP_LEVEL_CODEX_KINDS = new Set(["bonuses", "extractors", "modifiers"]);
const DIRECT_ROUTABLE_HIDDEN_CODEX_KINDS = new Set(["extractors"]);
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

    if (normalizedKind === "abilities") {
        return "abilityArchive";
    }

    if (normalizedKind === "statuses") {
        return "statusArchive";
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
