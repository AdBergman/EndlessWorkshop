import type { AllStats, TechOrderEntry } from "@/types/endGameReport";

export type EmpireMeta = {
    idx: number;
    factionKey: string | null;    // canonical
    factionLabel: string;         // render-only
    isPlayer: boolean;
    labelLong: string;
    labelShort: string;
};

function cleanString(x: unknown): string {
    return typeof x === "string" ? x.trim() : "";
}

function factionFromAllStatsEmpire(
    e: AllStats["empires"][number],
    idx: number
): { factionKey: string | null; factionLabel: string } {
    const key = cleanString(e.factionKey);
    const dn = cleanString(e.factionDisplayName);

    return {
        factionKey: key || null,
        factionLabel: dn || key || `Empire ${idx}`,
    };
}

export function buildEmpireMeta(empireCount: number, allStats: AllStats): EmpireMeta[] {
    const byIndex = new Map<number, { factionKey: string | null; factionLabel: string }>();

    for (const e of allStats.empires) {
        byIndex.set(e.empireIndex, factionFromAllStatsEmpire(e, e.empireIndex));
    }

    const result: EmpireMeta[] = [];
    for (let idx = 0; idx < empireCount; idx++) {
        const isPlayer = idx === 0;

        const meta = byIndex.get(idx) ?? { factionKey: null, factionLabel: `Empire ${idx}` };
        const label = meta.factionLabel;

        result.push({
            idx,
            factionKey: meta.factionKey,
            factionLabel: label,
            isPlayer,
            labelShort: isPlayer ? `${label} ★` : label,
            labelLong: isPlayer ? `${label} ★ (Player) (E${idx})` : `${label} (E${idx})`,
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

    // Do NOT sort: preserve exporter order within each turn.
    return { maxTurn, groupedGlobal, groupedByEmpire };
}