import { getIconPath } from "./iconManifest";

export type UnitCardStat = "damage" | "health" | "defense" | "movement" | "focus" | "upkeep";

const UNIT_CARD_STAT_ICON_KEYS: Record<UnitCardStat, readonly [section: string, key: string]> = {
    damage: ["stats", "damage"],
    health: ["stats", "health"],
    defense: ["stats", "defense"],
    movement: ["stats", "movement"],
    focus: ["stats", "focus"],
    upkeep: ["stats", "unitUpkeep"],
};

export function getUnitCardStatIconPath(stat: UnitCardStat): string | null {
    const [section, key] = UNIT_CARD_STAT_ICON_KEYS[stat];
    return getIconPath(section, key);
}

export function getConfiguredUnitCardStatIconPaths(): string[] {
    return Object.keys(UNIT_CARD_STAT_ICON_KEYS)
        .map((stat) => getUnitCardStatIconPath(stat as UnitCardStat))
        .filter((path): path is string => !!path);
}
