// empireStats.helpers.ts
// Feature-local helpers for EmpireStatsView (pure utilities + constants)

/* --------------------------------
 * Turn axis helpers
 * -------------------------------- */

function chooseTurnTickStep(maxTurn: number): number {
    if (maxTurn <= 60) return 5;
    if (maxTurn <= 140) return 10;
    if (maxTurn <= 260) return 20;
    return 25;
}

export function buildTicks(maxTurn: number): number[] {
    if (!maxTurn || maxTurn < 1) return [1];

    const step = chooseTurnTickStep(maxTurn);
    const ticks: number[] = [1];

    for (let t = step; t < maxTurn; t += step) {
        ticks.push(t);
    }

    if (ticks[ticks.length - 1] !== maxTurn) {
        ticks.push(maxTurn);
    }

    return ticks;
}

/* --------------------------------
 * Empire helpers
 * -------------------------------- */

export const EMPIRE_COLORS = [
    "#ff7f32", // E0 — Player (orange, EWShop primary)
    "#4fc3f7", // E1 — light blue
    "#4caf50", // E2 — green
    "#661277", // E3 — purple
    "#ffd54f", // E4 — yellow
    "#fb0000", // E5 — red
    "#001fea", // E6 — dark blue
    "#ff437a", // E7 — pink
] as const;

export function getEmpireColor(idx: number): string {
    return EMPIRE_COLORS[idx % EMPIRE_COLORS.length];
}

export function getEmpireKey(idx: number): `e${number}` {
    return `e${idx}`;
}

export function empireIndex(e: any): number {
    return e?.EmpireIndex ?? e?.empireIndex ?? 0;
}

export function factionName(e: any, idx: number): string {
    return e?.FactionDisplayName || e?.FactionKey || `Empire ${idx}`;
}

export function legendLabelForEmpire(e: any, idx: number): string {
    const faction = factionName(e, idx);
    return idx === 0 ? `${faction} ★` : faction;
}

/* --------------------------------
 * Metrics (single source of truth)
 * -------------------------------- */

export const METRICS = [
    "Score",
    "Food",
    "Industry",
    "Dust",
    "Science",
    "Influence",
    "Approval",
    "Populations",
    "Technologies",
    "Units",
    "Cities",
    "Territories",
] as const;

export type EmpireMetricKey = (typeof METRICS)[number];

// Keep only label overrides (everything else falls back to the key)
const METRIC_LABEL_OVERRIDES: Partial<Record<EmpireMetricKey, string>> = {
    Populations: "Population",
    // Technologies: "Techs",
};

export function metricLabel(key: EmpireMetricKey): string {
    return METRIC_LABEL_OVERRIDES[key] ?? key;
}

/* --------------------------------
 * Formatting helpers
 * -------------------------------- */

export function formatNumber(v: unknown): string {
    const n = typeof v === "number" ? v : Number(v);
    if (!Number.isFinite(n)) return "0";
    return Math.round(n).toString();
}

/* --------------------------------
 * Chart data builder (pure)
 * -------------------------------- */

/**
 * Build recharts-friendly rows:
 * [{ turn: 1, e0: 12, e1: 9, ... }, { turn: 2, ... }]
 *
 * - Pure function
 * - Missing values → 0
 */
export function buildChartData(
    empires: any[],
    selectedMetric: EmpireMetricKey
): Array<{ turn: number; [k: string]: number }> {
    const maxLen = empires.reduce(
        (acc, e) => Math.max(acc, e?.PerTurn?.length ?? 0),
        0
    );

    const rows: Array<{ turn: number; [k: string]: number }> = [];

    for (let i = 0; i < maxLen; i++) {
        const row: { turn: number; [k: string]: number } = { turn: i + 1 };

        for (const e of empires) {
            const idx = empireIndex(e);
            const entry = e?.PerTurn?.[i];
            const v = entry?.[selectedMetric];
            row[getEmpireKey(idx)] = typeof v === "number" ? v : 0;
        }

        rows.push(row);
    }

    return rows;
}