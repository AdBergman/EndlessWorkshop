import type { QuestExplorerEntry, StrategyObjective } from "@/types/questTypes";
import type {
    QuestPathChoice,
    QuestPathChoiceSelection,
    QuestPathFlow,
    RenderedPathStep,
} from "@/features/quests/questPathFlow";
import { phaseDisplayLabel } from "@/features/quests/questDisplay";

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
    rewards: string[];
};

export type StrategyDossierOutcome = {
    title: string;
    lines: string[];
    requirements: string[];
    rewards: string[];
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
    rewards: string[];
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
    objectives: StrategyDossierObjective[];
    requirements: string[];
    rewards: string[];
    selectedPathSteps: StrategyDossierSelectedPathStep[];
    projectedOutcome: StrategyDossierOutcome | null;
    markers: StrategyDossierMarker[];
    branchComparison: StrategyDossierBranchComparison;
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
        ? dossierObjectives(objectiveScope, displayEntry, usesObjectivePaths)
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

    return {
        brief: {
            title,
            stepLabel: stepDossierLabel(renderedStep),
            totalSteps,
            summaryLines: displayEntry?.summaryLines.filter(Boolean) ?? [],
        },
        objectives,
        requirements: uniqueStrings(objectives.flatMap((objective) => objective.requirements)),
        rewards: uniqueStrings(objectives.flatMap((objective) => objective.rewards)),
        selectedPathSteps,
        projectedOutcome,
        markers: buildMarkers(renderedStep, selectedChoice, flow, entriesByKey),
        branchComparison: buildBranchComparison(renderedStep, comparisonChoices, flow, entriesByKey),
        continuityStrip: buildStrategyContinuityStrip(flow, entriesByKey),
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
        const hasDecisionPoint = renderedStep.choices.length > 0;
        const selectedPathTouchesStep = Boolean(
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
            detail: stepStripDetail(renderedStep, selectedPathTouchesStep),
            markers: [],
            isCurrent: renderedStep.isActive,
            isSelectedPath: selectedPathTouchesStep,
            isDecisionPoint: hasDecisionPoint,
            isTerminal: false,
        });

        if (hasDecisionPoint || selectedChoice) {
            const markers = selectedChoice ? markersForChoice(selectedChoice, entriesByKey) : [];
            const pendingDecisionId = renderedStep.choices[0]?.choiceGroupKey
                ?? renderedStep.choices[0]?.groupKey
                ?? renderedStep.choices[0]?.id
                ?? "pending";
            items.push({
                id: `${renderedStep.step.stepKey}:decision:${selectedChoice?.id ?? pendingDecisionId}`,
                kind: "decision",
                eyebrow: "Branch Point",
                title: selectedChoice?.label ?? decisionTitleForStep(renderedStep),
                detail: selectedChoice
                    ? "Selected path"
                    : decisionDetailForStep(renderedStep),
                markers,
                isCurrent: renderedStep.isActive,
                isSelectedPath: Boolean(selectedChoice),
                isDecisionPoint: true,
                isTerminal: false,
            });
        }

        const revealedContinuations = uniqueChoices(renderedStep.revealedContinuations);
        if (revealedContinuations.length > 0) {
            items.push({
                id: `${renderedStep.step.stepKey}:outcome:${revealedContinuations.map((choice) => choice.id).join("|")}`,
                kind: "outcome",
                eyebrow: "Outcome",
                title: revealedContinuations.length === 1
                    ? revealedContinuations[0].label
                    : "Revealed Outcomes",
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
    const terminalStep = flow.renderedSteps.at(-1) ?? null;
    const hasSelectedPath = selectedChoices.length > 0;
    const hasPendingTerminalChoice = Boolean(terminalStep && terminalStep.choices.length > 0 && !terminalStep.selectedChoice);

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

    if (failureMarker) {
        return {
            kind: "failure",
            label: "Failure",
            title: "Selected path enters a failure outcome",
            description: `The simulated path resolves into ${failureMarker.detail}. Review the failure branch before comparing alternate options.`,
            choiceLabel: statusChoice?.label ?? null,
            targetLabel: failureMarker.detail,
            markers: uniqueMarkers([failureMarker, ...latestChoiceMarkers.filter((marker) => marker.kind !== "failure")]),
        };
    }

    if (convergenceMarker) {
        return {
            kind: "converges",
            label: "Converges",
            title: "Selected path rejoins the main progression",
            description: `The simulated path converges at ${convergenceMarker.detail}. Alternate branches may rejoin this same point.`,
            choiceLabel: statusChoice?.label ?? null,
            targetLabel: convergenceMarker.detail,
            markers: uniqueMarkers([convergenceMarker, ...latestChoiceMarkers.filter((marker) => marker.kind !== "converges")]),
        };
    }

    if (flow.unresolvedContinuation) {
        return {
            kind: "unresolved",
            label: "Unresolved",
            title: "Continuation is not identified",
            description: `The selected choice "${flow.unresolvedContinuation.label}" is modeled, but the archive does not identify the next continuation step. The dossier stops here rather than guessing.`,
            choiceLabel: flow.unresolvedContinuation.label,
            targetLabel: null,
            markers: [{
                kind: "unresolved",
                label: "Unresolved",
                detail: "No explicit next continuation step is modeled for this branch.",
            }],
        };
    }

    if (flow.reachedContinuationEntryKey) {
        const targetLabel = entryLabel(flow.reachedContinuationEntryKey, entriesByKey);
        return {
            kind: "chapter-exit",
            label: "Chapter Exit",
            title: "Selected path leaves this chapter",
            description: `Continue strategy planning from ${targetLabel}. This dossier remains scoped to the current chapter.`,
            choiceLabel: statusChoice?.label ?? null,
            targetLabel,
            markers: markersForEntryKeys("leads", "Leads To", [flow.reachedContinuationEntryKey], entriesByKey),
        };
    }

    if (hasPendingTerminalChoice && terminalStep) {
        const targetLabel = `${stepDossierLabel(terminalStep)}: ${terminalStep.displayEntry?.title ?? terminalStep.step.title}`;
        return {
            kind: "continues-in-chapter",
            label: "Next Decision",
            title: "Selected path reaches another decision in this chapter",
            description: `Continue simulation from ${targetLabel}. The dossier is waiting at the next modeled choice point.`,
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
        label: "Complete",
        title: "No further modeled decision in this chapter",
        description: terminalLabel
            ? `The selected path currently resolves at ${terminalLabel}. No additional branch choice, convergence, failure, or chapter exit is modeled from here.`
            : "The selected path has no additional modeled branch choice, convergence, failure, or chapter exit.",
        choiceLabel: statusChoice?.label ?? null,
        targetLabel: terminalLabel,
        markers: latestChoiceMarkers,
    };
}

function stepStripDetail(renderedStep: RenderedPathStep, selectedPathTouchesStep: boolean): string {
    if (renderedStep.isActive) return "Current step";
    if (selectedPathTouchesStep) return "Selected path step";
    return "Projected step";
}

function decisionTitleForStep(renderedStep: RenderedPathStep): string {
    if (renderedStep.choices.length === 1) return "Decision Available";
    return `${renderedStep.choices.length} Options Available`;
}

function decisionDetailForStep(renderedStep: RenderedPathStep): string {
    if (renderedStep.choices.length === 0) return "No active options at this point.";
    if (renderedStep.choices.length === 1) return "Select the available path to continue simulation.";
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
            return "The chapter path is waiting at the active branch point.";
        case "continues-in-chapter":
            return "The selected path reaches another modeled decision in this chapter.";
        case "chapter-exit":
            return "The selected path leaves this chapter.";
        case "converges":
            return "The selected path rejoins a modeled convergence point.";
        case "failure":
            return "The selected path enters a modeled failure outcome.";
        case "unresolved":
            return "The selected path stops where the archive lacks an explicit continuation.";
        case "complete":
            return "The selected path has no further modeled decision in this chapter.";
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

function buildBranchComparison(
    renderedStep: RenderedPathStep,
    choices: QuestPathChoice[],
    flow: QuestPathFlow,
    entriesByKey: Record<string, QuestExplorerEntry>
): StrategyDossierBranchComparison {
    const groups = new Map<string, StrategyDossierBranchComparisonGroup>();
    const selectedPathBranchKeys = selectedPathBranchKeysForStep(renderedStep);

    for (const choice of choices) {
        const groupId = comparisonGroupId(choice);
        const group = groups.get(groupId) ?? {
            id: groupId,
            label: comparisonGroupLabel(choice),
            options: [],
        };

        group.options.push({
            id: choice.id,
            choice,
            label: choice.label,
            eyebrow: choice.eyebrow,
            outcomeLines: choiceLines(choice),
            requirements: choice.requirementLines,
            rewards: choice.rewardLines,
            leadsTo: leadsToForChoice(choice, entriesByKey),
            markers: markersForChoice(choice, entriesByKey),
            isSelected: renderedStep.selectedChoice?.choiceId === choice.id,
            isInSelectedPath: Boolean(choice.branchKey && selectedPathBranchKeys.has(choice.branchKey)),
        });
        groups.set(groupId, group);
    }

    const comparisonGroups = [...groups.values()];

    return {
        groups: comparisonGroups,
        emptyLabel: branchComparisonEmptyLabel(renderedStep, flow),
        selectedOption: comparisonGroups
            .flatMap((group) => group.options)
            .find((option) => option.isSelected)
            ?? null,
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
        ? dossierObjectives(revealedObjectiveScope, displayEntry, usesObjectivePaths)
        : [];

    if (outcomeChoices.length === 0 && outcomeObjectives.length === 0) return null;

    const title = outcomeChoices.length === 1
        ? outcomeChoices[0].label
        : outcomeChoices.length > 1
            ? "Projected Path Outcomes"
            : "Projected Objective";
    const lines = uniqueStrings(outcomeChoices.flatMap((choice) => choiceLines(choice)));
    const requirements = uniqueStrings([
        ...outcomeChoices.flatMap((choice) => choice.requirementLines),
        ...outcomeObjectives.flatMap((objective) => objective.requirements),
    ]);
    const rewards = uniqueStrings([
        ...outcomeChoices.flatMap((choice) => choice.rewardLines),
        ...outcomeObjectives.flatMap((objective) => objective.rewards),
    ]);

    return {
        title,
        lines,
        requirements,
        rewards,
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
            label: "Unresolved",
            detail: `The selected path "${flow.unresolvedContinuation.label}" is modeled, but no next continuation step is identified.`,
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
        ...markersForEntryKeys("converges", "Converges", choice.convergesIntoEntryKeys, entriesByKey),
    ];

    if (choice.convergenceGroupKey && choice.convergesIntoEntryKeys.length === 0) {
        markers.push({
            kind: "converges",
            label: "Converges",
            detail: "This branch rejoins a modeled convergence point.",
        });
    }

    if (includeUnresolved && markers.length === 0 && !choice.hasDependentContinuations) {
        markers.push({
            kind: "unresolved",
            label: "Unresolved",
            detail: "No explicit next, failure, or convergence entry is modeled for this option.",
        });
    }

    return uniqueMarkers(markers);
}

function dossierObjectives(
    scope: StrategyDossierObjectiveScope,
    entry: QuestExplorerEntry | null,
    usesObjectivePaths: boolean
): StrategyDossierObjective[] {
    const entryKey = entry?.entryKey ?? "entry";
    return scope.objectives.map((objective, index) => ({
        id: objective.objectiveKey ?? `${entryKey}:objective:${scope.objectiveIndexOffset + index}`,
        phaseLabel: usesObjectivePaths ? "Pacification Objective" : phaseDisplayLabel(objective.phase),
        label: `Objective ${scope.objectiveIndexOffset + index + 1}`,
        text: objective.text,
        requirements: objective.requirements.map((requirement) => requirement.displayText).filter(Boolean),
        rewards: objective.rewards.map((reward) => reward.displayText).filter(Boolean),
    }));
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

function selectedPathBranchKeysForStep(renderedStep: RenderedPathStep): Set<string> {
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
    return [...renderedStep.choices, ...renderedStep.revealedContinuations]
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

function comparisonGroupId(choice: QuestPathChoice): string {
    return choice.choiceGroupKey
        ?? choice.groupKey
        ?? choice.parentChoiceKey
        ?? choice.parentBranchKey
        ?? `${choice.sectionRole ?? "choice"}:${choice.branchStepOrder ?? "current"}`;
}

function comparisonGroupLabel(choice: QuestPathChoice): string {
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
        return "The selected path is unresolved, so there is no further decision to compare.";
    }
    if (isTerminalRenderedStep && flow.reachedContinuationEntryKey) {
        return "The selected path exits this chapter. Continue from the linked chapter to compare more decisions.";
    }
    if (renderedStep.currentBeatChoice || renderedStep.selectedChoice) {
        return "The selected path has no further decision at this step.";
    }
    return "No branch choices are active at this step.";
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
