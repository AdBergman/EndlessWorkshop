import { describe, expect, it } from "vitest";

import { normalizeQuestExplorer } from "./questExplorerNormalizer";

describe("questExplorerNormalizer", () => {
    it("preserves requirement and reward metadata used by Strategy Codex links", () => {
        const normalized = normalizeQuestExplorer({
            exportKind: "quest_explorer",
            schemaVersion: "quest_explorer.v3",
            gameVersion: null,
            exporterVersion: null,
            exportedAtUtc: null,
            progression: null,
            entries: [{
                entryKey: "Quest_Formula",
                title: "Formula Quest",
                strategyView: {
                    objectives: [{
                        objectiveKey: "Objective_Formula",
                        choiceKey: " Choice_Formula ",
                        text: "Resolve the formula objective.",
                        requirements: [{
                            requirementKey: "Requirement_Objective",
                            kind: "Tech",
                            displayText: "Research Cartography.",
                            referenceKind: "Tech",
                            referenceKey: "Technology_Cartography",
                            referenceDisplayName: "Cartography",
                            codexEntryKey: "Technology_Cartography",
                        }],
                        rewards: [{
                            rewardKey: "Reward_Objective",
                            kind: "Money",
                            displayText: "Gain Dust based on technology era.",
                            formulaText: "50 + 50 * Technology Era",
                            referenceKind: "Unit",
                            referenceKey: "Unit_KinOfSheredyn_Chosen",
                            referenceDisplayName: "Chosen",
                            assetKind: "Unit",
                            assetKey: "Unit_KinOfSheredyn_Chosen",
                            assetDisplayName: "Chosen",
                        }],
                    }],
                },
                branches: [{
                    branchKey: "Branch_Formula",
                    label: "Choose the formula branch",
                    strategy: {
                        rewards: [{
                            rewardKey: "Reward_Branch",
                            kind: "Influence",
                            displayText: "Gain Influence based on technology era.",
                            formulaText: "5 + 5 * Technology Era",
                        }],
                    },
                }],
            }],
        } as any);

        const entry = normalized.entries[0];
        expect(entry?.strategyView.objectives[0]?.choiceKey).toBe("Choice_Formula");
        expect(entry?.strategyView.objectives[0]?.requirements[0]).toEqual(expect.objectContaining({
            displayText: "Research Cartography.",
            referenceKind: "Tech",
            referenceKey: "Technology_Cartography",
            referenceDisplayName: "Cartography",
            codexEntryKey: "Technology_Cartography",
        }));
        expect(entry?.strategyView.objectives[0]?.rewards[0]).toEqual(expect.objectContaining({
            displayText: "Gain Dust based on technology era.",
            formulaText: "50 + 50 * Technology Era",
            referenceKind: "Unit",
            referenceKey: "Unit_KinOfSheredyn_Chosen",
            assetKind: "Unit",
            assetKey: "Unit_KinOfSheredyn_Chosen",
            assetDisplayName: "Chosen",
        }));
        expect(entry?.branches[0]?.strategy?.rewards[0]).toEqual(expect.objectContaining({
            displayText: "Gain Influence based on technology era.",
            formulaText: "5 + 5 * Technology Era",
        }));
    });
});
