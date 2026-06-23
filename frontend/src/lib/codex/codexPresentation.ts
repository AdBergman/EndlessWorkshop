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
    "technology",
    "unit",
    "unitability",
]);

const TECHNICAL_SUFFIXES = new Set(["data", "definition", "entry", "node"]);

export const CODEX_SUMMARY_ENTRY_PREFIX = "__summary__:";

const CODEX_KIND_LABELS: Record<string, string> = {
    actions: "Actions",
    action: "Actions",
    abilities: "Abilities",
    ability: "Abilities",
    bonuses: "Bonuses",
    bonus: "Bonuses",
    counciloreffect: "Councilor Effects",
    counciloreffects: "Councilor Effects",
    councilors: "Councilors",
    councilor: "Councilors",
    districts: "Districts",
    district: "Districts",
    diplomatictreaties: "Diplomacy",
    diplomatictreaty: "Diplomacy",
    extractors: "Extractors",
    extractor: "Extractors",
    equipment: "Equipment",
    factions: "Factions",
    faction: "Factions",
    heroes: "Heroes",
    hero: "Heroes",
    improvements: "Improvements",
    improvement: "Improvements",
    minorfactions: "Minor Factions",
    minorfaction: "Minor Factions",
    modifiers: "Modifiers",
    modifier: "Modifiers",
    partnereffect: "Partner Effects",
    partnereffects: "Partner Effects",
    populations: "Populations",
    population: "Populations",
    quests: "Quests",
    quest: "Quests",
    naturalwonders: "Wonders",
    naturalwonder: "Wonders",
    resources: "Resources",
    resource: "Resources",
    statuses: "Statuses",
    status: "Statuses",
    tech: "Tech",
    techs: "Tech",
    traits: "Traits",
    trait: "Traits",
    units: "Units",
    unit: "Units",
    victoryconditions: "Victory Conditions",
    victorycondition: "Victory Conditions",
    victorypaths: "Victory Paths",
    victorypath: "Victory Paths",
};

const CODEX_MAJOR_FACTION_LABELS: Record<string, string> = {
    aspect: "Aspects",
    aspects: "Aspects",
    kin: "Kin of Sheredyn",
    kinofsheredyn: "Kin of Sheredyn",
    lastlord: "Last Lords",
    lastlords: "Last Lords",
    lord: "Last Lords",
    lords: "Last Lords",
    mukag: "Tahuk",
    necrophage: "Necrophages",
    necrophages: "Necrophages",
    tahuk: "Tahuk",
    tahuks: "Tahuk",
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

function majorFactionLookupKey(value: string): string {
    return compactWhitespace(value)
        .replace(/^Faction_/i, "")
        .replace(/\d+$/g, "")
        .replace(/[^A-Za-z]/g, "")
        .toLowerCase();
}

export function formatCodexMajorFactionLabel(value: string | null | undefined): string | null {
    const key = majorFactionLookupKey(value ?? "");
    return key ? CODEX_MAJOR_FACTION_LABELS[key] ?? null : null;
}

export function formatCodexMajorFactionText(value: string): string {
    if (!value) return value;

    return value
        .replace(/\bFaction_(Aspect|Aspects|KinOfSheredyn|Kin|LastLord|LastLords|Mukag|Tahuk|Tahuks|Necrophage|Necrophages)\d*\b/g, (match) =>
            formatCodexMajorFactionLabel(match) ?? match
        )
        .replace(/\bKinOfSheredyn\d*\b/g, "Kin of Sheredyn")
        .replace(/\bKin\s+Of\s+Sheredyn\d*\b/g, "Kin of Sheredyn")
        .replace(/\bLastLord(?:s)?\d*\b/g, "Last Lords")
        .replace(/\bLast\s+Lord(?:s)?\d*\b/g, "Last Lords")
        .replace(/\bMukag\d*\b/g, "Tahuk")
        .replace(/\bTahuks\d*\b/g, "Tahuk")
        .replace(/\b(Faction|Affinity):\s*Necrophage\b/g, "$1: Necrophages")
        .replace(/(^|[.!?]\s+)Necrophage\b/g, "$1Necrophages")
        .replace(/\bAffinity:\s*Aspect\b/g, "Affinity: Aspects");
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

    return /^[A-Za-z0-9]+(?:_[A-Za-z0-9]+)+$/.test(normalizedName);
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

    const label = tokens.map(formatToken).join(" ");
    return formatCodexMajorFactionLabel(label) ?? formatCodexMajorFactionText(label);
}

export function getCodexEntryLabel(entry: Pick<CodexEntry, "displayName" | "entryKey">): string {
    return getCodexLabel(entry.displayName, entry.entryKey);
}

export function getCodexLabel(displayName: string, entryKey: string): string {
    const normalizedName = compactWhitespace(displayName ?? "");
    if (!looksTechnicalDisplayName(normalizedName, entryKey ?? "")) {
        return formatCodexMajorFactionLabel(normalizedName) ?? normalizedName;
    }

    return humanizeCodexEntryKey(entryKey ?? "");
}

export function stripCodexDescriptionLine(line: string): string {
    return formatCodexMajorFactionText(stripDescriptionAst(parseDescriptionLine(line)));
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

function humanizeContextToken(value: string): string {
    const majorFactionLabel = formatCodexMajorFactionLabel(value);
    if (majorFactionLabel) return majorFactionLabel;

    return formatCodexMajorFactionText(compactWhitespace(value)
        .replace(/_/g, " ")
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .split(/\s+/)
        .filter(Boolean)
        .map(formatToken)
        .join(" "));
}

function readIdentifierToken(value: string): string {
    const match = value.match(/^[A-Za-z0-9_]+/);
    return match?.[0] ?? "";
}

function inferFactionContext(entry: Pick<CodexEntry, "entryKey" | "referenceKeys" | "descriptionLines">): string | null {
    const candidates = [
        entry.entryKey,
        ...(entry.referenceKeys ?? []),
        ...(entry.descriptionLines ?? []),
    ];

    for (const value of candidates) {
        const text = value ?? "";
        const majorMatch = text.match(/Faction_([A-Za-z0-9_]+)/);
        if (majorMatch) return formatCodexMajorFactionLabel(majorMatch[1]) ?? humanizeContextToken(readIdentifierToken(majorMatch[1]));

        const factionQuestMatch = text.match(/FactionQuest_([A-Za-z0-9]+)_/);
        if (factionQuestMatch) return formatQuestlineLabel(readIdentifierToken(factionQuestMatch[1]));

        const minorMatch = text.match(/MinorFaction_([A-Za-z0-9_]+)/);
        if (minorMatch) return humanizeContextToken(readIdentifierToken(minorMatch[1]));

        if (/LastLord|Last Lord/i.test(text)) return "Last Lords";
    }

    return null;
}

function isQuestEntry(entry: Pick<CodexEntry, "exportKind" | "kind">): boolean {
    return compactWhitespace(entry.exportKind ?? "").toLowerCase() === "quests" ||
        compactWhitespace(entry.kind ?? "").toLowerCase() === "quest";
}

function findExactFactValue(entry: Pick<CodexEntry, "facts">, label: string): string | null {
    const value = entry.facts?.find((fact) => fact.label.trim() === label)?.value;
    const normalizedValue = compactWhitespace(value ?? "");
    return normalizedValue || null;
}

function formatQuestCategoryContext(value: string): string {
    switch (compactWhitespace(value).toLowerCase()) {
        case "majorfaction":
            return "Major Faction";
        case "minorfaction":
            return "Minor Faction";
        default:
            return humanizeContextToken(value);
    }
}

function getQuestFactContextLines(entry: Pick<CodexEntry, "facts" | "category">): string[] {
    const category = findExactFactValue(entry, "Category") ?? compactWhitespace(entry.category ?? "");
    const chapter = findExactFactValue(entry, "Chapter");
    const mandatory = findExactFactValue(entry, "Mandatory");

    return [
        category ? formatQuestCategoryContext(category) : null,
        chapter ? `Chapter ${chapter}` : null,
        mandatory?.toLowerCase() === "yes" ? "Mandatory" : null,
    ].filter((line): line is string => Boolean(line));
}

function formatQuestlineLabel(questlineKey: string): string {
    const numberedMatch = questlineKey.match(/^(.+?)([0-9]+)$/);
    if (!numberedMatch) return humanizeContextToken(questlineKey);

    return `${humanizeContextToken(numberedMatch[1])} alternate questline ${Number(numberedMatch[2])}`;
}

export function getCodexRelatedContext(entry: CodexEntry): string {
    if (isQuestEntry(entry)) {
        const questContext = getQuestFactContextLines(entry);
        return ["Quest", ...questContext].join(" · ");
    }

    return getCodexSecondaryContext(entry);
}

export function getCodexDetailContextLines(entry: CodexEntry): string[] {
    if (isQuestEntry(entry)) return getQuestFactContextLines(entry);

    const effectContextLines = getEffectDetailContextLines(entry);
    if (effectContextLines) return effectContextLines;

    const secondaryContext = getCodexSecondaryContext(entry);
    return secondaryContext ? [secondaryContext] : [];
}

function getEffectDetailContextLines(entry: CodexEntry): string[] | null {
    const exportKind = compactWhitespace(entry.exportKind ?? "").toLowerCase();
    if (exportKind !== "counciloreffects" && exportKind !== "partnereffects") return null;

    const factContext = findCodexFactValue(entry, ["Role", "Scope"]);
    if (factContext) return [humanizeContextToken(factContext)];

    const category = compactWhitespace(entry.category ?? "");
    if (category && !looksTechnicalEffectContext(category)) {
        return [humanizeContextToken(category)];
    }

    return [];
}

function findCodexFactValue(entry: Pick<CodexEntry, "facts">, labels: readonly string[]): string | null {
    const normalizedLabels = new Set(labels.map((label) => compactWhitespace(label).toLowerCase()));
    const value = entry.facts?.find((fact) => normalizedLabels.has(compactWhitespace(fact.label).toLowerCase()))?.value;
    const normalizedValue = compactWhitespace(value ?? "");
    return normalizedValue || null;
}

function looksTechnicalEffectContext(value: string): boolean {
    const normalized = compactWhitespace(value).replace(/[_\s-]+/g, "").toLowerCase();
    return normalized.startsWith("counciloreffect") ||
        normalized.startsWith("partnereffect") ||
        /^effect[a-z]+\d+/.test(normalized) ||
        /event\d+/.test(normalized);
}

export function getCodexSecondaryContext(entry: Pick<CodexEntry, "entryKey" | "exportKind" | "category" | "kind" | "referenceKeys" | "descriptionLines" | "facts">): string {
    if (isQuestEntry(entry)) {
        return getQuestFactContextLines(entry).join(" / ");
    }

    const parts: string[] = [];
    const add = (value: string | null | undefined) => {
        const normalized = compactWhitespace(value ?? "");
        if (!normalized || normalized.toLowerCase() === "none") return;
        const displayValue = humanizeContextToken(normalized);
        if (parts.some((part) => part.toLowerCase() === displayValue.toLowerCase())) return;
        parts.push(displayValue);
    };

    add(inferFactionContext(entry));
    add(entry.category);
    add(entry.kind);

    if (parts.length === 1 && parts[0].toLowerCase() === singularKindLabel(entry.exportKind).toLowerCase()) {
        return humanizeCodexEntryKey(entry.entryKey);
    }

    return parts.join(" / ");
}

function singularKindLabel(kind: string): string {
    const normalizedKind = compactWhitespace(kind ?? "").toLowerCase();
    switch (normalizedKind) {
        case "actions":
            return "Action";
        case "abilities":
            return "Ability";
        case "councilors":
            return "Councilor";
        case "districts":
            return "District";
        case "diplomatictreaties":
            return "Diplomatic Treaty";
        case "extractors":
            return "Extractor";
        case "factions":
            return "Faction";
        case "heroes":
            return "Hero";
        case "improvements":
            return "Improvement";
        case "minorfactions":
            return "Minor Faction";
        case "populations":
            return "Population";
        case "quests":
            return "Quest";
        case "traits":
            return "Trait";
        case "units":
            return "Unit";
        case "tech":
            return "Technology";
        default:
            return formatCodexKindLabel(kind).replace(/s$/, "");
    }
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
    count: number
): CodexSummaryEntry {
    return {
        exportKind: kind,
        entryKey: getCodexSummaryEntryKey(kind),
        displayName: `All ${label}`,
        category: null,
        kind: null,
        descriptionLines: [],
        referenceKeys: [],
        isSummary: true,
        summaryKind: kind,
        summaryLabel: label,
        summaryCount: count,
    };
}
