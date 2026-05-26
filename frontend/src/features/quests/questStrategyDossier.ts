import type { QuestExplorerEntry, StrategyObjective } from "@/types/questTypes";
import type {
    QuestPathChoice,
    QuestPathChoiceSelection,
    QuestPathFlow,
    RenderedPathStep,
} from "@/features/quests/questPathFlow";
import { phaseDisplayLabel } from "@/features/quests/questDisplay";
import type { QuestSemanticStageKind } from "@/features/quests/questSemanticStages";
import {
    rewardDisplayTexts,
    rewardDisplaysFromRewards,
    uniqueRewardDisplays,
    type QuestRewardDisplay,
} from "@/features/quests/questRewardDisplay";
import {
    requirementDisplayTexts,
    requirementDisplaysFromRequirements,
    requirementDisplaysFromText,
    sameRequirementDisplays,
    uniqueRequirementDisplays,
    type QuestRequirementDisplay,
} from "@/features/quests/questRequirementDisplay";

export type StrategyDossierObjectiveScope = {
    objectives: StrategyObjective[];
    objectiveIndexOffset: number;
};

export type StrategyDossierObjective = {
    id: string;
    phaseLabel: string;
    label: string;
    text: string;
    requirements: string[];
    requirementDetails: QuestRequirementDisplay[];
    rewards: string[];
    rewardDetails: QuestRewardDisplay[];
};

export type StrategyDossierOutcome = {
    title: string;
    lines: string[];
    requirements: string[];
    requirementDetails: QuestRequirementDisplay[];
    rewards: string[];
    rewardDetails: QuestRewardDisplay[];
    objectives: StrategyDossierObjective[];
};

export type StrategyDossierMarkerKind = "leads" | "converges" | "failure" | "unresolved";

export type StrategyDossierMarker = {
    kind: StrategyDossierMarkerKind;
    label: string;
    detail: string;
};

export type StrategyPathStatusKind =
    | "awaiting-choice"
    | "continues-in-chapter"
    | "chapter-exit"
    | "converges"
    | "failure"
    | "unresolved"
    | "complete";

export type StrategyPathStatus = {
    kind: StrategyPathStatusKind;
    label: string;
    title: string;
    description: string;
    choiceLabel: string | null;
    targetLabel: string | null;
    markers: StrategyDossierMarker[];
};

export type StrategyDossierSelectedPathStep = {
    id: string;
    label: string;
    stepLabel: string;
    isCurrent: boolean;
};

export type StrategyDossierBranchOption = {
    id: string;
    choice: QuestPathChoice;
    label: string;
    eyebrow: string;
    outcomeLines: string[];
    requirements: string[];
    requirementDetails: QuestRequirementDisplay[];
    rewards: string[];
    rewardDetails: QuestRewardDisplay[];
    leadsTo: string[];
    markers: StrategyDossierMarker[];
    isSelected: boolean;
    isInSelectedPath: boolean;
};

export type StrategyDossierBranchComparisonGroup = {
    id: string;
    label: string;
    options: StrategyDossierBranchOption[];
};

export type StrategyDossierBranchComparison = {
    groups: StrategyDossierBranchComparisonGroup[];
    emptyLabel: string;
    selectedOption: StrategyDossierBranchOption | null;
};

export type StrategyDossierSemanticInterpretation = {
    currentTask: StrategyDossierBranchOption | null;
    decisionGroup: StrategyDossierBranchComparison;
    continuation: StrategyDossierBranchOption | null;
    topologyAlternatives: StrategyDossierBranchOption[];
    outcomePreview: StrategyDossierOutcome | null;
    continuationStatus: StrategyPathStatus;
};

export type StrategyDossierDecision = {
    title: string;
    description: string;
};

export type StrategyContinuityStripItemKind =
    | "step"
    | "decision"
    | "outcome"
    | "transition"
    | "stop";

export type StrategyContinuityStripItem = {
    id: string;
    kind: StrategyContinuityStripItemKind;
    eyebrow: string;
    title: string;
    detail: string | null;
    markers: StrategyDossierMarker[];
    isCurrent: boolean;
    isSelectedPath: boolean;
    isDecisionPoint: boolean;
    isTerminal: boolean;
};

export type StrategyContinuityStrip = {
    summary: string;
    statusKind: StrategyPathStatusKind;
    items: StrategyContinuityStripItem[];
};

export type StrategyDossierModel = {
    brief: {
        title: string;
        stepLabel: string;
        totalSteps: number;
        summaryLines: string[];
    };
    decision: StrategyDossierDecision;
    objectives: StrategyDossierObjective[];
    requirements: string[];
    requirementDetails: QuestRequirementDisplay[];
    rewards: string[];
    rewardDetails: QuestRewardDisplay[];
    selectedPathSteps: StrategyDossierSelectedPathStep[];
    projectedOutcome: StrategyDossierOutcome | null;
    markers: StrategyDossierMarker[];
    currentTask: StrategyDossierBranchOption | null;
    decisionGroup: StrategyDossierBranchComparison;
    continuation: StrategyDossierBranchOption | null;
    topologyAlternatives: StrategyDossierBranchOption[];
    outcomePreview: StrategyDossierOutcome | null;
    continuationStatus: StrategyPathStatus;
    branchComparison: StrategyDossierBranchComparison;
    pathStatus: StrategyPathStatus;
    continuityStrip: StrategyContinuityStrip;
};

export function buildStrategyDossierModel({
    renderedStep,
    totalSteps,
    title,
    displayEntry,
    objectiveScope,
    revealedObjectiveScope,
    flow,
    entriesByKey,
    usesObjectivePaths,
    comparisonChoices = renderedStep.choices,
}: {
    renderedStep: RenderedPathStep;
    totalSteps: number;
    title: string;
    displayEntry: QuestExplorerEntry | null;
    objectiveScope: StrategyDossierObjectiveScope | null;
    revealedObjectiveScope: StrategyDossierObjectiveScope | null;
    flow: QuestPathFlow;
    entriesByKey: Record<string, QuestExplorerEntry>;
    usesObjectivePaths: boolean;
    comparisonChoices?: QuestPathChoice[];
}): StrategyDossierModel {
    const objectives = objectiveScope
        ? buildStrategyDossierObjectives(objectiveScope, displayEntry, usesObjectivePaths)
        : [];
    const selectedChoice = choiceForSelection(renderedStep, renderedStep.selectedChoice);
    const selectedPathSteps = selectedPathForFlow(flow);
    const projectedOutcome = buildProjectedOutcome(
        renderedStep,
        selectedChoice,
        revealedObjectiveScope,
        displayEntry,
        usesObjectivePaths
    );
    const pathStatus = buildStrategyPathStatus(flow, entriesByKey);
    const semanticInterpretation = buildStrategySemanticInterpretation(
        renderedStep,
        comparisonChoices,
        flow,
        entriesByKey,
        projectedOutcome,
        pathStatus
    );
    const requirementDetails = uniqueRequirementDisplays(objectives.flatMap((objective) => objective.requirementDetails));
    const rewardDetails = uniqueRewardDisplays(objectives.flatMap((objective) => objective.rewardDetails));

    return {
        brief: {
            title,
            stepLabel: stepDossierLabel(renderedStep),
            totalSteps,
            summaryLines: displayEntry?.summaryLines.filter(Boolean) ?? [],
        },
        decision: buildStrategyDecision(semanticInterpretation.decisionGroup),
        objectives,
        requirements: requirementDisplayTexts(requirementDetails),
        requirementDetails,
        rewards: rewardDisplayTexts(rewardDetails),
        rewardDetails,
        selectedPathSteps,
        projectedOutcome,
        markers: buildMarkers(renderedStep, selectedChoice, flow, entriesByKey),
        currentTask: semanticInterpretation.currentTask,
        decisionGroup: semanticInterpretation.decisionGroup,
        continuation: semanticInterpretation.continuation,
        topologyAlternatives: semanticInterpretation.topologyAlternatives,
        outcomePreview: semanticInterpretation.outcomePreview,
        continuationStatus: semanticInterpretation.continuationStatus,
        branchComparison: semanticInterpretation.decisionGroup,
        pathStatus,
        continuityStrip: buildStrategyContinuityStrip(flow, entriesByKey),
    };
}

export function buildStrategySemanticInterpretation(
    renderedStep: RenderedPathStep,
    choices: QuestPathChoice[],
    flow: QuestPathFlow,
    entriesByKey: Record<string, QuestExplorerEntry>,
    outcomePreview: StrategyDossierOutcome | null,
    continuationStatus: StrategyPathStatus
): StrategyDossierSemanticInterpretation {
    const branchOptions = buildStrategyBranchOptions(renderedStep, choices, entriesByKey);
    const decisionGroup = buildBranchComparisonFromOptions(
        renderedStep,
        branchOptions.filter((option) => isStrategyDecisionComparisonCandidate(option.choice)),
        flow
    );
    const continuationOptions = branchOptions.filter((option) => (
        option.choice.semanticStageKind === "deterministic_continuation"
    ));
    const topologyAlternatives = branchOptions.filter((option) => (
        option.choice.semanticStageKind === "topology_fork_option"
    ));

    return {
        currentTask: currentTaskOption(branchOptions, decisionGroup),
        decisionGroup,
        continuation: selectedOrFirstOption(continuationOptions),
        topologyAlternatives,
        outcomePreview,
        continuationStatus,
    };
}

export function buildStrategyContinuityStrip(
    flow: QuestPathFlow,
    entriesByKey: Record<string, QuestExplorerEntry>
): StrategyContinuityStrip {
    const status = buildStrategyPathStatus(flow, entriesByKey);
    const items: StrategyContinuityStripItem[] = [];

    for (const renderedStep of flow.renderedSteps) {
        const selectedChoice = choiceForSelection(
            renderedStep,
            renderedStep.selectedChoice ?? renderedStep.currentBeatChoice
        );
        const decisionChoices = decisionChoicesForStep(renderedStep.choices);
        const hasDecisionPoint = decisionChoices.length > 0;
        const selectedDecisionChoice = selectedChoice?.semanticStageKind === "explicit_decision_option"
            ? selectedChoice
            : null;
        const selectedSequenceTouchesStage = Boolean(
            selectedChoice
            || renderedStep.currentBeatChoice
            || renderedStep.selectedChoice
            || renderedStep.revealedContinuations.length > 0
        );

        items.push({
            id: `${renderedStep.step.stepKey}:step`,
            kind: "step",
            eyebrow: stepDossierLabel(renderedStep),
            title: renderedStep.displayEntry?.title ?? renderedStep.step.title,
            detail: stepStripDetail(renderedStep, selectedSequenceTouchesStage),
            markers: [],
            isCurrent: renderedStep.isActive,
            isSelectedPath: selectedSequenceTouchesStage,
            isDecisionPoint: hasDecisionPoint,
            isTerminal: false,
        });

        if (hasDecisionPoint || selectedDecisionChoice) {
            const markers = selectedDecisionChoice ? markersForChoice(selectedDecisionChoice, entriesByKey) : [];
            const pendingDecisionId = decisionChoices[0]?.choiceGroupKey
                ?? decisionChoices[0]?.groupKey
                ?? decisionChoices[0]?.id
                ?? "pending";
            items.push({
                id: `${renderedStep.step.stepKey}:decision:${selectedDecisionChoice?.id ?? pendingDecisionId}`,
                kind: "decision",
                eyebrow: "Decision",
                title: selectedDecisionChoice?.label ?? decisionTitleForChoices(decisionChoices),
                detail: selectedDecisionChoice
                    ? "Selected decision"
                    : decisionDetailForChoices(decisionChoices),
                markers,
                isCurrent: renderedStep.isActive,
                isSelectedPath: Boolean(selectedDecisionChoice),
                isDecisionPoint: true,
                isTerminal: false,
            });
        }

        const revealedContinuations = uniqueChoices(renderedStep.revealedContinuations);
        if (revealedContinuations.length > 0) {
            items.push({
                id: `${renderedStep.step.stepKey}:outcome:${revealedContinuations.map((choice) => choice.id).join("|")}`,
                kind: "outcome",
                eyebrow: "Outcome preview",
                title: revealedContinuations.length === 1
                    ? revealedContinuations[0].label
                    : "Outcome previews",
                detail: stripChoiceLines(revealedContinuations),
                markers: uniqueMarkers(revealedContinuations.flatMap((choice) => (
                    markersForChoice(choice, entriesByKey, { includeUnresolved: false })
                ))),
                isCurrent: renderedStep.isActive,
                isSelectedPath: true,
                isDecisionPoint: false,
                isTerminal: false,
            });
        }
    }

    const terminalItem = terminalContinuityStripItem(status);
    if (terminalItem) {
        items.push(terminalItem);
    }

    return {
        summary: stripSummaryForStatus(status),
        statusKind: status.kind,
        items,
    };
}

export function buildStrategyPathStatus(
    flow: QuestPathFlow,
    entriesByKey: Record<string, QuestExplorerEntry>
): StrategyPathStatus {
    const selectedChoices = selectedChoicesForFlow(flow);
    const unresolvedChoice = flow.unresolvedContinuation
        ? choiceForSelectionInFlow(flow, flow.unresolvedContinuation)
        : null;
    const statusChoice = unresolvedChoice ?? selectedChoices.at(-1) ?? null;
    const latestChoiceMarkers = statusChoice
        ? markersForChoice(statusChoice, entriesByKey, { includeUnresolved: false })
        : [];
    const failureMarker = latestChoiceMarkers.find((marker) => marker.kind === "failure") ?? null;
    const convergenceMarker = latestChoiceMarkers.find((marker) => marker.kind === "converges") ?? null;
    const unresolvedMarker = latestChoiceMarkers.find((marker) => marker.kind === "unresolved") ?? null;
    const terminalStep = flow.renderedSteps.at(-1) ?? null;
    const hasSelectedPath = selectedChoices.length > 0;
    const hasPendingTerminalChoice = Boolean(terminalStep && terminalStep.choices.length > 0 && !terminalStep.selectedChoice);

    if (failureMarker) {
        return {
            kind: "failure",
            label: "Failure",
            title: "Selected sequence enters a failure outcome",
            description: `The simulated sequence resolves into ${failureMarker.detail}. Review the failure branch before comparing alternate options.`,
            choiceLabel: statusChoice?.label ?? null,
            targetLabel: failureMarker.detail,
            markers: uniqueMarkers([failureMarker, ...latestChoiceMarkers.filter((marker) => marker.kind !== "failure")]),
        };
    }

    if (convergenceMarker) {
        return {
            kind: "converges",
            label: "Rejoins progression",
            title: "Selected sequence rejoins the main progression",
            description: `The simulated sequence rejoins at ${convergenceMarker.detail}. Alternate branches may rejoin this same point.`,
            choiceLabel: statusChoice?.label ?? null,
            targetLabel: convergenceMarker.detail,
            markers: uniqueMarkers([convergenceMarker, ...latestChoiceMarkers.filter((marker) => marker.kind !== "converges")]),
        };
    }

    if (flow.unresolvedContinuation || statusChoice?.semanticStageKind === "unresolved" || unresolvedMarker) {
        const choiceLabel = flow.unresolvedContinuation?.label ?? statusChoice?.label ?? "selected branch";
        return {
            kind: "unresolved",
            label: "Unknown continuation",
            title: "Continuation is not identified",
            description: `The selected semantic row "${choiceLabel}" is modeled, but the archive does not identify the next continuation. The dossier stops here rather than guessing.`,
            choiceLabel,
            targetLabel: null,
            markers: [{
                kind: "unresolved",
                label: "Unknown continuation",
                detail: unresolvedMarker?.detail ?? "No explicit next continuation is modeled for this branch.",
            }],
        };
    }

    if (flow.reachedContinuationEntryKey) {
        const targetLabel = entryLabel(flow.reachedContinuationEntryKey, entriesByKey);
        return {
            kind: "chapter-exit",
            label: "Leaves Chapter",
            title: "Selected sequence leaves this chapter",
            description: `Continue strategy planning from ${targetLabel}. This dossier remains scoped to the current chapter.`,
            choiceLabel: statusChoice?.label ?? null,
            targetLabel,
            markers: markersForEntryKeys("leads", "Leads To", [flow.reachedContinuationEntryKey], entriesByKey),
        };
    }

    if (!hasSelectedPath) {
        return {
            kind: "awaiting-choice",
            label: "Awaiting Choice",
            title: "Choose a path to simulate",
            description: "Select a decision option to reveal the next strategic outcome for this chapter.",
            choiceLabel: null,
            targetLabel: null,
            markers: [],
        };
    }

    if (hasPendingTerminalChoice && terminalStep) {
        const targetLabel = `${stepDossierLabel(terminalStep)}: ${terminalStep.displayEntry?.title ?? terminalStep.step.title}`;
        return {
            kind: "continues-in-chapter",
            label: "Continues",
            title: "Selected sequence reaches another decision in this chapter",
            description: `Continue simulation from ${targetLabel}. The dossier is waiting at the next modeled decision point.`,
            choiceLabel: statusChoice?.label ?? null,
            targetLabel,
            markers: latestChoiceMarkers,
        };
    }

    const terminalLabel = terminalStep
        ? `${stepDossierLabel(terminalStep)}: ${terminalStep.displayEntry?.title ?? terminalStep.step.title}`
        : null;

    return {
        kind: "complete",
        label: "No further modeled decision",
        title: "No further modeled decision in this chapter",
        description: terminalLabel
            ? `The selected sequence currently resolves at ${terminalLabel}. No additional explicit decision, convergence, failure, or chapter exit is modeled from here.`
            : "The selected sequence has no additional modeled explicit decision, convergence, failure, or chapter exit.",
        choiceLabel: statusChoice?.label ?? null,
        targetLabel: terminalLabel,
        markers: latestChoiceMarkers,
    };
}

function stepStripDetail(renderedStep: RenderedPathStep, selectedSequenceTouchesStage: boolean): string {
    if (renderedStep.isActive) return "Current stage";
    if (selectedSequenceTouchesStage) return "Selected sequence stage";
    return "Projected stage";
}

function decisionChoicesForStep(choices: QuestPathChoice[]): QuestPathChoice[] {
    const groups = new Map<string, QuestPathChoice[]>();
    choices
        .filter(isStrategyDecisionComparisonCandidate)
        .forEach((choice) => {
            const groupId = strategyComparisonGroupId(choice);
            const group = groups.get(groupId) ?? [];
            group.push(choice);
            groups.set(groupId, group);
        });

    return [...groups.values()]
        .filter((group) => group.length > 1)
        .flat();
}

function isStrategyDecisionComparisonCandidate(choice: QuestPathChoice): boolean {
    if (choice.semanticStageKind === "explicit_decision_option") return true;
    if (choice.sectionRole) return false;

    return choice.semanticStageKind === "unknown"
        || choice.semanticStageKind === "convergence"
        || choice.semanticStageKind === "terminal"
        || choice.semanticStageKind === "failure"
        || choice.semanticStageKind === "unresolved";
}

function decisionTitleForChoices(choices: QuestPathChoice[]): string {
    if (choices.length === 1) return "Decision Available";
    return `${choices.length} Options Available`;
}

function decisionDetailForChoices(choices: QuestPathChoice[]): string {
    if (choices.length === 0) return "No active options at this point.";
    if (choices.length === 1) return "Select the available path to continue simulation.";
    return "Choose one option to project this chapter path.";
}

function stripChoiceLines(choices: QuestPathChoice[]): string | null {
    const lines = uniqueStrings(choices.flatMap((choice) => choiceLines(choice)));
    if (lines.length > 0) return lines.join(" ");
    if (choices.length === 1) return choices[0].targetSummaryLine;
    return null;
}

function terminalContinuityStripItem(status: StrategyPathStatus): StrategyContinuityStripItem | null {
    if (status.kind === "awaiting-choice" || status.kind === "continues-in-chapter") return null;

    const isTransition = status.kind === "chapter-exit" || status.kind === "converges";
    return {
        id: `terminal:${status.kind}:${status.targetLabel ?? status.choiceLabel ?? status.label}`,
        kind: isTransition ? "transition" : "stop",
        eyebrow: status.label,
        title: status.title,
        detail: status.targetLabel ?? terminalStripDetail(status),
        markers: status.markers,
        isCurrent: false,
        isSelectedPath: true,
        isDecisionPoint: false,
        isTerminal: true,
    };
}

function stripSummaryForStatus(status: StrategyPathStatus): string {
    switch (status.kind) {
        case "awaiting-choice":
            return "The chapter path is waiting at the active decision.";
        case "continues-in-chapter":
            return "The selected sequence reaches another modeled decision in this chapter.";
        case "chapter-exit":
            return "The selected sequence leaves this chapter.";
        case "converges":
            return "The selected sequence rejoins a modeled convergence point.";
        case "failure":
            return "The selected sequence enters a modeled failure outcome.";
        case "unresolved":
            return "The selected sequence stops where the archive lacks an explicit continuation.";
        case "complete":
            return "The selected sequence has no further modeled decision in this chapter.";
    }
}

function terminalStripDetail(status: StrategyPathStatus): string | null {
    switch (status.kind) {
        case "failure":
            return "Failure branch";
        case "unresolved":
            return status.choiceLabel ? `After ${status.choiceLabel}` : "No explicit next step is modeled.";
        case "complete":
            return status.targetLabel;
        default:
            return status.targetLabel;
    }
}

export function buildStrategyBranchOptions(
    renderedStep: RenderedPathStep,
    choices: QuestPathChoice[],
    entriesByKey: Record<string, QuestExplorerEntry>
): StrategyDossierBranchOption[] {
    const selectedContextBranchKeys = selectedContextBranchKeysForStep(renderedStep);

    return choices.map((choice): StrategyDossierBranchOption => ({
        id: choice.id,
        choice,
        label: choice.label,
        eyebrow: choice.eyebrow,
        outcomeLines: choiceLines(choice),
        requirements: choice.requirementLines,
        requirementDetails: choice.requirementDetails ?? requirementDisplaysFromText(choice.requirementLines),
        rewards: choice.rewardLines,
        rewardDetails: choice.rewardDetails,
        leadsTo: leadsToForChoice(choice, entriesByKey),
        markers: markersForChoice(choice, entriesByKey),
        isSelected: renderedStep.selectedChoice?.choiceId === choice.id,
        isInSelectedPath: Boolean(choice.branchKey && selectedContextBranchKeys.has(choice.branchKey)),
    }));
}

function buildBranchComparisonFromOptions(
    renderedStep: RenderedPathStep,
    options: StrategyDossierBranchOption[],
    flow: QuestPathFlow
): StrategyDossierBranchComparison {
    const groups = new Map<string, StrategyDossierBranchComparisonGroup>();

    for (const option of options) {
        const choice = option.choice;
        const groupId = strategyComparisonGroupId(choice);
        const group = groups.get(groupId) ?? {
            id: groupId,
            label: strategyComparisonGroupLabel(choice),
            options: [],
        };

        group.options.push(option);
        groups.set(groupId, group);
    }

    const comparisonGroups = [...groups.values()].filter((group) => group.options.length > 1);

    return {
        groups: comparisonGroups,
        emptyLabel: branchComparisonEmptyLabel(renderedStep, flow),
        selectedOption: comparisonGroups
            .flatMap((group) => group.options)
            .find((option) => option.isSelected)
            ?? null,
    };
}

function currentTaskOption(
    options: StrategyDossierBranchOption[],
    decisionGroup: StrategyDossierBranchComparison
): StrategyDossierBranchOption | null {
    if (decisionGroup.groups.length > 0) return null;

    return selectedOrFirstOption(options.filter((option) => (
        option.choice.semanticStageKind === "deterministic_continuation"
    )))
        ?? selectedOrFirstOption(options.filter((option) => (
            option.choice.semanticStageKind === "setup_task"
            || option.choice.semanticStageKind === "explicit_decision_option"
            || isTerminalSemanticStage(option.choice.semanticStageKind)
        )))
        ?? (options.length === 1 ? options[0] : null);
}

function selectedOrFirstOption(options: StrategyDossierBranchOption[]): StrategyDossierBranchOption | null {
    return options.find((option) => option.isSelected || option.isInSelectedPath) ?? options[0] ?? null;
}

function isTerminalSemanticStage(kind: QuestSemanticStageKind): boolean {
    return kind === "convergence"
        || kind === "terminal"
        || kind === "failure"
        || kind === "unresolved";
}

function buildStrategyDecision(
    branchComparison: StrategyDossierBranchComparison
): StrategyDossierDecision {
    if (branchComparison.groups.length === 0) {
        return {
            title: "No active decision",
            description: branchComparison.emptyLabel,
        };
    }

    const groupLabels = uniqueStrings(branchComparison.groups.map((group) => group.label));
    return {
        title: groupLabels.length === 1 ? groupLabels[0] : "Compare decision options",
        description: branchComparison.selectedOption
            ? "Review the selected decision option or choose another option to compare its result."
            : "Select an option to simulate its requirements, rewards, projected outcome, and continuation.",
    };
}

function buildProjectedOutcome(
    renderedStep: RenderedPathStep,
    selectedChoice: QuestPathChoice | null,
    revealedObjectiveScope: StrategyDossierObjectiveScope | null,
    displayEntry: QuestExplorerEntry | null,
    usesObjectivePaths: boolean
): StrategyDossierOutcome | null {
    const outcomeChoices = renderedStep.revealedContinuations.length > 0
        ? renderedStep.revealedContinuations
        : selectedChoice
            ? [selectedChoice]
            : [];
    const outcomeObjectives = revealedObjectiveScope
        ? buildStrategyDossierObjectives(revealedObjectiveScope, displayEntry, usesObjectivePaths)
        : [];

    if (outcomeChoices.length === 0 && outcomeObjectives.length === 0) return null;

    const title = outcomeChoices.length === 1
        ? outcomeChoices[0].label
        : outcomeChoices.length > 1
            ? "Projected Path Outcomes"
            : "Projected Objective";
    const lines = uniqueStrings(outcomeChoices.flatMap((choice) => choiceLines(choice)));
    const requirementDetails = uniqueRequirementDisplays([
        ...outcomeChoices.flatMap((choice) => choice.requirementDetails ?? requirementDisplaysFromText(choice.requirementLines)),
        ...outcomeObjectives.flatMap((objective) => objective.requirementDetails),
    ]);
    const rewardDetails = uniqueRewardDisplays([
        ...outcomeChoices.flatMap((choice) => choice.rewardDetails),
        ...outcomeObjectives.flatMap((objective) => objective.rewardDetails),
    ]);

    return {
        title,
        lines,
        requirements: requirementDisplayTexts(requirementDetails),
        requirementDetails,
        rewards: rewardDisplayTexts(rewardDetails),
        rewardDetails,
        objectives: outcomeObjectives,
    };
}

function buildMarkers(
    renderedStep: RenderedPathStep,
    selectedChoice: QuestPathChoice | null,
    flow: QuestPathFlow,
    entriesByKey: Record<string, QuestExplorerEntry>
): StrategyDossierMarker[] {
    const markers: StrategyDossierMarker[] = [];
    const markerChoices = uniqueChoices([
        selectedChoice,
        ...renderedStep.revealedContinuations,
    ].filter((choice): choice is QuestPathChoice => Boolean(choice)));

    for (const choice of markerChoices) {
        markers.push(...markersForChoice(choice, entriesByKey, { includeUnresolved: false }));
    }

    const isTerminalRenderedStep = flow.renderedSteps.at(-1)?.step.stepKey === renderedStep.step.stepKey;

    if (isTerminalRenderedStep && flow.reachedContinuationEntryKey) {
        markers.push(...markersForEntryKeys(
            "leads",
            "Leads To",
            [flow.reachedContinuationEntryKey],
            entriesByKey
        ));
    }

    if (isTerminalRenderedStep && flow.unresolvedContinuation) {
        markers.push({
            kind: "unresolved",
            label: "Unknown continuation",
            detail: `The selected sequence "${flow.unresolvedContinuation.label}" is modeled, but no next continuation is identified.`,
        });
    }

    return uniqueMarkers(markers);
}

function markersForChoice(
    choice: QuestPathChoice,
    entriesByKey: Record<string, QuestExplorerEntry>,
    options: { includeUnresolved?: boolean } = {}
): StrategyDossierMarker[] {
    const includeUnresolved = options.includeUnresolved ?? true;
    const markers: StrategyDossierMarker[] = [
        ...markersForEntryKeys("leads", "Leads To", leadEntryKeysForChoice(choice), entriesByKey),
        ...markersForEntryKeys("failure", "Failure", choice.failureEntryKeys, entriesByKey),
        ...markersForEntryKeys("converges", "Rejoins progression", choice.convergesIntoEntryKeys, entriesByKey),
    ];

    if (choice.convergenceGroupKey && choice.convergesIntoEntryKeys.length === 0) {
        markers.push({
            kind: "converges",
            label: "Rejoins progression",
            detail: "This branch rejoins a modeled convergence point.",
        });
    }

    if (includeUnresolved && markers.length === 0 && !choice.hasDependentContinuations) {
        markers.push({
            kind: "unresolved",
            label: "Unknown continuation",
            detail: "No explicit next, failure, or convergence entry is modeled for this option.",
        });
    }

    return uniqueMarkers(markers);
}

export function buildStrategyDossierObjectives(
    scope: StrategyDossierObjectiveScope,
    entry: QuestExplorerEntry | null,
    usesObjectivePaths: boolean
): StrategyDossierObjective[] {
    const entryKey = entry?.entryKey ?? "entry";
    return scope.objectives.map((objective, index) => {
        const requirementDetails = requirementDisplaysFromRequirements(objective.requirements);
        const rewardDetails = rewardDisplaysFromRewards(objective.rewards);

        return {
            id: objective.objectiveKey ?? `${entryKey}:objective:${scope.objectiveIndexOffset + index}`,
            phaseLabel: usesObjectivePaths ? "Pacification Objective" : phaseDisplayLabel(objective.phase),
            label: `Objective ${scope.objectiveIndexOffset + index + 1}`,
            text: objective.text,
            requirements: requirementDisplayTexts(requirementDetails),
            requirementDetails,
            rewards: rewardDisplayTexts(rewardDetails),
            rewardDetails,
        };
    });
}

function selectedPathForFlow(flow: QuestPathFlow): StrategyDossierSelectedPathStep[] {
    const seen = new Set<string>();
    const steps: StrategyDossierSelectedPathStep[] = [];
    let activeChoiceId: string | null = null;

    for (const renderedStep of flow.renderedSteps) {
        if (renderedStep.isActive) {
            activeChoiceId = renderedStep.selectedChoice?.choiceId
                ?? renderedStep.currentBeatChoice?.choiceId
                ?? activeChoiceId;
        }

        for (const selection of [renderedStep.currentBeatChoice, renderedStep.selectedChoice]) {
            if (selection?.isPassive) continue;
            if (!selection || seen.has(selection.choiceId)) continue;
            seen.add(selection.choiceId);
            steps.push({
                id: selection.choiceId,
                label: selection.label,
                stepLabel: stepDossierLabel(renderedStep),
                isCurrent: false,
            });
        }
    }

    const currentChoiceId = activeChoiceId ?? steps.at(-1)?.id ?? null;

    return steps.map((step) => ({
        ...step,
        isCurrent: step.id === currentChoiceId,
    }));
}

function selectedChoicesForFlow(flow: QuestPathFlow): QuestPathChoice[] {
    const seen = new Set<string>();
    const selectedChoices: QuestPathChoice[] = [];

    for (const renderedStep of flow.renderedSteps) {
        for (const selection of [renderedStep.currentBeatChoice, renderedStep.selectedChoice]) {
            if (selection?.isPassive) continue;
            if (!selection || seen.has(selection.choiceId)) continue;
            const choice = choiceForSelection(renderedStep, selection);
            if (!choice) continue;
            seen.add(selection.choiceId);
            selectedChoices.push(choice);
        }
    }

    return selectedChoices;
}

function choiceForSelectionInFlow(
    flow: QuestPathFlow,
    selection: QuestPathChoiceSelection
): QuestPathChoice | null {
    for (const renderedStep of flow.renderedSteps) {
        const choice = choiceForSelection(renderedStep, selection);
        if (choice) return choice;
    }
    return null;
}

function selectedContextBranchKeysForStep(renderedStep: RenderedPathStep): Set<string> {
    const selectedChoice = choiceForSelection(renderedStep, renderedStep.selectedChoice);
    return new Set([
        ...(selectedChoice?.prerequisiteBranchKeys ?? []),
        selectedChoice?.parentBranchKey ?? null,
    ].filter((branchKey): branchKey is string => Boolean(branchKey)));
}

function choiceForSelection(
    renderedStep: RenderedPathStep,
    selection: QuestPathChoiceSelection | null
): QuestPathChoice | null {
    if (!selection) return null;
    return [...renderedStep.choices, ...renderedStep.revealedContinuations, ...renderedStep.autoContinuedChoices]
        .find((choice) => choiceMatchesSelection(choice, selection))
        ?? null;
}

function choiceMatchesSelection(
    choice: QuestPathChoice,
    selection: QuestPathChoiceSelection
): boolean {
    return choice.id === selection.choiceId
        || Boolean(selection.branchKey && choice.branchKey === selection.branchKey)
        || Boolean(selection.choiceKey && choice.choiceKey === selection.choiceKey);
}

function choiceLines(choice: QuestPathChoice): string[] {
    const lines = choice.strategyLines.length > 0 ? choice.strategyLines : choice.descriptionLines;
    return lines.filter((line) => (
        line
        && line !== choice.label
        && line !== choice.targetSummaryLine
    ));
}

export function strategyComparisonGroupId(choice: QuestPathChoice): string {
    return choice.choiceGroupKey
        ?? choice.groupKey
        ?? choice.parentChoiceKey
        ?? choice.parentBranchKey
        ?? `${choice.sectionRole ?? "choice"}:${choice.branchStepOrder ?? "current"}`;
}

export function strategyComparisonGroupLabel(choice: QuestPathChoice): string {
    return choice.groupLabel || choice.eyebrow || "Decision Options";
}

function leadsToForChoice(
    choice: QuestPathChoice,
    entriesByKey: Record<string, QuestExplorerEntry>
): string[] {
    return leadEntryKeysForChoice(choice).map((entryKey) => entryLabel(entryKey, entriesByKey));
}

function leadEntryKeysForChoice(choice: QuestPathChoice): string[] {
    const outcomeMarkerKeys = new Set([...choice.failureEntryKeys, ...choice.convergesIntoEntryKeys]);
    return uniqueStrings([
        choice.targetEntryKey,
        ...choice.nextEntryKeys,
    ].filter(Boolean)).filter((entryKey) => !outcomeMarkerKeys.has(entryKey));
}

function branchComparisonEmptyLabel(
    renderedStep: RenderedPathStep,
    flow: QuestPathFlow
): string {
    const isTerminalRenderedStep = flow.renderedSteps.at(-1)?.step.stepKey === renderedStep.step.stepKey;
    if (isTerminalRenderedStep && flow.unresolvedContinuation) {
        return "The selected sequence is unresolved, so there is no further decision to compare.";
    }
    if (isTerminalRenderedStep && flow.reachedContinuationEntryKey) {
        return "The selected sequence exits this chapter. Continue from the linked chapter to compare more decisions.";
    }
    if (renderedStep.currentBeatChoice || renderedStep.selectedChoice) {
        return "The selected sequence has no further decision at this stage.";
    }
    return "No explicit decisions are active at this stage.";
}

function markersForEntryKeys(
    kind: StrategyDossierMarkerKind,
    label: string,
    entryKeys: string[],
    entriesByKey: Record<string, QuestExplorerEntry>
): StrategyDossierMarker[] {
    return uniqueStrings(entryKeys).map((entryKey) => ({
        kind,
        label,
        detail: entryLabel(entryKey, entriesByKey),
    }));
}

function entryLabel(entryKey: string, entriesByKey: Record<string, QuestExplorerEntry>): string {
    const entry = entriesByKey[entryKey];
    if (!entry) return "A linked quest entry is not available in the current archive.";
    const chapter = entry.navigation.chapterLabel
        ?? (entry.navigation.chapter != null ? `Chapter ${entry.navigation.chapter}` : null);
    return chapter ? `${chapter}: ${entry.title}` : entry.title;
}

function stepDossierLabel(renderedStep: RenderedPathStep): string {
    return renderedStep.step.stepNumber != null
        ? `Step ${renderedStep.step.stepNumber}`
        : renderedStep.step.stepOrder != null
            ? `Order ${renderedStep.step.stepOrder}`
            : "Step";
}

function uniqueChoices(choices: QuestPathChoice[]): QuestPathChoice[] {
    const seen = new Set<string>();
    return choices.filter((choice) => {
        if (seen.has(choice.id)) return false;
        seen.add(choice.id);
        return true;
    });
}

function uniqueMarkers(markers: StrategyDossierMarker[]): StrategyDossierMarker[] {
    const seen = new Set<string>();
    return markers.filter((marker) => {
        const key = `${marker.kind}:${marker.label}:${marker.detail}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

function uniqueStrings(values: Array<string | null | undefined>): string[] {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const value of values) {
        const cleanValue = value?.trim();
        if (!cleanValue || seen.has(cleanValue)) continue;
        seen.add(cleanValue);
        result.push(cleanValue);
    }
    return result;
}
