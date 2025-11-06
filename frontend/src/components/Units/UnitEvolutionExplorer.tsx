import React, { useState, useContext, useMemo, useEffect } from "react";
import GameDataContext from "@/context/GameDataContext";
import { UnitCarousel } from "./UnitCarousel";
import { EvolutionTreeViewer } from "./EvolutionTreeViewer";
import { Unit } from "@/types/dataTypes";
import "./UnitEvolutionExplorer.css";

export const UnitEvolutionExplorer: React.FC = () => {
    const gameData = useContext(GameDataContext);
    const [selectedIndex, setSelectedIndex] = useState(0);

    // When the selected faction changes, reset the carousel to the first unit.
    useEffect(() => {
        setSelectedIndex(0);
    }, [gameData.selectedFaction]);

    // Memoize the filtered list of tier 1 units.
    // This ensures the list is only re-calculated when the units or faction change.
    const tierOneUnits = useMemo(() => {
        if (!gameData || gameData.units.size === 0) {
            return [];
        }
        const unitsArray = Array.from(gameData.units.values());
        return unitsArray.filter(
            (u) => u.tier === 1 && u.faction?.toLowerCase() === gameData.selectedFaction.toLowerCase()
        );
    }, [gameData.units, gameData.selectedFaction]);

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
