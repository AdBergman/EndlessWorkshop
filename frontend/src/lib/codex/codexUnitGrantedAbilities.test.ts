import { describe, expect, it } from "vitest";
import {
    buildUnitGrantedAbilityPreview,
    isUnitGrantedAbilitiesSection,
} from "./codexUnitGrantedAbilities";
import type { CodexEntry } from "@/types/dataTypes";
import type { CodexStructuredSectionItem } from "./codexStructuredDescription";

function entry(overrides: Partial<CodexEntry>): CodexEntry {
    return {
        exportKind: "units",
        entryKey: "Unit_Test",
        displayName: "Test Unit",
        descriptionLines: [],
        referenceKeys: [],
        ...overrides,
    };
}

function item(overrides: Partial<CodexStructuredSectionItem>): CodexStructuredSectionItem {
    return {
        label: "Granted ability",
        referenceKey: "UnitAbility_Test",
        facts: [],
        lines: [],
        ...overrides,
    };
}

describe("codexUnitGrantedAbilities", () => {
    it("recognizes only Unit granted ability sections", () => {
        expect(isUnitGrantedAbilitiesSection(entry({ exportKind: "units" }), "Granted abilities")).toBe(true);
        expect(isUnitGrantedAbilitiesSection(entry({ exportKind: "equipment" }), "Granted abilities")).toBe(false);
        expect(isUnitGrantedAbilitiesSection(entry({ exportKind: "units" }), "Stats")).toBe(false);
    });

    it("builds previews from resolved related Ability entries", () => {
        const preview = buildUnitGrantedAbilityPreview(item({ referenceKey: "UnitAbility_Ranged_3" }), [
            entry({
                exportKind: "abilities",
                entryKey: "UnitAbility_Ranged_3",
                displayName: "Ranged III",
                category: "Passive",
                kind: "Ability",
                sections: [{ title: "Effects", lines: ["+3 [AttackRange] Attack Range"] }],
            }),
        ]);

        expect(preview).toMatchObject({
            label: "Ranged III",
            metadata: "Passive / Ability",
            effectLine: "+3 [AttackRange] Attack Range",
        });
    });

    it("ignores unresolved or non-Ability related entries", () => {
        expect(buildUnitGrantedAbilityPreview(item({ referenceKey: "UnitAbility_Missing" }), [])).toBeNull();
        expect(
            buildUnitGrantedAbilityPreview(item({ referenceKey: "UnitAbility_Ranged_3" }), [
                entry({
                    exportKind: "statuses",
                    entryKey: "UnitAbility_Ranged_3",
                    displayName: "Ranged III",
                }),
            ])
        ).toBeNull();
    });
});
