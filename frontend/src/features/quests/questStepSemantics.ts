import type { QuestStepDto } from "@/types/questTypes";

export type QuestStepSemanticKind = "objective" | "progressGate";

export type QuestStepGateVariant = {
    stepIndex: number;
    selectionLines: string[];
    completionLines: string[];
    failureLines: string[];
    forbiddenLines: string[];
    rewardLines: string[];
};

export type QuestStepSemanticGroup = {
    id: string;
    kind: QuestStepSemanticKind;
    title: string;
    representativeStepIndex: number;
    stepIndexes: number[];
    nextQuestKey: string | null;
    failQuestKey: string | null;
    variants: QuestStepGateVariant[];
};

const clean = (value: string | null | undefined): string => (value ?? "").trim();

const cleanLines = (lines: readonly string[] | null | undefined): string[] =>
    (lines ?? []).map(clean).filter((line) => line.length > 0);

const normalizeText = (value: string): string => clean(value).toLowerCase().replace(/\s+/g, " ");

const thresholdLinePatterns = [
    /:\s*\d+%/,
    /property requirement:\s*.+?=\s*\d+/i,
    /greaterorequal\s+\d+/i,
    /\{0\}/,
];

export function isThresholdLikeLine(line: string): boolean {
    return thresholdLinePatterns.some((pattern) => pattern.test(line));
}

function hasThresholdLikeLines(step: QuestStepDto): boolean {
    return [
        ...cleanLines(step.selectionPrerequisiteLines),
        ...cleanLines(step.completionPrerequisiteLines),
        ...cleanLines(step.failurePrerequisiteLines),
        ...cleanLines(step.forbiddenPrerequisiteLines),
    ].some(isThresholdLikeLine);
}

function equivalentDialogSignature(step: QuestStepDto): string {
    return cleanLines(step.dialogBlockIdentities)
        .map((identity) => {
            const parts = identity.split("|");
            if (parts.length === 5) {
                return [parts[0], parts[1], parts[3], parts[4]].join("|");
            }

            return identity;
        })
        .join("::");
}

function stepTitle(step: QuestStepDto): string {
    return clean(step.objectiveText) || `Step ${step.stepIndex + 1}`;
}

function semanticGroupKey(step: QuestStepDto): string {
    return [
        normalizeText(stepTitle(step)),
        clean(step.nextQuestKey),
        clean(step.failQuestKey),
        equivalentDialogSignature(step),
    ].join("::");
}

function gateVariant(step: QuestStepDto): QuestStepGateVariant {
    return {
        stepIndex: step.stepIndex,
        selectionLines: cleanLines(step.selectionPrerequisiteLines),
        completionLines: cleanLines(step.completionPrerequisiteLines),
        failureLines: cleanLines(step.failurePrerequisiteLines),
        forbiddenLines: cleanLines(step.forbiddenPrerequisiteLines),
        rewardLines: cleanLines(step.rewardDisplayLines),
    };
}

export function buildQuestStepSemanticGroups(steps: readonly QuestStepDto[]): QuestStepSemanticGroup[] {
    const buckets = new Map<string, QuestStepDto[]>();

    steps.forEach((step) => {
        const key = semanticGroupKey(step);
        buckets.set(key, [...(buckets.get(key) ?? []), step]);
    });

    return [...buckets.values()].flatMap<QuestStepSemanticGroup>((groupSteps) => {
        const representative = groupSteps[0];
        if (!representative) return [];

        const isProgressGate =
            groupSteps.length > 1 &&
            groupSteps.every((step) => clean(step.objectiveText) === clean(representative.objectiveText)) &&
            groupSteps.some(hasThresholdLikeLines);

        if (!isProgressGate) {
            return groupSteps.map((step) => ({
                id: `objective:${step.stepIndex}`,
                kind: "objective" as const,
                title: stepTitle(step),
                representativeStepIndex: step.stepIndex,
                stepIndexes: [step.stepIndex],
                nextQuestKey: clean(step.nextQuestKey) || null,
                failQuestKey: clean(step.failQuestKey) || null,
                variants: [gateVariant(step)],
            }));
        }

        return [
            {
                id: `progressGate:${groupSteps.map((step) => step.stepIndex).join("-")}`,
                kind: "progressGate" as const,
                title: stepTitle(representative),
                representativeStepIndex: representative.stepIndex,
                stepIndexes: groupSteps.map((step) => step.stepIndex),
                nextQuestKey: clean(representative.nextQuestKey) || null,
                failQuestKey: clean(representative.failQuestKey) || null,
                variants: groupSteps.map(gateVariant),
            },
        ];
    });
}
