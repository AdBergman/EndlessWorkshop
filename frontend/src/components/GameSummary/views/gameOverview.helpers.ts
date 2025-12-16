// views/gameOverview.helpers.ts
import { EMPIRE_COLORS } from "./empireStats.helpers";

export type FinalSnapshot = {
    score: number;
    technologies: number;
    cities: number;
    territories: number;
};

export function empireColor(idx: number): string {
    return EMPIRE_COLORS[idx % EMPIRE_COLORS.length];
}

export function safeNumber(v: unknown): number | null {
    const n = typeof v === "number" ? v : Number(v);
    return Number.isFinite(n) ? n : null;
}

export function labelize(s: unknown, fallback: string): string {
    if (typeof s === "string" && s.trim()) return s;
    return fallback;
}

export function victoryLabel(raw: unknown): string {
    const s = typeof raw === "string" ? raw : "";
    const MAP: Record<string, string> = {
        DungeonsCleared: "Dungeons cleared",
        TerritoriesControlled: "Territories controlled",
        WondersBuilt: "Wonders built",
        AllResearchesDone: "All research completed",
        Population: "Population",
        Resources: "Resources",
        PacifiedVillages: "Pacified villages",
        TurnLimit: "Turn limit",
        EmpireEliminated: "Empire eliminated",
    };
    if (MAP[s]) return MAP[s];
    return s ? s.replace(/([a-z])([A-Z])/g, "$1 $2") : "Unknown";
}

export function formatLocalDateTime(utcIso: unknown): string {
    const s = typeof utcIso === "string" ? utcIso : "";
    if (!s) return "Unknown";

    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return "Unknown";

    const date = d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
    });
    const time = d.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
    });

    return `${date} • ${time}`;
}

/**
 * Picks a "final" per-turn snapshot:
 * - Prefer the row where Turn === maxTurn if available
 * - Else fallback to the last PerTurn entry
 */
export function getFinalSnapshotForEmpire(
    empire: any,
    maxTurn: number | null
): FinalSnapshot {
    const perTurn: any[] = Array.isArray(empire?.PerTurn) ? empire.PerTurn : [];
    if (perTurn.length === 0) {
        return { score: 0, technologies: 0, cities: 0, territories: 0 };
    }

    let pick: any = perTurn[perTurn.length - 1];

    if (maxTurn && maxTurn > 0) {
        const match = perTurn.find((pt) => Number(pt?.Turn) === maxTurn);
        if (match) pick = match;
    }

    return {
        score: typeof pick?.Score === "number" ? pick.Score : 0,
        technologies: typeof pick?.Technologies === "number" ? pick.Technologies : 0,
        cities: typeof pick?.Cities === "number" ? pick.Cities : 0,
        territories: typeof pick?.Territories === "number" ? pick.Territories : 0,
    };
}