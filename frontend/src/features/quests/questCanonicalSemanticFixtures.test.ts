import { describe, expect, it } from "vitest";

import { buildQuestRailGroups } from "@/features/quests/questRail";
import { createQuestExplorerFrontendDiagnostic } from "@/features/quests/questExplorerDiagnostic";
import { buildLoreFlowModel } from "@/features/quests/questLoreFlow";
import {
  choicesForStep,
  selectionForChoice,
  type QuestDetailProgression,
  type QuestPathChoiceSelection,
} from "@/features/quests/questPathFlow";
import { buildStrategyFlowModel } from "@/features/quests/questStrategyFlow";
import {
  canonicalSemanticEntries,
  canonicalSemanticEntriesByKey,
  canonicalSemanticKeys,
  canonicalSemanticProgression,
  canonicalSemanticQuestExplorer,
} from "@/features/quests/testUtils/questCanonicalSemanticFixtures";
import type {
  QuestExplorerEntry,
  QuestProgressionChapter,
  QuestProgressionQuestline,
  QuestProgressionStep,
} from "@/types/questTypes";

type StrategyModelWithActiveStage = NonNullable<ReturnType<typeof buildStrategyFlowModel>> & {
  activeStage: NonNullable<NonNullable<ReturnType<typeof buildStrategyFlowModel>>["activeStage"]>;
};

type ProgressionMatch = {
  questline: QuestProgressionQuestline;
  chapter: QuestProgressionChapter;
  step: QuestProgressionStep;
  stepIndex: number;
};

function progressionMatchForEntry(entryKey: string): ProgressionMatch {
  for (const questline of canonicalSemanticProgression.questlines) {
    for (const chapter of questline.chapters) {
      const stepIndex = chapter.steps.findIndex((step) => (
        step.detailEntryKey === entryKey
        || step.sourceEntryKeys.includes(entryKey)
        || step.aliasEntryKeys.includes(entryKey)
        || step.variants.some((variant) => variant.entryKey === entryKey)
      ));

      if (stepIndex >= 0) {
        return {
          questline,
          chapter,
          step: chapter.steps[stepIndex],
          stepIndex,
        };
      }
    }
  }

  throw new Error(`No canonical progression step found for ${entryKey}.`);
}

function detailProgressionForEntry(entryKey: string): QuestDetailProgression {
  const match = progressionMatchForEntry(entryKey);

  return {
    questline: match.questline,
    chapter: match.chapter,
    activeStepKeys: new Set([match.step.stepKey]),
    activeVariantEntryKeys: new Set(match.step.detailEntryKey === entryKey ? [] : [entryKey]),
    focusedStepIndex: match.stepIndex,
  };
}

function entry(entryKey: string): QuestExplorerEntry {
  const found = canonicalSemanticEntriesByKey[entryKey];
  if (!found) throw new Error(`Missing canonical fixture entry ${entryKey}.`);
  return found;
}

function rawSemanticKinds(entryKey: string): string[] {
  const match = progressionMatchForEntry(entryKey);
  const detailEntry = entry(match.step.detailEntryKey);
  return choicesForStep(match.step, detailEntry, canonicalSemanticEntriesByKey)
    .map((choice) => choice.semanticStageKind);
}

function strategyModelForEntry(
  entryKey: string,
  choicePath: QuestPathChoiceSelection[] = [],
  showRawHiddenRows = false,
): StrategyModelWithActiveStage {
  const model = buildStrategyFlowModel({
    progression: detailProgressionForEntry(entryKey),
    fullProgression: canonicalSemanticProgression,
    entriesByKey: canonicalSemanticEntriesByKey,
    choicePath,
    showRawHiddenRows,
  });

  if (!model?.activeStage) throw new Error(`Expected Strategy active stage for ${entryKey}.`);
  return model as StrategyModelWithActiveStage;
}

function loreStagesForEntry(entryKey: string, showRawHiddenRows = false) {
  const model = buildLoreFlowModel({
    selectedProgression: detailProgressionForEntry(entryKey),
    fullProgression: canonicalSemanticProgression,
    entriesByKey: canonicalSemanticEntriesByKey,
    loreChoicePathsByContext: {},
    showRawHiddenRows,
  });

  return model.segments.flatMap((segment) => segment.loreSteps);
}

describe("canonical Quest Explorer semantic fixtures", () => {
  it("classifies compact major-faction topology shapes with canonical stage kinds", () => {
    expect(rawSemanticKinds(canonicalSemanticKeys.kinLinear)).toEqual([
      "setup_task",
      "deterministic_continuation",
    ]);
    expect(rawSemanticKinds(canonicalSemanticKeys.aspectDecision)).toEqual([
      "explicit_decision_option",
      "explicit_decision_option",
    ]);
    expect(rawSemanticKinds(canonicalSemanticKeys.mukagGroupedContinuation)).toEqual([
      "setup_task",
      "deterministic_continuation",
      "deterministic_continuation",
    ]);
    expect(rawSemanticKinds(canonicalSemanticKeys.mukagTopology)).toEqual([
      "topology_fork_option",
      "topology_fork_option",
    ]);
    expect(rawSemanticKinds(canonicalSemanticKeys.lastLordConvergence)).toEqual(["convergence"]);
    expect(rawSemanticKinds(canonicalSemanticKeys.necroUnresolved)).toEqual(["unresolved"]);
    expect(rawSemanticKinds(canonicalSemanticKeys.necroFailure)).toEqual(["failure"]);
    expect(rawSemanticKinds(canonicalSemanticKeys.aspectTerminal)).toEqual(["terminal"]);
    expect(rawSemanticKinds(canonicalSemanticKeys.aliasOwner)).toEqual([
      "internal_variant",
      "internal_variant",
    ]);
  });

  it("models Kin-style linear setup plus one-option continuation as progression, not a player decision", () => {
    const strategy = strategyModelForEntry(canonicalSemanticKeys.kinLinear, [], true);

    expect(strategy.activeStage.kind).toBe("continuation");
    expect(strategy.activeStage.currentTask?.label).toBe("Start the task of rebuilding your Empire");
    expect(strategy.activeStage.continuation?.label).toBe("Start the task of rebuilding your Empire");
    expect(strategy.activeStage.decisionGroup.groups).toHaveLength(0);

    const loreStage = loreStagesForEntry(canonicalSemanticKeys.kinLinear)
      .find((stage) => stage.revealedContinuationStages.length);
    expect(loreStage?.kind).toBe("current_task");
    expect(loreStage?.branchMoment).toBeNull();
    expect(loreStage?.revealedContinuationStages[0]).toEqual(expect.objectContaining({
      stageLabel: "Continuation",
      choice: expect.objectContaining({
        label: "Start the task of rebuilding your Empire",
        semanticStageKind: "deterministic_continuation",
      }),
    }));

    const passiveStrategy = strategyModelForEntry(canonicalSemanticKeys.kinLinear);
    expect(passiveStrategy.activeStage.decisionGroup.groups).toHaveLength(0);
    expect(passiveStrategy.flow.reachedContinuationEntryKey).toBe(canonicalSemanticKeys.kinNextChapter);
    expect(passiveStrategy.flow.renderedSteps.flatMap((step) => (
      step.revealedContinuations.map((choice) => choice.semanticStageKind)
    ))).toEqual(["deterministic_continuation"]);
  });

  it("keeps live-style grouped continuation rows deterministic rather than topology forks", () => {
    const strategy = strategyModelForEntry(canonicalSemanticKeys.mukagGroupedContinuation, [], true);

    expect(strategy.activeStage.kind).toBe("continuation");
    expect(strategy.activeStage.decisionGroup.groups).toHaveLength(0);
    expect(strategy.activeStage.topologyAlternatives).toHaveLength(0);
    expect(strategy.renderedStep?.choices
      .filter((choice) => choice.semanticStageKind === "deterministic_continuation")
      .map((choice) => choice.label)).toEqual([
      "Pious continuation",
      "Bold continuation",
    ]);

    const loreStage = loreStagesForEntry(canonicalSemanticKeys.mukagGroupedContinuation, true)[0];
    expect(loreStage?.kind).toBe("continuation");
    expect(loreStage?.branchMoment).toEqual(expect.objectContaining({
      title: "Continue the chronicle",
      decisionChoices: [],
      branchingContinuationChoices: [],
    }));
    expect(loreStage?.branchMoment?.continuationChoices
      .map((item) => item.choice.semanticStageKind)
      .filter((kind) => kind === "deterministic_continuation")).toEqual([
      "deterministic_continuation",
      "deterministic_continuation",
    ]);
  });

  it("models Aspect-style true-choice groups as explicit Strategy and Lore decisions", () => {
    const strategy = strategyModelForEntry(canonicalSemanticKeys.aspectDecision);

    expect(strategy.activeStage.kind).toBe("decision");
    expect(strategy.activeStage.decisionGroup.groups[0]?.options.map((option) => option.label)).toEqual([
      "Bond with the Aspect",
      "Refuse the Aspect",
    ]);
    expect(strategy.activeStage.topologyAlternatives).toHaveLength(0);

    const selectedOption = strategy.activeStage.decisionGroup.groups[0]?.options[0];
    if (!selectedOption) throw new Error("Expected explicit decision option.");

    const selected = strategyModelForEntry(canonicalSemanticKeys.aspectDecision, [
      selectionForChoice(strategy.activeStage.step.stepKey, selectedOption.choice),
    ]);
    expect(selected.activeStage.decisionGroup.selectedOption?.label).toBe("Bond with the Aspect");
    expect(selected.activeStage.outcomePreview?.title).toBe("Bond with the Aspect");

    const loreStage = loreStagesForEntry(canonicalSemanticKeys.aspectDecision)[0];
    expect(loreStage?.kind).toBe("decision");
    expect(loreStage?.branchMoment?.title).toBe("Choose a path");
    expect(loreStage?.branchMoment?.decisionChoices).toHaveLength(2);
  });

  it("keeps Mukag-style topology forks distinct from explicit decisions", () => {
    const strategy = strategyModelForEntry(canonicalSemanticKeys.mukagTopology);

    expect(strategy.activeStage.kind).toBe("topology_alternative");
    expect(strategy.activeStage.decisionGroup.groups).toHaveLength(0);
    expect(strategy.activeStage.topologyAlternatives.map((option) => option.label)).toEqual([
      "Pious continuation",
      "Bold continuation",
    ]);

    const loreStage = loreStagesForEntry(canonicalSemanticKeys.mukagTopology)[0];
    expect(loreStage?.kind).toBe("branching_continuation");
    expect(loreStage?.branchMoment).toEqual(expect.objectContaining({
      title: "Possible continuations",
      decisionChoices: [],
    }));
  });

  it("keeps convergence, unresolved, failure, and terminal outcomes semantically distinct", () => {
    expect(strategyModelForEntry(canonicalSemanticKeys.lastLordConvergence, [], true).activeStage.kind).toBe("convergence");
    expect(strategyModelForEntry(canonicalSemanticKeys.necroUnresolved, [], true).activeStage.kind).toBe("unresolved");
    expect(strategyModelForEntry(canonicalSemanticKeys.necroFailure, [], true).activeStage.kind).toBe("failure");
    expect(strategyModelForEntry(canonicalSemanticKeys.aspectTerminal, [], true).activeStage.kind).toBe("terminal");

    const unresolvedLoreStage = loreStagesForEntry(canonicalSemanticKeys.necroUnresolved, true)[0];
    expect(unresolvedLoreStage?.kind).toBe("unresolved");
    expect(unresolvedLoreStage?.branchMoment?.continuationChoices[0]?.stageLabel).toBe("Unresolved continuation");

    const terminalLoreStage = loreStagesForEntry(canonicalSemanticKeys.aspectTerminal, true)[0];
    expect(terminalLoreStage?.kind).toBe("terminal");
    expect(terminalLoreStage?.branchMoment?.continuationChoices[0]?.stageLabel).toBe("Ending");
  });

  it("keeps alias-owned stages and internal variants in owning chapter semantics", () => {
    const railEntryKeys = buildQuestRailGroups(
      Object.values(canonicalSemanticEntries),
      canonicalSemanticProgression
    ).flatMap((group) => group.items.map((item) => item.entry.entryKey));

    expect(railEntryKeys).toContain(canonicalSemanticKeys.aliasOwner);
    expect(railEntryKeys).not.toContain(canonicalSemanticKeys.aliasVariantA);
    expect(railEntryKeys).not.toContain(canonicalSemanticKeys.aliasVariantB);

    const ownerLoreStage = loreStagesForEntry(canonicalSemanticKeys.aliasOwner)[0];
    expect(ownerLoreStage?.displayEntry?.entryKey).toBe(canonicalSemanticKeys.aliasOwner);
    expect(ownerLoreStage?.loreSections?.flatMap((section) => section.lines.map((line) => line.text))).toContain(
      "Last Lord Variant Owner chronicle."
    );
  });

  it("reports canonical diagnostic taxonomy counts for all covered fixture shapes", () => {
    const diagnostic = createQuestExplorerFrontendDiagnostic(canonicalSemanticQuestExplorer, {
      selectedEntryKey: canonicalSemanticKeys.kinLinear,
      sourceTexts: {
        "QuestExplorerPage.tsx": "buildQuestRailGroups buildLoreFlowModel buildStrategyFlowModel",
      },
    });

    expect(diagnostic.semanticCounts).toMatchObject({
      setup_task: 2,
      deterministic_continuation: 3,
      explicit_decision_option: 2,
      topology_fork_option: 2,
      convergence: 1,
      unresolved: 1,
      failure: 1,
      terminal: 1,
      internal_variant: 2,
      true_choice_groups: 1,
      topology_forks_without_true_choice: 1,
      grouped_deterministic_continuation_groups: 1,
      alias_owned_stages: 1,
      chapter_variants: 2,
      lore_ownership_gaps: 0,
      objective_ownership_gaps: 0,
    });
    expect(diagnostic.reportText).toContain("Canonical semantic taxonomy:");
    expect(diagnostic.reportText).toContain("explicit decision options: 2");
    expect(diagnostic.reportText).toContain("topology forks without true_choice: 1");
    expect(diagnostic.findings).toEqual(expect.arrayContaining([
      expect.objectContaining({
        classification: "accepted modeled artifact",
        message: expect.stringContaining("Internal/chapter variants stay in detail/chronicle context"),
      }),
    ]));
  });
});
