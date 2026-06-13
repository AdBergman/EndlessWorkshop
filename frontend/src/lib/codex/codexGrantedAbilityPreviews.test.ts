import { describe, expect, it } from "vitest";
import {
    buildGrantedAbilityPreview,
    getDisplayedGrantedAbilityKeys,
    isGrantedAbilityPreviewSection,
} from "./codexGrantedAbilityPreviews";
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

describe("codexGrantedAbilityPreviews", () => {
    it("recognizes only supported granted ability sections", () => {
        expect(isGrantedAbilityPreviewSection(entry({ exportKind: "units" }), "Granted abilities")).toBe(true);
        expect(isGrantedAbilityPreviewSection(entry({ exportKind: "equipment" }), "Granted abilities")).toBe(true);
        expect(isGrantedAbilityPreviewSection(entry({ exportKind: "heroes" }), "Granted abilities")).toBe(true);
        expect(isGrantedAbilityPreviewSection(entry({ exportKind: "traits" }), "Granted abilities")).toBe(false);
        expect(isGrantedAbilityPreviewSection(entry({ exportKind: "units" }), "Stats")).toBe(false);
    });

    it("builds previews from resolved related Ability entries", () => {
        const preview = buildGrantedAbilityPreview(item({ referenceKey: "UnitAbility_Ranged_3" }), [
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
        expect(buildGrantedAbilityPreview(item({ referenceKey: "UnitAbility_Missing" }), [])).toBeNull();
        expect(
            buildGrantedAbilityPreview(item({ referenceKey: "UnitAbility_Ranged_3" }), [
                entry({
                    exportKind: "statuses",
                    entryKey: "UnitAbility_Ranged_3",
                    displayName: "Ranged III",
                }),
            ])
        ).toBeNull();
    });

    it("collects only resolved granted abilities that can be shown on Unit details", () => {
        const unit = entry({
            exportKind: "units",
            sections: [
                {
                    title: "Granted abilities",
                    items: [
                        { label: "Ranged III", referenceKey: "UnitAbility_Ranged_3" },
                        { label: "Missing Ability", referenceKey: "UnitAbility_Missing" },
                    ],
                },
            ],
        });
        const displayedKeys = getDisplayedGrantedAbilityKeys(unit, [
            entry({
                exportKind: "abilities",
                entryKey: "UnitAbility_Ranged_3",
                displayName: "Ranged III",
                category: "Passive",
                kind: "Ability",
                sections: [{ title: "Effects", lines: ["+3 [AttackRange] Attack Range"] }],
            }),
            entry({
                exportKind: "abilities",
                entryKey: "UnitAbility_Scouting",
                displayName: "Scouting",
                category: "Passive",
                kind: "Ability",
            }),
        ]);

        expect([...displayedKeys]).toEqual(["UnitAbility_Ranged_3"]);
        expect(getDisplayedGrantedAbilityKeys(entry({ exportKind: "traits" }), [])).toEqual(new Set());
    });

    it("collects only resolved granted abilities that can be shown on Equipment details", () => {
        const equipment = entry({
            exportKind: "equipment",
            entryKey: "Equipment_Bow_Test",
            displayName: "Test Bow",
            sections: [
                {
                    title: "Granted abilities",
                    items: [
                        { label: "Breaching Attack I", referenceKey: "UnitAbility_BreachingAttack_1" },
                        { label: "Missing Ability", referenceKey: "UnitAbility_Missing" },
                    ],
                },
            ],
        });

        const displayedKeys = getDisplayedGrantedAbilityKeys(equipment, [
            entry({
                exportKind: "abilities",
                entryKey: "UnitAbility_BreachingAttack_1",
                displayName: "Breaching Attack I",
                category: "Combat",
                kind: "Ability",
                sections: [{ title: "Effects", lines: ["Applies Vulnerable I Status to targeted Units"] }],
            }),
            entry({
                exportKind: "abilities",
                entryKey: "UnitAbility_Scouting",
                displayName: "Scouting",
                category: "Passive",
                kind: "Ability",
            }),
        ]);

        expect([...displayedKeys]).toEqual(["UnitAbility_BreachingAttack_1"]);
    });

    it("collects only resolved granted abilities that can be shown on Hero details", () => {
        const hero = entry({
            exportKind: "heroes",
            entryKey: "Hero_Test",
            displayName: "Test Hero",
            sections: [
                {
                    title: "Granted abilities",
                    items: [
                        { label: "Flying", referenceKey: "UnitAbility_Fly" },
                        { label: "Missing Hero Ability", referenceKey: "UnitAbility_Hero_Missing" },
                    ],
                },
            ],
        });

        const displayedKeys = getDisplayedGrantedAbilityKeys(hero, [
            entry({
                exportKind: "abilities",
                entryKey: "UnitAbility_Fly",
                displayName: "Flying",
                category: "Passive",
                kind: "Ability",
                sections: [{ title: "Effects", lines: ["Can fly over obstacles"] }],
            }),
            entry({
                exportKind: "abilities",
                entryKey: "UnitAbility_Scouting",
                displayName: "Scouting",
                category: "Passive",
                kind: "Ability",
            }),
        ]);

        expect([...displayedKeys]).toEqual(["UnitAbility_Fly"]);
    });
});
