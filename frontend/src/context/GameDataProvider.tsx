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

    // --- Track if shared build has been loaded ---
    const [sharedBuildLoaded, setSharedBuildLoaded] = useState(false);

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

// --- Load shared build from URL param (runs once) ---
    useEffect(() => {
        if (sharedBuildLoaded) return;

        const params = new URLSearchParams(window.location.search);
        const shareUuid = params.get("share");
        if (!shareUuid) return;

        const loadSharedBuild = async () => {
            try {
                const res = await apiClient.getSavedBuild(shareUuid);
                setSelectedFaction(res.selectedFaction);
                setSelectedTechs(res.techIds); // populate tech selection
                setSharedBuildLoaded(true);

                // --- REMOVE share param from URL without reloading ---
                params.delete("share");
                const newUrl =
                    window.location.pathname + (params.toString() ? `?${params.toString()}` : "");
                window.history.replaceState({}, "", newUrl);
            } catch (err) {
                console.error("Failed to load shared build:", err);
            }
        };

        loadSharedBuild();
    }, [sharedBuildLoaded]);


// --- API helpers ---
    const createSavedTechBuild = async (
        name: string,
        faction: string = selectedFaction,
        techIds: string[] = selectedTechs
    ): Promise<SavedTechBuild> => {
        try {
            const saved = await apiClient.createSavedBuild(name, faction, techIds);
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

            // populate current state
            setSelectedFaction(saved.selectedFaction);
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
