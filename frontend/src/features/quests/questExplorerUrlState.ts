import type { QuestPathChoiceSelection } from "./questPathFlow";

export const QUEST_CHOICE_QUERY_PARAM = "choice";

type SerializedChoiceSelection = {
    stepKey: string;
    choiceId: string;
    branchKey: string | null;
    choiceKey: string | null;
    sectionRole: string | null;
    semanticStageKind: QuestPathChoiceSelection["semanticStageKind"];
    choiceGroupKey: string | null;
    branchStepOrder: number | null;
    hasDependentContinuations: boolean;
    label: string;
    targetEntryKey: string | null;
    nextEntryKeys: string[];
};

export function encodeQuestChoicePath(choicePath: QuestPathChoiceSelection[]): string[] {
    return choicePath.map((selection) => JSON.stringify(toSerializedSelection(selection)));
}

export function decodeQuestChoicePath(tokens: string[]): QuestPathChoiceSelection[] {
    return tokens
        .map(decodeQuestChoiceSelection)
        .filter((selection): selection is QuestPathChoiceSelection => selection !== null);
}

export function questChoicePathTokensEqual(left: string[], right: string[]): boolean {
    if (left.length !== right.length) return false;
    return left.every((value, index) => value === right[index]);
}

function decodeQuestChoiceSelection(token: string): QuestPathChoiceSelection | null {
    try {
        const parsed = JSON.parse(token) as Partial<SerializedChoiceSelection>;
        if (!isNonBlankString(parsed.stepKey) || !isNonBlankString(parsed.choiceId)) return null;
        if (!isNonBlankString(parsed.label)) return null;

        return {
            stepKey: parsed.stepKey,
            choiceId: parsed.choiceId,
            branchKey: stringOrNull(parsed.branchKey),
            choiceKey: stringOrNull(parsed.choiceKey),
            sectionRole: stringOrNull(parsed.sectionRole),
            semanticStageKind: parsed.semanticStageKind ?? "unknown",
            choiceGroupKey: stringOrNull(parsed.choiceGroupKey),
            branchStepOrder: numberOrNull(parsed.branchStepOrder),
            hasDependentContinuations: parsed.hasDependentContinuations === true,
            label: parsed.label,
            targetEntryKey: stringOrNull(parsed.targetEntryKey),
            nextEntryKeys: Array.isArray(parsed.nextEntryKeys)
                ? parsed.nextEntryKeys.filter(isNonBlankString)
                : [],
        };
    } catch {
        return null;
    }
}

function toSerializedSelection(selection: QuestPathChoiceSelection): SerializedChoiceSelection {
    return {
        stepKey: selection.stepKey,
        choiceId: selection.choiceId,
        branchKey: selection.branchKey,
        choiceKey: selection.choiceKey,
        sectionRole: selection.sectionRole,
        semanticStageKind: selection.semanticStageKind,
        choiceGroupKey: selection.choiceGroupKey,
        branchStepOrder: selection.branchStepOrder,
        hasDependentContinuations: selection.hasDependentContinuations,
        label: selection.label,
        targetEntryKey: selection.targetEntryKey,
        nextEntryKeys: selection.nextEntryKeys,
    };
}

function isNonBlankString(value: unknown): value is string {
    return typeof value === "string" && value.trim().length > 0;
}

function stringOrNull(value: unknown): string | null {
    return isNonBlankString(value) ? value : null;
}

function numberOrNull(value: unknown): number | null {
    return typeof value === "number" && Number.isFinite(value) ? value : null;
}
