export type UnitClassIcon = {
    classKey: string;
    label: string;
    path: string;
    bonusAbilityKey: string | null;
    bonusTargetLabel: string | null;
    fallbackDescriptionLines: string[];
};

const SINGLE_CLASS_ICONS: Record<string, UnitClassIcon> = {
    infantry: {
        classKey: "infantry",
        label: "Infantry",
        path: "/svg/constructibles/UI_UnitItem_UnitClass_Melee.svg",
        bonusAbilityKey: "UnitAbility_Class_BonusVsRanged",
        bonusTargetLabel: "Ranged",
        fallbackDescriptionLines: ["+10% [Damage] Damage when attacking Ranged units."],
    },
    melee: {
        classKey: "infantry",
        label: "Infantry",
        path: "/svg/constructibles/UI_UnitItem_UnitClass_Melee.svg",
        bonusAbilityKey: "UnitAbility_Class_BonusVsRanged",
        bonusTargetLabel: "Ranged",
        fallbackDescriptionLines: ["+10% [Damage] Damage when attacking Ranged units."],
    },
    ranged: {
        classKey: "ranged",
        label: "Ranged",
        path: "/svg/units/UI_UnitItem_UnitClass_Ranged.svg",
        bonusAbilityKey: "UnitAbility_Class_BonusVsFlying",
        bonusTargetLabel: "Flying",
        fallbackDescriptionLines: ["+10% [Damage] Damage when attacking Flying units."],
    },
    cavalry: {
        classKey: "cavalry",
        label: "Cavalry",
        path: "/svg/units/UI_UnitItem_UnitClass_Cavalry.svg",
        bonusAbilityKey: "UnitAbility_Class_BonusVsInfantry",
        bonusTargetLabel: "Infantry",
        fallbackDescriptionLines: ["+10% [Damage] Damage when attacking Infantry units."],
    },
    flying: {
        classKey: "flying",
        label: "Flying",
        path: "/svg/units/UI_UnitItem_UnitClass_Flying.svg",
        bonusAbilityKey: "UnitAbility_Class_BonusVsInfantry",
        bonusTargetLabel: "Infantry",
        fallbackDescriptionLines: ["+10% [Damage] Damage when attacking Infantry units."],
    },
    swarm: {
        classKey: "swarm",
        label: "Swarm",
        path: "/svg/units/UI_UnitItem_UnitClass_Swarm.svg",
        bonusAbilityKey: "UnitAbility_Class_BonusVsJuggernaught",
        bonusTargetLabel: "Juggernaught",
        fallbackDescriptionLines: ["+10% [Damage] Damage when attacking Juggernaught units."],
    },
    juggernaught: {
        classKey: "juggernaught",
        label: "Juggernaught",
        path: "/svg/units/UI_UnitItem_UnitClass_Juggernaught.svg",
        bonusAbilityKey: "UnitAbility_Class_BonusVsHero",
        bonusTargetLabel: "Hero",
        fallbackDescriptionLines: ["+10% [Damage] Damage when attacking Hero units."],
    },
};

const COMBINED_CLASS_ICONS: Record<string, UnitClassIcon> = {
    cavalryranged: {
        classKey: "cavalryranged",
        label: "Cavalry Ranged",
        path: "/svg/units/UI_UnitItem_UnitClass_CavalryRanged.svg",
        bonusAbilityKey: null,
        bonusTargetLabel: null,
        fallbackDescriptionLines: [],
    },
    flyingranged: {
        classKey: "flyingranged",
        label: "Flying Ranged",
        path: "/svg/units/UI_UnitItem_UnitClass_FlyingRanged.svg",
        bonusAbilityKey: null,
        bonusTargetLabel: null,
        fallbackDescriptionLines: [],
    },
    flyingswarm: {
        classKey: "flyingswarm",
        label: "Flying Swarm",
        path: "/svg/units/UI_UnitItem_UnitClass_FlyingSwarm.svg",
        bonusAbilityKey: null,
        bonusTargetLabel: null,
        fallbackDescriptionLines: [],
    },
    rangedjuggernaught: {
        classKey: "rangedjuggernaught",
        label: "Ranged Juggernaught",
        path: "/svg/units/UI_UnitItem_UnitClass_RangedJuggernaught.svg",
        bonusAbilityKey: null,
        bonusTargetLabel: null,
        fallbackDescriptionLines: [],
    },
    juggernaughtranged: {
        classKey: "juggernaughtranged",
        label: "Juggernaught Ranged",
        path: "/svg/units/UI_UnitItem_UnitClass_RangedJuggernaught.svg",
        bonusAbilityKey: null,
        bonusTargetLabel: null,
        fallbackDescriptionLines: [],
    },
};

const SPLIT_CLASS_ORDER = ["juggernaught", "flying", "cavalry", "ranged", "swarm", "infantry", "melee"];

function normalizeClassInput(value: string | null | undefined): string {
    return String(value ?? "")
        .trim()
        .replace(/^UnitClass_/i, "")
        .replace(/_Hero$/i, "")
        .replace(/[^a-z0-9]+/gi, "")
        .toLowerCase();
}

export function getUnitClassIcons(
    unitClassKey: string | null | undefined,
    unitClassDisplayName?: string | null
): UnitClassIcon[] {
    const normalizedKey = normalizeClassInput(unitClassKey);
    const normalizedLabel = normalizeClassInput(unitClassDisplayName);
    const candidates = [normalizedKey, normalizedLabel].filter(Boolean);

    for (const candidate of candidates) {
        const direct = SINGLE_CLASS_ICONS[candidate];
        if (direct) return [direct];
    }

    for (const candidate of candidates) {
        const splitIcons = SPLIT_CLASS_ORDER
            .filter((classKey) => candidate.includes(classKey))
            .map((classKey) => SINGLE_CLASS_ICONS[classKey])
            .filter((icon, index, icons) => icons.findIndex((other) => other.path === icon.path) === index);

        if (splitIcons.length > 1) return splitIcons;
    }

    for (const candidate of candidates) {
        const combined = COMBINED_CLASS_ICONS[candidate];
        if (combined) return [combined];
    }

    return [];
}
