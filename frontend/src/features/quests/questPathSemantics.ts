import type { QuestChoiceDto, QuestStepDto } from "@/types/questTypes";

const clean = (value: string | null | undefined): string => (value ?? "").trim();

const cleanLines = (lines: readonly string[] | null | undefined): string[] =>
    (lines ?? []).map(clean).filter((line) => line.length > 0);

const normalizeText = (value: string | null | undefined): string => clean(value).toLowerCase().replace(/\s+/g, " ");

const hasLines = (lines: readonly string[] | null | undefined): boolean => cleanLines(lines).length > 0;

function hasStepObjective(step: QuestStepDto): boolean {
    return clean(step.objectiveText).length > 0 || hasLines(step.descriptionLines);
}

function hasStepRequirements(step: QuestStepDto): boolean {
    return (
        hasLines(step.selectionPrerequisiteLines) ||
        hasLines(step.completionPrerequisiteLines) ||
        hasLines(step.failurePrerequisiteLines) ||
        hasLines(step.forbiddenPrerequisiteLines)
    );
}

function hasStepDialog(step: QuestStepDto): boolean {
    return cleanLines(step.dialogBlockIdentities).length > 0;
}

export function isInternalEffectChoice(choice: QuestChoiceDto): boolean {
    return /EffectChoiceDefinition$/i.test(clean(choice.choiceKey));
}

function stepSignature(step: QuestStepDto): string {
    return [
        normalizeText(step.objectiveText),
        cleanLines(step.descriptionLines).map(normalizeText).join("|"),
        cleanLines(step.selectionPrerequisiteLines).map(normalizeText).join("|"),
        cleanLines(step.completionPrerequisiteLines).map(normalizeText).join("|"),
        cleanLines(step.failurePrerequisiteLines).map(normalizeText).join("|"),
        cleanLines(step.forbiddenPrerequisiteLines).map(normalizeText).join("|"),
        cleanLines(step.rewardDisplayLines).map(normalizeText).join("|"),
        clean(step.nextQuestKey),
        clean(step.failQuestKey),
    ].join("::");
}

function choiceSignature(choice: QuestChoiceDto): string {
    return [
        normalizeText(choice.displayName),
        cleanLines(choice.descriptionLines).map(normalizeText).join("|"),
        cleanLines(choice.completionPrerequisiteLines).map(normalizeText).join("|"),
        cleanLines(choice.failurePrerequisiteLines).map(normalizeText).join("|"),
        cleanLines(choice.rewardDisplayLines).map(normalizeText).join("|"),
        cleanLines(choice.nextQuestKeys).join("|"),
        choice.steps.map(stepSignature).join("||"),
    ].join("::");
}

function choiceScore(choice: QuestChoiceDto): number {
    const steps = choice.steps ?? [];
    const objectiveScore = steps.filter(hasStepObjective).length * 20;
    const requirementScore = steps.filter(hasStepRequirements).length * 8;
    const dialogScore = steps.filter(hasStepDialog).length * 30;
    const rewardScore = cleanLines(choice.rewardDisplayLines).length * 6;

    return objectiveScore + requirementScore + dialogScore + rewardScore;
}

export function buildUserFacingQuestChoices(choices: readonly QuestChoiceDto[]): QuestChoiceDto[] {
    const bySignature = new Map<string, { choice: QuestChoiceDto; score: number }>();
    const orderedSignatures: string[] = [];

    choices.forEach((choice) => {
        if (isInternalEffectChoice(choice)) return;

        const signature = choiceSignature(choice);
        const score = choiceScore(choice);
        const existing = bySignature.get(signature);

        if (!existing) {
            orderedSignatures.push(signature);
            bySignature.set(signature, { choice, score });
            return;
        }

        if (score > existing.score) {
            bySignature.set(signature, { choice, score });
        }
    });

    return orderedSignatures
        .map((signature) => bySignature.get(signature)?.choice)
        .filter((choice): choice is QuestChoiceDto => Boolean(choice));
}
