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
            summaryLines: ["The same chronicle page carries both steps."],
            loreView: {
                sections: [{
                    sectionKey: "Quest_Shared:lore:owned",
                    phase: "intro",
                    choiceKey: "Choice_Continue",
                    stepIndex: 0,
                    objectiveKey: "Objective_Continue",
                    revealedByBranchKeys: ["Branch_Continue"],
                    revealedByChoiceKeys: ["Choice_Continue"],
                    revealedByBranchPathAlternatives: [["Branch_Setup", "Branch_Continue"]],
                    lines: [{ speakerLabel: null, role: "narrator", text: "The continuation owns this chronicle beat." }],
                }],
            },
            strategyView: {
                objectives: [{
                    objectiveKey: "Objective_Continue",
                    text: "Resolve the continuation.",
                    phase: "completion",
                    revealedByBranchKeys: ["Branch_Continue"],
                    revealedByChoiceKeys: ["Choice_Continue"],
                    revealedByBranchPathAlternatives: [["Branch_Setup", "Branch_Continue"]],
                    requirements: [],
                    rewards: [],
                }],
            },
            branches: [
                {
                    branchKey: "Branch_Setup",
                    choiceKey: "Choice_Setup",
                    label: "Prepare the site",
                    orderIndex: 1,
                    groupKey: "Group_Setup",
                    groupLabel: "Setup",
                    sectionRole: "artifact",
                    branchStepOrder: 1,
                    nextEntryKeys: [],
                    failureEntryKeys: [],
                    convergesIntoEntryKeys: [],
                    lore: null,
                    strategy: null,
                },
                {
                    branchKey: "Branch_Continue",
                    choiceKey: "Choice_Continue",
                    label: "Continue the chronicle",
                    orderIndex: 2,
                    groupKey: "Group_Continue",
                    groupLabel: "Continuation",
                    choiceGroupKey: "ChoiceGroup_Continue",
                    sectionRole: "continuation",
                    parentBranchKey: "Branch_Setup",
                    prerequisiteBranchKeys: ["Branch_Setup"],
                    prerequisiteBranchPath: ["Branch_Setup"],
                    branchStepOrder: 2,
                    nextEntryKeys: ["Quest_Branch"],
                    failureEntryKeys: [],
                    convergesIntoEntryKeys: [],
                    lore: null,
                    strategy: null,
                },
                {
                    branchKey: "Branch_Continue_Alternate",
                    choiceKey: "Choice_Continue_Alternate",
                    label: "Continue through the alternate chronicle",
                    orderIndex: 3,
                    groupKey: "Group_Continue",
                    groupLabel: "Continuation",
                    choiceGroupKey: "ChoiceGroup_Continue",
                    sectionRole: "continuation",
                    parentBranchKey: "Branch_Setup",
                    prerequisiteBranchKeys: ["Branch_Setup"],
                    prerequisiteBranchPath: ["Branch_Setup"],
                    branchStepOrder: 2,
                    nextEntryKeys: ["Quest_Branch"],
                    failureEntryKeys: [],
                    convergesIntoEntryKeys: [],
                    lore: null,
                    strategy: null,
                },
                {
                    branchKey: "Branch_Decision_A",
                    choiceKey: "Choice_Decision_A",
                    label: "Hold",
                    orderIndex: 4,
                    groupKey: "Group_Decision",
                    groupLabel: "Decision",
                    choiceGroupKey: "ChoiceGroup_Decision",
                    sectionRole: "true_choice",
                    branchStepOrder: 3,
                    nextEntryKeys: ["Quest_Branch"],
                    failureEntryKeys: [],
                    convergesIntoEntryKeys: [],
                    lore: null,
                    strategy: null,
                },
                {
                    branchKey: "Branch_Decision_B",
                    choiceKey: "Choice_Decision_B",
                    label: "Yield",
                    orderIndex: 5,
                    groupKey: "Group_Decision",
                    groupLabel: "Decision",
                    choiceGroupKey: "ChoiceGroup_Decision",
                    sectionRole: "true_choice",
                    branchStepOrder: 3,
                    nextEntryKeys: ["Quest_Branch"],
                    failureEntryKeys: [],
                    convergesIntoEntryKeys: [],
                    lore: null,
                    strategy: null,
                },
                {
                    branchKey: "Branch_Topology_A",
                    choiceKey: "Choice_Topology_A",
                    label: "Eastern record",
                    orderIndex: 6,
                    groupKey: "Group_Topology",
                    groupLabel: "Topology",
                    branchStepOrder: 4,
                    nextEntryKeys: ["Quest_Branch"],
                    failureEntryKeys: [],
                    convergesIntoEntryKeys: [],
                    lore: null,
                    strategy: null,
                },
                {
                    branchKey: "Branch_Topology_B",
                    choiceKey: "Choice_Topology_B",
                    label: "Western record",
                    orderIndex: 7,
                    groupKey: "Group_Topology",
                    groupLabel: "Topology",
                    branchStepOrder: 4,
                    nextEntryKeys: ["Quest_Branch"],
                    failureEntryKeys: [],
                    convergesIntoEntryKeys: [],
                    lore: null,
                    strategy: null,
                },
                {
                    branchKey: "Branch_Unresolved",
                    choiceKey: "Choice_Unresolved",
                    label: "Unknown future",
                    orderIndex: 8,
                    groupKey: "Group_Unresolved",
                    groupLabel: "Unresolved",
                    sectionRole: "unresolved",
                    branchStepOrder: 5,
                    nextEntryKeys: [],
                    failureEntryKeys: [],
                    convergesIntoEntryKeys: [],
                    lore: null,
                    strategy: null,
                },
                {
                    branchKey: "Branch_Converge",
                    choiceKey: "Choice_Converge",
                    label: "Rejoin",
                    orderIndex: 9,
                    groupKey: "Group_Converge",
                    groupLabel: "Convergence",
                    sectionRole: "convergence",
                    branchStepOrder: 6,
                    nextEntryKeys: [],
                    failureEntryKeys: [],
                    convergesIntoEntryKeys: ["Quest_Branch"],
                    lore: null,
                    strategy: null,
                },
                {
                    branchKey: "Branch_Terminal",
                    choiceKey: "Choice_Terminal",
                    label: "End",
                    orderIndex: 10,
                    groupKey: "Group_Terminal",
                    groupLabel: "Terminal",
                    sectionRole: "terminal",
                    branchStepOrder: 7,
                    nextEntryKeys: [],
                    failureEntryKeys: [],
                    convergesIntoEntryKeys: [],
                    lore: null,
                    strategy: null,
                },
                {
                    branchKey: "Branch_Failure",
                    choiceKey: "Choice_Failure",
                    label: "Fail",
                    orderIndex: 11,
                    groupKey: "Group_Failure",
                    groupLabel: "Failure",
                    sectionRole: "failure",
                    branchStepOrder: 8,
                    nextEntryKeys: [],
                    failureEntryKeys: ["Quest_Branch"],
                    convergesIntoEntryKeys: [],
                    lore: null,
                    strategy: null,
                },
            ],
        }),
        entry("Quest_Branch", "Variant Outcome", {
            navigation: {
                ...entry("Quest_Branch", "Variant Outcome").navigation,
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
                                        title: "Variant Outcome",
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
        expect(diagnostic.semanticCounts).toMatchObject({
            setup_task: 1,
            deterministic_continuation: 2,
            explicit_decision_option: 2,
            topology_fork_option: 2,
            convergence: 1,
            terminal: 1,
            failure: 1,
            unresolved: 1,
            internal_variant: 1,
            true_choice_groups: 1,
            topology_forks_without_true_choice: 1,
            grouped_deterministic_continuation_groups: 1,
            alias_owned_stages: 1,
            chapter_variants: 1,
            lore_ownership_gaps: 0,
            objective_ownership_gaps: 0,
        });
        expect(diagnostic.reportText).toContain("Canonical semantic taxonomy:");
        expect(diagnostic.reportText).toContain("reference: docs/quest_explorer_canonical_semantics_v1.md");
        expect(diagnostic.reportText).toContain("setup/artifact rows: 1");
        expect(diagnostic.reportText).toContain("deterministic continuations: 2");
        expect(diagnostic.reportText).toContain("grouped deterministic continuation groups: 1");
        expect(diagnostic.reportText).toContain("true-choice groups: 1");
        expect(diagnostic.reportText).toContain("topology forks without true_choice: 1");
        expect(diagnostic.reportText).toContain("unresolved continuations: 1");
        expect(diagnostic.reportText).toContain("convergence states: 1");
        expect(diagnostic.reportText).toContain("terminal states: 1");
        expect(diagnostic.reportText).toContain("failure states/links: 1");
        expect(diagnostic.perFactionSummaries[0]).toEqual(expect.objectContaining({
            label: "Kin",
            entries: 2,
            semanticChapters: 1,
            navigationChapterGroups: 1,
            setupArtifactRows: 1,
            deterministicContinuations: 2,
            explicitDecisionGroups: 1,
            explicitDecisionOptionRows: 2,
            topologyForksWithoutTrueChoice: 1,
            groupedDeterministicContinuationGroups: 1,
            convergenceRows: 1,
            convergenceGroups: 1,
            terminalRows: 1,
            failureLinks: 1,
            unresolvedContinuations: 1,
            internalVariants: 1,
            aliases: 1,
            unknownClassifications: 0,
            notableWarnings: [],
        }));
        expect(diagnostic.perFactionSummaries.find((summary) => summary.label === "Aspect")).toEqual(expect.objectContaining({
            entries: 0,
            semanticChapters: 0,
            notableWarnings: ["no entries found for configured faction keys"],
        }));
        expect(diagnostic.reportText).toContain("Per-faction semantic summaries:");
        expect(diagnostic.reportText).toContain("  Kin:");
        expect(diagnostic.reportText).toContain("    explicit decision groups/options: 1/2");
        expect(diagnostic.reportText).toContain("    convergence rows/groups: 1/1");
        expect(diagnostic.reportText).toContain("    notable warnings/gaps: none");
        expect(diagnostic.reportText).toContain("Internal/chapter variants stay in detail/chronicle context, not rail rows (1 variant(s)).");
        expect(diagnostic.reportText).toContain("Repeated detailEntryKey Quest_Shared is represented as alias-owned projection content across 2 progression projection stage(s).");
        expect(diagnostic.reportText).toContain("Canonical semantic taxonomy summary recorded for semantic rows");
        expect(diagnostic.reportText).toContain("Frontend progression inference symbols are absent");
    });

    it("blocks missing progression semantics instead of accepting frontend inference", () => {
        const diagnostic = createQuestExplorerFrontendDiagnostic(
            { ...diagnosticPayload, progression: null },
            { sourceTexts: { "questRail.ts": "inferQuestProgression" } }
        );

        expect(diagnostic.reportText).toContain("Quest Explorer response is missing backend progression DTO semantics.");
        expect(diagnostic.reportText).toContain("Frontend progression inference symbols present: questRail.ts:inferQuestProgression");
        expect(diagnostic.perFactionSummaries[0]).toEqual(expect.objectContaining({
            label: "Kin",
            semanticChapters: null,
            notableWarnings: ["progression DTO missing; semantic chapter count unavailable"],
        }));
        expect(diagnostic.reportText).toContain("semantic chapters: n/a (progression DTO missing)");
        expect(diagnostic.findings.filter((finding) => finding.classification === "blocker")).toHaveLength(2);
    });

    it("warns when lore or objective ownership metadata points outside exported topology keys", () => {
        const diagnostic = createQuestExplorerFrontendDiagnostic({
            ...diagnosticPayload,
            entries: [
                {
                    ...diagnosticPayload.entries[0],
                    loreView: {
                        sections: [{
                            sectionKey: "Quest_Shared:lore:missing-owner",
                            phase: "intro",
                            choiceKey: "Missing_Choice",
                            stepIndex: 0,
                            objectiveKey: "Objective_Missing",
                            revealedByBranchKeys: ["Missing_Branch"],
                            revealedByChoiceKeys: ["Missing_Choice"],
                            revealedByBranchPathAlternatives: [["Branch_Setup", "Missing_Branch"]],
                            lines: [{ speakerLabel: null, role: "narrator", text: "This owner cannot be resolved." }],
                        }],
                    },
                    strategyView: {
                        objectives: [{
                            objectiveKey: "Objective_Missing",
                            text: "Resolve a missing owner.",
                            phase: "completion",
                            revealedByBranchKeys: ["Missing_Branch"],
                            revealedByChoiceKeys: ["Missing_Choice"],
                            revealedByBranchPathAlternatives: [["Missing_Branch"]],
                            requirements: [],
                            rewards: [],
                        }],
                    },
                },
                ...diagnosticPayload.entries.slice(1),
            ],
        }, {
            sourceTexts: {
                "QuestExplorerPage.tsx": "findDetailProgression buildQuestRailGroups",
            },
        });

        expect(diagnostic.semanticCounts.lore_ownership_gaps).toBe(4);
        expect(diagnostic.semanticCounts.objective_ownership_gaps).toBe(3);
        expect(diagnostic.reportText).toContain("Lore ownership gaps: 4 owner reference(s) do not match exported branch/choice keys.");
        expect(diagnostic.reportText).toContain("Objective ownership gaps: 3 owner reference(s) do not match exported branch/choice keys.");
    });
});
