import { getQuestCategoryKey, QUEST_CATEGORY_OPTIONS, type QuestCategoryKey } from "@/features/quests/questCategories";
import { buildQuestRailGroups, resolveRailSelectionKey, type QuestRailGroup, type QuestRailItem } from "@/features/quests/questRail";
import {
    classifyQuestBranchSemanticStage,
    type QuestSemanticStageKind,
} from "@/features/quests/questSemanticStages";
import type {
    QuestBranch,
    QuestExplorerEntry,
    QuestExplorerProgression,
    QuestExplorerResponse,
    QuestProgressionStep,
} from "@/types/questTypes";

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

export type QuestExplorerSemanticDiagnosticCountKey =
    | QuestSemanticStageKind
    | "true_choice_groups"
    | "topology_forks_without_true_choice"
    | "grouped_deterministic_continuation_groups"
    | "alias_owned_stages"
    | "chapter_variants"
    | "lore_ownership_gaps"
    | "objective_ownership_gaps";

export type QuestExplorerSemanticDiagnosticCounts = Record<QuestExplorerSemanticDiagnosticCountKey, number>;

export type QuestExplorerFrontendDiagnostic = {
    categoryCounts: Record<QuestCategoryKey, number>;
    semanticCounts: QuestExplorerSemanticDiagnosticCounts;
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

const SEMANTIC_COUNT_KEYS: QuestExplorerSemanticDiagnosticCountKey[] = [
    "setup_task",
    "deterministic_continuation",
    "explicit_decision_option",
    "topology_fork_option",
    "convergence",
    "terminal",
    "failure",
    "unresolved",
    "internal_variant",
    "unknown",
    "true_choice_groups",
    "topology_forks_without_true_choice",
    "grouped_deterministic_continuation_groups",
    "alias_owned_stages",
    "chapter_variants",
    "lore_ownership_gaps",
    "objective_ownership_gaps",
];

const SEMANTIC_COUNT_LABELS: Record<QuestExplorerSemanticDiagnosticCountKey, string> = {
    setup_task: "setup/artifact rows",
    deterministic_continuation: "deterministic continuations",
    explicit_decision_option: "explicit decision options",
    topology_fork_option: "topology fork rows",
    convergence: "convergence states",
    terminal: "terminal states",
    failure: "failure states/links",
    unresolved: "unresolved continuations",
    internal_variant: "internal variants",
    unknown: "unknown rows",
    true_choice_groups: "true-choice groups",
    topology_forks_without_true_choice: "topology forks without true_choice",
    grouped_deterministic_continuation_groups: "grouped deterministic continuation groups",
    alias_owned_stages: "alias-owned stages",
    chapter_variants: "chapter variants",
    lore_ownership_gaps: "lore ownership gaps",
    objective_ownership_gaps: "objective ownership gaps",
};

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

function emptySemanticCounts(): QuestExplorerSemanticDiagnosticCounts {
    return Object.fromEntries(SEMANTIC_COUNT_KEYS.map((key) => [key, 0])) as QuestExplorerSemanticDiagnosticCounts;
}

function branchSemanticGroupKey(entryKey: string, branch: QuestBranch): string {
    return [
        entryKey,
        branch.choiceGroupKey ?? branch.groupKey ?? "ungrouped",
        branch.branchStepOrder ?? branch.orderIndex ?? "unordered",
    ].join(":");
}

function hasValues(values: unknown[] | null | undefined): boolean {
    return Boolean(values?.length);
}

function canonicalDiagnosticStageKind(branch: QuestBranch, siblingBranches: QuestBranch[]): QuestSemanticStageKind {
    const classified = classifyQuestBranchSemanticStage(branch, siblingBranches);
    if (classified === "unknown" && hasValues(branch.convergesIntoEntryKeys)) return "convergence";
    return classified;
}

function addMissingOwnerReferences(
    ownerKeys: string[] | undefined,
    knownKeys: Set<string>
): number {
    return (ownerKeys ?? []).filter((key) => key && !knownKeys.has(key)).length;
}

function addMissingBranchPathReferences(
    paths: string[][] | undefined,
    knownBranchKeys: Set<string>
): number {
    return (paths ?? []).reduce((total, path) => (
        total + path.filter((branchKey) => branchKey && !knownBranchKeys.has(branchKey)).length
    ), 0);
}

function semanticCounts(
    entries: QuestExplorerEntry[],
    progression: QuestExplorerProgression | null
): QuestExplorerSemanticDiagnosticCounts {
    const counts = emptySemanticCounts();
    const knownBranchKeys = new Set<string>();
    const knownChoiceKeys = new Set<string>();
    const groupedStages = new Map<string, {
        deterministicContinuations: number;
        explicitDecisionOptions: number;
        topologyForkOptions: number;
    }>();

    for (const entry of entries) {
        for (const branch of entry.branches) {
            knownBranchKeys.add(branch.branchKey);
            if (branch.choiceKey) knownChoiceKeys.add(branch.choiceKey);
        }
    }

    for (const entry of entries) {
        for (const branch of entry.branches) {
            const kind = canonicalDiagnosticStageKind(branch, entry.branches);
            counts[kind] += 1;

            const groupKey = branchSemanticGroupKey(entry.entryKey, branch);
            const group = groupedStages.get(groupKey) ?? {
                deterministicContinuations: 0,
                explicitDecisionOptions: 0,
                topologyForkOptions: 0,
            };
            if (kind === "deterministic_continuation") group.deterministicContinuations += 1;
            if (kind === "explicit_decision_option") group.explicitDecisionOptions += 1;
            if (kind === "topology_fork_option") group.topologyForkOptions += 1;
            groupedStages.set(groupKey, group);
        }

        for (const section of entry.loreView.sections) {
            counts.lore_ownership_gaps += section.choiceKey && !knownChoiceKeys.has(section.choiceKey) ? 1 : 0;
            counts.lore_ownership_gaps += addMissingOwnerReferences(section.revealedByBranchKeys, knownBranchKeys);
            counts.lore_ownership_gaps += addMissingOwnerReferences(section.revealedByChoiceKeys, knownChoiceKeys);
            counts.lore_ownership_gaps += addMissingBranchPathReferences(section.revealedByBranchPathAlternatives, knownBranchKeys);
        }

        for (const objective of entry.strategyView.objectives) {
            counts.objective_ownership_gaps += addMissingOwnerReferences(objective.revealedByBranchKeys, knownBranchKeys);
            counts.objective_ownership_gaps += addMissingOwnerReferences(objective.revealedByChoiceKeys, knownChoiceKeys);
            counts.objective_ownership_gaps += addMissingBranchPathReferences(objective.revealedByBranchPathAlternatives, knownBranchKeys);
        }
    }

    for (const group of groupedStages.values()) {
        if (group.explicitDecisionOptions >= 2) counts.true_choice_groups += 1;
        if (group.topologyForkOptions >= 2 && group.explicitDecisionOptions === 0) {
            counts.topology_forks_without_true_choice += 1;
        }
        if (
            group.deterministicContinuations >= 2
            && group.explicitDecisionOptions === 0
            && group.topologyForkOptions === 0
        ) {
            counts.grouped_deterministic_continuation_groups += 1;
        }
    }

    for (const questline of progression?.questlines ?? []) {
        for (const chapter of questline.chapters) {
            for (const step of chapter.steps) {
                if (step.projectionKind === "virtual_alias_expanded" || step.aliasEntryKeys.length > 0) {
                    counts.alias_owned_stages += 1;
                }

                for (const variant of step.variants) {
                    if (variant.variantKind === "branch_variant") {
                        counts.internal_variant += 1;
                        counts.chapter_variants += 1;
                    }
                }
            }
        }
    }

    return counts;
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
            message: `Internal/chapter variants are visible as rail rows: ${railRows.join(", ")}`,
        });
        return;
    }

    findings.push({
        classification: "accepted modeled artifact",
        message: branchKeys.size === 0
            ? "No internal/chapter variant DTO rows are present in this diagnostic payload."
            : `Internal/chapter variants stay in detail/chronicle context, not rail rows (${branchKeys.size} variant(s)).`,
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
            message: "No repeated detailEntryKey projection stages are present in this diagnostic payload.",
        });
        return;
    }

    for (const [detailEntryKey, steps] of repeated) {
        const hasVirtualAliasExpandedStep = steps.some((step) => step.projectionKind === "virtual_alias_expanded" || step.aliasEntryKeys.length > 0);
        findings.push({
            classification: hasVirtualAliasExpandedStep ? "accepted modeled artifact" : "warning",
            message: hasVirtualAliasExpandedStep
                ? `Repeated detailEntryKey ${detailEntryKey} is represented as alias-owned projection content across ${steps.length} progression projection stage(s).`
                : `Repeated detailEntryKey ${detailEntryKey} lacks explicit alias-owned projection metadata across ${steps.length} progression projection stage(s).`,
        });
    }
}

function addSemanticTaxonomyFindings(
    findings: QuestExplorerDiagnosticFinding[],
    counts: QuestExplorerSemanticDiagnosticCounts
) {
    findings.push({
        classification: "accepted modeled artifact",
        message: "Canonical semantic taxonomy summary recorded for semantic rows, internal variants, aliases, lore ownership, and objective ownership.",
    });

    if (counts.lore_ownership_gaps > 0) {
        findings.push({
            classification: "warning",
            message: `Lore ownership gaps: ${counts.lore_ownership_gaps} owner reference(s) do not match exported branch/choice keys.`,
        });
    }

    if (counts.objective_ownership_gaps > 0) {
        findings.push({
            classification: "warning",
            message: `Objective ownership gaps: ${counts.objective_ownership_gaps} owner reference(s) do not match exported branch/choice keys.`,
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
        ["internal/chapter variants without parent projection", debug.suspiciousBranchVariantsWithoutParentStep.length],
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

function formatSemanticCounts(counts: QuestExplorerSemanticDiagnosticCounts): string[] {
    return [
        "Canonical semantic taxonomy:",
        "  reference: docs/quest_explorer_canonical_semantics_v1.md",
        ...SEMANTIC_COUNT_KEYS.map((key) => `  ${SEMANTIC_COUNT_LABELS[key]}: ${counts[key]}`),
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
    const canonicalCounts = semanticCounts(entries, progression);
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
    addSemanticTaxonomyFindings(findings, canonicalCounts);
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
        ...formatSemanticCounts(canonicalCounts),
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
        semanticCounts: canonicalCounts,
        selectedRailItem,
        railExamples: examples,
        findings,
        reportText,
    };
}
