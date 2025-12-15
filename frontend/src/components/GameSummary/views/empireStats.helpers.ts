function chooseTurnTickStep(maxTurn: number): number {
    if (maxTurn <= 60) return 5;
    if (maxTurn <= 140) return 10;
    if (maxTurn <= 260) return 20;
    return 25;
}

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

// --- Metrics (single source of truth) ---
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

// Keep only label overrides (anything not listed falls back to the key)
const METRIC_LABEL_OVERRIDES: Partial<Record<EmpireMetricKey, string>> = {
    Populations: "Population",
    // Technologies: "Techs",
};

export function metricLabel(key: EmpireMetricKey): string {
    return METRIC_LABEL_OVERRIDES[key] ?? key;
}

export function buildTicks(maxTurn: number): number[] {
    if (!maxTurn || maxTurn < 1) return [1];

    const step = chooseTurnTickStep(maxTurn);
    const ticks: number[] = [1];

    for (let t = step; t < maxTurn; t += step) ticks.push(t);
    if (ticks[ticks.length - 1] !== maxTurn) ticks.push(maxTurn);

    return ticks;
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

export function formatNumber(v: unknown): string {
    const n = typeof v === "number" ? v : Number(v);
    if (!Number.isFinite(n)) return "0";
    return Math.round(n).toString();
}