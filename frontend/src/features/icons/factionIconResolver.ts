import { getRawIcon } from "./iconManifest";

const MAJOR_FACTION_ALIASES: Record<string, string> = {
    aspect: "Aspect",
    aspects: "Aspect",
    kin: "KinOfSheredyn",
    kinofsheredyn: "KinOfSheredyn",
    lastlord: "LastLord",
    lastlords: "LastLord",
    lord: "LastLord",
    lords: "LastLord",
    mukag: "Mukag",
    tahuk: "Mukag",
    tahuks: "Mukag",
    necrophage: "Necrophage",
    necrophages: "Necrophage",
};

const MAJOR_FACTION_ICON_RAW_KEYS: Record<string, string> = {
    Aspect: "effect_Aspects_CoralExploitationBoost",
    KinOfSheredyn: "factionQuest_KinOfSheredyn_Chapter02_Step01_Choice1",
    LastLord: "effect_LastLord_ImprovedDustTiles",
    Mukag: "factionAffinity_Mukag_210fe287",
    Necrophage: "factionTrait_Necrophage_CadaversConversion_EffectFeedbackOverride",
};

const MINOR_FACTION_ICON_RAW_KEYS: Record<string, string> = {
    ametrine: "factionAffinity_Ametrine",
    blackhammer: "factionAffinity_Blackhammer",
    blackhammers: "factionAffinity_Blackhammer",
    daughterofbor: "factionAffinity_DaughterOfBor",
    daughtersofbor: "factionAffinity_DaughterOfBor",
    dungeon: "factionAffinity_Dungeon",
    foundling: "factionAffinity_Foundling",
    foundlings: "factionAffinity_Foundling",
    gorog: "factionAffinity_Gorog",
    greenscion: "factionAffinity_GreenScion",
    greenscions: "factionAffinity_GreenScion",
    hoyandladhran: "factionAffinity_HoyAndLadhran",
    hydracorn: "factionAffinity_Hydracorn",
    mangroveofharmony: "factionAffinity_MangroveOfHarmony",
    noquensii: "factionAffinity_Noquensii",
    ochling: "factionAffinity_Ochling",
    oneiroi: "factionAffinity_Oneiroi",
    sollusk: "factionAffinity_Sollusk",
    consortium: "factionAffinity_TheConsortium",
    theconsortium: "factionAffinity_TheConsortium",
    unseeingseer: "factionAffinity_UnseeingSeer",
    unseeingseers: "factionAffinity_UnseeingSeer",
    xavius: "factionAffinity_Xavius",
};

function normalizeFactionToken(value: string): string {
    return value
        .trim()
        .replace(/^(Faction|MinorFaction)_/i, "")
        .replace(/[^A-Za-z0-9]/g, "")
        .toLowerCase();
}

function rawAffinityKey(value: string): string | null {
    const normalized = normalizeFactionToken(value);
    if (!normalized) return null;

    const majorAlias = MAJOR_FACTION_ALIASES[normalized];
    if (majorAlias) {
        return MAJOR_FACTION_ICON_RAW_KEYS[majorAlias] ?? `factionAffinity_${majorAlias}`;
    }

    const minorRawKey = MINOR_FACTION_ICON_RAW_KEYS[normalized];
    if (minorRawKey) return minorRawKey;

    const compactValue = value
        .trim()
        .replace(/^(Faction|MinorFaction)_/i, "")
        .replace(/[^A-Za-z0-9]/g, "");

    return compactValue ? `factionAffinity_${compactValue}` : null;
}

export function getFactionIconPath(value: string): string | null {
    const rawKey = rawAffinityKey(value);
    return rawKey ? getRawIcon(rawKey) : null;
}
