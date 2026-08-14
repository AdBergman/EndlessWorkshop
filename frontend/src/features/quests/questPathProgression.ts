import type {
    LoreSection,
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
import type {
    QuestDetailProgression,
    QuestPathChoice,
    QuestPathChoiceSelection,
    QuestProgressionLocation,
    RevealContext,
} from "./questPathFlowTypes";

const NECROPHAGE_CH6_ENTRY_KEYS = new Set([
    "FactionQuest_Necrophage_Chapter06_Step01",
    "FactionQuest_Necrophage02_Chapter06_Step01",
    "Quest_Necro_Ch6",
]);

const NECROPHAGE_CH6_FINAL_CHOICE_LABELS = new Set([
    "Release Kazra",
    "Rehabilitate Kazra",
    "Execute Kazra",
]);

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

export function isNecrophageCh6Entry(entryKey: string | null | undefined): boolean {
    return Boolean(entryKey && NECROPHAGE_CH6_ENTRY_KEYS.has(entryKey));
}

export function isNecrophageCh6Choice(choice: Pick<QuestPathChoice, "sourceEntryKey" | "label">): boolean {
    return isNecrophageCh6Entry(choice.sourceEntryKey)
        && (
            choice.label === "Enhance Hero"
            || choice.label === "Save Girl"
            || NECROPHAGE_CH6_FINAL_CHOICE_LABELS.has(choice.label)
        );
}

export function isNecrophageCh6FinalChoice(choice: Pick<QuestPathChoice, "sourceEntryKey" | "label">): boolean {
    return isNecrophageCh6Entry(choice.sourceEntryKey)
        && NECROPHAGE_CH6_FINAL_CHOICE_LABELS.has(choice.label);
}

export function branchByLabel(branches: QuestBranch[], label: string): QuestBranch | null {
    return branches.find((branch) => branch.label === label) ?? null;
}

export function normalizeNecrophageCh6Branch(
    branch: QuestBranch,
    entry: QuestExplorerEntry,
    saveBranch: QuestBranch
): QuestBranch {
    if (!NECROPHAGE_CH6_FINAL_CHOICE_LABELS.has(branch.label)) return branch;

    const prerequisiteBranchKeys = uniqueStrings([
        ...branchPrerequisiteKeys(saveBranch),
        saveBranch.branchKey,
    ]);
    const branchStepOrder = branch.branchStepOrder ?? 4;

    return {
        ...branch,
        parentBranchKey: saveBranch.branchKey,
        parentChoiceKey: saveBranch.choiceKey,
        prerequisiteBranchKeys,
        prerequisiteBranchPath: prerequisiteBranchKeys,
        revealedByBranchKeys: uniqueStrings([
            ...(branch.revealedByBranchKeys ?? []),
            saveBranch.branchKey,
        ]),
        choiceGroupKey: `${entry.entryKey}:choice-group:step:${branchStepOrder}:after:${saveBranch.branchKey}`,
    };
}

export function isNecrophageCh6SecondChoicePrompt(section: LoreSection): boolean {
    if (section.choiceKey) return false;
    const lineTexts = new Set(section.lines.map((line) => line.text));
    return [...NECROPHAGE_CH6_FINAL_CHOICE_LABELS].every((label) => lineTexts.has(label));
}

export function normalizeNecrophageCh6LoreSection(section: LoreSection, saveBranch: QuestBranch): LoreSection {
    if (!saveBranch.choiceKey || !isNecrophageCh6SecondChoicePrompt(section)) return section;

    return {
        ...section,
        choiceKey: saveBranch.choiceKey,
        revealedByChoiceKeys: uniqueStrings([
            ...(section.revealedByChoiceKeys ?? []),
            saveBranch.choiceKey,
        ]),
    };
}

export function normalizeQuestExplorerEntryForPathFlow(entry: QuestExplorerEntry): QuestExplorerEntry {
    if (!isNecrophageCh6Entry(entry.entryKey)) return entry;

    const saveBranch = branchByLabel(entry.branches, "Save Girl");
    if (!saveBranch?.branchKey) return entry;

    const branches = entry.branches.map((branch) => normalizeNecrophageCh6Branch(branch, entry, saveBranch));
    const sections = entry.loreView.sections.map((section) => normalizeNecrophageCh6LoreSection(section, saveBranch));

    return {
        ...entry,
        loreView: {
            ...entry.loreView,
            sections,
        },
        branches,
    };
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

export function progressionLocationOutsideCurrentChapterForKeys(
    progression: QuestExplorerProgression | null,
    currentProgression: QuestDetailProgression,
    keys: string[],
    entriesByKey: Record<string, QuestExplorerEntry>
): QuestProgressionLocation | null {
    if (!progression || keys.length === 0) return null;

    for (const questline of progression.questlines) {
        for (const chapter of questline.chapters) {
            const stepIndex = stepIndexForKeys(chapter.steps, keys, entriesByKey);
            if (stepIndex == null) continue;
            const location = { questline, chapter, step: chapter.steps[stepIndex], stepIndex };
            if (!isSameProgressionChapter(currentProgression, location)) return location;
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

export function nextProgressionChapterLocation(
    progression: QuestDetailProgression,
    fullProgression: QuestExplorerProgression | null
): QuestProgressionLocation | null {
    const questline = matchingProgressionQuestline(progression, fullProgression) ?? progression.questline;
    const chapterIndex = questline.chapters.findIndex((chapter) => progressionChapterMatches(chapter, progression.chapter));
    if (chapterIndex < 0) return null;

    const currentOrder = progression.chapter.chapterOrder ?? progression.chapter.chapterNumber;
    for (let index = chapterIndex + 1; index < questline.chapters.length; index += 1) {
        const chapter = questline.chapters[index];
        const step = chapter.steps[0] ?? null;
        if (!step) continue;

        const nextOrder = chapter.chapterOrder ?? chapter.chapterNumber;
        if (currentOrder != null && nextOrder != null && nextOrder !== currentOrder + 1) {
            return null;
        }

        return {
            questline,
            chapter,
            step,
            stepIndex: 0,
        };
    }

    return null;
}

export function matchingProgressionQuestline(
    progression: QuestDetailProgression,
    fullProgression: QuestExplorerProgression | null
): QuestProgressionQuestline | null {
    if (!fullProgression) return null;

    const questlineKey = progression.questline.questLineFamilyKey ?? progression.questline.questLineKey;
    const factionKey = progression.questline.factionFamilyKey ?? progression.questline.factionKey;

    return fullProgression.questlines.find((candidate) => {
        const candidateQuestlineKey = candidate.questLineFamilyKey ?? candidate.questLineKey;
        const candidateFactionKey = candidate.factionFamilyKey ?? candidate.factionKey;
        return (!questlineKey || candidateQuestlineKey === questlineKey)
            && (!factionKey || candidateFactionKey === factionKey);
    }) ?? null;
}

export function progressionChapterMatches(
    candidate: QuestProgressionChapter,
    selected: QuestProgressionChapter
): boolean {
    const selectedStepKeys = new Set(selected.steps.map((step) => step.stepKey));
    if (candidate.steps.some((step) => selectedStepKeys.has(step.stepKey))) return true;

    return (
        (candidate.chapterOrder ?? candidate.chapterNumber ?? candidate.title)
        === (selected.chapterOrder ?? selected.chapterNumber ?? selected.title)
        && candidate.title === selected.title
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
