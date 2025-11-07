import { Improvement, District } from "@/types/dataTypes";

// The coords property is now a union type to support both coordinate systems.
export interface HoveredWithCoords<T> {
    data: T;
    coords: { xPct: number; yPct: number } | { x: number; y: number; mode: 'pixel' };
}

/**
 * Calculates the absolute pixel coordinates for a tooltip.
 */
export const getHoverCoords = (
    e: React.MouseEvent<HTMLElement>
): { x: number; y: number; mode: 'pixel' } => {
    const rect = e.currentTarget.getBoundingClientRect();

    // Position the tooltip based on the RIGHT edge of the hovered element, plus a small offset.
    // This ensures the tooltip doesn't obscure the item being hovered.
    return {
        x: rect.right + window.scrollX + 10, // Position 10px to the right of the element
        y: rect.top + window.scrollY,
        mode: 'pixel',
    };
};

export const createHoveredImprovement = (
    impObj: Improvement,
    e: React.MouseEvent<HTMLElement>
): HoveredWithCoords<Improvement> => ({
    data: impObj,
    coords: getHoverCoords(e),
});

export const createHoveredDistrict = (
    distObj: District,
    e: React.MouseEvent<HTMLElement>
): HoveredWithCoords<District> => ({
    data: distObj,
    coords: getHoverCoords(e),
});

import { Unit } from "@/types/dataTypes";

export const createHoveredUnit = (
    unitObj: Unit,
    e: React.MouseEvent<HTMLElement>
): HoveredWithCoords<Unit> => ({
    data: unitObj,
    coords: getHoverCoords(e),
});
