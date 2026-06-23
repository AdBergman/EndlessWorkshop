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

    it("renders zero Defense when Hero base stats omit Defense", () => {
        const entry = heroEntry([
            "+140 [Health] Health",
            "+40 [Damage] Damage",
            "+3 [MovementPoints] Movement Points",
        ]);

        expect(getCodexHeroStatLines(entry)).toEqual([
            "+140 [Health] Health",
            "+40 [Damage] Damage",
            "+3 [MovementPoints] Movement Points",
            "0 [Defense] Defense",
        ]);

        expect(getCodexHeroStatGroups(entry)).toEqual([
            {
                key: "base",
                label: "Base stats",
                lines: [
                    "+40 [Damage] Damage",
                    "+140 [Health] Health",
                    "0 [Defense] Defense",
                    "+3 [MovementPoints] Movement Points",
                ],
            },
        ]);
    });

    it("uses exported Defense and does not synthesize Armor", () => {
        const entry = heroEntry([
            "+140 [Health] Health",
            "+40 [Damage] Damage",
            "+10 [Defense] Defense",
        ]);

        const groups = getCodexHeroStatGroups(entry);

        expect(groups[0]?.lines).toEqual([
            "+40 [Damage] Damage",
            "+140 [Health] Health",
            "+10 [Defense] Defense",
        ]);
        expect(groups[0]?.lines.some((line) => /\[Armor\]|\bArmor\b/i.test(line))).toBe(false);
    });

    it("fails closed for non-Hero entries and missing stats", () => {
        expect(getCodexHeroStatGroups({ ...heroEntry([]), exportKind: "units" })).toEqual([]);
        expect(getCodexHeroStatGroups({ ...heroEntry([]), sections: [] })).toEqual([]);
    });
});
