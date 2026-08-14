import {
    choiceKindLabel,
    locationLabel,
    progressionLocationForKeys,
    selectedChoiceContinuationKeys,
    selectedChoiceTargetKeys,
    selectionForChoice,
    stepIndexForKeys,
    type ChoiceVisibilityDiagnostics,
    type NormalHiddenChoiceReason,
    type QuestDetailProgression,
    type QuestPathChoice,
} from "@/features/quests/questPathFlow";
import { chapterPositionLabel, stepPositionLabel } from "@/features/quests/questDisplay";
import type { QuestExplorerEntry, QuestExplorerProgression, QuestProgressionStep } from "@/types/questTypes";

function entryNavigationLocationLabel(entry: QuestExplorerEntry | null): string | null {
    if (!entry) return null;
    const chapter = entry.navigation.chapterLabel
        ?? (entry.navigation.chapter != null ? `Chapter ${entry.navigation.chapter}` : null);
    const step = entry.navigation.stepLabel
        ?? (entry.navigation.step != null ? `Step ${entry.navigation.step}` : null);
    const location = [chapter, step].filter(Boolean).join(" ");
    return location ? `${location} (${entry.entryKey})` : entry.entryKey;
}

function choiceOriginLabel(
    step: QuestProgressionStep,
    choice: QuestPathChoice,
    progression: QuestDetailProgression,
    entriesByKey: Record<string, QuestExplorerEntry>
): string {
    const renderedAt = `${chapterPositionLabel(progression.chapter)} ${stepPositionLabel(step)}`;
    const owner = entryNavigationLocationLabel(choice.sourceEntryKey ? entriesByKey[choice.sourceEntryKey] ?? null : null);
    return owner ? `shown at ${renderedAt}; owner ${owner}` : `shown at ${renderedAt}; owner unknown`;
}

function choiceDebugDestination(
    step: QuestProgressionStep,
    choice: QuestPathChoice,
    progression: QuestDetailProgression,
    fullProgression: QuestExplorerProgression | null,
    entriesByKey: Record<string, QuestExplorerEntry>,
    hiddenReason: NormalHiddenChoiceReason | null
): string {
    const currentStepIndex = progression.chapter.steps.findIndex((candidate) => candidate.stepKey === step.stepKey);
    const selection = selectionForChoice(step.stepKey, choice);
    const targetKeys = selectedChoiceTargetKeys(selection);
    const continuationKeysForChoice = selectedChoiceContinuationKeys(selection, entriesByKey);
    const continuationOnlyKeys = continuationKeysForChoice.filter((key) => !targetKeys.includes(key));
    const continuationLookupKeys = continuationOnlyKeys.length > 0 ? continuationOnlyKeys : continuationKeysForChoice;
    const targetStepIndex = stepIndexForKeys(progression.chapter.steps, targetKeys, entriesByKey, currentStepIndex);
    const continuationStepIndex = stepIndexForKeys(
        progression.chapter.steps,
        continuationLookupKeys,
        entriesByKey,
        currentStepIndex < 0 ? 0 : currentStepIndex + 1
    );
    const kind = choiceKindLabel(choice);
    const origin = choiceOriginLabel(step, choice, progression, entriesByKey);
    const metadata = choice.branchKey
        ? [
            choice.sectionRole ? `role=${choice.sectionRole}` : null,
            choice.branchStepOrder != null ? `branchStepOrder=${choice.branchStepOrder}` : null,
            choice.prerequisiteBranchKeys.length > 0 ? `requires=${choice.prerequisiteBranchKeys.join(",")}` : null,
            choice.parentBranchKey ? `parent=${choice.parentBranchKey}` : null,
            choice.parentChoiceKey ? `parentChoice=${choice.parentChoiceKey}` : null,
            choice.revealedByBranchKeys.length > 0 ? `revealedByBranches=${choice.revealedByBranchKeys.join(",")}` : null,
            choice.revealedByChoiceKeys.length > 0 ? `revealedByChoices=${choice.revealedByChoiceKeys.join(",")}` : null,
            choice.revealedByBranchPathAlternatives.length > 0
                ? `revealedByPaths=${choice.revealedByBranchPathAlternatives.map((path) => path.join(">")).join("|")}`
                : null,
            choice.choiceGroupKey ? `choiceGroup=${choice.choiceGroupKey}` : null,
            choice.convergenceGroupKey ? `convergence=${choice.convergenceGroupKey}` : null,
        ].filter(Boolean).join("; ")
        : "";
    const metadataNote = metadata ? `; ${metadata}` : "";
    const hiddenNormal = hiddenReason ? `; hidden in normal UI: ${hiddenReason.message}` : "";

    if (kind === "variant" && targetStepIndex === currentStepIndex) {
        const continuationLocation = progressionLocationForKeys(fullProgression, continuationLookupKeys, entriesByKey);
        const continuationLabel = continuationStepIndex != null
            ? `${chapterPositionLabel(progression.chapter)} ${stepPositionLabel(progression.chapter.steps[continuationStepIndex])}`
            : locationLabel(continuationLocation, entriesByKey);
        return continuationLabel
            ? `Debug: ${origin}; variant -> current step variant; then ${continuationLabel}${metadataNote}${hiddenNormal}`
            : `Debug: ${origin}; variant -> current step variant; continuation unresolved${metadataNote}${hiddenNormal}`;
    }

    if (continuationStepIndex != null) {
        return `Debug: ${origin}; ${kind} -> ${chapterPositionLabel(progression.chapter)} ${stepPositionLabel(progression.chapter.steps[continuationStepIndex])}${metadataNote}${hiddenNormal}`;
    }

    const continuationLocation = progressionLocationForKeys(fullProgression, continuationLookupKeys, entriesByKey);
    if (continuationLocation) {
        return `Debug: ${origin}; ${kind} -> ${locationLabel(continuationLocation, entriesByKey)}${metadataNote}${hiddenNormal}`;
    }

    if (targetStepIndex != null) {
        const targetStep = progression.chapter.steps[targetStepIndex];
        const sameStepNote = targetStep.stepKey === step.stepKey ? "current step" : stepPositionLabel(targetStep);
        return `Debug: ${origin}; ${kind} -> ${chapterPositionLabel(progression.chapter)} ${sameStepNote}${metadataNote}${hiddenNormal}`;
    }

    const targetLocation = progressionLocationForKeys(fullProgression, targetKeys, entriesByKey);
    if (targetLocation) {
        return `Debug: ${origin}; ${kind} -> ${locationLabel(targetLocation, entriesByKey)}${metadataNote}${hiddenNormal}`;
    }

    return `Debug: ${origin}; ${kind} -> unresolved, no modeled continuation${metadataNote}${hiddenNormal}`;
}

export function choiceDebugDetailsForStep(
    step: QuestProgressionStep,
    choices: QuestPathChoice[],
    diagnostics: ChoiceVisibilityDiagnostics,
    progression: QuestDetailProgression,
    fullProgression: QuestExplorerProgression | null,
    entriesByKey: Record<string, QuestExplorerEntry>,
    revealedChoices: QuestPathChoice[] = []
): Map<string, string> {
    const revealedChoiceIds = new Set(revealedChoices.map((choice) => choice.id));
    return new Map(choices.map((choice) => [
        choice.id,
        choiceDebugDestination(
            step,
            choice,
            progression,
            fullProgression,
            entriesByKey,
            revealedChoiceIds.has(choice.id) ? null : diagnostics.hiddenReasonsByChoiceId.get(choice.id) ?? null
        ),
    ]));
}

export function stepTitle(
    step: QuestProgressionStep,
    entry: QuestExplorerEntry | null,
    entriesByKey: Record<string, QuestExplorerEntry>
): string {
    return entry?.title || step.title || entriesByKey[step.detailEntryKey]?.title || "Unknown Horizons";
}

