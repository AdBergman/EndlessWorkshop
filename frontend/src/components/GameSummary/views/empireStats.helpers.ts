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