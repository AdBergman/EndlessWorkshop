import { codexEntityRef, entityRefId } from "@/lib/entityRef/entityRef";
import {
    buildEntriesByKey,
    buildEntriesByKindKey,
    resolveCodexReference,
    resolveRelatedEntries,
} from "@/lib/codex/codexRefs";
import type { CodexEntry } from "@/types/dataTypes";

describe("resolveRelatedEntries", () => {
    it("keeps only resolved references, removes self references, and de-duplicates keys", () => {
        const entries: CodexEntry[] = [
            {
                exportKind: "abilities",
                entryKey: "Ability_A",
                displayName: "Ability A",
                descriptionLines: [],
                referenceKeys: ["Ability_A", "Hero_A", "Hero_A", "Missing_Key", "Unit_A"],
            },
            {
                exportKind: "heroes",
                entryKey: "Hero_A",
                displayName: "Hero A",
                descriptionLines: [],
                referenceKeys: [],
            },
            {
                exportKind: "units",
                entryKey: "Unit_A",
                displayName: "Unit A",
                descriptionLines: [],
                referenceKeys: [],
            },
        ];

        const related = resolveRelatedEntries(entries[0], {
            entriesByKey: buildEntriesByKey(entries),
        });

        expect(related.map((entry) => entry.entryKey)).toEqual(["Hero_A", "Unit_A"]);
    });

    it("preserves raw reference fallback behavior when entry keys are ambiguous", () => {
        const entries: CodexEntry[] = [
            {
                exportKind: "abilities",
                entryKey: "Ability_A",
                displayName: "Ability A",
                descriptionLines: [],
                referenceKeys: ["Shared_Key"],
            },
            {
                exportKind: "heroes",
                entryKey: "Shared_Key",
                displayName: "Hero Shared",
                descriptionLines: [],
                referenceKeys: [],
            },
            {
                exportKind: "units",
                entryKey: "Shared_Key",
                displayName: "Unit Shared",
                descriptionLines: [],
                referenceKeys: [],
            },
        ];

        const related = resolveRelatedEntries(entries[0], {
            entriesByKey: buildEntriesByKey(entries),
            entriesByKindKey: buildEntriesByKindKey(entries),
        });

        expect(related.map((entry) => `${entry.exportKind}:${entry.displayName}`)).toEqual([
            "units:Unit Shared",
        ]);
    });

    it("resolves typed codex ref IDs through entriesByKindKey before raw fallback", () => {
        const heroRef = codexEntityRef("heroes", "Shared_Key");
        const entries: CodexEntry[] = [
            {
                exportKind: "abilities",
                entryKey: "Ability_A",
                displayName: "Ability A",
                descriptionLines: [],
                referenceKeys: [entityRefId(heroRef!)],
            },
            {
                exportKind: "heroes",
                entryKey: "Shared_Key",
                displayName: "Hero Shared",
                descriptionLines: [],
                referenceKeys: [],
            },
            {
                exportKind: "units",
                entryKey: "Shared_Key",
                displayName: "Unit Shared",
                descriptionLines: [],
                referenceKeys: [],
            },
        ];

        const related = resolveRelatedEntries(entries[0], {
            entriesByKey: buildEntriesByKey(entries),
            entriesByKindKey: buildEntriesByKindKey(entries),
        });

        expect(related.map((entry) => `${entry.exportKind}:${entry.displayName}`)).toEqual([
            "heroes:Hero Shared",
        ]);
    });

    it("removes typed self references and de-duplicates references that resolve to the same entry", () => {
        const unitRef = codexEntityRef("units", "Unit_A");
        const entries: CodexEntry[] = [
            {
                exportKind: "units",
                entryKey: "Unit_A",
                displayName: "Unit A",
                descriptionLines: [],
                referenceKeys: [entityRefId(unitRef!), "Hero_A", entityRefId(codexEntityRef("heroes", "Hero_A")!)],
            },
            {
                exportKind: "heroes",
                entryKey: "Hero_A",
                displayName: "Hero A",
                descriptionLines: [],
                referenceKeys: [],
            },
        ];

        const related = resolveRelatedEntries(entries[0], {
            entriesByKey: buildEntriesByKey(entries),
            entriesByKindKey: buildEntriesByKindKey(entries),
        });

        expect(related.map((entry) => entry.displayName)).toEqual(["Hero A"]);
    });

    it("de-duplicates repeated raw references after resolution", () => {
        const entries: CodexEntry[] = [
            {
                exportKind: "abilities",
                entryKey: "Ability_A",
                displayName: "Ability A",
                descriptionLines: [],
                referenceKeys: ["Hero_A", "Hero_A", "  Hero_A  "],
            },
            {
                exportKind: "heroes",
                entryKey: "Hero_A",
                displayName: "Hero A",
                descriptionLines: [],
                referenceKeys: [],
            },
        ];

        const related = resolveRelatedEntries(entries[0], {
            entriesByKey: buildEntriesByKey(entries),
            entriesByKindKey: buildEntriesByKindKey(entries),
        });

        expect(related.map((entry) => entry.displayName)).toEqual(["Hero A"]);
    });

    it("resolves representative links across new codex kinds without same-kind filtering or display-name dedupe", () => {
        const entries: CodexEntry[] = [
            {
                exportKind: "quests",
                entryKey: "FactionQuest_LastLord_Chapter01_Step01",
                displayName: "A Haunted Path",
                descriptionLines: [],
                referenceKeys: [
                    "FactionQuest_LastLord_Chapter01_Step02",
                    "Faction_LastLord",
                    "Population_LastLord",
                ],
            },
            {
                exportKind: "quests",
                entryKey: "FactionQuest_LastLord_Chapter01_Step02",
                displayName: "A Haunted Path",
                descriptionLines: [],
                referenceKeys: [],
            },
            {
                exportKind: "traits",
                entryKey: "Trait_Protectorate",
                displayName: "Protectorate",
                descriptionLines: [],
                referenceKeys: [
                    "Trait_Protectorate_Upgraded",
                    "Technology_Trait",
                    "Unit_Trait",
                    "Hero_Trait",
                    "Ability_Trait",
                    "MinorFaction_Trait",
                ],
            },
            {
                exportKind: "traits",
                entryKey: "Trait_Protectorate_Upgraded",
                displayName: "Protectorate",
                descriptionLines: [],
                referenceKeys: [],
            },
            {
                exportKind: "populations",
                entryKey: "Population_LastLord",
                displayName: "Last Lord Population",
                descriptionLines: [],
                referenceKeys: ["Faction_LastLord", "Trait_Protectorate", "MinorFaction_Trait"],
            },
            {
                exportKind: "minorfactions",
                entryKey: "MinorFaction_Trait",
                displayName: "Minor Faction",
                descriptionLines: [],
                referenceKeys: ["FactionQuest_LastLord_Chapter01_Step01", "Hero_Trait", "Population_LastLord"],
            },
            {
                exportKind: "tech",
                entryKey: "Technology_Trait",
                displayName: "Trait Tech",
                descriptionLines: [],
                referenceKeys: ["District_Trait", "Improvement_Trait", "Unit_Trait", "Hero_Trait", "Trait_Protectorate"],
            },
            {
                exportKind: "abilities",
                entryKey: "Ability_Trait",
                displayName: "Trait Ability",
                descriptionLines: [],
                referenceKeys: ["Unit_Trait", "Hero_Trait", "Ability_Trait_Disabled"],
            },
            {
                exportKind: "abilities",
                entryKey: "Ability_Trait_Disabled",
                displayName: "Trait Ability Disabled",
                descriptionLines: [],
                referenceKeys: [],
            },
            {
                exportKind: "districts",
                entryKey: "District_Trait",
                displayName: "Trait District",
                descriptionLines: [],
                referenceKeys: ["Technology_Trait", "Trait_Protectorate"],
            },
            {
                exportKind: "improvements",
                entryKey: "Improvement_Trait",
                displayName: "Trait Improvement",
                descriptionLines: [],
                referenceKeys: ["Technology_Trait", "Trait_Protectorate"],
            },
            {
                exportKind: "factions",
                entryKey: "Faction_LastLord",
                displayName: "Last Lords",
                descriptionLines: [],
                referenceKeys: [],
            },
            {
                exportKind: "units",
                entryKey: "Unit_Trait",
                displayName: "Trait Unit",
                descriptionLines: [],
                referenceKeys: [],
            },
            {
                exportKind: "heroes",
                entryKey: "Hero_Trait",
                displayName: "Trait Hero",
                descriptionLines: [],
                referenceKeys: [],
            },
        ];
        const indexes = {
            entriesByKey: buildEntriesByKey(entries),
            entriesByKindKey: buildEntriesByKindKey(entries),
        };

        expect(resolveRelatedEntries(entries[0], indexes).map((entry) => `${entry.exportKind}:${entry.entryKey}`))
            .toEqual([
                "quests:FactionQuest_LastLord_Chapter01_Step02",
                "factions:Faction_LastLord",
                "populations:Population_LastLord",
            ]);
        expect(resolveRelatedEntries(entries[2], indexes).map((entry) => `${entry.exportKind}:${entry.entryKey}`))
            .toEqual([
                "traits:Trait_Protectorate_Upgraded",
                "tech:Technology_Trait",
                "units:Unit_Trait",
                "heroes:Hero_Trait",
                "abilities:Ability_Trait",
                "minorfactions:MinorFaction_Trait",
            ]);
        expect(resolveRelatedEntries(entries[4], indexes).map((entry) => `${entry.exportKind}:${entry.entryKey}`))
            .toEqual([
                "factions:Faction_LastLord",
                "traits:Trait_Protectorate",
                "minorfactions:MinorFaction_Trait",
            ]);
        expect(resolveRelatedEntries(entries[5], indexes).map((entry) => `${entry.exportKind}:${entry.entryKey}`))
            .toEqual([
                "quests:FactionQuest_LastLord_Chapter01_Step01",
                "heroes:Hero_Trait",
                "populations:Population_LastLord",
            ]);
        expect(resolveRelatedEntries(entries[6], indexes).map((entry) => `${entry.exportKind}:${entry.entryKey}`))
            .toEqual([
                "districts:District_Trait",
                "improvements:Improvement_Trait",
                "units:Unit_Trait",
                "heroes:Hero_Trait",
                "traits:Trait_Protectorate",
            ]);
        expect(resolveRelatedEntries(entries[7], indexes).map((entry) => `${entry.exportKind}:${entry.entryKey}`))
            .toEqual([
                "units:Unit_Trait",
                "heroes:Hero_Trait",
                "abilities:Ability_Trait_Disabled",
            ]);
        expect(resolveRelatedEntries(entries[9], indexes).map((entry) => `${entry.exportKind}:${entry.entryKey}`))
            .toEqual(["tech:Technology_Trait", "traits:Trait_Protectorate"]);
        expect(resolveRelatedEntries(entries[10], indexes).map((entry) => `${entry.exportKind}:${entry.entryKey}`))
            .toEqual(["tech:Technology_Trait", "traits:Trait_Protectorate"]);
    });
});

describe("resolveCodexReference", () => {
    it("resolves direct codex entity refs and encoded codex keys", () => {
        const entries: CodexEntry[] = [
            {
                exportKind: "heroes",
                entryKey: "Hero:With Spaces",
                displayName: "Hero A",
                descriptionLines: [],
                referenceKeys: [],
            },
        ];
        const indexes = {
            entriesByKey: buildEntriesByKey(entries),
            entriesByKindKey: buildEntriesByKindKey(entries),
        };

        expect(resolveCodexReference(codexEntityRef("heroes", "Hero:With Spaces"), indexes)?.displayName).toBe(
            "Hero A"
        );
        expect(resolveCodexReference("heroes:Hero%3AWith%20Spaces", indexes)?.displayName).toBe("Hero A");
    });

    it("falls back to raw keys for malformed encoded reference strings", () => {
        const entries: CodexEntry[] = [
            {
                exportKind: "heroes",
                entryKey: "codex:heroes%3A%E0%A4%A",
                displayName: "Raw Fallback",
                descriptionLines: [],
                referenceKeys: [],
            },
        ];
        const indexes = {
            entriesByKey: buildEntriesByKey(entries),
            entriesByKindKey: buildEntriesByKindKey(entries),
        };

        expect(resolveCodexReference("codex:heroes%3A%E0%A4%A", indexes)?.displayName).toBe("Raw Fallback");
    });
});
