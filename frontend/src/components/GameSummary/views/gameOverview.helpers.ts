import { EMPIRE_COLORS } from "./empireStats.helpers";
import type { AllStatsEmpire, AllStatsTurnSnapshot } from "@/types/endGameReport";

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
    return typeof s === "string" && s.trim() ? s.trim() : fallback;
}

const VICTORY_LABELS: Record<string, string> = {
    dungeonsCleared: "Dungeons cleared",
    territoriesControlled: "Territories controlled",
    wondersBuilt: "Wonders built",
    allResearchesDone: "All research completed",
    population: "Population",
    resources: "Resources",
    pacifiedVillages: "Pacified villages",
    turnLimit: "Turn limit",
    empireEliminated: "Empire eliminated",
};

function humanizePascalOrCamel(s: string): string {
    const spaced = s.replace(/([a-z])([A-Z])/g, "$1 $2");
    return spaced.length ? spaced[0].toUpperCase() + spaced.slice(1) : spaced;
}

export function victoryLabel(raw: unknown): string {
    const key = typeof raw === "string" ? raw.trim() : "";
    if (!key) return "Unknown";
    return VICTORY_LABELS[key] ?? humanizePascalOrCamel(key);
}

export function formatLocalDateTime(utcIso: unknown): string {
    const s = typeof utcIso === "string" ? utcIso : "";
    if (!s) return "Unknown";

    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return "Unknown";

    const pad = (n: number) => String(n).padStart(2, "0");

    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hour = pad(d.getHours());
    const minute = pad(d.getMinutes());

    return `${year}-${month}-${day} ${hour}:${minute}`;
}

const EMPTY_TURN: AllStatsTurnSnapshot = {
    turn: 0,
    score: 0,
    technologies: 0,
    cities: 0,
    territories: 0,
};

function pickFinalTurnSnapshot(perTurn: AllStatsTurnSnapshot[], maxTurn: number): AllStatsTurnSnapshot {
    if (!perTurn?.length) return EMPTY_TURN;

    if (maxTurn > 0) {
        const exact = perTurn.find((pt) => pt.turn === maxTurn);
        if (exact) return exact;
    }

    return perTurn[perTurn.length - 1];
}

export function getFinalSnapshotForEmpire(empire: AllStatsEmpire, maxTurn: number): FinalSnapshot {
    const pick = pickFinalTurnSnapshot(empire.perTurn ?? [], maxTurn);

    return {
        score: pick.score ?? 0,
        technologies: pick.technologies ?? 0,
        cities: pick.cities ?? 0,
        territories: pick.territories ?? 0,
    };
}