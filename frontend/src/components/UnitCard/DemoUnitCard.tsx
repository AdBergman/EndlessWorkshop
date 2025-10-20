import React, { useContext } from "react";
import { UnitCard } from "./UnitCard";
import GameDataContext from "@/context/GameDataContext";

const DemoUnitCard: React.FC = () => {
    const gameData = useContext(GameDataContext);

    if (!gameData || gameData.units.size === 0) {
        return <div>Loading units...</div>;
    }

    // ✅ Filter all KIN units
    const kinUnits = Array.from(gameData.units.values()).filter(
        (unit) => unit.faction?.toUpperCase() === "KIN"
    );

    if (kinUnits.length === 0) {
        return <div>No Kin units found.</div>;
    }

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                gap: "20px",
                padding: "40px",
            }}
        >
            {kinUnits.map((unit) => (
                <UnitCard key={unit.name} unit={unit} />
            ))}
        </div>
    );
};

export default DemoUnitCard;
