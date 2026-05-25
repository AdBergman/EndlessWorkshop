import { describe, expect, it } from "vitest";

import type {
  QuestExplorerEntry,
  QuestProgressionStep,
  Requirement,
  Reward,
  StrategyObjective,
} from "@/types/questTypes";
import {
  selectionForChoice,
  type ChoiceVisibilityDiagnostics,
  type QuestPathChoice,
  type QuestPathFlow,
  type RenderedPathStep,
} from "./questPathFlow";
import {
  buildStrategyDossierModel,
  buildStrategyPathStatus,
  type StrategyDossierObjectiveScope,
} from "./questStrategyDossier";

function requirement(displayText: string): Requirement {
  return {
    requirementKey: `Requirement_${displayText}`,
    kind: "Requirement",
    displayText,
    polarity: null,
    groupLabel: null,
    groupOrder: null,
    targetRole: null,
    targetLabel: null,
    requiredCount: null,
    durationTurns: null,
    state: null,
    referenceKind: null,
    referenceKey: null,
    referenceDisplayName: null,
    codexEntryKey: null,
  };
}

function reward(displayText: string): Reward {
  return {
    rewardKey: `Reward_${displayText}`,
    kind: "Reward",
    displayText,
    amount: null,
    groupLabel: null,
    groupOrder: null,
    formulaText: null,
    assetKind: null,
    assetKey: null,
    assetDisplayName: null,
    referenceKind: null,
    referenceKey: null,
    referenceDisplayName: null,
    codexEntryKey: null,
    targetScopeLabel: null,
  };
}

function objective(text: string): StrategyObjective {
  return {
    objectiveKey: `Objective_${text}`,
    text,
    phase: "start",
    requirements: [requirement("Hold the district")],
    rewards: [reward("Gain influence")],
  };
}

function questEntry(entryKey: string, title = entryKey): QuestExplorerEntry {
  return {
    entryKey,
    title,
    summaryLines: [`${title} summary`],
    questType: "Faction Quest",
    isMandatory: null,
    isKeyNarrativeBeat: null,
    aliases: [],
    navigation: {
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
    loreView: { sections: [] },
    strategyView: { objectives: [] },
    branches: [],
    quality: null,
  };
}

function progressionStep(stepNumber: number): QuestProgressionStep {
  return {
    stepKey: `QuestLine_Test:chapter-1:step-${stepNumber}`,
    stepNumber,
    stepOrder: stepNumber,
    title: `Step ${stepNumber}`,
    projectionKind: "real_entry_backed",
    detailEntryKey: `Quest_Step_${stepNumber}`,
    sourceEntryKeys: [`Quest_Step_${stepNumber}`],
    aliasEntryKeys: [],
    variants: [],
  };
}

function questChoice(overrides: Partial<QuestPathChoice> & Pick<QuestPathChoice, "id">): QuestPathChoice {
  return {
    id: overrides.id,
    branchKey: overrides.branchKey ?? null,
    choiceKey: overrides.choiceKey ?? null,
    label: overrides.label ?? overrides.id,
    eyebrow: overrides.eyebrow ?? "Decision Options",
    groupKey: overrides.groupKey ?? "Group_Test",
    groupLabel: overrides.groupLabel ?? "Decision Options",
    sourceEntryKey: overrides.sourceEntryKey ?? null,
    sectionRole: overrides.sectionRole ?? "true_choice",
    prerequisiteBranchKeys: overrides.prerequisiteBranchKeys ?? [],
    revealedByBranchKeys: overrides.revealedByBranchKeys ?? [],
    revealedByChoiceKeys: overrides.revealedByChoiceKeys ?? [],
    revealedByBranchPathAlternatives: overrides.revealedByBranchPathAlternatives ?? [],
    parentBranchKey: overrides.parentBranchKey ?? null,
    parentChoiceKey: overrides.parentChoiceKey ?? null,
    choiceGroupKey: overrides.choiceGroupKey ?? "ChoiceGroup_Test",
    convergenceGroupKey: overrides.convergenceGroupKey ?? null,
    branchStepOrder: overrides.branchStepOrder ?? null,
    hasDependentContinuations: overrides.hasDependentContinuations ?? false,
    descriptionLines: overrides.descriptionLines ?? [],
    strategyLines: overrides.strategyLines ?? [],
    loreLines: overrides.loreLines ?? [],
    requirementLines: overrides.requirementLines ?? [],
    rewardLines: overrides.rewardLines ?? [],
    targetEntryKey: overrides.targetEntryKey ?? null,
    targetSummaryLine: overrides.targetSummaryLine ?? null,
    continuationTitle: overrides.continuationTitle ?? null,
    nextEntryKeys: overrides.nextEntryKeys ?? [],
    failureEntryKeys: overrides.failureEntryKeys ?? [],
    convergesIntoEntryKeys: overrides.convergesIntoEntryKeys ?? [],
    accent: overrides.accent ?? "gold",
  };
}

function emptyChoiceDiagnostics(choiceCount: number): ChoiceVisibilityDiagnostics {
  return {
    normalVisibleChoiceCount: choiceCount,
    debugVisibleChoiceCount: choiceCount,
    hiddenArtifactCount: 0,
    hiddenUnresolvedCount: 0,
    hiddenContinuationCount: 0,
    hiddenReasonsByChoiceId: new Map(),
  };
}

function renderedStep({
  step = progressionStep(1),
  displayEntry = questEntry("Quest_Step_1", "Current Step"),
  choices,
  selectedChoice,
  revealedContinuations = [],
  isActive = true,
}: {
  step?: QuestProgressionStep;
  displayEntry?: QuestExplorerEntry;
  choices: QuestPathChoice[];
  selectedChoice?: QuestPathChoice | null;
  revealedContinuations?: QuestPathChoice[];
  isActive?: boolean;
}): RenderedPathStep {
  return {
    step,
    stepIndex: 0,
    displayEntry,
    choices,
    revealedContinuations,
    currentBeatChoice: null,
    selectedChoice: selectedChoice ? selectionForChoice(step.stepKey, selectedChoice) : null,
    choiceDiagnostics: emptyChoiceDiagnostics(choices.length),
    isActive,
    repeatsDetailEntry: false,
    rendersRepeatedDetailContent: true,
    revealedContinuationsBecomeSteps: false,
    revealContext: {
      branchKeys: new Set(),
      choiceKeys: new Set(),
      branchPath: [],
    },
  };
}

function questPathFlow(
  step: RenderedPathStep,
  overrides: Partial<QuestPathFlow> = {},
): QuestPathFlow {
  return {
    renderedSteps: [step],
    unresolvedContinuation: overrides.unresolvedContinuation ?? null,
    reachedContinuationEntryKey: overrides.reachedContinuationEntryKey ?? null,
  };
}

describe("strategy dossier helpers", () => {
  it("distinguishes selected path terminal states from explicit metadata", () => {
    const failureChoice = questChoice({
      id: "branch:Failure",
      branchKey: "Branch_Failure",
      label: "Risk the breach",
      failureEntryKeys: ["Quest_Failure"],
    });
    const convergenceChoice = questChoice({
      id: "branch:Converge",
      branchKey: "Branch_Converge",
      label: "Rejoin command",
      convergesIntoEntryKeys: ["Quest_Main"],
    });
    const chapterExitChoice = questChoice({
      id: "branch:Exit",
      branchKey: "Branch_Exit",
      label: "March onward",
      nextEntryKeys: ["Quest_Next"],
    });
    const unresolvedChoice = questChoice({
      id: "branch:Unknown",
      branchKey: "Branch_Unknown",
      label: "Follow the rumor",
    });
    const entriesByKey = {
      Quest_Failure: questEntry("Quest_Failure", "Failure Outcome"),
      Quest_Main: questEntry("Quest_Main", "Main Progression"),
      Quest_Next: questEntry("Quest_Next", "Next Chapter"),
    };

    expect(
      buildStrategyPathStatus(
        questPathFlow(renderedStep({ choices: [failureChoice], selectedChoice: failureChoice })),
        entriesByKey,
      ),
    ).toEqual(expect.objectContaining({
      kind: "failure",
      label: "Failure",
    }));

    expect(
      buildStrategyPathStatus(
        questPathFlow(renderedStep({ choices: [convergenceChoice], selectedChoice: convergenceChoice })),
        entriesByKey,
      ),
    ).toEqual(expect.objectContaining({
      kind: "converges",
      label: "Rejoins Path",
    }));

    expect(
      buildStrategyPathStatus(
        questPathFlow(renderedStep({ choices: [chapterExitChoice], selectedChoice: chapterExitChoice }), {
          reachedContinuationEntryKey: "Quest_Next",
        }),
        entriesByKey,
      ),
    ).toEqual(expect.objectContaining({
      kind: "chapter-exit",
      label: "Leaves Chapter",
    }));

    const unresolvedStep = renderedStep({ choices: [unresolvedChoice], selectedChoice: unresolvedChoice });
    expect(
      buildStrategyPathStatus(
        questPathFlow(unresolvedStep, {
          unresolvedContinuation: selectionForChoice(unresolvedStep.step.stepKey, unresolvedChoice),
        }),
        entriesByKey,
      ),
    ).toEqual(expect.objectContaining({
      kind: "unresolved",
      label: "Unknown Next Step",
    }));

    expect(
      buildStrategyPathStatus(
        questPathFlow(renderedStep({ choices: [unresolvedChoice], selectedChoice: unresolvedChoice })),
        entriesByKey,
      ),
    ).toEqual(expect.objectContaining({
      kind: "complete",
      label: "No Further Modeled Decision",
    }));
  });

  it("builds selected path breadcrumbs and selected branch comparison details", () => {
    const selectedChoice = questChoice({
      id: "branch:Search",
      branchKey: "Branch_Search",
      label: "Search",
      strategyLines: ["Secure the ruins."],
      requirementLines: ["Scout the ruins"],
      rewardLines: ["Gain Dust"],
      nextEntryKeys: ["Quest_Next"],
    });
    const alternateChoice = questChoice({
      id: "branch:Build",
      branchKey: "Branch_Build",
      label: "Build",
      strategyLines: ["Fortify the settlement."],
      requirementLines: ["Build a district"],
      rewardLines: ["Gain Industry"],
    });
    const displayEntry = questEntry("Quest_Current", "Current Objective");
    const activeStep = renderedStep({
      displayEntry,
      choices: [selectedChoice, alternateChoice],
      selectedChoice,
    });
    const flow = questPathFlow(activeStep, { reachedContinuationEntryKey: "Quest_Next" });
    const objectiveScope: StrategyDossierObjectiveScope = {
      objectiveIndexOffset: 0,
      objectives: [objective("Stabilize the region")],
    };
    const model = buildStrategyDossierModel({
      renderedStep: activeStep,
      totalSteps: 3,
      title: "Chapter Tactical Brief",
      displayEntry,
      objectiveScope,
      revealedObjectiveScope: null,
      flow,
      entriesByKey: { Quest_Next: questEntry("Quest_Next", "Next Chapter") },
      usesObjectivePaths: false,
      comparisonChoices: [selectedChoice, alternateChoice],
    });

    expect(model.requirements).toContain("Hold the district");
    expect(model.rewards).toContain("Gain influence");
    expect(model.selectedPathSteps).toEqual([
      expect.objectContaining({
        label: "Search",
        stepLabel: "Step 1",
        isCurrent: true,
      }),
    ]);
    expect(model.branchComparison.groups[0]?.options).toHaveLength(2);
    expect(model.branchComparison.selectedOption).toEqual(
      expect.objectContaining({
        label: "Search",
        requirements: ["Scout the ruins"],
        rewards: ["Gain Dust"],
      }),
    );
    expect(model.decision).toEqual(expect.objectContaining({
      title: "Decision Options",
      description: "Review the selected simulation or choose another path to compare its result.",
    }));
    expect(model.pathStatus).toEqual(expect.objectContaining({
      kind: "chapter-exit",
      label: "Leaves Chapter",
    }));
    expect(model.markers).toEqual([
      expect.objectContaining({
        kind: "leads",
        label: "Leads To",
      }),
    ]);
    expect(model.continuityStrip.items).toEqual(expect.arrayContaining([
      expect.objectContaining({
        kind: "step",
        eyebrow: "Step 1",
        title: "Current Objective",
      }),
      expect.objectContaining({
        kind: "decision",
        title: "Search",
        isSelectedPath: true,
      }),
      expect.objectContaining({
        kind: "transition",
        title: "Selected path leaves this chapter",
        markers: expect.arrayContaining([
          expect.objectContaining({ kind: "leads", label: "Leads To" }),
        ]),
      }),
    ]));
    expect(model.continuityStrip.summary).toBe("The selected path leaves this chapter.");
  });

  it("builds compact continuity strip markers for terminal branch outcomes", () => {
    const failureChoice = questChoice({
      id: "branch:Failure",
      branchKey: "Branch_Failure",
      label: "Risk the breach",
      failureEntryKeys: ["Quest_Failure"],
    });
    const unresolvedChoice = questChoice({
      id: "branch:Unknown",
      branchKey: "Branch_Unknown",
      label: "Follow the rumor",
    });
    const entriesByKey = {
      Quest_Failure: questEntry("Quest_Failure", "Failure Outcome"),
    };

    const failureModel = buildStrategyDossierModel({
      renderedStep: renderedStep({ choices: [failureChoice], selectedChoice: failureChoice }),
      totalSteps: 1,
      title: "Failure Brief",
      displayEntry: questEntry("Quest_Current", "Current Objective"),
      objectiveScope: null,
      revealedObjectiveScope: null,
      flow: questPathFlow(renderedStep({ choices: [failureChoice], selectedChoice: failureChoice })),
      entriesByKey,
      usesObjectivePaths: false,
    });

    expect(failureModel.continuityStrip.items).toEqual(expect.arrayContaining([
      expect.objectContaining({
        kind: "stop",
        title: "Selected path enters a failure outcome",
        markers: expect.arrayContaining([
          expect.objectContaining({ kind: "failure", detail: "Chapter 1: Failure Outcome" }),
        ]),
      }),
    ]));

    const unresolvedStep = renderedStep({ choices: [unresolvedChoice], selectedChoice: unresolvedChoice });
    const unresolvedModel = buildStrategyDossierModel({
      renderedStep: unresolvedStep,
      totalSteps: 1,
      title: "Unresolved Brief",
      displayEntry: questEntry("Quest_Current", "Current Objective"),
      objectiveScope: null,
      revealedObjectiveScope: null,
      flow: questPathFlow(unresolvedStep, {
        unresolvedContinuation: selectionForChoice(unresolvedStep.step.stepKey, unresolvedChoice),
      }),
      entriesByKey,
      usesObjectivePaths: false,
    });

    expect(unresolvedModel.continuityStrip.items).toEqual(expect.arrayContaining([
      expect.objectContaining({
        kind: "stop",
        title: "Continuation is not identified",
        markers: expect.arrayContaining([
          expect.objectContaining({ kind: "unresolved" }),
        ]),
      }),
    ]));
  });
});
