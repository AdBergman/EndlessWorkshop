import type { QuestChoiceDto, QuestDto, QuestStepDto } from "@/types/questTypes";
import { buildUserFacingQuestChoices } from "./questPathSemantics";
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

export type QuestRawDisplayNameDiagnostics = {
    questDisplayNameCount: number;
    choiceDisplayNameCount: number;
    questExamples: Array<{ questKey: string; displayName: string }>;
    choiceExamples: Array<{ questKey: string; choiceKey: string; displayName: string }>;
};

export type QuestObjectiveTextDiagnostics = {
    blankObjectiveCount: number;
    spacingCorruptObjectiveCount: number;
    examples: Array<{
        questKey: string;
        title: string;
        choiceKey: string;
        stepIndex: number;
        objectiveText: string | null;
        issue: "blank" | "spacing";
    }>;
};

export type QuestDialogCoverageDiagnostics = {
    rootDialogReferenceCount: number;
    stepDialogReferenceCount: number;
    questsWithRootDialogCount: number;
    questsWithoutRootDialogCount: number;
    questsWithAnyDialogCount: number;
    questsWithoutAnyDialogCount: number;
    stepsWithDialogCount: number;
    stepsWithoutDialogCount: number;
};

export type QuestNoOutcomeDiagnostics = {
    questCount: number;
    byCategory: Array<{ category: string; count: number }>;
    examples: Array<{ questKey: string; title: string; category: string }>;
};

export type QuestNoisyBranchFacetDiagnostics = {
    labelCount: number;
    labels: Array<{ label: string; count: number; examples: string[] }>;
};

export type QuestChoiceTitleDiagnostics = {
    visibleChoiceCount: number;
    rewrittenTitleCount: number;
    fallbackTitleCount: number;
    suppressedSinglePathTitleCount: number;
    reasonCounts: Array<{ reason: string; count: number }>;
    examples: Array<{
        questKey: string;
        choiceKey: string;
        rawTitle: string;
        projectedTitle: string | null;
        reason: string;
    }>;
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
    rawDisplayNameDiagnostics: QuestRawDisplayNameDiagnostics;
    objectiveTextDiagnostics: QuestObjectiveTextDiagnostics;
    dialogCoverageDiagnostics: QuestDialogCoverageDiagnostics;
    noOutcomeDiagnostics: QuestNoOutcomeDiagnostics;
    noisyBranchFacetDiagnostics: QuestNoisyBranchFacetDiagnostics;
    choiceTitleDiagnostics: QuestChoiceTitleDiagnostics;
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

function isRawInternalLabel(label: string, key: string | null | undefined): boolean {
    const text = clean(label);
    if (!text) return false;

    return (
        text === clean(key) ||
        /[_{}]/.test(text) ||
        /\b[A-Za-z0-9]+Definition\b/.test(text)
    );
}

function buildRawDisplayNameDiagnostics(quests: readonly QuestDto[]): QuestRawDisplayNameDiagnostics {
    const questExamples: QuestRawDisplayNameDiagnostics["questExamples"] = [];
    const choiceExamples: QuestRawDisplayNameDiagnostics["choiceExamples"] = [];
    let questDisplayNameCount = 0;
    let choiceDisplayNameCount = 0;

    quests.forEach((quest) => {
        const displayName = clean(quest.displayName);
        if (displayName && isRawInternalLabel(displayName, quest.questKey)) {
            questDisplayNameCount += 1;
            if (questExamples.length < 10) questExamples.push({ questKey: quest.questKey, displayName });
        }

        quest.choices.forEach((choice) => {
            const choiceDisplayName = clean(choice.displayName);
            if (!choiceDisplayName || !isRawInternalLabel(choiceDisplayName, choice.choiceKey)) return;

            choiceDisplayNameCount += 1;
            if (choiceExamples.length < 10) {
                choiceExamples.push({
                    questKey: quest.questKey,
                    choiceKey: choice.choiceKey,
                    displayName: choiceDisplayName,
                });
            }
        });
    });

    return {
        questDisplayNameCount,
        choiceDisplayNameCount,
        questExamples,
        choiceExamples,
    };
}

function buildObjectiveTextDiagnostics(quests: readonly QuestDto[]): QuestObjectiveTextDiagnostics {
    let blankObjectiveCount = 0;
    let spacingCorruptObjectiveCount = 0;
    const examples: QuestObjectiveTextDiagnostics["examples"] = [];

    quests.forEach((quest) => {
        quest.choices.forEach((choice) => {
            choice.steps.forEach((step) => {
                const objectiveText = clean(step.objectiveText);
                const issue = !objectiveText ? "blank" : /\s{2,}/.test(step.objectiveText ?? "") ? "spacing" : null;
                if (!issue) return;

                if (issue === "blank") blankObjectiveCount += 1;
                if (issue === "spacing") spacingCorruptObjectiveCount += 1;
                if (examples.length < 10) {
                    examples.push({
                        questKey: quest.questKey,
                        title: getQuestTitle(quest),
                        choiceKey: choice.choiceKey,
                        stepIndex: step.stepIndex,
                        objectiveText: objectiveText || null,
                        issue,
                    });
                }
            });
        });
    });

    return {
        blankObjectiveCount,
        spacingCorruptObjectiveCount,
        examples,
    };
}

function buildDialogCoverageDiagnostics(quests: readonly QuestDto[]): QuestDialogCoverageDiagnostics {
    let rootDialogReferenceCount = 0;
    let stepDialogReferenceCount = 0;
    let questsWithRootDialogCount = 0;
    let questsWithAnyDialogCount = 0;
    let stepsWithDialogCount = 0;
    let stepsWithoutDialogCount = 0;

    quests.forEach((quest) => {
        const rootDialogCount = cleanLines(quest.rootDialogBlockIdentities).length;
        rootDialogReferenceCount += rootDialogCount;
        if (rootDialogCount > 0) questsWithRootDialogCount += 1;

        let questHasAnyDialog = rootDialogCount > 0;
        quest.choices.forEach((choice) => {
            choice.steps.forEach((step) => {
                const stepDialogCount = cleanLines(step.dialogBlockIdentities).length;
                stepDialogReferenceCount += stepDialogCount;
                if (stepDialogCount > 0) {
                    stepsWithDialogCount += 1;
                    questHasAnyDialog = true;
                } else {
                    stepsWithoutDialogCount += 1;
                }
            });
        });
        if (questHasAnyDialog) questsWithAnyDialogCount += 1;
    });

    return {
        rootDialogReferenceCount,
        stepDialogReferenceCount,
        questsWithRootDialogCount,
        questsWithoutRootDialogCount: quests.length - questsWithRootDialogCount,
        questsWithAnyDialogCount,
        questsWithoutAnyDialogCount: quests.length - questsWithAnyDialogCount,
        stepsWithDialogCount,
        stepsWithoutDialogCount,
    };
}

function collectOutcomeQuestKeys(quest: QuestDto): string[] {
    return unique([
        ...quest.nextQuestKeys,
        quest.convergesIntoQuestKey ?? "",
        ...quest.choices.flatMap((choice) => [
            ...choice.nextQuestKeys,
            ...choice.steps.flatMap((step) => [step.nextQuestKey ?? "", step.failQuestKey ?? ""]),
        ]),
    ]);
}

function getCategoryLabel(quest: QuestDto): string {
    return clean(quest.categoryType) || humanizeQuestKey(clean(quest.categoryKey) || "Uncategorized");
}

function buildNoOutcomeDiagnostics(quests: readonly QuestDto[]): QuestNoOutcomeDiagnostics {
    const noOutcomeQuests = quests.filter((quest) => collectOutcomeQuestKeys(quest).length === 0);
    const categoryCounts = noOutcomeQuests.reduce<Record<string, number>>((acc, quest) => {
        const category = getCategoryLabel(quest);
        acc[category] = (acc[category] ?? 0) + 1;
        return acc;
    }, {});

    return {
        questCount: noOutcomeQuests.length,
        byCategory: Object.entries(categoryCounts)
            .map(([category, count]) => ({ category, count }))
            .sort((left, right) => right.count - left.count || left.category.localeCompare(right.category)),
        examples: noOutcomeQuests.slice(0, 10).map((quest) => ({
            questKey: quest.questKey,
            title: getQuestTitle(quest),
            category: getCategoryLabel(quest),
        })),
    };
}

function compactEntityLabel(value: string | null | undefined): string | null {
    const label = clean(value);
    if (!label) return null;

    return humanizeQuestKey(label)
        .replace(/^Faction /, "")
        .replace(/^Faction Quest /, "")
        .replace(/^Quest Line /, "")
        .trim();
}

function isGenericPathLabel(label: string): boolean {
    return /^(?:choice|branch|path)\s+[0-9a-z]+$/i.test(clean(label));
}

function isRedundantLabel(label: string, compareWith: string | null | undefined): boolean {
    const normalizedLabel = normalizeText(label);
    const normalizedCompare = normalizeText(compareWith ?? "");

    return Boolean(normalizedLabel && normalizedCompare && normalizedLabel === normalizedCompare);
}

function getRawBranchContextLabel(quest: QuestDto): string | null {
    const branchLabel = clean(quest.branchLabel);
    if (branchLabel && !isGenericPathLabel(branchLabel) && !isRedundantLabel(branchLabel, getQuestTitle(quest))) {
        return branchLabel;
    }

    const branchGroupLabel = compactEntityLabel(quest.branchGroupKey);
    if (branchGroupLabel && !isGenericPathLabel(branchGroupLabel) && !isRedundantLabel(branchGroupLabel, getQuestTitle(quest))) {
        return branchGroupLabel;
    }

    return null;
}

function isNoisyBranchFacetLabel(label: string): boolean {
    const normalized = normalizeText(label).replace(/[^a-z0-9]+/g, " ").trim();

    return (
        /^path \d+[a-z]?$/.test(normalized) ||
        /^quest .*\bchapter ?\d+[a-z]?\b/.test(normalized) ||
        /^quest .*\bstep ?\d+\b/.test(normalized) ||
        /^quest .*\bchoice ?\d+\b/.test(normalized)
    );
}

function buildNoisyBranchFacetDiagnostics(quests: readonly QuestDto[]): QuestNoisyBranchFacetDiagnostics {
    const labels = new Map<string, { count: number; examples: string[] }>();

    quests.forEach((quest) => {
        const label = getRawBranchContextLabel(quest);
        if (!label || !isNoisyBranchFacetLabel(label)) return;

        const current = labels.get(label) ?? { count: 0, examples: [] };
        labels.set(label, {
            count: current.count + 1,
            examples: current.examples.includes(quest.questKey) || current.examples.length >= 3
                ? current.examples
                : [...current.examples, quest.questKey],
        });
    });

    const sortedLabels = [...labels.entries()]
        .map(([label, value]) => ({ label, count: value.count, examples: value.examples }))
        .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label));

    return {
        labelCount: sortedLabels.length,
        labels: sortedLabels.slice(0, 10),
    };
}

const PLAYER_STANCE_LABELS = ["Pious", "Open", "Bold"] as const;

function getStanceLabel(value: string | null | undefined): string | null {
    const text = clean(value);
    if (!text) return null;

    const lowerText = text.toLowerCase();
    return PLAYER_STANCE_LABELS.find((label) =>
        new RegExp(`\\b${label.toLowerCase()}\\b`).test(lowerText)
    ) ?? null;
}

function getChoiceTitle(choice: Pick<QuestChoiceDto, "choiceKey" | "displayName">, index: number): string {
    const keyLabel = clean(choice.choiceKey) ? humanizeQuestKey(choice.choiceKey) : "";

    return clean(choice.displayName) || keyLabel || `Choice ${index + 1}`;
}

function extractChoiceNumber(choiceKey: string | null | undefined): number | null {
    const match = clean(choiceKey).match(/Choice0*([0-9]+)/i);
    if (!match) return null;

    const value = Number.parseInt(match[1] ?? "", 10);
    return Number.isFinite(value) ? value : null;
}

function buildEffectChoicePathLabels(
    quest: QuestDto,
    questsByKey: Record<string, QuestDto>
): Map<number, string> {
    return quest.choices.reduce<Map<number, string>>((acc, choice) => {
        if (!/EffectChoiceDefinition$/i.test(clean(choice.choiceKey))) return acc;

        const choiceNumber = extractChoiceNumber(choice.choiceKey);
        if (choiceNumber === null || acc.has(choiceNumber)) return acc;

        const targetLabels = choice.nextQuestKeys
            .map(clean)
            .map((questKey) => questsByKey[questKey])
            .filter((target): target is QuestDto => Boolean(target))
            .map((target) => getStanceLabel(getQuestTitle(target)) ?? getQuestTitle(target))
            .filter((label) => label && !isRedundantLabel(label, getQuestTitle(quest)) && !isGenericPathLabel(label));

        const semanticLabel = targetLabels.find((label) => getStanceLabel(label)) ?? targetLabels[0] ?? null;
        if (semanticLabel) acc.set(choiceNumber, semanticLabel);

        return acc;
    }, new Map<number, string>());
}

function buildDistinctNextQuestLabels(
    choice: QuestChoiceDto,
    questTitle: string,
    questsByKey: Record<string, QuestDto>
): string[] {
    return unique(choice.nextQuestKeys
        .map(clean)
        .map((questKey) => questsByKey[questKey])
        .filter((target): target is QuestDto => Boolean(target))
        .map((target) => getQuestTitle(target))
        .filter((label) => label && !isRedundantLabel(label, questTitle) && !isGenericPathLabel(label)));
}

function classifyChoiceTitle(
    quest: QuestDto,
    choice: QuestChoiceDto,
    index: number,
    visibleChoiceCount: number,
    questsByKey: Record<string, QuestDto>,
    effectPathLabels: ReadonlyMap<number, string>
): { rawTitle: string; projectedTitle: string | null; reason: string } {
    const questTitle = getQuestTitle(quest);
    const rawTitle = getChoiceTitle(choice, index);
    const stanceLabel = getStanceLabel(rawTitle);
    if (stanceLabel) return { rawTitle, projectedTitle: stanceLabel, reason: "stance" };

    if (!isRedundantLabel(rawTitle, questTitle) && !isGenericPathLabel(rawTitle) && !isRawInternalLabel(rawTitle, choice.choiceKey)) {
        return { rawTitle, projectedTitle: rawTitle, reason: "sourceTitle" };
    }

    const choiceNumber = extractChoiceNumber(choice.choiceKey);
    const effectPathLabel = choiceNumber === null ? null : effectPathLabels.get(choiceNumber) ?? null;
    if (effectPathLabel) return { rawTitle, projectedTitle: effectPathLabel, reason: "effectOutcome" };

    const nextQuestLabels = buildDistinctNextQuestLabels(choice, questTitle, questsByKey);
    if (nextQuestLabels.length === 1) {
        return { rawTitle, projectedTitle: nextQuestLabels[0] ?? null, reason: "nextOutcome" };
    }

    return {
        rawTitle,
        projectedTitle: visibleChoiceCount === 1 ? null : `Path ${String.fromCharCode("A".charCodeAt(0) + index)}`,
        reason: visibleChoiceCount === 1 ? "suppressedSinglePathFallback" : "fallback",
    };
}

function buildChoiceTitleDiagnostics(
    quests: readonly QuestDto[],
    questsByKey: Record<string, QuestDto>
): QuestChoiceTitleDiagnostics {
    const reasonCounts = new Map<string, number>();
    const examples: QuestChoiceTitleDiagnostics["examples"] = [];
    let visibleChoiceCount = 0;
    let rewrittenTitleCount = 0;
    let fallbackTitleCount = 0;
    let suppressedSinglePathTitleCount = 0;

    quests.forEach((quest) => {
        const visibleChoices = buildUserFacingQuestChoices(quest.choices);
        const effectPathLabels = buildEffectChoicePathLabels(quest, questsByKey);
        visibleChoiceCount += visibleChoices.length;

        visibleChoices.forEach((choice, index) => {
            const decision = classifyChoiceTitle(
                quest,
                choice,
                index,
                visibleChoices.length,
                questsByKey,
                effectPathLabels
            );
            reasonCounts.set(decision.reason, (reasonCounts.get(decision.reason) ?? 0) + 1);
            if (decision.projectedTitle !== decision.rawTitle) rewrittenTitleCount += 1;
            if (decision.reason === "fallback") fallbackTitleCount += 1;
            if (decision.reason === "suppressedSinglePathFallback") suppressedSinglePathTitleCount += 1;
            if (decision.projectedTitle !== decision.rawTitle && examples.length < 10) {
                examples.push({
                    questKey: quest.questKey,
                    choiceKey: choice.choiceKey,
                    rawTitle: decision.rawTitle,
                    projectedTitle: decision.projectedTitle,
                    reason: decision.reason,
                });
            }
        });
    });

    return {
        visibleChoiceCount,
        rewrittenTitleCount,
        fallbackTitleCount,
        suppressedSinglePathTitleCount,
        reasonCounts: [...reasonCounts.entries()]
            .map(([reason, count]) => ({ reason, count }))
            .sort((left, right) => right.count - left.count || left.reason.localeCompare(right.reason)),
        examples,
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
        rawDisplayNameDiagnostics: buildRawDisplayNameDiagnostics(quests),
        objectiveTextDiagnostics: buildObjectiveTextDiagnostics(quests),
        dialogCoverageDiagnostics: buildDialogCoverageDiagnostics(quests),
        noOutcomeDiagnostics: buildNoOutcomeDiagnostics(quests),
        noisyBranchFacetDiagnostics: buildNoisyBranchFacetDiagnostics(quests),
        choiceTitleDiagnostics: buildChoiceTitleDiagnostics(quests, questsByKey),
        edges,
    };
}
