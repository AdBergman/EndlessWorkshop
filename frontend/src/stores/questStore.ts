import { create } from "zustand";
import { apiClient } from "@/api/apiClient";
import { normalizeCollection } from "@/stores/utils/normalizedCollection";
import type {
    QuestChoiceDto,
    QuestDialogBlockDto,
    QuestDialogLineDto,
    QuestDto,
    QuestExplorerDto,
    QuestStepDto,
} from "@/types/questTypes";

type LoadOptions = {
    force?: boolean;
};

type QuestStore = {
    quests: QuestDto[];
    questsByKey: Record<string, QuestDto>;
    questKeys: string[];
    duplicateQuestKeys: string[];

    dialogBlocks: QuestDialogBlockDto[];
    dialogBlocksByIdentity: Record<string, QuestDialogBlockDto>;
    dialogBlockIdentities: string[];
    duplicateDialogBlockIdentities: string[];

    loading: boolean;
    loaded: boolean;
    error: string | null;
    lastLoadedAt?: string;

    loadQuestExplorer: (opts?: LoadOptions) => Promise<void>;
    refreshQuestExplorer: () => Promise<void>;
    invalidateQuestExplorer: () => void;
    reset: () => void;

    getQuestByKey: (key: string) => QuestDto | undefined;
    getDialogBlockByIdentity: (identity: string) => QuestDialogBlockDto | undefined;
    getDialogBlocksByIdentities: (identities: string[]) => QuestDialogBlockDto[];
};

let inflightLoad: Promise<void> | null = null;

export const normalizeQuestKey = (key: string | null | undefined) => (key ?? "").trim();
export const normalizeDialogBlockIdentity = (identity: string | null | undefined) =>
    (identity ?? "").trim();
export const normalizeQuestChoiceKey = (key: string | null | undefined) => (key ?? "").trim();

const cleanStringList = (values: readonly unknown[] | null | undefined): string[] =>
    (values ?? []).filter((value): value is string => typeof value === "string");

const cleanNullableString = (value: unknown): string | null =>
    typeof value === "string" ? value : null;

const cleanNumber = (value: unknown): number =>
    typeof value === "number" && Number.isFinite(value) ? value : 0;

const cleanNullableNumber = (value: unknown): number | null =>
    typeof value === "number" && Number.isFinite(value) ? value : null;

const normalizeDialogLine = (line: QuestDialogLineDto): QuestDialogLineDto => ({
    lineOrder: cleanNumber(line.lineOrder),
    sourceLineIndex: cleanNullableNumber(line.sourceLineIndex),
    role: cleanNullableString(line.role),
    speakerLabel: cleanNullableString(line.speakerLabel),
    text: cleanNullableString(line.text),
});

const normalizeDialogBlock = (block: QuestDialogBlockDto): QuestDialogBlockDto => ({
    identity: normalizeDialogBlockIdentity(block.identity),
    questKey: cleanNullableString(block.questKey),
    choiceKey: cleanNullableString(block.choiceKey),
    stepIndex: cleanNullableNumber(block.stepIndex),
    parentScope: cleanNullableString(block.parentScope),
    dialogKey: cleanNullableString(block.dialogKey),
    phase: cleanNullableString(block.phase),
    expectedLineCount: cleanNumber(block.expectedLineCount),
    blockOrder: cleanNumber(block.blockOrder),
    lines: (block.lines ?? []).map(normalizeDialogLine),
});

const normalizeStep = (step: QuestStepDto): QuestStepDto => ({
    stepIndex: cleanNumber(step.stepIndex),
    stepOrder: cleanNumber(step.stepOrder),
    objectiveText: cleanNullableString(step.objectiveText),
    nextQuestKey: cleanNullableString(step.nextQuestKey),
    failQuestKey: cleanNullableString(step.failQuestKey),
    descriptionLines: cleanStringList(step.descriptionLines),
    completionPrerequisiteLines: cleanStringList(step.completionPrerequisiteLines),
    failurePrerequisiteLines: cleanStringList(step.failurePrerequisiteLines),
    forbiddenPrerequisiteLines: cleanStringList(step.forbiddenPrerequisiteLines),
    selectionPrerequisiteLines: cleanStringList(step.selectionPrerequisiteLines),
    rewardDisplayLines: cleanStringList(step.rewardDisplayLines),
    referenceKeys: cleanStringList(step.referenceKeys),
    dialogBlockIdentities: cleanStringList(step.dialogBlockIdentities).map(normalizeDialogBlockIdentity),
});

const normalizeChoice = (choice: QuestChoiceDto): QuestChoiceDto => ({
    choiceKey: normalizeQuestChoiceKey(choice.choiceKey),
    displayName: cleanNullableString(choice.displayName),
    choiceOrder: cleanNumber(choice.choiceOrder),
    descriptionLines: cleanStringList(choice.descriptionLines),
    completionPrerequisiteLines: cleanStringList(choice.completionPrerequisiteLines),
    failurePrerequisiteLines: cleanStringList(choice.failurePrerequisiteLines),
    rewardDisplayLines: cleanStringList(choice.rewardDisplayLines),
    nextQuestKeys: cleanStringList(choice.nextQuestKeys).map(normalizeQuestKey),
    referenceKeys: cleanStringList(choice.referenceKeys),
    steps: (choice.steps ?? []).map(normalizeStep),
});

const normalizeQuest = (quest: QuestDto): QuestDto => ({
    questKey: normalizeQuestKey(quest.questKey),
    displayName: cleanNullableString(quest.displayName),
    descriptionLines: cleanStringList(quest.descriptionLines),
    categoryKey: cleanNullableString(quest.categoryKey),
    categoryType: cleanNullableString(quest.categoryType),
    branchStart: Boolean(quest.branchStart),
    branchEnd: Boolean(quest.branchEnd),
    mandatory: Boolean(quest.mandatory),
    keyNarrativeBeat: Boolean(quest.keyNarrativeBeat),
    narrativeVictoryPathChoice: Boolean(quest.narrativeVictoryPathChoice),
    chapterKey: cleanNullableString(quest.chapterKey),
    chapterIndex: cleanNullableNumber(quest.chapterIndex),
    chapterNumber: cleanNullableNumber(quest.chapterNumber),
    questSequenceIndex: cleanNullableNumber(quest.questSequenceIndex),
    branchGroupKey: cleanNullableString(quest.branchGroupKey),
    branchLabel: cleanNullableString(quest.branchLabel),
    inferredFactionKey: cleanNullableString(quest.inferredFactionKey),
    inferredQuestLineKey: cleanNullableString(quest.inferredQuestLineKey),
    convergesIntoQuestKey: cleanNullableString(quest.convergesIntoQuestKey),
    previousQuestKeys: cleanStringList(quest.previousQuestKeys).map(normalizeQuestKey),
    nextQuestKeys: cleanStringList(quest.nextQuestKeys).map(normalizeQuestKey),
    referenceKeys: cleanStringList(quest.referenceKeys),
    rootDialogBlockIdentities: cleanStringList(quest.rootDialogBlockIdentities).map(
        normalizeDialogBlockIdentity
    ),
    choices: (quest.choices ?? []).map(normalizeChoice),
});

const normalizeQuestExplorer = (explorer: QuestExplorerDto) => {
    const quests = normalizeCollection((explorer.quests ?? []).map(normalizeQuest), (quest) => quest.questKey, {
        normalizeKey: normalizeQuestKey,
    });
    const dialogBlocks = normalizeCollection(
        (explorer.dialogBlocks ?? []).map(normalizeDialogBlock),
        (block) => block.identity,
        { normalizeKey: normalizeDialogBlockIdentity }
    );

    return { quests, dialogBlocks };
};

const initialState = {
    quests: [] as QuestDto[],
    questsByKey: {} as Record<string, QuestDto>,
    questKeys: [] as string[],
    duplicateQuestKeys: [] as string[],

    dialogBlocks: [] as QuestDialogBlockDto[],
    dialogBlocksByIdentity: {} as Record<string, QuestDialogBlockDto>,
    dialogBlockIdentities: [] as string[],
    duplicateDialogBlockIdentities: [] as string[],

    loading: false,
    loaded: false,
    error: null as string | null,
    lastLoadedAt: undefined as string | undefined,
};

const formatLoadError = (reason: unknown) =>
    `Failed to load quests: ${(reason as Error)?.message ?? String(reason)}`;

export const getDialogBlocksByIdentities = (
    identities: string[],
    dialogBlocksByIdentity: Record<string, QuestDialogBlockDto>
): QuestDialogBlockDto[] =>
    identities
        .map((identity) => dialogBlocksByIdentity[normalizeDialogBlockIdentity(identity)])
        .filter((block): block is QuestDialogBlockDto => !!block);

export const getRootDialogBlocksForQuest = (
    quest: QuestDto | null | undefined,
    dialogBlocksByIdentity: Record<string, QuestDialogBlockDto>
): QuestDialogBlockDto[] =>
    quest ? getDialogBlocksByIdentities(quest.rootDialogBlockIdentities, dialogBlocksByIdentity) : [];

export const getQuestChoiceByKey = (
    quest: QuestDto | null | undefined,
    choiceKey: string
): QuestChoiceDto | undefined => {
    const normalizedChoiceKey = normalizeQuestChoiceKey(choiceKey);
    if (!quest || !normalizedChoiceKey) return undefined;
    return quest.choices.find((choice) => normalizeQuestChoiceKey(choice.choiceKey) === normalizedChoiceKey);
};

export const getQuestStepByIndex = (
    choice: QuestChoiceDto | null | undefined,
    stepIndex: number
): QuestStepDto | undefined => {
    if (!choice) return undefined;
    return choice.steps.find((step) => step.stepIndex === stepIndex);
};

export const getDialogBlocksForStep = (
    step: QuestStepDto | null | undefined,
    dialogBlocksByIdentity: Record<string, QuestDialogBlockDto>
): QuestDialogBlockDto[] =>
    step ? getDialogBlocksByIdentities(step.dialogBlockIdentities, dialogBlocksByIdentity) : [];

export const useQuestStore = create<QuestStore>((set, get) => ({
    ...initialState,

    loadQuestExplorer: async (opts) => {
        const force = opts?.force ?? false;
        const state = get();

        if (!force && state.loading && inflightLoad) {
            return inflightLoad;
        }

        if (!force && state.loaded) {
            return;
        }

        set({ loading: true, error: null });

        inflightLoad = (async () => {
            try {
                const explorer = normalizeQuestExplorer(await apiClient.getQuestExplorer());

                set({
                    quests: explorer.quests.items,
                    questsByKey: explorer.quests.byKey,
                    questKeys: explorer.quests.keys,
                    duplicateQuestKeys: explorer.quests.duplicateKeys,
                    dialogBlocks: explorer.dialogBlocks.items,
                    dialogBlocksByIdentity: explorer.dialogBlocks.byKey,
                    dialogBlockIdentities: explorer.dialogBlocks.keys,
                    duplicateDialogBlockIdentities: explorer.dialogBlocks.duplicateKeys,
                    loading: false,
                    loaded: true,
                    error: null,
                    lastLoadedAt: new Date().toISOString(),
                });
            } catch (err) {
                console.error("Failed to fetch quests from API.", err);
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
        return get().questsByKey[normalizedKey];
    },

    getDialogBlockByIdentity: (identity) => {
        const normalizedIdentity = normalizeDialogBlockIdentity(identity);
        if (!normalizedIdentity) return undefined;
        return get().dialogBlocksByIdentity[normalizedIdentity];
    },

    getDialogBlocksByIdentities: (identities) =>
        getDialogBlocksByIdentities(identities, get().dialogBlocksByIdentity),
}));

export const selectQuests = (state: QuestStore) => state.quests;
export const selectQuestsByKey = (state: QuestStore) => state.questsByKey;
export const selectQuestKeys = (state: QuestStore) => state.questKeys;
export const selectQuestDialogBlocks = (state: QuestStore) => state.dialogBlocks;
export const selectDialogBlocksByIdentity = (state: QuestStore) => state.dialogBlocksByIdentity;
export const selectQuestLoading = (state: QuestStore) => state.loading;
export const selectQuestLoaded = (state: QuestStore) => state.loaded;
export const selectQuestError = (state: QuestStore) => state.error;

export const selectQuestByKey = (key: string) => (state: QuestStore) =>
    state.questsByKey[normalizeQuestKey(key)];

export const selectDialogBlockByIdentity = (identity: string) => (state: QuestStore) =>
    state.dialogBlocksByIdentity[normalizeDialogBlockIdentity(identity)];

export const selectDialogBlocksByIdentities = (identities: string[]) => (state: QuestStore) =>
    getDialogBlocksByIdentities(identities, state.dialogBlocksByIdentity);

export const selectRootDialogBlocksForQuest = (questKey: string) => (state: QuestStore) =>
    getRootDialogBlocksForQuest(state.questsByKey[normalizeQuestKey(questKey)], state.dialogBlocksByIdentity);

export const selectDialogBlocksForStep =
    (questKey: string, choiceKey: string, stepIndex: number) => (state: QuestStore) => {
        const quest = state.questsByKey[normalizeQuestKey(questKey)];
        const choice = getQuestChoiceByKey(quest, choiceKey);
        const step = getQuestStepByIndex(choice, stepIndex);

        return getDialogBlocksForStep(step, state.dialogBlocksByIdentity);
    };
