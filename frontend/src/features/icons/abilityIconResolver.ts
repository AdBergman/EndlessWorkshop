import abilityIconsJson from "../../../public/svg/ability-icons.json";

type AbilityIconEntry = {
    path: string;
    displayName?: string;
    kind?: string;
    color?: string;
};

type AbilityIconsJson = {
    schemaVersion?: number;
    abilities?: Record<string, AbilityIconEntry>;
};

const abilityIcons = (abilityIconsJson as AbilityIconsJson).abilities ?? {};

function normalizeAbilityKey(abilityKey: string): string {
    return abilityKey.trim();
}

export function getAbilityIconPath(abilityKey: string): string | null {
    const normalized = normalizeAbilityKey(abilityKey);
    if (!normalized) return null;

    const icon = abilityIcons[normalized];
    return icon?.path?.trim() || null;
}
