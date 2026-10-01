import { Unit, FactionInfo } from "@/types/dataTypes";

import { factionMatchesSelection } from "@/utils/factionIdentity";

export function unitMatchesSelectedMajorFaction(unit: Unit, selectedFaction: FactionInfo): boolean {
    return unit.isMajorFaction === true && selectedFaction.isMajor
        && factionMatchesSelection(unit.faction, selectedFaction);
}

export function isMinorUnit(unit: Unit): boolean {
    return unit.isMajorFaction === false;
}

export function isRootUnit(unit: Unit): boolean {
    return unit.previousUnitKey == null && unit.evolutionTierIndex === 0;
}