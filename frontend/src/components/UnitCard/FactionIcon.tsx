import React from "react";
import {
    FaFortAwesomeAlt,
    FaCoins,
    FaBug,
    FaFlask,
    FaHandshake,
} from "react-icons/fa";

export type FactionType = "KIN" | "LAST_LORDS" | "NECROPHAGE" | "TAHUK" | "ASPECT";

interface FactionIconProps {
    factionType: "major" | "minor";
    faction: FactionType;
    size?: number;
    color?: string;
}

const majorFactionIcons: Record<FactionType, React.ElementType> = {
    KIN: FaFortAwesomeAlt,
    LAST_LORDS: FaCoins,
    NECROPHAGE: FaBug,
    TAHUK: FaFlask,
    ASPECT: FaHandshake,
};

export const FactionIcon: React.FC<FactionIconProps> = ({ factionType, faction, size = 20, color = "#4faaff" }) => {
    if (factionType !== "major") return null;

    const IconComponent = majorFactionIcons[faction];
    return <IconComponent size={size} color={color} />;
};
