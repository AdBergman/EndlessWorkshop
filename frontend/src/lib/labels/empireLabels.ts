export const EMPIRE_LABELS = {
    Faction_LastLord: "Last Lords",
    Faction_Aspect: "Aspects",
    Faction_Necrophage: "Necrophage",
    Faction_KinOfSheredyn: "Kin of Sheredyn",
    Faction_Mukag: "Tahuks",
} as const;

/**
 * Translates a factionKey into a stable display label.
 * Returns "Unknown" for any unsupported or missing key.
 */
export function getEmpireLabel(factionKey: unknown): string {
    if (typeof factionKey !== "string" || !factionKey.trim()) {
        return "Unknown";
    }

    return (
        EMPIRE_LABELS[factionKey as keyof typeof EMPIRE_LABELS] ??
        factionKey
    );
}