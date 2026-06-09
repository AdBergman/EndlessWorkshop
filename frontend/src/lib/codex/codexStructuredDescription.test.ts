import {
    getCodexStructuredSummary,
    parseCodexStructuredDescription,
} from "@/lib/codex/codexStructuredDescription";
import type { CodexEntry } from "@/types/dataTypes";

function entry(exportKind: string, descriptionLines: string[]): CodexEntry {
    return {
        exportKind,
        entryKey: `${exportKind}_Example`,
        displayName: "Example",
        descriptionLines,
        referenceKeys: [],
    };
}

describe("codexStructuredDescription", () => {
    it("parses equipment facts from existing description lines", () => {
        const parsed = parseCodexStructuredDescription(entry("equipment", [
            "Type: Weapon",
            "Slot: Main hand",
            "Rarity: Rare",
            "Tier: 2",
            "Access pool: Hero",
            "Value: 120",
            "Forged for close combat.",
        ]));

        expect(parsed.facts.map((fact) => `${fact.label}=${fact.value}`)).toEqual([
            "Type=Weapon",
            "Slot=Main hand",
            "Rarity=Rare",
            "Tier=2",
            "Access pool=Hero",
            "Value=120",
        ]);
        expect(parsed.bodyLines).toEqual(["Forged for close combat."]);
        expect(getCodexStructuredSummary(entry("equipment", [
            "Type: Weapon",
            "Slot: Main hand",
            "Rarity: Rare",
            "Tier: 2",
        ]))).toBe("Weapon / Main hand / Rare / Tier 2");
    });

    it("parses population facts, worker effects, and thresholds", () => {
        const parsed = parseCodexStructuredDescription(entry("populations", [
            "Faction: Mukag",
            "Type: Minor faction population",
            "Base food cost: 60",
            "Worker: +4 Dust on Scribes",
            "At 5 population: Unlocks The Consortium’s Bazaar",
            "At 15 population: +1 Dust on Consortium Population",
            "+4 Food consumption",
        ]));

        expect(parsed.facts.map((fact) => `${fact.label}=${fact.value}`)).toEqual([
            "Faction=Tahuk",
            "Type=Minor faction population",
            "Base food cost=60",
        ]);
        expect(parsed.sections).toEqual([
            { label: "Worker", lines: ["+4 Dust on Scribes"] },
        ]);
        expect(parsed.timeline.map((item) => `${item.label}=${item.value}`)).toEqual([
            "5 population=Unlocks The Consortium’s Bazaar",
            "15 population=+1 Dust on Consortium Population",
        ]);
        expect(parsed.bodyLines).toEqual(["+4 Food consumption"]);
    });

    it("parses councilor, trait, hero, and minor faction facts conservatively", () => {
        expect(parseCodexStructuredDescription(entry("councilors", [
            "Faction: KinOfSheredyn",
            "Role: Governor",
            "Councilor effect: +2 Science",
            "Partner effect: +1 Influence",
        ])).sections.map((section) => section.label)).toEqual(["Councilor effect", "Partner effect"]);

        expect(getCodexStructuredSummary(entry("traits", [
            "Category: Faction",
            "Cost: 2",
            "Required affinity: Aspect",
            "Quest-only note.",
        ]))).toBe("Faction / Cost 2 / Aspects");

        expect(getCodexStructuredSummary(entry("heroes", [
            "Faction: Hero",
            "Class: Archer",
            "Attack: 42",
        ]))).toBe("Hero / Archer");

        expect(getCodexStructuredSummary(entry("heroes", [
            "Faction: Tahuk",
            "Class: Defender",
            "Attack: 30",
        ]))).toBe("Tahuk / Defender");

        expect(getCodexStructuredSummary(entry("minorfactions", [
            "Disposition: Diplomatic",
            "Faction affinity: Necrophage",
            "Population: Noquensii",
            "Unit: Singer",
            "Trait: Silver Tongue",
        ]))).toBe("Diplomatic / Necrophages / Noquensii / Singer");
    });

    it("keeps unknown lines as fallback body content", () => {
        const parsed = parseCodexStructuredDescription(entry("abilities", [
            "A plain ability description.",
            "Unexpected exporter line: still readable.",
        ]));

        expect(parsed.hasStructuredContent).toBe(false);
        expect(parsed.bodyLines).toEqual([
            "A plain ability description.",
            "Unexpected exporter line: still readable.",
        ]);
        expect(getCodexStructuredSummary(entry("abilities", ["A plain ability description."]))).toBe("");
    });
});
