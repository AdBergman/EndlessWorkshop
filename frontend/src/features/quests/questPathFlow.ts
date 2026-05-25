import type {
    QuestBranch,
    QuestExplorerEntry,
    QuestExplorerProgression,
    QuestProgressionChapter,
    QuestProgressionQuestline,
    QuestProgressionStep,
    QuestProgressionVariant,
} from "@/types/questTypes";
import { getQuestCategoryKey } from "@/features/quests/questCategories";
import {
    chapterPositionLabel,
    stepPositionLabel,
} from "@/features/quests/questDisplay";

export type QuestDetailProgression = {
    questline: QuestProgressionQuestline;
    chapter: QuestProgressionChapter;
    activeStepKeys: Set<string>;
    activeVariantEntryKeys: Set<string>;
    focusedStepIndex: number;
};

export type QuestProgressionLocation = {
    questline: QuestProgressionQuestline;
    chapter: QuestProgressionChapter;
    step: QuestProgressionStep;
    stepIndex: number;
};

export type QuestPathChoice = {
    id: string;
    branchKey: string | null;
    choiceKey: string | null;
    label: string;
    eyebrow: string;
    groupKey: string | null;
    groupLabel: string | null;
    sourceEntryKey: string | null;
    sectionRole: string | null;
    prerequisiteBranchKeys: string[];
    revealedByBranchKeys: string[];
    revealedByChoiceKeys: string[];
    revealedByBranchPathAlternatives: string[][];
    parentBranchKey: string | null;
    parentChoiceKey: string | null;
    choiceGroupKey: string | null;
    convergenceGroupKey: string | null;
    branchStepOrder: number | null;
    hasDependentContinuations: boolean;
    descriptionLines: string[];
    strategyLines: string[];
    loreLines: string[];
    requirementLines: string[];
    rewardLines: string[];
    targetEntryKey: string | null;
    targetSummaryLine: string | null;
    continuationTitle: string | null;
    nextEntryKeys: string[];
    failureEntryKeys: string[];
    convergesIntoEntryKeys: string[];
    accent: "gold" | "teal";
};

export type QuestPathChoiceSelection = {
    stepKey: string;
    choiceId: string;
    branchKey: string | null;
    choiceKey: string | null;
    sectionRole: string | null;
    choiceGroupKey: string | null;
    branchStepOrder: number | null;
    hasDependentContinuations: boolean;
    label: string;
    targetEntryKey: string | null;
    nextEntryKeys: string[];
};

export type LoreChoicePathsByContext = Record<string, QuestPathChoiceSelection[]>;

export type NormalHiddenChoiceCategory = "artifact" | "unresolved" | "continuation" | "prerequisite";

export type NormalHiddenChoiceReason = {
    category: NormalHiddenChoiceCategory;
    message: string;
};

export type ChoiceVisibilityDiagnostics = {
    normalVisibleChoiceCount: number;
    debugVisibleChoiceCount: number;
    hiddenArtifactCount: number;
    hiddenUnresolvedCount: number;
    hiddenContinuationCount: number;
    hiddenReasonsByChoiceId: Map<string, NormalHiddenChoiceReason>;
};

export type RevealContext = {
    branchKeys: Set<string>;
    choiceKeys: Set<string>;
    branchPath: string[];
};

export type RenderedPathStep = {
    step: QuestProgressionStep;
    stepIndex: number;
    displayEntry: QuestExplorerEntry | null;
    choices: QuestPathChoice[];
    revealedContinuations: QuestPathChoice[];
    currentBeatChoice: QuestPathChoiceSelection | null;
    selectedChoice: QuestPathChoiceSelection | null;
    choiceDiagnostics: ChoiceVisibilityDiagnostics;
    isActive: boolean;
    repeatsDetailEntry: boolean;
    rendersRepeatedDetailContent: boolean;
    revealedContinuationsBecomeSteps: boolean;
    revealContext: RevealContext;
};

export type QuestPathFlow = {
    renderedSteps: RenderedPathStep[];
    unresolvedContinuation: QuestPathChoiceSelection | null;
    reachedContinuationEntryKey: string | null;
};

export type QuestPathFlowOptions = {
    focusedStepIndex: number;
    showRawHiddenRows: boolean;
};

export const LORE_CHRONICLE_SEGMENT_CAP = 10;

export type LoreChronicleSegment = {
    segmentKey: string;
    contextKey: string;
    railEntryKey: string | null;
    progression: QuestDetailProgression;
    flow: QuestPathFlow;
    isSelectedContext: boolean;
};

export type LoreChronicleStream = {
    segments: LoreChronicleSegment[];
    selectedContextKey: string | null;
};

export const EMPTY_CHOICE_PATH: QuestPathChoiceSelection[] = [];

export function normalizedKind(value: string): string {
    return value.trim().toLowerCase();
}

export function entryIdentityKeys(entry: QuestExplorerEntry): string[] {
    return [entry.entryKey, ...entry.aliases].filter(Boolean);
}

export function stepIdentityKeys(step: QuestProgressionStep): string[] {
    return [
        step.detailEntryKey,
        ...step.sourceEntryKeys,
        ...step.aliasEntryKeys,
        ...step.variants.map((variant) => variant.entryKey),
    ].filter(Boolean);
}

export function visibleStepVariants(step: QuestProgressionStep): QuestProgressionVariant[] {
    const seen = new Set<string>();
    return step.variants.filter((variant) => {
        if (!variant.entryKey || seen.has(variant.entryKey)) return false;
        seen.add(variant.entryKey);
        return normalizedKind(variant.variantKind) === "branch_variant";
    });
}

export function findDetailProgression(
    progression: QuestExplorerProgression | null,
    selectedEntry: QuestExplorerEntry | null,
    requestedEntryKey: string | null
): QuestDetailProgression | null {
    if (!progression || !selectedEntry) return null;

    const selectedIdentityKeys = new Set(uniqueStrings([requestedEntryKey, ...entryIdentityKeys(selectedEntry)]));

    for (const questline of progression.questlines) {
        for (const chapter of questline.chapters) {
            const activeStepKeys = new Set<string>();
            const activeVariantEntryKeys = new Set<string>();
            let focusedStepIndex = -1;
            let focusedStepScore = 0;

            for (const [stepIndex, step] of chapter.steps.entries()) {
                if (stepIdentityKeys(step).some((key) => selectedIdentityKeys.has(key))) {
                    activeStepKeys.add(step.stepKey);
                }
                for (const variant of step.variants) {
                    if (normalizedKind(variant.variantKind) === "branch_variant" && selectedIdentityKeys.has(variant.entryKey)) {
                        activeVariantEntryKeys.add(variant.entryKey);
                    }
                }

                const score = focusedStepScoreForSelection(step, selectedEntry, requestedEntryKey);
                if (score > focusedStepScore) {
                    focusedStepScore = score;
                    focusedStepIndex = stepIndex;
                }
            }

            if (activeStepKeys.size > 0) {
                return {
                    questline,
                    chapter,
                    activeStepKeys,
                    activeVariantEntryKeys,
                    focusedStepIndex: focusedStepIndex >= 0 ? focusedStepIndex : 0,
                };
            }
        }
    }

    return null;
}

export function focusedStepScoreForSelection(
    step: QuestProgressionStep,
    selectedEntry: QuestExplorerEntry,
    requestedEntryKey: string | null
): number {
    const selectedEntryKey = selectedEntry.entryKey;
    const selectedAliases = new Set(selectedEntry.aliases);
    const selectedIdentityKeys = new Set(entryIdentityKeys(selectedEntry));

    if (requestedEntryKey) {
        if (step.aliasEntryKeys.includes(requestedEntryKey)) return 100;
        if (step.variants.some((variant) => (
            variant.entryKey === requestedEntryKey && normalizedKind(variant.variantKind) === "branch_variant"
        ))) {
            return 95;
        }
        if (step.detailEntryKey === requestedEntryKey) return 90;
        if (step.sourceEntryKeys.includes(requestedEntryKey)) return 80;
        if (step.variants.some((variant) => variant.entryKey === requestedEntryKey)) return 75;
    }

    if (step.detailEntryKey === selectedEntryKey) return 60;
    if (step.variants.some((variant) => (
        variant.entryKey === selectedEntryKey && normalizedKind(variant.variantKind) === "branch_variant"
    ))) {
        return 55;
    }
    if (step.sourceEntryKeys.includes(selectedEntryKey)) return 50;
    if (step.aliasEntryKeys.some((key) => selectedAliases.has(key))) return 45;
    if (stepIdentityKeys(step).some((key) => selectedIdentityKeys.has(key))) return 10;

    return 0;
}

export function uniqueStrings(values: Array<string | null | undefined>): string[] {
    return [...new Set(values.filter((value): value is string => Boolean(value)))];
}

export function branchTargetKeys(branch: QuestBranch): string[] {
    return uniqueStrings([
        ...branch.nextEntryKeys,
        ...branch.failureEntryKeys,
        ...branch.convergesIntoEntryKeys,
    ]);
}

export function branchRole(branch: QuestBranch): string | null {
    return branch.sectionRole?.trim().toLowerCase() || null;
}

export function isContinuationBranch(branch: QuestBranch): boolean {
    return branchRole(branch) === "continuation";
}

export function branchPrerequisiteKeys(branch: QuestBranch): string[] {
    return (branch.prerequisiteBranchKeys ?? []).filter(Boolean);
}

export function hasRevealMetadata(owner: {
    revealedByBranchKeys?: string[];
    revealedByChoiceKeys?: string[];
    revealedByBranchPathAlternatives?: string[][];
}): boolean {
    return Boolean(
        owner.revealedByBranchKeys?.length
        || owner.revealedByChoiceKeys?.length
        || owner.revealedByBranchPathAlternatives?.length
    );
}

export function revealMetadataSatisfied(
    owner: {
        revealedByBranchKeys?: string[];
        revealedByChoiceKeys?: string[];
        revealedByBranchPathAlternatives?: string[][];
    },
    context: RevealContext
): boolean {
    const branchKeys = owner.revealedByBranchKeys ?? [];
    if (branchKeys.some((branchKey) => context.branchKeys.has(branchKey))) return true;

    const choiceKeys = owner.revealedByChoiceKeys ?? [];
    if (choiceKeys.some((choiceKey) => context.choiceKeys.has(choiceKey))) return true;

    return (owner.revealedByBranchPathAlternatives ?? []).some((path) => (
        path.length > 0 && path.every((branchKey) => context.branchKeys.has(branchKey))
    ));
}

export function revealVisible(
    owner: {
        revealedByBranchKeys?: string[];
        revealedByChoiceKeys?: string[];
        revealedByBranchPathAlternatives?: string[][];
    },
    context: RevealContext
): boolean {
    return !hasRevealMetadata(owner) || revealMetadataSatisfied(owner, context);
}

export function choicePrerequisitesSatisfied(choice: QuestPathChoice, revealContext: RevealContext): boolean {
    const prerequisitesSatisfied = choice.prerequisiteBranchKeys.length === 0
        || choice.prerequisiteBranchKeys.every((branchKey) => revealContext.branchKeys.has(branchKey));

    return prerequisitesSatisfied || (
        hasRevealMetadata(choice) && revealMetadataSatisfied(choice, revealContext)
    );
}

export function dependentContinuationBranches(branch: QuestBranch, branches: QuestBranch[]): QuestBranch[] {
    return branches.filter((candidate) => (
        candidate.branchKey !== branch.branchKey
        && isContinuationBranch(candidate)
        && (
            candidate.parentBranchKey === branch.branchKey
            || branchPrerequisiteKeys(candidate).includes(branch.branchKey)
        )
    ));
}

export function cloneRevealContext(context: RevealContext): RevealContext {
    return {
        branchKeys: new Set(context.branchKeys),
        choiceKeys: new Set(context.choiceKeys),
        branchPath: [...context.branchPath],
    };
}

export function addSelectionToRevealContext(context: RevealContext, selection: QuestPathChoiceSelection | null): void {
    if (!selection) return;
    if (selection.branchKey) {
        context.branchKeys.add(selection.branchKey);
        if (!context.branchPath.includes(selection.branchKey)) {
            context.branchPath.push(selection.branchKey);
        }
    }
    if (selection.choiceKey) {
        context.choiceKeys.add(selection.choiceKey);
    }
}

export function variantTargetKeys(variant: QuestProgressionVariant): string[] {
    return uniqueStrings([
        ...variant.nextEntryKeys,
        ...variant.failureEntryKeys,
        ...variant.convergesIntoEntryKeys,
    ]);
}

export function continuationKeys(entry: QuestExplorerEntry | null): string[] {
    if (!entry) return [];
    return uniqueStrings([
        ...entry.navigation.nextEntryKeys,
        ...entry.navigation.failureEntryKeys,
        ...entry.navigation.convergesIntoEntryKeys,
    ]);
}

export function entryKeysWithAliases(entryKey: string | null | undefined, entriesByKey: Record<string, QuestExplorerEntry>): string[] {
    if (!entryKey) return [];
    const entry = entriesByKey[entryKey];
    return entry ? entryIdentityKeys(entry) : [entryKey];
}

export function knownEntryKey(keys: string[], entriesByKey: Record<string, QuestExplorerEntry>): string | null {
    return keys.find((key) => Boolean(entriesByKey[key])) ?? null;
}

export function stepMatchesKeys(
    step: QuestProgressionStep,
    keys: string[],
    entriesByKey: Record<string, QuestExplorerEntry>
): boolean {
    const identities = new Set(keys.flatMap((key) => entryKeysWithAliases(key, entriesByKey)));
    return stepIdentityKeys(step).some((key) => identities.has(key));
}

export function stepIndexForKeys(
    steps: QuestProgressionStep[],
    keys: string[],
    entriesByKey: Record<string, QuestExplorerEntry>,
    startIndex = 0
): number | null {
    if (keys.length === 0) return null;
    const index = steps.findIndex((step, candidateIndex) => (
        candidateIndex >= startIndex && stepMatchesKeys(step, keys, entriesByKey)
    ));
    return index >= 0 ? index : null;
}

export function progressionLocationForKeys(
    progression: QuestExplorerProgression | null,
    keys: string[],
    entriesByKey: Record<string, QuestExplorerEntry>
): QuestProgressionLocation | null {
    if (!progression || keys.length === 0) return null;

    for (const questline of progression.questlines) {
        for (const chapter of questline.chapters) {
            const stepIndex = stepIndexForKeys(chapter.steps, keys, entriesByKey);
            if (stepIndex != null) {
                return { questline, chapter, step: chapter.steps[stepIndex], stepIndex };
            }
        }
    }

    return null;
}

export function progressionContextKey(progression: QuestDetailProgression | null, fallback: string | null): string {
    if (!progression) return fallback ?? "none";
    return [
        progression.questline.questLineFamilyKey ?? progression.questline.questLineKey ?? "questline",
        progression.questline.factionFamilyKey ?? progression.questline.factionKey ?? "faction",
        progression.chapter.chapterOrder ?? progression.chapter.chapterNumber ?? "chapter",
        progression.chapter.steps.map((step) => step.stepKey || step.detailEntryKey).join("|"),
    ].join(":");
}

export function railEntryKeyForProgression(progression: QuestDetailProgression, entriesByKey: Record<string, QuestExplorerEntry>): string | null {
    const firstDetailEntryKey = progression.chapter.steps[0]?.detailEntryKey ?? null;
    return firstDetailEntryKey ? entriesByKey[firstDetailEntryKey]?.entryKey ?? firstDetailEntryKey : null;
}

export function isSameProgressionChapter(
    left: QuestDetailProgression,
    right: QuestProgressionLocation
): boolean {
    return (
        (left.questline.questLineFamilyKey ?? left.questline.questLineKey) === (right.questline.questLineFamilyKey ?? right.questline.questLineKey)
        && (left.questline.factionFamilyKey ?? left.questline.factionKey) === (right.questline.factionFamilyKey ?? right.questline.factionKey)
        && (left.chapter.chapterOrder ?? left.chapter.chapterNumber ?? left.chapter.title) === (right.chapter.chapterOrder ?? right.chapter.chapterNumber ?? right.chapter.title)
    );
}

export function detailEntryCounts(chapter: QuestProgressionChapter): Map<string, number> {
    return chapter.steps.reduce((counts, step) => {
        counts.set(step.detailEntryKey, (counts.get(step.detailEntryKey) ?? 0) + 1);
        return counts;
    }, new Map<string, number>());
}

export function branchStepOrderForProgressionStep(step: QuestProgressionStep, stepIndex: number): number | null {
    const value = [step.stepNumber, step.stepOrder, stepIndex + 1]
        .find((candidate) => candidate != null && Number.isFinite(candidate) && candidate > 0);
    return value ?? null;
}

export function detailEntryOccurrenceOrder(
    steps: QuestProgressionStep[],
    detailEntryKey: string,
    stepIndex: number
): number {
    return steps.slice(0, stepIndex + 1)
        .filter((step) => step.detailEntryKey === detailEntryKey)
        .length;
}

export function stepIndexForBranchStepOrder(
    steps: QuestProgressionStep[],
    detailEntryKey: string,
    branchStepOrder: number | null,
    startIndex = 0
): number | null {
    if (branchStepOrder == null) return null;

    const index = steps.findIndex((candidate, candidateIndex) => (
        candidateIndex >= startIndex
        && candidate.detailEntryKey === detailEntryKey
        && (
            branchStepOrderForProgressionStep(candidate, candidateIndex) === branchStepOrder
            || detailEntryOccurrenceOrder(steps, detailEntryKey, candidateIndex) === branchStepOrder
        )
    ));

    return index >= 0 ? index : null;
}

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
            rewardLines: [],
            targetEntryKey: target?.entryKey ?? knownEntryKey(explicitTargets, entriesByKey),
            targetSummaryLine: targetSummary,
            continuationTitle: target?.title ?? null,
            nextEntryKeys: uniqueStrings([variant.entryKey, ...explicitTargets]),
            failureEntryKeys: variant.failureEntryKeys,
            convergesIntoEntryKeys: variant.convergesIntoEntryKeys,
            accent: "teal",
        };
    }) : [];

    const branchChoices = [...(detailEntry?.branches ?? [])]
        .sort((left, right) => (left.orderIndex ?? Number.MAX_SAFE_INTEGER) - (right.orderIndex ?? Number.MAX_SAFE_INTEGER))
        .map((branch): QuestPathChoice => {
            const explicitTargets = branchTargetKeys(branch);
            const targetEntryKey = knownEntryKey(explicitTargets, entriesByKey);
            const target = targetEntryKey ? entriesByKey[targetEntryKey] : null;
            const dependentContinuations = dependentContinuationBranches(branch, detailEntry?.branches ?? []);
            const loreLines = choiceDescription([
                ...(branch.lore?.outcomePreviewLines ?? []),
                target?.summaryLines[0],
            ], target?.title ?? null);
            const strategyLines = choiceDescription([
                ...(branch.strategy?.conditions ?? []),
                target?.summaryLines[0],
            ], target?.title ?? null);
            const requirementLines = (branch.strategy?.requirements ?? []).map((requirement) => requirement.displayText);
            const rewardLines = (branch.strategy?.rewards ?? []).map((reward) => reward.displayText);
            const repeatedEntryTitle = branch.label && detailEntry?.title && branch.label === detailEntry.title;

            return {
                id: `branch:${branch.branchKey}`,
                branchKey: branch.branchKey,
                choiceKey: branch.choiceKey,
                label: repeatedEntryTitle ? strategyLines[0] ?? target?.title ?? branch.label ?? "Choice" : branch.label || target?.title || "Choice",
                eyebrow: branch.groupLabel || "Choice",
                groupKey: branch.groupKey,
                groupLabel: branch.groupLabel,
                sourceEntryKey: detailEntry?.entryKey ?? null,
                sectionRole: branchRole(branch),
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
                rewardLines,
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
        choiceGroupKey: choice.choiceGroupKey,
        branchStepOrder: choice.branchStepOrder,
        hasDependentContinuations: choice.hasDependentContinuations,
        label: choice.label,
        targetEntryKey: choice.targetEntryKey,
        nextEntryKeys: choice.nextEntryKeys,
    };
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
    const hidden = isMainFactionEntry(displayEntry)
        && !isTerminalChoiceChapter(progression)
        && !hasModeledChoiceContinuation(choice);

    return hidden
        ? { category: "unresolved", message: "no modeled continuation before final chapter" }
        : null;
}

export function hiddenUngatedContinuationReason(choice: QuestPathChoice): NormalHiddenChoiceReason | null {
    return choice.sectionRole === "continuation" && choice.prerequisiteBranchKeys.length === 0
        ? { category: "continuation", message: "continuation row waits for a selected path" }
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

    return choices.filter((choice) => (
        choice.id === currentBeatChoice.choiceId
        || isContinuationForSelectedChoice(choice, currentBeatChoice, revealContext)
    ));
}

export function buildQuestPathFlow(
    progression: QuestDetailProgression,
    entriesByKey: Record<string, QuestExplorerEntry>,
    choicePath: QuestPathChoiceSelection[],
    fullProgression: QuestExplorerProgression | null,
    options: QuestPathFlowOptions
): QuestPathFlow {
    const steps = progression.chapter.steps;
    const selectedByStep = new Map(choicePath.map((selection) => [selection.stepKey, selection]));
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
        const stepRevealContext = cloneRevealContext(revealContext);
        const overrideEntryKey = displayEntryOverrides.get(step.stepKey);
        const displayEntry = (overrideEntryKey ? entriesByKey[overrideEntryKey] : null)
            ?? entriesByKey[step.detailEntryKey]
            ?? null;
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
        const rawChoices = choicesScopedToCurrentBeat(unscopedRawChoices, currentBeatChoice, options.showRawHiddenRows, stepRevealContext);
        const prerequisiteEligibleChoices = rawChoices.filter((choice) => choicePrerequisitesSatisfied(choice, stepRevealContext));
        let choiceDiagnostics = visibilityDiagnosticsForChoices(
            rawChoices,
            prerequisiteEligibleChoices,
            displayEntry,
            step,
            progression,
            entriesByKey
        );
        const choices = options.showRawHiddenRows
            ? rawChoices
            : visibleChoicesForDiagnostics(prerequisiteEligibleChoices, choiceDiagnostics);
        const storedSelection = selectedByStep.get(step.stepKey);
        const storedChoice = storedSelection
            ? choices.find((choice) => choice.id === storedSelection.choiceId) ?? null
            : null;
        const selectedChoice = storedSelection
            ? storedChoice ? selectionForChoice(step.stepKey, storedChoice) : null
            : implicitActiveChoice(choices, progression.activeVariantEntryKeys);
        const revealParentChoice = selectedChoice ?? currentBeatChoice;
        const revealParentContext = cloneRevealContext(stepRevealContext);
        addSelectionToRevealContext(revealParentContext, revealParentChoice);
        const revealEligibleChoices = rawChoices.filter((choice) => choicePrerequisitesSatisfied(choice, revealParentContext));
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
        const revealedContinuationsBecomeSteps = revealedContinuations.some((choice) => (
            stepIndexForBranchStepOrder(steps, step.detailEntryKey, choice.branchStepOrder, index + 1) != null
        ));
        const revealedContinuationIds = new Set(revealedContinuations.map((choice) => choice.id));
        const currentBeatChoiceId = currentBeatChoice?.choiceId ?? null;
        const actionableChoices = choices.filter((choice) => (
            !revealedContinuationIds.has(choice.id)
            && choice.id !== currentBeatChoiceId
        ));

        renderedSteps.push({
            step,
            stepIndex: index,
            displayEntry,
            choices: actionableChoices,
            revealedContinuations,
            currentBeatChoice,
            selectedChoice,
            choiceDiagnostics,
            isActive: progression.activeStepKeys.has(step.stepKey),
            repeatsDetailEntry,
            rendersRepeatedDetailContent,
            revealedContinuationsBecomeSteps,
            revealContext: stepRevealContext,
        });

        if (!rendersRepeatedDetailContent) {
            renderedDetailKeys.add(step.detailEntryKey);
        }

        const lockCandidateChoiceCount = options.showRawHiddenRows ? rawChoices.length : prerequisiteEligibleChoices.length;
        const visiblePathChoiceCount = actionableChoices.length + revealedContinuations.length;
        if (lockCandidateChoiceCount > 0 && visiblePathChoiceCount === 0) {
            if (index < visibleUntil && progression.activeVariantEntryKeys.size > 0) {
                continue;
            }
            break;
        }

        if (visiblePathChoiceCount > 0) {
            const revealedContinuation = revealedContinuations[0] ?? null;
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

            const continuationStepIndex = stepIndexForKeys(
                steps,
                selectedChoiceContinuationKeys(advancingChoice, entriesByKey),
                entriesByKey,
                index + 1
            );
            if (continuationStepIndex != null) {
                visibleUntil = Math.max(visibleUntil, continuationStepIndex);
                continue;
            }

            const nextLocation = progressionLocationForKeys(fullProgression, selectedChoiceContinuationKeys(advancingChoice, entriesByKey), entriesByKey)
                ?? progressionLocationForKeys(fullProgression, targetKeys, entriesByKey);
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

            const continuationStepIndex = stepIndexForKeys(
                steps,
                selectedChoiceContinuationKeys(currentBeatChoice, entriesByKey),
                entriesByKey,
                index + 1
            );
            if (continuationStepIndex != null) {
                visibleUntil = Math.max(visibleUntil, continuationStepIndex);
                continue;
            }

            const nextLocation = progressionLocationForKeys(fullProgression, selectedChoiceContinuationKeys(currentBeatChoice, entriesByKey), entriesByKey)
                ?? progressionLocationForKeys(fullProgression, targetKeys, entriesByKey);
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
    let currentEntryKey: string | null = railEntryKeyForProgression(selectedProgression, entriesByKey);

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
        currentEntryKey = reachedEntryKey;

        if (!currentProgression || !currentContextKey || !currentEntryKey) break;
    }

    return { segments, selectedContextKey };
}
