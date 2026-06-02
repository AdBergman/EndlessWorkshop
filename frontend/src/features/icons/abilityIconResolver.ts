import { getRawIcon } from "./iconManifest";

const ABILITY_ICON_ALIASES: Record<string, string[]> = {
    UnitAbility_Aware: ["unitAbility_Descriptor_Aware"],
    UnitAbility_BreakRangedUnitDamage: ["unitAbility_IgnoreRangedBreakDamage", "status_Unit_BreakRangedDamage"],
    UnitAbility_Patroller_1: ["status_Unit_Map_Patroller_01"],
    UnitAbility_Patroller_2: ["status_Unit_Map_Patroller_02"],
    UnitAbility_Blossom_1: ["unitAbility_Hero_MinorFaction_MangroveOfHarmony_01", "factionAffinity_MangroveOfHarmony"],
    UnitAbility_Blossom_2: ["unitAbility_Hero_MinorFaction_MangroveOfHarmony_01", "factionAffinity_MangroveOfHarmony"],
    UnitAbility_CompletedBlossom: ["activeSkill_MangroveOfHarmony_Defender_02", "factionAffinity_MangroveOfHarmony"],
    UnitAbility_Class_BonusVsInfantry: ["battleAbility_Class_BonusVsInfrantry"],
    UnitAbility_Class_BonusVsFlying: ["battleAbility_Class_BonusVsFlying"],
    UnitAbility_Class_BonusVsRanged: ["battleAbility_Class_BonusVsRanged"],
    UnitAbility_Class_BonusVsHero: ["battleAbility_Class_BonusVsHero"],
    UnitAbility_Class_BonusVsJuggernaught: ["battleAbility_Class_BonusVsJuggernaught"],
    UnitAbility_Class_BonusVsCavalry: ["battleAbility_Class_BonusVsCavalry"],
    UnitAbility_DefensivePlate: ["battleAbility_Defend_A", "status_Unit_DefensivePlate"],
    UnitAbility_Hero_BattleAbility_Equipment_Passive_30: ["battleAbility_Equipment_Passive_30"],
    UnitAbility_LeechingSeeding_1: ["activeSkill_MinorFaction_GreenScion01"],
    UnitAbility_LeechingSeeding_2: ["activeSkill_MinorFaction_GreenScion01"],
};

function normalizeAbilityKey(abilityKey: string): string {
    return abilityKey.trim();
}

function unique(values: string[]): string[] {
    const seen = new Set<string>();
    return values.filter((value) => {
        if (!value || seen.has(value)) return false;
        seen.add(value);
        return true;
    });
}

function buildAbilityRawKeyCandidates(abilityKey: string): string[] {
    const normalized = normalizeAbilityKey(abilityKey);
    if (!normalized) return [];

    const suffix = normalized.startsWith("UnitAbility_")
        ? normalized.slice("UnitAbility_".length)
        : normalized;

    return unique([
        ...(ABILITY_ICON_ALIASES[normalized] ?? []),
        normalized,
        `unitAbility_${suffix}`,
        `unitAbility_Descriptor_${suffix}`,
        `battleAbility_Descriptor_${suffix}`,
        `battleAbility_${suffix}`,
        `activeSkill_Unit_${suffix}`,
        `activeSkill_${suffix}`,
    ]);
}

export function getAbilityIconPath(abilityKey: string): string | null {
    for (const rawKey of buildAbilityRawKeyCandidates(abilityKey)) {
        const path = getRawIcon(rawKey);
        if (path) return path;
    }

    return null;
}
