import { choicePresentationGroups } from "@/features/quests/questChoicePresentation";
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
import type {
    QuestExplorerEntry,
    QuestExplorerProgression,
    QuestProgressionStep,
} from "@/types/questTypes";

export type StrategyFlowModel = {
    flow: QuestPathFlow;
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
    const choicePresentation = choicePresentationGroups(
        renderedStep.step,
        renderedStep.choices,
        renderedStep.selectedChoice,
        renderedStep.displayEntry,
        entriesByKey,
        showRawHiddenRows
    );
    const comparisonChoices = [
        ...choicePresentation.primaryChoices,
        ...choicePresentation.activeContinuationChoices,
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
