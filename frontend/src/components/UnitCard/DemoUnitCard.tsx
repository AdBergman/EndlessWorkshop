import React from "react";
import { UnitCard, Unit } from "./UnitCard";

const sentinel: Unit = {
    name: "Sentinel",
    tier: 1,
    type: "Cavalry",
    skills: ["Aware"],
    health: 120,
    minDamage: 30,
    maxDamage: 40,
    defense: 5,
    movement: 4,
    cost: 80,
    requiredTechnology: "",
    upgrade: "",
    faction: "KIN",
    FactionType: "major",
    // imageUrl: "/graphics/units/placeholder.png",
};


const DemoUnitCard: React.FC = () => {
    return (
        <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
            <UnitCard unit={sentinel} />
        </div>
    );
};

export default DemoUnitCard;
