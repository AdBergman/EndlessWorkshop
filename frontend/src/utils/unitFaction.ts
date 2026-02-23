import { Unit, FactionInfo } from "@/types/dataTypes";

const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, "_").trim();
const normFaction = (s: string | null | undefined) => normalize(String(s ?? ""));

// Handles "Aspect" vs "ASPECTS" vs "aspects" etc.
export function unitMatchesSelectedMajorFaction(unit: Unit, selectedFaction: FactionInfo): boolean {
    if (unit.isMajorFaction !== true) return false;
    if (!selectedFaction?.isMajor) return false;

    const uf = normFaction(unit.faction);
    const label = normFaction(selectedFaction.uiLabel);
    const enumKey = normFaction(selectedFaction.enumFaction as any);

    const ufSingular = uf.endsWith("s") ? uf.slice(0, -1) : uf;
    const labelSingular = label.endsWith("s") ? label.slice(0, -1) : label;
    const enumSingular = enumKey.endsWith("s") ? enumKey.slice(0, -1) : enumKey;

    return (
        uf === label ||
        uf === enumKey ||
        ufSingular === labelSingular ||
        ufSingular === enumSingular
    );
}

export function isMinorUnit(unit: Unit): boolean {
    return unit.isMajorFaction === false;
}

export function isRootUnit(unit: Unit): boolean {
    return unit.previousUnitKey == null && unit.evolutionTierIndex === 0;
}