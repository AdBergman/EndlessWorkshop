// src/lib/units/deriveUnit.ts
import type { Unit, Faction } from "@/types/dataTypes";
import { getUnitImageUrl } from "@/utils/assetHelpers";

export type UnitStats = {
    health: number | null;
    defense: number | null;
    damage: number | null;
    movement: number | null;
    visionRange: number | null;
    upkeep: number | null;
};

export type DerivedUnit = {
    unit: Unit;

    displayName: string;
    isMinor: boolean;

    tierIndex0: number | null;      // raw exporter tier (0-based)
    tierLabel: string | null;       // UI tier label (Necro special-case)
    classKey: string | null;
    classLabel: string | null;
    typeLine: string | null;

    majorEnumFaction: Faction | null;

    imageUrl: string | null;

    stats: UnitStats;

    abilities: string[];
};

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

function toRoman(n: number): string {
    return ROMAN[n - 1] ?? String(n);
}

function titleCaseWords(input: string): string {
    return input
        .split(/[\s_]+/g)
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");
}

function stripUnitClassPrefix(s: string): string {
    return s.startsWith("UnitClass_") ? s.slice("UnitClass_".length) : s;
}

function mapMajorFactionStringToEnum(faction: string | null): Faction | null {
    if (!faction) return null;

    const norm = faction.trim().toLowerCase();

    if (norm === "kin" || norm.includes("kin")) return ("KIN" as unknown) as Faction;
    if (norm === "aspect" || norm === "aspects") return ("ASPECTS" as unknown) as Faction;
    if (norm === "lords" || norm.includes("lord")) return ("LORDS" as unknown) as Faction;
    if (norm === "necrophage" || norm === "necrophages") return ("NECROPHAGES" as unknown) as Faction;
    if (norm === "tahuk" || norm === "tahuks" || norm === "mukag") return ("TAHUK" as unknown) as Faction;

    return null;
}

function firstNumberInLine(line: string): number | null {
    const m = line.match(/[-+]?\d+/);
    if (!m) return null;
    const n = Number(m[0]);
    return Number.isFinite(n) ? n : null;
}

function findStat(lines: string[], token: string): number | null {
    const line = lines.find((l) => typeof l === "string" && l.includes(`[${token}]`));
    if (!line) return null;
    return firstNumberInLine(line);
}

function findUpkeep(lines: string[]): number | null {
    const line = lines.find((l) => typeof l === "string" && /upkeep/i.test(l));
    if (!line) return null;
    return firstNumberInLine(line);
}

function findDamage(lines: string[]): number | null {
    const line = lines.find((l) => typeof l === "string" && l.includes("[Damage]"));
    if (!line) return null;
    return firstNumberInLine(line);
}

function buildTypeLine(tierLabel: string | null, classLabel: string | null): string | null {
    if (tierLabel && classLabel) return `${classLabel} ${tierLabel}`;
    return classLabel ?? tierLabel ?? null;
}

/**
 * Necrophage exception:
 * - Larvae is the true “Tier 0”
 * - Its evolutions should start at Tier I (not Tier II)
 *
 * Exported evolutionTierIndex is still 0-based, but historically your UI displays tierIndex+1.
 * For Necro, we display tierIndex (so 0 stays 0, 1 becomes I, 2 becomes II, etc).
 */
function isNecrophageMajor(unit: Unit): boolean {
    if (unit.isMajorFaction !== true) return false;
    const f = (unit.faction ?? "").trim().toLowerCase();
    return f === "necrophage" || f === "necrophages";
}

function getDisplayTierLabel(unit: Unit, tierIndex0: number | null): string | null {
    if (tierIndex0 == null) return null;

    if (isNecrophageMajor(unit)) {
        // Tier 0 special-case (Larvae)
        if (tierIndex0 === 0) return "Tier 0";
        return `Tier ${toRoman(tierIndex0)}`; // 1 -> I, 2 -> II, ...
    }

    // Default behavior: 0-based -> Tier I
    return `Tier ${toRoman(tierIndex0 + 1)}`;
}

export function deriveUnit(unit: Unit): DerivedUnit {
    const lines = Array.isArray(unit.descriptionLines) ? unit.descriptionLines : [];

    const isMinor = unit.isMajorFaction === false;

    const displayName = unit.displayName?.trim() || unit.unitKey;

    const tierIndex0 = unit.evolutionTierIndex ?? null;
    const tierLabel = getDisplayTierLabel(unit, tierIndex0);

    const classKey = unit.unitClassKey?.trim() || null;
    const classLabel = classKey ? titleCaseWords(stripUnitClassPrefix(classKey)) : null;

    const typeLine = buildTypeLine(tierLabel, classLabel);

    const majorEnumFaction = isMinor ? null : mapMajorFactionStringToEnum(unit.faction);

    let imageUrl: string | null = null;
    try {
        const url = getUnitImageUrl(unit);
        imageUrl = typeof url === "string" && url.trim() ? url.trim() : null;
    } catch {
        imageUrl = null;
    }

    const stats: UnitStats = {
        health: findStat(lines, "Health"),
        defense: findStat(lines, "Defense"),
        damage: findDamage(lines),
        movement: findStat(lines, "MovementPoints"),
        visionRange: findStat(lines, "VisionRange"),
        upkeep: findUpkeep(lines),
    };

    const abilities = (unit.abilityKeys ?? [])
        .filter((k): k is string => typeof k === "string")
        .map((k) => k.trim())
        .filter(Boolean);

    return {
        unit,
        displayName,
        isMinor,
        tierIndex0,
        tierLabel,
        classKey,
        classLabel,
        typeLine,
        majorEnumFaction,
        imageUrl,
        stats,
        abilities,
    };
}