import {
    buildCodexRichFactionPackageGroups,
    getCodexFactionPackageEntryKeys,
} from "@/lib/codex/codexFactionPackage";
import type { CodexEntry, RichFaction } from "@/types/dataTypes";

const codexEntry = (entryKey: string, displayName: string, exportKind: string): CodexEntry => ({
    exportKind,
    entryKey,
    displayName,
    descriptionLines: [],
    referenceKeys: [],
});

const richFaction = (overrides: Partial<RichFaction>): RichFaction => ({
    factionKey: "Faction_Aspect",
    publicDisplayName: "Aspects",
    lore: null,
    factionKind: "major",
    affinityKey: null,
    affinityType: null,
    traitKeys: [],
    populationKeys: [],
    unitKeys: [],
    baseUnitKeys: [],
    heroKeys: [],
    gatedTechnologyKeys: [],
    startingFactionQuestKey: null,
    specificQuestKeys: [],
    protectorateTraitKeys: [],
    ...overrides,
});

describe("codexFactionPackage", () => {
    it("builds major faction package groups from exact rich faction keys", () => {
        const factionEntry = codexEntry("Faction_Aspect", "Aspects", "factions");
        const groups = buildCodexRichFactionPackageGroups(
            factionEntry,
            richFaction({
                factionKey: "Faction_Aspect",
                traitKeys: ["Trait_Diplomat", "Trait_Diplomat", "Unit_Diplomat"],
                populationKeys: ["Population_Aspect"],
                baseUnitKeys: ["Unit_Sentry", "Unit_Missing"],
                heroKeys: ["Hero_Aspect"],
                gatedTechnologyKeys: ["Tech_Aspect"],
                startingFactionQuestKey: "FactionQuest_Aspect_Chapter01_Step01",
            }),
            [
                factionEntry,
                codexEntry("Trait_Diplomat", "Diplomat", "traits"),
                codexEntry("Unit_Diplomat", "Wrong Kind", "units"),
                codexEntry("Population_Aspect", "Aspects", "populations"),
                codexEntry("Unit_Sentry", "Sentry", "units"),
                codexEntry("Hero_Aspect", "Aspect Hero", "heroes"),
                codexEntry("Tech_Aspect", "Aspect Tech", "tech"),
                codexEntry("FactionQuest_Aspect_Chapter01_Step01", "Aspect Quest", "quests"),
            ]
        );

        expect(groups.map((group) => group.label)).toEqual([
            "Faction Traits",
            "Population",
            "Core Units",
            "Heroes",
            "Faction Techs",
            "Questline",
        ]);
        expect(groups.find((group) => group.label === "Faction Traits")?.entries.map((entry) => entry.entryKey))
            .toEqual(["Trait_Diplomat"]);
        expect(getCodexFactionPackageEntryKeys(groups)).toEqual([
            "Trait_Diplomat",
            "Population_Aspect",
            "Unit_Sentry",
            "Hero_Aspect",
            "Tech_Aspect",
            "FactionQuest_Aspect_Chapter01_Step01",
        ]);
    });

    it("builds minor faction package groups without using missing or wrong-kind rich keys", () => {
        const factionEntry = codexEntry("MinorFaction_Ametrine", "Ametrine", "minorFactions");
        const groups = buildCodexRichFactionPackageGroups(
            factionEntry,
            richFaction({
                factionKey: "MinorFaction_Ametrine",
                factionKind: "minor",
                populationKeys: ["Population_Ametrine"],
                baseUnitKeys: ["Unit_Ametrine"],
                heroKeys: ["Hero_Ametrine", "Tech_Ametrine"],
                protectorateTraitKeys: ["Trait_Ametrine"],
                specificQuestKeys: ["MinorFaction_SpecificQuest_Ametrine01"],
            }),
            [
                factionEntry,
                codexEntry("Population_Ametrine", "Ametrine", "populations"),
                codexEntry("Unit_Ametrine", "Crusher", "units"),
                codexEntry("Hero_Ametrine", "Ametrine Hero", "heroes"),
                codexEntry("Tech_Ametrine", "Wrong Kind", "tech"),
                codexEntry("Trait_Ametrine", "Chant of the Rocks", "traits"),
                codexEntry("MinorFaction_SpecificQuest_Ametrine01", "Ametrine Quest", "quests"),
            ]
        );

        expect(groups.map((group) => group.label)).toEqual([
            "Population",
            "Core Unit",
            "Heroes",
            "Protectorate Traits",
            "Quest",
        ]);
        expect(groups.find((group) => group.label === "Heroes")?.entries.map((entry) => entry.entryKey))
            .toEqual(["Hero_Ametrine"]);
    });

    it("fails closed when rich faction identity does not exactly match the Codex entry", () => {
        expect(buildCodexRichFactionPackageGroups(
            codexEntry("Faction_Aspect", "Aspects", "factions"),
            richFaction({ factionKey: "Faction_Mukag", traitKeys: ["Trait_Diplomat"] }),
            [codexEntry("Trait_Diplomat", "Diplomat", "traits")]
        )).toEqual([]);
    });
});
