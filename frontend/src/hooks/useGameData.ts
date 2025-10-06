import { useState, useEffect } from "react";
import { District, Improvement, Tech } from "@/types/dataTypes";
import { fetchDistricts, fetchImprovements, fetchTechs } from "@/api/apiClient";

export interface GameData {
    districtsMap: Map<string, District>;
    improvementsMap: Map<string, Improvement>;
    techsMap: Map<string, Tech>;
}

export const useGameData = () => {
    const [gameData, setGameData] = useState<GameData>({
        districtsMap: new Map(),
        improvementsMap: new Map(),
        techsMap: new Map(),
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const bootstrap = async () => {
            try {
                const [districts, improvements, techs] = await Promise.all([
                    fetchDistricts<District[]>(),
                    fetchImprovements<Improvement[]>(),
                    fetchTechs<Tech[]>()
                ]);

                setGameData({
                    districtsMap: new Map(districts.map(d => [d.name, d])),
                    improvementsMap: new Map(improvements.map(i => [i.name, i])),
                    techsMap: new Map(techs.map(t => [t.name, t])),
                });
            } catch (err: any) {
                console.error("Failed to bootstrap game data", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        bootstrap();
    }, []);

    return { ...gameData, loading, error };
};
