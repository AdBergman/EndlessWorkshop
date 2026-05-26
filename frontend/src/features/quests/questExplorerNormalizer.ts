import type {
    QuestExplorerEntry,
    QuestExplorerProgression,
    QuestExplorerResponse,
    QuestProgressionChapter,
    QuestProgressionQuestline,
    QuestProgressionStep,
    QuestProgressionVariant,
} from "@/types/questTypes";

export const normalizeQuestKey = (key: string | null | undefined) => (key ?? "").trim();

const cleanString = (value: unknown): string | null => {
    const text = typeof value === "string" ? value.trim() : "";
    return text || null;
};

const cleanRequiredString = (value: unknown): string => cleanString(value) ?? "";

const cleanNumber = (value: unknown): number | null =>
    typeof value === "number" && Number.isFinite(value) ? value : null;

const cleanBoolean = (value: unknown): boolean | null =>
    typeof value === "boolean" ? value : null;

const cleanStringList = (values: readonly unknown[] | null | undefined): string[] =>
    (values ?? [])
        .filter((value): value is string => typeof value === "string")
        .map((value) => value.trim())
        .filter(Boolean);

const cleanStringMatrix = (values: readonly unknown[] | null | undefined): string[][] =>
    (values ?? [])
        .filter((value): value is readonly unknown[] => Array.isArray(value))
        .map((value) => cleanStringList(value))
        .filter((value) => value.length > 0);

const normalizeRequirement = (requirement: any) => ({
    requirementKey: cleanRequiredString(requirement?.requirementKey),
    kind: cleanRequiredString(requirement?.kind),
    displayText: cleanRequiredString(requirement?.displayText),
    polarity: cleanString(requirement?.polarity),
    groupLabel: cleanString(requirement?.groupLabel),
    groupOrder: cleanNumber(requirement?.groupOrder),
    targetRole: cleanString(requirement?.targetRole),
    targetLabel: cleanString(requirement?.targetLabel),
    requiredCount: cleanNumber(requirement?.requiredCount),
    durationTurns: cleanNumber(requirement?.durationTurns),
    state: cleanString(requirement?.state),
    referenceKind: cleanString(requirement?.referenceKind),
    referenceKey: cleanString(requirement?.referenceKey),
    referenceDisplayName: cleanString(requirement?.referenceDisplayName),
    codexEntryKey: cleanString(requirement?.codexEntryKey),
});

const normalizeReward = (reward: any) => ({
    rewardKey: cleanRequiredString(reward?.rewardKey),
    kind: cleanRequiredString(reward?.kind),
    displayText: cleanRequiredString(reward?.displayText),
    amount: cleanNumber(reward?.amount),
    groupLabel: cleanString(reward?.groupLabel),
    groupOrder: cleanNumber(reward?.groupOrder),
    formulaText: cleanString(reward?.formulaText),
    assetKind: cleanString(reward?.assetKind),
    assetKey: cleanString(reward?.assetKey),
    assetDisplayName: cleanString(reward?.assetDisplayName),
    referenceKind: cleanString(reward?.referenceKind),
    referenceKey: cleanString(reward?.referenceKey),
    referenceDisplayName: cleanString(reward?.referenceDisplayName),
    codexEntryKey: cleanString(reward?.codexEntryKey),
    targetScopeLabel: cleanString(reward?.targetScopeLabel),
});

const normalizeEntry = (entry: any): QuestExplorerEntry => ({
    entryKey: normalizeQuestKey(entry?.entryKey),
    title: cleanRequiredString(entry?.title),
    summaryLines: cleanStringList(entry?.summaryLines),
    questType: cleanString(entry?.questType),
    isMandatory: cleanBoolean(entry?.isMandatory),
    // Legacy exporter/import compatibility field; preserved in the DTO but ignored by normal UI.
    isKeyNarrativeBeat: cleanBoolean(entry?.isKeyNarrativeBeat),
    aliases: cleanStringList(entry?.aliases),
    navigation: {
        factionKey: cleanString(entry?.navigation?.factionKey),
        factionName: cleanString(entry?.navigation?.factionName),
        questLineKey: cleanString(entry?.navigation?.questLineKey),
        questLineName: cleanString(entry?.navigation?.questLineName),
        chapter: cleanNumber(entry?.navigation?.chapter),
        chapterLabel: cleanString(entry?.navigation?.chapterLabel),
        step: cleanNumber(entry?.navigation?.step),
        stepLabel: cleanString(entry?.navigation?.stepLabel),
        sequenceIndex: cleanNumber(entry?.navigation?.sequenceIndex) ?? Number.MAX_SAFE_INTEGER,
        chapterOrder: cleanNumber(entry?.navigation?.chapterOrder),
        stepOrder: cleanNumber(entry?.navigation?.stepOrder),
        branchGroupKey: cleanString(entry?.navigation?.branchGroupKey),
        branchLabel: cleanString(entry?.navigation?.branchLabel),
        branchOrder: cleanNumber(entry?.navigation?.branchOrder),
        isBranchStart: cleanBoolean(entry?.navigation?.isBranchStart),
        isBranchEnd: cleanBoolean(entry?.navigation?.isBranchEnd),
        previousEntryKeys: cleanStringList(entry?.navigation?.previousEntryKeys),
        nextEntryKeys: cleanStringList(entry?.navigation?.nextEntryKeys),
        failureEntryKeys: cleanStringList(entry?.navigation?.failureEntryKeys),
        convergesIntoEntryKeys: cleanStringList(entry?.navigation?.convergesIntoEntryKeys),
    },
    loreView: {
        sections: (entry?.loreView?.sections ?? []).map((section: any) => ({
            sectionKey: cleanRequiredString(section?.sectionKey),
            phase: cleanRequiredString(section?.phase),
            choiceKey: cleanString(section?.choiceKey),
            stepIndex: cleanNumber(section?.stepIndex),
            objectiveKey: cleanString(section?.objectiveKey),
            revealedByBranchKeys: cleanStringList(section?.revealedByBranchKeys),
            revealedByChoiceKeys: cleanStringList(section?.revealedByChoiceKeys),
            revealedByBranchPathAlternatives: cleanStringMatrix(section?.revealedByBranchPathAlternatives),
            lines: (section?.lines ?? []).map((line: any) => ({
                speakerLabel: cleanString(line?.speakerLabel),
                role: cleanRequiredString(line?.role),
                text: cleanRequiredString(line?.text),
            })),
        })),
    },
    strategyView: {
        objectives: (entry?.strategyView?.objectives ?? []).map((objective: any) => ({
            objectiveKey: cleanString(objective?.objectiveKey),
            choiceKey: cleanString(objective?.choiceKey),
            text: cleanRequiredString(objective?.text),
            phase: cleanString(objective?.phase),
            revealedByBranchKeys: cleanStringList(objective?.revealedByBranchKeys),
            revealedByChoiceKeys: cleanStringList(objective?.revealedByChoiceKeys),
            revealedByBranchPathAlternatives: cleanStringMatrix(objective?.revealedByBranchPathAlternatives),
            requirements: (objective?.requirements ?? []).map(normalizeRequirement),
            rewards: (objective?.rewards ?? []).map(normalizeReward),
        })),
    },
    branches: (entry?.branches ?? []).map((branch: any) => ({
        branchKey: cleanRequiredString(branch?.branchKey),
        choiceKey: cleanString(branch?.choiceKey),
        label: cleanRequiredString(branch?.label),
        orderIndex: cleanNumber(branch?.orderIndex),
        groupKey: cleanString(branch?.groupKey),
        groupLabel: cleanString(branch?.groupLabel),
        branchStepOrder: cleanNumber(branch?.branchStepOrder),
        parentBranchKey: cleanString(branch?.parentBranchKey),
        parentChoiceKey: cleanString(branch?.parentChoiceKey),
        prerequisiteBranchKeys: cleanStringList(branch?.prerequisiteBranchKeys),
        prerequisiteBranchPath: cleanStringList(branch?.prerequisiteBranchPath),
        revealedByBranchKeys: cleanStringList(branch?.revealedByBranchKeys),
        revealedByChoiceKeys: cleanStringList(branch?.revealedByChoiceKeys),
        revealedByBranchPathAlternatives: cleanStringMatrix(branch?.revealedByBranchPathAlternatives),
        choiceGroupKey: cleanString(branch?.choiceGroupKey),
        convergenceGroupKey: cleanString(branch?.convergenceGroupKey),
        sectionRole: cleanString(branch?.sectionRole),
        nextEntryKeys: cleanStringList(branch?.nextEntryKeys),
        failureEntryKeys: cleanStringList(branch?.failureEntryKeys),
        convergesIntoEntryKeys: cleanStringList(branch?.convergesIntoEntryKeys),
        lore: branch?.lore
            ? { outcomePreviewLines: cleanStringList(branch.lore.outcomePreviewLines) }
            : null,
        strategy: branch?.strategy
            ? {
                conditions: cleanStringList(branch.strategy.conditions),
                requirements: (branch.strategy.requirements ?? []).map(normalizeRequirement),
                rewards: (branch.strategy.rewards ?? []).map(normalizeReward),
            }
            : null,
    })),
    quality: entry?.quality ? { warnings: cleanStringList(entry.quality.warnings) } : null,
});

const normalizeProgressionVariant = (variant: any): QuestProgressionVariant => ({
    entryKey: cleanRequiredString(variant?.entryKey),
    title: cleanRequiredString(variant?.title),
    variantKind: cleanRequiredString(variant?.variantKind),
    branchGroupKey: cleanString(variant?.branchGroupKey),
    branchLabel: cleanString(variant?.branchLabel),
    branchOrder: cleanNumber(variant?.branchOrder),
    previousEntryKeys: cleanStringList(variant?.previousEntryKeys),
    nextEntryKeys: cleanStringList(variant?.nextEntryKeys),
    failureEntryKeys: cleanStringList(variant?.failureEntryKeys),
    convergesIntoEntryKeys: cleanStringList(variant?.convergesIntoEntryKeys),
});

const normalizeProgressionStep = (step: any): QuestProgressionStep => ({
    stepKey: cleanRequiredString(step?.stepKey),
    stepNumber: cleanNumber(step?.stepNumber),
    stepOrder: cleanNumber(step?.stepOrder),
    title: cleanRequiredString(step?.title),
    projectionKind: cleanRequiredString(step?.projectionKind),
    detailEntryKey: cleanRequiredString(step?.detailEntryKey),
    sourceEntryKeys: cleanStringList(step?.sourceEntryKeys),
    aliasEntryKeys: cleanStringList(step?.aliasEntryKeys),
    variants: (step?.variants ?? []).map(normalizeProgressionVariant).filter((variant: QuestProgressionVariant) => variant.entryKey),
});

const normalizeProgressionChapter = (chapter: any): QuestProgressionChapter => ({
    chapterNumber: cleanNumber(chapter?.chapterNumber),
    chapterOrder: cleanNumber(chapter?.chapterOrder),
    title: cleanRequiredString(chapter?.title),
    steps: (chapter?.steps ?? []).map(normalizeProgressionStep).filter((step: QuestProgressionStep) => step.stepKey && step.detailEntryKey),
});

const normalizeProgressionQuestline = (questline: any): QuestProgressionQuestline => ({
    questLineKey: cleanString(questline?.questLineKey),
    questLineFamilyKey: cleanString(questline?.questLineFamilyKey),
    questLineName: cleanString(questline?.questLineName),
    factionKey: cleanString(questline?.factionKey),
    factionFamilyKey: cleanString(questline?.factionFamilyKey),
    factionName: cleanString(questline?.factionName),
    sourceQuestLineKeys: cleanStringList(questline?.sourceQuestLineKeys),
    sourceFactionKeys: cleanStringList(questline?.sourceFactionKeys),
    chapters: (questline?.chapters ?? []).map(normalizeProgressionChapter),
});

const normalizeProgressionDebugSummary = (debugSummary: any): QuestExplorerProgression["debugSummary"] => (
    debugSummary
        ? {
            totalEntries: cleanNumber(debugSummary?.totalEntries) ?? 0,
            questlineFamiliesFound: cleanStringList(debugSummary?.questlineFamiliesFound),
            questlines: (debugSummary?.questlines ?? []).map((questline: any) => ({
                questLineFamilyKey: cleanString(questline?.questLineFamilyKey),
                factionFamilyKey: cleanString(questline?.factionFamilyKey),
                sourceQuestLineKeys: cleanStringList(questline?.sourceQuestLineKeys),
                chapters: (questline?.chapters ?? []).map((chapter: any) => ({
                    chapterOrder: cleanNumber(chapter?.chapterOrder),
                    chapterNumber: cleanNumber(chapter?.chapterNumber),
                    title: cleanRequiredString(chapter?.title),
                    stepCount: cleanNumber(chapter?.stepCount) ?? 0,
                    steps: (chapter?.steps ?? []).map((step: any) => ({
                        stepKey: cleanRequiredString(step?.stepKey),
                        stepOrder: cleanNumber(step?.stepOrder),
                        stepNumber: cleanNumber(step?.stepNumber),
                        projectionKind: cleanRequiredString(step?.projectionKind),
                        detailEntryKey: cleanRequiredString(step?.detailEntryKey),
                        sourceEntryKeys: cleanStringList(step?.sourceEntryKeys),
                        aliasEntryKeys: cleanStringList(step?.aliasEntryKeys),
                        variantCount: cleanNumber(step?.variantCount) ?? 0,
                        branchVariantCount: cleanNumber(step?.branchVariantCount) ?? 0,
                    })),
                })),
            })),
            missingMajorFactionChapters: (debugSummary?.missingMajorFactionChapters ?? []).map((item: any) => ({
                questLineFamilyKey: cleanString(item?.questLineFamilyKey),
                factionFamilyKey: cleanString(item?.factionFamilyKey),
                missingChapterNumbers: (item?.missingChapterNumbers ?? []).filter((value: unknown): value is number => typeof value === "number" && Number.isFinite(value)),
            })),
            chaptersWithOnlyOneStep: (debugSummary?.chaptersWithOnlyOneStep ?? []).map((item: any) => ({
                questLineFamilyKey: cleanString(item?.questLineFamilyKey),
                factionFamilyKey: cleanString(item?.factionFamilyKey),
                chapterOrder: cleanNumber(item?.chapterOrder),
                title: cleanRequiredString(item?.title),
            })),
            numericQuestlineVariantsCollapsed: (debugSummary?.numericQuestlineVariantsCollapsed ?? []).map((item: any) => ({
                sourceQuestLineKey: cleanString(item?.sourceQuestLineKey),
                sourceFactionKey: cleanString(item?.sourceFactionKey),
                targetQuestLineFamilyKey: cleanString(item?.targetQuestLineFamilyKey),
                targetFactionFamilyKey: cleanString(item?.targetFactionFamilyKey),
                entryCount: cleanNumber(item?.entryCount) ?? 0,
                reason: cleanRequiredString(item?.reason),
            })),
            entriesWithMissingChapterOrStepOrder: cleanStringList(debugSummary?.entriesWithMissingChapterOrStepOrder),
            suspiciousBranchVariantsWithoutParentStep: cleanStringList(debugSummary?.suspiciousBranchVariantsWithoutParentStep),
            tutorialEntriesPlaced: cleanStringList(debugSummary?.tutorialEntriesPlaced),
        }
        : null
);

const normalizeProgression = (progression: any): QuestExplorerProgression | null => (
    progression
        ? {
            questlines: (progression?.questlines ?? []).map(normalizeProgressionQuestline),
            debugSummary: normalizeProgressionDebugSummary(progression?.debugSummary),
        }
        : null
);

const sortEntries = (entries: QuestExplorerEntry[]) =>
    [...entries].sort((left, right) => {
        const sequenceDelta = left.navigation.sequenceIndex - right.navigation.sequenceIndex;
        if (sequenceDelta !== 0) return sequenceDelta;
        return left.entryKey.localeCompare(right.entryKey);
    });

export const normalizeQuestExplorer = (questExplorer: QuestExplorerResponse) => {
    const entries = sortEntries((questExplorer.entries ?? []).map(normalizeEntry).filter((entry) => entry.entryKey));
    const entriesByKey: Record<string, QuestExplorerEntry> = {};
    const aliasToEntryKey: Record<string, string> = {};
    const duplicateEntryKeys: string[] = [];
    const duplicateAliases: string[] = [];

    for (const entry of entries) {
        if (entriesByKey[entry.entryKey]) {
            duplicateEntryKeys.push(entry.entryKey);
            continue;
        }
        entriesByKey[entry.entryKey] = entry;
    }

    for (const entry of entries) {
        for (const alias of entry.aliases) {
            const normalizedAlias = normalizeQuestKey(alias);
            if (!normalizedAlias || normalizedAlias === entry.entryKey) continue;
            if (aliasToEntryKey[normalizedAlias] && aliasToEntryKey[normalizedAlias] !== entry.entryKey) {
                duplicateAliases.push(normalizedAlias);
                continue;
            }
            aliasToEntryKey[normalizedAlias] = entry.entryKey;
        }
    }

    return {
        questExplorer: {
            ...questExplorer,
            exportKind: "quest_explorer" as const,
            schemaVersion: "quest_explorer.v3" as const,
            entries,
            progression: normalizeProgression(questExplorer.progression),
        },
        entries,
        entriesByKey,
        aliasToEntryKey,
        duplicateEntryKeys,
        duplicateAliases,
    };
};
