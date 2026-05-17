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
    QuestGraphLinkProvenance,
    QuestLineGroupModel,
    QuestLinkModel,
    QuestMetadataModel,
    QuestObjectiveGroupModel,
    QuestProgressionRailModel,
    QuestStepSummaryModel,
    QuestTranscriptBlockModel,
    QuestTranscriptLineModel,
} from "./questExplorerTypes";
import { buildUserFacingQuestChoices } from "./questPathSemantics";
import { buildQuestStepSemanticGroups } from "./questStepSemantics";

type BuildQuestExplorerViewModelArgs = {
    quests: QuestDto[];
    dialogBlocksByIdentity: Record<string, QuestDialogBlockDto>;
    selection: QuestExplorerSelection;
};

type QuestLinkBuildContext = {
    questsByKey: Record<string, QuestDto>;
    titleCounts: Record<string, number>;
};

type QuestRailGroupContext = {
    groupKey: string;
    baseQuestlineLabel: string;
    variantLabel: string;
    isAlternateVariant: boolean;
    choiceDepth: number;
};

type QuestRailGroup = {
    groupKey: string;
    context: QuestRailGroupContext | null;
    quests: QuestDto[];
    variantLabels: Set<string>;
};

type QuestPathTitleKind = "stance" | "source" | "effectOutcome" | "nextOutcome" | "fallback";

type QuestPathTitleResult = {
    title: string;
    kind: QuestPathTitleKind;
};

const PLAYER_STANCE_LABELS = ["Pious", "Open", "Bold"] as const;

const clean = (value: string | null | undefined): string => (value ?? "").trim();

const cleanLines = (lines: readonly string[] | null | undefined): string[] =>
    (lines ?? []).map(clean).filter((line) => line.length > 0);

const normalizeLabel = (value: string | null | undefined): string => clean(value).toLowerCase();

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

export function compareQuestOrder(left: QuestDto, right: QuestDto): number {
    return (
        compareNumber(left.chapterIndex, right.chapterIndex) ||
        compareNumber(left.chapterNumber, right.chapterNumber) ||
        compareNumber(left.questSequenceIndex, right.questSequenceIndex) ||
        compareString(left.inferredQuestLineKey, right.inferredQuestLineKey) ||
        compareString(left.branchGroupKey, right.branchGroupKey) ||
        compareString(getQuestTitle(left), getQuestTitle(right)) ||
        compareString(left.questKey, right.questKey)
    );
}

function sortQuests(quests: readonly QuestDto[]): QuestDto[] {
    return [...quests].sort(compareQuestOrder);
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

export function formatChapterLabel(quest: QuestDto): string | null {
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

function buildQuestTitleCounts(quests: readonly QuestDto[]): Record<string, number> {
    return quests.reduce<Record<string, number>>((acc, quest) => {
        const title = getQuestTitle(quest);
        acc[title] = (acc[title] ?? 0) + 1;
        return acc;
    }, {});
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

function parseQuestlineVariant(questlineKey: string): {
    baseQuestlineKey: string;
    baseQuestlineLabel: string;
    variantLabel: string;
    isAlternateVariant: boolean;
} {
    const numberedMatch = clean(questlineKey).match(/^(.+?)([0-9]+)$/);
    if (!numberedMatch) {
        return {
            baseQuestlineKey: questlineKey,
            baseQuestlineLabel: humanizeQuestKey(questlineKey),
            variantLabel: "Main questline",
            isAlternateVariant: false,
        };
    }

    const baseQuestlineKey = numberedMatch[1] ?? questlineKey;
    const variantNumber = Number.parseInt(numberedMatch[2] ?? "", 10);
    const variantLabel = Number.isFinite(variantNumber)
        ? `Alternate questline ${variantNumber}`
        : "Alternate questline";

    return {
        baseQuestlineKey,
        baseQuestlineLabel: humanizeQuestKey(baseQuestlineKey),
        variantLabel,
        isAlternateVariant: true,
    };
}

function parseMajorFactionRailContext(quest: QuestDto): QuestRailGroupContext | null {
    const match = clean(quest.questKey).match(/^FactionQuest_([^_]+)_Chapter([0-9]+[A-Za-z]?)(?:_(.+))?$/i);
    if (!match) return null;

    const questlineKey = match[1];
    const chapterKey = match[2];
    if (!questlineKey || !chapterKey) return null;

    const titleKey = normalizeLabel(getQuestTitle(quest));
    if (!titleKey) return null;

    const variant = parseQuestlineVariant(questlineKey);
    const nodeKey = match[3] ?? "";
    const choiceDepth = Array.from(nodeKey.matchAll(/Choice[0-9]+/gi)).length;
    const groupKey = [
        "majorFaction",
        variant.baseQuestlineKey.toLowerCase(),
        chapterKey.toLowerCase(),
        titleKey,
    ].join(":");

    return {
        groupKey,
        baseQuestlineLabel: variant.baseQuestlineLabel,
        variantLabel: variant.variantLabel,
        isAlternateVariant: variant.isAlternateVariant,
        choiceDepth,
    };
}

function isGenericPathLabel(label: string): boolean {
    return /^(?:choice|branch|path)\s+[0-9a-z]+$/i.test(clean(label));
}

function isInternalChoiceLabel(label: string, choiceKey: string | null | undefined): boolean {
    const text = clean(label);
    if (!text) return false;

    return (
        text === clean(choiceKey) ||
        /[_{}]/.test(text) ||
        /\b[A-Za-z0-9]+Definition\b/.test(text)
    );
}

function formatGenericPathLabel(label: string): string | null {
    const match = clean(label).match(/^(?:choice|branch|path)\s+([0-9a-z]+)$/i);
    if (!match) return null;

    const suffix = match[1];
    if (!suffix) return null;
    if (/^[0-9]+$/.test(suffix)) return `Path ${Number.parseInt(suffix, 10)}`;

    return `Path ${suffix.toUpperCase()}`;
}

function isRedundantLabel(label: string, compareWith: string | null | undefined): boolean {
    const normalizedLabel = normalizeLabel(label);
    const normalizedCompare = normalizeLabel(compareWith);

    return Boolean(normalizedLabel && normalizedCompare && normalizedLabel === normalizedCompare);
}

function getStanceLabel(value: string | null | undefined): string | null {
    const text = clean(value);
    if (!text) return null;

    const lowerText = text.toLowerCase();
    return PLAYER_STANCE_LABELS.find((label) =>
        new RegExp(`\\b${label.toLowerCase()}\\b`).test(lowerText)
    ) ?? null;
}

export function getQuestPathContextLabel(quest: QuestDto, options: { allowGeneric?: boolean } = {}): string | null {
    const title = getQuestTitle(quest);
    const branchLabel = clean(quest.branchLabel);

    if (branchLabel && !isGenericPathLabel(branchLabel) && !isRedundantLabel(branchLabel, title)) {
        return branchLabel;
    }

    if (branchLabel && options.allowGeneric) {
        return formatGenericPathLabel(branchLabel);
    }

    const branchGroupLabel = compactEntityLabel(quest.branchGroupKey);
    if (branchGroupLabel && !isGenericPathLabel(branchGroupLabel) && !isRedundantLabel(branchGroupLabel, title)) {
        return branchGroupLabel;
    }

    if (branchGroupLabel && options.allowGeneric) {
        return formatGenericPathLabel(branchGroupLabel);
    }

    return null;
}

function buildQuestDisambiguator(quest: QuestDto, titleCounts: Record<string, number>): string | null {
    if ((titleCounts[getQuestTitle(quest)] ?? 0) <= 1) return null;

    const parts = [
        formatChapterLabel(quest),
        getQuestPathContextLabel(quest, { allowGeneric: true }),
        compactEntityLabel(quest.inferredFactionKey) || compactEntityLabel(quest.inferredQuestLineKey),
    ].filter((part): part is string => Boolean(part));
    const uniqueParts = parts.filter((part, index) => parts.indexOf(part) === index);

    return uniqueParts.slice(0, 3).join(" · ") || formatChapterLabel(quest) || null;
}

const questLinkProvenanceLabels: Record<QuestGraphLinkProvenance, string> = {
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
    provenance: QuestGraphLinkProvenance
): QuestLinkModel {
    const quest = context.questsByKey[questKey] ?? null;

    return {
        questKey,
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
    provenance: QuestGraphLinkProvenance
): QuestLinkModel[] {
    return questKeys
        .map(clean)
        .filter((questKey) => questKey.length > 0)
        .map((questKey) => buildQuestLinkModel(questKey, context, provenance));
}

function buildQuestLink(
    questKey: string | null | undefined,
    context: QuestLinkBuildContext,
    provenance: QuestGraphLinkProvenance
): QuestLinkModel | null {
    const normalizedKey = clean(questKey);
    if (!normalizedKey) return null;

    return buildQuestLinkModel(normalizedKey, context, provenance);
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
        quest.mandatory ? "Required" : null,
        quest.keyNarrativeBeat ? "Key beat" : null,
        quest.narrativeVictoryPathChoice ? "Victory path" : null,
    ].filter((flag): flag is string => Boolean(flag));
}

function buildQuestGroupFlags(quests: readonly QuestDto[]): string[] {
    return [
        quests.some((quest) => quest.mandatory) ? "Required" : null,
        quests.some((quest) => quest.keyNarrativeBeat) ? "Key beat" : null,
        quests.some((quest) => quest.narrativeVictoryPathChoice) ? "Victory path" : null,
    ].filter((flag): flag is string => Boolean(flag));
}

function buildRailGroups(quests: readonly QuestDto[]): QuestRailGroup[] {
    const groupsByKey = new Map<string, QuestRailGroup>();
    const orderedGroupKeys: string[] = [];

    quests.forEach((quest) => {
        const context = parseMajorFactionRailContext(quest);
        const groupKey = context?.groupKey ?? `quest:${quest.questKey}`;
        const existingGroup = groupsByKey.get(groupKey);

        if (!existingGroup) {
            orderedGroupKeys.push(groupKey);
            groupsByKey.set(groupKey, {
                groupKey,
                context,
                quests: [quest],
                variantLabels: new Set(context ? [context.variantLabel] : []),
            });
            return;
        }

        existingGroup.quests.push(quest);
        if (context) existingGroup.variantLabels.add(context.variantLabel);
    });

    return orderedGroupKeys
        .map((groupKey) => groupsByKey.get(groupKey))
        .filter((group): group is QuestRailGroup => Boolean(group));
}

function compareRailRepresentative(left: QuestDto, right: QuestDto): number {
    const leftContext = parseMajorFactionRailContext(left);
    const rightContext = parseMajorFactionRailContext(right);
    const leftBranchDepth = clean(left.branchGroupKey) ? 1 : 0;
    const rightBranchDepth = clean(right.branchGroupKey) ? 1 : 0;

    return (
        Number(right.mandatory) - Number(left.mandatory) ||
        Number(leftContext?.isAlternateVariant ?? false) - Number(rightContext?.isAlternateVariant ?? false) ||
        compareNumber(leftContext?.choiceDepth ?? 0, rightContext?.choiceDepth ?? 0) ||
        compareNumber(leftBranchDepth, rightBranchDepth) ||
        compareQuestOrder(left, right)
    );
}

function selectRailRepresentative(group: QuestRailGroup): QuestDto {
    return [...group.quests].sort(compareRailRepresentative)[0] ?? group.quests[0];
}

function buildRailSubtitle(group: QuestRailGroup, representative: QuestDto): string | null {
    const parts = [
        group.context?.baseQuestlineLabel ||
            compactEntityLabel(representative.inferredQuestLineKey) ||
            compactEntityLabel(representative.inferredFactionKey) ||
            clean(representative.categoryType) ||
            null,
        group.quests.length > 1 ? `${group.quests.length} entries` : null,
    ].filter((part): part is string => Boolean(part));

    return parts.join(" · ") || null;
}

export function buildProgressionRail(
    quests: readonly QuestDto[],
    selectedQuestKey: string | null
): QuestProgressionRailModel {
    const groups = buildRailGroups(quests);
    const items = groups.map((group) => {
        const representative = selectRailRepresentative(group);
        const memberQuestKeys = group.quests.map((quest) => quest.questKey);

        return {
            questKey: representative.questKey,
            memberQuestKeys,
            memberCount: memberQuestKeys.length,
            title: getQuestTitle(representative),
            chapterLabel: formatChapterLabel(representative),
            subtitle: buildRailSubtitle(group, representative),
            branchLabel: group.variantLabels.size > 1 ? `${group.variantLabels.size} variants` : null,
            flags: group.quests.length > 1 ? buildQuestGroupFlags(group.quests) : buildQuestFlags(representative),
            isSelected: selectedQuestKey ? memberQuestKeys.includes(selectedQuestKey) : false,
        };
    });

    return {
        selectedQuestKey,
        questCount: items.length,
        items,
    };
}

function extractChoiceNumber(choiceKey: string | null | undefined): number | null {
    const match = clean(choiceKey).match(/Choice0*([0-9]+)/i);
    if (!match) return null;

    const value = Number.parseInt(match[1], 10);
    return Number.isFinite(value) ? value : null;
}

function buildEffectChoicePathLabels(
    choices: readonly QuestChoiceDto[],
    linkContext: QuestLinkBuildContext,
    questTitle: string
): Map<number, string> {
    return choices.reduce<Map<number, string>>((acc, choice) => {
        if (!/EffectChoiceDefinition$/i.test(clean(choice.choiceKey))) return acc;

        const choiceNumber = extractChoiceNumber(choice.choiceKey);
        if (choiceNumber === null || acc.has(choiceNumber)) return acc;

        const targetLabels = choice.nextQuestKeys
            .map(clean)
            .map((questKey) => linkContext.questsByKey[questKey])
            .filter((quest): quest is QuestDto => Boolean(quest))
            .map((quest) => getStanceLabel(getQuestTitle(quest)) ?? getQuestTitle(quest))
            .filter((label) => label && !isRedundantLabel(label, questTitle) && !isGenericPathLabel(label));

        const semanticLabel = targetLabels.find((label) => getStanceLabel(label)) ?? targetLabels[0] ?? null;
        if (semanticLabel) acc.set(choiceNumber, semanticLabel);

        return acc;
    }, new Map<number, string>());
}

function buildDistinctNextQuestLabels(
    choice: QuestChoiceDto,
    linkContext: QuestLinkBuildContext,
    questTitle: string
): string[] {
    const labels = choice.nextQuestKeys
        .map(clean)
        .map((questKey) => linkContext.questsByKey[questKey])
        .filter((quest): quest is QuestDto => Boolean(quest))
        .map((quest) => getQuestTitle(quest))
        .filter((label) => label && !isRedundantLabel(label, questTitle) && !isGenericPathLabel(label));

    return labels.filter((label, index) => labels.indexOf(label) === index);
}

function formatPathFallback(index: number): string {
    const letter = String.fromCharCode("A".charCodeAt(0) + index);
    return index >= 0 && index < 26 ? `Path ${letter}` : `Path ${index + 1}`;
}

function buildPathTitle(
    choice: QuestChoiceDto,
    index: number,
    quest: QuestDto,
    linkContext: QuestLinkBuildContext,
    effectPathLabels: ReadonlyMap<number, string>
): QuestPathTitleResult {
    const questTitle = getQuestTitle(quest);
    const rawChoiceTitle = getChoiceTitle(choice, index);
    const stanceLabel = getStanceLabel(rawChoiceTitle);
    if (stanceLabel) return { title: stanceLabel, kind: "stance" };

    if (
        !isRedundantLabel(rawChoiceTitle, questTitle) &&
        !isGenericPathLabel(rawChoiceTitle) &&
        !isInternalChoiceLabel(rawChoiceTitle, choice.choiceKey)
    ) {
        return { title: rawChoiceTitle, kind: "source" };
    }

    const choiceNumber = extractChoiceNumber(choice.choiceKey);
    const effectPathLabel = choiceNumber === null ? null : effectPathLabels.get(choiceNumber) ?? null;
    if (effectPathLabel) return { title: effectPathLabel, kind: "effectOutcome" };

    const nextQuestLabels = buildDistinctNextQuestLabels(choice, linkContext, questTitle);
    if (nextQuestLabels.length === 1) {
        return { title: nextQuestLabels[0] ?? formatPathFallback(index), kind: "nextOutcome" };
    }

    return { title: formatPathFallback(index), kind: "fallback" };
}

function buildPathSubtitle(choice: QuestChoiceDto, linkContext: QuestLinkBuildContext, questTitle: string): string | null {
    const objectiveTitle = choice.steps
        .map(getStepTitle)
        .map(clean)
        .find((title) => title.length > 0 && !/^Step\s+\d+$/i.test(title));
    if (objectiveTitle) return objectiveTitle;

    const nextQuestLabels = buildDistinctNextQuestLabels(choice, linkContext, questTitle);
    if (nextQuestLabels.length === 1) return `Leads to ${nextQuestLabels[0]}`;
    if (nextQuestLabels.length > 1) return `${nextQuestLabels.length} outcomes`;

    return null;
}

function buildChoiceModel(
    choice: QuestChoiceDto,
    index: number,
    quest: QuestDto,
    selectedChoiceKey: string | null,
    linkContext: QuestLinkBuildContext,
    effectPathLabels: ReadonlyMap<number, string>,
    options: { suppressSyntheticSinglePathTitle: boolean }
): QuestChoiceSummaryModel {
    const questTitle = getQuestTitle(quest);
    const title = buildPathTitle(choice, index, quest, linkContext, effectPathLabels);

    return {
        choiceKey: choice.choiceKey,
        title: options.suppressSyntheticSinglePathTitle && title.kind === "fallback" ? null : title.title,
        subtitle: buildPathSubtitle(choice, linkContext, questTitle),
        descriptionLines: cleanLines(choice.descriptionLines),
        requirementGroups: buildRequirementGroups(choice.choiceKey, [
            { label: "Completion", lines: choice.completionPrerequisiteLines },
            { label: "Failure", lines: choice.failurePrerequisiteLines },
        ]),
        rewardLines: cleanLines(choice.rewardDisplayLines),
        nextQuestLinks: buildQuestLinks(choice.nextQuestKeys, linkContext, "choiceNext"),
        isSelected: choice.choiceKey === selectedChoiceKey,
    };
}

function buildStepModel(
    step: QuestStepDto,
    selectedStepIndex: number | null,
    linkContext: QuestLinkBuildContext
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
        nextQuestLink: buildQuestLink(step.nextQuestKey, linkContext, "stepNext"),
        failQuestLink: buildQuestLink(step.failQuestKey, linkContext, "stepFailure"),
        isSelected: step.stepIndex === selectedStepIndex,
    };
}

function uniqueLines(lines: string[]): string[] {
    return lines.filter((line, index) => lines.indexOf(line) === index);
}

function sharedVariantRewardLines(variants: readonly { rewardLines: readonly string[] }[]): string[] {
    const rewardLines = uniqueLines(variants.flatMap((variant) => cleanLines(variant.rewardLines)));

    return rewardLines.filter((line) => variants.every((variant) => cleanLines(variant.rewardLines).includes(line)));
}

function buildObjectiveGroupModels(
    steps: readonly QuestStepDto[],
    selectedStepIndex: number | null,
    linkContext: QuestLinkBuildContext
): QuestObjectiveGroupModel[] {
    const stepsByIndex = steps.reduce<Record<number, QuestStepDto>>((acc, step) => {
        acc[step.stepIndex] = step;
        return acc;
    }, {});

    return buildQuestStepSemanticGroups(steps).map((group) => {
        const representativeStep = stepsByIndex[group.representativeStepIndex] ?? steps[0] ?? null;
        const isStepVariantGroup = group.kind !== "objective";
        const sharedRewardLines = isStepVariantGroup ? sharedVariantRewardLines(group.variants) : [];
        const rewardLines = isStepVariantGroup
            ? sharedRewardLines
            : cleanLines(representativeStep?.rewardDisplayLines);

        return {
            id: group.id,
            kind: group.kind,
            title: group.title,
            stepIndexes: group.stepIndexes,
            representativeStepIndex: group.representativeStepIndex,
            descriptionLines: cleanLines(representativeStep?.descriptionLines),
            requirementGroups: isStepVariantGroup || !representativeStep
                ? []
                : buildRequirementGroups(`objective:${representativeStep.stepIndex}`, [
                    { label: "Selection", lines: representativeStep.selectionPrerequisiteLines },
                    { label: "Completion", lines: representativeStep.completionPrerequisiteLines },
                    { label: "Failure", lines: representativeStep.failurePrerequisiteLines },
                    { label: "Forbidden", lines: representativeStep.forbiddenPrerequisiteLines },
                ]),
            rewardLines,
            nextQuestLink: buildQuestLink(group.nextQuestKey, linkContext, "stepNext"),
            failQuestLink: buildQuestLink(group.failQuestKey, linkContext, "stepFailure"),
            gateRows: group.variants.map((variant) => {
                const rowRewardLines = variant.rewardLines.filter((line) => !sharedRewardLines.includes(line));

                return {
                    id: `${group.id}:${variant.stepIndex}`,
                    stepIndex: variant.stepIndex,
                    selectionLines: variant.selectionLines,
                    completionLines: variant.completionLines,
                    failureLines: variant.failureLines,
                    forbiddenLines: variant.forbiddenLines,
                    rewardLines: rowRewardLines,
                };
            }),
            summaryLabel: group.kind === "progressGate"
                ? `${group.stepIndexes.length} thresholds`
                : group.kind === "completionOption" ? `${group.stepIndexes.length} options` : null,
            isSelected: !isStepVariantGroup && group.stepIndexes.includes(selectedStepIndex ?? group.representativeStepIndex),
        };
    });
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
    linkContext: QuestLinkBuildContext
): QuestMetadataModel {
    const pathLabel = getQuestPathContextLabel(quest);
    const overviewItems = [
        { label: "Chapter", value: formatChapterLabel(quest) },
        { label: "Category", value: clean(quest.categoryType) || clean(quest.categoryKey) || null },
    ].filter((item): item is { label: string; value: string } => Boolean(item.value));

    const archiveItems = [
        {
            label: "Faction",
            value: compactEntityLabel(quest.inferredFactionKey),
        },
        {
            label: "Quest line",
            value: compactEntityLabel(quest.inferredQuestLineKey),
        },
        {
            label: "Path",
            value: pathLabel,
        },
    ].filter((item): item is { label: string; value: string } => Boolean(item.value));

    return {
        questKey: quest.questKey,
        flags: buildQuestFlags(quest),
        sections: [
            { id: "overview", label: "Overview", items: overviewItems },
            { id: "archive", label: "Archive Index", items: archiveItems },
        ].filter((section) => section.items.length > 0),
        previousQuestLinks: buildQuestLinks(quest.previousQuestKeys, linkContext, "questPrevious"),
        nextQuestLinks: buildQuestLinks(quest.nextQuestKeys, linkContext, "questNext"),
        convergesIntoQuestLink: buildQuestLink(quest.convergesIntoQuestKey, linkContext, "converges"),
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
    const choices = quest ? buildUserFacingQuestChoices(sortChoices(quest.choices)) : [];
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
    const linkContext = {
        questsByKey,
        titleCounts: buildQuestTitleCounts(orderedQuests),
    };
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

    const selectedQuest = resolved.quest;
    const effectPathLabels = buildEffectChoicePathLabels(
        selectedQuest.choices,
        linkContext,
        getQuestTitle(selectedQuest)
    );
    const choiceModels = resolved.choices.map((choice, index) =>
        buildChoiceModel(
            choice,
            index,
            selectedQuest,
            resolved.selection.choiceKey,
            linkContext,
            effectPathLabels,
            { suppressSyntheticSinglePathTitle: resolved.choices.length === 1 }
        )
    );
    const stepModels = resolved.steps.map((step) =>
        buildStepModel(step, resolved.selection.stepIndex, linkContext)
    );
    const objectiveGroups = buildObjectiveGroupModels(
        resolved.steps,
        resolved.selection.stepIndex,
        linkContext
    );
    const selectedChoice = choiceModels.find((choice) => choice.isSelected) ?? null;
    const selectedStep = stepModels.find((step) => step.isSelected) ?? null;
    const selectedObjectiveGroup =
        objectiveGroups.find((group) => group.kind === "objective" && group.isSelected) ??
        objectiveGroups.find((group) => group.kind === "objective") ??
        null;
    const transcriptIdentities = [
        ...selectedQuest.rootDialogBlockIdentities,
        ...(resolved.step?.dialogBlockIdentities ?? []),
    ];
    const chronicle: QuestChronicleModel = {
        questKey: selectedQuest.questKey,
        title: getQuestTitle(selectedQuest),
        descriptionLines: cleanLines(selectedQuest.descriptionLines),
        selectedChoiceKey: resolved.selection.choiceKey,
        selectedStepIndex: resolved.selection.stepIndex,
        choices: choiceModels,
        steps: stepModels,
        objectiveGroups,
        selectedChoice,
        selectedStep,
        selectedObjectiveGroup,
        transcriptBlocks: buildTranscriptBlocks(transcriptIdentities, dialogBlocksByIdentity),
    };

    return {
        status: "ready",
        selection: resolved.selection,
        rail,
        chronicle,
        metadata: buildMetadata(selectedQuest, linkContext),
    };
}
