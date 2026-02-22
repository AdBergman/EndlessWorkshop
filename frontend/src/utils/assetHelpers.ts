// assetHelpers.ts
import { Unit } from "@/types/dataTypes";

export const DEFAULT_UNIT_IMAGE = "/graphics/units/placeholder.png";

export function getUnitImageUrl(unit: Unit): string {
    const isMinor =
        (unit.faction && unit.faction.toUpperCase() === "MINOR") || unit.minorFaction;

    if (isMinor) {
        // Use the faction's UI label or name — both usually map to the minor faction
        const factionName = (unit.minorFaction || unit.displayName || "")
            .toLowerCase()
            .replace(/\s+/g, "_")
            .replace(/[^a-z0-9_]/g, "");

        // Build full path under /graphics/units/minorFactions/
        const basePath = `/graphics/units/minorFactions/${factionName}`;

        // Try .png first (since Ametrine.png exists), fallback handled by <img> onError
        return `${basePath}.png`;
    }

    // ✅ Restore the working path for major factions
    const faction = unit.faction?.toLowerCase();
    if (!faction) return DEFAULT_UNIT_IMAGE;

    const variant = unit.artId
        ? unit.artId.toLowerCase()
        : unit.type?.toLowerCase();

    if (!variant) return DEFAULT_UNIT_IMAGE;

    return `/graphics/units/${faction}_${variant}.png`;
}
