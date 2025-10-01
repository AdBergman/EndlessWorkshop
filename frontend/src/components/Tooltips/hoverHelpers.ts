import { Improvement, District } from "@dataTypes/dataTypes";

export interface HoveredWithCoords<T> {
    data: T;
    coords: { xPct: number; yPct: number };
}

/**
 * Calculate hover coordinates either relative to a container or the viewport.
 */
export const getHoverCoords = (
    e: React.MouseEvent<HTMLElement>,
    container?: HTMLElement
): { xPct: number; yPct: number } => {
    const rect = e.currentTarget.getBoundingClientRect();

    if (container) {
        const containerRect = container.getBoundingClientRect();
        return {
            xPct: ((rect.left - containerRect.left) / containerRect.width) * 100,
            yPct: ((rect.top - containerRect.top) / containerRect.height) * 100,
        };
    } else {
        return {
            xPct: (rect.left / window.innerWidth) * 100,
            yPct: (rect.top / window.innerHeight) * 100,
        };
    }
};

export const createHoveredImprovement = (
    impObj: Improvement,
    e: React.MouseEvent<HTMLElement>,
    container?: HTMLElement
): HoveredWithCoords<Improvement> => ({
    data: impObj,
    coords: getHoverCoords(e, container),
});

export const createHoveredDistrict = (
    distObj: District,
    e: React.MouseEvent<HTMLElement>,
    container?: HTMLElement
): HoveredWithCoords<District> => ({
    data: distObj,
    coords: getHoverCoords(e, container),
});
