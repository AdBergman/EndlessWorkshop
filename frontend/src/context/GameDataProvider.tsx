// GameDataProvider.tsx
import React, { useState, useEffect, ReactNode, useCallback } from "react";
import GameDataContext from "./GameDataContext";
import { District, Improvement, Tech, Unit, Faction, FactionInfo } from "@/types/dataTypes";
import { apiClient, SavedTechBuild } from "@/api/apiClient";
import { identifyFaction } from "@/utils/factionIdentity";
import { useNavigate } from "react-router-dom";

interface Props {
    children: ReactNode;
}

const normalizeTechs = (techData: Tech[]) =>
    techData.map((t) => ({
        ...t,
        factions: (t.factions ?? []).map((f) => f.toUpperCase()),
    }));

const GameDataProvider: React.FC<Props> = ({ children }) => {
    const [districts, setDistricts] = useState<Map<string, District>>(new Map());
    const [improvements, setImprovements] = useState<Map<string, Improvement>>(new Map());
    const [techs, setTechs] = useState<Map<string, Tech>>(new Map());
    const [units, setUnits] = useState<Map<string, Unit>>(new Map());

    const initialFaction = identifyFaction({ faction: Faction.KIN, minorFaction: null });
    const [selectedFaction, setSelectedFaction] = useState<FactionInfo>(initialFaction);
    const [selectedTechs, setSelectedTechs] = useState<string[]>([]);

    const [sharedBuildLoaded, setSharedBuildLoaded] = useState(false);

    const navigate = useNavigate();

    const initialShareUuid = new URLSearchParams(window.location.search).get("share");
    const [isProcessingSharedBuild, setIsProcessingSharedBuild] = useState(!!initialShareUuid);

    const refreshTechs = useCallback(async () => {
        try {
            const techData = await apiClient.getTechs();
            const normalizedTechData = normalizeTechs(techData);

            // Local H2 pre-import: backend returns rows without techKey -> don't load techs yet
            const missingKey = normalizedTechData.some((t) => !t.techKey || !t.techKey.trim());
            if (missingKey) {
                setTechs(new Map());
                return;
            }

            setTechs(new Map(normalizedTechData.map((t) => [t.techKey, t])));
        } catch (err) {
            console.error("Failed to fetch techs from API.", err);
            setTechs(new Map());
        }
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [districtData, improvementData] = await Promise.all([
                    apiClient.getDistricts(),
                    apiClient.getImprovements(),
                ]);

                setDistricts(new Map(districtData.map((d) => [d.name, d])));
                setImprovements(new Map(improvementData.map((i) => [i.name, i])));

                await refreshTechs();
            } catch (err) {
                console.error("Failed to fetch game data from API.", err);
            }
        };

        void fetchData();
    }, [refreshTechs]);

    useEffect(() => {
        const fetchUnits = async () => {
            try {
                const unitData = await apiClient.getUnits();
                setUnits(new Map(unitData.map((u) => [u.name, u])));
            } catch (err) {
                console.error("❌ Failed to load units:", err);
            }
        };

        void fetchUnits();
    }, []);

    useEffect(() => {
        if (sharedBuildLoaded) return;

        const params = new URLSearchParams(window.location.search);
        const shareUuid = params.get("share");
        if (!shareUuid) {
            setIsProcessingSharedBuild(false);
            return;
        }

        const loadSharedBuild = async () => {
            try {
                const res = await apiClient.getSavedBuild(shareUuid);

                const factionEnumLookup =
                    Faction[res.selectedFaction.toUpperCase() as keyof typeof Faction];

                const loadedFactionInfo = identifyFaction({
                    faction: factionEnumLookup,
                    minorFaction: null,
                });

                setSelectedFaction(loadedFactionInfo);
                setSelectedTechs(res.techIds);
                setSharedBuildLoaded(true);

                params.delete("share");
                const newSearch = params.toString() ? `?${params.toString()}` : "";
                navigate(`/tech${newSearch}`, { replace: true });
            } catch (err) {
                console.error("Failed to load shared build:", err);
            } finally {
                setIsProcessingSharedBuild(false);
            }
        };

        void loadSharedBuild();
    }, [sharedBuildLoaded, navigate]);

    const createSavedTechBuild = async (
        name: string,
        faction: FactionInfo = selectedFaction,
        techIds: string[] = selectedTechs
    ): Promise<SavedTechBuild> => {
        try {
            return await apiClient.createSavedBuild(name, faction.enumFaction!.toString(), techIds);
        } catch (err) {
            console.error("Failed to save tech build:", err);
            throw err;
        }
    };

    const getSavedBuild = async (uuid: string): Promise<SavedTechBuild> => {
        try {
            const saved = await apiClient.getSavedBuild(uuid);

            const loadedFactionInfo = identifyFaction({
                faction: Faction[saved.selectedFaction.toUpperCase() as keyof typeof Faction],
                minorFaction: null,
            });

            setSelectedFaction(loadedFactionInfo);
            setSelectedTechs(saved.techIds);

            return saved;
        } catch (err) {
            console.error("Failed to load saved tech build:", err);
            throw err;
        }
    };

    return (
        <GameDataContext.Provider
            value={{
                districts,
                improvements,
                techs,
                units,

                setTechs,
                refreshTechs,

                selectedFaction,
                setSelectedFaction,
                selectedTechs,
                setSelectedTechs,

                createSavedTechBuild,
                getSavedBuild,

                isProcessingSharedBuild,
            }}
        >
            {children}
        </GameDataContext.Provider>
    );
};

export default GameDataProvider;