import { describe, expect, it } from "vitest";
import { mockQuestExplorerExport } from "./mockQuestExplorerExport";
import { buildQuestExplorerPrototypeViewModel } from "./questExplorerPrototypeViewModel";

describe("questExplorerPrototypeViewModel", () => {
    it("uses the documented quest_explorer.v3 fixture surface", () => {
        expect(mockQuestExplorerExport.exportKind).toBe("quest_explorer");
        expect(mockQuestExplorerExport.schemaVersion).toBe("quest_explorer.v3");
        expect(mockQuestExplorerExport.entries.length).toBeGreaterThanOrEqual(10);
        expect(mockQuestExplorerExport.entries.every((entry) => entry.aliases.length > 0)).toBe(true);
        expect(mockQuestExplorerExport.entries.every((entry) => typeof entry.navigation.sequenceIndex === "number")).toBe(true);
    });

    it("resolves aliases without using backend or exporter semantics", () => {
        const viewModel = buildQuestExplorerPrototypeViewModel(mockQuestExplorerExport, {
            mode: "strategy",
            questKey: "FactionQuest_Mukag_Chapter01_Step02",
            branchKey: null,
        });

        expect(viewModel.selectedEntry.entryKey).toBe("mukag.oculum-debate");
        expect(viewModel.branchSummaries).toHaveLength(3);
        expect(viewModel.selectedBranchKey).toBe("mukag.oculum.branch.pious");
        expect(viewModel.contractFeedback).toEqual([]);
    });

    it("groups the rail by faction, questline, chapter, and explicit branch labels", () => {
        const viewModel = buildQuestExplorerPrototypeViewModel(mockQuestExplorerExport, {
            mode: "lore",
            questKey: "curiosity.reliquary",
            branchKey: "curiosity.reliquary.branch.break",
            visitedEntryKeys: ["mukag.monastery-approach", "mukag.oculum-debate"],
        });

        expect(viewModel.rail.map((group) => group.label)).toEqual([
            "Mukag",
            "World Curiosities",
        ]);
        expect(viewModel.rail[1].questLines[0].chapters[0].entries.some((entry) => entry.hasChoices)).toBe(true);
        expect(viewModel.selectedBranchKey).toBe("curiosity.reliquary.branch.break");
        expect(viewModel.branchSummaries.map((branch) => branch.label)).toEqual([
            "Hatch the shell",
            "Seal it again",
            "Break it open",
        ]);
    });

    it("keeps converging branch continuity explicit", () => {
        const viewModel = buildQuestExplorerPrototypeViewModel(mockQuestExplorerExport, {
            mode: "strategy",
            questKey: "curiosity.reliquary-break",
            branchKey: null,
        });

        expect(viewModel.convergenceLinks.map((link) => link.entryKey)).toEqual([
            "curiosity.reliquary-echo",
        ]);
        expect(viewModel.missingReferenceKeys).toEqual([]);
    });
});
