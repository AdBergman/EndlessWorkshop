import abilityIconsJson from "../../../public/svg/ability-icons.json";

export type AbilityIconMetadata = {
    path: string;
    displayName?: string;
    kind?: string;
    color?: string;
};

type AbilityIconsJson = {
    schemaVersion?: number;
    abilities?: Record<string, AbilityIconMetadata>;
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

export function getAbilityIconMetadata(abilityKey: string): AbilityIconMetadata | null {
    const normalized = normalizeAbilityKey(abilityKey);
    if (!normalized) return null;

    const icon = abilityIcons[normalized];
    const path = icon?.path?.trim();
    if (!icon || !path) return null;

    return { ...icon, path };
}
