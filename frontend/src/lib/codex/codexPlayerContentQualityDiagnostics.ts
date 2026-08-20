import {
    getCodexTopLevelVisibility,
    normalizeCodexKind,
    type CodexTopLevelVisibility,
} from "./codexCategoryConfig.ts";
import type { CodexEntry, CodexMetadataFact, CodexMetadataSection, CodexMetadataSectionItem } from "../../types/dataTypes";

export type CodexPlayerContentQualityClassification =
    | "ewshop-rich-import-render-gap"
    | "no-richer-source-found"
    | "likely-internal-support-record"
    | "unresolved-manual-evidence-required";

export type CodexPlayerContentQualityCandidateKind =
    | "bookkeeping-classification-dominated"
    | "missing-category-gameplay-content";

export type CodexPlayerContentQualityOwner = "EWShop" | "Exporter" | "Both";

export type CodexPlayerContentRichSource = {
    kind: string;
    record: Record<string, unknown>;
    sourcePath?: string;
};

export type CodexPlayerContentQualityOptions = {
    richRecordsByKindKey?: Readonly<Record<string, Readonly<Record<string, CodexPlayerContentRichSource | undefined>>>>;
    joinedRichKinds?: ReadonlySet<string>;
};

export type CodexPlayerContentQualityFinding = {
    exportKind: string;
    visibility: CodexTopLevelVisibility;
    entryKey: string;
    displayName: string;
    candidateKind: CodexPlayerContentQualityCandidateKind;
    expectedContent: string;
    classification: CodexPlayerContentQualityClassification;
    owner: CodexPlayerContentQualityOwner;
    reason: string;
    evidence: string[];
    recommendation: string;
};

export type CodexPlayerContentQualityReport = {
    entryCount: number;
    publicEntryCount: number;
    findingCount: number;
    findings: CodexPlayerContentQualityFinding[];
    countsByCandidateKind: Partial<Record<CodexPlayerContentQualityCandidateKind, number>>;
    countsByClassification: Partial<Record<CodexPlayerContentQualityClassification, number>>;
    countsByOwner: Partial<Record<CodexPlayerContentQualityOwner, number>>;
    countsByExportKind: Record<string, number>;
    publicEntryCountsByExportKind: Record<string, number>;
    policyCoveredExportKinds: string[];
    evaluatedZeroCandidateExportKinds: string[];
    uncoveredPublicExportKinds: string[];
};

type CategoryUsefulnessPolicy = {
    expectedContent: string;
    sectionTitlePatterns: RegExp[];
    linePatterns: RegExp[];
    factLabelPatterns: RegExp[];
    richKeyPatterns: RegExp[];
};

const DEFAULT_JOINED_RICH_KINDS = new Set([
    "districts",
    "factions",
    "heroes",
    "improvements",
    "minorfactions",
    "tech",
    "units",
]);

const BOOKKEEPING_LABELS = new Set([
    "action type",
    "bilateral",
    "category",
    "chapter",
    "class",
    "combat role",
    "condition",
    "cost",
    "disposition",
    "duration",
    "era",
    "faction",
    "kind",
    "mandatory",
    "origin faction",
    "polarity",
    "population kind",
    "quadrant",
    "rarity",
    "role",
    "scope",
    "slot",
    "status type",
    "tier",
    "trait type",
    "treaty category",
    "type",
    "ui category",
    "value",
]);

const PROVENANCE_LINE_PATTERNS = [
    /^quest reward:/i,
    /^reward objective:/i,
    /^choices?:/i,
    /^mandatory quest$/i,
];

const INTERNAL_SUPPORT_PATTERNS = [
    /\[deprecated]/i,
    /\bdeprecated\b/i,
    /\bdiagnostic\b/i,
    /\binternal\b/i,
    /\bobsolete\b/i,
    /\bprototype\b/i,
    /\bsupport\b/i,
];

const GAMEPLAY_LABEL_PATTERNS = [
    /\baffected cost\b/i,
    /\bapplies to\b/i,
    /\beffect\b/i,
    /\bgrant/i,
    /\binteraction\b/i,
    /\bmodifier\b/i,
    /\bplacement\b/i,
    /\bprereq/i,
    /\brequire/i,
    /\bunlock/i,
];

const EFFECT_LINE_PATTERNS = [
    /^[+-]\d/i,
    /\b\d+%?\b.*\b(?:Food|Industry|Dust|Science|Influence|Approval|Health|Damage|Defense|Movement|Vision|Experience|Fortification|Population|cost|income|yield|upkeep)\b/i,
    /\b(?:appl(?:y|ies|ied)|gain|grants?|granted|disable|disables|disabled|remove|removes|removed|restore|restores|restored|increase|increases|increased|decrease|decreases|decreased|reduce|reduces|reduced|double|doubles|doubled|unlock|unlocks|unlocked|immune|improve|improves|improved|damage|heal|heals|healed|level up|requires?|cannot|forbidden|adjacent)\b/i,
    /\bwhen\b.+:/i,
    /\bif\b.+\b(?:on|adjacent|attacking|battle|city|district|unit)\b/i,
];

const CATEGORY_POLICIES: Record<string, CategoryUsefulnessPolicy> = {
    abilities: {
        expectedContent: "effect/mechanical description",
        sectionTitlePatterns: [/^effects?$/i, /battle mechanics/i, /status mechanics/i],
        linePatterns: EFFECT_LINE_PATTERNS,
        factLabelPatterns: [/^affected/i, /^modifier$/i],
        richKeyPatterns: [/description/i, /effect/i, /mechanic/i, /battle/i, /status/i],
    },
    actions: {
        expectedContent: "public purpose, effects, requirements, cost mechanics, or applied result",
        sectionTitlePatterns: [/action mechanics/i, /^effects?$/i, /^requirements?$/i, /applied statuses/i],
        linePatterns: EFFECT_LINE_PATTERNS,
        factLabelPatterns: [/^affected cost$/i, /^modifier$/i],
        richKeyPatterns: [/description/i, /effect/i, /require/i, /cost/i, /unlock/i],
    },
    counciloreffects: {
        expectedContent: "councilor effect description",
        sectionTitlePatterns: [/^effects?$/i],
        linePatterns: EFFECT_LINE_PATTERNS,
        factLabelPatterns: [/^modifier$/i, /^affected/i],
        richKeyPatterns: [/description/i, /effect/i],
    },
    diplomatictreaties: {
        expectedContent: "diplomatic effect, requirement, consequence, or applied status",
        sectionTitlePatterns: [/applied statuses/i, /^effects?$/i, /^requirements?$/i],
        linePatterns: EFFECT_LINE_PATTERNS,
        factLabelPatterns: [/^applies to$/i, /^modifier$/i, /^affected/i],
        richKeyPatterns: [/description/i, /effect/i, /status/i, /require/i],
    },
    districts: {
        expectedContent: "constructible effects, unlocks, level-up rules, or placement constraints",
        sectionTitlePatterns: [/^effects?$/i, /^unlocks?$/i, /^requirements?$/i, /placement/i],
        linePatterns: EFFECT_LINE_PATTERNS,
        factLabelPatterns: [/^unlock/i, /^required/i, /placement/i],
        richKeyPatterns: [/description/i, /effect/i, /unlock/i, /placement/i, /levelup/i],
    },
    equipment: {
        expectedContent: "equipment effects or granted abilities",
        sectionTitlePatterns: [/^effects?$/i, /granted abilities/i],
        linePatterns: EFFECT_LINE_PATTERNS,
        factLabelPatterns: [/^granted/i, /^modifier$/i, /^affected/i],
        richKeyPatterns: [/description/i, /effect/i, /ability/i],
    },
    improvements: {
        expectedContent: "constructible effects, unlocks, or placement constraints",
        sectionTitlePatterns: [/^effects?$/i, /^unlocks?$/i, /^requirements?$/i, /placement/i],
        linePatterns: EFFECT_LINE_PATTERNS,
        factLabelPatterns: [/^unlock/i, /^required/i, /placement/i],
        richKeyPatterns: [/description/i, /effect/i, /unlock/i, /placement/i],
    },
    partnereffects: {
        expectedContent: "partner effect description",
        sectionTitlePatterns: [/^effects?$/i],
        linePatterns: EFFECT_LINE_PATTERNS,
        factLabelPatterns: [/^modifier$/i, /^affected/i],
        richKeyPatterns: [/description/i, /effect/i],
    },
    resources: {
        expectedContent: "resource effect, extractor relationship, or use",
        sectionTitlePatterns: [/^effects?$/i, /extractors/i, /^use/i],
        linePatterns: EFFECT_LINE_PATTERNS,
        factLabelPatterns: [/^extractor/i, /^modifier$/i],
        richKeyPatterns: [/description/i, /effect/i, /extractor/i],
    },
    statuses: {
        expectedContent: "status effect/mechanical description or interactions",
        sectionTitlePatterns: [/^effects?$/i, /status mechanics/i, /status interactions/i],
        linePatterns: EFFECT_LINE_PATTERNS,
        factLabelPatterns: [/^modifier$/i, /^affected/i, /^applies to$/i],
        richKeyPatterns: [/description/i, /effect/i, /interaction/i, /mechanic/i],
    },
    traits: {
        expectedContent: "trait effect, granted ability, unlock, requirement, or mechanical description",
        sectionTitlePatterns: [/^effects?$/i, /^unlocks?$/i, /^requirements?$/i, /granted abilities/i],
        linePatterns: EFFECT_LINE_PATTERNS,
        factLabelPatterns: [/^granted/i, /^unlock/i, /^modifier$/i, /^affected/i],
        richKeyPatterns: [/description/i, /effect/i, /ability/i, /unlock/i, /trait/i],
    },
};

const RICH_BOOKKEEPING_KEYS = new Set([
    "abilitykey",
    "artid",
    "category",
    "constructiblekey",
    "constructiblelevel",
    "displayname",
    "districtkey",
    "entrykey",
    "exportkind",
    "faction",
    "factionkind",
    "factionkey",
    "factionkeys",
    "familykey",
    "hidden",
    "ishero",
    "isinherited",
    "isinternal",
    "ismajorfaction",
    "isplayerfacing",
    "isvisibleinui",
    "kind",
    "publicdisplayname",
    "sourcecategory",
    "techkey",
    "tier",
    "unitkey",
]);

const CODEX_RENDERED_KEYS = new Set([
    "category",
    "descriptionlines",
    "displayname",
    "entrykey",
    "exportkind",
    "facts",
    "kind",
    "publiccontextkeys",
    "referencekeys",
    "sections",
    "svgicon",
]);

function normalize(value: unknown): string {
    return typeof value === "string" ? value.trim() : "";
}

function normalizeComparable(value: unknown): string {
    return normalize(value).replace(/\s+/g, " ").toLowerCase();
}

function normalizeDiagnosticExportKind(entry: Pick<CodexEntry, "exportKind" | "entryKey" | "category" | "kind">): string {
    const exportKind = normalizeCodexKind(entry.exportKind);
    if (exportKind !== "bonuses") return exportKind;

    const category = normalizeComparable(entry.category);
    const kind = normalizeComparable(entry.kind);
    const key = normalize(entry.entryKey);
    if (
        category === "status" ||
        kind === "status" ||
        key.startsWith("Status_") ||
        key.startsWith("HeroStatus_") ||
        key.startsWith("TreatyPublicOpinion_")
    ) {
        return "statuses";
    }

    return exportKind;
}

function displayName(entry: CodexEntry): string {
    return normalize(entry.displayName) || normalize(entry.entryKey) || "(unnamed)";
}

function addCount<K extends string>(counts: Partial<Record<K, number>>, key: K) {
    counts[key] = (counts[key] ?? 0) + 1;
}

function factText(fact: CodexMetadataFact): string {
    return `${normalize(fact.label)}: ${normalize(fact.value)}`.trim();
}

function isBookkeepingLabel(label: unknown): boolean {
    return BOOKKEEPING_LABELS.has(normalizeComparable(label));
}

function hasGameplayLabel(label: unknown, policy: CategoryUsefulnessPolicy): boolean {
    const normalized = normalize(label);
    return !isBookkeepingLabel(normalized) &&
        (
            policy.factLabelPatterns.some((pattern) => pattern.test(normalized)) ||
            GAMEPLAY_LABEL_PATTERNS.some((pattern) => pattern.test(normalized))
        );
}

function splitPrefixedLine(line: string): { label: string; value: string } | null {
    const match = line.match(/^([^:]{2,48}):\s*(.+)$/);
    if (!match) return null;

    return {
        label: match[1].trim(),
        value: match[2].trim(),
    };
}

function isBookkeepingLine(line: string): boolean {
    const trimmed = normalize(line);
    if (!trimmed) return true;

    const parsed = splitPrefixedLine(trimmed);
    if (parsed) return isBookkeepingLabel(parsed.label);

    return false;
}

function hasOnlyZeroSignedMagnitudes(line: string): boolean {
    const signedNumbers = line.match(/[+-]\s*\d+(?:\.\d+)?%?/g) ?? [];
    return signedNumbers.length > 0 &&
        signedNumbers.every((value) => Number.parseFloat(value.replace(/\s+/g, "").replace("%", "")) === 0);
}

function lineLooksLikeGameplay(line: string, policy: CategoryUsefulnessPolicy): boolean {
    const trimmed = normalize(line);
    if (!trimmed) return false;
    if (PROVENANCE_LINE_PATTERNS.some((pattern) => pattern.test(trimmed))) return false;
    if (hasOnlyZeroSignedMagnitudes(trimmed)) return false;

    const parsed = splitPrefixedLine(trimmed);
    if (parsed) {
        return hasGameplayLabel(parsed.label, policy) ||
            policy.linePatterns.some((pattern) => pattern.test(parsed.value));
    }

    return policy.linePatterns.some((pattern) => pattern.test(trimmed));
}

function hasGameplayFact(fact: CodexMetadataFact, policy: CategoryUsefulnessPolicy): boolean {
    return hasGameplayLabel(fact.label, policy);
}

function hasGameplaySectionItem(item: CodexMetadataSectionItem, policy: CategoryUsefulnessPolicy): boolean {
    return hasGameplayLabel(item.label, policy) ||
        (item.lines ?? []).some((line) => lineLooksLikeGameplay(line, policy)) ||
        (item.facts ?? []).some((fact) => hasGameplayFact(fact, policy));
}

function hasAnySectionItemContent(item: CodexMetadataSectionItem): boolean {
    return normalize(item.label).length > 0 ||
        normalize(item.referenceKey).length > 0 ||
        (item.lines ?? []).some((line) => normalize(line).length > 0) ||
        (item.facts ?? []).some((fact) => normalize(fact.label).length > 0 || normalize(fact.value).length > 0);
}

function hasGameplaySection(section: CodexMetadataSection, policy: CategoryUsefulnessPolicy): boolean {
    const title = normalize(section.title);
    const isGameplaySection = policy.sectionTitlePatterns.some((pattern) => pattern.test(title));

    return (isGameplaySection && (
        (section.lines ?? []).some((line) => normalize(line).length > 0) ||
        (section.items ?? []).some(hasAnySectionItemContent)
    )) ||
        (section.lines ?? []).some((line) => lineLooksLikeGameplay(line, policy)) ||
        (section.items ?? []).some((item) => hasGameplaySectionItem(item, policy));
}

function isSelfReference(entry: CodexEntry, referenceKey: string): boolean {
    const normalizedReference = normalize(referenceKey);
    const entryKey = normalize(entry.entryKey);
    const exportKind = normalizeDiagnosticExportKind(entry);

    return normalizedReference === entryKey ||
        normalizedReference === `codex:${exportKind}%3A${entryKey}`;
}

function hasNonSelfRelationship(entry: CodexEntry): boolean {
    const references = [
        ...(entry.referenceKeys ?? []),
        ...(entry.publicContextKeys ?? []),
    ];

    return references.some((referenceKey) => normalize(referenceKey).length > 0 && !isSelfReference(entry, referenceKey));
}

function hasCategoryGameplayContent(entry: CodexEntry, policy: CategoryUsefulnessPolicy): boolean {
    return (entry.descriptionLines ?? []).some((line) => lineLooksLikeGameplay(line, policy)) ||
        (entry.facts ?? []).some((fact) => hasGameplayFact(fact, policy)) ||
        (entry.sections ?? []).some((section) => hasGameplaySection(section, policy));
}

function hasAnyVisibleNonBookkeepingContent(entry: CodexEntry): boolean {
    return (entry.descriptionLines ?? []).some((line) => {
        const trimmed = normalize(line);
        return trimmed.length > 0 && !isBookkeepingLine(trimmed);
    }) ||
        (entry.sections ?? []).some((section) =>
            normalize(section.title).length > 0 ||
            (section.lines ?? []).some((line) => normalize(line).length > 0) ||
            (section.items ?? []).some((item) => normalize(item.label).length > 0)
        ) ||
        hasNonSelfRelationship(entry);
}

function hasBookkeepingContent(entry: CodexEntry): boolean {
    return (entry.facts ?? []).some((fact) => isBookkeepingLabel(fact.label)) ||
        (entry.descriptionLines ?? []).some(isBookkeepingLine);
}

function hasInternalSupportSignal(entry: CodexEntry): boolean {
    const text = [
        entry.entryKey,
        entry.displayName,
        entry.kind,
        entry.category,
        ...(entry.descriptionLines ?? []),
        ...(entry.facts ?? []).flatMap((fact) => [fact.label, fact.value]),
    ].map(normalize).join("\n");

    return INTERNAL_SUPPORT_PATTERNS.some((pattern) => pattern.test(text));
}

function getRichSourceForEntry(
    entry: CodexEntry,
    exportKind: string,
    options: CodexPlayerContentQualityOptions
): CodexPlayerContentRichSource | undefined {
    const byKindKey = options.richRecordsByKindKey?.[exportKind];
    return byKindKey?.[normalize(entry.entryKey)];
}

function normalizedRichKey(value: unknown): string {
    return normalize(value).toLowerCase();
}

function richValueLooksUseful(key: string, value: unknown, policy: CategoryUsefulnessPolicy, depth = 0): boolean {
    if (depth > 4 || value === null || value === undefined) return false;

    const normalizedKey = normalizedRichKey(key);
    if (RICH_BOOKKEEPING_KEYS.has(normalizedKey)) return false;

    if (typeof value === "string") {
        const trimmed = value.trim();
        return trimmed.length > 0 &&
            policy.richKeyPatterns.some((pattern) => pattern.test(key)) &&
            lineLooksLikeGameplay(trimmed, policy);
    }

    if (typeof value === "number") {
        return Number.isFinite(value) && policy.richKeyPatterns.some((pattern) => pattern.test(key));
    }

    if (typeof value === "boolean") return false;

    if (Array.isArray(value)) {
        if (value.length === 0) return false;
        if (/description/i.test(key)) {
            return value.some((item) => typeof item === "string" && lineLooksLikeGameplay(item, policy));
        }
        return policy.richKeyPatterns.some((pattern) => pattern.test(key)) ||
            value.some((item) => richValueLooksUseful(key, item, policy, depth + 1));
    }

    if (typeof value === "object") {
        if (policy.richKeyPatterns.some((pattern) => pattern.test(key))) {
            return Object.values(value as Record<string, unknown>).some((childValue) => {
                if (childValue === null || childValue === undefined) return false;
                if (Array.isArray(childValue)) return childValue.length > 0;
                if (typeof childValue === "object") return Object.keys(childValue).length > 0;
                if (typeof childValue === "string") return childValue.trim().length > 0;
                if (typeof childValue === "number") return Number.isFinite(childValue);
                return false;
            });
        }
        return Object.entries(value as Record<string, unknown>)
            .some(([childKey, childValue]) => richValueLooksUseful(childKey, childValue, policy, depth + 1));
    }

    return false;
}

function collectUsefulRichEvidence(
    key: string,
    value: unknown,
    policy: CategoryUsefulnessPolicy,
    path = key,
    depth = 0
): string[] {
    if (depth > 4 || value === null || value === undefined) return [];

    const normalizedKey = normalizedRichKey(key);
    if (RICH_BOOKKEEPING_KEYS.has(normalizedKey)) return [];

    if (typeof value === "string") {
        const trimmed = value.trim();
        return trimmed.length > 0 &&
            policy.richKeyPatterns.some((pattern) => pattern.test(key)) &&
            lineLooksLikeGameplay(trimmed, policy)
            ? [`${path}: ${trimmed}`]
            : [];
    }

    if (typeof value === "number") {
        return Number.isFinite(value) && policy.richKeyPatterns.some((pattern) => pattern.test(key))
            ? [`${path}: ${value}`]
            : [];
    }

    if (typeof value === "boolean") return [];

    if (Array.isArray(value)) {
        if (value.length === 0) return [];
        if (/description/i.test(key)) {
            return value.flatMap((item, index) => typeof item === "string" && lineLooksLikeGameplay(item, policy)
                ? [`${path}[${index}]: ${item.trim()}`]
                : []);
        }
        return value.flatMap((item, index) => collectUsefulRichEvidence(key, item, policy, `${path}[${index}]`, depth + 1));
    }

    if (typeof value === "object") {
        return Object.entries(value as Record<string, unknown>)
            .flatMap(([childKey, childValue]) => collectUsefulRichEvidence(childKey, childValue, policy, `${path}.${childKey}`, depth + 1));
    }

    return [];
}

function usefulRichEvidence(
    source: CodexPlayerContentRichSource | undefined,
    policy: CategoryUsefulnessPolicy
): string[] {
    if (!source) return [];

    const sourceLabel = source.sourcePath ?? source.kind;
    return Object.entries(source.record)
        .flatMap(([key, value]) => collectUsefulRichEvidence(key, value, policy))
        .slice(0, 5)
        .map((evidence) => `rich source ${sourceLabel} ${evidence}`);
}

function hasUsefulRichDomainData(
    source: CodexPlayerContentRichSource | undefined,
    policy: CategoryUsefulnessPolicy
): boolean {
    if (!source) return false;

    return Object.entries(source.record).some(([key, value]) => richValueLooksUseful(key, value, policy));
}

function hasUsefulUnrenderedCodexSourceData(entry: CodexEntry, policy: CategoryUsefulnessPolicy): boolean {
    return Object.entries(entry as CodexEntry & Record<string, unknown>)
        .filter(([key]) => !CODEX_RENDERED_KEYS.has(normalizeComparable(key)))
        .some(([key, value]) => richValueLooksUseful(key, value, policy));
}

function usefulUnrenderedCodexSourceEvidence(entry: CodexEntry, policy: CategoryUsefulnessPolicy): string[] {
    return Object.entries(entry as CodexEntry & Record<string, unknown>)
        .filter(([key]) => !CODEX_RENDERED_KEYS.has(normalizeComparable(key)))
        .flatMap(([key, value]) => collectUsefulRichEvidence(key, value, policy))
        .slice(0, 5)
        .map((evidence) => `unrendered Codex source ${evidence}`);
}

function classificationLabel(classification: CodexPlayerContentQualityClassification): string {
    switch (classification) {
        case "ewshop-rich-import-render-gap":
            return "useful current source/rich data exists but EWShop does not render it";
        case "no-richer-source-found":
            return "no category-relevant gameplay content was found in checked generic/rich source inputs";
        case "likely-internal-support-record":
            return "the record is likely internal/support data that should not be public";
        case "unresolved-manual-evidence-required":
            return "manual evidence review is required before assigning root cause";
    }
}

function classifyFinding(
    entry: CodexEntry,
    options: CodexPlayerContentQualityOptions
): CodexPlayerContentQualityFinding | null {
    const exportKind = normalizeDiagnosticExportKind(entry);
    const visibility = getCodexTopLevelVisibility(exportKind);
    if (visibility !== "public") return null;

    const policy = CATEGORY_POLICIES[exportKind];
    if (!policy) return null;
    if (hasCategoryGameplayContent(entry, policy)) return null;

    const candidateKind: CodexPlayerContentQualityCandidateKind = hasBookkeepingContent(entry) && !hasAnyVisibleNonBookkeepingContent(entry)
        ? "bookkeeping-classification-dominated"
        : "missing-category-gameplay-content";
    const richSource = getRichSourceForEntry(entry, exportKind, options);
    const joinedRichKinds = options.joinedRichKinds ?? DEFAULT_JOINED_RICH_KINDS;
    const hasUsefulRichData = hasUsefulRichDomainData(richSource, policy);
    if (hasUsefulRichData && joinedRichKinds.has(exportKind)) return null;

    let classification: CodexPlayerContentQualityClassification = "unresolved-manual-evidence-required";
    let owner: CodexPlayerContentQualityOwner = "Both";
    let recommendation = "Sample the generic/rich source record before assigning this to EWShop or exporter/content.";
    const evidence = [
        ...(entry.facts ?? []).filter((fact) => isBookkeepingLabel(fact.label)).map(factText),
        ...(entry.descriptionLines ?? []).filter(isBookkeepingLine),
    ];

    if (hasInternalSupportSignal(entry)) {
        classification = "likely-internal-support-record";
        owner = "Both";
        recommendation = "Review public visibility; keep internal/support rows hidden unless public content is added.";
    } else if (hasUsefulRichData && !joinedRichKinds.has(exportKind)) {
        classification = "ewshop-rich-import-render-gap";
        owner = "EWShop";
        recommendation = "Join the existing rich/source-truth record into the Codex detail or archive surface where that is product-safe.";
        evidence.push(...usefulRichEvidence(richSource, policy));
    } else if (hasUsefulUnrenderedCodexSourceData(entry, policy)) {
        classification = "ewshop-rich-import-render-gap";
        owner = "EWShop";
        recommendation = "Preserve and render the useful exported fields through the Codex type/store/presenter path.";
        evidence.push(...usefulUnrenderedCodexSourceEvidence(entry, policy));
    } else if (options.richRecordsByKindKey) {
        classification = "no-richer-source-found";
        owner = "Exporter";
        recommendation = "Evidence review should decide whether exporter/content must add category-relevant gameplay content or explicit unavailable/internal/deferred absence semantics.";
    }

    return {
        exportKind,
        visibility,
        entryKey: normalize(entry.entryKey),
        displayName: displayName(entry),
        candidateKind,
        expectedContent: policy.expectedContent,
        classification,
        owner,
        reason: `${classificationLabel(classification)}; expected ${policy.expectedContent}.`,
        evidence,
        recommendation,
    };
}

function compareFindings(
    left: CodexPlayerContentQualityFinding,
    right: CodexPlayerContentQualityFinding
): number {
    return left.classification.localeCompare(right.classification) ||
        left.candidateKind.localeCompare(right.candidateKind) ||
        left.exportKind.localeCompare(right.exportKind) ||
        left.entryKey.localeCompare(right.entryKey);
}

export function createCodexPlayerContentQualityReport(
    entries: readonly CodexEntry[],
    options: CodexPlayerContentQualityOptions = {}
): CodexPlayerContentQualityReport {
    const findings = entries
        .map((entry) => classifyFinding(entry, options))
        .filter((finding): finding is CodexPlayerContentQualityFinding => finding !== null)
        .sort(compareFindings);
    const countsByCandidateKind: Partial<Record<CodexPlayerContentQualityCandidateKind, number>> = {};
    const countsByClassification: Partial<Record<CodexPlayerContentQualityClassification, number>> = {};
    const countsByOwner: Partial<Record<CodexPlayerContentQualityOwner, number>> = {};
    const countsByExportKind: Record<string, number> = {};
    const publicEntryCountsByExportKind: Record<string, number> = {};

    for (const entry of entries) {
        const exportKind = normalizeDiagnosticExportKind(entry);
        if (getCodexTopLevelVisibility(exportKind) !== "public") continue;
        publicEntryCountsByExportKind[exportKind] = (publicEntryCountsByExportKind[exportKind] ?? 0) + 1;
    }

    for (const finding of findings) {
        addCount(countsByCandidateKind, finding.candidateKind);
        addCount(countsByClassification, finding.classification);
        addCount(countsByOwner, finding.owner);
        countsByExportKind[finding.exportKind] = (countsByExportKind[finding.exportKind] ?? 0) + 1;
    }

    const policyCoveredExportKinds = Object.keys(CATEGORY_POLICIES).sort((left, right) => left.localeCompare(right));
    const evaluatedZeroCandidateExportKinds = policyCoveredExportKinds
        .filter((exportKind) => (publicEntryCountsByExportKind[exportKind] ?? 0) > 0 && !countsByExportKind[exportKind]);
    const uncoveredPublicExportKinds = Object.keys(publicEntryCountsByExportKind)
        .filter((exportKind) => !CATEGORY_POLICIES[exportKind])
        .sort((left, right) => left.localeCompare(right));

    return {
        entryCount: entries.length,
        publicEntryCount: entries.filter((entry) => getCodexTopLevelVisibility(normalizeDiagnosticExportKind(entry)) === "public").length,
        findingCount: findings.length,
        findings,
        countsByCandidateKind,
        countsByClassification,
        countsByOwner,
        countsByExportKind,
        publicEntryCountsByExportKind,
        policyCoveredExportKinds,
        evaluatedZeroCandidateExportKinds,
        uncoveredPublicExportKinds,
    };
}

function formatCounts(counts: Record<string, number> | Partial<Record<string, number>>): string[] {
    const rows = Object.entries(counts)
        .filter(([, count]) => typeof count === "number" && count > 0)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, count]) => `- ${key}: ${count}`);

    return rows.length > 0 ? rows : ["- none"];
}

function formatFinding(finding: CodexPlayerContentQualityFinding): string {
    return [
        `- ${finding.exportKind}:${finding.entryKey}`,
        finding.displayName,
        finding.candidateKind,
        finding.owner,
        finding.classification,
        `expected: ${finding.expectedContent}`,
        `evidence: ${finding.evidence.join("; ") || "no category-relevant gameplay content"}`,
        `next: ${finding.recommendation}`,
    ].join(" | ");
}

export function formatCodexPlayerContentQualityReport(
    report: CodexPlayerContentQualityReport,
    options: { detailLimit?: number } = {}
): string {
    const detailLimit = options.detailLimit ?? 200;
    const visibleFindings = report.findings.slice(0, detailLimit);

    return [
        "CODEX PLAYER CONTENT QUALITY DIAGNOSTIC",
        "=======================================",
        "",
        "This diagnostic is separate from reference integrity and strict-thin structural checks.",
        "",
        `entries scanned: ${report.entryCount}`,
        `public entries scanned: ${report.publicEntryCount}`,
        `player-content diagnostic candidates: ${report.findingCount}`,
        "",
        "SUMMARY BY CANDIDATE KIND",
        "-------------------------",
        ...formatCounts(report.countsByCandidateKind),
        "",
        "SUMMARY BY CLASSIFICATION",
        "-------------------------",
        ...formatCounts(report.countsByClassification),
        "",
        "SUMMARY BY OWNER",
        "----------------",
        ...formatCounts(report.countsByOwner),
        "",
        "SUMMARY BY CATEGORY",
        "-------------------",
        ...formatCounts(report.countsByExportKind),
        "",
        "EVALUATED PUBLIC CATEGORIES WITH ZERO CANDIDATES",
        "-----------------------------------------------",
        ...(report.evaluatedZeroCandidateExportKinds.length > 0 ? report.evaluatedZeroCandidateExportKinds.map((exportKind) => `- ${exportKind}: ${report.publicEntryCountsByExportKind[exportKind] ?? 0} public entries`) : ["- none"]),
        "",
        "PUBLIC CATEGORIES NOT COVERED BY CATEGORY-AWARE POLICY",
        "-----------------------------------------------------",
        ...(report.uncoveredPublicExportKinds.length > 0 ? report.uncoveredPublicExportKinds.map((exportKind) => `- ${exportKind}: ${report.publicEntryCountsByExportKind[exportKind] ?? 0} public entries`) : ["- none"]),
        "",
        `DETAILS (FIRST ${detailLimit})`,
        "-------------------",
        ...(visibleFindings.length > 0 ? visibleFindings.map(formatFinding) : ["- none"]),
    ].join("\n");
}
