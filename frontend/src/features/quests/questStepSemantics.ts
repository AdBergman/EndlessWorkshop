import type { QuestStepDto } from "@/types/questTypes";

export type QuestStepSemanticKind = "objective" | "progressGate" | "completionOption";

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

type NumericThresholdPoint = {
    family: string;
    value: number;
};

function parseNumericThresholdPoint(line: string): NumericThresholdPoint | null {
    const text = clean(line);
    const percentageMatch = text.match(/^(.+?):\s*(\d+(?:\.\d+)?)%$/);
    if (percentageMatch?.[1] && percentageMatch[2]) {
        return {
            family: `${normalizeText(percentageMatch[1])}:%`,
            value: Number.parseFloat(percentageMatch[2]),
        };
    }

    const propertyMatch = text.match(/^property requirement:\s*(.+?)\s*=\s*(\d+(?:\.\d+)?)$/i);
    if (propertyMatch?.[1] && propertyMatch[2]) {
        return {
            family: `property requirement:${normalizeText(propertyMatch[1])}`,
            value: Number.parseFloat(propertyMatch[2]),
        };
    }

    const greaterOrEqualMatch = text.match(/^(.+?):\s*greaterorequal\s+(\d+(?:\.\d+)?)$/i);
    if (greaterOrEqualMatch?.[1] && greaterOrEqualMatch[2]) {
        return {
            family: `${normalizeText(greaterOrEqualMatch[1])}:greaterorequal`,
            value: Number.parseFloat(greaterOrEqualMatch[2]),
        };
    }

    return null;
}

function thresholdPoints(step: QuestStepDto): NumericThresholdPoint[] {
    return [
        ...cleanLines(step.selectionPrerequisiteLines),
        ...cleanLines(step.completionPrerequisiteLines),
        ...cleanLines(step.failurePrerequisiteLines),
        ...cleanLines(step.forbiddenPrerequisiteLines),
    ]
        .map(parseNumericThresholdPoint)
        .filter((point): point is NumericThresholdPoint => Boolean(point));
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

function lineSignature(lines: readonly string[]): string {
    return cleanLines(lines).map(normalizeText).join("||");
}

function normalizeRequirementFamily(line: string): string {
    const text = normalizeText(line).replace(/[’']/g, "'");
    const [rawLabel] = text.split(/:\s*/, 1);
    const label = clean(rawLabel)
        .replace(/\bdungeons\b/g, "dungeon")
        .replace(/\s+/g, " ");

    if (text.includes(":")) return `${label}:*`;

    return text
        .replace(/\b\d+\b/g, "#")
        .replace(/\b(?:my|target|candidate|quest|c\d+)[a-z0-9]*dungeon\b/gi, "dungeon");
}

function requirementFamilySignature(step: QuestStepDto): string {
    return [
        cleanLines(step.selectionPrerequisiteLines).map(normalizeRequirementFamily).join("||"),
        cleanLines(step.completionPrerequisiteLines).map(normalizeRequirementFamily).join("||"),
        cleanLines(step.failurePrerequisiteLines).map(normalizeRequirementFamily).join("||"),
        cleanLines(step.forbiddenPrerequisiteLines).map(normalizeRequirementFamily).join("||"),
    ].join("::");
}

function requirementExactSignature(step: QuestStepDto): string {
    return [
        lineSignature(step.selectionPrerequisiteLines),
        lineSignature(step.completionPrerequisiteLines),
        lineSignature(step.failurePrerequisiteLines),
        lineSignature(step.forbiddenPrerequisiteLines),
    ].join("::");
}

function rewardSignature(step: QuestStepDto): string {
    return lineSignature(step.rewardDisplayLines);
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

function objectiveVariantClusterKey(step: QuestStepDto): string {
    return [
        lineSignature(step.descriptionLines),
        lineSignature(step.rewardDisplayLines),
        requirementFamilySignature(step),
    ].join("::");
}

function hasInternalPlaceholder(line: string): boolean {
    const text = clean(line);

    return (
        /[_{}]/.test(text) ||
        /\b[A-Z][a-z]+[A-Z][A-Za-z0-9]*\b/.test(text) ||
        /\b(?:My|Target|Candidate|Quest|C\d+)[A-Za-z0-9]*\b/.test(text) ||
        /\b[A-Za-z0-9]+Definition\b/.test(text)
    );
}

function hasResolvedCount(line: string): boolean {
    return /:\s*\d+\b/.test(line);
}

function stepDisplayQuality(step: QuestStepDto): number {
    const lines = [
        ...cleanLines(step.selectionPrerequisiteLines),
        ...cleanLines(step.completionPrerequisiteLines),
        ...cleanLines(step.failurePrerequisiteLines),
        ...cleanLines(step.forbiddenPrerequisiteLines),
    ];

    return lines.reduce((score, line) => {
        const rawPenalty = hasInternalPlaceholder(line) ? 20 : 0;
        const resolvedBonus = hasResolvedCount(line) ? 8 : 0;
        return score + rawPenalty - resolvedBonus + clean(line).length / 100;
    }, 0);
}

function selectDisplayRepresentative(steps: readonly QuestStepDto[]): QuestStepDto | null {
    return [...steps].sort((left, right) =>
        stepDisplayQuality(left) - stepDisplayQuality(right) ||
        left.stepIndex - right.stepIndex
    )[0] ?? steps[0] ?? null;
}

function hasDisplayVariantEvidence(steps: readonly QuestStepDto[]): boolean {
    const exactRequirementSignatures = new Set(steps.map(requirementExactSignature));
    if (exactRequirementSignatures.size <= 1) return true;

    const requirementLines = steps.flatMap((step) => [
        ...cleanLines(step.selectionPrerequisiteLines),
        ...cleanLines(step.completionPrerequisiteLines),
        ...cleanLines(step.failurePrerequisiteLines),
        ...cleanLines(step.forbiddenPrerequisiteLines),
    ]);

    return requirementLines.some(hasInternalPlaceholder) && requirementLines.some(hasResolvedCount);
}

function hasSharedRewardSignature(steps: readonly QuestStepDto[]): boolean {
    return new Set(steps.map(rewardSignature)).size <= 1;
}

function isSameObjectiveGroup(steps: readonly QuestStepDto[], representative: QuestStepDto): boolean {
    return steps.every((step) => clean(step.objectiveText) === clean(representative.objectiveText));
}

function hasOrderedNumericThresholdLadder(steps: readonly QuestStepDto[]): boolean {
    const stepPoints = steps.map(thresholdPoints);
    if (stepPoints.some((points) => points.length === 0)) return false;

    const firstStepFamilies = new Set(stepPoints[0]?.map((point) => point.family) ?? []);

    return [...firstStepFamilies].some((family) => {
        const values = stepPoints.map((points) => {
            const familyValues = points
                .filter((point) => point.family === family)
                .map((point) => point.value);

            return familyValues.length > 0 ? Math.max(...familyValues) : null;
        });

        if (values.some((value) => value === null)) return false;

        return values.every((value, index) => {
            if (value === null) return false;
            const previousValue = values[index - 1];
            return index === 0 || (previousValue !== null && previousValue !== undefined && value > previousValue);
        });
    });
}

function buildObjectiveGroup(steps: readonly QuestStepDto[]): QuestStepSemanticGroup | null {
    const representative = selectDisplayRepresentative(steps);
    if (!representative) return null;
    const stepIndexes = steps.map((step) => step.stepIndex);

    return {
        id: `objective:${stepIndexes.join("-")}`,
        kind: "objective" as const,
        title: stepTitle(representative),
        representativeStepIndex: representative.stepIndex,
        stepIndexes,
        nextQuestKey: clean(representative.nextQuestKey) || null,
        failQuestKey: clean(representative.failQuestKey) || null,
        variants: steps.map(gateVariant),
    };
}

function buildStepVariantGroup(
    kind: Exclude<QuestStepSemanticKind, "objective">,
    steps: readonly QuestStepDto[],
    representative: QuestStepDto
): QuestStepSemanticGroup {
    const stepIndexes = steps.map((step) => step.stepIndex);

    return {
        id: `${kind}:${stepIndexes.join("-")}`,
        kind,
        title: stepTitle(representative),
        representativeStepIndex: representative.stepIndex,
        stepIndexes,
        nextQuestKey: clean(representative.nextQuestKey) || null,
        failQuestKey: clean(representative.failQuestKey) || null,
        variants: steps.map(gateVariant),
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

        const isRepeatedSameObjective =
            groupSteps.length > 1 &&
            isSameObjectiveGroup(groupSteps, representative);
        const isProgressGate =
            isRepeatedSameObjective &&
            groupSteps.some(hasThresholdLikeLines) &&
            hasOrderedNumericThresholdLadder(groupSteps);
        const isCompletionOption =
            isRepeatedSameObjective &&
            !isProgressGate &&
            hasSharedRewardSignature(groupSteps) &&
            !hasDisplayVariantEvidence(groupSteps);

        if (!isProgressGate && !isCompletionOption) {
            const objectiveClusters = new Map<string, QuestStepDto[]>();

            groupSteps.forEach((step) => {
                const key = objectiveVariantClusterKey(step);
                objectiveClusters.set(key, [...(objectiveClusters.get(key) ?? []), step]);
            });

            return [...objectiveClusters.values()].flatMap((clusterSteps) => {
                if (clusterSteps.length > 1 && hasDisplayVariantEvidence(clusterSteps)) {
                    const group = buildObjectiveGroup(clusterSteps);
                    return group ? [group] : [];
                }

                return clusterSteps
                    .map((step) => buildObjectiveGroup([step]))
                    .filter((group): group is QuestStepSemanticGroup => Boolean(group));
            });
        }

        return [buildStepVariantGroup(isProgressGate ? "progressGate" : "completionOption", groupSteps, representative)];
    });
}
