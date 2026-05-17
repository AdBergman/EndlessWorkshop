import type { QuestDialogBlockDto } from "@/types/questTypes";

export type QuestExplorerStatus = "loading" | "error" | "empty" | "ready";

export type QuestExplorerSelection = {
    questKey: string | null;
    choiceKey: string | null;
    stepIndex: number | null;
};

export type QuestLineGroupModel = {
    id: string;
    label: string;
    lines: string[];
};

export type QuestGraphLinkProvenance =
    | "questPrevious"
    | "questNext"
    | "choiceNext"
    | "stepNext"
    | "stepFailure"
    | "converges";

export type QuestLinkModel = {
    questKey: string;
    label: string;
    contextLabel: string | null;
    debugLabel: string | null;
    provenance: QuestGraphLinkProvenance;
    provenanceLabel: string;
};

export type QuestProgressionRailItemModel = {
    questKey: string;
    title: string;
    chapterLabel: string | null;
    subtitle: string | null;
    branchLabel: string | null;
    flags: string[];
    isSelected: boolean;
};

export type QuestProgressionRailModel = {
    items: QuestProgressionRailItemModel[];
    selectedQuestKey: string | null;
    questCount: number;
};

export type QuestChoiceSummaryModel = {
    choiceKey: string;
    title: string;
    descriptionLines: string[];
    requirementGroups: QuestLineGroupModel[];
    rewardLines: string[];
    nextQuestLinks: QuestLinkModel[];
    isSelected: boolean;
};

export type QuestStepSummaryModel = {
    stepIndex: number;
    title: string;
    objectiveText: string | null;
    descriptionLines: string[];
    requirementGroups: QuestLineGroupModel[];
    rewardLines: string[];
    nextQuestLink: QuestLinkModel | null;
    failQuestLink: QuestLinkModel | null;
    isSelected: boolean;
};

export type QuestProgressGateRowModel = {
    id: string;
    stepIndex: number;
    selectionLines: string[];
    completionLines: string[];
    failureLines: string[];
    forbiddenLines: string[];
    rewardLines: string[];
};

export type QuestObjectiveGroupModel = {
    id: string;
    kind: "objective" | "progressGate";
    title: string;
    stepIndexes: number[];
    representativeStepIndex: number;
    descriptionLines: string[];
    requirementGroups: QuestLineGroupModel[];
    rewardLines: string[];
    nextQuestLink: QuestLinkModel | null;
    failQuestLink: QuestLinkModel | null;
    gateRows: QuestProgressGateRowModel[];
    debugLabel: string | null;
    isSelected: boolean;
};

export type QuestTranscriptLineModel = {
    id: string;
    role: string | null;
    speakerLabel: string | null;
    sourceLineIndex: number | null;
    text: string;
};

export type QuestTranscriptBlockModel = {
    identity: string;
    title: string;
    archiveLabel: string | null;
    scopeLabel: string | null;
    phaseLabel: string | null;
    source: QuestDialogBlockDto;
    lines: QuestTranscriptLineModel[];
};

export type QuestChronicleModel = {
    questKey: string;
    title: string;
    descriptionLines: string[];
    selectedChoiceKey: string | null;
    selectedStepIndex: number | null;
    choices: QuestChoiceSummaryModel[];
    steps: QuestStepSummaryModel[];
    objectiveGroups: QuestObjectiveGroupModel[];
    selectedChoice: QuestChoiceSummaryModel | null;
    selectedStep: QuestStepSummaryModel | null;
    selectedObjectiveGroup: QuestObjectiveGroupModel | null;
    transcriptBlocks: QuestTranscriptBlockModel[];
};

export type QuestMetadataItemModel = {
    label: string;
    value: string;
};

export type QuestMetadataSectionModel = {
    id: string;
    label: string;
    items: QuestMetadataItemModel[];
};

export type QuestMetadataModel = {
    questKey: string;
    flags: string[];
    sections: QuestMetadataSectionModel[];
    previousQuestLinks: QuestLinkModel[];
    nextQuestLinks: QuestLinkModel[];
    convergesIntoQuestLink: QuestLinkModel | null;
};

export type QuestExplorerContentModel = {
    status: "empty" | "ready";
    selection: QuestExplorerSelection;
    rail: QuestProgressionRailModel;
    chronicle: QuestChronicleModel | null;
    metadata: QuestMetadataModel | null;
};
