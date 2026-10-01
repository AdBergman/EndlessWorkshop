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

const legacyFactions = [
    { key: "Faction_KinOfSheredyn", value: "KIN", label: "Kin", aliases: ["kin", "kinofsheredyn", "sheredyn"] },
    { key: "Faction_LastLord", value: "LORDS", label: "Lords", aliases: ["lord", "lords", "lastlord", "lastlords"] },
    { key: "Faction_Aspect", value: "ASPECTS", label: "Aspects", aliases: ["aspect", "aspects"] },
    { key: "Faction_Necrophage", value: "NECROPHAGES", label: "Necrophages", aliases: ["necrophage", "necrophages", "necro"] },
    { key: "Faction_Mukag", value: "TAHUK", label: "Tahuk", aliases: ["mukag", "tahuk", "tahuks"] },
];

const compactFactionToken = (value: string) => value.trim()
    .replace(/^(?:Faction|MinorFaction)[_ ]/i, "")
    .replace(/[^a-z0-9]/gi, "").toLowerCase();

const legacyFaction = (value: string) => {
    const token = compactFactionToken(value);
    return legacyFactions.find((faction) => faction.aliases.includes(token));
};

export function factionIdentityToken(value: string | null | undefined): string {
    const raw = value ?? "";
    return compactFactionToken(legacyFaction(raw)?.key ?? raw);
}

export function factionInfoForKey(value: string, label?: string): FactionInfo {
    const raw = value.trim();
    const known = legacyFaction(raw);
    const token = raw.replace(/^Faction[_ ]/i, "");
    return {
        isMajor: true,
        factionKey: known?.key ?? (raw.startsWith("Faction_") ? raw : `Faction_${token}`),
        enumFaction: known?.value ?? token.toUpperCase(),
        uiLabel: label ?? known?.label ?? token.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[_-]/g, " "),
        minorName: null,
    };
}

export function factionMatchesSelection(value: string | null | undefined, selection: FactionInfo): boolean {
    const token = factionIdentityToken(value);
    if (!token) return false;
    const candidates = selection.factionKey ? [selection.factionKey] : [selection.enumFaction, selection.uiLabel];
    return candidates
        .some((candidate) => factionIdentityToken(candidate) === token);
}

export function factionRouteValue(selection: FactionInfo): string {
    const value = selection.factionKey ?? selection.enumFaction ?? selection.uiLabel;
    return legacyFaction(value)?.label.toLowerCase() ?? value;
}
