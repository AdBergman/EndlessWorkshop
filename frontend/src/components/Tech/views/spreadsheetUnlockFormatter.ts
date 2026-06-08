import type { District, Improvement, Tech, Unit } from "@/types/dataTypes";
import { stripDescriptionTokens } from "@/lib/descriptionLine/descriptionLineRenderer";
import { getFallbackUnlockDescription, resolveConstructibleUnlock } from "@/utils/unlocks";

export function formatTechUnlocks(
    tech: Tech,
    deps: {
        districtsByKey: Record<string, District>;
        improvementsByKey: Record<string, Improvement>;
        unitsByKey: Record<string, Unit>;
    }
): string {
    const { districtsByKey, improvementsByKey, unitsByKey } = deps;

    return (tech.unlocks ?? [])
        .map((unlock) => ({
            type: (unlock.unlockType ?? "").trim(),
            key: (unlock.unlockKey ?? "").trim(),
            unlockCategory: unlock.unlockCategory,
            constructibleKind: unlock.constructibleKind,
            fallbackDescriptionLines: unlock.fallbackDescriptionLines,
        }))
        .filter((unlock) => Boolean(unlock.key))
        .map((unlock) => {
            const resolved = resolveConstructibleUnlock(
                {
                    unlockType: unlock.type,
                    unlockKey: unlock.key,
                    unlockCategory: unlock.unlockCategory,
                    constructibleKind: unlock.constructibleKind,
                    fallbackDescriptionLines: unlock.fallbackDescriptionLines,
                },
                { districtsByKey, improvementsByKey, unitsByKey }
            );
            if (resolved) return `${resolved.kind}: ${resolved.displayName}`;

            const fallback = getFallbackUnlockDescription({
                unlockType: unlock.type,
                unlockKey: unlock.key,
                unlockCategory: unlock.unlockCategory,
                constructibleKind: unlock.constructibleKind,
                fallbackDescriptionLines: unlock.fallbackDescriptionLines,
            });
            if (!fallback) return null;

            const description = fallback.descriptionLines.map(stripDescriptionTokens).join("; ");
            return description
                ? `${fallback.kind}: ${fallback.key} - ${description}`
                : `${fallback.kind}: ${fallback.key}`;
        })
        .filter((value): value is string => Boolean(value))
        .join("; ");
}
