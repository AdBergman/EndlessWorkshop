import React, {
    useState,
    useContext,
    useMemo,
    useEffect,
    useRef,
} from "react";
import { useSearchParams } from "react-router-dom";
import GameDataContext from "@/context/GameDataContext";
import { UnitCarousel } from "./UnitCarousel";
import { EvolutionTreeViewer } from "./EvolutionTreeViewer";
import { Unit, FactionInfo } from "@/types/dataTypes";
import { identifyFaction } from "@/utils/factionIdentity";
import "./UnitEvolutionExplorer.css";

// --- Utility helpers ---
const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, "_");
const toFactionInfo = (f: string): FactionInfo => ({
    isMajor: true,
    enumFaction: f.toUpperCase() as any,
    minorName: null,
    uiLabel: f.toLowerCase(),
});

export const UnitEvolutionExplorer: React.FC = () => {
    const gameData = useContext(GameDataContext);
    const [params, setParams] = useSearchParams();
    const [selectedIndex, setSelectedIndex] = useState(0);

    // NEW: guard so deep-link hydration runs only once
    const hydratedFromUrl = useRef(false);

    // Reset carousel when faction changes
    useEffect(() => setSelectedIndex(0), [gameData.selectedFaction]);

    // Tier-1 roots for the current faction
    const tierOneUnits = useMemo(() => {
        if (!gameData || gameData.units.size === 0) return [];
        const { selectedFaction } = gameData;

        return Array.from(gameData.units.values()).filter((u) => {
            if (u.tier !== 1) return false;
            const unitFaction = identifyFaction(u);
            return selectedFaction.isMajor
                ? unitFaction.isMajor &&
                unitFaction.enumFaction === selectedFaction.enumFaction
                : !unitFaction.isMajor &&
                unitFaction.minorName === selectedFaction.minorName;
        });
    }, [gameData.units, gameData.selectedFaction]);

    // --- URL → State (only once after data ready) ---
    useEffect(() => {
        if (hydratedFromUrl.current) return; // ✅ already applied
        if (!gameData) return;

        const factionParam = params.get("faction");
        const unitParam = params.get("unit");
        if (!factionParam || !unitParam) {
            hydratedFromUrl.current = true;
            return;
        }

        const fi = toFactionInfo(factionParam);
        const factionMatches =
            gameData.selectedFaction.isMajor &&
            gameData.selectedFaction.enumFaction === fi.enumFaction;

        // Step 1 — set faction if needed
        if (!factionMatches) {
            gameData.setSelectedFaction(fi);
            return; // wait for next render; don’t mark hydrated yet
        }

        // Step 2 — once faction matches & data loaded, set unit
        if (tierOneUnits.length > 0) {
            const idx = tierOneUnits.findIndex(
                (u) => normalize(u.name) === normalize(unitParam)
            );
            if (idx >= 0) setSelectedIndex(idx);
            hydratedFromUrl.current = true; // ✅ done, never re-run
        }
    }, [params, gameData, tierOneUnits]);

    // --- State → URL (silent sync) ---
    useEffect(() => {
        if (!gameData?.selectedFaction?.isMajor) return;
        const selectedUnit: Unit | null = tierOneUnits[selectedIndex] || null;
        if (!selectedUnit) return;

        const factionKey = gameData.selectedFaction.enumFaction.toLowerCase();
        const unitKey = normalize(selectedUnit.name);

        const curFaction = params.get("faction") || "";
        const curUnit = params.get("unit") || "";
        if (curFaction === factionKey && curUnit === unitKey) return;

        setParams({ faction: factionKey, unit: unitKey }, { replace: true });
    }, [gameData?.selectedFaction, selectedIndex, tierOneUnits]);

    // --- Render ---
    if (!gameData || gameData.units.size === 0) {
        return <div>Loading units...</div>;
    }

    const selectedUnit = tierOneUnits[selectedIndex] || null;

    return (
        <div className="unitEvolutionExplorer">
            <UnitCarousel
                units={tierOneUnits}
                selectedIndex={selectedIndex}
                setSelectedIndex={setSelectedIndex}
            />
            <EvolutionTreeViewer rootUnit={selectedUnit} skipRoot />
        </div>
    );
};
