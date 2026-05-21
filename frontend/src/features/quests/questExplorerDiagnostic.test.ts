import { describe, expect, it } from "vitest";
import { createQuestExplorerFrontendDiagnostic } from "@/features/quests/questExplorerDiagnostic";
import type { QuestExplorerResponse } from "@/types/questTypes";

const entry = (entryKey: string, title: string, overrides: Partial<QuestExplorerResponse["entries"][number]> = {}): QuestExplorerResponse["entries"][number] => ({
    entryKey,
    title,
    summaryLines: [],
    questType: "Faction Quest",
    isMandatory: null,
    isKeyNarrativeBeat: null,
    aliases: [],
    navigation: {
        factionKey: "Faction_Kin",
        factionName: "Kin",
        questLineKey: "Line_Shared",
        questLineName: "Shared Line",
        chapter: 4,
        chapterLabel: "Chapter 4",
        step: 1,
        stepLabel: "Step 1",
        sequenceIndex: 0,
        chapterOrder: 4,
        stepOrder: 1,
        branchGroupKey: null,
        branchLabel: null,
        branchOrder: null,
        isBranchStart: null,
        isBranchEnd: null,
        previousEntryKeys: [],
        nextEntryKeys: [],
        failureEntryKeys: [],
        convergesIntoEntryKeys: [],
    },
    loreView: { sections: [] },
    strategyView: { objectives: [] },
    branches: [],
    quality: null,
    ...overrides,
});

const diagnosticPayload: QuestExplorerResponse = {
    gameVersion: "0.80",
    exporterVersion: "diagnostic",
    exportedAtUtc: "deterministic",
    exportKind: "quest_explorer",
    schemaVersion: "quest_explorer.v3",
    entries: [
        entry("Quest_Shared", "Shared Chronicle", {
            aliases: ["Quest_Shared_Alias_Step02"],
            summaryLines: ["The same chronicle page carries both beats."],
        }),
        entry("Quest_Branch", "Branch Choice", {
            navigation: {
                ...entry("Quest_Branch", "Branch Choice").navigation,
                sequenceIndex: 1,
                branchGroupKey: "Quest_Shared",
                branchLabel: "Shared fork",
                branchOrder: 1,
            },
        }),
        entry("Quest_Minor", "Minor Envoy", {
            questType: "Minor Faction Quest",
            navigation: {
                ...entry("Quest_Minor", "Minor Envoy").navigation,
                factionKey: "MinorFaction_Ametrine",
                factionName: "Ametrine",
                questLineKey: "MinorFaction_SpecificQuest_Ametrine",
                questLineName: "Ametrine",
                chapter: null,
                chapterLabel: null,
                step: null,
                stepLabel: null,
                sequenceIndex: 2,
                chapterOrder: null,
                stepOrder: null,
            },
        }),
        entry("Quest_World", "World Signal", {
            questType: "Curiosity",
            navigation: {
                ...entry("Quest_World", "World Signal").navigation,
                factionKey: null,
                factionName: null,
                questLineKey: "World",
                questLineName: "World Quests",
                chapter: null,
                chapterLabel: null,
                step: null,
                stepLabel: null,
                sequenceIndex: 3,
                chapterOrder: null,
                stepOrder: null,
            },
        }),
    ],
    progression: {
        questlines: [
            {
                questLineKey: "Line_Shared",
                questLineFamilyKey: "Line_Shared",
                questLineName: "Shared Line",
                factionKey: "Faction_Kin",
                factionFamilyKey: "Faction_Kin",
                factionName: "Kin",
                sourceQuestLineKeys: ["Line_Shared"],
                sourceFactionKeys: ["Faction_Kin"],
                chapters: [
                    {
                        chapterNumber: 4,
                        chapterOrder: 4,
                        title: "Shared Chronicle",
                        steps: [
                            {
                                stepKey: "Line_Shared:Faction_Kin:chapter-4:step-1",
                                stepNumber: 1,
                                stepOrder: 1,
                                title: "Shared Chronicle",
                                projectionKind: "real_entry_backed",
                                detailEntryKey: "Quest_Shared",
                                sourceEntryKeys: ["Quest_Shared"],
                                aliasEntryKeys: [],
                                variants: [
                                    {
                                        entryKey: "Quest_Shared",
                                        title: "Shared Chronicle",
                                        variantKind: "entry",
                                        branchGroupKey: null,
                                        branchLabel: null,
                                        branchOrder: null,
                                        previousEntryKeys: [],
                                        nextEntryKeys: [],
                                        failureEntryKeys: [],
                                        convergesIntoEntryKeys: [],
                                    },
                                ],
                            },
                            {
                                stepKey: "Line_Shared:Faction_Kin:chapter-4:step-2",
                                stepNumber: 2,
                                stepOrder: 2,
                                title: "Shared Chronicle Echo",
                                projectionKind: "virtual_alias_expanded",
                                detailEntryKey: "Quest_Shared",
                                sourceEntryKeys: ["Quest_Shared"],
                                aliasEntryKeys: ["Quest_Shared_Alias_Step02"],
                                variants: [
                                    {
                                        entryKey: "Quest_Branch",
                                        title: "Branch Choice",
                                        variantKind: "branch_variant",
                                        branchGroupKey: "Quest_Shared",
                                        branchLabel: "Shared fork",
                                        branchOrder: 1,
                                        previousEntryKeys: [],
                                        nextEntryKeys: [],
                                        failureEntryKeys: [],
                                        convergesIntoEntryKeys: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
        debugSummary: {
            totalEntries: 4,
            questlineFamiliesFound: ["Line_Shared"],
            questlines: [],
            missingMajorFactionChapters: [],
            chaptersWithOnlyOneStep: [],
            numericQuestlineVariantsCollapsed: [],
            entriesWithMissingChapterOrStepOrder: [],
            suspiciousBranchVariantsWithoutParentStep: [],
            tutorialEntriesPlaced: [],
        },
    },
};

describe("quest explorer frontend diagnostic", () => {
    it("reports rail labels, branch variant placement, repeated detailEntryKey handling, and inference scan status", () => {
        const diagnostic = createQuestExplorerFrontendDiagnostic(diagnosticPayload, {
            selectedEntryKey: "Quest_Shared",
            sourceTexts: {
                "QuestExplorerPage.tsx": "findDetailProgression buildQuestRailGroups",
                "questRail.ts": "buildQuestRailGroups getVisibleRailEntries",
            },
        });

        expect(diagnostic.categoryCounts).toMatchObject({
            faction: 1,
            minorFaction: 1,
            world: 1,
        });
        expect(diagnostic.selectedRailItem).toBe("Shared Chronicle | Chapter 4 | 2 steps");
        expect(diagnostic.reportText).toContain("Shared Line: Shared Chronicle | Chapter 4 | 2 steps");
        expect(diagnostic.reportText).toContain("blocker (0):");
        expect(diagnostic.reportText).toContain("Branch variants stay in detail/chronicle context, not rail rows (1 variant(s)).");
        expect(diagnostic.reportText).toContain("Repeated detailEntryKey Quest_Shared is represented as shared content / alias beat across 2 step DTOs.");
        expect(diagnostic.reportText).toContain("Frontend progression inference symbols are absent");
    });

    it("blocks missing progression semantics instead of accepting frontend inference", () => {
        const diagnostic = createQuestExplorerFrontendDiagnostic(
            { ...diagnosticPayload, progression: null },
            { sourceTexts: { "questRail.ts": "inferQuestProgression" } }
        );

        expect(diagnostic.reportText).toContain("Quest Explorer response is missing backend progression DTO semantics.");
        expect(diagnostic.reportText).toContain("Frontend progression inference symbols present: questRail.ts:inferQuestProgression");
        expect(diagnostic.findings.filter((finding) => finding.classification === "blocker")).toHaveLength(2);
    });
});
