import { stagePresentationGroups } from "@/features/quests/questChoicePresentation";
import { isMinorFactionVariantQuest } from "@/features/quests/questDisplay";
import {
    buildQuestPathFlow,
    type QuestDetailProgression,
    type QuestPathChoice,
    type QuestPathChoiceSelection,
    type QuestPathFlow,
    type RenderedPathStep,
} from "@/features/quests/questPathFlow";
import {
    strategyObjectiveScopeForRevealedContinuations,
    strategyObjectiveScopeForStep,
} from "@/features/quests/questReaderScopes";
import {
    buildStrategyDossierModel,
    type StrategyDossierModel,
} from "@/features/quests/questStrategyDossier";
import type { QuestSemanticStageKind } from "@/features/quests/questSemanticStages";
import type {
    QuestExplorerEntry,
    QuestExplorerProgression,
    QuestProgressionStep,
} from "@/types/questTypes";

export type StrategyStageKind =
    | "current_task"
    | "decision"
    | "continuation"
    | "topology_alternative"
    | "convergence"
    | "terminal"
    | "failure"
    | "unresolved";

export type StrategyActiveStage = {
    kind: StrategyStageKind;
    stageLabel: string;
    renderedStep: RenderedPathStep;
    step: QuestProgressionStep;
    stepIndex: number;
    title: string;
    totalStages: number;
    dossier: StrategyDossierModel;
    currentTask: StrategyDossierModel["currentTask"];
    decisionGroup: StrategyDossierModel["decisionGroup"];
    continuation: StrategyDossierModel["continuation"];
    topologyAlternatives: StrategyDossierModel["topologyAlternatives"];
    outcomePreview: StrategyDossierModel["outcomePreview"];
    continuationStatus: StrategyDossierModel["continuationStatus"];
};

export type StrategyFlowModel = {
    flow: QuestPathFlow;
    activeStage: StrategyActiveStage | null;
    renderedStep: RenderedPathStep | null;
    dossier: StrategyDossierModel | null;
    title: string;
    totalSteps: number;
    debugChoices: QuestPathChoice[];
    projectedDebugChoices: QuestPathChoice[];
};

export function buildStrategyFlowModel({
    progression,
    fullProgression,
    entriesByKey,
    choicePath,
    showRawHiddenRows,
    getStepTitle = defaultStepTitle,
}: {
    progression: QuestDetailProgression | null;
    fullProgression: QuestExplorerProgression | null;
    entriesByKey: Record<string, QuestExplorerEntry>;
    choicePath: QuestPathChoiceSelection[];
    showRawHiddenRows: boolean;
    getStepTitle?: (step: QuestProgressionStep, entry: QuestExplorerEntry | null) => string;
}): StrategyFlowModel | null {
    if (!progression) return null;

    const flow = buildQuestPathFlow(progression, entriesByKey, choicePath, fullProgression, {
        focusedStepIndex: progression.focusedStepIndex,
        showRawHiddenRows,
    });
    const renderedStep = activeStrategyRenderedStep(flow);
    const totalSteps = progression.chapter.steps.length;
    if (!renderedStep) {
        return {
            flow,
            activeStage: null,
            renderedStep: null,
            dossier: null,
            title: "",
            totalSteps,
            debugChoices: [],
            projectedDebugChoices: [],
        };
    }

    const title = getStepTitle(renderedStep.step, renderedStep.displayEntry);
    const objectiveScope = renderedStep.displayEntry
        ? strategyObjectiveScopeForStep(renderedStep.displayEntry, renderedStep)
        : null;
    const revealedObjectiveScope = renderedStep.displayEntry
        ? strategyObjectiveScopeForRevealedContinuations(renderedStep.displayEntry, renderedStep)
        : null;
    const stagePresentation = stagePresentationGroups(
        renderedStep.step,
        renderedStep.choices,
        renderedStep.selectedChoice,
        renderedStep.displayEntry,
        entriesByKey,
        showRawHiddenRows
    );
    const comparisonChoices = [
        ...stagePresentation.primaryStages,
        ...stagePresentation.activeContinuationStages,
    ];
    const dossier = buildStrategyDossierModel({
        renderedStep,
        totalSteps,
        title,
        displayEntry: renderedStep.displayEntry,
        objectiveScope,
        revealedObjectiveScope,
        flow,
        entriesByKey,
        usesObjectivePaths: renderedStep.displayEntry ? isMinorFactionVariantQuest(renderedStep.displayEntry) : false,
        comparisonChoices,
    });
    const selectedChoiceForDebug = renderedStep.selectedChoice
        ? [...renderedStep.choices, ...renderedStep.revealedContinuations]
            .find((choice) => choice.id === renderedStep.selectedChoice?.choiceId)
            ?? null
        : null;

    return {
        flow,
        activeStage: buildStrategyActiveStage({
            renderedStep,
            dossier,
            title,
            totalStages: totalSteps,
        }),
        renderedStep,
        dossier,
        title,
        totalSteps,
        debugChoices: [...renderedStep.choices, ...renderedStep.revealedContinuations],
        projectedDebugChoices: renderedStep.revealedContinuations.length > 0
            ? renderedStep.revealedContinuations
            : selectedChoiceForDebug ? [selectedChoiceForDebug] : [],
    };
}

export function buildStrategyActiveStage({
    renderedStep,
    dossier,
    title,
    totalStages,
}: {
    renderedStep: RenderedPathStep;
    dossier: StrategyDossierModel;
    title: string;
    totalStages: number;
}): StrategyActiveStage {
    const kind = strategyStageKind(dossier);

    return {
        kind,
        stageLabel: strategyStageLabel(kind),
        renderedStep,
        step: renderedStep.step,
        stepIndex: renderedStep.stepIndex,
        title,
        totalStages,
        dossier,
        currentTask: dossier.currentTask,
        decisionGroup: dossier.decisionGroup,
        continuation: dossier.continuation,
        topologyAlternatives: dossier.topologyAlternatives,
        outcomePreview: dossier.outcomePreview,
        continuationStatus: dossier.continuationStatus,
    };
}

function strategyStageKind(dossier: StrategyDossierModel): StrategyStageKind {
    if (dossier.decisionGroup.groups.some((group) => group.options.length > 0)) return "decision";
    if (dossier.topologyAlternatives.length > 0) return "topology_alternative";

    switch (dossier.continuationStatus.kind) {
        case "failure":
            return "failure";
        case "unresolved":
            return "unresolved";
        case "converges":
            return "convergence";
        default:
            break;
    }

    const semanticKinds = [
        dossier.currentTask?.choice.semanticStageKind,
        dossier.continuation?.choice.semanticStageKind,
    ].filter((kind): kind is QuestSemanticStageKind => Boolean(kind));
    if (semanticKinds.includes("failure")) return "failure";
    if (semanticKinds.includes("unresolved")) return "unresolved";
    if (semanticKinds.includes("convergence")) return "convergence";
    if (semanticKinds.includes("terminal")) return "terminal";
    if (dossier.continuation) return "continuation";

    return "current_task";
}

function strategyStageLabel(kind: StrategyStageKind): string {
    switch (kind) {
        case "decision":
            return "Decision";
        case "continuation":
            return "Continuation";
        case "topology_alternative":
            return "Possible continuations";
        case "convergence":
            return "Convergence";
        case "terminal":
            return "Terminal state";
        case "failure":
            return "Failure state";
        case "unresolved":
            return "Unresolved continuation";
        default:
            return "Current task";
    }
}

function activeStrategyRenderedStep(flow: QuestPathFlow): RenderedPathStep | null {
    return flow.renderedSteps.find((renderedStep) => (
        renderedStep.choices.length > 0 && !renderedStep.selectedChoice
    ))
        ?? flow.renderedSteps.find((renderedStep) => (
            renderedStep.choices.length > 0 && Boolean(renderedStep.selectedChoice)
        ))
        ?? flow.renderedSteps.at(-1)
        ?? null;
}

function defaultStepTitle(
    step: QuestProgressionStep,
    entry: QuestExplorerEntry | null
): string {
    return entry?.title || step.title || "Unknown Horizons";
}
