import React from "react";
import {
    FaFortAwesomeAlt,
    FaChessKing,
    FaBug,
    FaFlask,
    FaPeace,
} from "react-icons/fa";

export type FactionType = "KIN" | "LAST_LORDS" | "NECROPHAGE" | "TAHUK" | "ASPECT";

interface FactionIconProps {
    faction: FactionType;
    size?: number;
    color?: string;
}

const factionIcons: Record<FactionType, React.ElementType> = {
    KIN: FaFortAwesomeAlt,
    LAST_LORDS: FaChessKing,
    NECROPHAGE: FaBug,
    TAHUK: FaFlask,
    ASPECT: FaPeace,
};

export const FactionIcon: React.FC<FactionIconProps> = ({ faction, size = 20, color = "#4faaff" }) => {
    const IconComponent = factionIcons[faction] || FaFortAwesomeAlt;
    return <IconComponent size={size} color={color} />;
};
