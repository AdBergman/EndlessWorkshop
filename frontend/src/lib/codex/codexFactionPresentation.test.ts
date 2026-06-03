import {
    getCodexFactionAffinityLabel,
    getCodexFactionSummaryPreview,
    getCodexFactionTraitNames,
    parseCodexFactionDescription,
} from "./codexFactionPresentation";

describe("codexFactionPresentation", () => {
    it("extracts an affinity line without requiring traits", () => {
        const parsed = parseCodexFactionDescription([
            "Affinity: Aspects",
            "Aspects can spread [Coral] on the map.",
        ]);

        expect(parsed.affinityLine).toBe("Affinity: Aspects");
        expect(parsed.traits).toEqual([]);
        expect(parsed.ungroupedLines).toEqual(["Aspects can spread [Coral] on the map."]);
    });

    it("groups multiple traits while preserving body line order", () => {
        const parsed = parseCodexFactionDescription([
            "Affinity: Kin of Sheredyn",
            "Trait: Holy Commandments",
            "+10 Fortification on Capital City",
            "Unlocks a defensive empire action.",
            "Trait: Helping Hand",
            "Additional resources available at start.",
        ]);

        expect(parsed.affinityLine).toBe("Affinity: Kin of Sheredyn");
        expect(parsed.traits).toEqual([
            {
                name: "Holy Commandments",
                titleLine: "Trait: Holy Commandments",
                bodyLines: [
                    "+10 Fortification on Capital City",
                    "Unlocks a defensive empire action.",
                ],
            },
            {
                name: "Helping Hand",
                titleLine: "Trait: Helping Hand",
                bodyLines: ["Additional resources available at start."],
            },
        ]);
        expect(parsed.ungroupedLines).toEqual([]);
    });

    it("keeps pre-trait and empty-line noise in notes instead of dropping meaning", () => {
        const parsed = parseCodexFactionDescription([
            "",
            "Opening faction note.",
            "Trait: Diplomat",
            "",
            "Values peace above all else.",
        ]);

        expect(parsed.affinityLine).toBeNull();
        expect(parsed.ungroupedLines).toEqual(["Opening faction note."]);
        expect(parsed.traits[0]).toEqual({
            name: "Diplomat",
            titleLine: "Trait: Diplomat",
            bodyLines: ["Values peace above all else."],
        });
    });

    it("builds compact faction summary text from affinity and trait names", () => {
        const entry = {
            descriptionLines: [
                "Affinity: Faction_Mukag",
                "Trait: Diplomat",
                "Treaties are easier.",
                "Trait: Common Rights",
                "Population bonuses are improved.",
                "Trait: Fencing",
                "Unlocks dueling schools.",
                "Trait: Trade Code",
                "Markets are stronger.",
            ],
        };

        expect(getCodexFactionAffinityLabel(entry)).toBe("Tahuk");
        expect(getCodexFactionTraitNames(entry)).toEqual([
            "Diplomat",
            "Common Rights",
            "Fencing",
            "Trade Code",
        ]);
        expect(getCodexFactionSummaryPreview(entry)).toBe(
            "Affinity: Tahuk · Traits: Diplomat, Common Rights, Fencing, +1 trait"
        );
    });
});

