import semanticManifestJson from "../../../public/svg/semantic-manifest.json";

export const ICON_MANIFEST_SECTIONS = [
    "resources",
    "stats",
    "statuses",
    "armyActions",
    "diplomacyStates",
    "diplomacyActions",
    "diplomacyTreaties",
] as const;

export type IconManifestSection = (typeof ICON_MANIFEST_SECTIONS)[number];

export type IconManifestEntry = {
    section: IconManifestSection;
    key: string;
    path: string;
    color?: string;
    symbol?: string;
    gameplayProperties: string[];
};

type SemanticManifestEntryJson = {
    key?: unknown;
    path?: unknown;
    color?: unknown;
    symbol?: unknown;
    gameplayProperties?: unknown;
};

type SemanticManifestJson = {
    [section in IconManifestSection]?: Record<string, SemanticManifestEntryJson>;
};

const semanticManifest = semanticManifestJson as SemanticManifestJson;

const sectionIndexes = buildSectionIndexes();
const gameplayPropertyIndex = buildGameplayPropertyIndex();
const descriptionTokenIndex = buildDescriptionTokenIndex();

function isIconManifestSection(section: string): section is IconManifestSection {
    return (ICON_MANIFEST_SECTIONS as readonly string[]).includes(section);
}

function sanitizeEntry(
    section: IconManifestSection,
    fallbackKey: string,
    entry: SemanticManifestEntryJson
): IconManifestEntry | null {
    const key = typeof entry.key === "string" && entry.key.trim() ? entry.key : fallbackKey;
    const path = typeof entry.path === "string" && entry.path.trim() ? entry.path : null;

    if (!path) {
        return null;
    }

    const gameplayProperties = Array.isArray(entry.gameplayProperties)
        ? entry.gameplayProperties.filter((property): property is string => typeof property === "string")
        : [];

    return {
        section,
        key,
        path,
        ...(typeof entry.color === "string" && entry.color.trim() ? { color: entry.color } : {}),
        ...(typeof entry.symbol === "string" && entry.symbol.trim() ? { symbol: entry.symbol } : {}),
        gameplayProperties,
    };
}

function buildSectionIndexes(): Record<IconManifestSection, Map<string, IconManifestEntry>> {
    const indexes = Object.fromEntries(
        ICON_MANIFEST_SECTIONS.map((section) => [section, new Map<string, IconManifestEntry>()])
    ) as Record<IconManifestSection, Map<string, IconManifestEntry>>;

    for (const section of ICON_MANIFEST_SECTIONS) {
        const sectionEntries = semanticManifest[section] ?? {};

        for (const [fallbackKey, entryJson] of Object.entries(sectionEntries)) {
            const entry = sanitizeEntry(section, fallbackKey, entryJson);
            if (entry) {
                indexes[section].set(entry.key, entry);
            }
        }
    }

    return indexes;
}

function buildGameplayPropertyIndex(): Map<string, IconManifestEntry> {
    const index = new Map<string, IconManifestEntry>();

    for (const section of ICON_MANIFEST_SECTIONS) {
        for (const entry of sectionIndexes[section].values()) {
            for (const property of entry.gameplayProperties) {
                const lookupKey = normalizeLookupKey(property);
                if (lookupKey && !index.has(lookupKey)) {
                    index.set(lookupKey, entry);
                }
            }
        }
    }

    return index;
}

function buildDescriptionTokenIndex(): Map<string, IconManifestEntry> {
    const index = new Map<string, IconManifestEntry>();

    for (const section of ICON_MANIFEST_SECTIONS) {
        for (const entry of sectionIndexes[section].values()) {
            const lookupKey = normalizeDescriptionToken(entry.symbol);
            if (lookupKey && !index.has(lookupKey)) {
                index.set(lookupKey, entry);
            }
        }
    }

    return index;
}

function normalizeLookupKey(value: string | null | undefined): string | null {
    const normalized = value?.trim().toLowerCase();
    return normalized ? normalized : null;
}

function normalizeDescriptionToken(token: string | null | undefined): string | null {
    const trimmed = token?.trim();
    if (!trimmed) {
        return null;
    }

    const unwrapped = trimmed.startsWith("[") && trimmed.endsWith("]")
        ? trimmed.slice(1, -1).trim()
        : trimmed;

    return normalizeLookupKey(unwrapped);
}

export function getSemanticIcon(section: string, key: string): IconManifestEntry | null {
    if (!isIconManifestSection(section)) {
        return null;
    }

    return sectionIndexes[section].get(key) ?? null;
}

export function getIconPath(section: string, key: string): string | null {
    return getSemanticIcon(section, key)?.path ?? null;
}

export function getStatIconByGameplayProperty(propertyName: string): IconManifestEntry | null {
    const lookupKey = normalizeLookupKey(propertyName);
    return lookupKey ? gameplayPropertyIndex.get(lookupKey) ?? null : null;
}

export function getIconByDescriptionToken(token: string): IconManifestEntry | null {
    const lookupKey = normalizeDescriptionToken(token);
    return lookupKey ? descriptionTokenIndex.get(lookupKey) ?? null : null;
}
