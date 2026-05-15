import { parseDescriptionLine, stripDescriptionAst } from "@/lib/descriptionLine/descriptionLineRenderer";
import type { CodexEntry } from "@/types/dataTypes";

const TECHNICAL_PREFIXES = new Set([
    "ability",
    "aspect",
    "councilor",
    "councilors",
    "district",
    "equipment",
    "faction",
    "hero",
    "improvement",
    "population",
    "tech",
    "unit",
    "unitability",
]);

const TECHNICAL_SUFFIXES = new Set(["data", "definition", "entry", "node"]);

export const CODEX_SUMMARY_ENTRY_PREFIX = "__summary__:";

const CODEX_KIND_LABELS: Record<string, string> = {
    abilities: "Abilities",
    ability: "Abilities",
    councilors: "Councilors",
    councilor: "Councilors",
    districts: "Districts",
    district: "Districts",
    equipment: "Equipment",
    factions: "Factions",
    faction: "Factions",
    heroes: "Heroes",
    hero: "Heroes",
    improvements: "Improvements",
    improvement: "Improvements",
    minorfactions: "Minor Factions",
    minorfaction: "Minor Factions",
    populations: "Populations",
    population: "Populations",
    quests: "Quests",
    quest: "Quests",
    tech: "Tech",
    techs: "Tech",
    traits: "Traits",
    trait: "Traits",
    units: "Units",
    unit: "Units",
};

export type CodexSummaryEntry = CodexEntry & {
    isSummary: true;
    summaryKind: string;
    summaryLabel: string;
    summaryCount: number;
};

export type CodexListItem = CodexEntry | CodexSummaryEntry;

function compactWhitespace(value: string): string {
    return value.replace(/\s+/g, " ").trim();
}

export function formatCodexKindLabel(kind: string): string {
    const normalizedKind = compactWhitespace(kind ?? "").toLowerCase();
    if (!normalizedKind) return "Unknown";

    const knownLabel = CODEX_KIND_LABELS[normalizedKind];
    if (knownLabel) return knownLabel;

    return normalizedKind
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .split(/[^a-z0-9]+/i)
        .filter(Boolean)
        .map(formatToken)
        .join(" ");
}

function isRomanNumeral(token: string): boolean {
    return /^(?=[ivxlcdm]+$)(?:i|ii|iii|iv|v|vi|vii|viii|ix|x|xi|xii|xiii|xiv|xv)$/i.test(token);
}

function formatToken(token: string): string {
    if (!token) return "";
    if (/^\d+$/.test(token)) return token;
    if (isRomanNumeral(token)) return token.toUpperCase();
    if (token === token.toUpperCase() && token.length <= 4) return token;
    return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
}

function tokenizeEntryKey(entryKey: string): string[] {
    return entryKey
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .split(/[^A-Za-z0-9]+/g)
        .map((token) => token.trim())
        .filter(Boolean);
}

function looksTechnicalDisplayName(displayName: string, entryKey: string): boolean {
    const normalizedName = compactWhitespace(displayName);
    if (!normalizedName) return true;

    const normalizedEntryKey = compactWhitespace(entryKey);
    if (!normalizedEntryKey) return false;

    if (normalizedName === normalizedEntryKey) return true;

    return /^[A-Za-z0-9]+(?:[_-][A-Za-z0-9]+)+$/.test(normalizedName);
}

export function humanizeCodexEntryKey(entryKey: string): string {
    const tokens = tokenizeEntryKey(entryKey);
    if (tokens.length === 0) return "Unknown Entry";

    while (tokens.length > 1 && TECHNICAL_PREFIXES.has(tokens[0].toLowerCase())) {
        tokens.shift();
    }

    while (tokens.length > 1 && TECHNICAL_SUFFIXES.has(tokens[tokens.length - 1].toLowerCase())) {
        tokens.pop();
    }

    return tokens.map(formatToken).join(" ");
}

export function getCodexEntryLabel(entry: Pick<CodexEntry, "displayName" | "entryKey">): string {
    return getCodexLabel(entry.displayName, entry.entryKey);
}

export function getCodexLabel(displayName: string, entryKey: string): string {
    const normalizedName = compactWhitespace(displayName ?? "");
    if (!looksTechnicalDisplayName(normalizedName, entryKey ?? "")) {
        return normalizedName;
    }

    return humanizeCodexEntryKey(entryKey ?? "");
}

export function stripCodexDescriptionLine(line: string): string {
    return stripDescriptionAst(parseDescriptionLine(line));
}

export function getCodexDescriptionPreviewLine(lines: readonly string[] | null | undefined): string {
    return (lines ?? []).map((line) => stripCodexDescriptionLine(line)).find((line) => line.length > 0) ?? "";
}

export function getCodexDescriptionPreviewText(lines: readonly string[] | null | undefined): string {
    return compactWhitespace(
        (lines ?? [])
            .map((line) => stripCodexDescriptionLine(line))
            .filter((line) => line.length > 0)
            .join(" ")
    );
}

export function getCodexEntryPreview(entry: Pick<CodexEntry, "descriptionLines">, maxLength = 180): string {
    const preview = getCodexDescriptionPreviewText(entry.descriptionLines);

    if (!preview) return "";
    if (preview.length <= maxLength) return preview;
    return `${preview.slice(0, maxLength).trimEnd()}…`;
}

export function isCodexSummaryEntry(item: CodexListItem | CodexEntry | null | undefined): item is CodexSummaryEntry {
    return Boolean(item && item.entryKey.startsWith(CODEX_SUMMARY_ENTRY_PREFIX));
}

export function getCodexSummaryEntryKey(kind: string): string {
    return `${CODEX_SUMMARY_ENTRY_PREFIX}${kind}`;
}

export function createCodexSummaryEntry(
    kind: string,
    label: string,
    count: number,
    query: string
): CodexSummaryEntry {
    const hasQuery = query.trim().length > 0;
    const summaryLine = hasQuery
        ? `${count} matching ${label.toLowerCase()} entries in the current search.`
        : `Browse every ${label.toLowerCase()} entry in a compact catalog view.`;

    return {
        exportKind: kind,
        entryKey: getCodexSummaryEntryKey(kind),
        displayName: `All ${label}`,
        descriptionLines: [summaryLine],
        referenceKeys: [],
        isSummary: true,
        summaryKind: kind,
        summaryLabel: label,
        summaryCount: count,
    };
}
