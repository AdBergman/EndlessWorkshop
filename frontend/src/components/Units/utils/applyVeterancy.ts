import type { Unit } from "@/types/dataTypes";
import type { UnitStats } from "@/lib/units/deriveUnit";

export const MIN_VETERANCY_LEVEL = 0;
export const MAX_VETERANCY_LEVEL = 5;
export const VETERANCY_LEVELS = [0, 1, 2, 3, 4, 5] as const;

export const VETERANCY_LENS_DESCRIPTION =
    "Preview unit stats by veterancy level. Each level grants +2 Defense, +5% Damage, and +5% Health.";

export type VeterancyLevel = typeof VETERANCY_LEVELS[number];

export function clampVeterancyLevel(level: number): VeterancyLevel {
    if (!Number.isFinite(level)) return MIN_VETERANCY_LEVEL;
    const rounded = Math.round(level);
    return Math.max(MIN_VETERANCY_LEVEL, Math.min(MAX_VETERANCY_LEVEL, rounded)) as VeterancyLevel;
}

export function isVeterancyApplicable(unit: Pick<Unit, "isHero"> | null | undefined): boolean {
    return !!unit && unit.isHero !== true;
}

function applyPercentBonus(value: number | null, level: VeterancyLevel): number | null {
    if (value == null) return null;
    return Math.round(value * (1 + level * 0.05));
}

function applyDefenseBonus(value: number | null, level: VeterancyLevel): number | null {
    if (value == null) return level === MIN_VETERANCY_LEVEL ? null : level * 2;
    return value + level * 2;
}

export function applyVeterancyToStats(
    stats: UnitStats,
    level: number,
    applies: boolean = true
): UnitStats {
    const safeLevel = applies ? clampVeterancyLevel(level) : MIN_VETERANCY_LEVEL;

    return {
        ...stats,
        damage: applyPercentBonus(stats.damage, safeLevel),
        health: applyPercentBonus(stats.health, safeLevel),
        defense: applyDefenseBonus(stats.defense, safeLevel),
    };
}
