// src/lib/units/necrophageRoots.ts
import type { Unit } from "@/types/dataTypes";

const norm = (s: string | null | undefined) => (s ?? "").trim().toLowerCase();

function isNecrophageMajorFaction(unit: Unit): boolean {
    if (unit.isMajorFaction !== true) return false;
    const f = norm(unit.faction);
    return f === "necrophage" || f === "necrophages";
}

function isRootUnit(u: Unit): boolean {
    return u.previousUnitKey == null && u.evolutionTierIndex === 0;
}

function isVisibleMinorRoot(u: Unit, unitsByKey: Map<string, Unit>): boolean {
    if (u.isMajorFaction !== false) return false;
    if (isRootUnit(u)) return true;

    const previousKey = (u.previousUnitKey ?? "").trim();
    return !previousKey || !unitsByKey.has(previousKey);
}

export function getCarouselModelForFaction(
    factionUnits: Unit[],
    showMinorUnits: boolean
): { pinned: Unit | null; roots: Unit[] } {
    if (showMinorUnits) {
        const byKey = new Map(factionUnits.map((u) => [u.unitKey, u] as const));

        return {
            pinned: null,
            roots: factionUnits.filter((u) => isVisibleMinorRoot(u, byKey)),
        };
    }

    const majorRoots = factionUnits.filter((u) => u.isMajorFaction === true && isRootUnit(u));
    const hasNecro = majorRoots.some(isNecrophageMajorFaction);
    if (!hasNecro) return { pinned: null, roots: majorRoots };

    const larvae = majorRoots.find(
        (u) => isNecrophageMajorFaction(u) && (u.nextEvolutionUnitKeys?.length ?? 0) > 0
    );
    if (!larvae) return { pinned: null, roots: majorRoots };

    const byKey = new Map(factionUnits.map((u) => [u.unitKey, u] as const));

    const tier1 = (larvae.nextEvolutionUnitKeys ?? [])
        .map((k) => byKey.get(k))
        .filter((u): u is Unit => !!u)
        .filter((u) => u.evolutionTierIndex === 1);

    return {
        pinned: larvae,
        roots: tier1.length ? tier1 : majorRoots,
    };
}
