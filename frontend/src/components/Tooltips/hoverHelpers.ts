import { Improvement, District } from "@/types/dataTypes";

export type PixelTooltipPlacement = "right" | "left";
export type PixelTooltipCoords = { x: number; y: number; mode: "pixel"; placement?: PixelTooltipPlacement };

const TOOLTIP_GAP_PX = 10;
const TOOLTIP_MAX_WIDTH_PX = 320;

// The coords property is now a union type to support both coordinate systems.
export interface HoveredWithCoords<T> {
    data: T;
    coords: { xPct: number; yPct: number } | PixelTooltipCoords;
}

/**
 * Calculates the absolute pixel coordinates for a tooltip.
 */
export const getHoverCoords = (
    e: React.MouseEvent<HTMLElement>
): PixelTooltipCoords => getHoverCoordsForElement(e.currentTarget);

export const getHoverCoordsForElement = (element: HTMLElement): PixelTooltipCoords => {
    const rect = element.getBoundingClientRect();
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    const availableRight = viewportWidth - rect.right;
    const availableLeft = rect.left;
    const placement: PixelTooltipPlacement = availableRight < TOOLTIP_MAX_WIDTH_PX + TOOLTIP_GAP_PX
        && availableLeft >= TOOLTIP_MAX_WIDTH_PX + TOOLTIP_GAP_PX
        ? "left"
        : "right";

    return {
        x: (placement === "left" ? rect.left : rect.right) + window.scrollX
            + (placement === "left" ? -TOOLTIP_GAP_PX : TOOLTIP_GAP_PX),
        y: rect.top + window.scrollY,
        mode: "pixel",
        placement,
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
