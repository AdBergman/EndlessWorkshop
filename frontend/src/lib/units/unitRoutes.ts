import type { Unit } from "@/types/dataTypes";

function normalizeRouteToken(value: string | null | undefined): string | null {
    const normalized = (value ?? "")
        .trim()
        .replace(/[^A-Za-z0-9]+/g, "")
        .toLowerCase();

    return normalized || null;
}

export function getUnitRouteFaction(unit: Pick<Unit, "faction" | "isMajorFaction">): string | null {
    const faction = normalizeRouteToken(unit.faction);
    if (!faction) return null;

    return faction;
}

export function buildUnitDetailsPath(unit: Pick<Unit, "unitKey" | "faction" | "isMajorFaction">): string {
    const params = new URLSearchParams();
    const routeFaction = getUnitRouteFaction(unit) ?? "kin";

    params.set("faction", routeFaction);
    params.set("unitKey", unit.unitKey);

    if (unit.isMajorFaction === false) {
        params.set("origin", routeFaction);
        params.set("minor", "1");
    }

    return `/units?${params.toString()}`;
}
