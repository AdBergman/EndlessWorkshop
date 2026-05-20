import type {
    QuestChronicleEntryDto,
    QuestChronicleObjectiveDto,
    QuestChroniclePathDto,
    QuestChronicleTranscriptBlockDto,
    QuestChronicleTranscriptLineDto,
} from "@/types/questTypes";
import type {
    QuestChronicleModel,
    QuestChoiceSummaryModel,
    QuestExplorerContentModel,
    QuestExplorerSelection,
    QuestLinkProvenance,
    QuestLineGroupModel,
    QuestLinkModel,
    QuestMetadataModel,
    QuestObjectiveGroupModel,
    QuestProgressionRailModel,
    QuestStepSummaryModel,
    QuestTranscriptBlockModel,
    QuestTranscriptLineModel,
} from "./questExplorerTypes";

type BuildQuestExplorerViewModelArgs = {
    quests: QuestChronicleEntryDto[];
    selection: QuestExplorerSelection;
};

type QuestLinkBuildContext = {
    questsByKey: Record<string, QuestChronicleEntryDto>;
    titleCounts: Record<string, number>;
};

const clean = (value: string | null | undefined): string => (value ?? "").trim();

const cleanLines = (lines: readonly string[] | null | undefined): string[] =>
    (lines ?? []).map(clean).filter((line) => line.length > 0);

const compareNumber = (left: number | null | undefined, right: number | null | undefined): number => {
    const leftValue = typeof left === "number" && Number.isFinite(left) ? left : Number.MAX_SAFE_INTEGER;
    const rightValue = typeof right === "number" && Number.isFinite(right) ? right : Number.MAX_SAFE_INTEGER;
    return leftValue - rightValue;
};

const compareString = (left: string | null | undefined, right: string | null | undefined): number =>
    clean(left).localeCompare(clean(right), undefined, { numeric: true, sensitivity: "base" });

const titleCaseToken = (value: string): string => {
    if (!value) return "";
    if (/^[IVXLCDM]+$/i.test(value)) return value.toUpperCase();
    if (value === value.toUpperCase() && value.length <= 4) return value;
    return `${value.charAt(0).toUpperCase()}${value.slice(1).toLowerCase()}`;
};

export function humanizeQuestKey(key: string): string {
    const tokens = clean(key)
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .split(/[^A-Za-z0-9]+/g)
        .filter(Boolean);
    return tokens.length > 0 ? tokens.map(titleCaseToken).join(" ") : "Unknown Quest";
}

export function getQuestTitle(quest: Pick<QuestChronicleEntryDto, "entryKey" | "title">): string {
    return clean(quest.title) || humanizeQuestKey(quest.entryKey);
}

export function compareQuestOrder(left: QuestChronicleEntryDto, right: QuestChronicleEntryDto): number {
    return (
        compareNumber(left.chapter, right.chapter) ||
        compareNumber(left.step, right.step) ||
        compareString(left.questLineKey, right.questLineKey) ||
        compareString(left.branchKey, right.branchKey) ||
        compareString(getQuestTitle(left), getQuestTitle(right)) ||
        compareString(left.entryKey, right.entryKey)
    );
}

function sortQuests(quests: readonly QuestChronicleEntryDto[]): QuestChronicleEntryDto[] {
    return [...quests].sort(compareQuestOrder);
}

function sortPaths(paths: readonly QuestChroniclePathDto[]): QuestChroniclePathDto[] {
    return [...paths].sort((left, right) =>
        compareNumber(left.choiceOrdinal, right.choiceOrdinal) ||
        compareString(left.label, right.label) ||
        compareString(left.pathKey, right.pathKey)
    );
}

function sortObjectives(objectives: readonly QuestChronicleObjectiveDto[]): QuestChronicleObjectiveDto[] {
    return [...objectives].sort((left, right) =>
        compareNumber(left.stepIndex, right.stepIndex) ||
        compareString(left.objectiveText, right.objectiveText) ||
        compareString(left.choiceKey, right.choiceKey)
    );
}

export function formatChapterLabel(quest: QuestChronicleEntryDto): string | null {
    return clean(quest.chapterLabel) || (typeof quest.chapter === "number" ? `Chapter ${quest.chapter}` : null);
}

export function compactEntityLabel(value: string | null | undefined): string | null {
    const label = clean(value);
    if (!label) return null;
    return humanizeQuestKey(label)
        .replace(/^Faction /, "")
        .replace(/^Faction Quest /, "")
        .replace(/^Quest Line /, "")
        .trim();
}

export function getQuestPathContextLabel(quest: QuestChronicleEntryDto): string | null {
    return clean(quest.branchLabel) || compactEntityLabel(quest.branchKey);
}

function buildQuestMap(quests: readonly QuestChronicleEntryDto[]): Record<string, QuestChronicleEntryDto> {
    return quests.reduce<Record<string, QuestChronicleEntryDto>>((acc, quest) => {
        const entryKey = clean(quest.entryKey);
        if (entryKey) acc[entryKey] = quest;
        quest.sourceQuestKeys.forEach((sourceQuestKey) => {
            const key = clean(sourceQuestKey);
            if (key && !acc[key]) acc[key] = quest;
        });
        if (quest.primaryQuestKey && !acc[quest.primaryQuestKey]) acc[quest.primaryQuestKey] = quest;
        return acc;
    }, {});
}

function buildQuestTitleCounts(quests: readonly QuestChronicleEntryDto[]): Record<string, number> {
    return quests.reduce<Record<string, number>>((acc, quest) => {
        const title = getQuestTitle(quest);
        acc[title] = (acc[title] ?? 0) + 1;
        return acc;
    }, {});
}

function buildQuestDisambiguator(quest: QuestChronicleEntryDto, titleCounts: Record<string, number>): string | null {
    if ((titleCounts[getQuestTitle(quest)] ?? 0) <= 1) return null;
    const parts = [
        formatChapterLabel(quest),
        clean(quest.stepLabel),
        getQuestPathContextLabel(quest),
        compactEntityLabel(quest.factionKey) || compactEntityLabel(quest.questLineKey),
    ].filter((part): part is string => Boolean(part));
    return parts.filter((part, index) => parts.indexOf(part) === index).slice(0, 3).join(" / ") || null;
}

const questLinkProvenanceLabels: Record<QuestLinkProvenance, string> = {
    questPrevious: "Previous",
    questNext: "Continues",
    choiceNext: "Leads to",
    stepNext: "Continues",
    stepFailure: "Failure",
    converges: "Converges",
};

function buildQuestLinkModel(
    questKey: string,
    context: QuestLinkBuildContext,
    provenance: QuestLinkProvenance
): QuestLinkModel {
    const quest = context.questsByKey[questKey] ?? null;
    return {
        questKey: quest?.entryKey ?? questKey,
        label: quest ? getQuestTitle(quest) : humanizeQuestKey(questKey),
        contextLabel: quest ? buildQuestDisambiguator(quest, context.titleCounts) : null,
        debugLabel: quest ? null : humanizeQuestKey(questKey),
        provenance,
        provenanceLabel: questLinkProvenanceLabels[provenance],
    };
}

function buildQuestLinks(
    questKeys: readonly string[],
    context: QuestLinkBuildContext,
    provenance: QuestLinkProvenance
): QuestLinkModel[] {
    return questKeys.map(clean).filter(Boolean).map((questKey) => buildQuestLinkModel(questKey, context, provenance));
}

function buildRequirementGroups(
    ownerId: string,
    groups: Array<{ label: string; lines: readonly string[] | null | undefined }>
): QuestLineGroupModel[] {
    return groups
        .map((group) => ({
            id: `${ownerId}:${group.label.toLowerCase().replace(/\s+/g, "-")}`,
            label: group.label,
            lines: cleanLines(group.lines),
        }))
        .filter((group) => group.lines.length > 0);
}

function buildQuestFlags(quest: QuestChronicleEntryDto): string[] {
    return [
        quest.mandatory ? "Required" : null,
        quest.keyNarrativeBeat ? "Key beat" : null,
    ].filter((flag): flag is string => Boolean(flag));
}

export function buildProgressionRail(
    quests: readonly QuestChronicleEntryDto[],
    selectedQuestKey: string | null
): QuestProgressionRailModel {
    const items = quests.map((quest) => {
        const memberQuestKeys = [quest.entryKey, quest.primaryQuestKey, ...quest.sourceQuestKeys]
            .map((value) => clean(value))
            .filter((value, index, values): value is string => Boolean(value) && values.indexOf(value) === index);
        return {
            questKey: quest.entryKey,
            memberQuestKeys,
            memberCount: memberQuestKeys.length,
            title: getQuestTitle(quest),
            chapterLabel: formatChapterLabel(quest),
            subtitle: compactEntityLabel(quest.questLineKey) || compactEntityLabel(quest.factionKey) || clean(quest.questType) || null,
            branchLabel: getQuestPathContextLabel(quest),
            flags: buildQuestFlags(quest),
            isSelected: selectedQuestKey ? memberQuestKeys.includes(selectedQuestKey) : false,
        };
    });
    return {
        selectedQuestKey,
        questCount: items.length,
        items,
    };
}

function buildPathTitle(path: QuestChroniclePathDto, index: number, questTitle: string): string | null {
    const label = clean(path.label);
    if (!label || label.toLowerCase() === questTitle.toLowerCase()) {
        return index === 0 ? null : `Path ${index + 1}`;
    }
    return label;
}

function buildChoiceModel(
    path: QuestChroniclePathDto,
    index: number,
    quest: QuestChronicleEntryDto,
    selectedChoiceKey: string | null,
    linkContext: QuestLinkBuildContext,
    suppressSingleTitle: boolean
): QuestChoiceSummaryModel {
    const title = buildPathTitle(path, index, getQuestTitle(quest));
    return {
        choiceKey: path.pathKey,
        title: suppressSingleTitle ? null : title,
        subtitle: clean(path.choiceKey) || null,
        descriptionLines: [],
        requirementGroups: buildRequirementGroups(path.pathKey, [
            { label: "Conditions", lines: path.conditionLines },
        ]),
        rewardLines: cleanLines(path.rewardLines),
        nextQuestLinks: [
            ...buildQuestLinks(path.nextEntryKeys, linkContext, "choiceNext"),
            ...buildQuestLinks(path.failureEntryKeys, linkContext, "stepFailure"),
        ],
        isSelected: path.pathKey === selectedChoiceKey,
    };
}

function objectiveStepIndex(objective: QuestChronicleObjectiveDto, index: number): number {
    return typeof objective.stepIndex === "number" ? objective.stepIndex : index;
}

function buildStepModel(
    objective: QuestChronicleObjectiveDto,
    index: number,
    selectedStepIndex: number | null
): QuestStepSummaryModel {
    const stepIndex = objectiveStepIndex(objective, index);
    return {
        stepIndex,
        title: clean(objective.objectiveText) || `Objective ${index + 1}`,
        objectiveText: clean(objective.objectiveText) || null,
        descriptionLines: cleanLines(objective.descriptionLines),
        requirementGroups: buildRequirementGroups(`objective:${stepIndex}`, [
            { label: "Selection", lines: objective.selectionLines },
            { label: "Completion", lines: objective.completionLines },
            { label: "Failure", lines: objective.failureLines },
            { label: "Forbidden", lines: objective.forbiddenLines },
        ]),
        rewardLines: cleanLines(objective.rewardLines),
        nextQuestLink: null,
        failQuestLink: null,
        isSelected: stepIndex === selectedStepIndex,
    };
}

function buildObjectiveGroupModels(
    objectives: readonly QuestChronicleObjectiveDto[],
    selectedStepIndex: number | null
): QuestObjectiveGroupModel[] {
    return objectives.map((objective, index) => {
        const stepIndex = objectiveStepIndex(objective, index);
        return {
            id: `objective:${stepIndex}`,
            kind: "objective",
            title: clean(objective.objectiveText) || `Objective ${index + 1}`,
            stepIndexes: [stepIndex],
            representativeStepIndex: stepIndex,
            descriptionLines: cleanLines(objective.descriptionLines),
            requirementGroups: buildRequirementGroups(`objective:${stepIndex}`, [
                { label: "Selection", lines: objective.selectionLines },
                { label: "Completion", lines: objective.completionLines },
                { label: "Failure", lines: objective.failureLines },
                { label: "Forbidden", lines: objective.forbiddenLines },
            ]),
            rewardLines: cleanLines(objective.rewardLines),
            nextQuestLink: null,
            failQuestLink: null,
            gateRows: [],
            summaryLabel: null,
            isSelected: stepIndex === selectedStepIndex,
        };
    });
}

function sortTranscriptLines(lines: readonly QuestChronicleTranscriptLineDto[]): QuestChronicleTranscriptLineDto[] {
    return [...lines].sort((left, right) =>
        compareNumber(left.lineIndex, right.lineIndex) ||
        compareString(left.text, right.text)
    );
}

function buildTranscriptLine(
    blockId: string,
    line: QuestChronicleTranscriptLineDto,
    index: number
): QuestTranscriptLineModel | null {
    const text = clean(line.text);
    if (!text) return null;
    return {
        id: `${blockId}:${line.lineIndex ?? index}`,
        role: clean(line.role) || null,
        speakerLabel: clean(line.speakerLabel) || null,
        sourceLineIndex: line.lineIndex,
        text,
    };
}

function buildTranscriptBlocks(blocks: readonly QuestChronicleTranscriptBlockDto[]): QuestTranscriptBlockModel[] {
    return blocks.map((block, blockIndex) => {
        const identity = clean(block.dialogKey) || `transcript:${blockIndex}`;
        const phase = clean(block.phase);
        const phaseLabel = phase ? humanizeQuestKey(phase) : null;
        return {
            identity,
            title: phaseLabel || humanizeQuestKey(identity),
            archiveLabel: clean(block.dialogKey) ? humanizeQuestKey(block.dialogKey ?? "") : null,
            scopeLabel: block.stepIndex === null ? "Quest" : "Objective",
            phaseLabel,
            source: block,
            lines: sortTranscriptLines(block.lines)
                .map((line, lineIndex) => buildTranscriptLine(identity, line, lineIndex))
                .filter((line): line is QuestTranscriptLineModel => Boolean(line)),
        };
    });
}

function buildMetadata(quest: QuestChronicleEntryDto, linkContext: QuestLinkBuildContext): QuestMetadataModel {
    const overviewItems = [
        { label: "Chapter", value: formatChapterLabel(quest) },
        { label: "Type", value: clean(quest.questType) || null },
    ].filter((item): item is { label: string; value: string } => Boolean(item.value));
    const archiveItems = [
        { label: "Faction", value: compactEntityLabel(quest.factionKey) },
        { label: "Quest line", value: compactEntityLabel(quest.questLineKey) },
        { label: "Branch", value: getQuestPathContextLabel(quest) },
        { label: "Source keys", value: quest.sourceQuestKeys.join(", ") || null },
    ].filter((item): item is { label: string; value: string } => Boolean(item.value));

    return {
        questKey: quest.entryKey,
        flags: buildQuestFlags(quest),
        sections: [
            { id: "overview", label: "Overview", items: overviewItems },
            { id: "archive", label: "Archive Index", items: archiveItems },
        ].filter((section) => section.items.length > 0),
        previousQuestLinks: [],
        nextQuestLinks: buildQuestLinks(quest.nextEntryKeys, linkContext, "questNext"),
        convergesIntoQuestLink: quest.convergesIntoEntryKeys[0]
            ? buildQuestLinkModel(quest.convergesIntoEntryKeys[0], linkContext, "converges")
            : null,
    };
}

function resolveSelection(
    quests: readonly QuestChronicleEntryDto[],
    questsByKey: Record<string, QuestChronicleEntryDto>,
    selection: QuestExplorerSelection
) {
    const requestedQuestKey = clean(selection.questKey);
    const quest = (requestedQuestKey ? questsByKey[requestedQuestKey] : null) ?? quests[0] ?? null;
    const paths = quest ? sortPaths(quest.paths) : [];
    const requestedChoiceKey = clean(selection.choiceKey);
    const choice = paths.find((candidate) => candidate.pathKey === requestedChoiceKey) ?? paths[0] ?? null;
    const objectives = quest ? sortObjectives(quest.objectives) : [];
    const requestedStepIndex = selection.stepIndex;
    const step = objectives.find((candidate, index) => objectiveStepIndex(candidate, index) === requestedStepIndex) ?? objectives[0] ?? null;
    const stepIndex = step ? objectiveStepIndex(step, objectives.indexOf(step)) : null;

    return {
        quest,
        paths,
        objectives,
        selection: {
            questKey: quest?.entryKey ?? null,
            choiceKey: choice?.pathKey ?? null,
            stepIndex,
        },
    };
}

export function buildQuestExplorerViewModel({
    quests,
    selection,
}: BuildQuestExplorerViewModelArgs): QuestExplorerContentModel {
    const orderedQuests = sortQuests(quests);
    const questsByKey = buildQuestMap(orderedQuests);
    const linkContext = {
        questsByKey,
        titleCounts: buildQuestTitleCounts(orderedQuests),
    };
    const resolved = resolveSelection(orderedQuests, questsByKey, selection);
    const rail = buildProgressionRail(orderedQuests, resolved.selection.questKey);

    if (!resolved.quest) {
        return {
            status: "empty",
            selection: resolved.selection,
            rail,
            chronicle: null,
            metadata: null,
        };
    }

    const choiceModels = resolved.paths.map((path, index) =>
        buildChoiceModel(
            path,
            index,
            resolved.quest!,
            resolved.selection.choiceKey,
            linkContext,
            resolved.paths.length === 1
        )
    );
    const stepModels = resolved.objectives.map((objective, index) =>
        buildStepModel(objective, index, resolved.selection.stepIndex)
    );
    const objectiveGroups = buildObjectiveGroupModels(resolved.objectives, resolved.selection.stepIndex);
    const selectedChoice = choiceModels.find((choice) => choice.isSelected) ?? null;
    const selectedStep = stepModels.find((step) => step.isSelected) ?? null;
    const selectedObjectiveGroup =
        objectiveGroups.find((group) => group.kind === "objective" && group.isSelected) ??
        objectiveGroups.find((group) => group.kind === "objective") ??
        null;
    const chronicle: QuestChronicleModel = {
        questKey: resolved.quest.entryKey,
        title: getQuestTitle(resolved.quest),
        descriptionLines: cleanLines(resolved.quest.summaryLines),
        selectedChoiceKey: resolved.selection.choiceKey,
        selectedStepIndex: resolved.selection.stepIndex,
        choices: choiceModels,
        steps: stepModels,
        objectiveGroups,
        selectedChoice,
        selectedStep,
        selectedObjectiveGroup,
        transcriptBlocks: buildTranscriptBlocks(resolved.quest.transcriptBlocks),
    };

    return {
        status: "ready",
        selection: resolved.selection,
        rail,
        chronicle,
        metadata: buildMetadata(resolved.quest, linkContext),
    };
}
