import { EMPIRE_COLORS } from "./empireStats.helpers";
import type { EmpireMeta } from "./techProgress.helpers";

/* ---------------------------------------------
 * Types
 * ------------------------------------------- */

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
    id: string;
    name: string;
    empireIndex: number;
    empireLabel: string;
    isPlayer: boolean;
    isCapital: boolean;

    tags: CityTag[];
    settlementStatus: string; // "—" when not present in export

    scoreLike: {
        population: number;
        maxPopulation: number | null;
        productionNet: number; // industry
        approvalPct: number | null; // 0..1 ratio in current export
        approvalState: string; // e.g. "Jubilant"
    };

    growth: {
        turnBeforeGrowth: number | null;
        foodStock: number | null;
        maxFoodStock: number | null;
        foodGainPct: number | null; // ratio (0..1)
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

/* ---------------------------------------------
 * Small helpers
 * ------------------------------------------- */

export function empireColor(idx: number): string {
    return EMPIRE_COLORS[idx % EMPIRE_COLORS.length];
}

export function safeNumber(v: unknown): number | null {
    const n = typeof v === "number" ? v : Number(v);
    return Number.isFinite(n) ? n : null;
}

// No decimals anywhere → always round UP if fractional.
export function safeInt(v: unknown): number | null {
    const n = safeNumber(v);
    return n === null ? null : Math.ceil(n);
}

export function labelize(s: unknown, fallback: string): string {
    return typeof s === "string" && s.trim() ? s.trim() : fallback;
}

export function humanizeApprovalState(raw: unknown): string {
    const s = typeof raw === "string" ? raw : "";
    if (!s) return "Unknown";
    const last = s.includes("_") ? s.split("_").pop() : s;
    return last ? last.replace(/([a-z])([A-Z])/g, "$1 $2") : s;
}

export function formatInt(v: unknown): string {
    const n = safeNumber(v);
    if (n === null) return "—";
    return Math.ceil(n).toString();
}

export function formatRatioPctMaybe(v: unknown): string | null {
    const n = safeNumber(v);
    if (n === null) return null;
    const pct = n <= 1 ? n * 100 : n;
    return `${Math.ceil(pct)}%`;
}

export function formatSignedPct(v: unknown): string | null {
    const n = safeNumber(v);
    if (n === null) return null;
    const pct = Math.ceil(n * 100);
    const sign = pct > 0 ? "+" : "";
    return `${sign}${pct}%`;
}

/* ---------------------------------------------
 * City model builder (camelCase export)
 * ------------------------------------------- */

type RawCity = any;

function getCityId(raw: RawCity, fallbackEmpireIndex: number, fallbackName: string): string {
    // Export currently doesn't provide a stable GUID. If tileIndex ever appears later, this keeps IDs stable.
    const tile = safeInt(raw?.tileIndex);
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

function computeTags(raw: RawCity): CityTag[] {
    const tags: CityTag[] = [];
    if (!!raw?.isCapital) tags.push("Capital");
    if (!!raw?.isBesieged) tags.push("Besieged");
    if (!!raw?.isMutinous) tags.push("Mutiny");
    return tags;
}

function pickApprovalState(c: RawCity): string {
    const s =
        typeof c?.settlementApprovalDisplayName === "string" && c.settlementApprovalDisplayName.trim()
            ? c.settlementApprovalDisplayName.trim()
            : null;
    return s ?? "Unknown";
}

export function buildCityBreakdownVM(params: {
    cityBreakdown: unknown;
    empireMeta: EmpireMeta[];
}): CityBreakdownVM {
    const { cityBreakdown, empireMeta } = params;
    const cb: any = cityBreakdown as any;

    const rawCities: RawCity[] = Array.isArray(cb?.cities) ? cb.cities : [];
    const cityCount = typeof cb?.cityCount === "number" ? cb.cityCount : rawCities.length;

    const empireCityCounts = new Map<number, number>();

    const cities: CityVM[] = rawCities.map((c) => {
        const empireIndex = typeof c?.empireIndex === "number" ? c.empireIndex : 0;
        empireCityCounts.set(empireIndex, (empireCityCounts.get(empireIndex) ?? 0) + 1);

        const name = labelize(c?.name, "Unknown city");
        const { label: empireLabel, isPlayer } = resolveEmpireLabel(empireMeta, empireIndex);

        const isCapital = !!c?.isCapital;

        // Not in current export → keep UI honest.
        const settlementStatus = "—";

        const population = safeInt(c?.population) ?? 0;
        const maxPopulation = safeInt(c?.maxPopulation);
        const productionNet = safeNumber(c?.productionNet) ?? 0;

        const approvalPct = safeNumber(c?.approvalNetInPercent); // ratio 0..1
        const approvalState = pickApprovalState(c);

        const territoryCount = safeInt(c?.territoryCount);
        const extensionDistrictsCount = safeInt(c?.extensionDistrictsCount);

        const fortification = safeNumber(c?.fortification);
        const militiaUnits = safeInt(c?.numberOfPresentMilitiaUnits);

        const isBesieged = !!c?.isBesieged;
        const isMutinous = !!c?.isMutinous;

        const turnBeforeGrowth = safeInt(c?.turnBeforeGrowth);
        const foodStock = safeNumber(c?.foodStock);
        const maxFoodStock = safeNumber(c?.maxFoodStock);
        const foodGainPct = safeNumber(c?.foodGainInPercent);
        const growingPopulationName =
            typeof c?.growingPopulationName === "string" && c.growingPopulationName.trim()
                ? c.growingPopulationName.trim()
                : null;

        const distanceWithCapital = safeNumber(c?.distanceWithCapital);

        const tags = computeTags(c);
        const id = getCityId(c, empireIndex, name);

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

            _sort: {
                production: productionNet,
                population,
                approval: approvalPct ?? 0,
                districts: extensionDistrictsCount ?? 0,
                territories: territoryCount ?? 0,
                fortification: fortification ?? 0,
            },
        };
    });

    return { cityCount, cities, empireCityCounts };
}

/* ---------------------------------------------
 * View helpers
 * ------------------------------------------- */

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
        const list = map.get(c.empireIndex);
        if (list) list.push(c);
        else map.set(c.empireIndex, [c]);
    }
    return map;
}

export function defaultEmpireFilterIndex(): number {
    return 0;
}

export function findCityById(cities: CityVM[], id: string | null): CityVM | null {
    if (!id) return null;
    return cities.find((c) => c.id === id) ?? null;
}

export function pickBestDefaultCityId(citiesInScope: CityVM[]): string | null {
    if (!citiesInScope.length) return null;

    const playerCapital = citiesInScope.find((c) => c.isPlayer && c.isCapital);
    if (playerCapital) return playerCapital.id;

    const anyPlayer = citiesInScope.find((c) => c.isPlayer);
    if (anyPlayer) return anyPlayer.id;

    return citiesInScope[0].id;
}

export function pickStableSelectedCityId(params: {
    currentCities: CityVM[];
    prevSelectedId: string | null;
    sortKey: CitySortKey;
    sortDir: SortDir;
}): string | null {
    const { currentCities, prevSelectedId } = params;

    if (!currentCities.length) return null;
    if (prevSelectedId && currentCities.some((c) => c.id === prevSelectedId)) return prevSelectedId;

    return pickBestDefaultCityId(currentCities);
}

// Current export doesn't provide destroyed/outpost signals → don't guess.
export function isDestroyedCity(_: { tags?: string[]; settlementStatus?: string } | null | undefined): boolean {
    return false;
}

// Current export doesn't provide destroyed/outpost signals → don't guess.
export function isOutpostCity(_: { tags?: string[]; settlementStatus?: string } | null | undefined): boolean {
    return false;
}