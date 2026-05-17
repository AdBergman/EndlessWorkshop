import { Faction, type FactionInfo } from "@/types/dataTypes";
import type { QuestChoiceDto, QuestDialogBlockDto, QuestDto, QuestStepDto } from "@/types/questTypes";
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

const dialogBlock = (overrides: Partial<QuestDialogBlockDto> = {}): QuestDialogBlockDto => ({
    identity: "Root_A",
    questKey: "Quest_A",
    choiceKey: null,
    stepIndex: null,
    parentScope: "QUEST",
    dialogKey: "Dialog_A",
    phase: "intro",
    expectedLineCount: 1,
    blockOrder: 0,
    lines: [
        {
            lineOrder: 0,
            sourceLineIndex: 1,
            role: "narrator",
            speakerLabel: null,
            text: "The archive speaks.",
        },
    ],
    ...overrides,
});

const kinFaction: FactionInfo = {
    isMajor: true,
    enumFaction: Faction.KIN,
    uiLabel: "Kin",
    minorName: null,
};

const necrophageFaction: FactionInfo = {
    isMajor: true,
    enumFaction: Faction.NECROPHAGES,
    uiLabel: "Necrophages",
    minorName: null,
};

const buildModel = ({
    quests,
    dialogBlocksByIdentity = {},
    selectedQuestKey = null,
    filters = {},
    currentFaction = kinFaction,
}: {
    quests: QuestDto[];
    dialogBlocksByIdentity?: Record<string, QuestDialogBlockDto>;
    selectedQuestKey?: string | null;
    filters?: Partial<QuestArchiveFilters>;
    currentFaction?: FactionInfo;
}) =>
    buildQuestArchiveModel({
        quests,
        dialogBlocksByIdentity,
        selectedQuestKey,
        currentFaction,
        filters: {
            ...defaultQuestArchiveFilters,
            ...filters,
        },
    });

const visibleQuestKeys = (model: ReturnType<typeof buildModel>) =>
    model.rail.items.flatMap((item) => item.memberQuestKeys);

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
        expect(visibleQuestKeys(buildModel({ quests, filters: { searchText: "sapphire accord", sort: "relevance" } }))).toContain("Quest_A");
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

    it("filters against the current top-nav faction with singular and plural faction labels", () => {
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
            currentFaction: necrophageFaction,
            filters: { currentFactionOnly: true },
        });

        expect(visibleQuestKeys(model)).toEqual(["FactionQuest_Necrophage_Chapter01_Step01"]);
    });

    it("supports transcript, requirement, and branch filters from quest DTO data", () => {
        const quests = [
            quest({
                questKey: "Quest_A",
                rootDialogBlockIdentities: ["Root_A"],
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
        const dialogBlocksByIdentity = {
            Root_A: dialogBlock(),
        };

        expect(visibleQuestKeys(buildModel({ quests, dialogBlocksByIdentity, filters: { transcript: "has" } }))).toEqual(["Quest_A"]);
        expect(visibleQuestKeys(buildModel({ quests, dialogBlocksByIdentity, filters: { requirement: "required" } }))).toEqual(["Quest_A"]);
        expect(visibleQuestKeys(buildModel({ quests, dialogBlocksByIdentity, filters: { branchVariant: "Scholar Variant" } }))).toEqual(["Quest_A"]);
        expect(visibleQuestKeys(buildModel({ quests, dialogBlocksByIdentity, filters: { branchVariant: QUEST_ARCHIVE_ALL } }))).toEqual(["Quest_A", "Quest_B"]);
    });
});
