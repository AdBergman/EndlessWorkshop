import { Unit } from "@/types/dataTypes";

export function buildEvolutionLayers(root: Unit, unitsByKey: Map<string, Unit>): Unit[][] {
    const layers = new Map<number, Unit[]>();
    const depthByKey = new Map<string, number>();

    const rootKey = root.unitKey;
    depthByKey.set(rootKey, 0);

    const queue: string[] = [rootKey];
    let qi = 0;

    const MAX_VISITS = 5000;
    let visits = 0;

    while (qi < queue.length) {
        if (++visits > MAX_VISITS) break;

        const currentKey = queue[qi++];
        const currentDepth = depthByKey.get(currentKey);
        if (currentDepth == null) continue;

        const currentUnit = currentKey === rootKey ? root : unitsByKey.get(currentKey);
        if (!currentUnit) continue;

        const childrenKeys = Array.isArray(currentUnit.nextEvolutionUnitKeys)
            ? currentUnit.nextEvolutionUnitKeys
            : [];

        for (const childKey of childrenKeys) {
            if (!childKey) continue;
            if (depthByKey.has(childKey)) continue;

            depthByKey.set(childKey, currentDepth + 1);
            queue.push(childKey);
        }
    }

    for (const [unitKey, d] of depthByKey.entries()) {
        if (d === 0) continue;

        const u = unitsByKey.get(unitKey);
        if (!u) continue;

        const bucket = layers.get(d);
        if (bucket) bucket.push(u);
        else layers.set(d, [u]);
    }

    const sortTier = (a: Unit, b: Unit) => {
        const ta = a.evolutionTierIndex ?? Number.MAX_SAFE_INTEGER;
        const tb = b.evolutionTierIndex ?? Number.MAX_SAFE_INTEGER;
        if (ta !== tb) return ta - tb;

        const na = (a.displayName ?? "").localeCompare(b.displayName ?? "");
        if (na !== 0) return na;

        return a.unitKey.localeCompare(b.unitKey);
    };

    return [...layers.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([, units]) => units.sort(sortTier));
}