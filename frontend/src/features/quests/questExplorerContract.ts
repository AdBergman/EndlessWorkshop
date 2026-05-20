export type QuestExplorerExport = {
    exportKind: "quest_explorer";
    schemaVersion: "quest_explorer.v3";
    exportedAtUtc: string;
    gameVersion: string;
    exporterVersion: string;
    entries: QuestExplorerEntry[];
};

export type QuestExplorerEntry = {
    entryKey: string;
    title: string;
    summaryLines: string[];
    questType?: string;
    isMandatory?: boolean;
    isKeyNarrativeBeat?: boolean;
    aliases: string[];
    navigation: QuestNavigation;
    loreView: QuestLoreView;
    strategyView: QuestStrategyView;
    branches: QuestBranch[];
    quality?: QuestQualityMetadata;
};

export type QuestNavigation = {
    factionKey?: string;
    factionName?: string;
    questLineKey?: string;
    questLineName?: string;
    chapter?: number;
    chapterLabel?: string;
    step?: number;
    stepLabel?: string;
    sequenceIndex: number;
    chapterOrder?: number;
    stepOrder?: number;
    branchGroupKey?: string;
    branchLabel?: string;
    branchOrder?: number;
    isBranchStart?: boolean;
    isBranchEnd?: boolean;
    previousEntryKeys: string[];
    nextEntryKeys: string[];
    failureEntryKeys: string[];
    convergesIntoEntryKeys: string[];
};

export type LorePhase = "start" | "success" | "failure" | "choice" | "other";

export type QuestLoreView = {
    sections: LoreSection[];
};

export type LoreSection = {
    sectionKey: string;
    phase: LorePhase;
    choiceKey?: string;
    stepIndex?: number;
    objectiveKey?: string;
    lines: LoreLine[];
};

export type LoreLine = {
    speakerLabel?: string;
    role: "narrator" | "character";
    text: string;
};

export type QuestStrategyView = {
    objectives: StrategyObjective[];
};

export type StrategyObjective = {
    objectiveKey?: string;
    text: string;
    phase?: string;
    requirements: Requirement[];
    rewards: Reward[];
};

export type QuestBranch = {
    branchKey: string;
    choiceKey?: string;
    label: string;
    orderIndex?: number;
    groupKey?: string;
    groupLabel?: string;
    nextEntryKeys: string[];
    failureEntryKeys?: string[];
    convergesIntoEntryKeys?: string[];
    lore?: {
        outcomePreviewLines?: string[];
    };
    strategy?: {
        conditions: string[];
        requirements: Requirement[];
        rewards: Reward[];
    };
};

export type Requirement = {
    requirementKey: string;
    kind: string;
    displayText: string;
    polarity?: string;
    groupLabel?: string;
    groupOrder?: number;
    targetRole?: string;
    targetLabel?: string;
    requiredCount?: number;
    durationTurns?: number;
    state?: string;
    referenceKind?: string;
    referenceKey?: string;
    referenceDisplayName?: string;
    codexEntryKey?: string;
};

export type Reward = {
    rewardKey: string;
    kind: string;
    displayText: string;
    amount?: number;
    groupLabel?: string;
    groupOrder?: number;
    formulaText?: string;
    assetKind?: string;
    assetKey?: string;
    assetDisplayName?: string;
    referenceKind?: string;
    referenceKey?: string;
    referenceDisplayName?: string;
    codexEntryKey?: string;
    targetScopeLabel?: string;
};

export type QuestQualityMetadata = {
    warnings?: QuestQualityWarning[];
};

export type QuestQualityWarning = {
    code: string;
    message: string;
};
