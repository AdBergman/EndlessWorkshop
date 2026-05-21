export type QuestExplorerResponse = {
    gameVersion: string | null;
    exporterVersion: string | null;
    exportedAtUtc: string | null;
    exportKind: "quest_explorer";
    schemaVersion: "quest_explorer.v3";
    entries: QuestExplorerEntry[];
    progression: QuestExplorerProgression | null;
};

export type QuestExplorerProgression = {
    questlines: QuestProgressionQuestline[];
    debugSummary: QuestProgressionDebugSummary | null;
};

export type QuestProgressionQuestline = {
    questLineKey: string | null;
    questLineFamilyKey: string | null;
    questLineName: string | null;
    factionKey: string | null;
    factionFamilyKey: string | null;
    factionName: string | null;
    sourceQuestLineKeys: string[];
    sourceFactionKeys: string[];
    chapters: QuestProgressionChapter[];
};

export type QuestProgressionChapter = {
    chapterNumber: number | null;
    chapterOrder: number | null;
    title: string;
    steps: QuestProgressionStep[];
};

export type QuestProgressionStep = {
    stepKey: string;
    stepNumber: number | null;
    stepOrder: number | null;
    title: string;
    projectionKind: string;
    detailEntryKey: string;
    sourceEntryKeys: string[];
    aliasEntryKeys: string[];
    variants: QuestProgressionVariant[];
};

export type QuestProgressionVariant = {
    entryKey: string;
    title: string;
    variantKind: string;
    branchGroupKey: string | null;
    branchLabel: string | null;
    branchOrder: number | null;
    previousEntryKeys: string[];
    nextEntryKeys: string[];
    failureEntryKeys: string[];
    convergesIntoEntryKeys: string[];
};

export type QuestProgressionDebugSummary = {
    totalEntries: number;
    questlineFamiliesFound: string[];
    questlines: QuestlineDebugSummary[];
    missingMajorFactionChapters: MissingMajorFactionChapters[];
    chaptersWithOnlyOneStep: ChapterWithOneStep[];
    numericQuestlineVariantsCollapsed: NumericQuestlineVariantCollapse[];
    entriesWithMissingChapterOrStepOrder: string[];
    suspiciousBranchVariantsWithoutParentStep: string[];
    tutorialEntriesPlaced: string[];
};

export type QuestlineDebugSummary = {
    questLineFamilyKey: string | null;
    factionFamilyKey: string | null;
    sourceQuestLineKeys: string[];
    chapters: ChapterDebugSummary[];
};

export type ChapterDebugSummary = {
    chapterOrder: number | null;
    chapterNumber: number | null;
    title: string;
    stepCount: number;
    steps: StepDebugSummary[];
};

export type StepDebugSummary = {
    stepKey: string;
    stepOrder: number | null;
    stepNumber: number | null;
    projectionKind: string;
    detailEntryKey: string;
    sourceEntryKeys: string[];
    aliasEntryKeys: string[];
    variantCount: number;
    branchVariantCount: number;
};

export type MissingMajorFactionChapters = {
    questLineFamilyKey: string | null;
    factionFamilyKey: string | null;
    missingChapterNumbers: number[];
};

export type ChapterWithOneStep = {
    questLineFamilyKey: string | null;
    factionFamilyKey: string | null;
    chapterOrder: number | null;
    title: string;
};

export type NumericQuestlineVariantCollapse = {
    sourceQuestLineKey: string | null;
    sourceFactionKey: string | null;
    targetQuestLineFamilyKey: string | null;
    targetFactionFamilyKey: string | null;
    entryCount: number;
    reason: string;
};

export type QuestExplorerEntry = {
    entryKey: string;
    title: string;
    summaryLines: string[];
    questType: string | null;
    isMandatory: boolean | null;
    isKeyNarrativeBeat: boolean | null;
    aliases: string[];
    navigation: QuestNavigation;
    loreView: QuestLoreView;
    strategyView: QuestStrategyView;
    branches: QuestBranch[];
    quality: QualityMetadata | null;
};

export type QuestNavigation = {
    factionKey: string | null;
    factionName: string | null;
    questLineKey: string | null;
    questLineName: string | null;
    chapter: number | null;
    chapterLabel: string | null;
    step: number | null;
    stepLabel: string | null;
    sequenceIndex: number;
    chapterOrder: number | null;
    stepOrder: number | null;
    branchGroupKey: string | null;
    branchLabel: string | null;
    branchOrder: number | null;
    isBranchStart: boolean | null;
    isBranchEnd: boolean | null;
    previousEntryKeys: string[];
    nextEntryKeys: string[];
    failureEntryKeys: string[];
    convergesIntoEntryKeys: string[];
};

export type QuestLoreView = {
    sections: LoreSection[];
};

export type LoreSection = {
    sectionKey: string;
    phase: string;
    choiceKey: string | null;
    stepIndex: number | null;
    objectiveKey: string | null;
    lines: LoreLine[];
};

export type LoreLine = {
    speakerLabel: string | null;
    role: string;
    text: string;
};

export type QuestStrategyView = {
    objectives: StrategyObjective[];
};

export type StrategyObjective = {
    objectiveKey: string | null;
    text: string;
    phase: string | null;
    requirements: Requirement[];
    rewards: Reward[];
};

export type QuestBranch = {
    branchKey: string;
    choiceKey: string | null;
    label: string;
    orderIndex: number | null;
    groupKey: string | null;
    groupLabel: string | null;
    nextEntryKeys: string[];
    failureEntryKeys: string[];
    convergesIntoEntryKeys: string[];
    lore: BranchLore | null;
    strategy: BranchStrategy | null;
};

export type BranchLore = {
    outcomePreviewLines: string[];
};

export type BranchStrategy = {
    conditions: string[];
    requirements: Requirement[];
    rewards: Reward[];
};

export type Requirement = {
    requirementKey: string;
    kind: string;
    displayText: string;
    polarity: string | null;
    groupLabel: string | null;
    groupOrder: number | null;
    targetRole: string | null;
    targetLabel: string | null;
    requiredCount: number | null;
    durationTurns: number | null;
    state: string | null;
    referenceKind: string | null;
    referenceKey: string | null;
    referenceDisplayName: string | null;
    codexEntryKey: string | null;
};

export type Reward = {
    rewardKey: string;
    kind: string;
    displayText: string;
    amount: number | null;
    groupLabel: string | null;
    groupOrder: number | null;
    formulaText: string | null;
    assetKind: string | null;
    assetKey: string | null;
    assetDisplayName: string | null;
    referenceKind: string | null;
    referenceKey: string | null;
    referenceDisplayName: string | null;
    codexEntryKey: string | null;
    targetScopeLabel: string | null;
};

export type QualityMetadata = {
    warnings: string[];
};
