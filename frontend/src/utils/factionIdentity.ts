import { Faction } from "@/types/dataTypes";

export interface FactionInfo {
    isMajor: boolean;
    enumFaction: Faction | null;
    uiLabel: string;
    minorName: string | null;
}

export function identifyFaction(unit: {
    faction: Faction | null;
    minorFaction: string | null;
}): FactionInfo {
    const isMajor = !!unit.faction;
    if (isMajor) {
        return {
            isMajor: true,
            enumFaction: unit.faction as Faction,
            uiLabel: unit.faction.toLowerCase(),
            minorName: null,
        };
    }
    return {
        isMajor: false,
        enumFaction: null,
        uiLabel: (unit.minorFaction || "").toLowerCase(),
        minorName: unit.minorFaction,
    };
}
