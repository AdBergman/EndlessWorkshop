import type { Faction, FactionInfo } from "@/types/dataTypes";

export function identifyFaction(unit: {
    faction: Faction | null;
    minorFaction: string | null;
}): FactionInfo {
    if (unit.faction) {
        return {
            isMajor: true,
            enumFaction: unit.faction,
            uiLabel: unit.faction.toLowerCase(),
            minorName: null,
        };
    }

    const minor = unit.minorFaction ?? "";

    return {
        isMajor: false,
        enumFaction: null,
        uiLabel: minor.toLowerCase(),
        minorName: minor || null,
    };
}