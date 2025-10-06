import { District, Improvement, Tech } from "@/types/dataTypes";

// Hardcode the base URL to '/api' to ensure it always points to the Vite proxy.
// This bypasses any issues with .env file loading.
const API_BASE_URL = '/api';

async function fetcher<T>(endpoint: string): Promise<T> {
    // The final URL will be, for example, '/api/districts'
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`Fetching from: ${url}`); // Debugging log

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
}

export const apiClient = {
    getDistricts: () => fetcher<District[]>('/districts'),
    getImprovements: () => fetcher<Improvement[]>('/improvements'),
    getTechs: () => fetcher<Tech[]>('/techs'),
};
