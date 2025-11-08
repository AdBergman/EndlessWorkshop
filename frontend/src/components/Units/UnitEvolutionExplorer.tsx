import React, {useContext, useEffect, useMemo, useRef, useState,} from "react";
import {useSearchParams} from "react-router-dom";
import GameDataContext from "@/context/GameDataContext";
import {UnitCarousel} from "./UnitCarousel";
import {EvolutionTreeViewer} from "./EvolutionTreeViewer";
import {FactionInfo, Unit} from "@/types/dataTypes";
import {identifyFaction} from "@/utils/factionIdentity";
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
    const [showMinorUnits, setShowMinorUnits] = useState(false);

    const hydratedFromUrl = useRef(false);

    // Reset carousel when faction or toggle changes
    useEffect(() => setSelectedIndex(0), [gameData.selectedFaction, showMinorUnits]);

    // Filter Tier 1 roots based on major/minor toggle
    const tierOneUnits = useMemo(() => {
        if (!gameData || gameData.units.size === 0) return [];
        const { selectedFaction } = gameData;

        return Array.from(gameData.units.values()).filter((u) => {
            if (u.tier !== 1) return false;
            const unitFaction = identifyFaction(u);

            if (showMinorUnits) {
                return !unitFaction.isMajor; // all minor faction units
            }

            return (
                selectedFaction.isMajor &&
                unitFaction.isMajor &&
                unitFaction.enumFaction === selectedFaction.enumFaction
            );
        });
    }, [gameData.units, gameData.selectedFaction, showMinorUnits]);

    // --- URL → State (only once after data ready) ---
    useEffect(() => {
        if (hydratedFromUrl.current) return;
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

        if (!factionMatches) {
            gameData.setSelectedFaction(fi);
            return;
        }

        if (tierOneUnits.length > 0) {
            const idx = tierOneUnits.findIndex(
                (u) => normalize(u.name) === normalize(unitParam)
            );
            if (idx >= 0) setSelectedIndex(idx);
            hydratedFromUrl.current = true;
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

    if (!gameData || gameData.units.size === 0) {
        return <div>Loading units...</div>;
    }

    const selectedUnit = tierOneUnits[selectedIndex] || null;

    return (
        <div className="unitEvolutionExplorer">

            {/* --- Header Row (toggle only, aligned right) --- */}
            <div className="unitExplorerHeader">
                <div className="minorSegmentedToggle single">
                    <span className="toggleLabel">Show Minor Factions:</span>
                    <div
                        className={`togglePill ${showMinorUnits ? "on" : "off"}`}
                        onClick={() => setShowMinorUnits(!showMinorUnits)}
                    >
                        <div className="toggleHighlight" />
                        <span className={`toggleOption ${!showMinorUnits ? "active" : ""}`}> Off </span>
                        <span className={`toggleOption ${showMinorUnits ? "active" : ""}`}> On </span>
                    </div>
                </div>
            </div>

            {/* --- Content --- */}
            <UnitCarousel
                units={tierOneUnits}
                selectedIndex={selectedIndex}
                setSelectedIndex={setSelectedIndex}
            />
            <EvolutionTreeViewer rootUnit={selectedUnit} skipRoot />
        </div>
    );
};
