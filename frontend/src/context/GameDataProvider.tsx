import React, { ReactNode, useEffect, useMemo, useState } from "react";
import GameDataContext from "./GameDataContext";
import { Codex, Faction, FactionInfo } from "@/types/dataTypes";
import { apiClient, SavedTechBuild } from "@/api/apiClient";
import { useNavigate } from "react-router-dom";
import { useCodexStore } from "@/stores/codexStore";
import { useDistrictStore } from "@/stores/districtStore";
import { useImprovementStore } from "@/stores/improvementStore";
import { useUnitStore } from "@/stores/unitStore";
import { useTechStore } from "@/stores/techStore";
import { selectSelectedTechs, selectSetSelectedTechs, useTechPlannerStore } from "@/stores/techPlannerStore";
import {
    selectSelectedFaction,
    selectSetSelectedFaction,
    useFactionSelectionStore,
} from "@/stores/factionSelectionStore";

interface Props {
    children: ReactNode;
}

const toKeyedMap = <T,>(
    items: T[],
    getKey: (x: T) => string | null | undefined
): Map<string, T> => {
    const m = new Map<string, T>();
    for (const item of items) {
        const k = (getKey(item) ?? "").trim();
        if (!k) continue;
        m.set(k, item);
    }
    return m;
};

const toFactionInfoFromEnum = (faction: Faction): FactionInfo => ({
    isMajor: true,
    enumFaction: faction,
    uiLabel: String(faction).toLowerCase(),
    minorName: null,
});

const GameDataProvider: React.FC<Props> = ({ children }) => {
    const selectedFaction = useFactionSelectionStore(selectSelectedFaction);
    const setSelectedFaction = useFactionSelectionStore(selectSetSelectedFaction);
    const selectedTechs = useTechPlannerStore(selectSelectedTechs);
    const setSelectedTechs = useTechPlannerStore(selectSetSelectedTechs);

    const [sharedBuildLoaded, setSharedBuildLoaded] = useState(false);

    const navigate = useNavigate();

    const initialShareUuid = new URLSearchParams(window.location.search).get("share");
    const [isProcessingSharedBuild, setIsProcessingSharedBuild] = useState(!!initialShareUuid);
    const codexEntriesByKind = useCodexStore((s) => s.entriesByKind);
    const loadCodexEntries = useCodexStore((s) => s.loadEntries);
    const districtsByKey = useDistrictStore((s) => s.districtsByKey);
    const improvementsByKey = useImprovementStore((s) => s.improvementsByKey);
    const loadDistricts = useDistrictStore((s) => s.loadDistricts);
    const loadImprovements = useImprovementStore((s) => s.loadImprovements);
    const loadUnits = useUnitStore((s) => s.loadUnits);
    const techsByKey = useTechStore((s) => s.techsByKey);
    const loadTechs = useTechStore((s) => s.loadTechs);
    const refreshTechs = useTechStore((s) => s.refreshTechs);

    const districts = useMemo(
        () => new Map(Object.entries(districtsByKey)),
        [districtsByKey]
    );

    const improvements = useMemo(
        () => new Map(Object.entries(improvementsByKey)),
        [improvementsByKey]
    );

    const techs = useMemo(
        () => new Map(Object.entries(techsByKey)),
        [techsByKey]
    );

    const codexByKindKey = useMemo(() => {
        const out = new Map<string, Map<string, Codex>>();

        for (const [kind, entries] of Object.entries(codexEntriesByKind)) {
            out.set(kind, toKeyedMap(entries, (entry) => entry.entryKey));
        }

        return out;
    }, [codexEntriesByKind]);

    useEffect(() => {
        void loadDistricts();
        void loadImprovements();
        void loadUnits();
        void loadTechs();
    }, [loadDistricts, loadImprovements, loadTechs, loadUnits]);

    useEffect(() => {
        void loadCodexEntries();
    }, [loadCodexEntries]);

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

                const loadedFactionInfo = toFactionInfoFromEnum(factionEnumLookup);

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

        const factionEnum =
            Faction[saved.selectedFaction.toUpperCase() as keyof typeof Faction];

        const loadedFactionInfo = toFactionInfoFromEnum(factionEnum);

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

                codexByKindKey,

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
