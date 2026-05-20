import { create } from "zustand";
import { apiClient } from "@/api/apiClient";
import { normalizeCollection } from "@/stores/utils/normalizedCollection";
import type {
    QuestChronicleDto,
    QuestChronicleEntryDto,
    QuestChronicleObjectiveDto,
    QuestChroniclePathDto,
    QuestChronicleRequirementDto,
    QuestChronicleRewardDto,
    QuestChronicleTranscriptBlockDto,
    QuestChronicleTranscriptLineDto,
} from "@/types/questTypes";

type LoadOptions = {
    force?: boolean;
};

type QuestStore = {
    chronicle: QuestChronicleDto | null;
    entries: QuestChronicleEntryDto[];
    entriesByKey: Record<string, QuestChronicleEntryDto>;
    entryKeys: string[];
    duplicateEntryKeys: string[];

    loading: boolean;
    loaded: boolean;
    error: string | null;
    lastLoadedAt?: string;

    loadQuestExplorer: (opts?: LoadOptions) => Promise<void>;
    refreshQuestExplorer: () => Promise<void>;
    invalidateQuestExplorer: () => void;
    reset: () => void;

    getQuestByKey: (key: string) => QuestChronicleEntryDto | undefined;
};

let inflightLoad: Promise<void> | null = null;

export const normalizeQuestKey = (key: string | null | undefined) => (key ?? "").trim();
export const normalizeQuestChoiceKey = (key: string | null | undefined) => (key ?? "").trim();

const cleanStringList = (values: readonly unknown[] | null | undefined): string[] =>
    (values ?? []).filter((value): value is string => typeof value === "string").map((value) => value.trim()).filter(Boolean);

const cleanNullableString = (value: unknown): string | null => {
    const text = typeof value === "string" ? value.trim() : "";
    return text || null;
};

const cleanNullableNumber = (value: unknown): number | null =>
    typeof value === "number" && Number.isFinite(value) ? value : null;

const normalizeRequirement = (requirement: QuestChronicleRequirementDto): QuestChronicleRequirementDto => ({
    requirementKey: cleanNullableString(requirement.requirementKey),
    kind: cleanNullableString(requirement.kind),
    phase: cleanNullableString(requirement.phase),
    polarity: cleanNullableString(requirement.polarity),
    displayText: cleanNullableString(requirement.displayText),
    referenceKey: cleanNullableString(requirement.referenceKey),
    referenceKind: cleanNullableString(requirement.referenceKind),
    referenceDisplayName: cleanNullableString(requirement.referenceDisplayName),
    targetRole: cleanNullableString(requirement.targetRole),
    targetLabel: cleanNullableString(requirement.targetLabel),
    state: cleanNullableString(requirement.state),
    requiredCount: cleanNullableNumber(requirement.requiredCount),
    durationTurns: cleanNullableNumber(requirement.durationTurns),
});

const normalizeReward = (reward: QuestChronicleRewardDto): QuestChronicleRewardDto => ({
    rewardKey: cleanNullableString(reward.rewardKey),
    sourceRewardKeys: cleanStringList(reward.sourceRewardKeys),
    kind: cleanNullableString(reward.kind),
    displayText: cleanNullableString(reward.displayText),
    formulaText: cleanNullableString(reward.formulaText),
    amount: cleanNullableNumber(reward.amount),
    assetKind: cleanNullableString(reward.assetKind),
    assetKey: cleanNullableString(reward.assetKey),
    assetDisplayName: cleanNullableString(reward.assetDisplayName),
    targetScopeLabel: cleanNullableString(reward.targetScopeLabel),
});

const normalizeObjective = (objective: QuestChronicleObjectiveDto): QuestChronicleObjectiveDto => ({
    objectiveText: cleanNullableString(objective.objectiveText),
    sourceQuestKey: cleanNullableString(objective.sourceQuestKey),
    choiceKey: normalizeQuestChoiceKey(objective.choiceKey),
    stepIndex: cleanNullableNumber(objective.stepIndex),
    descriptionLines: cleanStringList(objective.descriptionLines),
    completionLines: cleanStringList(objective.completionLines),
    failureLines: cleanStringList(objective.failureLines),
    forbiddenLines: cleanStringList(objective.forbiddenLines),
    selectionLines: cleanStringList(objective.selectionLines),
    rewardLines: cleanStringList(objective.rewardLines),
    completionRequirements: (objective.completionRequirements ?? []).map(normalizeRequirement),
    failureRequirements: (objective.failureRequirements ?? []).map(normalizeRequirement),
    forbiddenRequirements: (objective.forbiddenRequirements ?? []).map(normalizeRequirement),
    selectionRequirements: (objective.selectionRequirements ?? []).map(normalizeRequirement),
    rewards: (objective.rewards ?? []).map(normalizeReward),
});

const normalizePath = (path: QuestChroniclePathDto): QuestChroniclePathDto => ({
    pathKey: normalizeQuestChoiceKey(path.pathKey),
    label: cleanNullableString(path.label),
    labelSource: cleanNullableString(path.labelSource),
    choiceOrdinal: cleanNullableNumber(path.choiceOrdinal),
    sourceQuestKey: cleanNullableString(path.sourceQuestKey),
    choiceKey: normalizeQuestChoiceKey(path.choiceKey),
    conditionLines: cleanStringList(path.conditionLines),
    rewardLines: cleanStringList(path.rewardLines),
    nextEntryKeys: cleanStringList(path.nextEntryKeys).map(normalizeQuestKey),
    failureEntryKeys: cleanStringList(path.failureEntryKeys).map(normalizeQuestKey),
    requirements: (path.requirements ?? []).map(normalizeRequirement),
    rewards: (path.rewards ?? []).map(normalizeReward),
});

const normalizeTranscriptLine = (line: QuestChronicleTranscriptLineDto): QuestChronicleTranscriptLineDto => ({
    lineIndex: cleanNullableNumber(line.lineIndex),
    role: cleanNullableString(line.role),
    speakerLabel: cleanNullableString(line.speakerLabel),
    text: cleanNullableString(line.text),
});

const normalizeTranscriptBlock = (block: QuestChronicleTranscriptBlockDto): QuestChronicleTranscriptBlockDto => ({
    dialogKey: cleanNullableString(block.dialogKey),
    phase: cleanNullableString(block.phase),
    sourceQuestKey: cleanNullableString(block.sourceQuestKey),
    choiceKey: normalizeQuestChoiceKey(block.choiceKey),
    stepIndex: cleanNullableNumber(block.stepIndex),
    lines: (block.lines ?? []).map(normalizeTranscriptLine),
});

const normalizeEntry = (entry: QuestChronicleEntryDto): QuestChronicleEntryDto => ({
    entryKey: normalizeQuestKey(entry.entryKey),
    primaryQuestKey: cleanNullableString(entry.primaryQuestKey),
    sourceQuestKeys: cleanStringList(entry.sourceQuestKeys).map(normalizeQuestKey),
    groupingKey: cleanNullableString(entry.groupingKey),
    groupingReason: cleanNullableString(entry.groupingReason),
    title: cleanNullableString(entry.title),
    summaryLines: cleanStringList(entry.summaryLines),
    questType: cleanNullableString(entry.questType),
    mandatory: Boolean(entry.mandatory),
    keyNarrativeBeat: Boolean(entry.keyNarrativeBeat),
    factionKey: cleanNullableString(entry.factionKey),
    questLineKey: cleanNullableString(entry.questLineKey),
    chapter: cleanNullableNumber(entry.chapter),
    chapterLabel: cleanNullableString(entry.chapterLabel),
    step: cleanNullableNumber(entry.step),
    stepLabel: cleanNullableString(entry.stepLabel),
    branchKey: cleanNullableString(entry.branchKey),
    branchLabel: cleanNullableString(entry.branchLabel),
    nextEntryKeys: cleanStringList(entry.nextEntryKeys).map(normalizeQuestKey),
    failureEntryKeys: cleanStringList(entry.failureEntryKeys).map(normalizeQuestKey),
    convergesIntoEntryKeys: cleanStringList(entry.convergesIntoEntryKeys).map(normalizeQuestKey),
    objectives: (entry.objectives ?? []).map(normalizeObjective),
    paths: (entry.paths ?? []).map(normalizePath),
    transcriptBlocks: (entry.transcriptBlocks ?? []).map(normalizeTranscriptBlock),
});

const normalizeChronicle = (chronicle: QuestChronicleDto) => {
    const entries = normalizeCollection((chronicle.entries ?? []).map(normalizeEntry), (entry) => entry.entryKey, {
        normalizeKey: normalizeQuestKey,
    });
    const entriesByKey = { ...entries.byKey };

    for (const entry of entries.items) {
        for (const sourceQuestKey of entry.sourceQuestKeys) {
            const key = normalizeQuestKey(sourceQuestKey);
            if (key && !entriesByKey[key]) entriesByKey[key] = entry;
        }
        if (entry.primaryQuestKey) {
            const key = normalizeQuestKey(entry.primaryQuestKey);
            if (key && !entriesByKey[key]) entriesByKey[key] = entry;
        }
    }

    return {
        chronicle: {
            ...chronicle,
            entries: entries.items,
        },
        entries,
        entriesByKey,
    };
};

const initialState = {
    chronicle: null as QuestChronicleDto | null,
    entries: [] as QuestChronicleEntryDto[],
    entriesByKey: {} as Record<string, QuestChronicleEntryDto>,
    entryKeys: [] as string[],
    duplicateEntryKeys: [] as string[],
    loading: false,
    loaded: false,
    error: null as string | null,
    lastLoadedAt: undefined as string | undefined,
};

const formatLoadError = (reason: unknown) =>
    `Failed to load quests: ${(reason as Error)?.message ?? String(reason)}`;

export const useQuestStore = create<QuestStore>((set, get) => ({
    ...initialState,

    loadQuestExplorer: async (opts) => {
        const force = opts?.force ?? false;
        const state = get();

        if (!force && state.loading && inflightLoad) return inflightLoad;
        if (!force && state.loaded) return;

        set({ loading: true, error: null });

        inflightLoad = (async () => {
            try {
                const normalized = normalizeChronicle(await apiClient.getQuestChronicle());
                set({
                    chronicle: normalized.chronicle,
                    entries: normalized.entries.items,
                    entriesByKey: normalized.entriesByKey,
                    entryKeys: normalized.entries.keys,
                    duplicateEntryKeys: normalized.entries.duplicateKeys,
                    loading: false,
                    loaded: true,
                    error: null,
                    lastLoadedAt: new Date().toISOString(),
                });
            } catch (err) {
                console.error("Failed to fetch quest chronicle from API.", err);
                set({
                    ...initialState,
                    loaded: false,
                    error: formatLoadError(err),
                    lastLoadedAt: new Date().toISOString(),
                });
            } finally {
                inflightLoad = null;
            }
        })();

        return inflightLoad;
    },

    refreshQuestExplorer: async () => {
        await get().loadQuestExplorer({ force: true });
    },

    invalidateQuestExplorer: () => {
        set({ loaded: false });
    },

    reset: () => {
        inflightLoad = null;
        set(initialState);
    },

    getQuestByKey: (key) => {
        const normalizedKey = normalizeQuestKey(key);
        if (!normalizedKey) return undefined;
        return get().entriesByKey[normalizedKey];
    },
}));

export const selectQuests = (state: QuestStore) => state.entries;
export const selectQuestsByKey = (state: QuestStore) => state.entriesByKey;
export const selectQuestKeys = (state: QuestStore) => state.entryKeys;
export const selectQuestLoading = (state: QuestStore) => state.loading;
export const selectQuestLoaded = (state: QuestStore) => state.loaded;
export const selectQuestError = (state: QuestStore) => state.error;
export const selectQuestByKey = (key: string) => (state: QuestStore) =>
    state.entriesByKey[normalizeQuestKey(key)];
