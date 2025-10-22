import React, { useState, useContext } from "react";
import GameDataContext from "@/context/GameDataContext";
import { UnitCarousel } from "./UnitCarousel";
import { EvolutionTreeViewer } from "./EvolutionTreeViewer";
import { Unit } from "@/types/dataTypes";
import "./UnitEvolutionExplorer.css";

export const UnitEvolutionExplorer: React.FC = () => {
    const gameData = useContext(GameDataContext);
    const [selectedIndex, setSelectedIndex] = useState(0);

    if (!gameData || gameData.units.size === 0) {
        return <div>Loading units...</div>;
    }

    const unitsArray = Array.from(gameData.units.values());
    const tierOneUnits = unitsArray.filter((u) => u.tier === 1);
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
