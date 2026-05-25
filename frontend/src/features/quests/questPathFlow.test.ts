import { describe, expect, it } from "vitest";

import type {
  QuestBranch,
  QuestExplorerEntry,
  QuestExplorerProgression,
  QuestProgressionChapter,
  QuestProgressionStep,
} from "@/types/questTypes";

import {
  buildLoreChronicleStream,
  buildQuestPathFlow,
  choicesForStep,
  revealMetadataSatisfied,
  selectionForChoice,
  visibilityDiagnosticsForChoices,
  visibleChoicesForDiagnostics,
  type QuestDetailProgression,
  type RevealContext,
} from "./questPathFlow";

function questBranch(overrides: Partial<QuestBranch> & Pick<QuestBranch, "branchKey">): QuestBranch {
  return {
    branchKey: overrides.branchKey,
    choiceKey: overrides.choiceKey ?? null,
    label: overrides.label ?? overrides.branchKey,
    orderIndex: overrides.orderIndex ?? 1,
    groupKey: overrides.groupKey ?? "ChoiceGroup_Test",
    groupLabel: overrides.groupLabel ?? "Choose a Path",
    branchStepOrder: overrides.branchStepOrder ?? null,
    sectionRole: overrides.sectionRole ?? "true_choice",
    parentBranchKey: overrides.parentBranchKey ?? null,
    parentChoiceKey: overrides.parentChoiceKey ?? null,
    prerequisiteBranchKeys: overrides.prerequisiteBranchKeys ?? [],
    prerequisiteBranchPath: overrides.prerequisiteBranchPath ?? [],
    choiceGroupKey: overrides.choiceGroupKey ?? null,
    convergenceGroupKey: overrides.convergenceGroupKey ?? null,
    revealedByBranchKeys: overrides.revealedByBranchKeys ?? [],
    revealedByChoiceKeys: overrides.revealedByChoiceKeys ?? [],
    revealedByBranchPathAlternatives: overrides.revealedByBranchPathAlternatives ?? [],
    nextEntryKeys: overrides.nextEntryKeys ?? [],
    failureEntryKeys: overrides.failureEntryKeys ?? [],
    convergesIntoEntryKeys: overrides.convergesIntoEntryKeys ?? [],
    lore: overrides.lore ?? null,
    strategy: overrides.strategy ?? null,
  };
}

function questEntry(
  overrides: Partial<QuestExplorerEntry> & Pick<QuestExplorerEntry, "entryKey">,
): QuestExplorerEntry {
  const title = overrides.title ?? overrides.entryKey;

  return {
    entryKey: overrides.entryKey,
    title,
    summaryLines: overrides.summaryLines ?? [],
    questType: overrides.questType ?? "Faction Quest",
    isMandatory: overrides.isMandatory ?? null,
    isKeyNarrativeBeat: overrides.isKeyNarrativeBeat ?? null,
    aliases: overrides.aliases ?? [],
    navigation:
      overrides.navigation ??
      {
        factionKey: "Faction_Test",
        factionName: "Test Faction",
        questLineKey: "QuestLine_Test",
        questLineName: "Test Questline",
        chapter: 1,
        chapterLabel: "Chapter 1",
        step: 1,
        stepLabel: "Step 1",
        sequenceIndex: 1,
        chapterOrder: 1,
        stepOrder: 1,
        branchGroupKey: null,
        branchLabel: null,
        branchOrder: null,
        isBranchStart: null,
        isBranchEnd: null,
        previousEntryKeys: [],
        nextEntryKeys: [],
        failureEntryKeys: [],
        convergesIntoEntryKeys: [],
      },
    loreView: overrides.loreView ?? { sections: [] },
    strategyView: overrides.strategyView ?? { objectives: [] },
    branches: overrides.branches ?? [],
    quality: overrides.quality ?? null,
  };
}

function progressionStep(stepOrder: number, detailEntryKey: string): QuestProgressionStep {
  return {
    stepKey: `QuestLine_Test:chapter-1:step-${stepOrder}`,
    stepNumber: stepOrder,
    stepOrder,
    title: `Step ${stepOrder}`,
    projectionKind: "real_entry_backed",
    detailEntryKey,
    sourceEntryKeys: [detailEntryKey],
    aliasEntryKeys: [],
    variants: [
      {
        entryKey: detailEntryKey,
        title: `Step ${stepOrder}`,
        variantKind: "entry",
        branchGroupKey: null,
        branchLabel: null,
        branchOrder: null,
        previousEntryKeys: [],
        nextEntryKeys: [],
        failureEntryKeys: [],
        convergesIntoEntryKeys: [],
      },
    ],
  };
}

function progressionChapter(
  chapterOrder: number,
  chapterTitle: string,
  steps: QuestProgressionStep[],
): QuestProgressionChapter {
  return {
    chapterNumber: chapterOrder,
    chapterOrder,
    title: chapterTitle,
    steps,
  };
}

function questlineProgression(chapters: QuestProgressionChapter[]): QuestExplorerProgression {
  return {
    questlines: [
      {
        questLineKey: "QuestLine_Test",
        questLineFamilyKey: "QuestLine_Test",
        questLineName: "Test Questline",
        factionKey: "Faction_Test",
        factionFamilyKey: "Faction_Test",
        factionName: "Test Faction",
        sourceQuestLineKeys: ["QuestLine_Test"],
        sourceFactionKeys: ["Faction_Test"],
        chapters,
      },
    ],
    debugSummary: null,
  };
}

function detailProgression(
  chapter: QuestProgressionChapter,
  focusedStepIndex = 0,
): QuestDetailProgression {
  const selectedStep = chapter.steps[focusedStepIndex];
  return {
    questline: {
      questLineKey: "QuestLine_Test",
      questLineFamilyKey: "QuestLine_Test",
      questLineName: "Test Questline",
      factionKey: "Faction_Test",
      factionFamilyKey: "Faction_Test",
      factionName: "Test Faction",
      sourceQuestLineKeys: ["QuestLine_Test"],
      sourceFactionKeys: ["Faction_Test"],
      chapters: [chapter],
    },
    chapter,
    activeStepKeys: selectedStep ? new Set([selectedStep.stepKey]) : new Set(),
    activeVariantEntryKeys: selectedStep?.detailEntryKey ? new Set([selectedStep.detailEntryKey]) : new Set(),
    focusedStepIndex,
  };
}

describe("quest path flow helpers", () => {
  it("satisfies reveal metadata through branch keys, choice keys, or explicit branch paths", () => {
    const context: RevealContext = {
      branchKeys: new Set(["Branch_Search", "Branch_Deep"]),
      choiceKeys: new Set(["Choice_Search"]),
      branchPath: ["Branch_Search", "Branch_Deep"],
    };

    expect(
      revealMetadataSatisfied(
        {
          revealedByBranchKeys: ["Branch_Build"],
          revealedByChoiceKeys: ["Choice_Search"],
          revealedByBranchPathAlternatives: [["Branch_Build", "Branch_Deep"]],
        },
        context,
      ),
    ).toBe(true);

    expect(
      revealMetadataSatisfied(
        {
          revealedByBranchKeys: ["Branch_Build"],
          revealedByChoiceKeys: ["Choice_Build"],
          revealedByBranchPathAlternatives: [["Branch_Build", "Branch_Deep"]],
        },
        context,
      ),
    ).toBe(false);

    expect(
      revealMetadataSatisfied(
        {
          revealedByBranchKeys: [],
          revealedByChoiceKeys: [],
          revealedByBranchPathAlternatives: [["Branch_Search", "Branch_Deep"]],
        },
        context,
      ),
    ).toBe(true);
  });

  it("keeps unresolved normal-mode faction choices hidden from product choices", () => {
    const step = progressionStep(1, "Quest_Unresolved");
    const chapter = progressionChapter(1, "Opening", [step, progressionStep(2, "Quest_Next")]);
    const progression = detailProgression(chapter);
    const entry = questEntry({
      entryKey: "Quest_Unresolved",
      branches: [
        questBranch({
          branchKey: "Branch_Unresolved",
          label: "Unresolved road",
          sectionRole: "true_choice",
        }),
      ],
    });
    const entriesByKey = { [entry.entryKey]: entry };
    const rawChoices = choicesForStep(step, entry, entriesByKey);
    const diagnostics = visibilityDiagnosticsForChoices(
      rawChoices,
      rawChoices,
      entry,
      step,
      progression,
      entriesByKey,
    );

    expect(diagnostics.hiddenReasonsByChoiceId.get("branch:Branch_Unresolved")?.category).toBe(
      "unresolved",
    );
    expect(visibleChoicesForDiagnostics(rawChoices, diagnostics)).toHaveLength(0);
  });

  it("reveals the next local step only after its triggering branch is selected", () => {
    const firstStep = progressionStep(1, "Quest_First");
    const secondStep = progressionStep(2, "Quest_Second");
    const chapter = progressionChapter(1, "Opening", [firstStep, secondStep]);
    const progression = detailProgression(chapter);
    const firstEntry = questEntry({
      entryKey: "Quest_First",
      branches: [
        questBranch({
          branchKey: "Branch_Search",
          label: "Search",
          nextEntryKeys: ["Quest_Second"],
        }),
      ],
    });
    const secondEntry = questEntry({
      entryKey: "Quest_Second",
      title: "Projected Step",
    });
    const entriesByKey = {
      [firstEntry.entryKey]: firstEntry,
      [secondEntry.entryKey]: secondEntry,
    };
    const searchChoice = choicesForStep(firstStep, firstEntry, entriesByKey)[0];

    expect(
      buildQuestPathFlow(progression, entriesByKey, [], questlineProgression([chapter]), {
        focusedStepIndex: 0,
        showRawHiddenRows: false,
      }).renderedSteps,
    ).toHaveLength(1);

    const selectedFlow = buildQuestPathFlow(
      progression,
      entriesByKey,
      [selectionForChoice(firstStep.stepKey, searchChoice)],
      questlineProgression([chapter]),
      {
        focusedStepIndex: 0,
        showRawHiddenRows: false,
      },
    );

    expect(selectedFlow.renderedSteps.map((renderedStep) => renderedStep.displayEntry?.entryKey)).toEqual(
      ["Quest_First", "Quest_Second"],
    );
  });

  it("extends the lore stream after a selected chapter exit and stops at the next unresolved gate", () => {
    const firstStep = progressionStep(1, "Quest_Chapter1");
    const secondStep = {
      ...progressionStep(1, "Quest_Chapter2"),
      stepKey: "QuestLine_Test:chapter-2:step-1",
    };
    const thirdStep = {
      ...progressionStep(1, "Quest_Chapter3"),
      stepKey: "QuestLine_Test:chapter-3:step-1",
    };
    const chapter1 = progressionChapter(1, "Chapter 1", [firstStep]);
    const chapter2 = progressionChapter(2, "Chapter 2", [secondStep]);
    const chapter3 = progressionChapter(3, "Chapter 3", [thirdStep]);
    const fullProgression = questlineProgression([chapter1, chapter2, chapter3]);
    const entry1 = questEntry({
      entryKey: "Quest_Chapter1",
      branches: [
        questBranch({
          branchKey: "Branch_ToChapter2",
          label: "Continue",
          nextEntryKeys: ["Quest_Chapter2"],
        }),
      ],
    });
    const entry2 = questEntry({
      entryKey: "Quest_Chapter2",
      branches: [
        questBranch({
          branchKey: "Branch_ToChapter3",
          label: "Choose Chapter 3",
          nextEntryKeys: ["Quest_Chapter3"],
        }),
      ],
    });
    const entry3 = questEntry({ entryKey: "Quest_Chapter3" });
    const entriesByKey = {
      [entry1.entryKey]: entry1,
      [entry2.entryKey]: entry2,
      [entry3.entryKey]: entry3,
    };
    const selectedProgression = detailProgression(chapter1);
    const initialStream = buildLoreChronicleStream({
      selectedProgression,
      fullProgression,
      entriesByKey,
      loreChoicePathsByContext: {},
      showRawHiddenRows: false,
    });
    const firstChoice = choicesForStep(firstStep, entry1, entriesByKey)[0];

    expect(initialStream.segments).toHaveLength(1);
    expect(initialStream.selectedContextKey).toBeTruthy();

    const selectedStream = buildLoreChronicleStream({
      selectedProgression,
      fullProgression,
      entriesByKey,
      loreChoicePathsByContext: {
        [initialStream.selectedContextKey ?? "missing-context"]: [
          selectionForChoice(firstStep.stepKey, firstChoice),
        ],
      },
      showRawHiddenRows: false,
    });

    expect(selectedStream.segments.map((segment) => segment.railEntryKey)).toEqual([
      "Quest_Chapter1",
      "Quest_Chapter2",
    ]);
  });

  it("keeps same-step continuation chains actionable by branch order", () => {
    const step = progressionStep(1, "Quest_Tutorial");
    const chapter = progressionChapter(0, "Tutorial", [step]);
    const progression = detailProgression(chapter);
    const entry = questEntry({
      entryKey: "Quest_Tutorial",
      branches: [
        questBranch({
          branchKey: "Branch_FoundHome",
          label: "Found a home",
          sectionRole: "artifact",
          branchStepOrder: 1,
        }),
        questBranch({
          branchKey: "Branch_Rebuild",
          label: "Start rebuilding",
          sectionRole: "continuation",
          branchStepOrder: 2,
          parentBranchKey: "Branch_FoundHome",
          prerequisiteBranchKeys: ["Branch_FoundHome"],
        }),
        questBranch({
          branchKey: "Branch_Allies",
          label: "Find allies",
          sectionRole: "continuation",
          branchStepOrder: 3,
          parentBranchKey: "Branch_Rebuild",
          prerequisiteBranchKeys: ["Branch_FoundHome", "Branch_Rebuild"],
        }),
      ],
    });
    const entriesByKey = { [entry.entryKey]: entry };
    const choices = choicesForStep(step, entry, entriesByKey);
    const foundHome = choices.find((choice) => choice.branchKey === "Branch_FoundHome")!;
    const rebuild = choices.find((choice) => choice.branchKey === "Branch_Rebuild")!;
    const allies = choices.find((choice) => choice.branchKey === "Branch_Allies")!;

    const afterFirstChoice = buildQuestPathFlow(
      progression,
      entriesByKey,
      [selectionForChoice(step.stepKey, foundHome)],
      questlineProgression([chapter]),
      {
        focusedStepIndex: 0,
        showRawHiddenRows: false,
      },
    );

    expect(afterFirstChoice.renderedSteps).toHaveLength(1);
    expect(afterFirstChoice.renderedSteps[0].selectedChoice?.choiceId).toBe(foundHome.id);
    expect(afterFirstChoice.renderedSteps[0].choices.map((choice) => choice.label)).toContain("Start rebuilding");
    expect(afterFirstChoice.renderedSteps[0].revealedContinuations.map((choice) => choice.label)).not.toContain("Start rebuilding");

    const afterSecondChoice = buildQuestPathFlow(
      progression,
      entriesByKey,
      [
        selectionForChoice(step.stepKey, foundHome),
        selectionForChoice(step.stepKey, rebuild),
      ],
      questlineProgression([chapter]),
      {
        focusedStepIndex: 0,
        showRawHiddenRows: false,
      },
    );

    expect(afterSecondChoice.renderedSteps[0].selectedChoice?.choiceId).toBe(rebuild.id);
    expect(afterSecondChoice.renderedSteps[0].choices.map((choice) => choice.label)).toContain("Find allies");

    const afterTerminalChoice = buildQuestPathFlow(
      progression,
      entriesByKey,
      [
        selectionForChoice(step.stepKey, foundHome),
        selectionForChoice(step.stepKey, rebuild),
        selectionForChoice(step.stepKey, allies),
      ],
      questlineProgression([chapter]),
      {
        focusedStepIndex: 0,
        showRawHiddenRows: false,
      },
    );

    expect(afterTerminalChoice.unresolvedContinuation?.choiceId).toBe(allies.id);
  });

  it("passes artifact setup gates to the dependent decision step", () => {
    const firstStep = progressionStep(1, "Quest_SetupGate");
    const secondStep = progressionStep(2, "Quest_SetupGate");
    const chapter = progressionChapter(2, "Setup Gate", [firstStep, secondStep]);
    const progression = detailProgression(chapter);
    const entry = questEntry({
      entryKey: "Quest_SetupGate",
      branches: [
        questBranch({
          branchKey: "Branch_Setup",
          label: "Maintain the required empire value",
          sectionRole: "artifact",
          branchStepOrder: 1,
        }),
        ...["Pious", "Open", "Bold"].map((label, index) => questBranch({
          branchKey: `Branch_${label}`,
          label,
          sectionRole: "continuation",
          branchStepOrder: 2,
          parentBranchKey: "Branch_Setup",
          prerequisiteBranchKeys: ["Branch_Setup"],
          nextEntryKeys: [`Quest_${label}`],
          orderIndex: index + 2,
        })),
      ],
    });
    const entriesByKey = {
      [entry.entryKey]: entry,
      Quest_Pious: questEntry({ entryKey: "Quest_Pious" }),
      Quest_Open: questEntry({ entryKey: "Quest_Open" }),
      Quest_Bold: questEntry({ entryKey: "Quest_Bold" }),
    };

    const flow = buildQuestPathFlow(progression, entriesByKey, [], questlineProgression([chapter]), {
      focusedStepIndex: 0,
      showRawHiddenRows: false,
    });

    expect(flow.renderedSteps).toHaveLength(2);
    expect(flow.renderedSteps[0].choices.map((choice) => choice.label)).not.toContain("Maintain the required empire value");
    expect(flow.renderedSteps[1].currentBeatChoice?.label).toBe("Maintain the required empire value");
    expect(flow.renderedSteps[1].choices.map((choice) => choice.label)).toEqual(["Pious", "Open", "Bold"]);
  });

  it("propagates a chapter exit after a carried same-entry continuation", () => {
    const firstStep = progressionStep(1, "Quest_ChapterExit");
    const secondStep = progressionStep(2, "Quest_ChapterExit");
    const nextChapterStep = {
      ...progressionStep(1, "Quest_NextChapter"),
      stepKey: "QuestLine_Test:chapter-2:step-1",
    };
    const chapter1 = progressionChapter(1, "Chapter 1", [firstStep, secondStep]);
    const chapter2 = progressionChapter(2, "Chapter 2", [nextChapterStep]);
    const progression = detailProgression(chapter1);
    const fullProgression = questlineProgression([chapter1, chapter2]);
    const entry = questEntry({
      entryKey: "Quest_ChapterExit",
      branches: [
        questBranch({
          branchKey: "Branch_Track",
          label: "Track",
          sectionRole: "true_choice",
          branchStepOrder: 1,
        }),
        questBranch({
          branchKey: "Branch_Capture",
          label: "Capture the rogue Lieutenant",
          sectionRole: "continuation",
          branchStepOrder: 2,
          parentBranchKey: "Branch_Track",
          prerequisiteBranchKeys: ["Branch_Track"],
          nextEntryKeys: ["Quest_NextChapter"],
        }),
      ],
    });
    const nextEntry = questEntry({ entryKey: "Quest_NextChapter", title: "Next Chapter" });
    const entriesByKey = { [entry.entryKey]: entry, [nextEntry.entryKey]: nextEntry };
    const track = choicesForStep(firstStep, entry, entriesByKey)
      .find((choice) => choice.branchKey === "Branch_Track")!;

    const flow = buildQuestPathFlow(
      progression,
      entriesByKey,
      [selectionForChoice(firstStep.stepKey, track)],
      fullProgression,
      {
        focusedStepIndex: 0,
        showRawHiddenRows: false,
      },
    );

    expect(flow.reachedContinuationEntryKey).toBe("Quest_NextChapter");
    expect(flow.unresolvedContinuation).toBeNull();
  });
});
