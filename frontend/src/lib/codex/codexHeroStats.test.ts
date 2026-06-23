import { getCodexHeroStatGroups, getCodexHeroStatLines } from "@/lib/codex/codexHeroStats";
import type { CodexEntry } from "@/types/dataTypes";

const heroEntry = (lines: string[]): CodexEntry => ({
    exportKind: "heroes",
    entryKey: "Hero_Test",
    displayName: "Test Hero",
    descriptionLines: [],
    referenceKeys: [],
    sections: [{ title: "Stats", lines }],
});

describe("codexHeroStats", () => {
    it("reads exact exported Hero stats and groups base stats before scaling stats", () => {
        const entry = heroEntry([
            "+140 [Health] Health",
            "+40 [Damage] Damage",
            "+10 [Defense] Defense",
            "+3 [MovementPoints] Movement Points",
            "+5% [Experience] Experience gain per [Intuition] Intuition",
        ]);

        expect(getCodexHeroStatLines(entry)).toEqual([
            "+140 [Health] Health",
            "+40 [Damage] Damage",
            "+10 [Defense] Defense",
            "+3 [MovementPoints] Movement Points",
            "+5% [Experience] Experience gain per [Intuition] Intuition",
        ]);

        expect(getCodexHeroStatGroups(entry)).toEqual([
            {
                key: "base",
                label: "Base stats",
                lines: [
                    "+40 [Damage] Damage",
                    "+140 [Health] Health",
                    "+10 [Defense] Defense",
                    "+3 [MovementPoints] Movement Points",
                ],
            },
            {
                key: "scaling",
                label: "Scaling",
                lines: ["+5% [Experience] Experience gain per [Intuition] Intuition"],
            },
        ]);
    });

    it("fails closed for non-Hero entries and missing stats", () => {
        expect(getCodexHeroStatGroups({ ...heroEntry([]), exportKind: "units" })).toEqual([]);
        expect(getCodexHeroStatGroups({ ...heroEntry([]), sections: [] })).toEqual([]);
    });
});
