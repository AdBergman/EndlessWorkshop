import { getDescriptionTokenIcon } from "./descriptionTokenIcons";

export type UnitCardStat = "damage" | "health" | "defense" | "movement" | "focus" | "upkeep";

const UNIT_CARD_STAT_TOKENS: Record<UnitCardStat, string> = {
    damage: "Damage",
    health: "Health",
    defense: "Defense",
    movement: "MovementPoints",
    focus: "Focus",
    upkeep: "Money",
};

export function getUnitCardStatIconPath(stat: UnitCardStat): string | null {
    return getDescriptionTokenIcon(UNIT_CARD_STAT_TOKENS[stat])?.path ?? null;
}

export function getConfiguredUnitCardStatIconPaths(): string[] {
    return Object.keys(UNIT_CARD_STAT_TOKENS)
        .map((stat) => getUnitCardStatIconPath(stat as UnitCardStat))
        .filter((path): path is string => !!path);
}
