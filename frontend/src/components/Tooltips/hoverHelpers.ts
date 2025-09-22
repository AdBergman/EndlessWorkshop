import { Improvement, District } from "@dataTypes/dataTypes";

export interface HoveredWithCoords<T> {
    data: T;
    coords: { xPct: number; yPct: number };
}

/**
 * Calculate mouse hover coordinates as percentages of window dimensions.
 */
export const getHoverCoords = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
        xPct: (rect.left / window.innerWidth) * 100,
        yPct: (rect.top / window.innerHeight) * 100,
    };
};

/**
 * Create hovered improvement with coordinates
 */
export const createHoveredImprovement = (
    impObj: Improvement,
    e: React.MouseEvent<HTMLElement>
): HoveredWithCoords<Improvement> => ({
    data: impObj,
    coords: getHoverCoords(e),
});

/**
 * Create hovered district with coordinates
 */
export const createHoveredDistrict = (
    distObj: District,
    e: React.MouseEvent<HTMLElement>
): HoveredWithCoords<District> => ({
    data: distObj,
    coords: getHoverCoords(e),
});
