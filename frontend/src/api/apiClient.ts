import { District, Improvement, Tech } from "@/types/dataTypes";

export type SavedTechBuild = {
    uuid: string;
    name: string;
    techIds: string[];
    createdAt: string;
};

// Hardcode the base URL to '/api' to ensure it always points to the Vite proxy.
const API_BASE_URL = '/api';

async function fetcher<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`Fetching from: ${url}`); // Debugging log

    const response = await fetch(url, options);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
}

export const apiClient = {
    getDistricts: () => fetcher<District[]>('/districts'),
    getImprovements: () => fetcher<Improvement[]>('/improvements'),
    getTechs: () => fetcher<Tech[]>('/techs'),

    // ---- Saved Tech Builds ----
    getSavedBuild: (uuid: string) => fetcher<SavedTechBuild>(`/builds/${uuid}`),
    createSavedBuild: (name: string, techIds: string[]) =>
        fetcher<SavedTechBuild>('/builds', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, techIds }),
        }),
};
