import { District, Improvement, Tech, Unit } from "@/types/dataTypes";

export type SavedTechBuild = {
    uuid: string;
    name: string;
    selectedFaction: string;
    techIds: string[];
    createdAt: string;
};

export type TechAdminDto = {
    techKey: string;
    name?: string | null;
    era: number;
    type: string;
    coords: { xPct: number; yPct: number };
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

async function fetcherJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, options);

    if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(`HTTP error! status: ${response.status}, body: ${text}`);
    }

    if (response.status === 204) {
        return undefined as unknown as T;
    }

    return response.json();
}

async function fetcherVoid(endpoint: string, options?: RequestInit): Promise<void> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, options);

    if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(`HTTP error! status: ${response.status}, body: ${text}`);
    }
}

export const apiClient = {
    getDistricts: () => fetcherJson<District[]>("/districts"),
    getImprovements: () => fetcherJson<Improvement[]>("/improvements"),
    getTechs: () => fetcherJson<Tech[]>("/techs"),
    getUnits: () => fetcherJson<Unit[]>("/units"),

    getSavedBuild: (uuid: string) => fetcherJson<SavedTechBuild>(`/builds/${uuid}`),

    createSavedBuild: (name: string, selectedFaction: string, techIds: string[]) =>
        fetcherJson<SavedTechBuild>("/builds", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, selectedFaction, techIds }),
        }),

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