import type {
    QuestBranch,
    QuestExplorerEntry,
    QuestExplorerProgression,
    QuestProgressionChapter,
    QuestProgressionQuestline,
    QuestProgressionStep,
} from "@/types/questTypes";
import type { QuestSemanticStageKind } from "@/features/quests/questSemanticStages";
import type { QuestRewardDisplay } from "@/features/quests/questRewardDisplay";
import type { QuestRequirementDisplay } from "@/features/quests/questRequirementDisplay";

export type QuestDetailProgression = {
    questline: QuestProgressionQuestline;
    chapter: QuestProgressionChapter;
    activeStepKeys: Set<string>;
    activeVariantEntryKeys: Set<string>;
    focusedStepIndex: number;
};

export type QuestProgressionLocation = {
    questline: QuestProgressionQuestline;
    chapter: QuestProgressionChapter;
    step: QuestProgressionStep;
    stepIndex: number;
};

export type QuestPathChoice = {
    id: string;
    branchKey: string | null;
    choiceKey: string | null;
    label: string;
    eyebrow: string;
    groupKey: string | null;
    groupLabel: string | null;
    sourceEntryKey: string | null;
    sectionRole: string | null;
    semanticStageKind: QuestSemanticStageKind;
    prerequisiteBranchKeys: string[];
    revealedByBranchKeys: string[];
    revealedByChoiceKeys: string[];
    revealedByBranchPathAlternatives: string[][];
    parentBranchKey: string | null;
    parentChoiceKey: string | null;
    choiceGroupKey: string | null;
    convergenceGroupKey: string | null;
    branchStepOrder: number | null;
    hasDependentContinuations: boolean;
    descriptionLines: string[];
    strategyLines: string[];
    loreLines: string[];
    requirementLines: string[];
    requirementDetails?: QuestRequirementDisplay[];
    rewardLines: string[];
    rewardDetails: QuestRewardDisplay[];
    targetEntryKey: string | null;
    targetSummaryLine: string | null;
    continuationTitle: string | null;
    nextEntryKeys: string[];
    failureEntryKeys: string[];
    convergesIntoEntryKeys: string[];
    accent: "gold" | "teal";
};

export type QuestPathChoiceSelection = {
    stepKey: string;
    choiceId: string;
    branchKey: string | null;
    choiceKey: string | null;
    sectionRole: string | null;
    semanticStageKind: QuestSemanticStageKind;
    choiceGroupKey: string | null;
    branchStepOrder: number | null;
    hasDependentContinuations: boolean;
    label: string;
    targetEntryKey: string | null;
    nextEntryKeys: string[];
    isPassive?: boolean;
};

export type LoreChoicePathsByContext = Record<string, QuestPathChoiceSelection[]>;

export type NormalHiddenChoiceCategory = "artifact" | "unresolved" | "continuation" | "prerequisite";

export type NormalHiddenChoiceReason = {
    category: NormalHiddenChoiceCategory;
    message: string;
};

export type ChoiceVisibilityDiagnostics = {
    normalVisibleChoiceCount: number;
    debugVisibleChoiceCount: number;
    hiddenArtifactCount: number;
    hiddenUnresolvedCount: number;
    hiddenContinuationCount: number;
    hiddenReasonsByChoiceId: Map<string, NormalHiddenChoiceReason>;
};

export type RevealContext = {
    branchKeys: Set<string>;
    choiceKeys: Set<string>;
    branchPath: string[];
};

export type RenderedPathStep = {
    step: QuestProgressionStep;
    stepIndex: number;
    displayEntry: QuestExplorerEntry | null;
    choices: QuestPathChoice[];
    revealedContinuations: QuestPathChoice[];
    autoContinuedChoices: QuestPathChoice[];
    currentBeatChoice: QuestPathChoiceSelection | null;
    selectedChoice: QuestPathChoiceSelection | null;
    choiceDiagnostics: ChoiceVisibilityDiagnostics;
    isActive: boolean;
    repeatsDetailEntry: boolean;
    rendersRepeatedDetailContent: boolean;
    revealedContinuationsBecomeSteps: boolean;
    revealContext: RevealContext;
};

export type QuestPathFlow = {
    renderedSteps: RenderedPathStep[];
    unresolvedContinuation: QuestPathChoiceSelection | null;
    reachedContinuationEntryKey: string | null;
};

export type QuestPathFlowOptions = {
    focusedStepIndex: number;
    showRawHiddenRows: boolean;
};

export const LORE_CHRONICLE_SEGMENT_CAP = 10;

export type LoreChronicleSegment = {
    segmentKey: string;
    contextKey: string;
    railEntryKey: string | null;
    progression: QuestDetailProgression;
    flow: QuestPathFlow;
    isSelectedContext: boolean;
};

export type LoreChronicleStream = {
    segments: LoreChronicleSegment[];
    selectedContextKey: string | null;
};

export const EMPTY_CHOICE_PATH: QuestPathChoiceSelection[] = [];
