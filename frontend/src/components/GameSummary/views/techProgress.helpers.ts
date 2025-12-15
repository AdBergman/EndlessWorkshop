import { TechOrderEntryV1 } from "@/types/endGameReport";

export type EmpireMeta = {
    idx: number;
    faction: string;
    isPlayer: boolean;
    labelLong: string; // "Necrophage ★ (Player) (E0)"
    labelShort: string; // "Necrophage ★"
};

export function getFactionFromAllStatsEmpire(e: any, idx: number): string {
    return e?.FactionDisplayName || e?.FactionKey || `Empire ${idx}`;
}

/**
 * Build empire labels using allStats if available (best UX), fallback otherwise.
 * Returns entries 0..empireCount-1 always.
 */
export function buildEmpireMeta(empireCount: number, allStats: any): EmpireMeta[] {
    const fallback = Array.from({ length: empireCount }, (_, idx) => {
        const isPlayer = idx === 0;
        const faction = `Empire ${idx}`;
        return {
            idx,
            faction,
            isPlayer,
            labelShort: isPlayer ? `${faction} ★` : faction,
            labelLong: isPlayer ? `${faction} ★ (Player) (E${idx})` : `${faction} (E${idx})`,
        } satisfies EmpireMeta;
    });

    const empires: any[] = allStats?.Empires ?? [];
    if (!empires.length) return fallback;

    const map = new Map<number, EmpireMeta>();

    // Prefer indices present in allStats
    for (const e of empires) {
        const idx = e?.EmpireIndex ?? e?.empireIndex ?? 0;
        const isPlayer = idx === 0;
        const faction = getFactionFromAllStatsEmpire(e, idx);

        map.set(idx, {
            idx,
            faction,
            isPlayer,
            labelShort: isPlayer ? `${faction} ★` : faction,
            labelLong: isPlayer ? `${faction} ★ (Player) (E${idx})` : `${faction} (E${idx})`,
        });
    }

    // Ensure we still have entries up to empireCount
    const result: EmpireMeta[] = [];
    for (let i = 0; i < empireCount; i++) {
        result.push(
            map.get(i) ?? {
                idx: i,
                faction: `Empire ${i}`,
                isPlayer: i === 0,
                labelShort: i === 0 ? `Empire ${i} ★` : `Empire ${i}`,
                labelLong: i === 0 ? `Empire ${i} ★ (Player) (E${i})` : `Empire ${i} (E${i})`,
            }
        );
    }

    return result;
}

export type GroupedTechOrder = {
    maxTurn: number;
    groupedGlobal: Map<number, TechOrderEntryV1[]>;
    groupedByEmpire: Map<number, Map<number, TechOrderEntryV1[]>>;
};

/**
 * Pure grouping logic for TechOrder entries.
 * - groupedGlobal: turn -> entries (sorted by empireIndex then tech name)
 * - groupedByEmpire: empireIndex -> (turn -> entries) (sorted by tech name)
 */
export function groupTechOrderEntries(entries: TechOrderEntryV1[]): GroupedTechOrder {
    let maxTurn = 0;

    const groupedGlobal = new Map<number, TechOrderEntryV1[]>();
    const groupedByEmpire = new Map<number, Map<number, TechOrderEntryV1[]>>();

    for (const e of entries) {
        if (e.turn > maxTurn) maxTurn = e.turn;

        // global
        if (!groupedGlobal.has(e.turn)) groupedGlobal.set(e.turn, []);
        groupedGlobal.get(e.turn)!.push(e);

        // per empire -> per turn
        if (!groupedByEmpire.has(e.empireIndex)) groupedByEmpire.set(e.empireIndex, new Map());
        const perEmpire = groupedByEmpire.get(e.empireIndex)!;

        if (!perEmpire.has(e.turn)) perEmpire.set(e.turn, []);
        perEmpire.get(e.turn)!.push(e);
    }

    // sort within turn for stable display
    groupedGlobal.forEach((list) => {
        list.sort(
            (a, b) =>
                a.empireIndex - b.empireIndex ||
                a.technologyDefinitionName.localeCompare(b.technologyDefinitionName)
        );
    });

    groupedByEmpire.forEach((perEmpire) => {
        perEmpire.forEach((list) => {
            list.sort((a, b) => a.technologyDefinitionName.localeCompare(b.technologyDefinitionName));
        });
    });

    return { maxTurn, groupedGlobal, groupedByEmpire };
}