import type { Faction, FactionInfo } from "@/types/dataTypes";

/**
 * Legacy helper used ONLY by SavedTechBuild / build-order flows.
 */
export function identifyFactionLegacy(input: {
    faction: Faction | null;
    minorFaction: string | null;
}): FactionInfo {
    if (input.faction) {
        return {
            isMajor: true,
            enumFaction: input.faction,
            uiLabel: String(input.faction).toLowerCase(),
            minorName: null,
        };
    }

    const minor = input.minorFaction ?? "";
    return {
        isMajor: false,
        enumFaction: null,
        uiLabel: minor.toLowerCase(),
        minorName: minor || null,
    };
}