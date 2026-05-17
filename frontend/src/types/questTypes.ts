export interface QuestExplorerDto {
    quests: QuestDto[];
    dialogBlocks: QuestDialogBlockDto[];
}

export interface QuestDto {
    questKey: string;
    displayName: string | null;
    descriptionLines: string[];
    categoryKey: string | null;
    categoryType: string | null;
    branchStart: boolean;
    branchEnd: boolean;
    mandatory: boolean;
    keyNarrativeBeat: boolean;
    narrativeVictoryPathChoice: boolean;
    chapterKey: string | null;
    chapterIndex: number | null;
    chapterNumber: number | null;
    questSequenceIndex: number | null;
    branchGroupKey: string | null;
    branchLabel: string | null;
    inferredFactionKey: string | null;
    inferredQuestLineKey: string | null;
    convergesIntoQuestKey: string | null;
    previousQuestKeys: string[];
    nextQuestKeys: string[];
    referenceKeys: string[];
    rootDialogBlockIdentities: string[];
    choices: QuestChoiceDto[];
}

export interface QuestChoiceDto {
    choiceKey: string;
    displayName: string | null;
    choiceOrder: number;
    descriptionLines: string[];
    completionPrerequisiteLines: string[];
    failurePrerequisiteLines: string[];
    rewardDisplayLines: string[];
    nextQuestKeys: string[];
    referenceKeys: string[];
    steps: QuestStepDto[];
}

export interface QuestStepDto {
    stepIndex: number;
    stepOrder: number;
    objectiveText: string | null;
    nextQuestKey: string | null;
    failQuestKey: string | null;
    descriptionLines: string[];
    completionPrerequisiteLines: string[];
    failurePrerequisiteLines: string[];
    forbiddenPrerequisiteLines: string[];
    selectionPrerequisiteLines: string[];
    rewardDisplayLines: string[];
    referenceKeys: string[];
    dialogBlockIdentities: string[];
}

export interface QuestDialogBlockDto {
    identity: string;
    questKey: string | null;
    choiceKey: string | null;
    stepIndex: number | null;
    parentScope: string | null;
    dialogKey: string | null;
    phase: string | null;
    expectedLineCount: number;
    blockOrder: number;
    lines: QuestDialogLineDto[];
}

export interface QuestDialogLineDto {
    lineOrder: number;
    sourceLineIndex: number | null;
    role: string | null;
    speakerLabel: string | null;
    text: string | null;
}
