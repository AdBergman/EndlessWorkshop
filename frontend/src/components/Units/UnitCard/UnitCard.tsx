import React, { useState } from "react";
import { motion } from "framer-motion";
import "./UnitCard.css";
import { FaBolt, FaHeart, FaRunning, FaShieldAlt, FaCoins } from "react-icons/fa";
import { FactionIcon } from "./FactionIcon";
import { FACTION_COLORS, FACTION_GRADIENT } from "@/types/factionColors";
import { Unit, Faction } from "@/types/dataTypes";
import { DEFAULT_UNIT_IMAGE, getUnitImageUrl } from "@/utils/assetHelpers";
import { identifyFaction } from "@/utils/factionIdentity";

interface UnitCardProps {
    unit: Unit;
    showArtwork?: boolean;
    disableFlip?: boolean;
}

export const UnitCard: React.FC<UnitCardProps> = ({
                                                      unit,
                                                      showArtwork = true,
                                                      disableFlip = false,
                                                  }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [flipped, setFlipped] = useState(false);

    const factionInfo = identifyFaction(unit);
    const isMinor = unit.minorFaction || (!factionInfo.isMajor && factionInfo.enumFaction === "MINOR");

    const factionKey = isMinor
        ? "MINOR"
        : ((factionInfo.enumFaction as Faction)?.toUpperCase() as keyof typeof FACTION_COLORS);

    const colors = FACTION_COLORS[factionKey] || FACTION_COLORS.PLACEHOLDER;
    const gradient = FACTION_GRADIENT[factionKey] || FACTION_GRADIENT.PLACEHOLDER;

    const imageUrl = getUnitImageUrl(unit);

    const formatMinorName = (name?: string) => {
        if (!name) return "";
        return name
            .toLowerCase()
            .split(" ")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");
    };

    return (
        <motion.div
            className="cardContainer"
            whileHover={{ scale: 1.1, y: -4 }}
            onClick={() => !disableFlip && setFlipped(!flipped)}
        >
            <motion.div
                className="cardFlipWrapper"
                animate={{ rotateY: flipped ? 180 : 0, z: flipped ? 30 : 0 }}
                transition={{ duration: 0.55, ease: [0.45, 0.05, 0.55, 0.95] }}
                style={{ ["--card-border" as any]: colors.border }}
            >
                {/* Border + ambient glow */}
                <div
                    className={`cardBorderAndGlow ${isMinor ? "minorBorderGlow" : ""}`}
                    style={{
                        border: `2px solid ${colors.border}`,
                        boxShadow: `0 5px 15px rgba(0,0,0,0.5), 0 0 10px ${colors.accent}55`,
                    }}
                />

                {/* FRONT */}
                <div className={`cardFace cardFront ${isMinor ? "minorCardFace" : ""}`}>
                    <div className="header">
                        <div className="nameBlock">
                            <div
                                className="name"
                                style={{
                                    background: gradient,
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                }}
                            >
                                {unit.name}
                            </div>

                            {isMinor && (
                                <div className="minorFactionName">
                                    {formatMinorName(factionInfo.uiLabel || unit.faction)}
                                </div>
                            )}
                        </div>

                        {!isMinor && factionInfo.isMajor && (
                            <div className="fortIcon">
                                <FactionIcon faction={factionInfo.enumFaction as Faction} />
                            </div>
                        )}
                    </div>

                    <div className="typeTier" style={{ color: colors.border }}>
                        <span className="type">{unit.type}</span>
                        <span className="tierBadge">Tier {unit.tier}</span>
                    </div>

                    {/* === ART === */}
                    {showArtwork && (
                        <div className="artContainer">
                            {!imageLoaded && <div className="artPlaceholder" />}

                            <motion.img
                                src={imageUrl}
                                alt={unit.name}
                                draggable={false}
                                onError={(e) => {
                                    console.warn(
                                        `⚠️ Missing art for ${isMinor ? "minor" : "major"} faction unit: ${unit.name}`
                                    );
                                    (e.target as HTMLImageElement).src = DEFAULT_UNIT_IMAGE;
                                }}
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

                    {/* === STATS === */}
                    <div className="statsBox">
                        <div className="statsRow">
                            <div className="stat">
                                <FaHeart /> {unit.health}
                            </div>
                            <div className="stat">
                                <FaBolt /> {unit.minDamage} - {unit.maxDamage}
                            </div>
                        </div>
                        <div className="statsRow">
                            <div className="stat">
                                <FaShieldAlt /> {unit.defense}
                            </div>
                            <div className="stat">
                                <FaRunning /> {unit.movementPoints}
                            </div>
                            <div className="stat">
                                <FaCoins /> {unit.upkeep}
                            </div>
                        </div>
                    </div>
                </div>

                {/* BACK */}
                <div className="cardFace cardBack">
                    <div className="skillsTitle">Skills</div>
                    <div className="skillsList">
                        {unit.skills?.length ? (
                            unit.skills.map((skill, idx) => (
                                <span key={idx} className="skill">
                                    {skill}
                                </span>
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
