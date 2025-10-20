import React, { useState } from "react";
import { motion } from "framer-motion";
import "./UnitCard.css";
import { FaBolt, FaHeart, FaRunning, FaShieldAlt } from "react-icons/fa";
import { FactionIcon, FactionType } from "./FactionIcon";
import { FACTION_COLORS, FACTION_GRADIENT } from "src/types/factionColors";

export interface Unit {
    name: string;
    tier: number;
    type: string;
    skills: string[];
    health: number;
    minDamage: number;
    maxDamage: number;
    defense: number;
    movement: number;
    cost: number;
    requiredTechnology: string;
    upgrade: string;
    faction: string;
    FactionType: string;
    imageUrl?: string;
}

interface UnitCardProps {
    unit: Unit;
    showArtwork?: boolean;
}

export const UnitCard: React.FC<UnitCardProps> = ({ unit, showArtwork = true }) => {
    const [imageLoaded, setImageLoaded] = useState(false);

    // Safely resolve faction colors
    const factionKey = (unit.faction?.toUpperCase() || "PLACEHOLDER") as keyof typeof FACTION_COLORS;
    const colors = FACTION_COLORS[factionKey] || FACTION_COLORS.PLACEHOLDER;

    return (
        <motion.div
            className="cardContainer"
            style={{
                border: `2px solid ${colors.border}`,
                boxShadow: `0 5px 15px rgba(0,0,0,0.5), 0 0 10px ${colors.accent}55`,
            }}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            whileHover={{
                scale: 1.18,
                y: -6,
                boxShadow: `0px 20px 40px rgba(0,0,0,0.6), 0 0 20px ${colors.accent}`,
                transition: { type: "spring", stiffness: 120, damping: 18 },
            }}
        >
            {/* Header */}
            <div className="header">
                <div
                    className="name"
                    style={{
                        background: FACTION_GRADIENT[factionKey],
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                    }}
                >
                    {unit.name}
                </div>
                <div className="fortIcon" style={{ color: colors.accent }}>
                    <FactionIcon
                        factionType={unit.FactionType as "major" | "minor"}
                        faction={unit.faction as FactionType}
                    />
                </div>
            </div>

            {/* Type + Tier */}
            <div className="typeTier" style={{ color: colors.border }}>
                <span className="type">{unit.type}</span>
                <span className="tierBadge">Tier {unit.tier}</span>
            </div>

            {/* Artwork */}
            {showArtwork && (
                <div className="artContainer">
                    {!imageLoaded && <div className="artPlaceholder" />}
                    <motion.img
                        src={unit.imageUrl || "/graphics/units/placeholder.png"} // fallback
                        alt={unit.name}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{
                            opacity: imageLoaded ? 1 : 0,
                            scale: imageLoaded ? 1 : 0.95,
                        }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        onLoad={() => setImageLoaded(true)}
                    />
                </div>
            )}

            {/* Glow Overlay */}
            <motion.div
                className="cardGlowOverlay"
                initial={{ opacity: 0 }}
                whileHover={{
                    opacity: 0.15,
                    background: `linear-gradient(135deg, ${colors.accent}33, transparent)`,
                }}
                transition={{ duration: 0.4, ease: "easeOut" }}
            />

            {/* Stats */}
            <div className="statsBox">
                <div className="statsRow">
                    <div className="stat"><FaHeart /> {unit.health}</div>
                    <div className="stat"><FaBolt /> {unit.minDamage} - {unit.maxDamage}</div>
                </div>
                <div className="statsRow">
                    <div className="stat"><FaShieldAlt /> {unit.defense}</div>
                    <div className="stat"><FaRunning /> {unit.movement}</div>
                    <div className="stat">Cost: {unit.cost}</div>
                </div>
            </div>

            {/* Skills */}
            <div className="skills">
                {unit.skills.map((skill, idx) => (
                    <span key={idx} className="skill">{skill}</span>
                ))}
            </div>
        </motion.div>
    );
};
