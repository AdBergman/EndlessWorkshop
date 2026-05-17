import type { QuestChoiceDto, QuestDto, QuestStepDto } from "@/types/questTypes";
import { buildQuestStepSemanticGroups } from "./questStepSemantics";

export type QuestGraphEdgeScope = "quest" | "choice" | "step";

export type QuestGraphEdgeField =
    | "previousQuestKeys"
    | "nextQuestKeys"
    | "convergesIntoQuestKey"
    | "choice.nextQuestKeys"
    | "step.nextQuestKey"
    | "step.failQuestKey";

export type QuestGraphEdgeKind =
    | "questPrevious"
    | "questNext"
    | "converges"
    | "choiceNext"
    | "stepNext"
    | "stepFailure";

export type QuestGraphEdgeDiagnostic = {
    sourceQuestKey: string;
    sourceChoiceKey: string | null;
    sourceStepIndex: number | null;
    targetQuestKey: string;
    scope: QuestGraphEdgeScope;
    field: QuestGraphEdgeField;
    kind: QuestGraphEdgeKind;
    sourceTitle: string;
    targetTitle: string;
    targetExists: boolean;
    targetTitleDuplicateCount: number;
    isSelfReference: boolean;
};

export type QuestGraphDuplicateTitleGroup = {
    title: string;
    questKeys: string[];
};

export type QuestGraphNextMismatch = {
    questKey: string;
    title: string;
    questNextKeys: string[];
    interactiveNextKeys: string[];
    questOnlyKeys: string[];
    interactiveOnlyKeys: string[];
};

export type QuestObjectiveVariantStepExample = {
    stepIndex: number;
    completionLines: string[];
    rewardLines: string[];
    nextQuestKey: string | null;
    failQuestKey: string | null;
};

export type QuestObjectiveVariantCollapseExample = {
    questKey: string;
    title: string;
    choiceKey: string;
    objectiveText: string;
    representativeStepIndex: number;
    stepIndexes: number[];
    hiddenStepIndexes: number[];
    displayedCompletionLines: string[];
    rawCompletionLines: string[];
};

export type QuestObjectiveVariantKeptSeparateExample = {
    questKey: string;
    title: string;
    choiceKey: string;
    objectiveText: string;
    reason: "differentReward" | "differentOutcome" | "differentRewardAndOutcome";
    steps: QuestObjectiveVariantStepExample[];
};

export type QuestRawPlaceholderPattern = {
    pattern: string;
    count: number;
    examples: string[];
};

export type QuestObjectiveVariantDiagnostics = {
    totalStepGroupsAnalyzed: number;
    collapsedDuplicateObjectiveVariantGroupCount: number;
    hiddenRawStepCount: number;
    affectedQuestExamples: QuestObjectiveVariantCollapseExample[];
    keptSeparateSameTitleExamples: QuestObjectiveVariantKeptSeparateExample[];
    rawPlaceholderPatterns: QuestRawPlaceholderPattern[];
};

export type QuestGraphDiagnostics = {
    questCount: number;
    edgeCount: number;
    duplicateQuestKeys: string[];
    duplicateTitleGroups: QuestGraphDuplicateTitleGroup[];
    danglingEdges: QuestGraphEdgeDiagnostic[];
    selfReferences: QuestGraphEdgeDiagnostic[];
    refsToDuplicateTitles: QuestGraphEdgeDiagnostic[];
    questNextWithoutPreviousEdges: QuestGraphEdgeDiagnostic[];
    previousWithoutQuestNextEdges: QuestGraphEdgeDiagnostic[];
    questNextMismatches: QuestGraphNextMismatch[];
    convergeOverlaps: QuestGraphEdgeDiagnostic[];
    objectiveVariantDiagnostics: QuestObjectiveVariantDiagnostics;
    edges: QuestGraphEdgeDiagnostic[];
};

const clean = (value: string | null | undefined): string => (value ?? "").trim();

const unique = (values: readonly string[]): string[] => {
    const seen = new Set<string>();
    const result: string[] = [];

    values.forEach((value) => {
        const cleaned = clean(value);
        if (!cleaned || seen.has(cleaned)) return;

        seen.add(cleaned);
        result.push(cleaned);
    });

    return result;
};

const titleCaseToken = (value: string): string => {
    if (!value) return "";
    if (/^[IVXLCDM]+$/i.test(value)) return value.toUpperCase();
    if (value === value.toUpperCase() && value.length <= 4) return value;

    return `${value.charAt(0).toUpperCase()}${value.slice(1).toLowerCase()}`;
};

const humanizeQuestKey = (key: string): string => {
    const tokens = clean(key)
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .split(/[^A-Za-z0-9]+/g)
        .filter(Boolean);

    return tokens.length > 0 ? tokens.map(titleCaseToken).join(" ") : "Unknown Quest";
};

const getQuestTitle = (quest: Pick<QuestDto, "questKey" | "displayName">): string =>
    clean(quest.displayName) || humanizeQuestKey(quest.questKey);

const cleanLines = (lines: readonly string[] | null | undefined): string[] =>
    (lines ?? []).map(clean).filter((line) => line.length > 0);

const normalizeText = (value: string): string => clean(value).toLowerCase().replace(/\s+/g, " ");

const buildQuestMap = (quests: readonly QuestDto[]): Record<string, QuestDto> =>
    quests.reduce<Record<string, QuestDto>>((acc, quest) => {
        const questKey = clean(quest.questKey);
        if (questKey && !acc[questKey]) acc[questKey] = quest;
        return acc;
    }, {});

const buildDuplicateQuestKeys = (quests: readonly QuestDto[]): string[] => {
    const counts = quests.reduce<Record<string, number>>((acc, quest) => {
        const questKey = clean(quest.questKey);
        if (questKey) acc[questKey] = (acc[questKey] ?? 0) + 1;
        return acc;
    }, {});

    return Object.entries(counts)
        .filter(([, count]) => count > 1)
        .map(([questKey]) => questKey)
        .sort();
};

const buildTitleGroups = (quests: readonly QuestDto[]): Record<string, string[]> =>
    quests.reduce<Record<string, string[]>>((acc, quest) => {
        const title = getQuestTitle(quest);
        acc[title] = [...(acc[title] ?? []), quest.questKey];
        return acc;
    }, {});

const buildEdge = ({
    quest,
    choice,
    step,
    targetQuestKey,
    scope,
    field,
    kind,
    questsByKey,
    titleGroups,
}: {
    quest: QuestDto;
    choice?: QuestChoiceDto | null;
    step?: QuestStepDto | null;
    targetQuestKey: string;
    scope: QuestGraphEdgeScope;
    field: QuestGraphEdgeField;
    kind: QuestGraphEdgeKind;
    questsByKey: Record<string, QuestDto>;
    titleGroups: Record<string, string[]>;
}): QuestGraphEdgeDiagnostic | null => {
    const cleanedTargetKey = clean(targetQuestKey);
    if (!cleanedTargetKey) return null;

    const targetQuest = questsByKey[cleanedTargetKey] ?? null;
    const targetTitle = targetQuest ? getQuestTitle(targetQuest) : humanizeQuestKey(cleanedTargetKey);

    return {
        sourceQuestKey: quest.questKey,
        sourceChoiceKey: choice?.choiceKey ?? null,
        sourceStepIndex: step?.stepIndex ?? null,
        targetQuestKey: cleanedTargetKey,
        scope,
        field,
        kind,
        sourceTitle: getQuestTitle(quest),
        targetTitle,
        targetExists: Boolean(targetQuest),
        targetTitleDuplicateCount: titleGroups[targetTitle]?.length ?? 0,
        isSelfReference: quest.questKey === cleanedTargetKey,
    };
};

function collectEdges(
    quests: readonly QuestDto[],
    questsByKey: Record<string, QuestDto>,
    titleGroups: Record<string, string[]>
): QuestGraphEdgeDiagnostic[] {
    const edges: QuestGraphEdgeDiagnostic[] = [];

    const pushEdge = (edge: QuestGraphEdgeDiagnostic | null) => {
        if (edge) edges.push(edge);
    };

    quests.forEach((quest) => {
        quest.previousQuestKeys.forEach((targetQuestKey) => {
            pushEdge(buildEdge({
                quest,
                targetQuestKey,
                scope: "quest",
                field: "previousQuestKeys",
                kind: "questPrevious",
                questsByKey,
                titleGroups,
            }));
        });

        quest.nextQuestKeys.forEach((targetQuestKey) => {
            pushEdge(buildEdge({
                quest,
                targetQuestKey,
                scope: "quest",
                field: "nextQuestKeys",
                kind: "questNext",
                questsByKey,
                titleGroups,
            }));
        });

        pushEdge(buildEdge({
            quest,
            targetQuestKey: quest.convergesIntoQuestKey ?? "",
            scope: "quest",
            field: "convergesIntoQuestKey",
            kind: "converges",
            questsByKey,
            titleGroups,
        }));

        quest.choices.forEach((choice) => {
            choice.nextQuestKeys.forEach((targetQuestKey) => {
                pushEdge(buildEdge({
                    quest,
                    choice,
                    targetQuestKey,
                    scope: "choice",
                    field: "choice.nextQuestKeys",
                    kind: "choiceNext",
                    questsByKey,
                    titleGroups,
                }));
            });

            choice.steps.forEach((step) => {
                pushEdge(buildEdge({
                    quest,
                    choice,
                    step,
                    targetQuestKey: step.nextQuestKey ?? "",
                    scope: "step",
                    field: "step.nextQuestKey",
                    kind: "stepNext",
                    questsByKey,
                    titleGroups,
                }));
                pushEdge(buildEdge({
                    quest,
                    choice,
                    step,
                    targetQuestKey: step.failQuestKey ?? "",
                    scope: "step",
                    field: "step.failQuestKey",
                    kind: "stepFailure",
                    questsByKey,
                    titleGroups,
                }));
            });
        });
    });

    return edges;
}

const asEdgeKey = (sourceQuestKey: string, targetQuestKey: string): string => `${sourceQuestKey} -> ${targetQuestKey}`;

function buildQuestNextMismatches(quests: readonly QuestDto[]): QuestGraphNextMismatch[] {
    return quests
        .map((quest) => {
            const questNextKeys = unique(quest.nextQuestKeys);
            const interactiveNextKeys = unique([
                ...quest.choices.flatMap((choice) => choice.nextQuestKeys),
                ...quest.choices.flatMap((choice) =>
                    choice.steps.map((step) => step.nextQuestKey ?? "")
                ),
            ]);
            const interactiveSet = new Set(interactiveNextKeys);
            const questSet = new Set(questNextKeys);
            const questOnlyKeys = questNextKeys.filter((questKey) => !interactiveSet.has(questKey));
            const interactiveOnlyKeys = interactiveNextKeys.filter((questKey) => !questSet.has(questKey));

            return {
                questKey: quest.questKey,
                title: getQuestTitle(quest),
                questNextKeys,
                interactiveNextKeys,
                questOnlyKeys,
                interactiveOnlyKeys,
            };
        })
        .filter((mismatch) => mismatch.questOnlyKeys.length > 0 || mismatch.interactiveOnlyKeys.length > 0);
}

function stepRequirementLines(step: QuestStepDto): string[] {
    return [
        ...cleanLines(step.selectionPrerequisiteLines),
        ...cleanLines(step.completionPrerequisiteLines),
        ...cleanLines(step.failurePrerequisiteLines),
        ...cleanLines(step.forbiddenPrerequisiteLines),
    ];
}

function stepOutcomeSignature(step: QuestStepDto): string {
    return [clean(step.nextQuestKey), clean(step.failQuestKey)].join("::");
}

function stepRewardSignature(step: QuestStepDto): string {
    return cleanLines(step.rewardDisplayLines).map(normalizeText).join("||");
}

function stepExample(step: QuestStepDto): QuestObjectiveVariantStepExample {
    return {
        stepIndex: step.stepIndex,
        completionLines: cleanLines(step.completionPrerequisiteLines),
        rewardLines: cleanLines(step.rewardDisplayLines),
        nextQuestKey: clean(step.nextQuestKey) || null,
        failQuestKey: clean(step.failQuestKey) || null,
    };
}

function getStepTitle(step: QuestStepDto): string {
    return clean(step.objectiveText) || `Step ${step.stepIndex + 1}`;
}

function extractRawPlaceholderPatterns(line: string): string[] {
    const patterns = [
        ...(line.match(/\{[^}]+\}/g) ?? []),
        ...(line.match(/\b[A-Za-z0-9_]*_[A-Za-z0-9_]+\b/g) ?? []),
        ...(line.match(/\b[A-Z][a-z]+[A-Z][A-Za-z0-9]*\b/g) ?? []),
        ...(line.match(/\b(?:My|Target|Candidate|Quest|C\d+)[A-Za-z0-9]*\b/g) ?? []),
        ...(line.match(/\b[A-Za-z0-9]+Definition\b/g) ?? []),
    ];

    return unique(patterns);
}

function buildRawPlaceholderPatterns(quests: readonly QuestDto[]): QuestRawPlaceholderPattern[] {
    const patternCounts = new Map<string, { count: number; examples: string[] }>();

    quests.forEach((quest) => {
        quest.choices.forEach((choice) => {
            choice.steps.forEach((step) => {
                stepRequirementLines(step).forEach((line) => {
                    extractRawPlaceholderPatterns(line).forEach((pattern) => {
                        const current = patternCounts.get(pattern) ?? { count: 0, examples: [] };
                        patternCounts.set(pattern, {
                            count: current.count + 1,
                            examples: current.examples.includes(line) || current.examples.length >= 3
                                ? current.examples
                                : [...current.examples, line],
                        });
                    });
                });
            });
        });
    });

    return [...patternCounts.entries()]
        .map(([pattern, value]) => ({ pattern, count: value.count, examples: value.examples }))
        .sort((left, right) => right.count - left.count || left.pattern.localeCompare(right.pattern))
        .slice(0, 10);
}

function buildKeptSeparateSameTitleExamples(quests: readonly QuestDto[]): QuestObjectiveVariantKeptSeparateExample[] {
    const examples: QuestObjectiveVariantKeptSeparateExample[] = [];

    quests.forEach((quest) => {
        quest.choices.forEach((choice) => {
            const stepsByTitle = new Map<string, QuestStepDto[]>();

            choice.steps.forEach((step) => {
                const title = getStepTitle(step);
                stepsByTitle.set(title, [...(stepsByTitle.get(title) ?? []), step]);
            });

            stepsByTitle.forEach((steps, objectiveText) => {
                if (steps.length <= 1) return;

                const rewardCount = new Set(steps.map(stepRewardSignature)).size;
                const outcomeCount = new Set(steps.map(stepOutcomeSignature)).size;
                const rewardDiffers = rewardCount > 1;
                const outcomeDiffers = outcomeCount > 1;
                if (!rewardDiffers && !outcomeDiffers) return;

                examples.push({
                    questKey: quest.questKey,
                    title: getQuestTitle(quest),
                    choiceKey: choice.choiceKey,
                    objectiveText,
                    reason: rewardDiffers && outcomeDiffers
                        ? "differentRewardAndOutcome"
                        : rewardDiffers ? "differentReward" : "differentOutcome",
                    steps: steps.map(stepExample),
                });
            });
        });
    });

    return examples.slice(0, 10);
}

function buildObjectiveVariantDiagnostics(quests: readonly QuestDto[]): QuestObjectiveVariantDiagnostics {
    let totalStepGroupsAnalyzed = 0;
    let collapsedDuplicateObjectiveVariantGroupCount = 0;
    let hiddenRawStepCount = 0;
    const affectedQuestExamples: QuestObjectiveVariantCollapseExample[] = [];

    quests.forEach((quest) => {
        quest.choices.forEach((choice) => {
            const stepsByIndex = choice.steps.reduce<Record<number, QuestStepDto>>((acc, step) => {
                acc[step.stepIndex] = step;
                return acc;
            }, {});
            const semanticGroups = buildQuestStepSemanticGroups(choice.steps);
            totalStepGroupsAnalyzed += semanticGroups.length;

            semanticGroups.forEach((group) => {
                if (group.kind !== "objective" || group.stepIndexes.length <= 1) return;

                const representativeStep = stepsByIndex[group.representativeStepIndex] ?? null;
                const rawSteps = group.stepIndexes
                    .map((stepIndex) => stepsByIndex[stepIndex])
                    .filter((step): step is QuestStepDto => Boolean(step));
                collapsedDuplicateObjectiveVariantGroupCount += 1;
                hiddenRawStepCount += group.stepIndexes.length - 1;

                if (!representativeStep || affectedQuestExamples.length >= 10) return;

                affectedQuestExamples.push({
                    questKey: quest.questKey,
                    title: getQuestTitle(quest),
                    choiceKey: choice.choiceKey,
                    objectiveText: group.title,
                    representativeStepIndex: group.representativeStepIndex,
                    stepIndexes: group.stepIndexes,
                    hiddenStepIndexes: group.stepIndexes.filter((stepIndex) => stepIndex !== group.representativeStepIndex),
                    displayedCompletionLines: cleanLines(representativeStep.completionPrerequisiteLines),
                    rawCompletionLines: unique(rawSteps.flatMap((step) => cleanLines(step.completionPrerequisiteLines))),
                });
            });
        });
    });

    return {
        totalStepGroupsAnalyzed,
        collapsedDuplicateObjectiveVariantGroupCount,
        hiddenRawStepCount,
        affectedQuestExamples,
        keptSeparateSameTitleExamples: buildKeptSeparateSameTitleExamples(quests),
        rawPlaceholderPatterns: buildRawPlaceholderPatterns(quests),
    };
}

export function diagnoseQuestGraph(quests: readonly QuestDto[]): QuestGraphDiagnostics {
    const questsByKey = buildQuestMap(quests);
    const titleGroups = buildTitleGroups(quests);
    const edges = collectEdges(quests, questsByKey, titleGroups);
    const questNextEdges = edges.filter((edge) => edge.kind === "questNext");
    const previousEdges = edges.filter((edge) => edge.kind === "questPrevious");
    const questNextEdgeKeys = new Set(
        questNextEdges.map((edge) => asEdgeKey(edge.sourceQuestKey, edge.targetQuestKey))
    );
    const previousReverseEdgeKeys = new Set(
        previousEdges.map((edge) => asEdgeKey(edge.targetQuestKey, edge.sourceQuestKey))
    );

    return {
        questCount: quests.length,
        edgeCount: edges.length,
        duplicateQuestKeys: buildDuplicateQuestKeys(quests),
        duplicateTitleGroups: Object.entries(titleGroups)
            .filter(([, questKeys]) => questKeys.length > 1)
            .map(([title, questKeys]) => ({ title, questKeys }))
            .sort((left, right) => right.questKeys.length - left.questKeys.length || left.title.localeCompare(right.title)),
        danglingEdges: edges.filter((edge) => !edge.targetExists),
        selfReferences: edges.filter((edge) => edge.isSelfReference),
        refsToDuplicateTitles: edges.filter((edge) => edge.targetTitleDuplicateCount > 1),
        questNextWithoutPreviousEdges: questNextEdges.filter(
            (edge) => edge.targetExists && !previousReverseEdgeKeys.has(asEdgeKey(edge.sourceQuestKey, edge.targetQuestKey))
        ),
        previousWithoutQuestNextEdges: previousEdges.filter(
            (edge) => edge.targetExists && !questNextEdgeKeys.has(asEdgeKey(edge.targetQuestKey, edge.sourceQuestKey))
        ),
        questNextMismatches: buildQuestNextMismatches(quests),
        convergeOverlaps: edges.filter(
            (edge) => edge.kind === "converges" && questNextEdgeKeys.has(asEdgeKey(edge.sourceQuestKey, edge.targetQuestKey))
        ),
        objectiveVariantDiagnostics: buildObjectiveVariantDiagnostics(quests),
        edges,
    };
}
