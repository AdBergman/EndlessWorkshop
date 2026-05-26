import type { QuestBranch } from "@/types/questTypes";

export type QuestSemanticStageKind =
    | "setup_task"
    | "deterministic_continuation"
    | "explicit_decision_option"
    | "topology_fork_option"
    | "convergence"
    | "terminal"
    | "failure"
    | "unresolved"
    | "internal_variant"
    | "unknown";

type QuestSemanticStageRow = {
    sectionRole?: string | null;
    branchKey?: string | null;
    choiceKey?: string | null;
    choiceGroupKey?: string | null;
    groupKey?: string | null;
    groupLabel?: string | null;
    parentBranchKey?: string | null;
    parentChoiceKey?: string | null;
    prerequisiteBranchKeys?: string[];
    prerequisiteBranchPath?: string[];
    revealedByBranchKeys?: string[];
    revealedByChoiceKeys?: string[];
    revealedByBranchPathAlternatives?: string[][];
    nextEntryKeys?: string[];
    failureEntryKeys?: string[];
    convergesIntoEntryKeys?: string[];
    convergenceGroupKey?: string | null;
    branchStepOrder?: number | null;
};

type QuestSemanticStageContext = {
    isInternalVariant?: boolean;
    siblingRows?: QuestSemanticStageRow[];
};

function cleanRole(value: string | null | undefined): string | null {
    return value?.trim().toLowerCase() || null;
}

function hasValues(values: unknown[] | null | undefined): boolean {
    return Boolean(values?.length);
}

function rowGroupKey(row: QuestSemanticStageRow): string | null {
    return row.choiceGroupKey || row.groupKey || null;
}

function hasParentOrPrerequisite(row: QuestSemanticStageRow): boolean {
    return Boolean(
        row.parentBranchKey
        || row.parentChoiceKey
        || hasValues(row.prerequisiteBranchKeys)
        || hasValues(row.prerequisiteBranchPath)
        || hasValues(row.revealedByBranchKeys)
        || hasValues(row.revealedByChoiceKeys)
        || hasValues(row.revealedByBranchPathAlternatives)
    );
}

function hasNonFailureLink(row: QuestSemanticStageRow): boolean {
    return Boolean(hasValues(row.nextEntryKeys) || hasValues(row.convergesIntoEntryKeys) || row.convergenceGroupKey);
}

function hasOnlyFailureLink(row: QuestSemanticStageRow): boolean {
    return hasValues(row.failureEntryKeys) && !hasNonFailureLink(row);
}

function isGroupedTopologyAlternative(
    row: QuestSemanticStageRow,
    siblingRows: QuestSemanticStageRow[] | undefined
): boolean {
    if (!hasNonFailureLink(row) && !hasValues(row.failureEntryKeys)) return false;

    const groupKey = rowGroupKey(row);
    if (!groupKey || !siblingRows?.length) return false;

    const grouped = siblingRows.filter((candidate) => rowGroupKey(candidate) === groupKey);
    if (grouped.length < 2) return false;

    return grouped.some((candidate) => (
        candidate.branchKey !== row.branchKey
        && cleanRole(candidate.sectionRole) !== "true_choice"
    ));
}

export function classifyQuestSemanticStage(
    row: QuestSemanticStageRow,
    context: QuestSemanticStageContext = {}
): QuestSemanticStageKind {
    // Keep this vocabulary additive: rendering still uses the existing path flow,
    // while future adapters can stop treating every row as step -> choice -> step.
    if (context.isInternalVariant) return "internal_variant";

    const role = cleanRole(row.sectionRole);
    if (role === "artifact" || role === "setup") return "setup_task";
    if (role === "true_choice" || role === "decision") return "explicit_decision_option";
    if (role === "continuation") return "deterministic_continuation";
    if (role === "convergence" || row.convergenceGroupKey) return "convergence";
    if (role === "terminal") return "terminal";
    if (role === "failure" || hasOnlyFailureLink(row)) return "failure";
    if (role === "unresolved") return "unresolved";

    if (isGroupedTopologyAlternative(row, context.siblingRows)) {
        return "topology_fork_option";
    }

    if (hasParentOrPrerequisite(row) && hasNonFailureLink(row)) {
        return "deterministic_continuation";
    }

    return "unknown";
}

export function classifyQuestBranchSemanticStage(
    branch: QuestBranch,
    siblingBranches: QuestBranch[] = []
): QuestSemanticStageKind {
    return classifyQuestSemanticStage(branch, { siblingRows: siblingBranches });
}
