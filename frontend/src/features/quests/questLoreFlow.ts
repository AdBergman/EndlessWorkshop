import {
    buildLoreChronicleStream,
    uniqueStrings,
    type LoreChoicePathsByContext,
    type LoreChronicleSegment,
    type LoreChronicleStream,
    type QuestDetailProgression,
    type RenderedPathStep,
} from "@/features/quests/questPathFlow";
import {
    claimVisibleLoreSections,
    createLoreNarrativeOwnershipTracker,
    loreSectionsForRevealedContinuations,
    loreSectionsForStep,
} from "@/features/quests/questReaderScopes";
import type {
    LoreSection,
    QuestExplorerEntry,
    QuestExplorerProgression,
} from "@/types/questTypes";

export type LoreFlowStep = {
    renderedStep: RenderedPathStep;
    loreSections?: LoreSection[];
    loreSectionsWereSuppressed: boolean;
    revealedLoreSections: LoreSection[];
};

export type LoreFlowSegment = LoreChronicleSegment & {
    loreSteps: LoreFlowStep[];
};

export type LoreFlowModel = {
    stream: LoreChronicleStream;
    segments: LoreFlowSegment[];
    segmentRailEntryKeys: string[];
};

export function buildLoreFlowModel({
    selectedProgression,
    fullProgression,
    entriesByKey,
    loreChoicePathsByContext,
    showRawHiddenRows,
}: {
    selectedProgression: QuestDetailProgression | null;
    fullProgression: QuestExplorerProgression | null;
    entriesByKey: Record<string, QuestExplorerEntry>;
    loreChoicePathsByContext: LoreChoicePathsByContext;
    showRawHiddenRows: boolean;
}): LoreFlowModel {
    const stream = buildLoreChronicleStream({
        selectedProgression,
        fullProgression,
        entriesByKey,
        loreChoicePathsByContext,
        showRawHiddenRows,
    });
    const ownershipTracker = showRawHiddenRows ? null : createLoreNarrativeOwnershipTracker();
    const segments = stream.segments.map((segment): LoreFlowSegment => ({
        ...segment,
        loreSteps: segment.flow.renderedSteps.map((renderedStep): LoreFlowStep => {
            const visibleDetailEntryKey = renderedStep.displayEntry?.entryKey ?? renderedStep.step.detailEntryKey;
            let loreSections: LoreSection[] | undefined;
            let loreSectionsWereSuppressed = false;

            if (renderedStep.displayEntry && !renderedStep.rendersRepeatedDetailContent) {
                const scopedLoreSections = loreSectionsForStep(renderedStep.displayEntry, renderedStep);
                loreSections = claimVisibleLoreSections(
                    scopedLoreSections,
                    visibleDetailEntryKey,
                    ownershipTracker
                );
                loreSectionsWereSuppressed = scopedLoreSections.length > 0 && loreSections.length === 0;
            }

            const revealedLoreSections = renderedStep.displayEntry && !renderedStep.revealedContinuationsBecomeSteps
                ? claimVisibleLoreSections(
                    loreSectionsForRevealedContinuations(renderedStep.displayEntry, renderedStep),
                    visibleDetailEntryKey,
                    ownershipTracker
                )
                : [];

            return {
                renderedStep,
                loreSections,
                loreSectionsWereSuppressed,
                revealedLoreSections,
            };
        }),
    }));

    return {
        stream,
        segments,
        segmentRailEntryKeys: uniqueStrings(segments.map((segment) => segment.railEntryKey)),
    };
}

export function activeLoreSegmentForModel(
    model: LoreFlowModel,
    activeRailEntryKey: string | null
): LoreFlowSegment | null {
    return activeRailEntryKey
        ? model.segments.find((segment) => segment.railEntryKey === activeRailEntryKey) ?? model.segments[0] ?? null
        : model.segments[0] ?? null;
}
