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
        descriptionLines: t.descriptionLines ?? [],
        unlocks: t.unlocks ?? [],
    }));

const toKeyedMap = <T,>(items: T[], getKey: (x: T) => string | null | undefined): Map<string, T> => {
    const m = new Map<string, T>();
    for (const item of items) {
        const k = (getKey(item) ?? "").trim();
        if (!k) continue;
        m.set(k, item);
    }
    return m;
};

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
            const normalized = normalizeTechs(techData);

            const missingKey = normalized.some((t) => !t.techKey || !t.techKey.trim());
            if (missingKey) {
                setTechs(new Map());
                return;
            }

            setTechs(toKeyedMap(normalized, (t) => t.techKey));
        } catch (err) {
            console.error("Failed to fetch techs from API.", err);
            setTechs(new Map());
        }
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            const [districtRes, improvementRes] = await Promise.allSettled([
                apiClient.getDistricts(),
                apiClient.getImprovements(),
            ]);

            if (districtRes.status === "fulfilled") {
                setDistricts(toKeyedMap(districtRes.value, (d) => d.districtKey));
            } else {
                console.error("Failed to fetch districts from API.", districtRes.reason);
                setDistricts(new Map());
            }

            if (improvementRes.status === "fulfilled") {
                setImprovements(toKeyedMap(improvementRes.value, (i) => i.improvementKey));
            } else {
                console.error("Failed to fetch improvements from API.", improvementRes.reason);
                setImprovements(new Map());
            }

            await refreshTechs();
        };

        void fetchData();
    }, [refreshTechs]);

    useEffect(() => {
        const fetchUnits = async () => {
            try {
                const unitData = await apiClient.getUnits();
                setUnits(toKeyedMap(unitData, (u) => u.unitKey));
            } catch (err) {
                console.error("Failed to load units:", err);
                setUnits(new Map());
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

                const factionEnumLookup = Faction[res.selectedFaction.toUpperCase() as keyof typeof Faction];

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
        return await apiClient.createSavedBuild(name, faction.enumFaction!.toString(), techIds);
    };

    const getSavedBuild = async (uuid: string): Promise<SavedTechBuild> => {
        const saved = await apiClient.getSavedBuild(uuid);

        const loadedFactionInfo = identifyFaction({
            faction: Faction[saved.selectedFaction.toUpperCase() as keyof typeof Faction],
            minorFaction: null,
        });

        setSelectedFaction(loadedFactionInfo);
        setSelectedTechs(saved.techIds);

        return saved;
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