import type { AllStats, TechOrderEntry } from "@/types/endGameReport";

export type EmpireMeta = {
    idx: number;
    faction: string;
    isPlayer: boolean;
    labelLong: string;  // "Necrophage ★ (Player) (E0)"
    labelShort: string; // "Necrophage ★"
};

function factionFromAllStatsEmpire(e: AllStats["empires"][number], idx: number): string {
    const dn = typeof e.factionDisplayName === "string" ? e.factionDisplayName.trim() : "";
    if (dn) return dn;

    const key = typeof e.factionKey === "string" ? e.factionKey.trim() : "";
    if (key) return key;

    return `Empire ${idx}`;
}

export function buildEmpireMeta(empireCount: number, allStats: AllStats): EmpireMeta[] {
    const byIndex = new Map<number, string>();

    for (const e of allStats.empires) {
        byIndex.set(e.empireIndex, factionFromAllStatsEmpire(e, e.empireIndex));
    }

    const result: EmpireMeta[] = [];
    for (let idx = 0; idx < empireCount; idx++) {
        const isPlayer = idx === 0;
        const faction = byIndex.get(idx) ?? `Empire ${idx}`;

        const short = isPlayer ? `${faction} ★` : faction;
        const long = isPlayer ? `${faction} ★ (Player) (E${idx})` : `${faction} (E${idx})`;

        result.push({
            idx,
            faction,
            isPlayer,
            labelShort: short,
            labelLong: long,
        });
    }

    return result;
}

export type GroupedTechOrder = {
    maxTurn: number;
    groupedGlobal: Map<number, TechOrderEntry[]>;
    groupedByEmpire: Map<number, Map<number, TechOrderEntry[]>>;
};

export function groupTechOrderEntries(entries: TechOrderEntry[]): GroupedTechOrder {
    let maxTurn = 0;

    const groupedGlobal = new Map<number, TechOrderEntry[]>();
    const groupedByEmpire = new Map<number, Map<number, TechOrderEntry[]>>();

    for (const e of entries) {
        if (e.turn > maxTurn) maxTurn = e.turn;

        const global = groupedGlobal.get(e.turn);
        if (global) global.push(e);
        else groupedGlobal.set(e.turn, [e]);

        let perEmpire = groupedByEmpire.get(e.empireIndex);
        if (!perEmpire) {
            perEmpire = new Map<number, TechOrderEntry[]>();
            groupedByEmpire.set(e.empireIndex, perEmpire);
        }

        const perTurn = perEmpire.get(e.turn);
        if (perTurn) perTurn.push(e);
        else perEmpire.set(e.turn, [e]);
    }

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