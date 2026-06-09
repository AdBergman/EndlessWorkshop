import { existsSync } from "node:fs";
import { resolve } from "node:path";
import abilityIconsJson from "../../../public/svg/ability-icons.json";
import { expectSourceToExclude, readSource } from "../../tests/sourceGuardTestUtils";
import { getAbilityIconPath } from "./abilityIconResolver";

describe("abilityIconResolver", () => {
    it("resolves direct unit ability icons from the runtime ability registry", () => {
        expect(getAbilityIconPath("UnitAbility_Ranged_3")).toBe(
            "/svg/unit-abilities/UI_UnitAbility_Ranged_3.svg"
        );
        expect(getAbilityIconPath("UnitAbility_Fly")).toBe("/svg/unit-abilities/UI_UnitAbility_Fly.svg");
        expect(getAbilityIconPath("UnitAbility_DefenseExpert_1")).toBe(
            "/svg/unit-abilities/UI_UnitAbility_DefenseExpert_1.svg"
        );
    });

    it("resolves registry-backed descriptor and status ability icons without frontend heuristics", () => {
        expect(getAbilityIconPath("UnitAbility_Aware")).toBe("/svg/unit-abilities/UI_UnitAbility_Aware.svg");
        expect(getAbilityIconPath("UnitAbility_Patroller_1")).toBe(
            "/svg/unit-abilities/UI_UnitAbility_Patroller_1.svg"
        );
        expect(getAbilityIconPath("UnitAbility_Momentum_2")).toBe(
            "/svg/battle-abilities/UI_UnitAbility_Momentum_2.svg"
        );
        expect(getAbilityIconPath("UnitAbility_TeamPlayer_2")).toBe(
            "/svg/battle-abilities/UI_UnitAbility_TeamPlayer_2.svg"
        );
        expect(getAbilityIconPath("UnitAbility_TeamPlayer_1")).toBe(
            "/svg/battle-abilities/UI_UnitAbility_TeamPlayer_1.svg"
        );
        expect(getAbilityIconPath("UnitAbility_Warmaster")).toBe(
            "/svg/battle-abilities/UI_UnitAbility_Warmaster.svg"
        );
        expect(getAbilityIconPath("UnitAbility_Cruel")).toBe("/svg/battle-abilities/UI_UnitAbility_Cruel.svg");
        expect(getAbilityIconPath("UnitAbility_DefensivePlate")).toBe(
            "/svg/battle-abilities/UI_UnitAbility_DefensivePlate.svg"
        );
        expect(getAbilityIconPath("UnitAbility_SeismicSlash")).toBe(
            "/svg/battle-abilities/UI_UnitAbility_SeismicSlash.svg"
        );
        expect(getAbilityIconPath("UnitAbility_ProtectiveOversight")).toBe(
            "/svg/battle-abilities/UI_UnitAbility_ProtectiveOversight.svg"
        );
        expect(getAbilityIconPath("UnitAbility_Hero_BattleAbility_Equipment_Passive_30")).toBe(
            "/svg/battle-abilities/UI_UnitAbility_Hero_BattleAbility_Equipment_Passive30.svg"
        );
        expect(getAbilityIconPath("UnitAbility_LeechingSeeding_1")).toBe(
            "/svg/battle-abilities/UI_UnitAbility_LeechingSeeding_1.svg"
        );
        expect(getAbilityIconPath("UnitAbility_LeechingSeeding_2")).toBe(
            "/svg/battle-abilities/UI_UnitAbility_LeechingSeeding_2.svg"
        );
    });

    it("returns null when the current registry has no safe ability match", () => {
        expect(getAbilityIconPath("UnitAbility_Prototype_LandUnit")).toBeNull();
        expect(getAbilityIconPath("UnitAbility_BreakRangedUnitDamage")).toBeNull();
        expect(getAbilityIconPath("UnitAbility_Blossom_1")).toBeNull();
        expect(getAbilityIconPath("UnitAbility_CompletedBlossom")).toBeNull();
        expect(getAbilityIconPath("")).toBeNull();
    });

    it("keeps ability lookup independent from raw manifest candidate generation", () => {
        const source = readSource("src", "features/icons/abilityIconResolver.ts");

        expectSourceToExclude(source, [
            /getRawIcon/,
            /battleAbility_/,
            /activeSkill_/,
            /unitAbility_/,
            /ABILITY_ICON_ALIASES/,
        ]);
    });

    it("validates every exported ability icon path resolves under public svg assets", () => {
        const registry = abilityIconsJson as { schemaVersion?: number; abilities?: Record<string, { path: string }> };
        const abilities = registry.abilities ?? {};

        expect(registry.schemaVersion).toBe(1);
        expect(Object.keys(abilities)).toHaveLength(358);

        for (const [abilityKey, entry] of Object.entries(abilities)) {
            expect(abilityKey).toMatch(/^UnitAbility_/);
            expect(entry.path, abilityKey).toMatch(/^\/svg\//);
            expect(existsSync(resolve("public", entry.path.slice(1))), abilityKey).toBe(true);
        }
    });
});
