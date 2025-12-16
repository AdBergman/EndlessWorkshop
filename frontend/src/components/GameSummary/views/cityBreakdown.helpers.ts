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

export type CityTag =
    | "Capital"
    | "Besieged"
    | "Mutiny"
    | "Destroyed"
    | "Outpost";

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
        approvalPct: number | null;
        approvalState: string; // e.g. SettlementApprovalDefinitionName
    };

    growth: {
        turnBeforeGrowth: number | null;
        foodStock: number | null;
        maxFoodStock: number | null;
        foodGainPct: number | null;
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

/* ----------------------------
 * small utilities
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
export function buildCityBreakdownVM(params: {
    cityBreakdown: any;
    empireMeta: EmpireMeta[];
}): CityBreakdownVM {
    const { cityBreakdown, empireMeta } = params;

    const rawCities: any[] = Array.isArray(cityBreakdown?.Cities) ? cityBreakdown.Cities : [];
    const cityCount =
        typeof cityBreakdown?.CityCount === "number" ? cityBreakdown.CityCount : rawCities.length;

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
            typeof c?.SimulationEntityGUID === "string" && c.SimulationEntityGUID.trim()
                ? c.SimulationEntityGUID.trim()
                : null;

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
 * grouping + sorting
 * ---------------------------- */

export function defaultEmpireFilterIndex(): number {
    return 0; // player = E0 by convention
}

export function filterCitiesByEmpire(cities: CityVM[], empireIndex: number | "all"): CityVM[] {
    if (empireIndex === "all") return cities;
    return cities.filter((c) => c.empireIndex === empireIndex);
}

export function sortCities(cities: CityVM[], key: CitySortKey): CityVM[] {
    const sorted = [...cities];
    sorted.sort((a, b) => {
        const av = a._sort[key];
        const bv = b._sort[key];
        // desc, stable-ish fallback by name
        return bv - av || a.name.localeCompare(b.name);
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

export function pickDefaultSelectedCityId(cities: CityVM[]): string | null {
    if (!cities.length) return null;
    return cities[0].id;
}