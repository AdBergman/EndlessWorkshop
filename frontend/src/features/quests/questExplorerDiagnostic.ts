import { getQuestCategoryKey, QUEST_CATEGORY_OPTIONS, type QuestCategoryKey } from "@/features/quests/questCategories";
import { buildQuestRailGroups, resolveRailSelectionKey, type QuestRailGroup, type QuestRailItem } from "@/features/quests/questRail";
import type { QuestExplorerEntry, QuestExplorerProgression, QuestExplorerResponse, QuestProgressionStep } from "@/types/questTypes";

export type QuestExplorerDiagnosticClassification =
    | "blocker"
    | "warning"
    | "known exporter/data-quality issue"
    | "accepted modeled artifact"
    | "design smell/future risk";

export type QuestExplorerDiagnosticFinding = {
    classification: QuestExplorerDiagnosticClassification;
    message: string;
};

export type QuestExplorerFrontendDiagnostic = {
    categoryCounts: Record<QuestCategoryKey, number>;
    selectedRailItem: string;
    railExamples: string[];
    findings: QuestExplorerDiagnosticFinding[];
    reportText: string;
};

type CreateQuestExplorerFrontendDiagnosticOptions = {
    selectedEntryKey?: string | null;
    sourceTexts?: Record<string, string>;
};

const FRONTEND_INFERENCE_SYMBOLS = [
    "inferQuestProgression",
    "inferProgression",
    "projectQuestProgression",
    "parseQuestGraph",
    "questGraph",
    "QuestGraph",
];

function entryIdentityKeys(entry: QuestExplorerEntry): string[] {
    return [entry.entryKey, ...entry.aliases].filter(Boolean);
}

function entriesByKey(entries: QuestExplorerEntry[]): Record<string, QuestExplorerEntry> {
    return Object.fromEntries(entries.map((entry) => [entry.entryKey, entry]));
}

function visibleKeysForCategory(entries: QuestExplorerEntry[], category: QuestCategoryKey): Set<string> {
    return new Set(entries
        .filter((entry) => getQuestCategoryKey(entry.questType) === category)
        .map((entry) => entry.entryKey));
}

function flattenRailItems(groups: QuestRailGroup[]): QuestRailItem[] {
    return groups.flatMap((group) => group.items);
}

function selectedRailItemLabel(groups: QuestRailGroup[], selectedEntry: QuestExplorerEntry | null): string {
    const selectedRailEntryKey = resolveRailSelectionKey(selectedEntry, groups);
    const item = flattenRailItems(groups).find((candidate) => candidate.entry.entryKey === selectedRailEntryKey);
    return item
        ? `${item.title} | ${item.chapterLabel} | ${item.metaLabel}`
        : "none";
}

function railExamples(groups: QuestRailGroup[]): string[] {
    return groups.flatMap((group) => group.items.slice(0, 3).map((item) => (
        `${group.title}: ${item.title} | ${item.chapterLabel} | ${item.metaLabel}`
    ))).slice(0, 8);
}

function isChapterOnlyLabel(value: string): boolean {
    return /^chapter(?:\s+\d+)?$/i.test(value.trim());
}

function addDuplicateRailFindings(findings: QuestExplorerDiagnosticFinding[], groups: QuestRailGroup[]) {
    const seen = new Map<string, QuestRailItem>();

    for (const item of flattenRailItems(groups)) {
        if (isChapterOnlyLabel(item.title) && item.title.trim().toLowerCase() === item.chapterLabel.trim().toLowerCase()) {
            findings.push({
                classification: "blocker",
                message: `Major rail item duplicates a chapter-only title/subtitle: ${item.title} / ${item.chapterLabel}`,
            });
        }

        const identity = `${item.title.trim().toLowerCase()}::${item.chapterLabel.trim().toLowerCase()}`;
        const previous = seen.get(identity);
        if (previous && previous.key !== item.key) {
            findings.push({
                classification: "warning",
                message: `Duplicate rail title/subtitle pair: ${item.title} / ${item.chapterLabel}`,
            });
        } else {
            seen.set(identity, item);
        }
    }
}

function branchVariantEntryKeys(progression: QuestExplorerProgression | null): Set<string> {
    const keys = new Set<string>();
    for (const questline of progression?.questlines ?? []) {
        for (const chapter of questline.chapters) {
            for (const step of chapter.steps) {
                for (const variant of step.variants) {
                    if (variant.variantKind === "branch_variant") keys.add(variant.entryKey);
                }
            }
        }
    }
    return keys;
}

function addBranchVariantFinding(
    findings: QuestExplorerDiagnosticFinding[],
    groups: QuestRailGroup[],
    progression: QuestExplorerProgression | null
) {
    const branchKeys = branchVariantEntryKeys(progression);
    const railRows = flattenRailItems(groups)
        .filter((item) => branchKeys.has(item.entry.entryKey))
        .map((item) => item.entry.entryKey);

    if (railRows.length > 0) {
        findings.push({
            classification: "blocker",
            message: `Branch variants are visible as rail rows: ${railRows.join(", ")}`,
        });
        return;
    }

    findings.push({
        classification: "accepted modeled artifact",
        message: branchKeys.size === 0
            ? "No branch_variant DTO variants are present in this diagnostic payload."
            : `Branch variants stay in detail/chronicle context, not rail rows (${branchKeys.size} variant(s)).`,
    });
}

function repeatedDetailEntryKeyGroups(progression: QuestExplorerProgression | null): Array<[string, QuestProgressionStep[]]> {
    const groups = new Map<string, QuestProgressionStep[]>();
    for (const questline of progression?.questlines ?? []) {
        for (const chapter of questline.chapters) {
            for (const step of chapter.steps) {
                groups.set(step.detailEntryKey, [...(groups.get(step.detailEntryKey) ?? []), step]);
            }
        }
    }
    return [...groups.entries()].filter(([, steps]) => steps.length > 1);
}

function addRepeatedDetailEntryKeyFindings(
    findings: QuestExplorerDiagnosticFinding[],
    progression: QuestExplorerProgression | null
) {
    const repeated = repeatedDetailEntryKeyGroups(progression);

    if (repeated.length === 0) {
        findings.push({
            classification: "accepted modeled artifact",
            message: "No repeated detailEntryKey DTO steps are present in this diagnostic payload.",
        });
        return;
    }

    for (const [detailEntryKey, steps] of repeated) {
        const hasVirtualAliasExpandedStep = steps.some((step) => step.projectionKind === "virtual_alias_expanded" || step.aliasEntryKeys.length > 0);
        findings.push({
            classification: hasVirtualAliasExpandedStep ? "accepted modeled artifact" : "warning",
            message: hasVirtualAliasExpandedStep
                ? `Repeated detailEntryKey ${detailEntryKey} is represented as repeated detail content / virtual alias-expanded step across ${steps.length} step DTOs.`
                : `Repeated detailEntryKey ${detailEntryKey} lacks an explicit virtual alias-expanded step marker across ${steps.length} step DTOs.`,
        });
    }
}

function addBackendDebugFindings(
    findings: QuestExplorerDiagnosticFinding[],
    progression: QuestExplorerProgression | null
) {
    const debug = progression?.debugSummary;
    if (!debug) return;

    const dataQualityCounts = [
        ["entries missing chapter/step order", debug.entriesWithMissingChapterOrStepOrder.length],
        ["one-step chapters", debug.chaptersWithOnlyOneStep.length],
        ["numeric questline collapse decisions", debug.numericQuestlineVariantsCollapsed.length],
        ["branch variants without parent step", debug.suspiciousBranchVariantsWithoutParentStep.length],
        ["tutorial entries placed", debug.tutorialEntriesPlaced.length],
        ["major questlines missing chapters", debug.missingMajorFactionChapters.length],
    ] as const;

    for (const [label, count] of dataQualityCounts) {
        if (count > 0) {
            findings.push({
                classification: "known exporter/data-quality issue",
                message: `${label}: ${count}`,
            });
        }
    }
}

function addInferenceSymbolFinding(
    findings: QuestExplorerDiagnosticFinding[],
    sourceTexts: Record<string, string> | undefined
) {
    if (!sourceTexts) {
        findings.push({
            classification: "design smell/future risk",
            message: "Frontend inference symbol scan was not supplied source text.",
        });
        return;
    }

    const hits = Object.entries(sourceTexts).flatMap(([file, text]) => (
        FRONTEND_INFERENCE_SYMBOLS
            .filter((symbol) => text.includes(symbol))
            .map((symbol) => `${file}:${symbol}`)
    ));

    findings.push({
        classification: hits.length > 0 ? "blocker" : "accepted modeled artifact",
        message: hits.length > 0
            ? `Frontend progression inference symbols present: ${hits.join(", ")}`
            : "Frontend progression inference symbols are absent from scanned Quest Explorer sources.",
    });
}

function categoryCounts(entries: QuestExplorerEntry[], progression: QuestExplorerProgression | null): Record<QuestCategoryKey, number> {
    return Object.fromEntries(QUEST_CATEGORY_OPTIONS.map((option) => [
        option.key,
        buildQuestRailGroups(entries, progression, visibleKeysForCategory(entries, option.key)).reduce(
            (total, group) => total + group.items.length,
            0
        ),
    ])) as Record<QuestCategoryKey, number>;
}

function formatFinding(classification: QuestExplorerDiagnosticClassification, findings: QuestExplorerDiagnosticFinding[]): string[] {
    const matching = findings.filter((finding) => finding.classification === classification);
    return [
        `${classification} (${matching.length}):`,
        ...(matching.length === 0 ? ["  - none"] : matching.map((finding) => `  - ${finding.message}`)),
    ];
}

export function createQuestExplorerFrontendDiagnostic(
    questExplorer: QuestExplorerResponse,
    options: CreateQuestExplorerFrontendDiagnosticOptions = {}
): QuestExplorerFrontendDiagnostic {
    const entries = questExplorer.entries;
    const progression = questExplorer.progression;
    const groups = buildQuestRailGroups(entries, progression);
    const selectedEntry = options.selectedEntryKey
        ? entriesByKey(entries)[options.selectedEntryKey] ?? entries.find((entry) => entryIdentityKeys(entry).includes(options.selectedEntryKey ?? ""))
        : entries[0] ?? null;
    const counts = categoryCounts(entries, progression);
    const examples = railExamples(groups);
    const findings: QuestExplorerDiagnosticFinding[] = [];

    if (!progression) {
        findings.push({
            classification: "blocker",
            message: "Quest Explorer response is missing backend progression DTO semantics.",
        });
    }

    addDuplicateRailFindings(findings, groups);
    addBranchVariantFinding(findings, groups, progression);
    addRepeatedDetailEntryKeyFindings(findings, progression);
    addBackendDebugFindings(findings, progression);
    addInferenceSymbolFinding(findings, options.sourceTexts);

    const selectedRailItem = selectedRailItemLabel(groups, selectedEntry);
    const reportText = [
        "Quest Explorer Frontend Diagnostic",
        "Generated: deterministic",
        "",
        "Category counts:",
        ...QUEST_CATEGORY_OPTIONS.map((option) => `  ${option.key}: ${counts[option.key]}`),
        "",
        `Selected rail item: ${selectedRailItem}`,
        "",
        "Rail title/subtitle/meta examples:",
        ...(examples.length === 0 ? ["  - none"] : examples.map((example) => `  - ${example}`)),
        "",
        "Classified findings:",
        ...formatFinding("blocker", findings),
        ...formatFinding("warning", findings),
        ...formatFinding("known exporter/data-quality issue", findings),
        ...formatFinding("accepted modeled artifact", findings),
        ...formatFinding("design smell/future risk", findings),
        "",
    ].join("\n");

    return {
        categoryCounts: counts,
        selectedRailItem,
        railExamples: examples,
        findings,
        reportText,
    };
}
