import React, { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import GameDataContext from "./GameDataContext";
import { Codex, Faction, FactionInfo, Tech, Unit } from "@/types/dataTypes";
import { apiClient, SavedTechBuild } from "@/api/apiClient";
import { useNavigate } from "react-router-dom";
import { useCodexStore } from "@/stores/codexStore";
import { useDistrictImprovementStore } from "@/stores/districtImprovementStore";

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
    const [techs, setTechs] = useState<Map<string, Tech>>(new Map());
    const [units, setUnits] = useState<Map<string, Unit>>(new Map());

    const [selectedFaction, setSelectedFaction] = useState<FactionInfo>(
        toFactionInfoFromEnum(Faction.KIN)
    );
    const [selectedTechs, setSelectedTechs] = useState<string[]>([]);

    const [sharedBuildLoaded, setSharedBuildLoaded] = useState(false);

    const navigate = useNavigate();

    const initialShareUuid = new URLSearchParams(window.location.search).get("share");
    const [isProcessingSharedBuild, setIsProcessingSharedBuild] = useState(!!initialShareUuid);
    const codexEntriesByKind = useCodexStore((s) => s.entriesByKind);
    const loadCodexEntries = useCodexStore((s) => s.loadEntries);
    const districtsByKey = useDistrictImprovementStore((s) => s.districtsByKey);
    const improvementsByKey = useDistrictImprovementStore((s) => s.improvementsByKey);
    const loadDistrictImprovements = useDistrictImprovementStore((s) => s.load);

    const districts = useMemo(
        () => new Map(Object.entries(districtsByKey)),
        [districtsByKey]
    );

    const improvements = useMemo(
        () => new Map(Object.entries(improvementsByKey)),
        [improvementsByKey]
    );

    const codexByKindKey = useMemo(() => {
        const out = new Map<string, Map<string, Codex>>();

        for (const [kind, entries] of Object.entries(codexEntriesByKind)) {
            out.set(kind, toKeyedMap(entries, (entry) => entry.entryKey));
        }

        return out;
    }, [codexEntriesByKind]);

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
        void loadDistrictImprovements();
        void refreshTechs();
    }, [loadDistrictImprovements, refreshTechs]);

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
                units,

                codexByKindKey,

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
