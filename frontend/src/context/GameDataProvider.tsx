import React, { useState, useEffect, ReactNode } from "react";
import GameDataContext from "./GameDataContext";
import { District, Improvement, Tech } from "@/types/dataTypes";
import { apiClient, SavedTechBuild } from "@/api/apiClient";

interface Props { children: ReactNode }

const GameDataProvider: React.FC<Props> = ({ children }) => {
    const [districts, setDistricts] = useState<Map<string, District>>(new Map());
    const [improvements, setImprovements] = useState<Map<string, Improvement>>(new Map());
    const [techs, setTechs] = useState<Map<string, Tech>>(new Map());

    const [selectedFaction, setSelectedFaction] = useState("Kin");
    const [selectedTechs, setSelectedTechs] = useState<string[]>([]);

    // --- Fetch core game data ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [districtData, improvementData, techData] = await Promise.all([
                    apiClient.getDistricts(),
                    apiClient.getImprovements(),
                    apiClient.getTechs(),
                ]);

                setDistricts(new Map(districtData.map(d => [d.name, d])));
                setImprovements(new Map(improvementData.map(i => [i.name, i])));
                setTechs(new Map(techData.map(t => [t.name, t])));
            } catch (err) {
                console.error("Failed to fetch game data from API.", err);
            }
        };
        fetchData();
    }, []);

    const createSavedTechBuild = async (name: string, techIds: string[]): Promise<SavedTechBuild> => {
        try {
            const saved = await apiClient.createSavedBuild(name, techIds);
            console.log("Build saved:", saved);
            return saved;
        } catch (err) {
            console.error("Failed to save tech build:", err);
            throw err;
        }
    };

    const getSavedBuild = async (uuid: string): Promise<SavedTechBuild> => {
        try {
            const saved = await apiClient.getSavedBuild(uuid);
            console.log("Loaded saved build:", saved);

            // Populate selectedTechs when loading
            setSelectedTechs(saved.techIds);

            return saved;
        } catch (err) {
            console.error("Failed to load saved tech build:", err);
            throw err;
        }
    };

    return (
        <GameDataContext.Provider value={{
            districts,
            improvements,
            techs,
            selectedFaction,
            setSelectedFaction,
            selectedTechs,
            setSelectedTechs,
            createSavedTechBuild,
            getSavedBuild
        }}>
            {children}
        </GameDataContext.Provider>
    );
};

export default GameDataProvider;
