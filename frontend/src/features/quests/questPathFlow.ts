import type { QuestExplorerEntry, QuestExplorerProgression } from "@/types/questTypes";
import type {
    LoreChoicePathsByContext,
    LoreChronicleSegment,
    LoreChronicleStream,
    QuestDetailProgression,
    QuestPathChoiceSelection,
    QuestPathFlow,
    QuestPathFlowOptions,
    RenderedPathStep,
    RevealContext,
} from "./questPathFlowTypes";
import { EMPTY_CHOICE_PATH, LORE_CHRONICLE_SEGMENT_CAP } from "./questPathFlowTypes";
import {
    addSelectionToRevealContext,
    choicePrerequisitesSatisfied,
    cloneRevealContext,
    detailEntryCounts,
    findDetailProgression,
    isSameProgressionChapter,
    progressionContextKey,
    progressionLocationOutsideCurrentChapterForKeys,
    railEntryKeyForProgression,
    stepIndexForBranchStepOrder,
    stepIndexForKeys,
    uniqueStrings,
    normalizeQuestExplorerEntryForPathFlow,
} from "./questPathProgression";
import {
    activeContinuationChoicesForSelection,
    choiceMatchesSelectionKey,
    choicesForStep,
    choicesScopedToCurrentBeat,
    continuationChoicesForSelectedChoice,
    diagnosticsWithPassiveChain,
    followUpStepIndexForContinuationChoices,
    implicitActiveChoice,
    nextRevealedProjectedStep,
    pairedContinuationKeysForSelection,
    passiveDeterministicChapterExit,
    passiveSetupAdvance,
    revealedContinuationChoices,
    selectedChoiceContinuationKeys,
    selectedChoiceTargetKeys,
    selectionsByStepKey,
    selectionForChoice,
    uniqueChoicesById,
    visibilityDiagnosticsForChoices,
    visibleChoicesForDiagnostics,
} from "./questPathChoices";

export * from "./questPathFlowTypes";
export * from "./questPathProgression";
export * from "./questPathChoices";

export function buildQuestPathFlow(
    progression: QuestDetailProgression,
    entriesByKey: Record<string, QuestExplorerEntry>,
    choicePath: QuestPathChoiceSelection[],
    fullProgression: QuestExplorerProgression | null,
    options: QuestPathFlowOptions
): QuestPathFlow {
    const steps = progression.chapter.steps;
    const selectedByStep = selectionsByStepKey(choicePath);
    const counts = detailEntryCounts(progression.chapter);
    const renderedDetailKeys = new Set<string>();
    const displayEntryOverrides = new Map<string, string>();
    const carriedBeatChoicesByStepKey = new Map<string, QuestPathChoiceSelection>();
    const revealContext: RevealContext = {
        branchKeys: new Set(),
        choiceKeys: new Set(),
        branchPath: [],
    };
    const focusedStepIndex = Math.min(Math.max(options.focusedStepIndex, 0), Math.max(steps.length - 1, 0));
    let visibleUntil = focusedStepIndex;
    let unresolvedContinuation: QuestPathChoiceSelection | null = null;
    let reachedContinuationEntryKey: string | null = null;
    const renderedSteps: RenderedPathStep[] = [];

    for (let index = focusedStepIndex; index < steps.length; index += 1) {
        if (index > visibleUntil) break;

        const step = steps[index];
        const currentBeatChoice = carriedBeatChoicesByStepKey.get(step.stepKey) ?? null;
        addSelectionToRevealContext(revealContext, currentBeatChoice);
        const storedSelections = selectedByStep.get(step.stepKey) ?? [];
        const selectedStoredSelection = storedSelections.at(-1) ?? null;
        for (const priorSelection of storedSelections.slice(0, -1)) {
            addSelectionToRevealContext(revealContext, priorSelection);
        }
        const stepRevealContext = cloneRevealContext(revealContext);
        const overrideEntryKey = displayEntryOverrides.get(step.stepKey);
        const rawDisplayEntry = (overrideEntryKey ? entriesByKey[overrideEntryKey] : null)
            ?? entriesByKey[step.detailEntryKey]
            ?? null;
        const displayEntry = rawDisplayEntry
            ? normalizeQuestExplorerEntryForPathFlow(rawDisplayEntry)
            : null;
        const repeatsDetailEntry = (counts.get(step.detailEntryKey) ?? 0) > 1;
        const rendersRepeatedDetailContent = repeatsDetailEntry
            && renderedDetailKeys.has(step.detailEntryKey)
            && !currentBeatChoice;
        const hasEntryBackedBranchChoices = (displayEntry?.branches.length ?? 0) > 0;
        const unscopedRawChoices = rendersRepeatedDetailContent
            ? []
            : choicesForStep(step, displayEntry, entriesByKey, {
                includeStepVariants: options.showRawHiddenRows || (!overrideEntryKey && !hasEntryBackedBranchChoices),
            });
        const scopedRawChoices = choicesScopedToCurrentBeat(unscopedRawChoices, currentBeatChoice, options.showRawHiddenRows, stepRevealContext);
        const selectedRawChoice = selectedStoredSelection
            ? unscopedRawChoices.find((choice) => choiceMatchesSelectionKey(choice, selectedStoredSelection)) ?? null
            : null;
        const rawChoices = selectedRawChoice && choicePrerequisitesSatisfied(selectedRawChoice, stepRevealContext)
            ? uniqueChoicesById([...scopedRawChoices, selectedRawChoice])
            : scopedRawChoices;
        const prerequisiteEligibleChoices = rawChoices.filter((choice) => choicePrerequisitesSatisfied(choice, stepRevealContext));
        let choiceDiagnostics = visibilityDiagnosticsForChoices(
            rawChoices,
            prerequisiteEligibleChoices,
            displayEntry,
            step,
            progression,
            entriesByKey
        );
        let choices = options.showRawHiddenRows
            ? rawChoices
            : visibleChoicesForDiagnostics(prerequisiteEligibleChoices, choiceDiagnostics);
        const storedChoice = selectedStoredSelection
            ? choices.find((choice) => choiceMatchesSelectionKey(choice, selectedStoredSelection)) ?? null
            : null;
        const selectedChoice = selectedStoredSelection
            ? storedChoice ? selectionForChoice(step.stepKey, storedChoice) : null
            : implicitActiveChoice(choices, progression.activeVariantEntryKeys);
        if (!options.showRawHiddenRows && selectedChoice?.branchStepOrder != null) {
            choices = choices.filter((choice) => (
                choice.id === selectedChoice.choiceId
                || choice.branchStepOrder == null
                || choice.branchStepOrder <= selectedChoice.branchStepOrder!
            ));
        }
        const revealParentChoice = selectedChoice ?? currentBeatChoice;
        const revealParentContext = cloneRevealContext(stepRevealContext);
        addSelectionToRevealContext(revealParentContext, revealParentChoice);
        const revealEligibleChoices = unscopedRawChoices.filter((choice) => choicePrerequisitesSatisfied(choice, revealParentContext));
        if (options.showRawHiddenRows && revealParentChoice) {
            choiceDiagnostics = visibilityDiagnosticsForChoices(
                rawChoices,
                revealEligibleChoices,
                displayEntry,
                step,
                progression,
                entriesByKey
            );
        }
        const revealedContinuations = revealedContinuationChoices(
            revealEligibleChoices,
            revealParentChoice,
            options.showRawHiddenRows,
            revealParentContext
        );
        const followUpContinuations = continuationChoicesForSelectedChoice(
            revealEligibleChoices,
            revealParentChoice,
            revealParentContext
        );
        const activeFollowUpContinuations = activeContinuationChoicesForSelection(
            revealEligibleChoices,
            revealParentChoice,
            revealParentContext
        );
        const activeFollowUpContinuationIds = new Set(activeFollowUpContinuations.map((choice) => choice.id));
        if (!options.showRawHiddenRows && activeFollowUpContinuations.length > 0) {
            choiceDiagnostics = visibilityDiagnosticsForChoices(
                rawChoices,
                revealEligibleChoices,
                displayEntry,
                step,
                progression,
                entriesByKey
            );
        }
        const revealedContinuationsBecomeSteps = revealedContinuations.some((choice) => (
            stepIndexForBranchStepOrder(steps, step.detailEntryKey, choice.branchStepOrder, index + 1) != null
        ));
        const revealedContinuationIds = new Set(
            revealedContinuations
                .filter((choice) => !activeFollowUpContinuationIds.has(choice.id))
                .map((choice) => choice.id)
        );
        const currentBeatChoiceId = currentBeatChoice?.choiceId ?? null;
        const passiveAdvance = !options.showRawHiddenRows && !selectedChoice
            ? passiveSetupAdvance(
                step,
                index,
                choices,
                rawChoices,
                steps,
                entriesByKey,
                stepRevealContext
            )
            : null;
        const deterministicChapterExit = !options.showRawHiddenRows && !selectedChoice && !currentBeatChoice
            ? passiveDeterministicChapterExit(
                step,
                choices,
                rawChoices,
                progression,
                fullProgression,
                stepRevealContext
            )
            : null;
        const passiveChoiceId = passiveAdvance?.selection.choiceId ?? null;
        if (deterministicChapterExit) {
            choiceDiagnostics = diagnosticsWithPassiveChain(choiceDiagnostics, deterministicChapterExit.choices);
        }
        if (passiveChoiceId && !choiceDiagnostics.hiddenReasonsByChoiceId.has(passiveChoiceId)) {
            choiceDiagnostics = {
                ...choiceDiagnostics,
                normalVisibleChoiceCount: Math.max(0, choiceDiagnostics.normalVisibleChoiceCount - 1),
                hiddenArtifactCount: choiceDiagnostics.hiddenArtifactCount + 1,
                hiddenReasonsByChoiceId: new Map([
                    ...choiceDiagnostics.hiddenReasonsByChoiceId,
                    [passiveChoiceId, {
                        category: "artifact" as const,
                        message: "passive setup context before modeled continuation choices",
                    }],
                ]),
            };
        }
        const actionableChoices = uniqueChoicesById([...choices, ...activeFollowUpContinuations]).filter((choice) => (
            !revealedContinuationIds.has(choice.id)
            && choice.id !== currentBeatChoiceId
            && choice.id !== passiveChoiceId
        ));
        const displayedRevealedContinuations = deterministicChapterExit
            ? []
            : revealedContinuations.filter((choice) => !activeFollowUpContinuationIds.has(choice.id));
        const renderedBeatChoice = deterministicChapterExit?.selection ?? currentBeatChoice ?? passiveAdvance?.selection ?? null;

        renderedSteps.push({
            step,
            stepIndex: index,
            displayEntry,
            choices: deterministicChapterExit ? [] : actionableChoices,
            revealedContinuations: displayedRevealedContinuations,
            autoContinuedChoices: deterministicChapterExit?.choices ?? [],
            currentBeatChoice: renderedBeatChoice,
            selectedChoice,
            choiceDiagnostics,
            isActive: progression.activeStepKeys.has(step.stepKey),
            repeatsDetailEntry,
            rendersRepeatedDetailContent,
            revealedContinuationsBecomeSteps,
            revealContext: deterministicChapterExit?.revealContext ?? stepRevealContext,
        });

        if (!rendersRepeatedDetailContent) {
            renderedDetailKeys.add(step.detailEntryKey);
        }

        if (deterministicChapterExit) {
            reachedContinuationEntryKey = deterministicChapterExit.targetEntryKey;
            break;
        }

        const lockCandidateChoiceCount = options.showRawHiddenRows ? rawChoices.length : prerequisiteEligibleChoices.length;
        const visiblePathChoiceCount = actionableChoices.length + displayedRevealedContinuations.length;
        if (passiveAdvance) {
            const followUpStep = steps[passiveAdvance.followUpStepIndex];
            if (displayEntry) {
                displayEntryOverrides.set(followUpStep.stepKey, displayEntry.entryKey);
            }
            carriedBeatChoicesByStepKey.set(followUpStep.stepKey, passiveAdvance.selection);
            visibleUntil = Math.max(visibleUntil, passiveAdvance.followUpStepIndex);
            continue;
        }
        if (!currentBeatChoice && lockCandidateChoiceCount > 0 && visiblePathChoiceCount === 0) {
            if (index < visibleUntil && progression.activeVariantEntryKeys.size > 0) {
                continue;
            }
            break;
        }

        if (visiblePathChoiceCount > 0) {
            const revealedContinuation = displayedRevealedContinuations[0] ?? null;
            if (!selectedChoice && !revealedContinuation) {
                if (index < visibleUntil && progression.activeVariantEntryKeys.size > 0) {
                    continue;
                }
                break;
            }

            const advancingChoice = revealedContinuation
                ? selectionForChoice(step.stepKey, revealedContinuation)
                : selectedChoice;
            if (!advancingChoice) break;
            addSelectionToRevealContext(revealContext, selectedChoice);
            addSelectionToRevealContext(revealContext, advancingChoice);
            const nextRevealContext = cloneRevealContext(revealContext);

            if (!options.showRawHiddenRows && !revealedContinuation && followUpContinuations.length > 1 && revealParentChoice) {
                const followUpStepIndex = followUpStepIndexForContinuationChoices(
                    steps,
                    step.detailEntryKey,
                    followUpContinuations,
                    entriesByKey,
                    index + 1
                );
                if (followUpStepIndex != null) {
                    if (displayEntry) {
                        displayEntryOverrides.set(steps[followUpStepIndex].stepKey, displayEntry.entryKey);
                    }
                    carriedBeatChoicesByStepKey.set(steps[followUpStepIndex].stepKey, revealParentChoice);
                    visibleUntil = Math.max(visibleUntil, followUpStepIndex);
                    continue;
                }
            }

            const sameEntryBranchStepIndex = stepIndexForBranchStepOrder(
                steps,
                step.detailEntryKey,
                advancingChoice.branchStepOrder,
                index + 1
            );
            if (sameEntryBranchStepIndex != null) {
                carriedBeatChoicesByStepKey.set(steps[sameEntryBranchStepIndex].stepKey, advancingChoice);
                visibleUntil = Math.max(visibleUntil, sameEntryBranchStepIndex);
                continue;
            }

            const targetKeys = selectedChoiceTargetKeys(advancingChoice);
            const targetStepIndex = stepIndexForKeys(steps, targetKeys, entriesByKey, index);
            if (targetStepIndex != null) {
                if (advancingChoice.targetEntryKey) {
                    displayEntryOverrides.set(steps[targetStepIndex].stepKey, advancingChoice.targetEntryKey);
                }
                visibleUntil = Math.max(visibleUntil, targetStepIndex);
            }

            const pairedContinuationKeys = pairedContinuationKeysForSelection(revealEligibleChoices, advancingChoice, entriesByKey);
            const continuationStepIndex = stepIndexForKeys(
                steps,
                uniqueStrings([
                    ...selectedChoiceContinuationKeys(advancingChoice, entriesByKey),
                    ...pairedContinuationKeys,
                ]),
                entriesByKey,
                index + 1
            );
            if (continuationStepIndex != null) {
                visibleUntil = Math.max(visibleUntil, continuationStepIndex);
                continue;
            }

            const nextLocation = progressionLocationOutsideCurrentChapterForKeys(
                fullProgression,
                progression,
                uniqueStrings([
                    ...selectedChoiceContinuationKeys(advancingChoice, entriesByKey),
                    ...pairedContinuationKeys,
                ]),
                entriesByKey
            ) ?? progressionLocationOutsideCurrentChapterForKeys(
                fullProgression,
                progression,
                targetKeys,
                entriesByKey
            );
            if (nextLocation && !isSameProgressionChapter(progression, nextLocation)) {
                const projectedStep = nextRevealedProjectedStep(steps, index, entriesByKey, nextRevealContext);
                if (projectedStep) {
                    if (projectedStep.choice) {
                        carriedBeatChoicesByStepKey.set(
                            steps[projectedStep.stepIndex].stepKey,
                            selectionForChoice(steps[projectedStep.stepIndex].stepKey, projectedStep.choice)
                        );
                    }
                    visibleUntil = Math.max(visibleUntil, projectedStep.stepIndex);
                    continue;
                }

                reachedContinuationEntryKey = entriesByKey[nextLocation.step.detailEntryKey]?.entryKey
                    ?? advancingChoice.targetEntryKey
                    ?? null;
                break;
            }

            if (targetStepIndex != null && targetStepIndex <= index && advancingChoice.stepKey === "") {
                continue;
            }

            if (advancingChoice.hasDependentContinuations && targetKeys.length === 0) {
                continue;
            }

            if (revealedContinuation && targetKeys.length === 0) {
                break;
            }

            if (targetStepIndex == null || targetStepIndex <= index) {
                unresolvedContinuation = advancingChoice;
                break;
            }
        } else if (currentBeatChoice) {
            const targetKeys = selectedChoiceTargetKeys(currentBeatChoice);
            const targetStepIndex = stepIndexForKeys(steps, targetKeys, entriesByKey, index);
            if (targetStepIndex != null) {
                if (currentBeatChoice.targetEntryKey) {
                    displayEntryOverrides.set(steps[targetStepIndex].stepKey, currentBeatChoice.targetEntryKey);
                }
                visibleUntil = Math.max(visibleUntil, targetStepIndex);
                continue;
            }

            const pairedContinuationKeys = pairedContinuationKeysForSelection(revealEligibleChoices, currentBeatChoice, entriesByKey);
            const continuationStepIndex = stepIndexForKeys(
                steps,
                uniqueStrings([
                    ...selectedChoiceContinuationKeys(currentBeatChoice, entriesByKey),
                    ...pairedContinuationKeys,
                ]),
                entriesByKey,
                index + 1
            );
            if (continuationStepIndex != null) {
                visibleUntil = Math.max(visibleUntil, continuationStepIndex);
                continue;
            }

            const nextLocation = progressionLocationOutsideCurrentChapterForKeys(
                fullProgression,
                progression,
                uniqueStrings([
                    ...selectedChoiceContinuationKeys(currentBeatChoice, entriesByKey),
                    ...pairedContinuationKeys,
                ]),
                entriesByKey
            ) ?? progressionLocationOutsideCurrentChapterForKeys(
                fullProgression,
                progression,
                targetKeys,
                entriesByKey
            );
            if (nextLocation && !isSameProgressionChapter(progression, nextLocation)) {
                const projectedStep = nextRevealedProjectedStep(steps, index, entriesByKey, stepRevealContext);
                if (projectedStep) {
                    if (projectedStep.choice) {
                        carriedBeatChoicesByStepKey.set(
                            steps[projectedStep.stepIndex].stepKey,
                            selectionForChoice(steps[projectedStep.stepIndex].stepKey, projectedStep.choice)
                        );
                    }
                    visibleUntil = Math.max(visibleUntil, projectedStep.stepIndex);
                    continue;
                }

                reachedContinuationEntryKey = entriesByKey[nextLocation.step.detailEntryKey]?.entryKey
                    ?? currentBeatChoice.targetEntryKey
                    ?? null;
                break;
            }

            if (index === visibleUntil) {
                break;
            }
        } else if (index === visibleUntil) {
            break;
        }
    }

    return {
        renderedSteps,
        unresolvedContinuation,
        reachedContinuationEntryKey,
    };
}

export function buildLoreChronicleStream({
    selectedProgression,
    fullProgression,
    entriesByKey,
    loreChoicePathsByContext,
    showRawHiddenRows,
    segmentCap = LORE_CHRONICLE_SEGMENT_CAP,
}: {
    selectedProgression: QuestDetailProgression | null;
    fullProgression: QuestExplorerProgression | null;
    entriesByKey: Record<string, QuestExplorerEntry>;
    loreChoicePathsByContext: LoreChoicePathsByContext;
    showRawHiddenRows: boolean;
    segmentCap?: number;
}): LoreChronicleStream {
    if (!selectedProgression) return { segments: [], selectedContextKey: null };

    const selectedContextKey = progressionContextKey(
        selectedProgression,
        railEntryKeyForProgression(selectedProgression, entriesByKey)
    );
    const segments: LoreChronicleSegment[] = [];
    const visitedContextKeys = new Set<string>();
    let currentProgression: QuestDetailProgression | null = selectedProgression;
    let currentContextKey: string | null = selectedContextKey;

    while (currentProgression && currentContextKey && segments.length < segmentCap) {
        if (visitedContextKeys.has(currentContextKey)) break;
        visitedContextKeys.add(currentContextKey);

        const choicePath = loreChoicePathsByContext[currentContextKey] ?? EMPTY_CHOICE_PATH;
        const flow = buildQuestPathFlow(
            currentProgression,
            entriesByKey,
            choicePath,
            fullProgression,
            {
                focusedStepIndex: currentProgression.focusedStepIndex,
                showRawHiddenRows,
            }
        );
        segments.push({
            segmentKey: currentContextKey,
            contextKey: currentContextKey,
            railEntryKey: railEntryKeyForProgression(currentProgression, entriesByKey),
            progression: currentProgression,
            flow,
            isSelectedContext: currentContextKey === selectedContextKey,
        });

        const reachedEntryKey = flow.reachedContinuationEntryKey;
        const reachedEntry = reachedEntryKey ? entriesByKey[reachedEntryKey] ?? null : null;
        const reachedProgression = reachedEntry
            ? findDetailProgression(fullProgression, reachedEntry, reachedEntryKey)
            : null;
        const reachedContextKey = reachedProgression
            ? progressionContextKey(reachedProgression, reachedEntryKey)
            : null;

        currentProgression = reachedProgression;
        currentContextKey = reachedContextKey;

        if (!currentProgression || !currentContextKey) break;
    }

    return { segments, selectedContextKey };
}
