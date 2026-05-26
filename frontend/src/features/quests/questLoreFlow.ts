import {
    buildLoreChronicleStream,
    uniqueStrings,
    type LoreChoicePathsByContext,
    type LoreChronicleSegment,
    type LoreChronicleStream,
    type QuestDetailProgression,
    type QuestPathChoice,
    type RenderedPathStep,
} from "@/features/quests/questPathFlow";
import { choicePresentationGroups } from "@/features/quests/questChoicePresentation";
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

export type ChronicleStageKind =
    | "current_task"
    | "decision"
    | "continuation"
    | "branching_continuation"
    | "convergence"
    | "terminal"
    | "failure"
    | "unresolved";

export type ChronicleChoiceTone = "context" | "decision" | "continuation" | "branching_continuation";

export type ChronicleChoiceItem = {
    choice: QuestPathChoice;
    tone: ChronicleChoiceTone;
    stageLabel: string;
};

export type ChronicleBranchMoment = {
    title: string;
    ariaNoun: string;
    structuralContextChoices: ChronicleChoiceItem[];
    decisionChoices: ChronicleChoiceItem[];
    continuationChoices: ChronicleChoiceItem[];
    branchingContinuationChoices: ChronicleChoiceItem[];
    selectedPathBranchKeys: Set<string>;
    hasActionableStages: boolean;
};

type ChronicleStageBase = {
    kind: ChronicleStageKind;
    renderedStep: RenderedPathStep;
    step: RenderedPathStep["step"];
    stepIndex: number;
    displayEntry: QuestExplorerEntry | null;
    branchMoment: ChronicleBranchMoment | null;
    loreSections?: LoreSection[];
    loreSectionsWereSuppressed: boolean;
    revealedLoreSections: LoreSection[];
    revealedContinuationStages: ChronicleChoiceItem[];
};

export type CurrentTaskStage = ChronicleStageBase & { kind: "current_task" };
export type DecisionStage = ChronicleStageBase & { kind: "decision" };
export type ContinuationStage = ChronicleStageBase & { kind: "continuation" };
export type BranchingContinuationStage = ChronicleStageBase & { kind: "branching_continuation" };
export type ConvergenceStage = ChronicleStageBase & { kind: "convergence" };
export type TerminalStage = ChronicleStageBase & { kind: "terminal" };
export type FailureStage = ChronicleStageBase & { kind: "failure" };
export type UnresolvedStage = ChronicleStageBase & { kind: "unresolved" };

export type ChronicleStage =
    | CurrentTaskStage
    | DecisionStage
    | ContinuationStage
    | BranchingContinuationStage
    | ConvergenceStage
    | TerminalStage
    | FailureStage
    | UnresolvedStage;

export type LoreFlowStep = ChronicleStage;

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
            const branchMoment = buildChronicleBranchMoment(renderedStep, entriesByKey, showRawHiddenRows);
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
                kind: chronicleStageKind(renderedStep, branchMoment),
                renderedStep,
                step: renderedStep.step,
                stepIndex: renderedStep.stepIndex,
                displayEntry: renderedStep.displayEntry,
                branchMoment,
                loreSections,
                loreSectionsWereSuppressed,
                revealedLoreSections,
                revealedContinuationStages: renderedStep.revealedContinuations.map((choice) => chronicleChoiceItem(choice, "continuation")),
            } as LoreFlowStep;
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

export function buildChronicleBranchMoment(
    renderedStep: RenderedPathStep,
    entriesByKey: Record<string, QuestExplorerEntry>,
    showRawHiddenRows: boolean
): ChronicleBranchMoment | null {
    if (renderedStep.choices.length === 0) return null;

    const presentation = choicePresentationGroups(
        renderedStep.step,
        renderedStep.choices,
        renderedStep.selectedChoice,
        renderedStep.displayEntry,
        entriesByKey,
        showRawHiddenRows
    );
    const chroniclePresentation = chronicleBranchPresentation(
        presentation.primaryChoices,
        presentation.activeContinuationChoices
    );
    const stageCount = [
        chroniclePresentation.decisionChoices.length,
        chroniclePresentation.continuationChoices.length,
        chroniclePresentation.branchingContinuationChoices.length,
    ].filter((count) => count > 0).length;
    const hasActionableStages = stageCount > 0;

    if (!hasActionableStages && presentation.structuralContextChoices.length === 0) return null;

    return {
        title: chroniclePresentation.title,
        ariaNoun: chroniclePresentation.ariaNoun,
        structuralContextChoices: presentation.structuralContextChoices.map((choice) => chronicleChoiceItem(choice, "context")),
        decisionChoices: chroniclePresentation.decisionChoices.map((choice) => chronicleChoiceItem(choice, "decision")),
        continuationChoices: chroniclePresentation.continuationChoices.map((choice) => chronicleChoiceItem(choice, "continuation")),
        branchingContinuationChoices: chroniclePresentation.branchingContinuationChoices.map((choice) => chronicleChoiceItem(choice, "branching_continuation")),
        selectedPathBranchKeys: presentation.selectedPathBranchKeys,
        hasActionableStages,
    };
}

type ChronicleBranchPresentation = {
    title: string;
    ariaNoun: string;
    decisionChoices: QuestPathChoice[];
    continuationChoices: QuestPathChoice[];
    branchingContinuationChoices: QuestPathChoice[];
};

function chronicleBranchPresentation(
    primaryChoices: QuestPathChoice[],
    activeContinuationChoices: QuestPathChoice[]
): ChronicleBranchPresentation {
    const explicitDecisionChoices = primaryChoices.filter(isExplicitChronicleDecision);
    const topologyChoices = primaryChoices.filter(isTopologyChronicleContinuation);
    const deterministicPrimaryChoices = primaryChoices.filter((choice) => (
        !isExplicitChronicleDecision(choice)
        && !isTopologyChronicleContinuation(choice)
        && isDeterministicChronicleContinuation(choice, primaryChoices)
    ));
    const fallbackDecisionChoices = primaryChoices.filter((choice) => (
        !explicitDecisionChoices.includes(choice)
        && !topologyChoices.includes(choice)
        && !deterministicPrimaryChoices.includes(choice)
    ));
    const deterministicContinuations = activeContinuationChoices.length > 1
        ? []
        : [...deterministicPrimaryChoices, ...activeContinuationChoices];
    const branchingContinuations = activeContinuationChoices.length > 1
        ? [...topologyChoices, ...deterministicPrimaryChoices, ...activeContinuationChoices]
        : topologyChoices;
    const decisionChoices = [...explicitDecisionChoices, ...fallbackDecisionChoices];

    if (decisionChoices.length > 0) {
        return {
            title: "Choose a path",
            ariaNoun: "decision moment",
            decisionChoices,
            continuationChoices: deterministicContinuations,
            branchingContinuationChoices: branchingContinuations,
        };
    }

    if (branchingContinuations.length > 0) {
        return {
            title: "Possible continuations",
            ariaNoun: "possible continuations",
            decisionChoices,
            continuationChoices: deterministicContinuations,
            branchingContinuationChoices: branchingContinuations,
        };
    }

    return {
        title: "Continue the chronicle",
        ariaNoun: "chronicle continuation",
        decisionChoices,
        continuationChoices: deterministicContinuations,
        branchingContinuationChoices: branchingContinuations,
    };
}

function chronicleStageKind(
    renderedStep: RenderedPathStep,
    branchMoment: ChronicleBranchMoment | null
): ChronicleStageKind {
    if (branchMoment?.decisionChoices.length) return "decision";
    if (branchMoment?.branchingContinuationChoices.length) return "branching_continuation";

    const continuationKinds = [
        ...(branchMoment?.continuationChoices.map((item) => item.choice.semanticStageKind) ?? []),
        ...renderedStep.revealedContinuations.map((choice) => choice.semanticStageKind),
    ];
    if (continuationKinds.includes("failure")) return "failure";
    if (continuationKinds.includes("terminal")) return "terminal";
    if (continuationKinds.includes("convergence")) return "convergence";
    if (continuationKinds.includes("unresolved")) return "unresolved";
    if (branchMoment?.continuationChoices.length) return "continuation";

    return "current_task";
}

function chronicleChoiceItem(choice: QuestPathChoice, tone: ChronicleChoiceTone): ChronicleChoiceItem {
    return {
        choice,
        tone,
        stageLabel: chronicleStageLabel(choice, tone),
    };
}

function isExplicitChronicleDecision(choice: QuestPathChoice): boolean {
    return choice.semanticStageKind === "explicit_decision_option";
}

function isTopologyChronicleContinuation(choice: QuestPathChoice): boolean {
    return choice.semanticStageKind === "topology_fork_option"
        || choice.semanticStageKind === "internal_variant";
}

function isDeterministicChronicleContinuation(choice: QuestPathChoice, peerChoices: QuestPathChoice[]): boolean {
    if ([
        "setup_task",
        "deterministic_continuation",
        "convergence",
        "terminal",
        "failure",
        "unresolved",
    ].includes(choice.semanticStageKind)) {
        return true;
    }

    return choice.semanticStageKind === "unknown"
        && peerChoices.length === 1
        && (choice.targetEntryKey !== null || choice.nextEntryKeys.length > 0 || choice.hasDependentContinuations);
}

function chronicleStageLabel(choice: QuestPathChoice, tone: ChronicleChoiceTone): string {
    if (tone === "decision") {
        return isGenericChoiceEyebrow(choice.eyebrow) ? "Decision" : choice.eyebrow;
    }

    if (tone === "branching_continuation") {
        return choice.semanticStageKind === "topology_fork_option" ? "Possible continuation" : "Continuation";
    }

    if (tone === "context") {
        if (choice.semanticStageKind === "internal_variant") return "Variant context";
        return isGenericChoiceEyebrow(choice.eyebrow) ? "Context" : choice.eyebrow;
    }

    switch (choice.semanticStageKind) {
        case "setup_task":
            return "Setup";
        case "convergence":
            return "Convergence";
        case "terminal":
            return "Ending";
        case "failure":
            return "Failure";
        case "unresolved":
            return "Unresolved continuation";
        default:
            return "Continuation";
    }
}

function isGenericChoiceEyebrow(value: string): boolean {
    return ["choice", "alternative", "path"].includes(value.trim().toLowerCase());
}
