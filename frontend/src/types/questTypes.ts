export interface QuestChronicleDto {
    game: string | null;
    gameVersion: string | null;
    exporterVersion: string | null;
    exportedAtUtc: string | null;
    exportKind: string | null;
    schemaVersion: string | null;
    contractSurface: string | null;
    entries: QuestChronicleEntryDto[];
}

export interface QuestChronicleEntryDto {
    entryKey: string;
    primaryQuestKey: string | null;
    sourceQuestKeys: string[];
    groupingKey: string | null;
    groupingReason: string | null;
    title: string | null;
    summaryLines: string[];
    questType: string | null;
    mandatory: boolean;
    keyNarrativeBeat: boolean;
    factionKey: string | null;
    questLineKey: string | null;
    chapter: number | null;
    chapterLabel: string | null;
    step: number | null;
    stepLabel: string | null;
    branchKey: string | null;
    branchLabel: string | null;
    nextEntryKeys: string[];
    failureEntryKeys: string[];
    convergesIntoEntryKeys: string[];
    objectives: QuestChronicleObjectiveDto[];
    paths: QuestChroniclePathDto[];
    transcriptBlocks: QuestChronicleTranscriptBlockDto[];
}

export interface QuestChronicleObjectiveDto {
    objectiveText: string | null;
    sourceQuestKey: string | null;
    choiceKey: string | null;
    stepIndex: number | null;
    descriptionLines: string[];
    completionLines: string[];
    failureLines: string[];
    forbiddenLines: string[];
    selectionLines: string[];
    rewardLines: string[];
    completionRequirements: QuestChronicleRequirementDto[];
    failureRequirements: QuestChronicleRequirementDto[];
    forbiddenRequirements: QuestChronicleRequirementDto[];
    selectionRequirements: QuestChronicleRequirementDto[];
    rewards: QuestChronicleRewardDto[];
}

export interface QuestChroniclePathDto {
    pathKey: string;
    label: string | null;
    labelSource: string | null;
    choiceOrdinal: number | null;
    sourceQuestKey: string | null;
    choiceKey: string | null;
    conditionLines: string[];
    rewardLines: string[];
    nextEntryKeys: string[];
    failureEntryKeys: string[];
    requirements: QuestChronicleRequirementDto[];
    rewards: QuestChronicleRewardDto[];
}

export interface QuestChronicleRequirementDto {
    requirementKey: string | null;
    kind: string | null;
    phase: string | null;
    polarity: string | null;
    displayText: string | null;
    referenceKey: string | null;
    referenceKind: string | null;
    referenceDisplayName: string | null;
    targetRole: string | null;
    targetLabel: string | null;
    state: string | null;
    requiredCount: number | null;
    durationTurns: number | null;
}

export interface QuestChronicleRewardDto {
    rewardKey: string | null;
    sourceRewardKeys: string[];
    kind: string | null;
    displayText: string | null;
    formulaText: string | null;
    amount: number | null;
    assetKind: string | null;
    assetKey: string | null;
    assetDisplayName: string | null;
    targetScopeLabel: string | null;
}

export interface QuestChronicleTranscriptBlockDto {
    dialogKey: string | null;
    phase: string | null;
    sourceQuestKey: string | null;
    choiceKey: string | null;
    stepIndex: number | null;
    lines: QuestChronicleTranscriptLineDto[];
}

export interface QuestChronicleTranscriptLineDto {
    lineIndex: number | null;
    role: string | null;
    speakerLabel: string | null;
    text: string | null;
}
