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

    tierIndex0: number | null;
    tierLabel: string | null; // "Tier II"
    classKey: string | null;  // "UnitClass_Cavalry"
    classLabel: string | null; // "Cavalry"
    typeLine: string | null;  // "Cavalry Tier II" (or whatever ordering you want)

    majorEnumFaction: Faction | null; // only if major + recognized

    imageUrl: string | null;

    stats: UnitStats;

    abilities: string[]; // cleaned, deterministic
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

    if (norm === "kin" || norm.includes("kin")) return (("KIN" as unknown) as Faction);
    if (norm === "aspect" || norm === "aspects") return (("ASPECTS" as unknown) as Faction);
    if (norm === "lords" || norm.includes("lord")) return (("LORDS" as unknown) as Faction);
    if (norm === "necrophage" || norm === "necrophages") return (("NECROPHAGES" as unknown) as Faction);
    if (norm === "tahuk" || norm === "tahuks" || norm === "mukag") return (("TAHUK" as unknown) as Faction);

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

export function deriveUnit(unit: Unit): DerivedUnit {
    const lines = Array.isArray(unit.descriptionLines) ? unit.descriptionLines : [];

    const isMinor = unit.isMajorFaction === false;

    const displayName = unit.displayName?.trim() || unit.unitKey;

    const tierIndex0 = unit.evolutionTierIndex ?? null;
    const tierLabel = tierIndex0 != null ? `Tier ${toRoman(tierIndex0 + 1)}` : null;

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