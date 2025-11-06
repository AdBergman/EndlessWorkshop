import React, { useState, useEffect, ReactNode } from "react";
import GameDataContext, { FactionInfo } from "./GameDataContext";
import {District, Improvement, Tech, Unit, Faction} from "@/types/dataTypes";
import { apiClient, SavedTechBuild } from "@/api/apiClient";
import { identifyFaction } from "@/utils/factionIdentity";
import { useNavigate } from "react-router-dom"; // Import useNavigate

interface Props { children: ReactNode }

const GameDataProvider: React.FC<Props> = ({ children }) => {
    const [districts, setDistricts] = useState<Map<string, District>>(new Map());
    const [improvements, setImprovements] = useState<Map<string, Improvement>>(new Map());
    const [techs, setTechs] = useState<Map<string, Tech>>(new Map());
    const [units, setUnits] = useState<Map<string, Unit>>(new Map());

    const initialFaction = identifyFaction({ faction: Faction.KIN, minorFaction: null });
    const [selectedFaction, setSelectedFaction] = useState<FactionInfo>(initialFaction);
    const [selectedTechs, setSelectedTechs] = useState<string[]>([]);

    // --- Track if shared build has been loaded ---
    const [sharedBuildLoaded, setSharedBuildLoaded] = useState(false);

    const navigate = useNavigate(); // Initialize useNavigate

    // Determine initial processing state for shared builds
    const initialShareUuid = new URLSearchParams(window.location.search).get("share");
    const [isProcessingSharedBuild, setIsProcessingSharedBuild] = useState(!!initialShareUuid);

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
                // Normalize tech.factions to uppercase here
                const normalizedTechData = techData.map(t => ({
                    ...t,
                    factions: t.factions.map(f => f.toUpperCase())
                }));
                setTechs(new Map(normalizedTechData.map(t => [t.name, t])));
            } catch (err) {
                console.error("Failed to fetch game data from API.", err);
            }
        };
        fetchData();
    }, []);

    // --- Fetch units asynchronously after initial data load ---
    useEffect(() => {
        const fetchUnits = async () => {
            try {
                console.log("🔄 Bootstrapping units...");
                const unitData = await apiClient.getUnits();
                console.log("✅ Loaded units:", unitData.length);

                const unitMap = new Map(unitData.map(u => [u.name, u]));
                setUnits(unitMap);
            } catch (err) {
                console.error("❌ Failed to load units:", err);
            }
        };

        fetchUnits();
    }, []);

// --- Load shared build from URL param (runs once) ---
    useEffect(() => {
        if (sharedBuildLoaded) return;

        const params = new URLSearchParams(window.location.search);
        const shareUuid = params.get("share");
        if (!shareUuid) {
            setIsProcessingSharedBuild(false); // No share param, so not processing
            return;
        }

        const loadSharedBuild = async () => {
            try {
                const res = await apiClient.getSavedBuild(shareUuid);
                // Convert the string faction from API to FactionInfo object
                // FIX: Convert res.selectedFaction to uppercase to match TypeScript Faction enum keys
                const factionEnumLookup = Faction[res.selectedFaction.toUpperCase() as keyof typeof Faction];
                const loadedFactionInfo = identifyFaction({ faction: factionEnumLookup, minorFaction: null });
                setSelectedFaction(loadedFactionInfo);
                setSelectedTechs(res.techIds); // populate tech selection
                setSharedBuildLoaded(true);

                // --- REMOVE share param from URL and redirect to /tech using useNavigate ---
                params.delete("share");
                const newSearch = params.toString() ? `?${params.toString()}` : "";
                navigate(`/tech${newSearch}`, { replace: true }); // Use navigate
            } catch (err) {
                console.error("Failed to load shared build:", err);
            } finally {
                setIsProcessingSharedBuild(false); // Always set to false after attempt
            }
        };

        loadSharedBuild();
    }, [sharedBuildLoaded, navigate]);


// --- API helpers ---
    const createSavedTechBuild = async (
        name: string,
        faction: FactionInfo = selectedFaction, // Changed type to FactionInfo
        techIds: string[] = selectedTechs
    ): Promise<SavedTechBuild> => {
        try {
            // Pass the enumFaction string to the API
            const saved = await apiClient.createSavedBuild(name, faction.enumFaction!.toString(), techIds);
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
            // Convert the string faction from API to FactionInfo object
            const loadedFactionInfo = identifyFaction({ faction: Faction[saved.selectedFaction as keyof typeof Faction], minorFaction: null });
            setSelectedFaction(loadedFactionInfo);
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
            units,
            selectedFaction,
            setSelectedFaction,
            selectedTechs,
            setSelectedTechs,
            createSavedTechBuild,
            getSavedBuild,
            isProcessingSharedBuild, // Expose the new state
        }}>
            {children}
        </GameDataContext.Provider>
    );
};

export default GameDataProvider;
