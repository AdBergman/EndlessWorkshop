import { stagePresentationGroups } from "@/features/quests/questChoicePresentation";
import { isMinorFactionVariantQuest } from "@/features/quests/questDisplay";
import {
    buildQuestPathFlow,
    branchStepOrderForProgressionStep,
    choicesForStep,
    hiddenNoLinkArtifactReason,
    hiddenUngatedContinuationReason,
    hiddenUnresolvedReason,
    isNecrophageCh6Choice,
    isNecrophageCh6FinalChoice,
    nextProgressionChapterLocation,
    stepIndexForBranchStepOrder,
    uniqueStrings,
    type QuestDetailProgression,
    type QuestPathChoice,
    type QuestPathChoiceSelection,
    type QuestPathFlow,
    type RevealContext,
    type RenderedPathStep,
} from "@/features/quests/questPathFlow";
import {
    strategyObjectiveScopeForRevealedContinuations,
    strategyObjectiveScopeForStep,
} from "@/features/quests/questReaderScopes";
import {
    buildStrategyBranchOptions,
    buildStrategyDossierObjectives,
    buildStrategyDossierModel,
    buildStrategyPathStatus,
    objectiveRoutesForObjectives,
    strategyComparisonGroupId,
    strategyComparisonGroupLabel,
    type StrategyDossierBranchOption,
    type StrategyDossierModel,
    type StrategyDossierObjective,
    type StrategyDossierObjectiveRoute,
    type StrategyPathStatus,
} from "@/features/quests/questStrategyDossier";
import type { QuestSemanticStageKind } from "@/features/quests/questSemanticStages";
import {
    rewardDisplayTexts,
    uniqueRewardDisplays,
    type QuestRewardDisplay,
} from "@/features/quests/questRewardDisplay";
import {
    requirementDisplayTexts,
    uniqueRequirementDisplays,
    type QuestRequirementDisplay,
} from "@/features/quests/questRequirementDisplay";
import type {
    QuestExplorerEntry,
    QuestExplorerProgression,
    QuestProgressionStep,
    StrategyObjective,
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

export type StrategyChapterTaskSemanticKind =
    | "setup"
    | "task"
    | "deterministic_continuation"
    | "terminal"
    | "failure"
    | "unresolved";

export type StrategyChapterTaskStatus = "available" | "selected" | "locked" | "preview";

export type StrategyChapterTask = {
    id: string;
    stageOrder: number;
    stageLabel: string;
    title: string;
    lines: string[];
    objectives: StrategyDossierObjective[];
    objectiveRoutes: StrategyDossierObjectiveRoute[];
    requirements: string[];
    requirementDetails: QuestRequirementDisplay[];
    rewards: string[];
    rewardDetails: QuestRewardDisplay[];
    semanticKind: StrategyChapterTaskSemanticKind;
    source: {
        stepKey: string;
        branchKey?: string;
        choiceKey?: string;
        branchStepOrder?: number;
    };
    status: StrategyChapterTaskStatus;
    option: StrategyDossierBranchOption | null;
    continuationStatus: StrategyPathStatus | null;
};

export type StrategyDecisionPointKind =
    | "explicit_choice"
    | "path_variant"
    | "topology_alternative";

export type StrategyDecisionPoint = {
    id: string;
    kind: StrategyDecisionPointKind;
    stageOrder: number;
    stageLabel: string;
    title: string;
    step: QuestProgressionStep;
    options: StrategyDossierBranchOption[];
    outcomePreview: StrategyDossierModel["outcomePreview"];
    continuationStatus: StrategyDossierModel["continuationStatus"];
};

export type StrategyPriorContext = {
    id: string;
    label: string;
    choice: QuestPathChoiceSelection;
};

export type StrategyContinuationPreview = {
    title: string;
    targetLabel: string | null;
} | null;

export type StrategyBranchImpact = {
    id: string;
    label: string;
};

export type StrategyFlowModel = {
    flow: QuestPathFlow;
    activeStage: StrategyActiveStage | null;
    renderedStep: RenderedPathStep | null;
    dossier: StrategyDossierModel | null;
    title: string;
    totalSteps: number;
    chapterTasks: StrategyChapterTask[];
    decisionPoints: StrategyDecisionPoint[];
    selectedPriorContext: StrategyPriorContext[];
    continuationPreview: StrategyContinuationPreview;
    futureBranchImpacts: StrategyBranchImpact[];
    activeSelection: QuestPathChoiceSelection | null;
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
    const chapterPlan = buildStrategyChapterPlan({
        progression,
        fullProgression,
        entriesByKey,
        flow,
        choicePath,
        showRawHiddenRows,
        getStepTitle,
    });
    if (!renderedStep) {
        return {
            flow,
            activeStage: null,
            renderedStep: null,
            dossier: null,
            title: "",
            totalSteps,
            ...chapterPlan,
            debugChoices: [],
            projectedDebugChoices: [],
        };
    }

    const title = getStepTitle(renderedStep.step, renderedStep.displayEntry);
    const firstStep = progression.chapter.steps[0] ?? renderedStep.step;
    const chapterTitle = progression.chapter.title
        || getStepTitle(firstStep, entriesByKey[firstStep.detailEntryKey] ?? null);
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
        title: chapterTitle,
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
        ...chapterPlan,
        debugChoices: [...renderedStep.choices, ...renderedStep.revealedContinuations],
        projectedDebugChoices: renderedStep.revealedContinuations.length > 0
            ? renderedStep.revealedContinuations
            : selectedChoiceForDebug ? [selectedChoiceForDebug] : [],
    };
}

type StrategyChapterPlanFields = Pick<
    StrategyFlowModel,
    | "chapterTasks"
    | "decisionPoints"
    | "selectedPriorContext"
    | "continuationPreview"
    | "futureBranchImpacts"
    | "activeSelection"
>;

type ChapterChoice = {
    choice: QuestPathChoice;
    ownerEntry: QuestExplorerEntry | null;
    stageOrder: number;
    step: QuestProgressionStep;
    stepIndex: number;
};

type StrategyStageContext = {
    step: QuestProgressionStep;
    stepIndex: number;
    stageOrder: number;
    baseEntry: QuestExplorerEntry | null;
    displayEntry: QuestExplorerEntry | null;
    renderedStep: RenderedPathStep | null;
    revealContext: StrategyRevealContext;
    priorChoiceGroups: StrategyChoiceGroupRevealContext[];
    commonStaticRevealGroups: StrategyChoiceGroupRevealContext[];
    isPreviewAllowed: boolean;
};

type StrategyRevealContext = {
    branchKeys: Set<string>;
    explicitBranchKeys: Set<string>;
    choiceKeys: Set<string>;
    branchPath: string[];
};

type StrategyChoiceGroupRevealContext = {
    stageOrder: number;
    branchKeys: Set<string>;
    choiceKeys: Set<string>;
};

function buildStrategyChapterPlan({
    progression,
    fullProgression,
    entriesByKey,
    flow,
    choicePath,
    showRawHiddenRows,
    getStepTitle,
}: {
    progression: QuestDetailProgression;
    fullProgression: QuestExplorerProgression | null;
    entriesByKey: Record<string, QuestExplorerEntry>;
    flow: QuestPathFlow;
    choicePath: QuestPathChoiceSelection[];
    showRawHiddenRows: boolean;
    getStepTitle: (step: QuestProgressionStep, entry: QuestExplorerEntry | null) => string;
}): StrategyChapterPlanFields {
    const stageCount = progression.chapter.steps.length;
    const chapterChoices = collectChapterChoices(progression, entriesByKey, showRawHiddenRows);
    const renderedStepByStepKey = new Map(flow.renderedSteps.map((step) => [step.step.stepKey, step]));
    const stageContexts = buildStageContexts(progression, entriesByKey, renderedStepByStepKey, chapterChoices, choicePath);
    const choicesByStage = groupChoicesByStage(chapterChoices, stageContexts);
    const objectivesByStage = groupObjectivesByStage(progression, entriesByKey, chapterChoices, stageContexts);
    const objectivesByChoiceKey = groupObjectivesByChoiceKey(entriesByKey, stageContexts);
    const selectedByStepKey = selectionsByStepKey(choicePath);
    const activeStageOrder = flow.renderedSteps.at(-1)?.stepIndex != null
        ? flow.renderedSteps.at(-1)!.stepIndex + 1
        : Math.min(Math.max(progression.focusedStepIndex + 1, 1), Math.max(stageCount, 1));
    const flowPathStatus = buildStrategyPathStatus(flow, entriesByKey);
    const autoContinuedBranchKeys = new Set(
        flow.renderedSteps.flatMap((renderedStep) => (
            renderedStep.autoContinuedChoices.map((choice) => choice.branchKey).filter((branchKey): branchKey is string => Boolean(branchKey))
        ))
    );
    const inferredNextChapter = nextProgressionChapterLocation(progression, fullProgression);
    const autoContinuedChapterExitStatus = flowPathStatus.kind === "chapter-exit" && inferredNextChapter
        ? flowPathStatus
        : null;

    const activeSelection = [...choicePath].reverse().find((selection) => !selection.isPassive)
        ?? flow.renderedSteps.flatMap((step) => [
            step.selectedChoice,
            step.currentBeatChoice,
        ]).find((selection): selection is QuestPathChoiceSelection => Boolean(selection && !selection.isPassive))
        ?? null;

    const chapterTasks = stageContexts
        .map((stage): StrategyChapterTask | null => {
            const { step, stepIndex, stageOrder, displayEntry } = stage;
            const choices = choicesByStage.get(stageOrder) ?? [];
            const renderedStep = stage.renderedStep
                ?? syntheticRenderedStep({
                    step,
                    stepIndex,
                    displayEntry,
                    choices,
                    selectedChoice: selectedSelectionForChoices(step, choices, selectedByStepKey),
                    isActive: progression.activeStepKeys.has(step.stepKey),
                });
            const options = buildStrategyBranchOptions(renderedStep, choices, entriesByKey, objectivesByChoiceKey, {
                unresolvedChoiceIds: unresolvedChoiceIdsForStage(choices, displayEntry, progression),
            });
            const decisionOptions = decisionPointChoicesForStage(options, showRawHiddenRows);
            const decisionOptionIds = new Set(decisionOptions.map((option) => option.id));
            const decisionChoiceKeys = new Set(
                decisionOptions.map((option) => option.choice.choiceKey).filter((choiceKey): choiceKey is string => Boolean(choiceKey))
            );
            const taskOption = selectedOrFirstPlanOption(options.filter((option) => !decisionOptionIds.has(option.id)));
            const objectives = (objectivesByStage.get(stageOrder) ?? []).filter((objective) => (
                !objective.choiceKey || !decisionChoiceKeys.has(objective.choiceKey)
            ));
            if (!taskOption && objectives.length === 0) return null;

            const objectiveRoutes = taskOption?.objectiveRoutes?.length
                ? taskOption.objectiveRoutes
                : objectiveRoutesForObjectives(objectives);
            const hasRouteSpecificMeta = objectiveRoutes.length > 1;
            const requirementDetails = hasRouteSpecificMeta
                ? routeLevelRequirementDetails(taskOption, objectiveRoutes)
                : uniqueRequirementDisplays([
                    ...(taskOption?.requirementDetails ?? []),
                    ...objectives.flatMap((objective) => objective.requirementDetails),
                ]);
            const rewardDetails = hasRouteSpecificMeta
                ? routeLevelRewardDetails(taskOption, objectiveRoutes)
                : uniqueRewardDisplays([
                    ...(taskOption?.rewardDetails ?? []),
                    ...objectives.flatMap((objective) => objective.rewardDetails),
                ]);
            const title = strategyTaskTitle({
                taskOption,
                objectiveRoutes,
                fallbackTitle: getStepTitle(step, displayEntry),
                activeSelection,
            });
            const lines = uniqueDisplayValues([
                ...(taskOption?.outcomeLines ?? []),
                ...objectives.map((objective) => objective.text),
            ]);

            return {
                id: `${step.stepKey}:task:${taskOption?.id ?? "objectives"}`,
                stageOrder,
                stageLabel: `Step ${stageOrder} of ${stageCount}`,
                title,
                lines,
                objectives,
                objectiveRoutes,
                requirements: requirementDisplayTexts(requirementDetails),
                requirementDetails,
                rewards: rewardDisplayTexts(rewardDetails),
                rewardDetails,
                semanticKind: taskSemanticKind(taskOption?.choice.semanticStageKind ?? null),
                source: {
                    stepKey: step.stepKey,
                    branchKey: taskOption?.choice.branchKey ?? undefined,
                    choiceKey: taskOption?.choice.choiceKey ?? undefined,
                    branchStepOrder: taskOption?.choice.branchStepOrder ?? undefined,
                },
                status: taskStatusForStage(stageOrder, activeStageOrder, taskOption),
                option: taskOption,
                continuationStatus: taskContinuationStatus(taskOption, autoContinuedBranchKeys, autoContinuedChapterExitStatus),
            };
        })
        .filter((task): task is StrategyChapterTask => Boolean(task));

    const decisionPoints = stageContexts.flatMap((stage) => {
        const { step, stepIndex, stageOrder, displayEntry } = stage;
        const choices = choicesByStage.get(stageOrder) ?? [];
        if (choices.length === 0) return [];

        const renderedStep = stage.renderedStep
            ?? syntheticRenderedStep({
                step,
                stepIndex,
                displayEntry,
                choices,
                selectedChoice: selectedSelectionForChoices(step, choices, selectedByStepKey),
                isActive: progression.activeStepKeys.has(step.stepKey),
            });
        const options = buildStrategyBranchOptions(renderedStep, choices, entriesByKey, objectivesByChoiceKey, {
            unresolvedChoiceIds: unresolvedChoiceIdsForStage(choices, displayEntry, progression),
        });
        if (
            options.some((option) => isNecrophageCh6FinalChoice(option.choice))
            && activeSelection?.label !== "Save Girl"
        ) {
            return [];
        }
        const dossier = buildStrategyDossierModel({
            renderedStep,
            totalSteps: stageCount,
            title: getStepTitle(step, displayEntry),
            displayEntry,
            objectiveScope: null,
            revealedObjectiveScope: null,
            flow,
            entriesByKey,
            usesObjectivePaths: displayEntry ? isMinorFactionVariantQuest(displayEntry) : false,
            comparisonChoices: choices,
        });

        return buildDecisionPointsForStage({
            stageOrder,
            stageLabel: `Step ${stageOrder} of ${stageCount}`,
            step,
            options,
            dossier,
            showRawHiddenRows,
        });
    });

    return {
        chapterTasks,
        decisionPoints,
        selectedPriorContext: [],
        continuationPreview: continuationPreviewForFlow(flow),
        futureBranchImpacts: [],
        activeSelection,
    };
}

function buildStageContexts(
    progression: QuestDetailProgression,
    entriesByKey: Record<string, QuestExplorerEntry>,
    renderedStepByStepKey: Map<string, RenderedPathStep>,
    chapterChoices: ChapterChoice[],
    choicePath: QuestPathChoiceSelection[]
): StrategyStageContext[] {
    const focusedEntryKey = progression.chapter.steps[progression.focusedStepIndex]?.detailEntryKey ?? null;
    const rawChoicesByStage = groupChoicesByStage(chapterChoices);
    const revealContext = strategyRevealContext([...renderedStepByStepKey.values()], choicePath);
    const choiceGroupContexts = buildChoiceGroupRevealContexts(chapterChoices);

    return progression.chapter.steps.map((step, stepIndex) => {
        const renderedStep = renderedStepByStepKey.get(step.stepKey) ?? null;
        const baseEntry = entriesByKey[step.detailEntryKey] ?? null;
        const displayEntry = renderedStep?.displayEntry ?? baseEntry;
        const stageOrder = stepIndex + 1;
        const choices = rawChoicesByStage.get(stageOrder) ?? [];
        const commonStaticRevealGroups = commonStaticRevealGroupsForStage(
            stageOrder,
            displayEntry,
            choices,
            choiceGroupContexts
        );

        return {
            step,
            stepIndex,
            stageOrder,
            baseEntry,
            displayEntry,
            renderedStep,
            revealContext,
            priorChoiceGroups: choiceGroupContexts.filter((group) => group.stageOrder < stageOrder),
            commonStaticRevealGroups,
            isPreviewAllowed: isPreviewStageAllowed({
                renderedStep,
                displayEntry,
                focusedEntryKey,
                choices,
                revealContext,
                commonStaticRevealGroups,
            }),
        };
    });
}

function isPreviewStageAllowed({
    renderedStep,
    displayEntry,
    focusedEntryKey,
    choices,
    revealContext,
    commonStaticRevealGroups,
}: {
    renderedStep: RenderedPathStep | null;
    displayEntry: QuestExplorerEntry | null;
    focusedEntryKey: string | null;
    choices: QuestPathChoice[];
    revealContext: StrategyRevealContext;
    commonStaticRevealGroups: StrategyChoiceGroupRevealContext[];
}): boolean {
    if (renderedStep) return true;
    if (displayEntry?.entryKey && displayEntry.entryKey === focusedEntryKey) return true;
    if (choices.some((choice) => choice.sourceEntryKey === focusedEntryKey || revealMetadataSatisfied(choice, revealContext))) return true;
    if (displayEntry?.strategyView.objectives.some((objective) => revealMetadataSatisfied(objective, revealContext))) return true;
    return commonStaticRevealGroups.length > 0;
}

function buildChoiceGroupRevealContexts(chapterChoices: ChapterChoice[]): StrategyChoiceGroupRevealContext[] {
    const groups = new Map<string, { stageOrder: number; choices: QuestPathChoice[] }>();
    chapterChoices.forEach(({ choice, stageOrder }) => {
        if (!decisionPointKindForChoice(choice)) return;
        const groupId = choice.choiceGroupKey
            ?? choice.groupKey
            ?? strategyComparisonGroupId(choice);
        const key = `${stageOrder}:${groupId}`;
        const group = groups.get(key) ?? { stageOrder, choices: [] };
        group.choices.push(choice);
        groups.set(key, group);
    });

    return [...groups.values()]
        .filter((group) => uniqueDisplayValues(group.choices.map((choice) => choice.label)).length > 1)
        .map((group) => ({
            stageOrder: group.stageOrder,
            branchKeys: new Set(group.choices.map((choice) => choice.branchKey).filter((key): key is string => Boolean(key))),
            choiceKeys: new Set(group.choices.map((choice) => choice.choiceKey).filter((key): key is string => Boolean(key))),
        }))
        .filter((group) => group.branchKeys.size > 0 || group.choiceKeys.size > 0);
}

function commonStaticRevealGroupsForStage(
    stageOrder: number,
    displayEntry: QuestExplorerEntry | null,
    choices: QuestPathChoice[],
    choiceGroupContexts: StrategyChoiceGroupRevealContext[]
): StrategyChoiceGroupRevealContext[] {
    return choiceGroupContexts.filter((group) => (
        group.stageOrder < stageOrder
        && stageHasCommonStaticReveal(displayEntry, choices, group)
    ));
}

function stageHasCommonStaticReveal(
    displayEntry: QuestExplorerEntry | null,
    choices: QuestPathChoice[],
    group: StrategyChoiceGroupRevealContext
): boolean {
    return choices.some((choice) => revealMetadataCoversAllOptions(choice, group))
        || Boolean(displayEntry?.strategyView.objectives.some((objective) => (
            revealMetadataCoversAllOptions(objective, group)
        )));
}

function stageItemVisible(
    item: Pick<QuestPathChoice, "revealedByBranchKeys" | "revealedByChoiceKeys" | "revealedByBranchPathAlternatives">
        | Pick<StrategyObjective, "revealedByBranchKeys" | "revealedByChoiceKeys" | "revealedByBranchPathAlternatives">,
    stage: StrategyStageContext
): boolean {
    if (!hasRevealMetadata(item)) return true;
    if (revealMetadataSatisfied(item, stage.revealContext)) return true;
    return stage.commonStaticRevealGroups.some((group) => revealMetadataCoversAllOptions(item, group));
}

function choiceBlockedByUnselectedPriorChoice(
    choice: QuestPathChoice,
    stage: StrategyStageContext
): boolean {
    if (choice.sectionRole !== "continuation") return false;

    const owningBranches = uniqueStrings([
        choice.parentBranchKey,
        ...choice.prerequisiteBranchKeys,
    ].filter((branchKey): branchKey is string => Boolean(branchKey)));
    if (owningBranches.length === 0) return false;

    return stage.commonStaticRevealGroups.every((group) => !revealMetadataCoversAllOptions(choice, group))
        && stagePriorChoiceGroups(stage).some((group) => {
            const owningGroupBranches = owningBranches.filter((branchKey) => group.branchKeys.has(branchKey));
            if (owningGroupBranches.length === 0) return false;
            return owningGroupBranches.every((branchKey) => !stage.revealContext.explicitBranchKeys.has(branchKey));
        });
}

function hasRevealMetadata(
    item: Pick<QuestPathChoice, "revealedByBranchKeys" | "revealedByChoiceKeys" | "revealedByBranchPathAlternatives">
        | Pick<StrategyObjective, "revealedByBranchKeys" | "revealedByChoiceKeys" | "revealedByBranchPathAlternatives">
): boolean {
    return (item.revealedByBranchKeys?.length ?? 0) > 0
        || (item.revealedByChoiceKeys?.length ?? 0) > 0
        || (item.revealedByBranchPathAlternatives?.length ?? 0) > 0;
}

function revealMetadataCoversAllOptions(
    item: Pick<QuestPathChoice, "revealedByBranchKeys" | "revealedByChoiceKeys" | "revealedByBranchPathAlternatives">
        | Pick<StrategyObjective, "revealedByBranchKeys" | "revealedByChoiceKeys" | "revealedByBranchPathAlternatives">,
    group: StrategyChoiceGroupRevealContext
): boolean {
    const choiceKeys = new Set(item.revealedByChoiceKeys ?? []);
    const branchKeys = new Set(item.revealedByBranchKeys ?? []);
    const branchPathAlternatives = item.revealedByBranchPathAlternatives ?? [];
    const groupChoiceKeys = [...group.choiceKeys];
    const groupBranchKeys = [...group.branchKeys];
    return (
        groupChoiceKeys.length > 0 && groupChoiceKeys.every((key) => choiceKeys.has(key))
    ) || (
        groupBranchKeys.length > 0 && groupBranchKeys.every((key) => branchKeys.has(key))
    ) || (
        groupBranchKeys.length > 0
        && groupBranchKeys.every((key) => branchPathAlternatives.some((alternative) => alternative.includes(key)))
    );
}

function collectChapterChoices(
    progression: QuestDetailProgression,
    entriesByKey: Record<string, QuestExplorerEntry>,
    showRawHiddenRows: boolean
): ChapterChoice[] {
    const choices: ChapterChoice[] = [];
    const seen = new Set<string>();

    progression.chapter.steps.forEach((step, stepIndex) => {
        const entry = entriesByKey[step.detailEntryKey] ?? null;
        const rawChoices = choicesForStep(step, entry, entriesByKey, {
            includeStepVariants: showRawHiddenRows || ((entry?.branches.length ?? 0) === 0),
        });
        const strategyChoices = correctStrategyChoiceOwnership(rawChoices);
        const filteredChoices = strategyChoices.filter((choice) => (
            !shouldHideChoiceFromChapterPlan(choice, strategyChoices, entry, progression, showRawHiddenRows)
        ));

        filteredChoices.forEach((choice) => {
            const key = choice.id;
            if (seen.has(key)) return;
            const stageOrder = stageOrderForChoice(choice, progression, step, stepIndex);
            if (stageOrder < 1 || stageOrder > progression.chapter.steps.length) return;
            seen.add(key);
            choices.push({
                choice,
                ownerEntry: entry,
                stageOrder,
                step: stepForChoice(choice, progression, step, stepIndex),
                stepIndex: stepIndexForChoice(choice, progression, stepIndex),
            });
        });
    });

    return choices;
}

function correctStrategyChoiceOwnership(choices: QuestPathChoice[]): QuestPathChoice[] {
    const correctedChoices = choices.map((choice) => {
        if (choice.sectionRole !== "continuation" || !choice.choiceKey) return choice;

        const choiceVariant = choiceFamilyVariant(choice.choiceKey);
        const parentVariant = choice.parentChoiceKey ? choiceFamilyVariant(choice.parentChoiceKey) : null;
        if (!choiceVariant || choiceVariant === parentVariant) return choice;

        const correctedParent = choices
            .filter((candidate) => (
                candidate.branchKey
                && candidate.choiceKey
                && candidate.id !== choice.id
                && choiceFamilyVariant(candidate.choiceKey) === choiceVariant
                && (candidate.branchStepOrder ?? 0) < (choice.branchStepOrder ?? Number.MAX_SAFE_INTEGER)
            ))
            .sort((left, right) => (right.branchStepOrder ?? 0) - (left.branchStepOrder ?? 0))[0];

        if (!correctedParent?.branchKey) return choice;

        return {
            ...choice,
            parentBranchKey: correctedParent.branchKey,
            parentChoiceKey: correctedParent.choiceKey,
            prerequisiteBranchKeys: uniqueStrings([
                correctedParent.branchKey,
                ...choice.prerequisiteBranchKeys.filter((branchKey) => branchKey !== choice.parentBranchKey),
            ]),
        };
    });
    const dependentParentBranchKeys = new Set(
        correctedChoices
            .filter((choice) => choice.sectionRole === "continuation")
            .flatMap((choice) => [
                choice.parentBranchKey,
                ...choice.prerequisiteBranchKeys,
            ])
            .filter((branchKey): branchKey is string => Boolean(branchKey))
    );

    return correctedChoices.map((choice) => (
        choice.branchKey && dependentParentBranchKeys.has(choice.branchKey)
            ? { ...choice, hasDependentContinuations: true }
            : choice
    ));
}

function choiceFamilyVariant(choiceKey: string): string | null {
    return choiceKey.match(/_Chapter\d+([A-Z])_/i)?.[1]?.toUpperCase() ?? null;
}

function shouldHideChoiceFromChapterPlan(
    choice: QuestPathChoice,
    rawChoices: QuestPathChoice[],
    displayEntry: QuestExplorerEntry | null,
    progression: QuestDetailProgression,
    showRawHiddenRows: boolean
): boolean {
    if (showRawHiddenRows) return false;
    return Boolean(
        hiddenNoLinkArtifactReason(choice, rawChoices)
        ?? hiddenUngatedContinuationReason(choice)
        ?? hiddenUnresolvedReason(choice, displayEntry, progression)
    );
}

function strategyChoiceAllowedForContext(choice: QuestPathChoice, stage: StrategyStageContext): boolean {
    if (choiceBlockedByUnselectedPriorChoice(choice, stage)) return false;
    if (!choice.choiceKey || !choiceFamilyVariant(choice.choiceKey)) return true;
    if (stage.revealContext.branchKeys.size === 0) return true;
    if (hasRevealMetadata(choice) && revealMetadataSatisfied(choice, stage.revealContext)) return true;
    if (choice.sectionRole !== "continuation") return true;
    const owningBranches = uniqueStrings([
        choice.parentBranchKey,
        ...choice.prerequisiteBranchKeys,
    ].filter((branchKey): branchKey is string => Boolean(branchKey)));
    if (owningBranches.length === 0) return true;
    return owningBranches.some((branchKey) => stage.revealContext.branchKeys.has(branchKey));
}

function stagePriorChoiceGroups(stage: StrategyStageContext): StrategyChoiceGroupRevealContext[] {
    return stage.priorChoiceGroups;
}

function stageOrderForChoice(
    choice: QuestPathChoice,
    progression: QuestDetailProgression,
    fallbackStep: QuestProgressionStep,
    fallbackStepIndex: number
): number {
    const byBranchOrder = stepIndexForBranchStepOrder(
        progression.chapter.steps,
        fallbackStep.detailEntryKey,
        choice.branchStepOrder,
        0
    );
    if (byBranchOrder != null) return byBranchOrder + 1;

    if (choice.branchStepOrder != null) {
        const byAnyStepOrder = progression.chapter.steps.findIndex((step, stepIndex) => (
            branchStepOrderForProgressionStep(step, stepIndex) === choice.branchStepOrder
        ));
        if (byAnyStepOrder >= 0) return byAnyStepOrder + 1;
        return progression.chapter.steps.length + 1;
    }

    const sourceStepIndex = choice.sourceEntryKey
        ? progression.chapter.steps.findIndex((step) => step.detailEntryKey === choice.sourceEntryKey)
        : -1;
    return (sourceStepIndex >= 0 ? sourceStepIndex : fallbackStepIndex) + 1;
}

function stepForChoice(
    choice: QuestPathChoice,
    progression: QuestDetailProgression,
    fallbackStep: QuestProgressionStep,
    fallbackStepIndex: number
): QuestProgressionStep {
    const stageOrder = stageOrderForChoice(choice, progression, fallbackStep, fallbackStepIndex);
    return progression.chapter.steps[stageOrder - 1] ?? fallbackStep;
}

function stepIndexForChoice(
    choice: QuestPathChoice,
    progression: QuestDetailProgression,
    fallbackStepIndex: number
): number {
    return stageOrderForChoice(choice, progression, progression.chapter.steps[fallbackStepIndex], fallbackStepIndex) - 1;
}

function groupChoicesByStage(
    chapterChoices: ChapterChoice[],
    stageContexts: StrategyStageContext[] | null = null
): Map<number, QuestPathChoice[]> {
    const allowedStages = stageContexts
        ? new Map(stageContexts.map((stage) => [stage.stageOrder, stage]))
        : null;
    const byStage = new Map<number, QuestPathChoice[]>();
    chapterChoices.forEach(({ choice, stageOrder }) => {
        const stage = allowedStages?.get(stageOrder);
        if (stage && !stage.isPreviewAllowed) return;
        if (stage && !strategyChoiceAllowedForContext(choice, stage)) return;
        if (stage && !stageItemVisible(choice, stage)) return;
        const choices = byStage.get(stageOrder) ?? [];
        choices.push(choice);
        byStage.set(stageOrder, choices);
    });
    byStage.forEach((choices) => {
        choices.sort((left, right) => (left.branchStepOrder ?? 0) - (right.branchStepOrder ?? 0));
    });
    return byStage;
}

function groupObjectivesByStage(
    progression: QuestDetailProgression,
    entriesByKey: Record<string, QuestExplorerEntry>,
    chapterChoices: ChapterChoice[],
    stageContexts: StrategyStageContext[]
): Map<number, StrategyDossierObjective[]> {
    const byStage = new Map<number, StrategyDossierObjective[]>();
    const allowedStageOrdersByEntry = new Map<string, number[]>();
    const stageContextByOrder = new Map(stageContexts.map((stage) => [stage.stageOrder, stage]));

    stageContexts.forEach((stage) => {
        if (!stage.isPreviewAllowed || !stage.displayEntry) return;
        const stages = allowedStageOrdersByEntry.get(stage.displayEntry.entryKey) ?? [];
        stages.push(stage.stageOrder);
        allowedStageOrdersByEntry.set(stage.displayEntry.entryKey, stages);
    });

    allowedStageOrdersByEntry.forEach((stageOrders, entryKey) => {
        const entry = entriesByKey[entryKey] ?? null;
        if (!entry) return;
        const allowedStageOrders = uniqueNumbers(stageOrders).sort((left, right) => left - right);
        entry.strategyView.objectives.forEach((objective, objectiveIndex) => {
            const objectiveChoiceKey = objective.choiceKey
                ?? choiceKeyForObjectiveKey(entry, objective.objectiveKey)
                ?? null;
            const matchedChoice = objectiveChoiceKey
                ? chapterChoices.find(({ choice }) => choice.choiceKey === objectiveChoiceKey)
                : null;
            const stageOrder = stageOrderForObjective(
                objective,
                objectiveIndex,
                entry,
                progression,
                chapterChoices,
                allowedStageOrders
            );
            if (stageOrder == null) return;
            const stageContext = stageContextByOrder.get(stageOrder);
            if (stageContext && matchedChoice && !strategyChoiceAllowedForContext(matchedChoice.choice, stageContext)) return;
            if (stageContext && !stageItemVisible(objective, stageContext)) return;
            const scope = { objectives: [objective], objectiveIndexOffset: objectiveIndex };
            const [dossierObjective] = buildStrategyDossierObjectives(
                scope,
                entry,
                isMinorFactionVariantQuest(entry)
            );
            if (!dossierObjective) return;
            const objectives = byStage.get(stageOrder) ?? [];
            objectives.push(dossierObjective);
            byStage.set(stageOrder, objectives);
        });
    });

    return byStage;
}

function groupObjectivesByChoiceKey(
    entriesByKey: Record<string, QuestExplorerEntry>,
    stageContexts: StrategyStageContext[]
): Map<string, StrategyDossierObjective[]> {
    const byChoiceKey = new Map<string, StrategyDossierObjective[]>();
    const allowedEntryKeys = uniqueDisplayValues(stageContexts
        .filter((stage) => stage.isPreviewAllowed && stage.displayEntry)
        .map((stage) => stage.displayEntry?.entryKey));

    allowedEntryKeys.forEach((entryKey) => {
        const entry = entriesByKey[entryKey];
        if (!entry) return;

        entry.strategyView.objectives.forEach((objective, objectiveIndex) => {
            const choiceKey = objective.choiceKey
                ?? choiceKeyForObjectiveKey(entry, objective.objectiveKey)
                ?? null;
            if (!choiceKey) return;

            const [dossierObjective] = buildStrategyDossierObjectives(
                { objectives: [{ ...objective, choiceKey }], objectiveIndexOffset: objectiveIndex },
                entry,
                isMinorFactionVariantQuest(entry)
            );
            if (!dossierObjective) return;

            const objectives = byChoiceKey.get(choiceKey) ?? [];
            objectives.push(dossierObjective);
            byChoiceKey.set(choiceKey, objectives);
        });
    });

    return byChoiceKey;
}

function stageOrderForObjective(
    objective: StrategyObjective,
    objectiveIndex: number,
    entry: QuestExplorerEntry,
    progression: QuestDetailProgression,
    chapterChoices: ChapterChoice[],
    allowedStageOrders: number[]
): number | null {
    const objectiveChoiceKey = objective.choiceKey
        ?? choiceKeyForObjectiveKey(entry, objective.objectiveKey)
        ?? null;
    const matchedChoice = objectiveChoiceKey
        ? chapterChoices.find(({ choice }) => choice.choiceKey === objectiveChoiceKey)
        : null;
    if (matchedChoice) return allowedStageOrder(matchedChoice.stageOrder, allowedStageOrders);
    if (objectiveChoiceKey) return null;

    const revealedChoice = chapterChoices.find(({ choice }) => (
        Boolean(choice.choiceKey && objective.revealedByChoiceKeys?.includes(choice.choiceKey))
        || Boolean(choice.branchKey && objective.revealedByBranchKeys?.includes(choice.branchKey))
    ));
    if (revealedChoice) return allowedStageOrder(revealedChoice.stageOrder, allowedStageOrders);

    const loreSection = objective.objectiveKey
        ? entry.loreView.sections.find((section) => section.objectiveKey === objective.objectiveKey)
        : null;
    if (loreSection?.stepIndex != null) {
        if (allowedStageOrders.length > 0) {
            return localStageOrder(loreSection.stepIndex, allowedStageOrders);
        }
        return Math.min(Math.max(loreSection.stepIndex + 1, 1), Math.max(progression.chapter.steps.length, 1));
    }

    const entryStepIndex = progression.chapter.steps.findIndex((step) => step.detailEntryKey === entry.entryKey);
    if (entryStepIndex >= 0) {
        const repeatedEntryStepCount = progression.chapter.steps.filter((step) => step.detailEntryKey === entry.entryKey).length;
        if (repeatedEntryStepCount > 1) {
            if (allowedStageOrders.length > 0) {
                return localStageOrder(objectiveIndex, allowedStageOrders);
            }
            return Math.min(objectiveIndex + 1, progression.chapter.steps.length);
        }
        return allowedStageOrder(entryStepIndex + 1, allowedStageOrders);
    }

    if (allowedStageOrders.length > 0) {
        return localStageOrder(objectiveIndex, allowedStageOrders);
    }
    return Math.min(objectiveIndex + 1, Math.max(progression.chapter.steps.length, 1));
}

function allowedStageOrder(stageOrder: number, allowedStageOrders: number[]): number | null {
    if (allowedStageOrders.length === 0) return stageOrder;
    return allowedStageOrders.includes(stageOrder) ? stageOrder : null;
}

function localStageOrder(localIndex: number, allowedStageOrders: number[]): number | null {
    if (allowedStageOrders.length === 0) return null;
    if (localIndex < 0 || localIndex >= allowedStageOrders.length) return null;
    return allowedStageOrders[localIndex] ?? null;
}

function choiceKeyForObjectiveKey(entry: QuestExplorerEntry, objectiveKey: string | null): string | null {
    if (!objectiveKey) return null;
    return entry.loreView.sections.find((section) => (
        section.objectiveKey === objectiveKey && section.choiceKey
    ))?.choiceKey ?? null;
}

function syntheticRenderedStep({
    step,
    stepIndex,
    displayEntry,
    choices,
    selectedChoice,
    isActive,
}: {
    step: QuestProgressionStep;
    stepIndex: number;
    displayEntry: QuestExplorerEntry | null;
    choices: QuestPathChoice[];
    selectedChoice: QuestPathChoiceSelection | null;
    isActive: boolean;
}): RenderedPathStep {
    const revealContext: RevealContext = {
        branchKeys: new Set(),
        choiceKeys: new Set(),
        branchPath: [],
    };
    if (selectedChoice) {
        if (selectedChoice.branchKey) revealContext.branchKeys.add(selectedChoice.branchKey);
        if (selectedChoice.choiceKey) revealContext.choiceKeys.add(selectedChoice.choiceKey);
    }

    return {
        step,
        stepIndex,
        displayEntry,
        choices,
        revealedContinuations: [],
        autoContinuedChoices: [],
        currentBeatChoice: null,
        selectedChoice,
        choiceDiagnostics: {
            normalVisibleChoiceCount: choices.length,
            debugVisibleChoiceCount: choices.length,
            hiddenArtifactCount: 0,
            hiddenUnresolvedCount: 0,
            hiddenContinuationCount: 0,
            hiddenReasonsByChoiceId: new Map(),
        },
        isActive,
        repeatsDetailEntry: false,
        rendersRepeatedDetailContent: false,
        revealedContinuationsBecomeSteps: false,
        revealContext,
    };
}

function selectedSelectionForChoices(
    step: QuestProgressionStep,
    choices: QuestPathChoice[],
    selectedByStepKey: Map<string, QuestPathChoiceSelection[]>
): QuestPathChoiceSelection | null {
    const storedSelections = selectedByStepKey.get(step.stepKey) ?? [];
    const selected = [...storedSelections].reverse().find((selection) => (
        choices.some((choice) => choiceMatchesSelection(choice, selection))
    ));
    if (selected) return selected;

    return null;
}

function selectionsByStepKey(choicePath: QuestPathChoiceSelection[]): Map<string, QuestPathChoiceSelection[]> {
    const byStep = new Map<string, QuestPathChoiceSelection[]>();
    choicePath.forEach((selection) => {
        const selections = byStep.get(selection.stepKey) ?? [];
        selections.push(selection);
        byStep.set(selection.stepKey, selections);
    });
    return byStep;
}

function choiceMatchesSelection(choice: QuestPathChoice, selection: QuestPathChoiceSelection): boolean {
    return choice.id === selection.choiceId
        || Boolean(selection.branchKey && choice.branchKey === selection.branchKey)
        || Boolean(selection.choiceKey && choice.choiceKey === selection.choiceKey);
}

function unresolvedChoiceIdsForStage(
    choices: QuestPathChoice[],
    displayEntry: QuestExplorerEntry | null,
    progression: QuestDetailProgression
): ReadonlySet<string> {
    const unresolvedChoiceIds = new Set<string>();
    choices.forEach((choice) => {
        if (hiddenUnresolvedReason(choice, displayEntry, progression)?.category === "unresolved") {
            unresolvedChoiceIds.add(choice.id);
        }
    });
    return unresolvedChoiceIds;
}

function decisionPointChoicesForStage(
    options: StrategyDossierBranchOption[],
    showRawHiddenRows: boolean
): StrategyDossierBranchOption[] {
    return buildDecisionPointGroups(options, showRawHiddenRows)
        .flatMap((group) => group.options);
}

function buildDecisionPointsForStage({
    stageOrder,
    stageLabel,
    step,
    options,
    dossier,
    showRawHiddenRows,
}: {
    stageOrder: number;
    stageLabel: string;
    step: QuestProgressionStep;
    options: StrategyDossierBranchOption[];
    dossier: StrategyDossierModel;
    showRawHiddenRows: boolean;
}): StrategyDecisionPoint[] {
    return buildDecisionPointGroups(options, showRawHiddenRows).map((group) => ({
        id: `${step.stepKey}:decision:${group.id}`,
        kind: group.kind,
        stageOrder,
        stageLabel,
        title: decisionPointTitle(group),
        step,
        options: group.options,
        outcomePreview: dossier.outcomePreview,
        continuationStatus: dossier.continuationStatus,
    }));
}

type DecisionPointGroup = {
    id: string;
    kind: StrategyDecisionPointKind;
    label: string;
    options: StrategyDossierBranchOption[];
};

function buildDecisionPointGroups(
    options: StrategyDossierBranchOption[],
    showRawHiddenRows: boolean
): DecisionPointGroup[] {
    const groups = new Map<string, DecisionPointGroup>();
    options.forEach((option) => {
        const kind = decisionPointKindForChoice(option.choice);
        if (!kind) return;
        const id = `${kind}:${strategyComparisonGroupId(option.choice)}`;
        const group = groups.get(id) ?? {
            id,
            kind,
            label: strategyComparisonGroupLabel(option.choice),
            options: [],
        };
        group.options.push(option);
        groups.set(id, group);
    });

    return [...groups.values()]
        .map((group) => {
            const kind = decisionPointGroupKind(group);
            return {
                ...group,
                kind,
                options: kind === "path_variant" && !showRawHiddenRows
                    ? dedupeCompletionOptions(group.options)
                    : group.options,
            };
        })
        .filter((group) => uniqueNormalizedLabels(group.options).length > 1);
}

function decisionPointGroupKind(group: DecisionPointGroup): StrategyDecisionPointKind {
    if (group.kind !== "path_variant") return group.kind;
    if (group.options.some((option) => option.choice.hasDependentContinuations)) return "explicit_choice";
    return group.kind;
}

function decisionPointKindForChoice(choice: QuestPathChoice): StrategyDecisionPointKind | null {
    if (isNecrophageCh6Choice(choice)) return "explicit_choice";
    if (choice.semanticStageKind === "explicit_decision_option") return "explicit_choice";
    if (
        choice.semanticStageKind === "unknown"
        || choice.semanticStageKind === "convergence"
        || choice.semanticStageKind === "terminal"
        || choice.semanticStageKind === "failure"
        || choice.semanticStageKind === "unresolved"
    ) {
        return "explicit_choice";
    }
    if (choice.sectionRole === "continuation") return "path_variant";
    if (choice.semanticStageKind === "topology_fork_option") return "topology_alternative";
    return null;
}

function dedupeCompletionOptions(options: StrategyDossierBranchOption[]): StrategyDossierBranchOption[] {
    const byLabel = new Map<string, StrategyDossierBranchOption>();
    options.forEach((option) => {
        const key = normalizeValue(option.label);
        const existing = byLabel.get(key);
        if (!existing || completionOptionScore(option) > completionOptionScore(existing)) {
            byLabel.set(key, option);
        }
    });
    return [...byLabel.values()];
}

function completionOptionScore(option: StrategyDossierBranchOption): number {
    return option.requirementDetails.length
        + option.rewardDetails.length
        + option.requirements.length
        + option.rewards.length;
}

function decisionPointTitle(group: DecisionPointGroup): string {
    if (group.kind === "path_variant") return "Path variants";
    if (group.kind === "topology_alternative") return "Possible continuations";
    return "Choose a path";
}

function selectedOrFirstPlanOption(options: StrategyDossierBranchOption[]): StrategyDossierBranchOption | null {
    return options.find((option) => option.isSelected || option.isInSelectedPath) ?? options[0] ?? null;
}

function strategyTaskTitle({
    taskOption,
    objectiveRoutes,
    fallbackTitle,
    activeSelection,
}: {
    taskOption: StrategyDossierBranchOption | null;
    objectiveRoutes: StrategyDossierObjectiveRoute[];
    fallbackTitle: string;
    activeSelection: QuestPathChoiceSelection | null;
}): string {
    if (objectiveRoutes.length <= 1) return taskOption?.label ?? fallbackTitle;

    const optionLabel = normalizeValue(taskOption?.label ?? "");
    const duplicatesObjective = objectiveRoutes.some((route) => normalizeValue(route.objective.text) === optionLabel);
    if (!duplicatesObjective && taskOption?.label) return taskOption.label;

    return activeSelection?.label
        ? `${activeSelection.label} path objectives`
        : "Path objectives";
}

function routeLevelRequirementDetails(
    taskOption: StrategyDossierBranchOption | null,
    objectiveRoutes: StrategyDossierObjectiveRoute[]
): QuestRequirementDisplay[] {
    const routeRequirements = new Set(
        objectiveRoutes.flatMap((route) => route.objective.requirements).map(normalizeValue)
    );
    return uniqueRequirementDisplays((taskOption?.requirementDetails ?? []).filter((requirement) => (
        !routeRequirements.has(normalizeValue(requirement.displayText))
    )));
}

function routeLevelRewardDetails(
    taskOption: StrategyDossierBranchOption | null,
    objectiveRoutes: StrategyDossierObjectiveRoute[]
): QuestRewardDisplay[] {
    const routeRewards = new Set(
        objectiveRoutes.flatMap((route) => route.objective.rewards).map(normalizeValue)
    );
    return uniqueRewardDisplays((taskOption?.rewardDetails ?? []).filter((reward) => (
        !routeRewards.has(normalizeValue(reward.displayText))
    )));
}

function taskSemanticKind(kind: QuestSemanticStageKind | null): StrategyChapterTaskSemanticKind {
    switch (kind) {
        case "setup_task":
            return "setup";
        case "deterministic_continuation":
            return "deterministic_continuation";
        case "terminal":
            return "terminal";
        case "failure":
            return "failure";
        case "unresolved":
            return "unresolved";
        default:
            return "task";
    }
}

function taskStatusForStage(
    stageOrder: number,
    activeStageOrder: number,
    option: StrategyDossierBranchOption | null
): StrategyChapterTaskStatus {
    if (option?.isSelected || stageOrder === activeStageOrder) return "selected";
    if (stageOrder > activeStageOrder) return "preview";
    return "available";
}

function taskContinuationStatus(
    option: StrategyDossierBranchOption | null,
    autoContinuedBranchKeys: Set<string>,
    autoContinuedChapterExitStatus: StrategyPathStatus | null
): StrategyPathStatus | null {
    if (!option?.choice.branchKey || !autoContinuedChapterExitStatus) return null;
    return autoContinuedBranchKeys.has(option.choice.branchKey)
        ? autoContinuedChapterExitStatus
        : null;
}

function continuationPreviewForFlow(flow: QuestPathFlow): StrategyContinuationPreview {
    if (!flow.reachedContinuationEntryKey && !flow.unresolvedContinuation) return null;
    return {
        title: flow.unresolvedContinuation ? "Unknown continuation" : "Continues beyond this chapter",
        targetLabel: flow.reachedContinuationEntryKey,
    };
}

function strategyRevealContext(
    renderedSteps: RenderedPathStep[],
    choicePath: QuestPathChoiceSelection[] = []
): StrategyRevealContext {
    const context: StrategyRevealContext = {
        branchKeys: new Set(),
        explicitBranchKeys: new Set(),
        choiceKeys: new Set(),
        branchPath: [],
    };
    choicePath.forEach((selection) => addSelectionToRevealContext(context, selection, true));
    renderedSteps.forEach((step) => {
        [step.currentBeatChoice, step.selectedChoice].forEach((selection) => {
            addSelectionToRevealContext(context, selection, false);
        });
    });
    return context;
}

function addSelectionToRevealContext(
    context: StrategyRevealContext,
    selection: QuestPathChoiceSelection | null,
    isExplicit: boolean
): void {
    if (!selection || selection.isPassive) return;
    if (selection.branchKey) {
        context.branchKeys.add(selection.branchKey);
        if (isExplicit) context.explicitBranchKeys.add(selection.branchKey);
        context.branchPath.push(selection.branchKey);
    }
    if (selection.choiceKey) context.choiceKeys.add(selection.choiceKey);
}

function revealMetadataSatisfied(
    item: Pick<QuestPathChoice, "revealedByBranchKeys" | "revealedByChoiceKeys" | "revealedByBranchPathAlternatives">
        | Pick<StrategyObjective, "revealedByBranchKeys" | "revealedByChoiceKeys" | "revealedByBranchPathAlternatives">,
    context: StrategyRevealContext
): boolean {
    const branchKeys = item.revealedByBranchKeys ?? [];
    const choiceKeys = item.revealedByChoiceKeys ?? [];
    const branchPathAlternatives = item.revealedByBranchPathAlternatives ?? [];
    return branchKeys.some((key) => context.branchKeys.has(key))
        || choiceKeys.some((key) => context.choiceKeys.has(key))
        || branchPathAlternatives.some((alternative) => (
            alternative.length > 0 && alternative.every((key) => context.branchPath.includes(key))
        ));
}

function uniqueNormalizedLabels(options: StrategyDossierBranchOption[]): string[] {
    return uniqueDisplayValues(options.map((option) => option.label)).map(normalizeValue);
}

function uniqueNumbers(values: number[]): number[] {
    return [...new Set(values)];
}

function uniqueDisplayValues(values: Array<string | null | undefined>): string[] {
    const seen = new Set<string>();
    const result: string[] = [];
    values.forEach((value) => {
        const trimmed = value?.trim() ?? "";
        const normalized = normalizeValue(trimmed);
        if (!normalized || seen.has(normalized)) return;
        seen.add(normalized);
        result.push(trimmed);
    });
    return result;
}

function normalizeValue(value: string): string {
    return value.trim().toLowerCase();
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
