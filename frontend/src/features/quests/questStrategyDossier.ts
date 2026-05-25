import type { QuestExplorerEntry, StrategyObjective } from "@/types/questTypes";
import type {
    QuestPathChoice,
    QuestPathChoiceSelection,
    QuestPathFlow,
    RenderedPathStep,
} from "@/features/quests/questPathFlow";

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
    };
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
        .find((choice) => choice.id === selection.choiceId)
        ?? null;
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

function phaseDisplayLabel(phase: string | null | undefined): string {
    const normalized = (phase ?? "").trim().toLowerCase();
    if (!normalized) return "Objective";

    const labels: Record<string, string> = {
        start: "Opening",
        intro: "Opening",
        success: "Resolution",
        failure: "Setback",
        choice: "Choice",
        completion: "Objective",
        other: "Objective",
    };

    return labels[normalized] ?? normalized
        .split(/[\s_-]+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
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
