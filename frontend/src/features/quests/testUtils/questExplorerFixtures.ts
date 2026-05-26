import type {
  QuestBranch,
  QuestExplorerEntry,
  QuestExplorerProgression,
  QuestExplorerResponse,
  Requirement,
  Reward,
  StrategyObjective,
} from "@/types/questTypes";

export type ProgressionQuestlineInput = {
  questLineKey?: string;
  questLineFamilyKey?: string;
  questLineName?: string;
  factionKey?: string;
  factionFamilyKey?: string;
  factionName?: string;
  chapterNumber?: number;
  chapterOrder?: number;
  title?: string;
  steps: Array<{
    stepNumber: number;
    stepOrder: number;
    title: string;
    detailEntryKey: string;
    variantEntryKeys?: string[];
  }>;
};

export function progressionQuestline({
  questLineKey = "Line_First_Tide",
  questLineFamilyKey = questLineKey,
  questLineName = "First Tide",
  factionKey = "Faction_Kin",
  factionFamilyKey = factionKey,
  factionName = "Kin",
  chapterNumber = 1,
  chapterOrder = 1,
  title = "Archive of the First Tide",
  steps,
}: ProgressionQuestlineInput): QuestExplorerProgression["questlines"][number] {
  return {
    questLineKey,
    questLineFamilyKey,
    questLineName,
    factionKey,
    factionFamilyKey,
    factionName,
    sourceQuestLineKeys: [questLineKey],
    sourceFactionKeys: [factionKey],
    chapters: [
      {
        chapterNumber,
        chapterOrder,
        title,
        steps: steps.map((step) => ({
          stepKey: `${questLineFamilyKey}:${factionFamilyKey}:chapter-${chapterOrder}:step-${step.stepOrder}`,
          stepNumber: step.stepNumber,
          stepOrder: step.stepOrder,
          title: step.title,
          projectionKind: step.variantEntryKeys?.length ? "virtual_alias_expanded" : "real_entry_backed",
          detailEntryKey: step.detailEntryKey,
          sourceEntryKeys: [step.detailEntryKey, ...(step.variantEntryKeys ?? [])],
          aliasEntryKeys: step.variantEntryKeys?.length ? [`${step.detailEntryKey}:alias`] : [],
          variants: [step.detailEntryKey, ...(step.variantEntryKeys ?? [])].map((entryKey, index) => ({
            entryKey,
            title: index === 0 ? step.title : entryKey,
            variantKind: index === 0 ? "entry" : "branch_variant",
            branchGroupKey: index === 0 ? null : step.detailEntryKey,
            branchLabel: index === 0 ? null : title,
            branchOrder: index === 0 ? null : index,
            previousEntryKeys: [],
            nextEntryKeys: [],
            failureEntryKeys: [],
            convergesIntoEntryKeys: [],
          })),
        })),
      },
    ],
  };
}

const baseRequirement: Requirement = {
  requirementKey: "Requirement_A",
  kind: "Location",
  displayText: "Visit the first marker.",
  polarity: null,
  groupLabel: "Marker",
  groupOrder: 1,
  targetRole: null,
  targetLabel: "First marker",
  requiredCount: null,
  durationTurns: null,
  state: null,
  referenceKind: null,
  referenceKey: null,
  referenceDisplayName: null,
  codexEntryKey: null,
};

const baseReward: Reward = {
  rewardKey: "Reward_A",
  kind: "Resource",
  displayText: "Gain Dust.",
  amount: 40,
  groupLabel: "Reward",
  groupOrder: 1,
  formulaText: null,
  assetKind: null,
  assetKey: null,
  assetDisplayName: "Dust",
  referenceKind: null,
  referenceKey: null,
  referenceDisplayName: null,
  codexEntryKey: null,
  targetScopeLabel: null,
};

const baseEntry: QuestExplorerEntry = {
  entryKey: "Quest_A",
  title: "Archive of the First Tide",
  summaryLines: ["A recovered strategic record."],
  questType: "Faction Quest",
  isMandatory: true,
  isKeyNarrativeBeat: true,
  aliases: ["FactionQuest_Alias"],
  navigation: {
    factionKey: "Faction_Kin",
    factionName: "Kin",
    questLineKey: "Line_First_Tide",
    questLineName: "First Tide",
    chapter: 1,
    chapterLabel: "Chapter 1",
    step: 1,
    stepLabel: "Step 1",
    sequenceIndex: 0,
    chapterOrder: 1,
    stepOrder: 1,
    branchGroupKey: "Branch_First_Tide",
    branchLabel: "First Tide",
    branchOrder: 1,
    isBranchStart: true,
    isBranchEnd: false,
    previousEntryKeys: [],
    nextEntryKeys: ["Quest_B"],
    failureEntryKeys: [],
    convergesIntoEntryKeys: [],
  },
  loreView: {
    sections: [
      {
        sectionKey: "Quest_A:start",
        phase: "intro",
        choiceKey: null,
        stepIndex: null,
        objectiveKey: null,
        lines: [
          { speakerLabel: "Archive", role: "narrator", text: "The tide record begins." },
          { speakerLabel: "Envoy", role: "character", text: "We follow the old marker." },
        ],
      },
    ],
  },
  strategyView: {
    objectives: [
      {
        objectiveKey: "Objective_A",
        text: "Reach the marker.",
        phase: "completion",
        requirements: [baseRequirement],
        rewards: [baseReward],
      },
    ],
  },
  branches: [
    {
      branchKey: "Branch_A",
      choiceKey: "Choice_A",
      label: "Follow the marker",
      orderIndex: 1,
      groupKey: "Branch_First_Tide",
      groupLabel: "First Tide",
      nextEntryKeys: ["Quest_B"],
      failureEntryKeys: [],
      convergesIntoEntryKeys: [],
      lore: { outcomePreviewLines: ["The path continues."] },
      strategy: { conditions: ["Choose the marker path."], requirements: [], rewards: [] },
    },
  ],
  quality: { warnings: [] },
};

export type QuestEntryOverride = Partial<Omit<QuestExplorerResponse["entries"][number], "navigation">> & {
  navigation?: Partial<QuestExplorerResponse["entries"][number]["navigation"]>;
};

export function questEntry({
  navigation,
  ...overrides
}: QuestEntryOverride = {}): QuestExplorerResponse["entries"][number] {
  return {
    ...baseEntry,
    entryKey: overrides.entryKey ?? "Quest_Custom",
    title: overrides.title ?? "Custom Quest",
    summaryLines: overrides.summaryLines ?? [],
    aliases: overrides.aliases ?? [],
    loreView: overrides.loreView ?? { sections: [] },
    strategyView: overrides.strategyView ?? { objectives: [] },
    branches: overrides.branches ?? [],
    quality: overrides.quality ?? null,
    ...overrides,
    navigation: {
      ...baseEntry.navigation,
      ...navigation,
    },
  };
}

export function testObjective(objectiveKey: string, text = objectiveKey): StrategyObjective {
  return {
    objectiveKey,
    choiceKey: null,
    text,
    phase: "completion",
    requirements: [],
    rewards: [],
  };
}

export function testRequirement(requirementKey: string, displayText: string): Requirement {
  return {
    ...baseRequirement,
    requirementKey,
    displayText,
  };
}

export function testReward(rewardKey: string, displayText: string): Reward {
  return {
    ...baseReward,
    rewardKey,
    displayText,
  };
}

export function testBranch(branchKey: string, label = branchKey): QuestBranch {
  return {
    branchKey,
    choiceKey: null,
    label,
    orderIndex: null,
    groupKey: null,
    groupLabel: null,
    nextEntryKeys: [],
    failureEntryKeys: [],
    convergesIntoEntryKeys: [],
    lore: null,
    strategy: null,
  };
}
