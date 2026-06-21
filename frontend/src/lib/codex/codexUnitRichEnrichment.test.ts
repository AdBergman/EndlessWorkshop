import {
    buildCodexUnitRichEnrichment,
    hasCodexUnitRichEnrichment,
} from "@/lib/codex/codexUnitRichEnrichment";
import type { CodexEntry, Unit } from "@/types/dataTypes";

const codexUnit = (entryKey: string, displayName: string): CodexEntry => ({
    exportKind: "units",
    entryKey,
    displayName,
    descriptionLines: [],
    referenceKeys: [],
});

const codexEntry = (entryKey: string, displayName: string, exportKind = "abilities"): CodexEntry => ({
    exportKind,
    entryKey,
    displayName,
    descriptionLines: [],
    referenceKeys: [],
});

const richUnit = (overrides: Partial<Unit>): Unit => ({
    unitKey: "Unit_Current",
    displayName: "Current Unit",
    artId: null,
    faction: null,
    isMajorFaction: true,
    isHero: false,
    isChosen: false,
    spawnType: "Land",
    previousUnitKey: null,
    nextEvolutionUnitKeys: [],
    evolutionTierIndex: 0,
    unitClassKey: null,
    unitClassDisplayName: null,
    attackSkillKey: null,
    abilityKeys: [],
    descriptionLines: [],
    ...overrides,
});

describe("codexUnitRichEnrichment", () => {
    it("resolves previous and evolves-into links from exact public Codex Unit entries", () => {
        const current = codexUnit("Unit_Current", "Current Unit");
        const previous = codexUnit("Unit_Previous", "Previous Unit");
        const evolved = codexUnit("Unit_Evolved", "Evolved Unit");

        const enrichment = buildCodexUnitRichEnrichment(
            current,
            {
                Unit_Current: richUnit({
                    previousUnitKey: "Unit_Previous",
                    nextEvolutionUnitKeys: ["Unit_Evolved"],
                }),
            },
            [current, previous, evolved]
        );

        expect(enrichment.previousUnit?.label).toBe("Previous Unit");
        expect(enrichment.evolvesInto.map((link) => link.label)).toEqual(["Evolved Unit"]);
        expect(hasCodexUnitRichEnrichment(enrichment)).toBe(true);
    });

    it("fails closed when rich data is missing or evolution targets do not resolve to public Codex Units", () => {
        const current = codexUnit("Unit_Current", "Current Unit");

        expect(hasCodexUnitRichEnrichment(buildCodexUnitRichEnrichment(current, {}, [current]))).toBe(false);

        const unresolved = buildCodexUnitRichEnrichment(
            current,
            {
                Unit_Current: richUnit({
                    previousUnitKey: "Unit_Missing",
                    nextEvolutionUnitKeys: ["Unit_Evolved_Missing", "Ability_SameKey"],
                }),
            },
            [current, codexEntry("Ability_SameKey", "Same Key Ability")]
        );

        expect(unresolved.previousUnit).toBeNull();
        expect(unresolved.evolvesInto).toEqual([]);
        expect(hasCodexUnitRichEnrichment(unresolved)).toBe(false);
    });

    it("does not use rich ability or hidden-helper keys as Unit detail enrichment", () => {
        const current = codexUnit("Unit_Current", "Current Unit");
        const publicAbility = codexEntry("Ability_Public", "Public Ability");
        const hiddenAbility = codexEntry("Ability_Hidden", "Hidden Helper Ability");
        const richUnitWithHiddenHelpers = {
            ...richUnit({
                abilityKeys: ["Ability_Public"],
            }),
            hiddenHelperAbilityKeys: ["Ability_Hidden"],
        };

        const enrichment = buildCodexUnitRichEnrichment(
            current,
            {
                Unit_Current: richUnitWithHiddenHelpers,
            },
            [current, publicAbility, hiddenAbility]
        );

        expect(enrichment.previousUnit).toBeNull();
        expect(enrichment.evolvesInto).toEqual([]);
        expect(hasCodexUnitRichEnrichment(enrichment)).toBe(false);
    });

    it("deduplicates next-evolution links and never links the current Unit to itself", () => {
        const current = codexUnit("Unit_Current", "Current Unit");
        const evolved = codexUnit("Unit_Evolved", "Evolved Unit");

        const enrichment = buildCodexUnitRichEnrichment(
            current,
            {
                Unit_Current: richUnit({
                    nextEvolutionUnitKeys: ["Unit_Evolved", " Unit_Evolved ", "Unit_Current"],
                }),
            },
            [current, evolved]
        );

        expect(enrichment.evolvesInto.map((link) => link.entry.entryKey)).toEqual(["Unit_Evolved"]);
    });
});
