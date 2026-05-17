import type { QuestChoiceDto, QuestDto, QuestStepDto } from "@/types/questTypes";

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
        edges,
    };
}
