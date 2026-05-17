import type {
    QuestChoiceDto,
    QuestDialogBlockDto,
    QuestDialogLineDto,
    QuestDto,
    QuestStepDto,
} from "@/types/questTypes";
import type {
    QuestChronicleModel,
    QuestChoiceSummaryModel,
    QuestExplorerContentModel,
    QuestExplorerSelection,
    QuestLineGroupModel,
    QuestLinkModel,
    QuestMetadataModel,
    QuestProgressionRailModel,
    QuestStepSummaryModel,
    QuestTranscriptBlockModel,
    QuestTranscriptLineModel,
} from "./questExplorerTypes";

type BuildQuestExplorerViewModelArgs = {
    quests: QuestDto[];
    dialogBlocksByIdentity: Record<string, QuestDialogBlockDto>;
    selection: QuestExplorerSelection;
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
    clean(left).localeCompare(clean(right));

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

export function getQuestTitle(quest: Pick<QuestDto, "questKey" | "displayName">): string {
    return clean(quest.displayName) || humanizeQuestKey(quest.questKey);
}

function getChoiceTitle(choice: Pick<QuestChoiceDto, "choiceKey" | "displayName">, index: number): string {
    const keyLabel = clean(choice.choiceKey) ? humanizeQuestKey(choice.choiceKey) : "";

    return clean(choice.displayName) || keyLabel || `Choice ${index + 1}`;
}

function getStepTitle(step: Pick<QuestStepDto, "stepIndex" | "objectiveText">): string {
    return clean(step.objectiveText) || `Step ${step.stepIndex + 1}`;
}

function sortQuests(quests: readonly QuestDto[]): QuestDto[] {
    return [...quests].sort((left, right) => {
        return (
            compareNumber(left.chapterIndex, right.chapterIndex) ||
            compareNumber(left.chapterNumber, right.chapterNumber) ||
            compareNumber(left.questSequenceIndex, right.questSequenceIndex) ||
            compareString(left.inferredQuestLineKey, right.inferredQuestLineKey) ||
            compareString(left.branchGroupKey, right.branchGroupKey) ||
            compareString(getQuestTitle(left), getQuestTitle(right)) ||
            compareString(left.questKey, right.questKey)
        );
    });
}

function sortChoices(choices: readonly QuestChoiceDto[]): QuestChoiceDto[] {
    return [...choices].sort((left, right) => {
        return (
            compareNumber(left.choiceOrder, right.choiceOrder) ||
            compareString(left.displayName, right.displayName) ||
            compareString(left.choiceKey, right.choiceKey)
        );
    });
}

function sortSteps(steps: readonly QuestStepDto[]): QuestStepDto[] {
    return [...steps].sort((left, right) => {
        return (
            compareNumber(left.stepOrder, right.stepOrder) ||
            compareNumber(left.stepIndex, right.stepIndex) ||
            compareString(left.objectiveText, right.objectiveText)
        );
    });
}

function formatChapterLabel(quest: QuestDto): string | null {
    if (typeof quest.chapterNumber === "number") {
        return `Chapter ${quest.chapterNumber}`;
    }

    if (typeof quest.chapterIndex === "number") {
        return `Chapter ${quest.chapterIndex + 1}`;
    }

    return clean(quest.chapterKey) || null;
}

function buildQuestMap(quests: readonly QuestDto[]): Record<string, QuestDto> {
    return quests.reduce<Record<string, QuestDto>>((acc, quest) => {
        const questKey = clean(quest.questKey);
        if (questKey) acc[questKey] = quest;
        return acc;
    }, {});
}

function buildQuestLinks(questKeys: readonly string[], questsByKey: Record<string, QuestDto>): QuestLinkModel[] {
    return questKeys
        .map(clean)
        .filter((questKey) => questKey.length > 0)
        .map((questKey) => ({
            questKey,
            label: questsByKey[questKey] ? getQuestTitle(questsByKey[questKey]) : humanizeQuestKey(questKey),
        }));
}

function buildQuestLink(
    questKey: string | null | undefined,
    questsByKey: Record<string, QuestDto>
): QuestLinkModel | null {
    const normalizedKey = clean(questKey);
    if (!normalizedKey) return null;

    return {
        questKey: normalizedKey,
        label: questsByKey[normalizedKey] ? getQuestTitle(questsByKey[normalizedKey]) : humanizeQuestKey(normalizedKey),
    };
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

function buildQuestFlags(quest: QuestDto): string[] {
    return [
        quest.mandatory ? "Mandatory" : null,
        quest.branchStart ? "Branch start" : null,
        quest.branchEnd ? "Branch end" : null,
        quest.keyNarrativeBeat ? "Key beat" : null,
        quest.narrativeVictoryPathChoice ? "Victory path" : null,
    ].filter((flag): flag is string => Boolean(flag));
}

function buildProgressionRail(
    quests: readonly QuestDto[],
    selectedQuestKey: string | null
): QuestProgressionRailModel {
    return {
        selectedQuestKey,
        questCount: quests.length,
        items: quests.map((quest) => ({
            questKey: quest.questKey,
            title: getQuestTitle(quest),
            chapterLabel: formatChapterLabel(quest),
            subtitle: clean(quest.inferredQuestLineKey) || clean(quest.categoryType) || null,
            branchLabel: clean(quest.branchLabel) || clean(quest.branchGroupKey) || null,
            flags: buildQuestFlags(quest),
            isSelected: quest.questKey === selectedQuestKey,
        })),
    };
}

function buildChoiceModel(
    choice: QuestChoiceDto,
    index: number,
    selectedChoiceKey: string | null,
    questsByKey: Record<string, QuestDto>
): QuestChoiceSummaryModel {
    return {
        choiceKey: choice.choiceKey,
        title: getChoiceTitle(choice, index),
        descriptionLines: cleanLines(choice.descriptionLines),
        requirementGroups: buildRequirementGroups(choice.choiceKey, [
            { label: "Completion", lines: choice.completionPrerequisiteLines },
            { label: "Failure", lines: choice.failurePrerequisiteLines },
        ]),
        rewardLines: cleanLines(choice.rewardDisplayLines),
        nextQuestLinks: buildQuestLinks(choice.nextQuestKeys, questsByKey),
        isSelected: choice.choiceKey === selectedChoiceKey,
    };
}

function buildStepModel(
    step: QuestStepDto,
    selectedStepIndex: number | null,
    questsByKey: Record<string, QuestDto>
): QuestStepSummaryModel {
    return {
        stepIndex: step.stepIndex,
        title: getStepTitle(step),
        objectiveText: clean(step.objectiveText) || null,
        descriptionLines: cleanLines(step.descriptionLines),
        requirementGroups: buildRequirementGroups(`step:${step.stepIndex}`, [
            { label: "Selection", lines: step.selectionPrerequisiteLines },
            { label: "Completion", lines: step.completionPrerequisiteLines },
            { label: "Failure", lines: step.failurePrerequisiteLines },
            { label: "Forbidden", lines: step.forbiddenPrerequisiteLines },
        ]),
        rewardLines: cleanLines(step.rewardDisplayLines),
        nextQuestLink: buildQuestLink(step.nextQuestKey, questsByKey),
        failQuestLink: buildQuestLink(step.failQuestKey, questsByKey),
        isSelected: step.stepIndex === selectedStepIndex,
    };
}

function sortDialogBlocks(blocks: readonly QuestDialogBlockDto[]): QuestDialogBlockDto[] {
    return [...blocks].sort((left, right) => {
        return (
            compareNumber(left.blockOrder, right.blockOrder) ||
            compareNumber(left.stepIndex, right.stepIndex) ||
            compareString(left.phase, right.phase) ||
            compareString(left.identity, right.identity)
        );
    });
}

function sortDialogLines(lines: readonly QuestDialogLineDto[]): QuestDialogLineDto[] {
    return [...lines].sort((left, right) => {
        return (
            compareNumber(left.lineOrder, right.lineOrder) ||
            compareNumber(left.sourceLineIndex, right.sourceLineIndex) ||
            compareString(left.text, right.text)
        );
    });
}

function buildTranscriptLine(block: QuestDialogBlockDto, line: QuestDialogLineDto): QuestTranscriptLineModel | null {
    const text = clean(line.text);
    if (!text) return null;

    return {
        id: `${block.identity}:${line.lineOrder}:${line.sourceLineIndex ?? "source"}`,
        role: clean(line.role) || null,
        speakerLabel: clean(line.speakerLabel) || null,
        sourceLineIndex: line.sourceLineIndex,
        text,
    };
}

function buildTranscriptBlocks(
    blockIdentities: readonly string[],
    dialogBlocksByIdentity: Record<string, QuestDialogBlockDto>
): QuestTranscriptBlockModel[] {
    const seen = new Set<string>();
    const blocks = blockIdentities
        .map(clean)
        .filter((identity) => {
            if (!identity || seen.has(identity)) return false;
            seen.add(identity);
            return true;
        })
        .map((identity) => dialogBlocksByIdentity[identity])
        .filter((block): block is QuestDialogBlockDto => Boolean(block));

    return sortDialogBlocks(blocks).map((block) => {
        const parentScope = clean(block.parentScope);
        const phase = clean(block.phase);
        const scopeLabel = parentScope ? titleCaseToken(parentScope.toLowerCase()) : null;
        const phaseLabel = phase ? humanizeQuestKey(phase) : null;
        const titleParts = [scopeLabel, phaseLabel].filter((part): part is string => Boolean(part));

        return {
            identity: block.identity,
            title: titleParts.length > 0 ? titleParts.join(" / ") : humanizeQuestKey(block.identity),
            archiveLabel: clean(block.dialogKey) ? humanizeQuestKey(block.dialogKey ?? "") : null,
            scopeLabel,
            phaseLabel,
            source: block,
            lines: sortDialogLines(block.lines)
                .map((line) => buildTranscriptLine(block, line))
                .filter((line): line is QuestTranscriptLineModel => Boolean(line)),
        };
    });
}

function buildMetadata(
    quest: QuestDto,
    questsByKey: Record<string, QuestDto>
): QuestMetadataModel {
    const branchLabel = clean(quest.branchLabel);
    const branchGroupKey = clean(quest.branchGroupKey);
    const overviewItems = [
        { label: "Chapter", value: formatChapterLabel(quest) },
        {
            label: "Sequence",
            value: typeof quest.questSequenceIndex === "number" ? String(quest.questSequenceIndex) : null,
        },
        { label: "Category", value: clean(quest.categoryType) || clean(quest.categoryKey) || null },
    ].filter((item): item is { label: string; value: string } => Boolean(item.value));

    const archiveItems = [
        { label: "Archive ID", value: clean(quest.questKey) ? humanizeQuestKey(quest.questKey) : null },
        {
            label: "Quest line",
            value: clean(quest.inferredQuestLineKey) ? humanizeQuestKey(quest.inferredQuestLineKey ?? "") : null,
        },
        {
            label: "Faction",
            value: clean(quest.inferredFactionKey) ? humanizeQuestKey(quest.inferredFactionKey ?? "") : null,
        },
        {
            label: "Branch",
            value: branchLabel || (branchGroupKey ? humanizeQuestKey(branchGroupKey) : null),
        },
    ].filter((item): item is { label: string; value: string } => Boolean(item.value));

    return {
        questKey: quest.questKey,
        flags: buildQuestFlags(quest),
        sections: [
            { id: "overview", label: "Overview", items: overviewItems },
            { id: "archive", label: "Archive Index", items: archiveItems },
        ].filter((section) => section.items.length > 0),
        previousQuestLinks: buildQuestLinks(quest.previousQuestKeys, questsByKey),
        nextQuestLinks: buildQuestLinks(quest.nextQuestKeys, questsByKey),
        convergesIntoQuestLink: buildQuestLink(quest.convergesIntoQuestKey, questsByKey),
    };
}

function resolveSelection(
    quests: readonly QuestDto[],
    selection: QuestExplorerSelection
): {
    quest: QuestDto | null;
    choice: QuestChoiceDto | null;
    step: QuestStepDto | null;
    choices: QuestChoiceDto[];
    steps: QuestStepDto[];
    selection: QuestExplorerSelection;
} {
    const requestedQuestKey = clean(selection.questKey);
    const quest = quests.find((candidate) => candidate.questKey === requestedQuestKey) ?? quests[0] ?? null;
    const choices = quest ? sortChoices(quest.choices) : [];
    const requestedChoiceKey = clean(selection.choiceKey);
    const choice = choices.find((candidate) => candidate.choiceKey === requestedChoiceKey) ?? choices[0] ?? null;
    const steps = choice ? sortSteps(choice.steps) : [];
    const requestedStepIndex = selection.stepIndex;
    const step = steps.find((candidate) => candidate.stepIndex === requestedStepIndex) ?? steps[0] ?? null;

    return {
        quest,
        choice,
        step,
        choices,
        steps,
        selection: {
            questKey: quest?.questKey ?? null,
            choiceKey: choice?.choiceKey ?? null,
            stepIndex: step?.stepIndex ?? null,
        },
    };
}

export function buildQuestExplorerViewModel({
    quests,
    dialogBlocksByIdentity,
    selection,
}: BuildQuestExplorerViewModelArgs): QuestExplorerContentModel {
    const orderedQuests = sortQuests(quests);
    const questsByKey = buildQuestMap(orderedQuests);
    const resolved = resolveSelection(orderedQuests, selection);
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

    const choiceModels = resolved.choices.map((choice, index) =>
        buildChoiceModel(choice, index, resolved.selection.choiceKey, questsByKey)
    );
    const stepModels = resolved.steps.map((step) =>
        buildStepModel(step, resolved.selection.stepIndex, questsByKey)
    );
    const selectedChoice = choiceModels.find((choice) => choice.isSelected) ?? null;
    const selectedStep = stepModels.find((step) => step.isSelected) ?? null;
    const transcriptIdentities = [
        ...resolved.quest.rootDialogBlockIdentities,
        ...(resolved.step?.dialogBlockIdentities ?? []),
    ];
    const chronicle: QuestChronicleModel = {
        questKey: resolved.quest.questKey,
        title: getQuestTitle(resolved.quest),
        descriptionLines: cleanLines(resolved.quest.descriptionLines),
        selectedChoiceKey: resolved.selection.choiceKey,
        selectedStepIndex: resolved.selection.stepIndex,
        choices: choiceModels,
        steps: stepModels,
        selectedChoice,
        selectedStep,
        transcriptBlocks: buildTranscriptBlocks(transcriptIdentities, dialogBlocksByIdentity),
    };

    return {
        status: "ready",
        selection: resolved.selection,
        rail,
        chronicle,
        metadata: buildMetadata(resolved.quest, questsByKey),
    };
}
