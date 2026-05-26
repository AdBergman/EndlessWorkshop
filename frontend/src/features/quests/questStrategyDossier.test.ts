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
    semanticStageKind: overrides.semanticStageKind ?? "explicit_decision_option",
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

function modelForRenderedStep(
  step: RenderedPathStep,
  overrides: Partial<Parameters<typeof buildStrategyDossierModel>[0]> = {},
) {
  return buildStrategyDossierModel({
    renderedStep: step,
    totalSteps: 1,
    title: "Semantic Brief",
    displayEntry: step.displayEntry,
    objectiveScope: null,
    revealedObjectiveScope: null,
    flow: questPathFlow(step),
    entriesByKey: {},
    usesObjectivePaths: false,
    ...overrides,
  });
}

describe("strategy dossier helpers", () => {
  it("distinguishes selected semantic sequence terminal states from explicit metadata", () => {
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
    const semanticUnresolvedChoice = questChoice({
      id: "branch:SemanticUnknown",
      branchKey: "Branch_SemanticUnknown",
      label: "Follow the uncharted report",
      sectionRole: "unresolved",
      semanticStageKind: "unresolved",
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
      label: "Rejoins progression",
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
      label: "Unknown continuation",
    }));

    expect(
      buildStrategyPathStatus(
        questPathFlow(renderedStep({
          choices: [semanticUnresolvedChoice],
          selectedChoice: semanticUnresolvedChoice,
        })),
        entriesByKey,
      ),
    ).toEqual(expect.objectContaining({
      kind: "unresolved",
      label: "Unknown continuation",
      choiceLabel: "Follow the uncharted report",
    }));

    expect(
      buildStrategyPathStatus(
        questPathFlow(renderedStep({ choices: [unresolvedChoice], selectedChoice: unresolvedChoice })),
        entriesByKey,
      ),
    ).toEqual(expect.objectContaining({
      kind: "complete",
      label: "No further modeled decision",
    }));
  });

  it("builds selected sequence breadcrumbs and explicit decision comparison details", () => {
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
    expect(model.decisionGroup.groups[0]?.options).toHaveLength(2);
    expect(model.currentTask).toBeNull();
    expect(model.branchComparison.selectedOption).toEqual(
      expect.objectContaining({
        label: "Search",
        requirements: ["Scout the ruins"],
        rewards: ["Gain Dust"],
      }),
    );
    expect(model.decision).toEqual(expect.objectContaining({
      title: "Decision Options",
      description: "Review the selected decision option or choose another option to compare its result.",
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
        title: "Selected sequence leaves this chapter",
        markers: expect.arrayContaining([
          expect.objectContaining({ kind: "leads", label: "Leads To" }),
        ]),
      }),
    ]));
    expect(model.continuityStrip.summary).toBe("The selected sequence leaves this chapter.");
  });

  it("keeps deterministic continuations out of decision comparison semantics", () => {
    const continuation = questChoice({
      id: "branch:Continue",
      branchKey: "Branch_Continue",
      label: "Secure the relay",
      sectionRole: "continuation",
      semanticStageKind: "deterministic_continuation",
      parentBranchKey: "Branch_Root",
      prerequisiteBranchKeys: ["Branch_Root"],
      choiceGroupKey: "ChoiceGroup_Continuation",
      branchStepOrder: 2,
      strategyLines: ["Complete the relay task."],
      nextEntryKeys: ["Quest_Next"],
    });
    const step = renderedStep({ choices: [continuation] });
    const model = modelForRenderedStep(step, {
      entriesByKey: {
        Quest_Next: questEntry("Quest_Next", "Next Task"),
      },
      comparisonChoices: [continuation],
    });

    expect(model.currentTask).toEqual(expect.objectContaining({
      id: "branch:Continue",
      label: "Secure the relay",
    }));
    expect(model.continuation).toEqual(expect.objectContaining({
      id: "branch:Continue",
    }));
    expect(model.decisionGroup.groups).toHaveLength(0);
    expect(model.branchComparison.groups).toHaveLength(0);
    expect(model.decision).toEqual(expect.objectContaining({
      title: "No active decision",
    }));
    expect(model.continuityStrip.items).not.toEqual(expect.arrayContaining([
      expect.objectContaining({ kind: "decision" }),
    ]));
  });

  it("keeps topology forks distinct from explicit decision groups", () => {
    const leftFork = questChoice({
      id: "branch:TopologyLeft",
      branchKey: "Branch_TopologyLeft",
      label: "Left topology route",
      sectionRole: null,
      semanticStageKind: "topology_fork_option",
      choiceGroupKey: "ChoiceGroup_Topology",
      nextEntryKeys: ["Quest_Left"],
    });
    const rightFork = questChoice({
      id: "branch:TopologyRight",
      branchKey: "Branch_TopologyRight",
      label: "Right topology route",
      sectionRole: null,
      semanticStageKind: "topology_fork_option",
      choiceGroupKey: "ChoiceGroup_Topology",
      nextEntryKeys: ["Quest_Right"],
    });
    const step = renderedStep({ choices: [leftFork, rightFork] });
    const model = modelForRenderedStep(step, {
      comparisonChoices: [leftFork, rightFork],
    });

    expect(model.topologyAlternatives.map((option) => option.label)).toEqual([
      "Left topology route",
      "Right topology route",
    ]);
    expect(model.decisionGroup.groups).toHaveLength(0);
    expect(model.branchComparison.groups).toHaveLength(0);
    expect(model.currentTask).toBeNull();
  });

  it("preserves comparison fallback for legacy grouped rows without section roles", () => {
    const risk = {
      ...questChoice({
        id: "branch:LegacyRisk",
        branchKey: "Branch_LegacyRisk",
        label: "Risk the breach",
        semanticStageKind: "failure",
        choiceGroupKey: "ChoiceGroup_Legacy",
        failureEntryKeys: ["Quest_Failure"],
      }),
      sectionRole: null,
    };
    const rejoin = {
      ...questChoice({
        id: "branch:LegacyRejoin",
        branchKey: "Branch_LegacyRejoin",
        label: "Rejoin the line",
        semanticStageKind: "convergence",
        choiceGroupKey: "ChoiceGroup_Legacy",
        convergenceGroupKey: "Convergence_Legacy",
      }),
      sectionRole: null,
    };
    const step = renderedStep({ choices: [risk, rejoin] });
    const model = modelForRenderedStep(step, {
      comparisonChoices: [risk, rejoin],
    });

    expect(model.decisionGroup.groups[0]?.options.map((option) => option.label)).toEqual([
      "Risk the breach",
      "Rejoin the line",
    ]);
    expect(model.currentTask).toBeNull();
    expect(model.topologyAlternatives).toHaveLength(0);
  });

  it("carries convergence, terminal, and failure stage semantics without promoting single rows to decisions", () => {
    const convergence = questChoice({
      id: "branch:Converge",
      branchKey: "Branch_Converge",
      label: "Rejoin command",
      sectionRole: "convergence",
      semanticStageKind: "convergence",
      convergenceGroupKey: "Convergence_Command",
    });
    const terminal = questChoice({
      id: "branch:Terminal",
      branchKey: "Branch_Terminal",
      label: "Hold position",
      sectionRole: "terminal",
      semanticStageKind: "terminal",
    });
    const failure = questChoice({
      id: "branch:Failure",
      branchKey: "Branch_Failure",
      label: "Risk collapse",
      sectionRole: "terminal",
      semanticStageKind: "failure",
      failureEntryKeys: ["Quest_Failure"],
    });

    const convergenceStep = renderedStep({ choices: [convergence], selectedChoice: convergence });
    const convergenceModel = modelForRenderedStep(convergenceStep, {
      flow: questPathFlow(convergenceStep),
    });
    expect(convergenceModel.continuationStatus).toEqual(expect.objectContaining({
      kind: "converges",
    }));
    expect(convergenceModel.currentTask?.choice.semanticStageKind).toBe("convergence");
    expect(convergenceModel.decisionGroup.groups).toHaveLength(0);

    const terminalStep = renderedStep({ choices: [terminal], selectedChoice: terminal });
    const terminalModel = modelForRenderedStep(terminalStep, {
      flow: questPathFlow(terminalStep),
    });
    expect(terminalModel.continuationStatus).toEqual(expect.objectContaining({
      kind: "complete",
    }));
    expect(terminalModel.currentTask?.choice.semanticStageKind).toBe("terminal");
    expect(terminalModel.decisionGroup.groups).toHaveLength(0);

    const failureStep = renderedStep({ choices: [failure], selectedChoice: failure });
    const failureModel = modelForRenderedStep(failureStep, {
      flow: questPathFlow(failureStep),
      entriesByKey: {
        Quest_Failure: questEntry("Quest_Failure", "Failure Outcome"),
      },
    });
    expect(failureModel.continuationStatus).toEqual(expect.objectContaining({
      kind: "failure",
    }));
    expect(failureModel.currentTask?.choice.semanticStageKind).toBe("failure");
    expect(failureModel.decisionGroup.groups).toHaveLength(0);
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
        title: "Selected sequence enters a failure outcome",
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
