import type {
  QuestBranch,
  QuestExplorerEntry,
  QuestExplorerProgression,
  QuestExplorerResponse,
} from "@/types/questTypes";
import {
  progressionQuestline,
  questEntry,
  testBranch,
  testObjective,
  testRequirement,
  testReward,
} from "@/features/quests/testUtils/questExplorerFixtures";

export const canonicalSemanticKeys = {
  kinLinear: "Quest_Kin_Ch0_NewHome",
  kinNextChapter: "Quest_Kin_Ch1_Stirrings",
  aspectDecision: "Quest_Aspect_Ch2_Symbiosis",
  mukagGroupedContinuation: "Quest_Mukag_Ch2_GroupedContinuations",
  mukagTopology: "Quest_Mukag_Ch4_Gamble",
  lastLordConvergence: "Quest_LastLord_Ch6_Rejoin",
  lastLordRejoined: "Quest_LastLord_Ch7_Faithful",
  necroUnresolved: "Quest_Necro_Ch6_Unwritten",
  necroFailure: "Quest_Necro_Ch4_Collapse",
  aspectTerminal: "Quest_Aspect_Ch5_Final",
  aliasOwner: "Quest_LastLord_Ch6_Owner",
  aliasVariantA: "Quest_LastLord_Ch6A_Reclaim",
  aliasVariantB: "Quest_LastLord_Ch6B_Forgive",
} as const;

type FactionConfig = {
  factionKey: string;
  factionName: string;
  questLineKey: string;
  questLineName: string;
};

const factions = {
  kin: {
    factionKey: "Faction_Kin",
    factionName: "Kin",
    questLineKey: "Line_Kin_Canonical",
    questLineName: "Kin Canonical",
  },
  aspect: {
    factionKey: "Faction_Aspect",
    factionName: "Aspect",
    questLineKey: "Line_Aspect_Canonical",
    questLineName: "Aspect Canonical",
  },
  mukag: {
    factionKey: "Faction_Mukag",
    factionName: "Mukag",
    questLineKey: "Line_Mukag_Canonical",
    questLineName: "Mukag Canonical",
  },
  lastLord: {
    factionKey: "Faction_LastLord",
    factionName: "Last Lord",
    questLineKey: "Line_LastLord_Canonical",
    questLineName: "Last Lord Canonical",
  },
  necro: {
    factionKey: "Faction_Necro",
    factionName: "Necrophage",
    questLineKey: "Line_Necro_Canonical",
    questLineName: "Necrophage Canonical",
  },
} satisfies Record<string, FactionConfig>;

function branch(overrides: Partial<QuestBranch> & Pick<QuestBranch, "branchKey">): QuestBranch {
  return {
    ...testBranch(overrides.branchKey, overrides.label ?? overrides.branchKey),
    orderIndex: overrides.orderIndex ?? 1,
    groupKey: overrides.groupKey ?? `${overrides.branchKey}:group`,
    groupLabel: overrides.groupLabel ?? "Canonical Stage",
    nextEntryKeys: overrides.nextEntryKeys ?? [],
    failureEntryKeys: overrides.failureEntryKeys ?? [],
    convergesIntoEntryKeys: overrides.convergesIntoEntryKeys ?? [],
    ...overrides,
  };
}

function semanticEntry({
  key,
  title,
  faction,
  chapter,
  step = 1,
  branches,
  aliases = [],
  summary = `${title} summary.`,
}: {
  key: string;
  title: string;
  faction: FactionConfig;
  chapter: number;
  step?: number;
  branches?: QuestBranch[];
  aliases?: string[];
  summary?: string;
}): QuestExplorerEntry {
  return questEntry({
    entryKey: key,
    title,
    aliases,
    summaryLines: [summary],
    navigation: {
      factionKey: faction.factionKey,
      factionName: faction.factionName,
      questLineKey: faction.questLineKey,
      questLineName: faction.questLineName,
      chapter,
      chapterLabel: `Chapter ${chapter}`,
      chapterOrder: chapter,
      step,
      stepLabel: `Step ${step}`,
      stepOrder: step,
      sequenceIndex: chapter * 10 + step,
      previousEntryKeys: [],
      nextEntryKeys: [],
      failureEntryKeys: [],
      convergesIntoEntryKeys: [],
    },
    loreView: {
      sections: [{
        sectionKey: `${key}:lore:intro`,
        phase: "intro",
        choiceKey: null,
        stepIndex: null,
        objectiveKey: null,
        lines: [{ speakerLabel: null, role: "narrator", text: `${title} chronicle.` }],
      }],
    },
    strategyView: {
      objectives: [{
        ...testObjective(`${key}:objective`, `${title} objective.`),
        requirements: [testRequirement(`${key}:requirement`, `${title} requirement.`)],
        rewards: [testReward(`${key}:reward`, `${title} reward.`)],
      }],
    },
    branches: branches ?? [],
  });
}

export const canonicalSemanticEntries = {
  kinLinear: semanticEntry({
    key: canonicalSemanticKeys.kinLinear,
    title: "A New Home",
    faction: factions.kin,
    chapter: 0,
    branches: [
      branch({
        branchKey: "Branch_Kin_Setup",
        choiceKey: "Choice_Kin_Setup",
        label: "Found a home for the surviving Kin",
        groupKey: "Kin_Ch0_Setup",
        groupLabel: "Setup",
        sectionRole: "artifact",
        branchStepOrder: 1,
      }),
      branch({
        branchKey: "Branch_Kin_Rebuild",
        choiceKey: "Choice_Kin_Rebuild",
        label: "Start the task of rebuilding your Empire",
        groupKey: "Kin_Ch0_Continuation",
        groupLabel: "Continuation",
        sectionRole: "continuation",
        parentBranchKey: "Branch_Kin_Setup",
        prerequisiteBranchKeys: ["Branch_Kin_Setup"],
        prerequisiteBranchPath: ["Branch_Kin_Setup"],
        branchStepOrder: 2,
        nextEntryKeys: [canonicalSemanticKeys.kinNextChapter],
        strategy: { conditions: ["Rebuild the first district."], requirements: [], rewards: [] },
      }),
    ],
  }),
  kinNextChapter: semanticEntry({
    key: canonicalSemanticKeys.kinNextChapter,
    title: "Stirrings",
    faction: factions.kin,
    chapter: 1,
  }),
  aspectDecision: semanticEntry({
    key: canonicalSemanticKeys.aspectDecision,
    title: "Symbiosis",
    faction: factions.aspect,
    chapter: 2,
    branches: [
      branch({
        branchKey: "Branch_Aspect_Bond",
        choiceKey: "Choice_Aspect_Bond",
        label: "Bond with the Aspect",
        groupKey: "Aspect_Ch2_Decision",
        groupLabel: "Symbiosis Decision",
        choiceGroupKey: "Aspect_Ch2_Decision",
        sectionRole: "true_choice",
        branchStepOrder: 1,
        nextEntryKeys: ["Quest_Aspect_Bonded"],
        strategy: { conditions: ["Accept the symbiosis."], requirements: [], rewards: [] },
      }),
      branch({
        branchKey: "Branch_Aspect_Refuse",
        choiceKey: "Choice_Aspect_Refuse",
        label: "Refuse the Aspect",
        groupKey: "Aspect_Ch2_Decision",
        groupLabel: "Symbiosis Decision",
        choiceGroupKey: "Aspect_Ch2_Decision",
        sectionRole: "true_choice",
        branchStepOrder: 1,
        nextEntryKeys: ["Quest_Aspect_Refused"],
        strategy: { conditions: ["Reject the symbiosis."], requirements: [], rewards: [] },
      }),
    ],
  }),
  mukagGroupedContinuation: semanticEntry({
    key: canonicalSemanticKeys.mukagGroupedContinuation,
    title: "Forgotten Power",
    faction: factions.mukag,
    chapter: 2,
    branches: [
      branch({
        branchKey: "Branch_Mukag_Grouped_Setup",
        choiceKey: "Choice_Mukag_Grouped_Setup",
        label: "Recover the forgotten power",
        groupKey: "Mukag_Ch2_Setup",
        groupLabel: "Setup",
        sectionRole: "artifact",
        branchStepOrder: 1,
      }),
      branch({
        branchKey: "Branch_Mukag_Grouped_Pious",
        choiceKey: "Choice_Mukag_Grouped_Pious",
        label: "Pious continuation",
        groupKey: "Mukag_Ch2_Grouped_Continuations",
        groupLabel: "Grouped Continuations",
        choiceGroupKey: "Mukag_Ch2_Grouped_Continuations",
        sectionRole: "continuation",
        parentBranchKey: "Branch_Mukag_Grouped_Setup",
        prerequisiteBranchKeys: ["Branch_Mukag_Grouped_Setup"],
        prerequisiteBranchPath: ["Branch_Mukag_Grouped_Setup"],
        branchStepOrder: 2,
        nextEntryKeys: ["Quest_Mukag_Pious_Result"],
      }),
      branch({
        branchKey: "Branch_Mukag_Grouped_Bold",
        choiceKey: "Choice_Mukag_Grouped_Bold",
        label: "Bold continuation",
        groupKey: "Mukag_Ch2_Grouped_Continuations",
        groupLabel: "Grouped Continuations",
        choiceGroupKey: "Mukag_Ch2_Grouped_Continuations",
        sectionRole: "continuation",
        parentBranchKey: "Branch_Mukag_Grouped_Setup",
        prerequisiteBranchKeys: ["Branch_Mukag_Grouped_Setup"],
        prerequisiteBranchPath: ["Branch_Mukag_Grouped_Setup"],
        branchStepOrder: 2,
        nextEntryKeys: ["Quest_Mukag_Bold_Result"],
      }),
    ],
  }),
  mukagTopology: semanticEntry({
    key: canonicalSemanticKeys.mukagTopology,
    title: "A Gamble",
    faction: factions.mukag,
    chapter: 4,
    branches: [
      branch({
        branchKey: "Branch_Mukag_Pious",
        choiceKey: "Choice_Mukag_Pious",
        label: "Pious continuation",
        groupKey: "Mukag_Ch4_Topology",
        groupLabel: "Mukag Continuations",
        choiceGroupKey: "Mukag_Ch4_Topology",
        branchStepOrder: 1,
        nextEntryKeys: ["Quest_Mukag_Pious"],
      }),
      branch({
        branchKey: "Branch_Mukag_Bold",
        choiceKey: "Choice_Mukag_Bold",
        label: "Bold continuation",
        groupKey: "Mukag_Ch4_Topology",
        groupLabel: "Mukag Continuations",
        choiceGroupKey: "Mukag_Ch4_Topology",
        branchStepOrder: 1,
        nextEntryKeys: ["Quest_Mukag_Bold"],
      }),
    ],
  }),
  lastLordConvergence: semanticEntry({
    key: canonicalSemanticKeys.lastLordConvergence,
    title: "A Mortal Life?",
    faction: factions.lastLord,
    chapter: 6,
    branches: [
      branch({
        branchKey: "Branch_LastLord_Rejoin",
        choiceKey: "Choice_LastLord_Rejoin",
        label: "Rejoin the faithful line",
        groupKey: "LastLord_Ch6_Convergence",
        groupLabel: "Convergence",
        sectionRole: "convergence",
        branchStepOrder: 1,
        convergesIntoEntryKeys: [canonicalSemanticKeys.lastLordRejoined],
      }),
    ],
  }),
  lastLordRejoined: semanticEntry({
    key: canonicalSemanticKeys.lastLordRejoined,
    title: "Welcome Back, Faithful Friend",
    faction: factions.lastLord,
    chapter: 7,
  }),
  necroUnresolved: semanticEntry({
    key: canonicalSemanticKeys.necroUnresolved,
    title: "The Unwritten Hunger",
    faction: factions.necro,
    chapter: 6,
    branches: [
      branch({
        branchKey: "Branch_Necro_Unwritten",
        choiceKey: "Choice_Necro_Unwritten",
        label: "Follow the unrecorded hunger",
        groupKey: "Necro_Ch6_Unresolved",
        groupLabel: "Unresolved",
        sectionRole: "unresolved",
        branchStepOrder: 1,
      }),
    ],
  }),
  necroFailure: semanticEntry({
    key: canonicalSemanticKeys.necroFailure,
    title: "Virgin Lands Collapse",
    faction: factions.necro,
    chapter: 4,
    branches: [
      branch({
        branchKey: "Branch_Necro_Failure",
        choiceKey: "Choice_Necro_Failure",
        label: "Overrun the failed nest",
        groupKey: "Necro_Ch4_Failure",
        groupLabel: "Failure",
        sectionRole: "failure",
        branchStepOrder: 1,
        failureEntryKeys: ["Quest_Necro_Failed"],
      }),
    ],
  }),
  aspectTerminal: semanticEntry({
    key: canonicalSemanticKeys.aspectTerminal,
    title: "The Final Shape",
    faction: factions.aspect,
    chapter: 5,
    branches: [
      branch({
        branchKey: "Branch_Aspect_Terminal",
        choiceKey: "Choice_Aspect_Terminal",
        label: "Accept the final form",
        groupKey: "Aspect_Ch5_Terminal",
        groupLabel: "Terminal",
        sectionRole: "terminal",
        branchStepOrder: 1,
      }),
    ],
  }),
  aliasOwner: semanticEntry({
    key: canonicalSemanticKeys.aliasOwner,
    title: "Last Lord Variant Owner",
    faction: factions.lastLord,
    chapter: 6,
    aliases: ["Quest_LastLord_Ch6_Owner_Alias"],
    summary: "The owner record carries variant lore and strategy.",
  }),
  aliasVariantA: semanticEntry({
    key: canonicalSemanticKeys.aliasVariantA,
    title: "A Mortal Life?",
    faction: factions.lastLord,
    chapter: 6,
    step: 2,
    summary: "Reclaim variant summary.",
  }),
  aliasVariantB: semanticEntry({
    key: canonicalSemanticKeys.aliasVariantB,
    title: "Welcome Back, Faithful Friend",
    faction: factions.lastLord,
    chapter: 6,
    step: 3,
    summary: "Forgive variant summary.",
  }),
};

export const canonicalSemanticEntriesList: QuestExplorerEntry[] = Object.values(canonicalSemanticEntries);

export const canonicalSemanticProgression: QuestExplorerProgression = {
  questlines: [
    progressionQuestline({
      ...factions.kin,
      chapterNumber: 0,
      chapterOrder: 0,
      title: "A New Home",
      steps: [
        { stepNumber: 1, stepOrder: 1, title: "A New Home", detailEntryKey: canonicalSemanticKeys.kinLinear },
        { stepNumber: 2, stepOrder: 2, title: "A New Home", detailEntryKey: canonicalSemanticKeys.kinLinear },
      ],
    }),
    progressionQuestline({
      ...factions.kin,
      chapterNumber: 1,
      chapterOrder: 1,
      title: "Stirrings",
      steps: [
        { stepNumber: 1, stepOrder: 1, title: "Stirrings", detailEntryKey: canonicalSemanticKeys.kinNextChapter },
      ],
    }),
    progressionQuestline({
      ...factions.aspect,
      chapterNumber: 2,
      chapterOrder: 2,
      title: "Symbiosis",
      steps: [
        { stepNumber: 1, stepOrder: 1, title: "Symbiosis", detailEntryKey: canonicalSemanticKeys.aspectDecision },
      ],
    }),
    progressionQuestline({
      ...factions.mukag,
      chapterNumber: 2,
      chapterOrder: 2,
      title: "Forgotten Power",
      steps: [
        { stepNumber: 1, stepOrder: 1, title: "Forgotten Power", detailEntryKey: canonicalSemanticKeys.mukagGroupedContinuation },
      ],
    }),
    progressionQuestline({
      ...factions.mukag,
      chapterNumber: 4,
      chapterOrder: 4,
      title: "A Gamble",
      steps: [
        { stepNumber: 1, stepOrder: 1, title: "A Gamble", detailEntryKey: canonicalSemanticKeys.mukagTopology },
      ],
    }),
    progressionQuestline({
      ...factions.lastLord,
      chapterNumber: 6,
      chapterOrder: 6,
      title: "Last Lord Convergence",
      steps: [
        { stepNumber: 1, stepOrder: 1, title: "A Mortal Life?", detailEntryKey: canonicalSemanticKeys.lastLordConvergence },
      ],
    }),
    progressionQuestline({
      ...factions.necro,
      chapterNumber: 6,
      chapterOrder: 6,
      title: "The Unwritten Hunger",
      steps: [
        { stepNumber: 1, stepOrder: 1, title: "The Unwritten Hunger", detailEntryKey: canonicalSemanticKeys.necroUnresolved },
      ],
    }),
    progressionQuestline({
      ...factions.necro,
      chapterNumber: 4,
      chapterOrder: 4,
      title: "Virgin Lands Collapse",
      steps: [
        { stepNumber: 1, stepOrder: 1, title: "Virgin Lands Collapse", detailEntryKey: canonicalSemanticKeys.necroFailure },
      ],
    }),
    progressionQuestline({
      ...factions.aspect,
      chapterNumber: 5,
      chapterOrder: 5,
      title: "The Final Shape",
      steps: [
        { stepNumber: 1, stepOrder: 1, title: "The Final Shape", detailEntryKey: canonicalSemanticKeys.aspectTerminal },
      ],
    }),
    progressionQuestline({
      ...factions.lastLord,
      chapterNumber: 6,
      chapterOrder: 60,
      title: "Last Lord Variants",
      steps: [
        {
          stepNumber: 1,
          stepOrder: 1,
          title: "Last Lord Variant Owner",
          detailEntryKey: canonicalSemanticKeys.aliasOwner,
          variantEntryKeys: [
            canonicalSemanticKeys.aliasVariantA,
            canonicalSemanticKeys.aliasVariantB,
          ],
        },
      ],
    }),
  ],
  debugSummary: null,
};

export const canonicalSemanticQuestExplorer: QuestExplorerResponse = {
  gameVersion: "0.80",
  exporterVersion: "canonical-fixture",
  exportedAtUtc: "deterministic",
  exportKind: "quest_explorer",
  schemaVersion: "quest_explorer.v3",
  entries: canonicalSemanticEntriesList,
  progression: canonicalSemanticProgression,
};

export const canonicalSemanticEntriesByKey: Record<string, QuestExplorerEntry> = Object.fromEntries(
  canonicalSemanticEntriesList.map((entry) => [entry.entryKey, entry])
);
