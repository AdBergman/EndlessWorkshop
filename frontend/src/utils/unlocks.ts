// utils/unlocks.ts
import { Tech, Improvement } from "@/types/dataTypes";

const IMPROVEMENT_PREFIX = "Improvement: ";

export type UnlockedImprovement = Improvement & { era: number };

export const getUnlockedImprovements = (
    selectedTechs: Tech[],
    improvements: Improvement[]
): UnlockedImprovement[] => {
    // name -> earliest era it was unlocked in (stable + useful)
    const unlockedByName = new Map<string, number>();

    for (const tech of selectedTechs) {
        const era = tech.era ?? 1;

        for (const unlockLine of tech.unlocks ?? []) {
            if (!unlockLine.startsWith(IMPROVEMENT_PREFIX)) continue;

            const rawName = unlockLine.substring(IMPROVEMENT_PREFIX.length).trim();
            if (!rawName) continue;

            const key = rawName.toLowerCase();

            const prevEra = unlockedByName.get(key);
            if (prevEra === undefined || era < prevEra) unlockedByName.set(key, era);
        }
    }

    return improvements
        .filter((imp) => unlockedByName.has(imp.name.trim().toLowerCase()))
        .map((imp) => ({
            ...imp,
            era: unlockedByName.get(imp.name.trim().toLowerCase()) ?? 1,
        }));
};