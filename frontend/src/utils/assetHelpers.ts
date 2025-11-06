import { Unit } from "@/types/dataTypes";

/**
 * Generates the correct image URL for a given unit.
 * This centralizes the logic for asset paths and naming conventions.
 *
 * @param unit The unit object.
 * @returns A string representing the image URL.
 */
export function getUnitImageUrl(unit: Unit): string {
    const faction = unit.faction?.toLowerCase();
    const defaultImage = `/graphics/units/placeholder.png`;

    // If faction isn't defined, we can't build a proper URL.
    if (!faction) {
        return defaultImage;
    }

    // Use artId if it exists, otherwise fall back to the unit's type.
    const variant = unit.artId
        ? unit.artId.toLowerCase()
        : unit.type.toLowerCase();

    if (!variant) {
        return defaultImage;
    }

    return `/graphics/units/${faction}_${variant}.png`;
}
