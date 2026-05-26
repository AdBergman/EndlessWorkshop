import {
    entryKeysWithAliases,
    stepIdentityKeys,
    uniqueStrings,
    type QuestPathChoice,
    type QuestPathChoiceSelection,
} from "@/features/quests/questPathFlow";
import type {
    QuestExplorerEntry,
    QuestProgressionStep,
} from "@/types/questTypes";

export type StagePresentationGroups = {
    structuralContextStages: QuestPathChoice[];
    primaryStages: QuestPathChoice[];
    activeContinuationStages: QuestPathChoice[];
    selectedContextBranchKeys: Set<string>;
};

function stageTargetsCurrentDisplayStep(
    step: QuestProgressionStep,
    choice: QuestPathChoice,
    displayEntry: QuestExplorerEntry | null,
    entriesByKey: Record<string, QuestExplorerEntry>
): boolean {
    if (!displayEntry) return false;

    const stepKeys = new Set(stepIdentityKeys(step).flatMap((key) => entryKeysWithAliases(key, entriesByKey)));
    return uniqueStrings([choice.targetEntryKey, ...choice.nextEntryKeys])
        .flatMap((key) => entryKeysWithAliases(key, entriesByKey))
        .some((key) => stepKeys.has(key));
}

function isStructuralContextStage(
    step: QuestProgressionStep,
    choice: QuestPathChoice,
    displayEntry: QuestExplorerEntry | null,
    entriesByKey: Record<string, QuestExplorerEntry>,
    showRawHiddenRows: boolean
): boolean {
    if (showRawHiddenRows) return false;
    if (!choice.id.startsWith("variant:")) return false;
    if (!displayEntry) return false;
    if (choice.requirementLines.length > 0 || choice.rewardLines.length > 0) return false;
    if (!stageTargetsCurrentDisplayStep(step, choice, displayEntry, entriesByKey)) return false;

    return [choice.label, choice.continuationTitle]
        .filter(Boolean)
        .some((label) => label === displayEntry.title);
}

function selectedContextBranchKeys(
    choices: QuestPathChoice[],
    selectedChoice: QuestPathChoiceSelection | null
): Set<string> {
    if (!selectedChoice) return new Set();
    const selected = choices.find((choice) => choice.id === selectedChoice.choiceId);
    return new Set([
        ...(selected?.prerequisiteBranchKeys ?? []),
        selected?.parentBranchKey ?? null,
    ].filter((branchKey): branchKey is string => Boolean(branchKey)));
}

export function stagePresentationGroups(
    step: QuestProgressionStep,
    choices: QuestPathChoice[],
    selectedChoice: QuestPathChoiceSelection | null,
    displayEntry: QuestExplorerEntry | null,
    entriesByKey: Record<string, QuestExplorerEntry>,
    showRawHiddenRows: boolean
): StagePresentationGroups {
    const structuralContextStages = choices.filter((choice) => (
        isStructuralContextStage(step, choice, displayEntry, entriesByKey, showRawHiddenRows)
    ));
    const structuralIds = new Set(structuralContextStages.map((choice) => choice.id));
    const actionableStages = choices.filter((choice) => !structuralIds.has(choice.id));
    const activeContinuationStages = showRawHiddenRows
        ? []
        : actionableStages.filter((choice) => (
            choice.sectionRole === "continuation" && choice.prerequisiteBranchKeys.length > 0
        ));
    const continuationIds = new Set(activeContinuationStages.map((choice) => choice.id));

    return {
        structuralContextStages,
        primaryStages: actionableStages.filter((choice) => !continuationIds.has(choice.id)),
        activeContinuationStages,
        selectedContextBranchKeys: selectedContextBranchKeys(choices, selectedChoice),
    };
}
