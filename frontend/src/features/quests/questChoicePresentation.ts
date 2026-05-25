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

export type ChoicePresentationGroups = {
    structuralContextChoices: QuestPathChoice[];
    primaryChoices: QuestPathChoice[];
    activeContinuationChoices: QuestPathChoice[];
    selectedPathBranchKeys: Set<string>;
};

function choiceTargetsCurrentDisplayStep(
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

function isStructuralContextChoice(
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
    if (!choiceTargetsCurrentDisplayStep(step, choice, displayEntry, entriesByKey)) return false;

    return [choice.label, choice.continuationTitle]
        .filter(Boolean)
        .some((label) => label === displayEntry.title);
}

function selectedPathBranchKeys(
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

export function choicePresentationGroups(
    step: QuestProgressionStep,
    choices: QuestPathChoice[],
    selectedChoice: QuestPathChoiceSelection | null,
    displayEntry: QuestExplorerEntry | null,
    entriesByKey: Record<string, QuestExplorerEntry>,
    showRawHiddenRows: boolean
): ChoicePresentationGroups {
    const structuralContextChoices = choices.filter((choice) => (
        isStructuralContextChoice(step, choice, displayEntry, entriesByKey, showRawHiddenRows)
    ));
    const structuralIds = new Set(structuralContextChoices.map((choice) => choice.id));
    const actionableChoices = choices.filter((choice) => !structuralIds.has(choice.id));
    const activeContinuationChoices = showRawHiddenRows
        ? []
        : actionableChoices.filter((choice) => (
            choice.sectionRole === "continuation" && choice.prerequisiteBranchKeys.length > 0
        ));
    const continuationIds = new Set(activeContinuationChoices.map((choice) => choice.id));

    return {
        structuralContextChoices,
        primaryChoices: actionableChoices.filter((choice) => !continuationIds.has(choice.id)),
        activeContinuationChoices,
        selectedPathBranchKeys: selectedPathBranchKeys(choices, selectedChoice),
    };
}
