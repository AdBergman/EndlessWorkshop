import type { CodexEntry } from "@/types/dataTypes";
import { getCodexEntryIconPath } from "./codexEntryIcons";

function entry(overrides: Partial<CodexEntry>): CodexEntry {
    return {
        exportKind: "districts",
        entryKey: "District_Test",
        displayName: "Test",
        descriptionLines: [],
        referenceKeys: [],
        ...overrides,
    };
}

describe("codexEntryIcons", () => {
    it("uses exact luxury resource display-name tokens before kind icons", () => {
        expect(
            getCodexEntryIconPath(entry({
                exportKind: "improvements",
                entryKey: "Improvement_AuricCoral",
                displayName: "[LuxuryResource01] Auric Coral",
            }))
        ).toBe("/svg/constructibles/UI_Resource_Luxury_Klak.svg");
    });

    it("uses exact extractor entry keys before generic extractor kind icons", () => {
        expect(
            getCodexEntryIconPath(entry({
                exportKind: "extractors",
                entryKey: "Extractor_Strategic01",
                displayName: "Titanium Extractor",
            }))
        ).toBe("/svg/constructibles/UI_Resource_Strategic_Titanium.svg");
    });

    it("uses explicit exported ability svgIcon metadata for ability entries", () => {
        expect(
            getCodexEntryIconPath(entry({
                exportKind: "abilities",
                entryKey: "Ability_DisplayKeyDoesNotMatter",
                displayName: "Fly",
                svgIcon: { source: "ability-icons", key: "UnitAbility_Fly" },
            }))
        ).toBe("/svg/unit-abilities/UI_UnitAbility_Fly.svg");
    });

    it("does not infer ability entry icons from the entry key without exported svgIcon metadata", () => {
        expect(
            getCodexEntryIconPath(entry({
                exportKind: "abilities",
                entryKey: "UnitAbility_Fly",
                displayName: "Fly",
            }))
        ).toBeNull();
    });

    it("does not let generic yield tokens replace entity kind icons", () => {
        expect(
            getCodexEntryIconPath(entry({
                exportKind: "districts",
                entryKey: "District_MarketSquare",
                displayName: "[DustColored] Market Square",
            }))
        ).toBe("/svg/factions/UI_Common_District.svg");
    });

    it("uses specific major faction icons for faction entries", () => {
        expect(
            getCodexEntryIconPath(entry({
                exportKind: "factions",
                entryKey: "Faction_Mukag",
                displayName: "Tahuk",
            }))
        ).toBe("/svg/hero-skills/UI_EmpireSymbol_Mukag01.svg");
    });

    it("uses specific minor faction icons for minor faction entries", () => {
        expect(
            getCodexEntryIconPath(entry({
                exportKind: "minorfactions",
                entryKey: "MinorFaction_Ametrine",
                displayName: "Ametrine",
            }))
        ).toBe("/svg/hero-skills/UI_MinorEmpireSymbol_Ametrine.svg");
    });
});
