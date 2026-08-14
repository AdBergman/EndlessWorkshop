import type {
    QuestBranch,
    QuestExplorerEntry,
    QuestExplorerProgression,
    QuestProgressionStep,
} from "@/types/questTypes";
import { getQuestCategoryKey } from "@/features/quests/questCategories";
import {
    chapterPositionLabel,
    stepPositionLabel,
} from "@/features/quests/questDisplay";
import { classifyQuestBranchSemanticStage } from "@/features/quests/questSemanticStages";
import {
    rewardDisplayTexts,
    rewardDisplaysFromRewards,
} from "@/features/quests/questRewardDisplay";
import {
    requirementDisplayTexts,
    requirementDisplaysFromRequirements,
} from "@/features/quests/questRequirementDisplay";
import type {
    ChoiceVisibilityDiagnostics,
    NormalHiddenChoiceReason,
    QuestDetailProgression,
    QuestPathChoice,
    QuestPathChoiceSelection,
    QuestProgressionLocation,
    RevealContext,
} from "./questPathFlowTypes";
import {
    addSelectionToRevealContext,
    branchPrerequisiteKeys,
    branchRole,
    branchTargetKeys,
    choicePrerequisitesSatisfied,
    cloneRevealContext,
    continuationKeys,
    dependentContinuationBranches,
    hasRevealMetadata,
    isContinuationBranch,
    isSameProgressionChapter,
    knownEntryKey,
    nextProgressionChapterLocation,
    normalizeQuestExplorerEntryForPathFlow,
    progressionLocationOutsideCurrentChapterForKeys,
    revealMetadataSatisfied,
    stepMatchesKeys,
    stepIndexForBranchStepOrder,
    stepIndexForKeys,
    uniqueStrings,
    variantTargetKeys,
    visibleStepVariants,
} from "./questPathProgression";

export function nextRevealedProjectedStep(
    steps: QuestProgressionStep[],
    currentIndex: number,
    entriesByKey: Record<string, QuestExplorerEntry>,
    revealContext: RevealContext
): { stepIndex: number; choice: QuestPathChoice | null } | null {
    for (let candidateIndex = currentIndex + 1; candidateIndex < steps.length; candidateIndex += 1) {
        const candidate = steps[candidateIndex];
        const entry = entriesByKey[candidate.detailEntryKey] ?? null;
        if (!entry) continue;

        const revealedChoice = choicesForStep(candidate, entry, entriesByKey, { includeStepVariants: false })
            .filter((choice) => hasRevealMetadata(choice) && revealMetadataSatisfied(choice, revealContext))
            .find((choice) => (
                stepIndexForBranchStepOrder(steps, candidate.detailEntryKey, choice.branchStepOrder, currentIndex + 1) === candidateIndex
            )) ?? null;

        if (revealedChoice) {
            return { stepIndex: candidateIndex, choice: revealedChoice };
        }

        const hasRevealedStrategy = entry.strategyView.objectives.some((objective) => (
            hasRevealMetadata(objective) && revealMetadataSatisfied(objective, revealContext)
        ));
        const hasRevealedLore = entry.loreView.sections.some((section) => (
            hasRevealMetadata(section) && revealMetadataSatisfied(section, revealContext)
        ));
        if (hasRevealedStrategy || hasRevealedLore) {
            return { stepIndex: candidateIndex, choice: null };
        }
    }

    return null;
}

export function choiceDescription(lines: Array<string | null | undefined>, fallback: string | null): string[] {
    const cleanLines = uniqueStrings(lines.map((line) => line?.trim()).filter(Boolean));
    return cleanLines.length > 0 ? cleanLines : fallback ? [fallback] : [];
}

export function choicesForStep(
    step: QuestProgressionStep,
    detailEntry: QuestExplorerEntry | null,
    entriesByKey: Record<string, QuestExplorerEntry>,
    options: { includeStepVariants?: boolean } = {}
): QuestPathChoice[] {
    const normalizedDetailEntry = detailEntry
        ? normalizeQuestExplorerEntryForPathFlow(detailEntry)
        : null;
    const includeStepVariants = options.includeStepVariants ?? true;
    const variantChoices = includeStepVariants ? visibleStepVariants(step).map((variant): QuestPathChoice => {
        const target = entriesByKey[variant.entryKey] ?? null;
        const explicitTargets = variantTargetKeys(variant);
        const targetSummary = target?.summaryLines[0] ?? null;
        const label = target?.title || variant.title || "Choice";
        const descriptionLines = choiceDescription([variant.branchLabel, targetSummary], null);

        return {
            id: `variant:${variant.entryKey}`,
            branchKey: null,
            choiceKey: null,
            label,
            eyebrow: variant.branchLabel || "Choice",
            groupKey: variant.branchGroupKey,
            groupLabel: variant.branchLabel,
            sourceEntryKey: target?.entryKey ?? variant.entryKey,
            sectionRole: null,
            semanticStageKind: "internal_variant",
            prerequisiteBranchKeys: [],
            revealedByBranchKeys: [],
            revealedByChoiceKeys: [],
            revealedByBranchPathAlternatives: [],
            parentBranchKey: null,
            parentChoiceKey: null,
            choiceGroupKey: null,
            convergenceGroupKey: null,
            branchStepOrder: null,
            hasDependentContinuations: false,
            descriptionLines,
            strategyLines: choiceDescription([targetSummary], null),
            loreLines: descriptionLines,
            requirementLines: [],
            requirementDetails: [],
            rewardLines: [],
            rewardDetails: [],
            targetEntryKey: target?.entryKey ?? knownEntryKey(explicitTargets, entriesByKey),
            targetSummaryLine: targetSummary,
            continuationTitle: target?.title ?? null,
            nextEntryKeys: uniqueStrings([variant.entryKey, ...explicitTargets]),
            failureEntryKeys: variant.failureEntryKeys,
            convergesIntoEntryKeys: variant.convergesIntoEntryKeys,
            accent: "teal",
        };
    }) : [];

    const branchChoices = [...(normalizedDetailEntry?.branches ?? [])]
        .sort((left, right) => (left.orderIndex ?? Number.MAX_SAFE_INTEGER) - (right.orderIndex ?? Number.MAX_SAFE_INTEGER))
        .map((branch): QuestPathChoice => {
            const explicitTargets = branchTargetKeys(branch);
            const targetEntryKey = knownEntryKey(explicitTargets, entriesByKey);
            const target = targetEntryKey ? entriesByKey[targetEntryKey] : null;
            const dependentContinuations = dependentContinuationBranches(branch, normalizedDetailEntry?.branches ?? []);
            const loreLines = choiceDescription([
                ...(branch.lore?.outcomePreviewLines ?? []),
                target?.summaryLines[0],
            ], target?.title ?? null);
            const strategyLines = choiceDescription([
                ...(branch.strategy?.conditions ?? []),
                target?.summaryLines[0],
            ], target?.title ?? null);
            const requirementDetails = requirementDisplaysFromRequirements(branch.strategy?.requirements ?? []);
            const requirementLines = requirementDisplayTexts(requirementDetails);
            const rewardDetails = rewardDisplaysFromRewards(branch.strategy?.rewards ?? []);
            const rewardLines = rewardDisplayTexts(rewardDetails);
            const repeatedEntryTitle = branch.label && normalizedDetailEntry?.title && branch.label === normalizedDetailEntry.title;

            return {
                id: `branch:${branch.branchKey}`,
                branchKey: branch.branchKey,
                choiceKey: branch.choiceKey,
                label: repeatedEntryTitle ? strategyLines[0] ?? target?.title ?? branch.label ?? "Choice" : branch.label || target?.title || "Choice",
                eyebrow: branch.groupLabel || "Choice",
                groupKey: branch.groupKey,
                groupLabel: branch.groupLabel,
                sourceEntryKey: normalizedDetailEntry?.entryKey ?? null,
                sectionRole: branchRole(branch),
                semanticStageKind: classifyQuestBranchSemanticStage(branch, normalizedDetailEntry?.branches ?? []),
                prerequisiteBranchKeys: branchPrerequisiteKeys(branch),
                revealedByBranchKeys: branch.revealedByBranchKeys ?? [],
                revealedByChoiceKeys: branch.revealedByChoiceKeys ?? [],
                revealedByBranchPathAlternatives: branch.revealedByBranchPathAlternatives ?? [],
                parentBranchKey: branch.parentBranchKey ?? null,
                parentChoiceKey: branch.parentChoiceKey ?? null,
                choiceGroupKey: branch.choiceGroupKey ?? null,
                convergenceGroupKey: branch.convergenceGroupKey ?? null,
                branchStepOrder: branch.branchStepOrder ?? null,
                hasDependentContinuations: dependentContinuations.length > 0,
                descriptionLines: uniqueStrings([...strategyLines, ...loreLines]),
                strategyLines,
                loreLines,
                requirementLines,
                requirementDetails,
                rewardLines,
                rewardDetails,
                targetEntryKey,
                targetSummaryLine: target?.summaryLines[0] ?? null,
                continuationTitle: target?.title ?? null,
                nextEntryKeys: explicitTargets,
                failureEntryKeys: branch.failureEntryKeys,
                convergesIntoEntryKeys: branch.convergesIntoEntryKeys,
                accent: "gold",
            };
        });

    const seen = new Set<string>();
    return [...variantChoices, ...branchChoices].filter((choice) => {
        if (seen.has(choice.id)) return false;
        seen.add(choice.id);
        return true;
    });
}

export function selectionForChoice(stepKey: string, choice: QuestPathChoice): QuestPathChoiceSelection {
    return {
        stepKey,
        choiceId: choice.id,
        branchKey: choice.branchKey,
        choiceKey: choice.choiceKey,
        sectionRole: choice.sectionRole,
        semanticStageKind: choice.semanticStageKind,
        choiceGroupKey: choice.choiceGroupKey,
        branchStepOrder: choice.branchStepOrder,
        hasDependentContinuations: choice.hasDependentContinuations,
        label: choice.label,
        targetEntryKey: choice.targetEntryKey,
        nextEntryKeys: choice.nextEntryKeys,
    };
}

export function passiveSelectionForChoice(stepKey: string, choice: QuestPathChoice): QuestPathChoiceSelection {
    return {
        ...selectionForChoice(stepKey, choice),
        isPassive: true,
    };
}

export function selectionBranchOrder(selection: QuestPathChoiceSelection): number {
    return selection.branchStepOrder ?? Number.MAX_SAFE_INTEGER;
}

export function selectedChoiceTargetKeys(selection: QuestPathChoiceSelection): string[] {
    return uniqueStrings([selection.targetEntryKey, ...selection.nextEntryKeys]);
}

export function selectedChoiceContinuationKeys(
    selection: QuestPathChoiceSelection,
    entriesByKey: Record<string, QuestExplorerEntry>
): string[] {
    const target = selection.targetEntryKey ? entriesByKey[selection.targetEntryKey] ?? null : null;
    return uniqueStrings([
        ...selection.nextEntryKeys,
        ...continuationKeys(target),
    ]);
}

export function pairedContinuationKeysForSelection(
    choices: QuestPathChoice[],
    selection: QuestPathChoiceSelection,
    entriesByKey: Record<string, QuestExplorerEntry>
): string[] {
    if (!selection.choiceGroupKey || !selection.label) return [];

    const pairedChoices = choices.filter((choice) => (
        choice.id !== selection.choiceId
        && choice.sectionRole === "continuation"
        && choice.choiceGroupKey === selection.choiceGroupKey
        && choice.label === selection.label
        && choice.branchStepOrder === selection.branchStepOrder
        && hasModeledChoiceContinuation(choice)
    ));

    return uniqueStrings(pairedChoices.flatMap((choice) => {
        const pairedSelection = selectionForChoice("", choice);
        return [
            ...selectedChoiceTargetKeys(pairedSelection),
            ...selectedChoiceContinuationKeys(pairedSelection, entriesByKey),
        ];
    }));
}

export function implicitActiveChoice(
    choices: QuestPathChoice[],
    activeVariantEntryKeys: Set<string>
): QuestPathChoiceSelection | null {
    const choice = choices.find((candidate) => (
        candidate.targetEntryKey ? activeVariantEntryKeys.has(candidate.targetEntryKey) : false
    ) || candidate.nextEntryKeys.some((entryKey) => activeVariantEntryKeys.has(entryKey)));

    return choice ? selectionForChoice("", choice) : null;
}

export function locationLabel(location: QuestProgressionLocation | null, entriesByKey: Record<string, QuestExplorerEntry>): string | null {
    if (!location) return null;
    const title = entriesByKey[location.step.detailEntryKey]?.title ?? location.step.title;
    return [
        chapterPositionLabel(location.chapter),
        stepPositionLabel(location.step),
        title ? `(${title})` : null,
    ].filter(Boolean).join(" ");
}

export function choiceKindLabel(choice: QuestPathChoice): string {
    return choice.id.startsWith("variant:") ? "variant" : "branch";
}

export function isMainFactionEntry(entry: QuestExplorerEntry | null): boolean {
    return Boolean(entry && getQuestCategoryKey(entry.questType) === "faction");
}

export function isTerminalChoiceChapter(progression: QuestDetailProgression): boolean {
    const chapterNumber = progression.chapter.chapterNumber ?? progression.chapter.chapterOrder;
    return chapterNumber != null && chapterNumber >= 6;
}

export function hasModeledChoiceContinuation(choice: QuestPathChoice): boolean {
    return Boolean(choice.targetEntryKey || choice.nextEntryKeys.length > 0 || choice.hasDependentContinuations);
}

export function choiceHasNoExplicitLink(choice: QuestPathChoice): boolean {
    return !choice.targetEntryKey && choice.nextEntryKeys.length === 0;
}

export function hiddenNoLinkArtifactReason(choice: QuestPathChoice, choices: QuestPathChoice[]): NormalHiddenChoiceReason | null {
    if (choice.sectionRole !== "artifact") return null;
    if (!choiceHasNoExplicitLink(choice) || choice.hasDependentContinuations) return null;
    if (choice.branchStepOrder == null) return null;

    const hasPeerTrueChoice = choices.some((candidate) => (
        candidate.id !== choice.id
        && candidate.sectionRole === "true_choice"
        && candidate.branchStepOrder === choice.branchStepOrder
    ));

    return hasPeerTrueChoice
        ? { category: "artifact", message: "duplicate no-link artifact beside true choices" }
        : null;
}

export function hiddenUnresolvedReason(
    choice: QuestPathChoice,
    displayEntry: QuestExplorerEntry | null,
    progression: QuestDetailProgression
): NormalHiddenChoiceReason | null {
    if (choice.sectionRole === "continuation" && (choice.parentBranchKey || choice.prerequisiteBranchKeys.length > 0)) {
        return null;
    }

    const hidden = isMainFactionEntry(displayEntry)
        && !isTerminalChoiceChapter(progression)
        && !hasModeledChoiceContinuation(choice);

    return hidden
        ? { category: "unresolved", message: "no modeled continuation before final chapter" }
        : null;
}

export function hiddenUngatedContinuationReason(choice: QuestPathChoice): NormalHiddenChoiceReason | null {
    return choice.sectionRole === "continuation" && choice.prerequisiteBranchKeys.length === 0
        ? { category: "continuation", message: "continuation row waits for a selected branch sequence" }
        : null;
}

export function choiceTargetsLaterStepInCurrentChapter(
    step: QuestProgressionStep,
    choice: QuestPathChoice,
    progression: QuestDetailProgression,
    entriesByKey: Record<string, QuestExplorerEntry>
): boolean {
    const currentStepIndex = progression.chapter.steps.findIndex((candidate) => candidate.stepKey === step.stepKey);
    const selection = selectionForChoice(step.stepKey, choice);
    const lookupKeys = uniqueStrings([
        ...selectedChoiceTargetKeys(selection),
        ...selectedChoiceContinuationKeys(selection, entriesByKey),
    ]);
    const targetStepIndex = stepIndexForKeys(
        progression.chapter.steps,
        lookupKeys,
        entriesByKey,
        currentStepIndex < 0 ? 0 : currentStepIndex + 1
    );
    return targetStepIndex != null;
}

export function choiceTargetsCurrentProgressionStep(
    step: QuestProgressionStep,
    choice: QuestPathChoice,
    entriesByKey: Record<string, QuestExplorerEntry>
): boolean {
    const selection = selectionForChoice(step.stepKey, choice);
    return stepMatchesKeys(
        step,
        uniqueStrings([
            ...selectedChoiceTargetKeys(selection),
            ...selectedChoiceContinuationKeys(selection, entriesByKey),
        ]),
        entriesByKey
    );
}

export function hiddenStagedContinuationChoiceIds(
    step: QuestProgressionStep,
    choices: QuestPathChoice[],
    progression: QuestDetailProgression,
    entriesByKey: Record<string, QuestExplorerEntry>
): Set<string> {
    const grouped = choices.reduce((groups, choice) => {
        if (choice.sectionRole !== "continuation" || !choice.choiceGroupKey) return groups;
        const group = groups.get(choice.choiceGroupKey) ?? [];
        group.push(choice);
        groups.set(choice.choiceGroupKey, group);
        return groups;
    }, new Map<string, QuestPathChoice[]>());

    const hidden = new Set<string>();
    grouped.forEach((group) => {
        if (group.length <= 1) return;
        const currentStepChoices = group.filter((choice) => choiceTargetsCurrentProgressionStep(step, choice, entriesByKey));
        if (currentStepChoices.length > 0 && currentStepChoices.length < group.length) {
            const visibleIds = new Set(currentStepChoices.map((choice) => choice.id));
            group.forEach((choice) => {
                if (!visibleIds.has(choice.id)) hidden.add(choice.id);
            });
            return;
        }

        const inChapterChoices = group.filter((choice) => choiceTargetsLaterStepInCurrentChapter(step, choice, progression, entriesByKey));
        if (inChapterChoices.length === 0 || inChapterChoices.length === group.length) return;
        const visibleIds = new Set(inChapterChoices.map((choice) => choice.id));
        group.forEach((choice) => {
            if (!visibleIds.has(choice.id)) hidden.add(choice.id);
        });
    });

    return hidden;
}

export function visibilityDiagnosticsForChoices(
    rawChoices: QuestPathChoice[],
    prerequisiteEligibleChoices: QuestPathChoice[],
    displayEntry: QuestExplorerEntry | null,
    step: QuestProgressionStep,
    progression: QuestDetailProgression,
    entriesByKey: Record<string, QuestExplorerEntry>
): ChoiceVisibilityDiagnostics {
    const hiddenReasonsByChoiceId = new Map<string, NormalHiddenChoiceReason>();
    const prerequisiteEligibleIds = new Set(prerequisiteEligibleChoices.map((choice) => choice.id));
    rawChoices.forEach((choice) => {
        if (!prerequisiteEligibleIds.has(choice.id)) {
            hiddenReasonsByChoiceId.set(choice.id, {
                category: "prerequisite",
                message: choice.prerequisiteBranchKeys.length > 0
                    ? "prerequisite branch path not selected"
                    : "not eligible in normal mode",
            });
        }
    });

    const hiddenStagedContinuations = hiddenStagedContinuationChoiceIds(step, prerequisiteEligibleChoices, progression, entriesByKey);
    prerequisiteEligibleChoices.forEach((choice) => {
        const reason = hiddenNoLinkArtifactReason(choice, prerequisiteEligibleChoices)
            ?? (hiddenStagedContinuations.has(choice.id)
                ? { category: "continuation" as const, message: "later convergence row collapsed behind nearer continuation choice" }
                : null)
            ?? hiddenUngatedContinuationReason(choice)
            ?? hiddenUnresolvedReason(choice, displayEntry, progression);
        if (reason) hiddenReasonsByChoiceId.set(choice.id, reason);
    });

    const normalVisibleChoiceCount = prerequisiteEligibleChoices.filter((choice) => !hiddenReasonsByChoiceId.has(choice.id)).length;
    const hiddenEligibleChoices = prerequisiteEligibleChoices.filter((choice) => hiddenReasonsByChoiceId.has(choice.id));

    return {
        normalVisibleChoiceCount,
        debugVisibleChoiceCount: rawChoices.length,
        hiddenArtifactCount: hiddenEligibleChoices.filter((choice) => choice.sectionRole === "artifact").length,
        hiddenUnresolvedCount: hiddenEligibleChoices.filter((choice) => {
            const reason = hiddenReasonsByChoiceId.get(choice.id);
            return reason?.category === "unresolved" || choice.sectionRole === "unresolved";
        }).length,
        hiddenContinuationCount: hiddenEligibleChoices.filter((choice) => hiddenReasonsByChoiceId.get(choice.id)?.category === "continuation").length,
        hiddenReasonsByChoiceId,
    };
}

export function visibleChoicesForDiagnostics(
    choices: QuestPathChoice[],
    diagnostics: ChoiceVisibilityDiagnostics
): QuestPathChoice[] {
    return choices.filter((choice) => !diagnostics.hiddenReasonsByChoiceId.has(choice.id));
}

export function isContinuationForSelectedChoice(
    choice: QuestPathChoice,
    selectedChoice: QuestPathChoiceSelection,
    revealContext?: RevealContext
): boolean {
    if (choice.sectionRole !== "continuation") return false;
    if (!selectedChoice.branchKey) return false;
    if (choice.id === selectedChoice.choiceId) return false;
    if (choice.parentBranchKey === selectedChoice.branchKey || choice.prerequisiteBranchKeys.includes(selectedChoice.branchKey)) {
        return true;
    }
    if (!revealContext || !hasRevealMetadata(choice) || !revealMetadataSatisfied(choice, revealContext)) {
        return false;
    }
    if (
        choice.branchStepOrder != null
        && selectedChoice.branchStepOrder != null
        && choice.branchStepOrder <= selectedChoice.branchStepOrder
    ) {
        return false;
    }
    return true;
}

export function revealedContinuationChoices(
    choices: QuestPathChoice[],
    selectedChoice: QuestPathChoiceSelection | null,
    showRawHiddenRows: boolean,
    revealContext: RevealContext
): QuestPathChoice[] {
    if (showRawHiddenRows || !selectedChoice) {
        return [];
    }

    const continuations = continuationChoicesForSelectedChoice(choices, selectedChoice, revealContext);
    return continuations.length === 1 ? continuations : [];
}

export function continuationChoicesForSelectedChoice(
    choices: QuestPathChoice[],
    selectedChoice: QuestPathChoiceSelection | null,
    revealContext: RevealContext
): QuestPathChoice[] {
    if (!selectedChoice) return [];
    return choices.filter((choice) => isContinuationForSelectedChoice(choice, selectedChoice, revealContext));
}

export function nextStageContinuationChoicesForSelection(
    choices: QuestPathChoice[],
    selectedChoice: QuestPathChoiceSelection | null,
    revealContext: RevealContext
): QuestPathChoice[] {
    if (!selectedChoice?.branchKey) return [];

    const eligibleContinuations = choices.filter((choice) => (
        choice.sectionRole === "continuation"
        && choice.id !== selectedChoice.choiceId
        && choicePrerequisitesSatisfied(choice, revealContext)
    ));
    if (selectedChoice.branchStepOrder == null) {
        return eligibleContinuations.filter((choice) => isContinuationForSelectedChoice(choice, selectedChoice, revealContext));
    }

    const nextOrderedContinuations = eligibleContinuations.filter((choice) => (
        choice.branchStepOrder != null
        && choice.branchStepOrder > selectedChoice.branchStepOrder!
    ));
    if (nextOrderedContinuations.length === 0) {
        return eligibleContinuations.filter((choice) => isContinuationForSelectedChoice(choice, selectedChoice, revealContext));
    }

    const nextOrder = Math.min(...nextOrderedContinuations.map((choice) => choice.branchStepOrder ?? Number.MAX_SAFE_INTEGER));
    const nextStageChoices = nextOrderedContinuations.filter((choice) => choice.branchStepOrder === nextOrder);
    const unorderedDirectContinuations = eligibleContinuations.filter((choice) => (
        choice.branchStepOrder == null
        && isContinuationForSelectedChoice(choice, selectedChoice, revealContext)
    ));

    return uniqueChoicesById([...nextStageChoices, ...unorderedDirectContinuations]);
}

export function followUpStepIndexForContinuationChoices(
    steps: QuestProgressionStep[],
    sourceDetailEntryKey: string,
    continuations: QuestPathChoice[],
    entriesByKey: Record<string, QuestExplorerEntry>,
    startIndex: number
): number | null {
    const branchStepOrders = uniqueStrings(continuations.map((choice) => (
        choice.branchStepOrder != null ? String(choice.branchStepOrder) : null
    )))
        .map((value) => Number.parseInt(value, 10))
        .filter((value) => Number.isFinite(value));
    for (const branchStepOrder of branchStepOrders) {
        const stepIndex = stepIndexForBranchStepOrder(steps, sourceDetailEntryKey, branchStepOrder, startIndex);
        if (stepIndex != null) return stepIndex;
    }

    const targetKeys = uniqueStrings(continuations.flatMap((choice) => {
        const selection = selectionForChoice("", choice);
        return [
            ...selectedChoiceTargetKeys(selection),
            ...selectedChoiceContinuationKeys(selection, entriesByKey),
        ];
    }));
    return stepIndexForKeys(steps, targetKeys, entriesByKey, startIndex);
}

export function choicesScopedToCurrentBeat(
    choices: QuestPathChoice[],
    currentBeatChoice: QuestPathChoiceSelection | null,
    showRawHiddenRows: boolean,
    revealContext: RevealContext
): QuestPathChoice[] {
    if (showRawHiddenRows || !currentBeatChoice?.branchKey) return choices;

    const nextStageChoiceIds = new Set(
        nextStageContinuationChoicesForSelection(choices, currentBeatChoice, revealContext)
            .map((choice) => choice.id)
    );
    return choices.filter((choice) => (
        choice.id === currentBeatChoice.choiceId
        || nextStageChoiceIds.has(choice.id)
    ));
}

export function selectionsByStepKey(choicePath: QuestPathChoiceSelection[]): Map<string, QuestPathChoiceSelection[]> {
    const byStep = new Map<string, QuestPathChoiceSelection[]>();
    choicePath.forEach((selection) => {
        const selections = byStep.get(selection.stepKey) ?? [];
        selections.push(selection);
        byStep.set(selection.stepKey, selections);
    });
    byStep.forEach((selections) => {
        selections.sort((left, right) => selectionBranchOrder(left) - selectionBranchOrder(right));
    });
    return byStep;
}

export function activeContinuationChoicesForSelection(
    choices: QuestPathChoice[],
    selection: QuestPathChoiceSelection | null,
    revealContext: RevealContext
): QuestPathChoice[] {
    if (!selection) return [];
    return nextStageContinuationChoicesForSelection(choices, selection, revealContext)
        .filter((choice) => (
            choice.hasDependentContinuations
            || (
                choice.sectionRole === "continuation"
                && choice.prerequisiteBranchKeys.length > 0
                && !hasModeledChoiceContinuation(choice)
            )
        )
    );
}

export function choiceMatchesSelectionKey(choice: QuestPathChoice, selection: QuestPathChoiceSelection): boolean {
    return choice.id === selection.choiceId
        || Boolean(selection.branchKey && choice.branchKey === selection.branchKey)
        || Boolean(selection.choiceKey && choice.choiceKey === selection.choiceKey);
}

export function uniqueChoicesById(choices: QuestPathChoice[]): QuestPathChoice[] {
    const seen = new Set<string>();
    return choices.filter((choice) => {
        if (seen.has(choice.id)) return false;
        seen.add(choice.id);
        return true;
    });
}

export function passiveSetupAdvance(
    step: QuestProgressionStep,
    stepIndex: number,
    choices: QuestPathChoice[],
    rawChoices: QuestPathChoice[],
    steps: QuestProgressionStep[],
    entriesByKey: Record<string, QuestExplorerEntry>,
    revealContext: RevealContext
): { selection: QuestPathChoiceSelection; followUpStepIndex: number } | null {
    const candidates = choices.filter((choice) => (
        choice.sectionRole === "artifact"
        && choice.branchKey
        && choice.hasDependentContinuations
    ));
    if (candidates.length !== 1 || choices.length !== 1) return null;

    const candidate = candidates[0];
    const selection = passiveSelectionForChoice(step.stepKey, candidate);
    const passiveRevealContext = cloneRevealContext(revealContext);
    addSelectionToRevealContext(passiveRevealContext, selection);
    const revealEligibleChoices = rawChoices.filter((choice) => choicePrerequisitesSatisfied(choice, passiveRevealContext));
    const continuations = continuationChoicesForSelectedChoice(revealEligibleChoices, selection, passiveRevealContext);
    if (continuations.length === 0) return null;

    const followUpStepIndex = followUpStepIndexForContinuationChoices(
        steps,
        step.detailEntryKey,
        continuations,
        entriesByKey,
        stepIndex + 1
    );

    return followUpStepIndex == null ? null : { selection, followUpStepIndex };
}

export type PassiveDeterministicChapterExit = {
    choices: QuestPathChoice[];
    selection: QuestPathChoiceSelection;
    revealContext: RevealContext;
    targetEntryKey: string;
};

export function passiveDeterministicChapterExit(
    step: QuestProgressionStep,
    choices: QuestPathChoice[],
    rawChoices: QuestPathChoice[],
    progression: QuestDetailProgression,
    fullProgression: QuestExplorerProgression | null,
    revealContext: RevealContext
): PassiveDeterministicChapterExit | null {
    if (progression.chapter.steps.length !== 1) return null;

    const nextLocation = nextProgressionChapterLocation(progression, fullProgression);
    const targetEntryKey = nextLocation?.step.detailEntryKey ?? null;
    if (!targetEntryKey) return null;

    const consumedChoices: QuestPathChoice[] = [];
    const consumedIds = new Set<string>();
    const passiveRevealContext = cloneRevealContext(revealContext);
    let latestSelection: QuestPathChoiceSelection | null = null;

    while (true) {
        const candidatePool = consumedChoices.length === 0
            ? choices
            : rawChoices.filter((choice) => choicePrerequisitesSatisfied(choice, passiveRevealContext));
        const candidates = candidatePool
            .filter((choice) => !consumedIds.has(choice.id))
            .filter(isPassiveDeterministicNoLinkChoice)
            .filter((choice) => isNextPassiveChainChoice(choice, latestSelection))
            .sort((left, right) => (left.branchStepOrder ?? 0) - (right.branchStepOrder ?? 0));

        if (candidates.length === 0) break;
        if (candidates.length > 1) return null;

        const choice = candidates[0];
        const selection = passiveSelectionForChoice(step.stepKey, choice);
        consumedChoices.push(choice);
        consumedIds.add(choice.id);
        addSelectionToRevealContext(passiveRevealContext, selection);
        latestSelection = selection;
    }

    if (consumedChoices.length <= 1 || !latestSelection) return null;

    return {
        choices: consumedChoices,
        selection: latestSelection,
        revealContext: passiveRevealContext,
        targetEntryKey,
    };
}

export function isPassiveDeterministicNoLinkChoice(choice: QuestPathChoice): boolean {
    return Boolean(
        choice.branchKey
        && choice.branchStepOrder != null
        && choiceHasNoExplicitLink(choice)
        && choice.failureEntryKeys.length === 0
        && choice.convergesIntoEntryKeys.length === 0
        && (choice.sectionRole === "artifact" || choice.sectionRole === "continuation")
    );
}

export function isNextPassiveChainChoice(
    choice: QuestPathChoice,
    latestSelection: QuestPathChoiceSelection | null
): boolean {
    if (!latestSelection) return true;
    if (!latestSelection.branchKey) return false;
    return choice.parentBranchKey === latestSelection.branchKey
        || choice.prerequisiteBranchKeys.includes(latestSelection.branchKey);
}

export function diagnosticsWithPassiveChain(
    diagnostics: ChoiceVisibilityDiagnostics,
    choices: QuestPathChoice[]
): ChoiceVisibilityDiagnostics {
    const hiddenReasonsByChoiceId = new Map(diagnostics.hiddenReasonsByChoiceId);
    let newlyHidden = 0;
    let newlyHiddenArtifacts = 0;
    let newlyHiddenContinuations = 0;

    choices.forEach((choice) => {
        if (!hiddenReasonsByChoiceId.has(choice.id)) {
            newlyHidden += 1;
            if (choice.sectionRole === "artifact") newlyHiddenArtifacts += 1;
            if (choice.sectionRole === "continuation") newlyHiddenContinuations += 1;
        }
        hiddenReasonsByChoiceId.set(choice.id, {
            category: choice.sectionRole === "artifact" ? "artifact" : "continuation",
            message: "passive deterministic tutorial chain before next chapter",
        });
    });

    return {
        ...diagnostics,
        normalVisibleChoiceCount: Math.max(0, diagnostics.normalVisibleChoiceCount - newlyHidden),
        hiddenArtifactCount: diagnostics.hiddenArtifactCount + newlyHiddenArtifacts,
        hiddenContinuationCount: diagnostics.hiddenContinuationCount + newlyHiddenContinuations,
        hiddenReasonsByChoiceId,
    };
}
