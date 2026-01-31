import { District, Improvement, Tech, Unit } from "@/types/dataTypes";

export type SavedTechBuild = {
    uuid: string;
    name: string;
    selectedFaction: string;
    techIds: string[];
    createdAt: string;
};

export type TechAdminDto = {
    name: string;
    era: number; // 1..6 (frontend enforces)
    type: string;
    coords: { xPct: number; yPct: number };
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

async function fetcherJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`Fetching from: ${url}`);

    const response = await fetch(url, options);

    if (!response.ok) {
        // Keep errors simple for now; admin overlay will map 401/403 nicely.
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Some endpoints might return 204 in the future; be defensive.
    if (response.status === 204) {
        return undefined as unknown as T;
    }

    return response.json();
}

/**
 * For endpoints that intentionally return 204 No Content.
 */
async function fetcherVoid(endpoint: string, options?: RequestInit): Promise<void> {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`Fetching from: ${url}`);

    const response = await fetch(url, options);

    if (!response.ok) {
        // Surface status for caller (we'll use it to show token prompt etc)
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Expect 204; but don't crash if backend ever returns 200.
    return;
}

export const apiClient = {
    getDistricts: () => fetcherJson<District[]>("/districts"),
    getImprovements: () => fetcherJson<Improvement[]>("/improvements"),
    getTechs: () => fetcherJson<Tech[]>("/techs"),
    getUnits: () => fetcherJson<Unit[]>("/units"),

    // ---- Saved Tech Builds ----
    getSavedBuild: (uuid: string) => fetcherJson<SavedTechBuild>(`/builds/${uuid}`),
    createSavedBuild: (name: string, selectedFaction: string, techIds: string[]) =>
        fetcherJson<SavedTechBuild>("/builds", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, selectedFaction, techIds }),
        }),

    // ---- Admin: Tech placements ----
    saveTechPlacementsAdmin: (placements: TechAdminDto[], adminToken: string) => {
        return fetcherVoid("/admin/techs/placements", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Admin-Token": adminToken,
            },
            body: JSON.stringify(placements),
        });
    },
};