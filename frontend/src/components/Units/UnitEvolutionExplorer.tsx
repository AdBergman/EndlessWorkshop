import React, { useState, useContext, useMemo, useEffect } from "react";
import GameDataContext, { FactionInfo } from "@/context/GameDataContext";
import { UnitCarousel } from "./UnitCarousel";
import { EvolutionTreeViewer } from "./EvolutionTreeViewer";
import { Unit } from "@/types/dataTypes";
import { identifyFaction } from "@/utils/factionIdentity";
import { useSearchParams } from "react-router-dom";
import "./UnitEvolutionExplorer.css";

export const UnitEvolutionExplorer: React.FC = () => {
    const gameData = useContext(GameDataContext);
    const [params, setParams] = useSearchParams();
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Reset carousel when faction changes
    useEffect(() => {
        setSelectedIndex(0);
    }, [gameData.selectedFaction]);

    // Build tier-1 list for the current faction
    const tierOneUnits = useMemo(() => {
        if (!gameData || gameData.units.size === 0) return [];
        const unitsArray = Array.from(gameData.units.values());
        return unitsArray.filter((u) => {
            if (u.tier !== 1) return false;
            const unitFactionInfo = identifyFaction(u);
            const selectedFactionInfo = gameData.selectedFaction;
            if (selectedFactionInfo.isMajor) {
                return (
                    unitFactionInfo.isMajor &&
                    unitFactionInfo.enumFaction === selectedFactionInfo.enumFaction
                );
            } else {
                return (
                    !unitFactionInfo.isMajor &&
                    unitFactionInfo.minorName === selectedFactionInfo.minorName
                );
            }
        });
    }, [gameData.units, gameData.selectedFaction]);

    // 🔽 Read from URL: /units?faction=kin&unit=necrodrone
    useEffect(() => {
        if (!gameData) return;

        const factionParam = params.get("faction");
        const unitParam = params.get("unit");

        // 1) Select faction
        if (factionParam && gameData.setSelectedFaction) {
            const upper = factionParam.toUpperCase();
            const fi: FactionInfo = {
                isMajor: true,
                enumFaction: upper as any,
                minorName: null,
                uiLabel: upper.toLowerCase(),
            };
            if (
                !gameData.selectedFaction.isMajor ||
                gameData.selectedFaction.enumFaction !== fi.enumFaction
            ) {
                gameData.setSelectedFaction(fi);
                return;
            }
        }

        // 2) Select unit after tierOneUnits exist
        if (unitParam && tierOneUnits.length > 0) {
            const idx = tierOneUnits.findIndex(
                (u) => u.name.toLowerCase() === unitParam.toLowerCase()
            );
            if (idx >= 0 && idx !== selectedIndex) {
                setSelectedIndex(idx);
            }
        }
    }, [params, gameData, tierOneUnits, selectedIndex]);

    // 🔼 Write current selection back to URL (silently)
    useEffect(() => {
        if (!gameData?.selectedFaction?.isMajor) return;
        const selectedUnit: Unit | null = tierOneUnits[selectedIndex] || null;
        if (!selectedUnit) return;

        const factionKey = gameData.selectedFaction.enumFaction.toLowerCase();
        const unitKey = selectedUnit.name.toLowerCase();

        const curFaction = params.get("faction") || "";
        const curUnit = params.get("unit") || "";
        if (curFaction === factionKey && curUnit === unitKey) return;

        setParams({ faction: factionKey, unit: unitKey }, { replace: true });
    }, [gameData?.selectedFaction, selectedIndex, tierOneUnits]);

    if (!gameData || gameData.units.size === 0) {
        return <div>Loading units...</div>;
    }

    const selectedUnit: Unit | null = tierOneUnits[selectedIndex] || null;

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
