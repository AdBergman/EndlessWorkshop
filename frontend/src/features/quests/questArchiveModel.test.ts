import type { QuestChoiceDto, QuestDto, QuestStepDto } from "@/types/questTypes";
import {
    buildQuestArchiveModel,
    defaultQuestArchiveFilters,
    QUEST_ARCHIVE_ALL,
    type QuestArchiveFilters,
} from "./questArchiveModel";

const step = (overrides: Partial<QuestStepDto> = {}): QuestStepDto => ({
    stepIndex: 0,
    stepOrder: 0,
    objectiveText: "Decode the sky map.",
    nextQuestKey: null,
    failQuestKey: null,
    descriptionLines: ["Survey the archive vault."],
    completionPrerequisiteLines: ["Build the archive annex."],
    failurePrerequisiteLines: [],
    forbiddenPrerequisiteLines: [],
    selectionPrerequisiteLines: ["Have a hero assigned."],
    rewardDisplayLines: ["Gain a relic cache."],
    referenceKeys: [],
    dialogBlockIdentities: [],
    ...overrides,
});

const choice = (overrides: Partial<QuestChoiceDto> = {}): QuestChoiceDto => ({
    choiceKey: "Choice_A",
    displayName: "Scholar Path",
    choiceOrder: 0,
    descriptionLines: ["Follow the scholar path."],
    completionPrerequisiteLines: ["Hold the academy."],
    failurePrerequisiteLines: [],
    rewardDisplayLines: ["Gain knowledge."],
    nextQuestKeys: [],
    referenceKeys: [],
    steps: [step()],
    ...overrides,
});

const quest = (overrides: Partial<QuestDto> = {}): QuestDto => ({
    questKey: "Quest_A",
    displayName: "Quiet Start",
    descriptionLines: ["The expedition begins."],
    categoryKey: null,
    categoryType: "MajorFaction",
    branchStart: false,
    branchEnd: false,
    mandatory: false,
    keyNarrativeBeat: false,
    narrativeVictoryPathChoice: false,
    chapterKey: "Chapter_A",
    chapterIndex: 0,
    chapterNumber: 1,
    questSequenceIndex: 1,
    branchGroupKey: null,
    branchLabel: null,
    inferredFactionKey: "Faction_Kin",
    inferredQuestLineKey: "FactionQuest_Kin",
    convergesIntoQuestKey: null,
    previousQuestKeys: [],
    nextQuestKeys: [],
    referenceKeys: [],
    rootDialogBlockIdentities: [],
    choices: [choice()],
    ...overrides,
});

const buildModel = ({
    quests,
    selectedQuestKey = null,
    filters = {},
}: {
    quests: QuestDto[];
    selectedQuestKey?: string | null;
    filters?: Partial<QuestArchiveFilters>;
}) =>
    buildQuestArchiveModel({
        quests,
        dialogBlocksByIdentity: {},
        selectedQuestKey,
        filters: {
            ...defaultQuestArchiveFilters,
            ...filters,
        },
    });

const visibleQuestKeys = (model: ReturnType<typeof buildModel>) =>
    model.rail.items.flatMap((item) => item.memberQuestKeys);

const optionLabels = (options: Array<{ label: string }>) => options.map((option) => option.label);

describe("questArchiveModel", () => {
    it("searches quest titles, requirements, rewards, objectives, and outcome quest labels", () => {
        const quests = [
            quest({
                questKey: "Quest_A",
                displayName: "Quiet Start",
                nextQuestKeys: ["Quest_Target"],
                choices: [
                    choice({
                        nextQuestKeys: ["Quest_Target"],
                        steps: [
                            step({
                                objectiveText: "Decode the sky map.",
                                completionPrerequisiteLines: ["Build the archive annex."],
                                rewardDisplayLines: ["Gain a relic cache."],
                                nextQuestKey: "Quest_Target",
                            }),
                        ],
                    }),
                ],
            }),
            quest({
                questKey: "Quest_Target",
                displayName: "Sapphire Accord",
                questSequenceIndex: 2,
                choices: [],
            }),
            quest({
                questKey: "Quest_B",
                displayName: "Military Drill",
                categoryType: "SideQuest",
                questSequenceIndex: 3,
                choices: [],
            }),
        ];

        expect(visibleQuestKeys(buildModel({ quests, filters: { searchText: "build archive" } }))).toEqual(["Quest_A"]);
        expect(visibleQuestKeys(buildModel({ quests, filters: { searchText: "relic cache" } }))).toEqual(["Quest_A"]);
        expect(visibleQuestKeys(buildModel({ quests, filters: { searchText: "sky map" } }))).toEqual(["Quest_A"]);
        expect(visibleQuestKeys(buildModel({ quests, filters: { searchText: "sapphire accord" } }))).toContain("Quest_A");
    });

    it("reports grouped visible counts and record counts after filters", () => {
        const quests = [
            quest({
                questKey: "FactionQuest_Necrophage_Chapter06_Step01",
                displayName: "A Bitter Truth",
                mandatory: true,
                categoryType: "MajorFaction",
                chapterNumber: 6,
                inferredFactionKey: "Faction_Necrophage",
                inferredQuestLineKey: "FactionQuest_Necrophage",
                choices: [],
            }),
            quest({
                questKey: "FactionQuest_Necrophage_Chapter06_Step03_Choice01",
                displayName: "A Bitter Truth",
                mandatory: true,
                categoryType: "MajorFaction",
                chapterNumber: 6,
                questSequenceIndex: 2,
                branchGroupKey: "FactionQuest_Necrophage_Chapter06_Step03",
                inferredFactionKey: "Faction_Necrophage",
                inferredQuestLineKey: "FactionQuest_Necrophage",
                choices: [],
            }),
            quest({
                questKey: "Quest_Curiosity_A",
                displayName: "Curiosity",
                categoryType: "Curiosity",
                questSequenceIndex: 3,
                choices: [],
            }),
        ];

        const model = buildModel({ quests, filters: { category: "MajorFaction" } });

        expect(model.counts).toEqual({
            totalGroups: 2,
            visibleGroups: 1,
            totalRecords: 3,
            visibleRecords: 2,
        });
        expect(model.rail.items).toHaveLength(1);
        expect(model.rail.items[0]).toMatchObject({
            title: "A Bitter Truth",
            memberCount: 2,
        });
    });

    it("keeps selected-outside-filter state separate from selected quest content", () => {
        const quests = [
            quest({ questKey: "Quest_A", categoryType: "MajorFaction", choices: [] }),
            quest({
                questKey: "Quest_Optional",
                displayName: "Optional Errand",
                categoryType: "Curiosity",
                questSequenceIndex: 2,
                choices: [],
            }),
        ];

        const model = buildModel({
            quests,
            selectedQuestKey: "Quest_Optional",
            filters: { category: "MajorFaction" },
        });

        expect(model.selectedOutsideFilters).toBe(true);
        expect(visibleQuestKeys(model)).toEqual(["Quest_A"]);
    });

    it("builds faction options and filters by selected faction", () => {
        const quests = [
            quest({
                questKey: "FactionQuest_Necrophage_Chapter01_Step01",
                displayName: "Hive Memory",
                inferredFactionKey: "Faction_Necrophage",
                inferredQuestLineKey: "FactionQuest_Necrophage",
                choices: [],
            }),
            quest({
                questKey: "FactionQuest_Kin_Chapter01_Step01",
                displayName: "Kin Memory",
                inferredFactionKey: "Faction_Kin",
                inferredQuestLineKey: "FactionQuest_Kin",
                questSequenceIndex: 2,
                choices: [],
            }),
        ];

        const model = buildModel({
            quests,
            filters: { faction: "Necrophages" },
        });

        expect(model.factionOptions).toEqual([
            { value: "Kin", label: "Kin", count: 1 },
            { value: "Necrophages", label: "Necrophages", count: 1 },
        ]);
        expect(visibleQuestKeys(model)).toEqual(["FactionQuest_Necrophage_Chapter01_Step01"]);
    });

    it("narrows branch options when faction is selected", () => {
        const quests = [
            quest({
                questKey: "FactionQuest_Kin_Chapter01_Step01",
                displayName: "Kin Opening",
                branchLabel: "Kin Accord",
                inferredFactionKey: "Faction_Kin",
                inferredQuestLineKey: "FactionQuest_Kin",
                choices: [],
            }),
            quest({
                questKey: "FactionQuest_Aspects_Chapter01_Step01",
                displayName: "Aspect Opening",
                branchLabel: "Aspect Accord",
                inferredFactionKey: "Faction_Aspects",
                inferredQuestLineKey: "FactionQuest_Aspects",
                questSequenceIndex: 2,
                choices: [],
            }),
        ];

        const model = buildModel({ quests, filters: { faction: "Kin" } });

        expect(optionLabels(model.branchVariantOptions)).toEqual(["Any branch/variant", "Kin Accord"]);
        expect(visibleQuestKeys(model)).toEqual(["FactionQuest_Kin_Chapter01_Step01"]);
    });

    it("narrows branch options when chapter is selected inside a faction", () => {
        const quests = [
            quest({
                questKey: "FactionQuest_Kin_Chapter01_Step01",
                displayName: "Kin First",
                branchLabel: "First Chapter Path",
                chapterNumber: 1,
                inferredFactionKey: "Faction_Kin",
                inferredQuestLineKey: "FactionQuest_Kin",
                choices: [],
            }),
            quest({
                questKey: "FactionQuest_Kin_Chapter02_Step01",
                displayName: "Kin Second",
                branchLabel: "Second Chapter Path",
                chapterIndex: 1,
                chapterNumber: 2,
                questSequenceIndex: 2,
                inferredFactionKey: "Faction_Kin",
                inferredQuestLineKey: "FactionQuest_Kin",
                choices: [],
            }),
            quest({
                questKey: "FactionQuest_Aspects_Chapter01_Step01",
                displayName: "Aspect First",
                branchLabel: "Aspect First Path",
                chapterNumber: 1,
                questSequenceIndex: 3,
                inferredFactionKey: "Faction_Aspects",
                inferredQuestLineKey: "FactionQuest_Aspects",
                choices: [],
            }),
        ];

        const model = buildModel({ quests, filters: { faction: "Kin", chapter: "Chapter 1" } });

        expect(optionLabels(model.branchVariantOptions)).toEqual(["Any branch/variant", "First Chapter Path"]);
        expect(visibleQuestKeys(model)).toEqual(["FactionQuest_Kin_Chapter01_Step01"]);
    });

    it("narrows facet counts with search text", () => {
        const quests = [
            quest({
                questKey: "FactionQuest_Kin_Chapter01_Step01",
                displayName: "Quiet Oath",
                categoryType: "MajorFaction",
                branchLabel: "Kin Oath",
                inferredFactionKey: "Faction_Kin",
                inferredQuestLineKey: "FactionQuest_Kin",
                choices: [],
            }),
            quest({
                questKey: "FactionQuest_Kin_Chapter01_Step02",
                displayName: "Quiet March",
                categoryType: "Curiosity",
                branchLabel: "Kin March",
                questSequenceIndex: 2,
                inferredFactionKey: "Faction_Kin",
                inferredQuestLineKey: "FactionQuest_Kin",
                choices: [],
            }),
            quest({
                questKey: "FactionQuest_Aspects_Chapter01_Step01",
                displayName: "Aspect Memory",
                categoryType: "MajorFaction",
                branchLabel: "Aspect Oath",
                descriptionLines: ["The oath answers from another archive."],
                questSequenceIndex: 3,
                inferredFactionKey: "Faction_Aspects",
                inferredQuestLineKey: "FactionQuest_Aspects",
                choices: [],
            }),
        ];

        const model = buildModel({ quests, filters: { searchText: "oath" } });

        expect(model.factionOptions).toEqual([
            { value: "Aspects", label: "Aspects", count: 1 },
            { value: "Kin", label: "Kin", count: 1 },
        ]);
        expect(model.categoryOptions).toEqual([
            { value: "MajorFaction", label: "MajorFaction", count: 2 },
        ]);
        expect(optionLabels(model.branchVariantOptions)).toEqual([
            "Any branch/variant",
            "Aspect Oath",
            "Kin Oath",
        ]);
        expect(visibleQuestKeys(model)).toEqual([
            "FactionQuest_Kin_Chapter01_Step01",
            "FactionQuest_Aspects_Chapter01_Step01",
        ]);
    });

    it("resets an invalid selected facet after another filter changes", () => {
        const quests = [
            quest({
                questKey: "FactionQuest_Kin_Chapter01_Step01",
                displayName: "Kin Opening",
                branchLabel: "Kin Accord",
                inferredFactionKey: "Faction_Kin",
                inferredQuestLineKey: "FactionQuest_Kin",
                choices: [],
            }),
            quest({
                questKey: "FactionQuest_Aspects_Chapter01_Step01",
                displayName: "Aspect Opening",
                branchLabel: "Aspect Accord",
                inferredFactionKey: "Faction_Aspects",
                inferredQuestLineKey: "FactionQuest_Aspects",
                questSequenceIndex: 2,
                choices: [],
            }),
        ];

        const model = buildModel({ quests, filters: { faction: "Kin", branchVariant: "Aspect Accord" } });

        expect(model.filters.branchVariant).toBe(QUEST_ARCHIVE_ALL);
        expect(optionLabels(model.branchVariantOptions)).toEqual(["Any branch/variant", "Kin Accord"]);
        expect(visibleQuestKeys(model)).toEqual(["FactionQuest_Kin_Chapter01_Step01"]);
    });

    it("supports branch filters from quest DTO data", () => {
        const quests = [
            quest({
                questKey: "Quest_A",
                mandatory: true,
                branchLabel: "Scholar Variant",
            }),
            quest({
                questKey: "Quest_B",
                displayName: "Quiet Optional",
                questSequenceIndex: 2,
                mandatory: false,
                choices: [],
            }),
        ];

        expect(visibleQuestKeys(buildModel({ quests, filters: { branchVariant: "Scholar Variant" } }))).toEqual(["Quest_A"]);
        expect(visibleQuestKeys(buildModel({ quests, filters: { branchVariant: QUEST_ARCHIVE_ALL } }))).toEqual(["Quest_A", "Quest_B"]);
    });
});
