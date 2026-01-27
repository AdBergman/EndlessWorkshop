import type { AllStatsEmpire } from "@/types/endGameReport";
import { getEmpireLabel } from "@/lib/labels/empireLabels";

export const EMPIRE_COLORS = [
    "#ff7f32",
    "#4fc3f7",
    "#4caf50",
    "#661277",
    "#ffd54f",
    "#fb0000",
    "#001fea",
    "#ff437a",
] as const;

/* ----------------------------
 * Turn axis helpers
 * ---------------------------- */

function chooseTurnTickStep(maxTurn: number): number {
    if (maxTurn <= 60) return 5;
    if (maxTurn <= 140) return 10;
    if (maxTurn <= 260) return 20;
    return 25;
}

export function buildTicks(maxTurn: number): number[] {
    if (!Number.isFinite(maxTurn) || maxTurn < 1) return [1];

    const step = chooseTurnTickStep(maxTurn);
    const ticks: number[] = [1];

    for (let t = step; t < maxTurn; t += step) ticks.push(t);
    if (ticks[ticks.length - 1] !== maxTurn) ticks.push(maxTurn);

    return ticks;
}

/* ----------------------------
 * Empire helpers (camelCase export)
 * ---------------------------- */

export function getEmpireColor(idx: number): string {
    return EMPIRE_COLORS[idx % EMPIRE_COLORS.length];
}

export function getEmpireKey(idx: number): `e${number}` {
    return `e${idx}`;
}

export function empireIndex(e: AllStatsEmpire): number {
    return (e as any).empireIndex ?? 0;
}

export function factionName(e: AllStatsEmpire): string {
    return getEmpireLabel((e as any)?.factionKey);
}

export function legendLabelForEmpire(e: AllStatsEmpire, idx: number): string {
    const faction = factionName(e);
    return idx === 0 ? `${faction} ★` : faction;
}

/* ----------------------------
 * Metrics
 * ---------------------------- */

// UI values (nice labels)
export const METRICS = [
    "Score",
    "Food",
    "Industry",
    "Dust",
    "Science",
    "Influence",
    "Approval",
    "Population",
    "Technologies",
    "Units",
    "Cities",
    "Territories",
] as const;

export type EmpireMetricKey = (typeof METRICS)[number];

// map UI metric -> JSON perTurn key (camelCase)
const METRIC_TO_FIELD: Record<EmpireMetricKey, string> = {
    Score: "score",
    Food: "food",
    Industry: "industry",
    Dust: "dust",
    Science: "science",
    Influence: "influence",
    Approval: "approval",
    Population: "population",
    Technologies: "technologies",
    Units: "units",
    Cities: "cities",
    Territories: "territories",
};

export function metricLabel(key: EmpireMetricKey): string {
    return key;
}

/* ----------------------------
 * Formatting
 * ---------------------------- */

export function formatNumber(v: unknown): string {
    const n = typeof v === "number" ? v : Number(v);
    if (!Number.isFinite(n)) return "0";
    return Math.round(n).toString();
}

/* ----------------------------
 * Chart data builder (empire compare)
 * ---------------------------- */

/**
 * Produces rows like:
 *   { turn: 1, e0: 12, e1: 9, ... }
 */
export function buildChartData(
    empires: AllStatsEmpire[],
    selectedMetric: EmpireMetricKey
): Array<{ turn: number; [k: string]: number }> {
    const perTurnField = "perTurn";
    const metricField = METRIC_TO_FIELD[selectedMetric];

    const maxLen = empires.reduce((acc, e) => {
        const arr = (e as any)?.[perTurnField];
        return Math.max(acc, Array.isArray(arr) ? arr.length : 0);
    }, 0);

    const rows: Array<{ turn: number; [k: string]: number }> = [];

    for (let i = 0; i < maxLen; i++) {
        const row: { turn: number; [k: string]: number } = { turn: i + 1 };

        for (const e of empires) {
            const idx = empireIndex(e);
            const arr = (e as any)?.[perTurnField];
            const entry = Array.isArray(arr) ? arr[i] : undefined;

            const raw = entry?.[metricField] as unknown;
            const n = typeof raw === "number" ? raw : Number(raw);
            row[getEmpireKey(idx)] = Number.isFinite(n) ? n : 0;
        }

        rows.push(row);
    }

    return rows;
}

/* ----------------------------
 * Player economy (FIDSI) overlay
 * ---------------------------- */

export const ECON_METRICS = [
    "Food",
    "Industry",
    "Dust",
    "Science",
    "Influence",
] as const;

export type EconomyMetricKey = (typeof ECON_METRICS)[number];

const ECON_COLORS: Record<EconomyMetricKey, string> = {
    Food: "#4caf50",
    Industry: "#ff7f32",
    Dust: "#ffd54f",
    Science: "#4fc3f7",
    Influence: "#661277",
};

export function getEconomyMetricColor(key: EconomyMetricKey): string {
    return ECON_COLORS[key];
}

/**
 * Produces rows like:
 *   { turn: 1, Food: 12, Industry: 9, Dust: 4, Science: 7, Influence: 1 }
 *
 * Missing/invalid values become 0.
 */
export function buildPlayerEconomyChartData(
    playerEmpire: AllStatsEmpire | null
): Array<{ turn: number; [k: string]: number }> {
    const perTurnField = "perTurn";
    const arr = (playerEmpire as any)?.[perTurnField];
    const perTurn = Array.isArray(arr) ? arr : [];

    const rows: Array<{ turn: number; [k: string]: number }> = [];

    for (let i = 0; i < perTurn.length; i++) {
        const entry = perTurn[i];
        const row: { turn: number; [k: string]: number } = { turn: i + 1 };

        for (const m of ECON_METRICS) {
            const metricField = METRIC_TO_FIELD[m as EmpireMetricKey];
            const raw = entry?.[metricField] as unknown;
            const n = typeof raw === "number" ? raw : Number(raw);
            row[m] = Number.isFinite(n) ? n : 0;
        }

        rows.push(row);
    }

    return rows;
}