import type {
    ChronicleChoiceItem,
    ChronicleStage,
    LoreFlowModel,
} from "@/features/quests/questLoreFlow";
import type { LoreSection } from "@/types/questTypes";

export type LoreChronologyGroup =
    | "pre_choice"
    | "choice_node"
    | "post_choice"
    | "revealed_continuation"
    | "revealed_lore";

export type LoreChronologyBlock = {
    chronologyIndex: number;
    segmentIndex: number;
    stepIndex: number;
    stepKey: string;
    stepTitle: string;
    group: LoreChronologyGroup;
    source: string;
    ownershipSource: string;
    sectionKey: string | null;
    choiceId: string | null;
    choiceKey: string | null;
    branchKey: string | null;
    branchStepOrder: number | null;
    isSelected: boolean;
    text: string;
    stableKey: string;
};

export type LoreChronologySnapshot = {
    label: string;
    blocks: LoreChronologyBlock[];
};

export type LoreChronologyDiff = {
    beforeLabel: string;
    afterLabel: string;
    stablePrefixLength: number;
    preChoiceMutations: Array<{ before: LoreChronologyBlock; after: LoreChronologyBlock }>;
    changedBlocksAtSameIndex: Array<{ index: number; before: LoreChronologyBlock; after: LoreChronologyBlock }>;
    addedBlocks: LoreChronologyBlock[];
    removedBlocks: LoreChronologyBlock[];
    duplicateStableKeysAfter: string[];
};

function sectionText(section: LoreSection): string {
    return section.lines.map((line) => line.text).join(" ");
}

function sectionOwnershipSource(section: LoreSection): string {
    return [
        `section=${section.sectionKey}`,
        `choice=${section.choiceKey ?? "none"}`,
        `objective=${section.objectiveKey ?? "none"}`,
        `revealedByBranch=${section.revealedByBranchKeys?.join(",") || "none"}`,
        `revealedByChoice=${section.revealedByChoiceKeys?.join(",") || "none"}`,
    ].join("; ");
}

function choiceOwnershipSource(choiceItem: ChronicleChoiceItem): string {
    const { choice } = choiceItem;
    return [
        `choice=${choice.choiceKey ?? "none"}`,
        `branch=${choice.branchKey ?? "none"}`,
        `role=${choice.sectionRole ?? "none"}`,
        `semantic=${choice.semanticStageKind}`,
        `branchStepOrder=${choice.branchStepOrder ?? "none"}`,
        `parentBranch=${choice.parentBranchKey ?? "none"}`,
        `choiceGroup=${choice.choiceGroupKey ?? "none"}`,
    ].join("; ");
}

function stableKeyFor(block: Omit<LoreChronologyBlock, "stableKey">): string {
    return [
        block.group,
        block.source,
        block.sectionKey ?? "no-section",
        block.choiceId ?? "no-choice",
        block.choiceKey ?? "no-choice-key",
        block.branchKey ?? "no-branch",
        block.branchStepOrder ?? "no-order",
        block.text,
    ].join("|");
}

function createSectionBlock({
    chronologyIndex,
    segmentIndex,
    stage,
    group,
    source,
    section,
}: {
    chronologyIndex: number;
    segmentIndex: number;
    stage: ChronicleStage;
    group: LoreChronologyGroup;
    source: string;
    section: LoreSection;
}): LoreChronologyBlock {
    const block = {
        chronologyIndex,
        segmentIndex,
        stepIndex: stage.stepIndex,
        stepKey: stage.step.stepKey,
        stepTitle: stage.displayEntry?.title ?? stage.step.title,
        group,
        source,
        ownershipSource: sectionOwnershipSource(section),
        sectionKey: section.sectionKey,
        choiceId: null,
        choiceKey: section.choiceKey,
        branchKey: null,
        branchStepOrder: null,
        isSelected: false,
        text: sectionText(section),
    };

    return { ...block, stableKey: stableKeyFor(block) };
}

function createChoiceBlock({
    chronologyIndex,
    segmentIndex,
    stage,
    source,
    choiceItem,
}: {
    chronologyIndex: number;
    segmentIndex: number;
    stage: ChronicleStage;
    source: string;
    choiceItem: ChronicleChoiceItem;
}): LoreChronologyBlock {
    const { choice } = choiceItem;
    const isSelected = stage.renderedStep.selectedChoice?.choiceId === choice.id;
    const block = {
        chronologyIndex,
        segmentIndex,
        stepIndex: stage.stepIndex,
        stepKey: stage.step.stepKey,
        stepTitle: stage.displayEntry?.title ?? stage.step.title,
        group: "choice_node" as const,
        source,
        ownershipSource: choiceOwnershipSource(choiceItem),
        sectionKey: null,
        choiceId: choice.id,
        choiceKey: choice.choiceKey,
        branchKey: choice.branchKey,
        branchStepOrder: choice.branchStepOrder,
        isSelected,
        text: choice.label,
    };

    return { ...block, stableKey: stableKeyFor(block) };
}

function pushSectionBlocks(
    blocks: LoreChronologyBlock[],
    segmentIndex: number,
    stage: ChronicleStage,
    group: LoreChronologyGroup,
    source: string,
    sections: LoreSection[] | undefined
) {
    sections?.forEach((section) => {
        blocks.push(createSectionBlock({
            chronologyIndex: blocks.length,
            segmentIndex,
            stage,
            group,
            source,
            section,
        }));
    });
}

function pushChoiceBlocks(
    blocks: LoreChronologyBlock[],
    segmentIndex: number,
    stage: ChronicleStage
) {
    const branchMoment = stage.branchMoment;
    if (!branchMoment) return;

    const choiceGroups: Array<[string, ChronicleChoiceItem[]]> = [
        ["branchMoment.structuralContext", branchMoment.structuralContextStages],
        ["branchMoment.decision", branchMoment.decisionChoices],
        ["branchMoment.continuation", branchMoment.continuationChoices],
        ["branchMoment.branchingContinuation", branchMoment.branchingContinuationChoices],
    ];

    choiceGroups.forEach(([source, choices]) => {
        choices.forEach((choiceItem) => {
            blocks.push(createChoiceBlock({
                chronologyIndex: blocks.length,
                segmentIndex,
                stage,
                source,
                choiceItem,
            }));
        });
    });
}

function duplicateStableKeys(blocks: LoreChronologyBlock[]): string[] {
    const counts = new Map<string, number>();
    blocks.forEach((block) => {
        counts.set(block.stableKey, (counts.get(block.stableKey) ?? 0) + 1);
    });
    return Array.from(counts.entries())
        .filter(([, count]) => count > 1)
        .map(([stableKey]) => stableKey);
}

function firstChoiceIndex(blocks: LoreChronologyBlock[]): number {
    const index = blocks.findIndex((block) => block.group === "choice_node");
    return index >= 0 ? index : blocks.length;
}

export function createLoreChronologySnapshot(
    model: LoreFlowModel,
    label = "chronology"
): LoreChronologySnapshot {
    const blocks: LoreChronologyBlock[] = [];

    model.segments.forEach((segment, segmentIndex) => {
        segment.loreSteps.forEach((stage) => {
            pushSectionBlocks(blocks, segmentIndex, stage, "pre_choice", "stage.loreSections", stage.loreSections);
            pushChoiceBlocks(blocks, segmentIndex, stage);
            pushSectionBlocks(
                blocks,
                segmentIndex,
                stage,
                "post_choice",
                "stage.selectedChoiceLoreSections",
                stage.selectedChoiceLoreSections
            );
            stage.revealedContinuationStages.forEach((choiceItem) => {
                blocks.push(createChoiceBlock({
                    chronologyIndex: blocks.length,
                    segmentIndex,
                    stage,
                    source: "stage.revealedContinuationStages",
                    choiceItem,
                }));
                blocks[blocks.length - 1].group = "revealed_continuation";
                blocks[blocks.length - 1].stableKey = stableKeyFor(blocks[blocks.length - 1]);
            });
            pushSectionBlocks(blocks, segmentIndex, stage, "revealed_lore", "stage.revealedLoreSections", stage.revealedLoreSections);
        });
    });

    return { label, blocks };
}

export function diffLoreChronologySnapshots(
    before: LoreChronologySnapshot,
    after: LoreChronologySnapshot
): LoreChronologyDiff {
    const minLength = Math.min(before.blocks.length, after.blocks.length);
    let stablePrefixLength = 0;
    while (
        stablePrefixLength < minLength
        && before.blocks[stablePrefixLength].stableKey === after.blocks[stablePrefixLength].stableKey
    ) {
        stablePrefixLength += 1;
    }

    const changedBlocksAtSameIndex: LoreChronologyDiff["changedBlocksAtSameIndex"] = [];
    for (let index = 0; index < minLength; index += 1) {
        if (before.blocks[index].stableKey !== after.blocks[index].stableKey) {
            changedBlocksAtSameIndex.push({
                index,
                before: before.blocks[index],
                after: after.blocks[index],
            });
        }
    }

    const beforeKeys = new Set(before.blocks.map((block) => block.stableKey));
    const afterKeys = new Set(after.blocks.map((block) => block.stableKey));
    const beforeChoiceIndex = firstChoiceIndex(before.blocks);
    const afterChoiceIndex = firstChoiceIndex(after.blocks);
    const preChoiceMutations: LoreChronologyDiff["preChoiceMutations"] = [];
    const preChoiceLength = Math.min(beforeChoiceIndex, afterChoiceIndex);

    for (let index = 0; index < preChoiceLength; index += 1) {
        if (before.blocks[index].stableKey !== after.blocks[index].stableKey) {
            preChoiceMutations.push({
                before: before.blocks[index],
                after: after.blocks[index],
            });
        }
    }

    return {
        beforeLabel: before.label,
        afterLabel: after.label,
        stablePrefixLength,
        preChoiceMutations,
        changedBlocksAtSameIndex,
        addedBlocks: after.blocks.filter((block) => !beforeKeys.has(block.stableKey)),
        removedBlocks: before.blocks.filter((block) => !afterKeys.has(block.stableKey)),
        duplicateStableKeysAfter: duplicateStableKeys(after.blocks),
    };
}

export function formatLoreChronologySnapshot(snapshot: LoreChronologySnapshot): string {
    const lines = [`Lore chronology: ${snapshot.label}`];
    snapshot.blocks.forEach((block) => {
        lines.push([
            `${block.chronologyIndex}.`,
            `[${block.group}]`,
            block.source,
            `step=${block.stepIndex + 1}`,
            `choice=${block.choiceKey ?? "none"}`,
            `branch=${block.branchKey ?? "none"}`,
            `selected=${block.isSelected ? "yes" : "no"}`,
            `text="${block.text}"`,
            `owner=(${block.ownershipSource})`,
        ].join(" "));
    });
    return lines.join("\n");
}

export function formatLoreChronologyDiff(diff: LoreChronologyDiff): string {
    return [
        `Lore chronology diff: ${diff.beforeLabel} -> ${diff.afterLabel}`,
        `stable prefix blocks: ${diff.stablePrefixLength}`,
        `pre-choice mutations: ${diff.preChoiceMutations.length}`,
        `changed same-index blocks: ${diff.changedBlocksAtSameIndex.length}`,
        `added blocks: ${diff.addedBlocks.map((block) => `${block.chronologyIndex}:${block.text}`).join(" | ") || "none"}`,
        `removed blocks: ${diff.removedBlocks.map((block) => `${block.chronologyIndex}:${block.text}`).join(" | ") || "none"}`,
        `duplicate stable keys after: ${diff.duplicateStableKeysAfter.length}`,
    ].join("\n");
}
