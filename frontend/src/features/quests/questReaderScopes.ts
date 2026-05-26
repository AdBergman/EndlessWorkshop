import { isResolutionLoreSection } from "@/features/quests/questDisplay";
import {
    addSelectionToRevealContext,
    cloneRevealContext,
    revealVisible,
    selectionForChoice,
    type QuestPathChoice,
    type QuestPathChoiceSelection,
    type RenderedPathStep,
    type RevealContext,
} from "@/features/quests/questPathFlow";
import type {
    LoreSection,
    QuestExplorerEntry,
    QuestProgressionStep,
    StrategyObjective,
} from "@/types/questTypes";

export type StrategyObjectiveScope = {
    objectives: StrategyObjective[];
    objectiveIndexOffset: number;
};

type ReaderChoiceContext = {
    choiceKey: string;
    branchStepOrder: number | null;
};

function uniqueReaderChoiceContexts(contexts: ReaderChoiceContext[]): ReaderChoiceContext[] {
    const seen = new Set<string>();
    return contexts.filter((context) => {
        const key = `${context.choiceKey}:${context.branchStepOrder ?? "any"}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

function contextForChoice(choice: QuestPathChoice | QuestPathChoiceSelection): ReaderChoiceContext | null {
    return choice.choiceKey
        ? { choiceKey: choice.choiceKey, branchStepOrder: choice.branchStepOrder }
        : null;
}

function readerCurrentChoiceContextsForStep(renderedStep: RenderedPathStep): ReaderChoiceContext[] {
    if (renderedStep.autoContinuedChoices.length > 0) {
        return uniqueReaderChoiceContexts(
            renderedStep.autoContinuedChoices
                .map(contextForChoice)
                .filter((context): context is ReaderChoiceContext => Boolean(context))
        );
    }

    const currentBeatContext = renderedStep.currentBeatChoice
        ? contextForChoice(renderedStep.currentBeatChoice)
        : null;
    if (currentBeatContext) return [currentBeatContext];

    const selectedContext = renderedStep.selectedChoice
        ? contextForChoice(renderedStep.selectedChoice)
        : null;
    if (selectedContext) return [selectedContext];

    const keyedChoices = renderedStep.choices.filter((choice) => choice.choiceKey && choice.sectionRole !== "continuation");
    if (keyedChoices.length === 0) return [];

    const trueChoices = keyedChoices.filter((choice) => choice.sectionRole === "true_choice");
    if (trueChoices.length > 1) return [];
    if (keyedChoices.length === 1) {
        const context = contextForChoice(keyedChoices[0]);
        return context ? [context] : [];
    }

    const orderedChoices = keyedChoices.filter((choice) => choice.branchStepOrder != null);
    if (orderedChoices.length === 0) return [];

    const earliestOrder = Math.min(...orderedChoices.map((choice) => choice.branchStepOrder ?? Number.MAX_SAFE_INTEGER));
    const earliestContexts = orderedChoices
        .filter((choice) => choice.branchStepOrder === earliestOrder)
        .map(contextForChoice)
        .filter((context): context is ReaderChoiceContext => Boolean(context));

    return uniqueReaderChoiceContexts(earliestContexts);
}

function readerRevealedChoiceContextsForStep(renderedStep: RenderedPathStep): ReaderChoiceContext[] {
    return uniqueReaderChoiceContexts(
        renderedStep.revealedContinuations
            .map(contextForChoice)
            .filter((context): context is ReaderChoiceContext => Boolean(context))
    );
}

function revealContextForRevealedContinuations(renderedStep: RenderedPathStep): RevealContext {
    const context = cloneRevealContext(renderedStep.revealContext);
    addSelectionToRevealContext(context, renderedStep.selectedChoice);
    addSelectionToRevealContext(context, renderedStep.currentBeatChoice);
    renderedStep.revealedContinuations.forEach((choice) => {
        addSelectionToRevealContext(context, selectionForChoice(renderedStep.step.stepKey, choice));
    });
    return context;
}

function loreSectionsForChoiceContexts(
    sections: LoreSection[],
    contexts: ReaderChoiceContext[],
    revealContext?: RevealContext
): LoreSection[] {
    const scopedSections = contexts.flatMap((context) => {
        const choiceSections = sections.filter((section) => (
            section.choiceKey === context.choiceKey
            && (!revealContext || revealVisible(section, revealContext))
        ));
        if (choiceSections.length === 0 || context.branchStepOrder == null) return choiceSections;

        const branchStepIndex = context.branchStepOrder - 1;
        const stepScopedSections = choiceSections.filter((section) => section.stepIndex === branchStepIndex);
        return stepScopedSections.length > 0 ? stepScopedSections : choiceSections;
    });

    return uniqueLoreSections(scopedSections);
}

function objectivesForLoreSections(
    objectives: StrategyObjective[],
    sections: LoreSection[],
    revealContext: RevealContext
): StrategyObjectiveScope | null {
    const objectiveKeys = new Set(sections
        .map((section) => section.objectiveKey)
        .filter((objectiveKey): objectiveKey is string => Boolean(objectiveKey)));
    if (objectiveKeys.size === 0) return null;

    const scopedObjectives = objectives.filter((objective) => (
        objective.objectiveKey != null && objectiveKeys.has(objective.objectiveKey)
        && revealVisible(objective, revealContext)
    ));
    if (scopedObjectives.length === 0) return null;

    const firstIndex = objectives.findIndex((objective) => objective.objectiveKey === scopedObjectives[0]?.objectiveKey);
    return {
        objectives: scopedObjectives,
        objectiveIndexOffset: firstIndex >= 0 ? firstIndex : 0,
    };
}

function objectiveScopeForBranchStepOrder(
    objectives: StrategyObjective[],
    branchStepOrder: number | null,
    revealContext: RevealContext
): StrategyObjectiveScope | null {
    if (branchStepOrder == null) return null;

    const objectiveIndex = branchStepOrder - 1;
    const objective = objectives[objectiveIndex];
    return objective && revealVisible(objective, revealContext)
        ? { objectives: [objective], objectiveIndexOffset: objectiveIndex }
        : null;
}

export function strategyObjectiveScopeForStep(
    entry: QuestExplorerEntry,
    renderedStep: RenderedPathStep
): StrategyObjectiveScope {
    const allObjectives = entry.strategyView.objectives;
    const visibleObjectiveEntries = allObjectives
        .map((objective, index) => ({ objective, index }))
        .filter(({ objective }) => revealVisible(objective, renderedStep.revealContext));
    const objectives = visibleObjectiveEntries.map(({ objective }) => objective);
    if (objectives.length <= 1) {
        return {
            objectives,
            objectiveIndexOffset: visibleObjectiveEntries[0]?.index ?? 0,
        };
    }

    const choiceContexts = readerCurrentChoiceContextsForStep(renderedStep);
    const choiceScopedLoreSections = loreSectionsForChoiceContexts(entry.loreView.sections, choiceContexts, renderedStep.revealContext);
    const choiceScopedObjectives = objectivesForLoreSections(allObjectives, choiceScopedLoreSections, renderedStep.revealContext);
    if (choiceScopedObjectives) return choiceScopedObjectives;

    const choiceOrderedObjectiveScope = choiceContexts
        .map((context) => objectiveScopeForBranchStepOrder(allObjectives, context.branchStepOrder, renderedStep.revealContext))
        .find((scope): scope is StrategyObjectiveScope => Boolean(scope));
    if (choiceOrderedObjectiveScope) return choiceOrderedObjectiveScope;

    const hasChoiceKeyedRows = renderedStep.choices.some((choice) => choice.choiceKey);
    if (choiceContexts.length > 0 || hasChoiceKeyedRows) {
        return { objectives: [], objectiveIndexOffset: 0 };
    }

    const indexCandidates = stepIndexCandidates(renderedStep.step, renderedStep.stepIndex);
    const stepScopedLoreSections = entry.loreView.sections.filter((section) => (
        section.stepIndex != null && indexCandidates.has(section.stepIndex)
    ));
    const stepScopedObjectives = objectivesForLoreSections(allObjectives, stepScopedLoreSections, renderedStep.revealContext);
    if (stepScopedObjectives) return stepScopedObjectives;

    const preferredIndex = Math.min(Math.max(renderedStep.stepIndex, 0), objectives.length - 1);
    return {
        objectives: [objectives[preferredIndex]],
        objectiveIndexOffset: visibleObjectiveEntries[preferredIndex]?.index ?? preferredIndex,
    };
}

export function strategyObjectiveScopeForRevealedContinuations(
    entry: QuestExplorerEntry,
    renderedStep: RenderedPathStep
): StrategyObjectiveScope | null {
    const objectives = entry.strategyView.objectives;
    if (objectives.length === 0) return null;

    const choiceContexts = readerRevealedChoiceContextsForStep(renderedStep);
    if (choiceContexts.length === 0) return null;

    const revealContext = revealContextForRevealedContinuations(renderedStep);
    const choiceScopedLoreSections = loreSectionsForChoiceContexts(entry.loreView.sections, choiceContexts, revealContext);
    const choiceScopedObjectives = objectivesForLoreSections(objectives, choiceScopedLoreSections, revealContext);
    return choiceScopedObjectives ?? null;
}

function stepIndexCandidates(step: QuestProgressionStep, stepIndex: number): Set<number> {
    return new Set([
        stepIndex,
        step.stepNumber != null ? step.stepNumber - 1 : null,
        step.stepOrder != null ? step.stepOrder - 1 : null,
    ].filter((value): value is number => value != null && Number.isFinite(value) && value >= 0));
}

function leadingSharedLoreSections(sections: LoreSection[]): LoreSection[] {
    const sharedSections: LoreSection[] = [];
    for (const section of sections) {
        if (
            section.stepIndex != null
            || section.objectiveKey
            || section.choiceKey
            || isResolutionLoreSection(section)
        ) {
            break;
        }
        sharedSections.push(section);
    }
    return sharedSections;
}

export function loreSectionsForStep(entry: QuestExplorerEntry, renderedStep: RenderedPathStep): LoreSection[] {
    const sections = entry.loreView.sections.filter((section) => revealVisible(section, renderedStep.revealContext));
    if (sections.length <= 1) return sections;

    const sharedOpeningSections = renderedStep.stepIndex === 0
        ? leadingSharedLoreSections(sections)
        : [];
    const choiceContexts = readerCurrentChoiceContextsForStep(renderedStep);
    const choiceScopedSections = loreSectionsForChoiceContexts(sections, choiceContexts, renderedStep.revealContext);
    if (choiceScopedSections.length > 0) {
        return uniqueLoreSections([...sharedOpeningSections, ...choiceScopedSections]);
    }

    const choiceOrderedStepIndexes = new Set(choiceContexts
        .map((context) => context.branchStepOrder != null ? context.branchStepOrder - 1 : null)
        .filter((value): value is number => value != null && Number.isFinite(value) && value >= 0));
    if (choiceOrderedStepIndexes.size > 0) {
        const choiceOrderedSections = sections.filter((section) => (
            section.stepIndex != null && choiceOrderedStepIndexes.has(section.stepIndex)
        ));
        if (choiceOrderedSections.length > 0) {
            return uniqueLoreSections([...sharedOpeningSections, ...choiceOrderedSections]);
        }
    }

    const hasChoiceKeyedRows = renderedStep.choices.some((choice) => choice.choiceKey);
    if (choiceContexts.length > 0 || hasChoiceKeyedRows) {
        return sharedOpeningSections;
    }

    const indexCandidates = stepIndexCandidates(renderedStep.step, renderedStep.stepIndex);
    const stepTaggedSections = sections.filter((section) => (
        section.stepIndex != null && indexCandidates.has(section.stepIndex)
    ));
    if (stepTaggedSections.length > 0) {
        return uniqueLoreSections([...sharedOpeningSections, ...stepTaggedSections]);
    }

    const strategyScope = strategyObjectiveScopeForStep(entry, renderedStep);
    const objectiveKeys = new Set(strategyScope.objectives.map((objective) => objective.objectiveKey).filter(Boolean));
    const objectiveTaggedSections = sections.filter((section) => (
        section.objectiveKey != null && objectiveKeys.has(section.objectiveKey)
    ));
    if (objectiveTaggedSections.length > 0) return objectiveTaggedSections;

    const fallbackSection = sections[Math.min(Math.max(renderedStep.stepIndex, 0), sections.length - 1)];
    return fallbackSection ? [fallbackSection] : [];
}

export function loreSectionsForRevealedContinuations(entry: QuestExplorerEntry, renderedStep: RenderedPathStep): LoreSection[] {
    const choiceContexts = readerRevealedChoiceContextsForStep(renderedStep);
    if (choiceContexts.length === 0) return [];
    return loreSectionsForChoiceContexts(entry.loreView.sections, choiceContexts, revealContextForRevealedContinuations(renderedStep));
}

export type LoreNarrativeOwnershipTracker = {
    visibleSectionKeys: Set<string>;
};

export function createLoreNarrativeOwnershipTracker(): LoreNarrativeOwnershipTracker {
    return { visibleSectionKeys: new Set() };
}

export function claimVisibleLoreSections(
    sections: LoreSection[],
    detailEntryKey: string,
    ownershipTracker: LoreNarrativeOwnershipTracker | null
): LoreSection[] {
    if (!ownershipTracker) return sections;

    return sections.filter((section) => {
        const ownershipKey = loreSectionOwnershipKey(detailEntryKey, section);
        if (ownershipTracker.visibleSectionKeys.has(ownershipKey)) return false;
        ownershipTracker.visibleSectionKeys.add(ownershipKey);
        return true;
    });
}

function uniqueLoreSections(sections: LoreSection[]): LoreSection[] {
    const seen = new Set<string>();
    return sections.filter((section) => {
        if (seen.has(section.sectionKey)) return false;
        seen.add(section.sectionKey);
        return true;
    });
}

function loreSectionOwnershipKey(detailEntryKey: string, section: LoreSection): string {
    const ownerKey = detailEntryKey.trim() || "unknown";
    const sectionKey = section.sectionKey.trim();
    if (sectionKey) return `${ownerKey}:section:${sectionKey}`;

    const body = normalizedLoreSectionBody(section);
    const bodySnippet = body.slice(0, 160);
    return [
        ownerKey,
        "choice",
        section.choiceKey ?? "any",
        "step",
        section.stepIndex != null ? String(section.stepIndex) : "any",
        "body",
        hashLoreBody(body),
        bodySnippet,
    ].join(":");
}

function normalizedLoreSectionBody(section: LoreSection): string {
    return section.lines
        .map((line) => [
            normalizedLoreTextPart(line.speakerLabel),
            normalizedLoreTextPart(line.role),
            normalizedLoreTextPart(line.text),
        ].join("|"))
        .join("\n")
        .trim();
}

function normalizedLoreTextPart(value: string | null): string {
    return (value ?? "").replace(/\s+/g, " ").trim();
}

function hashLoreBody(value: string): string {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
        hash ^= value.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
}
