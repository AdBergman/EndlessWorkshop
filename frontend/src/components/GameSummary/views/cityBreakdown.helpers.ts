// views/cityBreakdown.helpers.ts
import { EMPIRE_COLORS } from "./empireStats.helpers";
import type { EmpireMeta } from "./techProgress.helpers";

/**
 * Raw city shape is currently "any" (export format may evolve).
 * We keep parsing logic here so UI remains clean.
 */

export type CitySortKey =
    | "production"
    | "population"
    | "approval"
    | "districts"
    | "territories"
    | "fortification";

export type SortDir = "desc" | "asc";

export type CityTag = "Capital" | "Besieged" | "Mutiny" | "Destroyed" | "Outpost";

export type CityVM = {
    // identity
    id: string; // stable-ish key (guid if present else composite)
    name: string;
    empireIndex: number;
    empireLabel: string; // faction (+ optional Player)
    isPlayer: boolean;
    isCapital: boolean;

    // status/tags
    tags: CityTag[];
    settlementStatus: string; // raw but humanized in UI if desired

    // key stats
    scoreLike: {
        population: number;
        maxPopulation: number | null;
        productionNet: number;
        approvalPct: number | null; // may be 0..1 or 0..100 depending on exporter
        approvalState: string; // e.g. SettlementApproval_VeryHappy
    };

    growth: {
        turnBeforeGrowth: number | null;
        foodStock: number | null;
        maxFoodStock: number | null;
        foodGainPct: number | null; // might be 0..1
        growingPopulationName: string | null;
    };

    map: {
        territoryCount: number | null;
        extensionDistrictsCount: number | null;
        distanceWithCapital: number | null;
    };

    defense: {
        fortification: number | null;
        militiaUnits: number | null;
        isBesieged: boolean;
        isMutinous: boolean;
    };

    // low-priority / debug
    meta: {
        guid: string | null;
        tileIndex: number | null;
        factionDefinitionName: string | null;
        currentConstructible: string | null;
        currentConstructibleAffinity: string | null;
    };

    // computed for sorting convenience
    _sort: {
        production: number;
        population: number;
        approval: number;
        districts: number;
        territories: number;
        fortification: number;
    };
};

export type CityBreakdownVM = {
    cityCount: number;
    cities: CityVM[];
    empireCityCounts: Map<number, number>;
};

export type EmpireFilterOption = {
    value: number | "all";
    label: string; // "Necrophage (Player) • 3"
    empireIndex?: number;
    isPlayer?: boolean;
    count: number;
};

/* ----------------------------
 * tiny utilities
 * ---------------------------- */

export function empireColor(idx: number): string {
    return EMPIRE_COLORS[idx % EMPIRE_COLORS.length];
}

export function safeNumber(v: unknown): number | null {
    const n = typeof v === "number" ? v : Number(v);
    return Number.isFinite(n) ? n : null;
}

export function safeInt(v: unknown): number | null {
    const n = safeNumber(v);
    if (n === null) return null;
    return Math.trunc(n);
}

export function labelize(s: unknown, fallback: string): string {
    if (typeof s === "string" && s.trim()) return s.trim();
    return fallback;
}

export function humanizePascal(s: string): string {
    if (!s) return "Unknown";
    return s.replace(/([a-z])([A-Z])/g, "$1 $2");
}

export function humanizeApprovalState(raw: unknown): string {
    const s = typeof raw === "string" ? raw : "";
    if (!s) return "Unknown";
    const last = s.includes("_") ? s.split("_").pop() : s;
    if (!last) return s;
    return last.replace(/([a-z])([A-Z])/g, "$1 $2");
}

/** Formats to rounded integer string, returns "—" for invalid. */
export function formatInt(v: unknown): string {
    const n = typeof v === "number" ? v : Number(v);
    if (!Number.isFinite(n)) return "—";
    return Math.round(n).toString();
}

/**
 * Handles 0..1 fractions (1 => 100%) AND already-percents (75 => 75%).
 * Returns null if invalid.
 */
export function formatRatioPctMaybe(v: unknown): string | null {
    const n = typeof v === "number" ? v : Number(v);
    if (!Number.isFinite(n)) return null;
    const pct = n <= 1 ? n * 100 : n;
    return `${Math.round(pct)}%`;
}

/** +3.2% / -1.0% style for 0..1 ratio inputs */
export function formatSignedPct1Decimal(v: unknown): string | null {
    const n = typeof v === "number" ? v : Number(v);
    if (!Number.isFinite(n)) return null;
    const pct = n * 100;
    const sign = pct > 0 ? "+" : "";
    return `${sign}${pct.toFixed(1)}%`;
}

/* ----------------------------
 * parsing + view-model building
 * ---------------------------- */

function getCityId(raw: any, fallbackEmpireIndex: number, fallbackName: string): string {
    const guid = typeof raw?.SimulationEntityGUID === "string" ? raw.SimulationEntityGUID : null;
    if (guid) return guid;

    const tile = safeInt(raw?.TileIndex);
    if (tile !== null) return `E${fallbackEmpireIndex}:${fallbackName}:T${tile}`;

    return `E${fallbackEmpireIndex}:${fallbackName}`;
}

function resolveEmpireLabel(empireMeta: EmpireMeta[], idx: number): { label: string; isPlayer: boolean } {
    const em = empireMeta.find((e) => e.idx === idx);
    if (!em) {
        const isPlayer = idx === 0;
        return { label: isPlayer ? `Empire ${idx} (Player)` : `Empire ${idx}`, isPlayer };
    }
    return { label: em.idx === 0 ? `${em.faction} (Player)` : em.faction, isPlayer: em.idx === 0 };
}

function computeTags(raw: any): CityTag[] {
    const tags: CityTag[] = [];

    const isCapital = !!raw?.IsCapital;
    if (isCapital) tags.push("Capital");

    const isBesieged = !!raw?.IsBesieged;
    if (isBesieged) tags.push("Besieged");

    const isMutinous = !!raw?.IsMutinous;
    if (isMutinous) tags.push("Mutiny");

    const status = typeof raw?.SettlementStatus === "string" ? raw.SettlementStatus : "";
    if (status.toLowerCase().includes("destroy")) tags.push("Destroyed");
    if (status.toLowerCase().includes("outpost")) tags.push("Outpost");

    return tags;
}

/**
 * Build a clean, UI-friendly model from cityBreakdown + empireMeta.
 */
export function buildCityBreakdownVM(params: { cityBreakdown: any; empireMeta: EmpireMeta[] }): CityBreakdownVM {
    const { cityBreakdown, empireMeta } = params;

    const rawCities: any[] = Array.isArray(cityBreakdown?.Cities) ? cityBreakdown.Cities : [];
    const cityCount = typeof cityBreakdown?.CityCount === "number" ? cityBreakdown.CityCount : rawCities.length;

    const empireCityCounts = new Map<number, number>();

    const cities: CityVM[] = rawCities.map((c) => {
        const empireIndex = typeof c?.EmpireIndex === "number" ? c.EmpireIndex : 0;
        empireCityCounts.set(empireIndex, (empireCityCounts.get(empireIndex) ?? 0) + 1);

        const name = labelize(c?.Name, "Unknown city");
        const { label: empireLabel, isPlayer } = resolveEmpireLabel(empireMeta, empireIndex);

        const isCapital = !!c?.IsCapital;
        const settlementStatus = labelize(c?.SettlementStatus, "Unknown");

        const population = safeInt(c?.Population) ?? 0;
        const maxPopulation = safeInt(c?.MaxPopulation);
        const productionNet = safeNumber(c?.ProductionNet) ?? 0;

        const approvalPct = safeNumber(c?.ApprovalNetInPercent);
        const approvalState = labelize(c?.SettlementApprovalDefinitionName, "Unknown");

        const territoryCount = safeInt(c?.TerritoryCount);
        const extensionDistrictsCount = safeInt(c?.ExtensionDistrictsCount);

        const fortification = safeNumber(c?.Fortification);
        const militiaUnits = safeInt(c?.NumberOfPresentMilitiaUnits);

        const isBesieged = !!c?.IsBesieged;
        const isMutinous = !!c?.IsMutinous;

        const turnBeforeGrowth = safeInt(c?.TurnBeforeGrowth);
        const foodStock = safeNumber(c?.FoodStock);
        const maxFoodStock = safeNumber(c?.MaxFoodStock);
        const foodGainPct = safeNumber(c?.FoodGainInPercent);
        const growingPopulationName =
            typeof c?.GrowingPopulationName === "string" && c.GrowingPopulationName.trim()
                ? c.GrowingPopulationName.trim()
                : null;

        const distanceWithCapital = safeNumber(c?.DistanceWithCapital);

        const guid =
            typeof c?.SimulationEntityGUID === "string" && c.SimulationEntityGUID.trim() ? c.SimulationEntityGUID.trim() : null;

        const tileIndex = safeInt(c?.TileIndex);

        const factionDefinitionName =
            typeof c?.FactionDefinitionName === "string" && c.FactionDefinitionName.trim()
                ? c.FactionDefinitionName.trim()
                : null;

        const currentConstructible =
            typeof c?.CurrentConstructibleDefinitionName === "string" && c.CurrentConstructibleDefinitionName.trim()
                ? c.CurrentConstructibleDefinitionName.trim()
                : null;

        const currentConstructibleAffinity =
            typeof c?.CurrentConstructibleVisualAffinityName === "string" && c.CurrentConstructibleVisualAffinityName.trim()
                ? c.CurrentConstructibleVisualAffinityName.trim()
                : null;

        const tags = computeTags(c);
        const id = getCityId(c, empireIndex, name);

        // For sorting, we keep simple numeric versions:
        const districtsSort = extensionDistrictsCount ?? 0;
        const territoriesSort = territoryCount ?? 0;
        const fortSort = fortification ?? 0;
        const approvalSort = approvalPct ?? 0;

        return {
            id,
            name,
            empireIndex,
            empireLabel,
            isPlayer,
            isCapital,
            tags,
            settlementStatus,

            scoreLike: {
                population,
                maxPopulation,
                productionNet,
                approvalPct,
                approvalState,
            },

            growth: {
                turnBeforeGrowth,
                foodStock,
                maxFoodStock,
                foodGainPct,
                growingPopulationName,
            },

            map: {
                territoryCount,
                extensionDistrictsCount,
                distanceWithCapital,
            },

            defense: {
                fortification,
                militiaUnits,
                isBesieged,
                isMutinous,
            },

            meta: {
                guid,
                tileIndex,
                factionDefinitionName,
                currentConstructible,
                currentConstructibleAffinity,
            },

            _sort: {
                production: productionNet,
                population,
                approval: approvalSort,
                districts: districtsSort,
                territories: territoriesSort,
                fortification: fortSort,
            },
        };
    });

    return { cityCount, cities, empireCityCounts };
}

/* ----------------------------
 * filtering + sorting + grouping
 * ---------------------------- */

export function filterCitiesByEmpire(cities: CityVM[], empireIndex: number | "all"): CityVM[] {
    if (empireIndex === "all") return cities;
    return cities.filter((c) => c.empireIndex === empireIndex);
}

export function sortCities(cities: CityVM[], key: CitySortKey, dir: SortDir): CityVM[] {
    const sorted = [...cities];
    sorted.sort((a, b) => {
        const av = a._sort[key];
        const bv = b._sort[key];
        const primary = dir === "desc" ? bv - av : av - bv;
        return primary || a.name.localeCompare(b.name);
    });
    return sorted;
}

export function groupCitiesByEmpire(cities: CityVM[]): Map<number, CityVM[]> {
    const map = new Map<number, CityVM[]>();
    for (const c of cities) {
        if (!map.has(c.empireIndex)) map.set(c.empireIndex, []);
        map.get(c.empireIndex)!.push(c);
    }
    return map;
}

/** Prefer player capital, else any player city, else first in list. */
export function pickBestDefaultCityId(citiesInScope: CityVM[]): string | null {
    if (!citiesInScope.length) return null;

    const playerCapital = citiesInScope.find((c) => c.isPlayer && c.isCapital);
    if (playerCapital) return playerCapital.id;

    const anyPlayer = citiesInScope.find((c) => c.isPlayer);
    if (anyPlayer) return anyPlayer.id;

    return citiesInScope[0].id;
}

export function buildEmpireFilterOptions(params: {
    empireMeta: EmpireMeta[];
    empireCityCounts: Map<number, number>;
    totalCityCount: number;
}): EmpireFilterOption[] {
    const { empireMeta, empireCityCounts, totalCityCount } = params;

    const opts: EmpireFilterOption[] = [
        {
            value: "all",
            label: `All empires • ${totalCityCount}`,
            count: totalCityCount,
        },
    ];

    for (const em of empireMeta) {
        const count = empireCityCounts.get(em.idx) ?? 0;
        const base = em.idx === 0 ? `${em.faction} (Player)` : em.faction;
        opts.push({
            value: em.idx,
            label: `${base} • ${count}`,
            empireIndex: em.idx,
            isPlayer: em.idx === 0,
            count,
        });
    }

    return opts;
}