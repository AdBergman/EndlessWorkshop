import React, { useState } from "react";
import { motion } from "framer-motion";
import "./UnitCard.css";
import { FaBolt, FaHeart, FaRunning, FaShieldAlt, FaCoins } from "react-icons/fa";
import { FactionIcon, FactionType } from "./FactionIcon";
import { FACTION_COLORS, FACTION_GRADIENT } from "@/types/factionColors";
import { Unit } from "@/types/dataTypes";

interface UnitCardProps {
    unit: Unit;
    showArtwork?: boolean;
    disableFlip?: boolean;
}

export const UnitCard: React.FC<UnitCardProps> = ({ unit, showArtwork = true, disableFlip = false }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [flipped, setFlipped] = useState(false);

    const factionKey = (unit.faction?.toUpperCase() || "PLACEHOLDER") as keyof typeof FACTION_COLORS;
    const colors = FACTION_COLORS[factionKey] || FACTION_COLORS.PLACEHOLDER;


    return (
        <motion.div
            className="cardContainer"
            whileHover={{
                scale: 1.1,
                y: -4,
            }}
            onClick={() => {
                if (!disableFlip) setFlipped(!flipped);
            }}
        >
            <motion.div
                className="cardFlipWrapper"
                animate={{
                    rotateY: flipped ? 180 : 0,
                    z: flipped ? 30 : 0,
                }}
                transition={{
                    duration: 0.55,
                    ease: [0.45, 0.05, 0.55, 0.95],
                }}
                style={{
                    transformStyle: "preserve-3d",
                    ["--card-border" as any]: colors.border,
                }}
            >
                {/* GLOW + BORDER now INSIDE the flipping wrapper */}
                <div
                    className="cardBorderAndGlow"
                    style={{
                        border: `2px solid ${colors.border}`,
                        boxShadow: `0 5px 15px rgba(0,0,0,0.5), 0 0 10px ${colors.accent}55`,
                    }}
                />

                {/* FRONT */}
                <div className="cardFace cardFront">
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
                            <FactionIcon faction={unit.faction as FactionType} />
                        </div>
                    </div>

                    <div className="typeTier" style={{ color: colors.border }}>
                        <span className="type">{unit.type}</span>
                        <span className="tierBadge">Tier {unit.tier}</span>
                    </div>

                    {showArtwork && (
                        <div className="artContainer">
                            {!imageLoaded && <div className="artPlaceholder" />}
                            <motion.img
                                src={`/graphics/units/${unit.faction?.toLowerCase()}_${unit.type?.toLowerCase()}.png`}
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = "/graphics/units/placeholder.png";
                                }}
                                alt={unit.name}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{
                                    opacity: imageLoaded ? 1 : 0,
                                    scale: imageLoaded ? 1 : 0.95,
                                }}
                                transition={{ duration: 0.3 }}
                                onLoad={() => setImageLoaded(true)}
                            />
                        </div>
                    )}


                    <div className="statsBox">
                        <div className="statsRow">
                            <div className="stat"><FaHeart /> {unit.health}</div>
                            <div className="stat"><FaBolt /> {unit.minDamage} - {unit.maxDamage}</div>
                        </div>
                        <div className="statsRow">
                            <div className="stat"><FaShieldAlt /> {unit.defense}</div>
                            <div className="stat"><FaRunning /> {unit.movementPoints}</div>
                            <div className="stat"><FaCoins /> {unit.upkeep}</div>
                        </div>
                    </div>
                </div>

                {/* BACK */}
                <div className="cardFace cardBack">
                    <div className="skillsTitle">Skills</div>
                    <div className="skillsList">
                        {unit.skills && unit.skills.length > 0 ? (
                            unit.skills.map((skill, idx) => (
                                <span key={idx} className="skill">{skill}</span>
                            ))
                        ) : (
                            <span className="noSkills">No special skills</span>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>

    );

};
