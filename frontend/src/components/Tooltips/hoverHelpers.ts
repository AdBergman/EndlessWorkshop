import { Improvement, District } from "@dataTypes/dataTypes";

export interface HoveredWithCoords<T> {
    data: T;
    coords: { xPct: number; yPct: number };
}

export const getHoverCoords = (e: React.MouseEvent<HTMLElement>) => ({
    xPct: (e.currentTarget.getBoundingClientRect().left / window.innerWidth) * 100,
    yPct: (e.currentTarget.getBoundingClientRect().top / window.innerHeight) * 100,
});

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
