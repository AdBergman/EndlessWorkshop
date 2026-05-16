import { describe, expect, it } from "vitest";
import type { CodexEntry } from "@/types/dataTypes";
import { isCodexQuestGroupEntry } from "./codexPresentation";
import { groupQuestListItems } from "./codexQuestGrouping";

function quest(entryKey: string, displayName = "A Bitter Truth"): CodexEntry {
    return {
        exportKind: "quests",
        entryKey,
        displayName,
        category: "MajorFaction",
        kind: "Quest",
        descriptionLines: [`${displayName} description.`],
        referenceKeys: [],
    };
}

const bitterTruthNodeKeys = [
    "Step01",
    "Step02",
    "Step03",
    "Step03_Choice01",
    "Step03_Choice02",
    "Step04",
    "Step04_Choice01",
    "Step04_Choice02",
    "Step04_Choice03",
];

describe("groupQuestListItems", () => {
    it("groups same-title quest nodes by questline and chapter", () => {
        const grouped = groupQuestListItems([
            quest("FactionQuest_Necrophage02_Chapter06_Step01"),
            quest("FactionQuest_Necrophage02_Chapter06_Step02"),
            quest("FactionQuest_Necrophage02_Chapter06_Step03_Choice01"),
        ]);

        expect(grouped).toHaveLength(1);
        expect(isCodexQuestGroupEntry(grouped[0])).toBe(true);
        if (!isCodexQuestGroupEntry(grouped[0])) return;

        expect(grouped[0].displayName).toBe("A Bitter Truth");
        expect(grouped[0].groupContext).toBe("Necrophage · Chapter 6");
        expect(grouped[0].nodeCount).toBe(3);
        expect(grouped[0].variantCount).toBe(1);
        expect(grouped[0].variants[0].variantLabel).toBe("Alternate questline 2");
        expect(grouped[0].nodes.map((entry) => entry.entryKey)).toEqual([
            "FactionQuest_Necrophage02_Chapter06_Step01",
            "FactionQuest_Necrophage02_Chapter06_Step02",
            "FactionQuest_Necrophage02_Chapter06_Step03_Choice01",
        ]);
    });

    it("nests numbered questline variants under the base quest and chapter group", () => {
        const grouped = groupQuestListItems([
            quest("FactionQuest_Necrophage_Chapter06_Step01"),
            quest("FactionQuest_Necrophage_Chapter06_Step02"),
            quest("FactionQuest_Necrophage02_Chapter06_Step01"),
            quest("FactionQuest_Necrophage02_Chapter06_Step02"),
        ]);

        expect(grouped).toHaveLength(1);
        expect(isCodexQuestGroupEntry(grouped[0])).toBe(true);
        if (!isCodexQuestGroupEntry(grouped[0])) return;

        expect(grouped[0].groupContext).toBe("Necrophage · Chapter 6");
        expect(grouped[0].nodeCount).toBe(4);
        expect(grouped[0].variants.map((variant) => variant.variantLabel)).toEqual([
            "Main questline",
            "Alternate questline 2",
        ]);
    });

    it("summarizes A Bitter Truth variant groups without exposing numbered roots as top-level rows", () => {
        const grouped = groupQuestListItems([
            ...bitterTruthNodeKeys.map((nodeKey) => quest(`FactionQuest_Necrophage_Chapter06_${nodeKey}`)),
            ...bitterTruthNodeKeys.map((nodeKey) => quest(`FactionQuest_Necrophage02_Chapter06_${nodeKey}`)),
        ]);

        expect(grouped).toHaveLength(1);
        expect(isCodexQuestGroupEntry(grouped[0])).toBe(true);
        if (!isCodexQuestGroupEntry(grouped[0])) return;

        expect(grouped[0].displayName).toBe("A Bitter Truth");
        expect(grouped[0].groupContext).toBe("Necrophage · Chapter 6");
        expect(grouped[0].nodeCount).toBe(18);
        expect(grouped[0].variantCount).toBe(2);
        expect(grouped[0].variants.map((variant) => [variant.variantLabel, variant.nodeCount])).toEqual([
            ["Main questline", 9],
            ["Alternate questline 2", 9],
        ]);
    });

    it("groups KinOfSheredyn numbered roots as variants and keeps nested choice labels sortable", () => {
        const grouped = groupQuestListItems([
            quest("FactionQuest_KinOfSheredyn_Chapter01_Step02_Choice01", "Stirrings"),
            quest("FactionQuest_KinOfSheredyn02_Chapter01_Step02_Choice01", "Stirrings"),
            quest("FactionQuest_KinOfSheredyn02_Chapter01_Step02_Choice01_Choice02", "Stirrings"),
        ]);

        expect(grouped).toHaveLength(1);
        expect(isCodexQuestGroupEntry(grouped[0])).toBe(true);
        if (!isCodexQuestGroupEntry(grouped[0])) return;

        expect(grouped[0].groupContext).toBe("Kin Of Sheredyn · Chapter 1");
        expect(grouped[0].variants.map((variant) => variant.variantLabel)).toEqual([
            "Main questline",
            "Alternate questline 2",
        ]);
        expect(grouped[0].variants[1].nodes.map((entry) => entry.entryKey)).toEqual([
            "FactionQuest_KinOfSheredyn02_Chapter01_Step02_Choice01",
            "FactionQuest_KinOfSheredyn02_Chapter01_Step02_Choice01_Choice02",
        ]);
    });

    it("sorts numbered variants numerically", () => {
        const grouped = groupQuestListItems([
            quest("FactionQuest_Necrophage10_Chapter06_Step01"),
            quest("FactionQuest_Necrophage02_Chapter06_Step01"),
            quest("FactionQuest_Necrophage_Chapter06_Step01"),
        ]);

        expect(grouped).toHaveLength(1);
        expect(isCodexQuestGroupEntry(grouped[0])).toBe(true);
        if (!isCodexQuestGroupEntry(grouped[0])) return;

        expect(grouped[0].variants.map((variant) => variant.variantLabel)).toEqual([
            "Main questline",
            "Alternate questline 2",
            "Alternate questline 10",
        ]);
    });

    it("does not merge same-title quest nodes from different base questlines", () => {
        const grouped = groupQuestListItems([
            quest("FactionQuest_Necrophage_Chapter06_Step01"),
            quest("FactionQuest_Necrophage_Chapter06_Step02"),
            quest("FactionQuest_KinOfSheredyn_Chapter06_Step01"),
            quest("FactionQuest_KinOfSheredyn_Chapter06_Step02"),
        ]);

        expect(grouped).toHaveLength(2);
        expect(grouped.filter(isCodexQuestGroupEntry).map((group) => group.groupContext)).toEqual([
            "Necrophage · Chapter 6",
            "Kin Of Sheredyn · Chapter 6",
        ]);
    });

    it("does not group non-major-faction quest patterns without a safe FactionQuest root", () => {
        const grouped = groupQuestListItems([
            quest("Quest_Curiosity_A_Branch01", "Found in the Dust"),
            quest("Quest_Curiosity_A_Branch02", "Found in the Dust"),
        ]);

        expect(grouped).toHaveLength(2);
        expect(grouped.some(isCodexQuestGroupEntry)).toBe(false);
    });

    it("does not group non-quest duplicate names", () => {
        const grouped = groupQuestListItems([
            {
                exportKind: "traits",
                entryKey: "Trait_A",
                displayName: "Castle Lords",
                descriptionLines: [],
                referenceKeys: [],
            },
            {
                exportKind: "traits",
                entryKey: "Trait_B",
                displayName: "Castle Lords",
                descriptionLines: [],
                referenceKeys: [],
            },
        ]);

        expect(grouped).toHaveLength(2);
        expect(grouped.some(isCodexQuestGroupEntry)).toBe(false);
    });
});
