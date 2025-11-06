import React from "react";
import {
  FaFortAwesomeAlt,
  FaChessKing,
  FaBug,
  FaFlask,
  FaPeace,
} from "react-icons/fa";

import { Faction } from "@/types/dataTypes";

interface FactionIconProps {
  faction: Faction;
  size?: number;
  color?: string;
}

const factionIcons: Record<Faction, React.ElementType> = {
  [Faction.KIN]: FaFortAwesomeAlt,
  [Faction.LORDS]: FaChessKing,
  [Faction.ASPECTS]: FaPeace,
  [Faction.NECROPHAGES]: FaBug,
  [Faction.TAHUK]: FaFlask,
};

export const FactionIcon: React.FC<FactionIconProps> = ({
  faction,
  size = 20,
  color = "#4faaff",
}) => {
  const IconComponent = factionIcons[faction] ?? FaFortAwesomeAlt;
  return <IconComponent size={size} color={color} />;
};
