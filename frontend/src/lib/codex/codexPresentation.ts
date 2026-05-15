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
export const CODEX_QUEST_GROUP_ENTRY_PREFIX = "__questGroup__:";

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

export type CodexQuestContext = {
    questlineKey: string;
    questlineLabel: string;
    chapterKey: string;
    chapterLabel: string;
    stepKey: string | null;
    stepLabel: string | null;
    choiceKey: string | null;
    choiceLabel: string | null;
    choiceKeys: string[];
    choiceLabels: string[];
    nodeLabel: string;
    groupKey: string;
    groupContext: string;
    relatedContext: string;
    detailContextLines: string[];
    sortKey: string;
};

export type CodexQuestGroupEntry = CodexEntry & {
    isQuestGroup: true;
    groupKey: string;
    groupContext: string;
    nodeCount: number;
    nodes: CodexEntry[];
    isExpanded: boolean;
};

export type CodexListItem = CodexEntry | CodexSummaryEntry | CodexQuestGroupEntry;

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

function humanizeContextToken(value: string): string {
    return compactWhitespace(value)
        .replace(/_/g, " ")
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .split(/\s+/)
        .filter(Boolean)
        .map(formatToken)
        .join(" ");
}

function formatQuestOrdinal(value: string | null | undefined): string | null {
    const normalized = compactWhitespace(value ?? "");
    if (!normalized) return null;

    const match = normalized.match(/^0*([0-9]+)([A-Za-z]?)$/);
    if (!match) return normalized;

    return `${Number.parseInt(match[1], 10)}${match[2].toUpperCase()}`;
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
        if (majorMatch) return humanizeContextToken(readIdentifierToken(majorMatch[1]));

        const factionQuestMatch = text.match(/FactionQuest_([A-Za-z0-9]+)_/);
        if (factionQuestMatch) return humanizeContextToken(readIdentifierToken(factionQuestMatch[1]));

        const minorMatch = text.match(/MinorFaction_([A-Za-z0-9_]+)/);
        if (minorMatch) return humanizeContextToken(readIdentifierToken(minorMatch[1]));

        if (/LastLord|Last Lord/i.test(text)) return "Last Lords";
    }

    return null;
}

function inferQuestStepContext(entry: Pick<CodexEntry, "entryKey" | "exportKind">): string | null {
    if (compactWhitespace(entry.exportKind ?? "").toLowerCase() !== "quests") return null;

    const key = entry.entryKey ?? "";
    const chapter = key.match(/Chapter([0-9]+[A-Za-z]?)/i)?.[1];
    const step = key.match(/Step([0-9]+)/i)?.[1];
    const choices = Array.from(key.matchAll(/Choice([0-9]+)/gi)).map((match) => match[1]);

    const parts: string[] = [];
    if (chapter) parts.push(`Chapter ${chapter}`);
    if (step) parts.push(`Step ${step}`);
    choices.forEach((choice) => parts.push(`Choice ${choice}`));

    return parts.length > 0 ? parts.join(" ") : null;
}

function isQuestEntry(entry: Pick<CodexEntry, "exportKind" | "kind">): boolean {
    return compactWhitespace(entry.exportKind ?? "").toLowerCase() === "quests" ||
        compactWhitespace(entry.kind ?? "").toLowerCase() === "quest";
}

export function parseCodexQuestContext(
    entry: Pick<CodexEntry, "entryKey" | "displayName" | "exportKind" | "category" | "kind">
): CodexQuestContext | null {
    if (!isQuestEntry(entry)) return null;

    const key = entry.entryKey ?? "";
    const match = key.match(/^FactionQuest_([^_]+)_Chapter([0-9]+[A-Za-z]?)(?:_Step([0-9]+))?((?:_Choice[0-9]+)*)/i);
    if (!match) return null;

    const questlineKey = match[1];
    const chapterKey = match[2];
    const stepKey = match[3] ?? null;
    const choiceKeys = Array.from((match[4] ?? "").matchAll(/Choice([0-9]+)/gi)).map((choiceMatch) => choiceMatch[1]);
    const choiceKey = choiceKeys[0] ?? null;
    const chapterNumber = formatQuestOrdinal(chapterKey);
    const stepNumber = formatQuestOrdinal(stepKey);
    const choiceNumbers = choiceKeys.map(formatQuestOrdinal).filter((choiceNumber): choiceNumber is string => Boolean(choiceNumber));
    if (!chapterNumber) return null;

    const questlineLabel = humanizeContextToken(questlineKey);
    const chapterLabel = `Chapter ${chapterNumber}`;
    const stepLabel = stepNumber ? `Step ${stepNumber}` : null;
    const choiceLabels = choiceNumbers.map((choiceNumber) => `Choice ${choiceNumber}`);
    const choiceLabel = choiceLabels[0] ?? null;
    const nodeLabel = [stepLabel, ...choiceLabels].filter(Boolean).join(" · ") || "Quest node";
    const displayNameKey = compactWhitespace(entry.displayName ?? "").toLowerCase();
    const groupKey = [
        "quest",
        displayNameKey,
        questlineKey.toLowerCase(),
        chapterKey.toLowerCase(),
    ].join(":");
    const groupContext = `${questlineLabel} · ${chapterLabel}`;
    const relatedContext = ["Quest", questlineLabel, chapterLabel, nodeLabel].filter(Boolean).join(" · ");
    const categoryLabel = humanizeContextToken(entry.category ?? "");
    const kindLabel = singularKindLabel(entry.kind ?? entry.exportKind ?? "");
    const typeLine = [categoryLabel, kindLabel]
        .filter(Boolean)
        .filter((part, index, parts) => parts.findIndex((candidate) => candidate.toLowerCase() === part.toLowerCase()) === index)
        .join(" ");
    const detailContextLines = [groupContext, nodeLabel, typeLine].filter(Boolean);
    const sortKey = [
        chapterNumber.padStart(4, "0"),
        (stepNumber ?? "0").padStart(4, "0"),
        ...(choiceNumbers.length > 0 ? choiceNumbers.map((choiceNumber) => choiceNumber.padStart(4, "0")) : ["0000"]),
        key,
    ].join(":");

    return {
        questlineKey,
        questlineLabel,
        chapterKey,
        chapterLabel,
        stepKey,
        stepLabel,
        choiceKey,
        choiceLabel,
        choiceKeys,
        choiceLabels,
        nodeLabel,
        groupKey,
        groupContext,
        relatedContext,
        detailContextLines,
        sortKey,
    };
}

export function getCodexQuestNodeLabel(entry: CodexEntry): string {
    return parseCodexQuestContext(entry)?.nodeLabel ?? getCodexSecondaryContext(entry);
}

export function getCodexRelatedContext(entry: CodexEntry): string {
    return parseCodexQuestContext(entry)?.relatedContext ??
        getCodexSecondaryContext(entry);
}

export function getCodexDetailContextLines(entry: CodexEntry): string[] {
    const questContext = parseCodexQuestContext(entry);
    if (questContext) return questContext.detailContextLines;

    const secondaryContext = getCodexSecondaryContext(entry);
    return secondaryContext ? [secondaryContext] : [];
}

export function createCodexQuestGroupEntry(
    groupKey: string,
    displayName: string,
    groupContext: string,
    nodes: CodexEntry[],
    isExpanded: boolean
): CodexQuestGroupEntry {
    return {
        exportKind: "quests",
        entryKey: `${CODEX_QUEST_GROUP_ENTRY_PREFIX}${groupKey}`,
        displayName,
        category: null,
        kind: null,
        descriptionLines: [`${nodes.length} quest nodes`],
        referenceKeys: [],
        isQuestGroup: true,
        groupKey,
        groupContext,
        nodeCount: nodes.length,
        nodes,
        isExpanded,
    };
}

export function getCodexSecondaryContext(entry: Pick<CodexEntry, "entryKey" | "exportKind" | "category" | "kind" | "referenceKeys" | "descriptionLines">): string {
    const parts: string[] = [];
    const add = (value: string | null | undefined) => {
        const normalized = compactWhitespace(value ?? "");
        if (!normalized || normalized.toLowerCase() === "none") return;
        if (parts.some((part) => part.toLowerCase() === normalized.toLowerCase())) return;
        parts.push(humanizeContextToken(normalized));
    };

    add(inferFactionContext(entry));
    add(inferQuestStepContext(entry));
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
        case "abilities":
            return "Ability";
        case "councilors":
            return "Councilor";
        case "districts":
            return "District";
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

export function isCodexQuestGroupEntry(item: CodexListItem | CodexEntry | null | undefined): item is CodexQuestGroupEntry {
    return Boolean(item && item.entryKey.startsWith(CODEX_QUEST_GROUP_ENTRY_PREFIX));
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
        category: null,
        kind: null,
        descriptionLines: [summaryLine],
        referenceKeys: [],
        isSummary: true,
        summaryKind: kind,
        summaryLabel: label,
        summaryCount: count,
    };
}
