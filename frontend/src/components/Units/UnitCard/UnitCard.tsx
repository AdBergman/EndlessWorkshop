import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import "./UnitCard.css";

import { FaBolt, FaCoins, FaHeart, FaRunning, FaShieldAlt } from "react-icons/fa";

import { FactionIcon } from "./FactionIcon";
import { FACTION_COLORS, FACTION_GRADIENT } from "@/types/factionColors";
import type { Unit } from "@/types/dataTypes";
import { DEFAULT_UNIT_IMAGE } from "@/utils/assetHelpers";
import { deriveUnit } from "@/lib/units/deriveUnit";

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

    const d = useMemo(() => deriveUnit(unit), [unit]);

    const factionKey: keyof typeof FACTION_COLORS = d.isMinor
        ? "MINOR"
        : ((d.majorEnumFaction ?? "PLACEHOLDER") as any);

    const colors = FACTION_COLORS[factionKey] || FACTION_COLORS.PLACEHOLDER;
    const gradient = FACTION_GRADIENT[factionKey] || FACTION_GRADIENT.PLACEHOLDER;

    const onCardClick = () => {
        if (disableFlip) return;
        setFlipped((v) => !v);
    };

    return (
        <motion.div
            className="cardContainer"
            whileHover={{ scale: 1.06, y: -3 }}
            onClick={onCardClick}
        >
            <motion.div
                className="cardFlipWrapper"
                animate={{ rotateY: flipped ? 180 : 0, z: flipped ? 30 : 0 }}
                transition={{ duration: 0.55, ease: [0.45, 0.05, 0.55, 0.95] }}
                style={{ ["--card-border" as any]: colors.border }}
            >
                <div
                    className={`cardBorderAndGlow ${d.isMinor ? "minorBorderGlow" : ""}`}
                    style={{
                        border: `2px solid ${colors.border}`,
                        boxShadow: `0 5px 15px rgba(0,0,0,0.5), 0 0 10px ${colors.accent}55`,
                    }}
                />

                {/* FRONT */}
                <div className={`cardFace cardFront ${d.isMinor ? "minorCardFace" : ""}`}>
                    <div className={`header ${d.isMinor ? "minorHeader" : ""}`}>
                        <div className="nameBlock">
                            <div
                                className="name"
                                style={{
                                    background: gradient,
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                }}
                                title={d.displayName}
                            >
                                {d.displayName}
                            </div>

                            {d.isMinor && d.unit.faction?.trim() && (
                                <div className="minorFactionName" title={d.unit.faction.trim()}>
                                    {d.unit.faction.trim()}
                                </div>
                            )}
                        </div>

                        {!d.isMinor && d.majorEnumFaction && (
                            <div className="fortIcon" title={d.unit.faction ?? undefined}>
                                <FactionIcon faction={d.majorEnumFaction} />
                            </div>
                        )}
                    </div>

                    {d.typeLine && (
                        <div className="typeTier" style={{ color: colors.border }}>
                            <span className="type">{d.typeLine}</span>
                        </div>
                    )}

                    {showArtwork && (
                        <div className="artContainer">
                            {!d.imageUrl && <div className="artPlaceholder" />}

                            {d.imageUrl && (
                                <>
                                    {!imageLoaded && <div className="artPlaceholder" />}
                                    <motion.img
                                        src={d.imageUrl}
                                        alt={d.displayName}
                                        draggable={false}
                                        loading="lazy"
                                        onLoad={() => setImageLoaded(true)}
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = DEFAULT_UNIT_IMAGE;
                                        }}
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{
                                            opacity: imageLoaded ? 1 : 0,
                                            scale: imageLoaded ? 1 : 0.98,
                                        }}
                                        transition={{ duration: 0.2 }}
                                    />
                                </>
                            )}
                        </div>
                    )}

                    {/* Compact stats */}
                    <div className="statsBox">
                        <div className="statsRow">
                            <div className="stat">
                                <FaBolt /> {d.stats.damage ?? "—"}
                            </div>
                            <div className="stat">
                                <FaHeart /> {d.stats.health ?? "—"}
                            </div>
                            <div className="stat">
                                <FaShieldAlt /> {d.stats.defense ?? 0}
                            </div>
                        </div>

                        <div className="statsRow">
                            <div className="stat">
                                <FaRunning /> {d.stats.movement ?? "—"}
                            </div>
                            <div className="stat">
                                <FaCoins /> {d.stats.upkeep ?? 0}
                            </div>
                        </div>
                    </div>
                </div>

                {/* BACK (temporary placeholder) */}
                <div className="cardFace cardBack">
                    <div className="backPlaceholder">Skills coming soon</div>
                </div>
            </motion.div>
        </motion.div>
    );
};