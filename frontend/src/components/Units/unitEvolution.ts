import { Unit } from "@/types/dataTypes";

export function buildEvolutionLayers(root: Unit, unitsMap: Map<string, Unit>): Unit[][] {
    const layers: Map<number, Unit[]> = new Map();
    const depth: Map<string, number> = new Map();
    const queue: string[] = [];

    depth.set(root.name, 0);
    queue.push(root.name);

    while (queue.length) {
        const currentName = queue.shift()!;
        const currentUnit = unitsMap.get(currentName);
        const currentDepth = depth.get(currentName)!;

        if (!currentUnit) continue;

        for (const childName of currentUnit.upgradesTo ?? []) {
            if (!depth.has(childName)) {
                depth.set(childName, currentDepth + 1);
                queue.push(childName);
            }
        }
    }

    // Group by depth
    for (const [name, d] of depth.entries()) {
        if (d === 0) continue; // skip root in grouping
        const u = unitsMap.get(name);
        if (!u) continue;
        if (!layers.has(d)) layers.set(d, []);
        layers.get(d)!.push(u);
    }

    return [...layers.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([, units]) => units);
}
