// assetHelpers.ts
import { Unit } from "@/types/dataTypes";

export const DEFAULT_UNIT_IMAGE = "/graphics/units/placeholder.png";

const MINOR_BASE = "/graphics/units/minorFactions";
const MAJOR_BASE = "/graphics/units";

/**
 * Deterministic slug:
 * - CamelCase → snake_case
 * - spaces → _
 * - lowercase
 * - remove non [a-z0-9_]
 */
function slugify(input: string): string {
    return input
        .trim()
        .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "")
        .replace(/_+/g, "_")
        .replace(/^_+|_+$/g, "");
}

/**
 * Map backend faction string → actual filename prefix
 * (backend sends "Aspect", files use "aspects")
 */
function majorFactionFilePrefix(unit: Unit): string | null {
    const raw = unit.faction?.trim();
    if (!raw) return null;

    const f = slugify(raw);

    if (f === "aspect" || f === "aspects") return "aspects";
    if (f === "lord" || f === "lords") return "lords";
    if (f === "necrophage" || f === "necrophages") return "necrophages";
    if (f === "kin") return "kin";
    if (f === "tahuk") return "tahuk";

    return f || null;
}

/**
 * Strip UnitClass_ prefix and slugify
 */
function unitClassFileSuffix(unit: Unit): string | null {
    const raw = unit.unitClassKey?.trim();
    if (!raw) return null;

    const withoutPrefix = raw.startsWith("UnitClass_")
        ? raw.slice("UnitClass_".length)
        : raw;

    return slugify(withoutPrefix) || null;
}

/**
 * MAIN RESOLVER
 */
export function getUnitImageUrl(unit: Unit): string {
    // ----------------------------
    // Minor factions
    // ----------------------------
    if (unit.isMajorFaction === false) {
        const minorName = unit.faction?.trim();
        if (!minorName) return DEFAULT_UNIT_IMAGE;

        const minorSlug = slugify(minorName);
        return `${MINOR_BASE}/${minorSlug}.png`;
    }

    // ----------------------------
    // Major factions
    // ----------------------------
    const factionPrefix = majorFactionFilePrefix(unit);
    if (!factionPrefix) return DEFAULT_UNIT_IMAGE;

    // 1️⃣ Variant art using artId
    if (unit.artId && unit.artId.trim()) {
        const artSlug = slugify(unit.artId);
        return `${MAJOR_BASE}/${factionPrefix}_${artSlug}.png`;
    }

    // 2️⃣ Standard fallback using unitClassKey
    const classSuffix = unitClassFileSuffix(unit);
    if (!classSuffix) return DEFAULT_UNIT_IMAGE;

    return `${MAJOR_BASE}/${factionPrefix}_${classSuffix}.png`;
}