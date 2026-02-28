import React, { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import "./UnitCard.css";

import { FaBolt, FaCoins, FaHeart, FaRunning, FaShieldAlt } from "react-icons/fa";

import { FactionIcon } from "./FactionIcon";
import { FACTION_COLORS, FACTION_GRADIENT } from "@/types/factionColors";
import type { Unit } from "@/types/dataTypes";
import { DEFAULT_UNIT_IMAGE } from "@/utils/assetHelpers";
import { deriveUnit } from "@/lib/units/deriveUnit";
import { useCodex } from "@/hooks/useCodex";
import SkillTooltip, { HoveredSkill } from "../../Tooltips/SkillTooltip";

interface UnitCardProps {
    unit: Unit;
    showArtwork?: boolean;
    disableFlip?: boolean;
}

function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
}

// Small heuristic: keep the back title readable as skill count / name length increases.
function computeBackNameFontSizeRem(name: string, skillCount: number): number {
    const len = (name ?? "").trim().length;

    let size = 1.15; // baseline (rem)

    if (len > 18) size -= 0.08;
    if (len > 26) size -= 0.10;
    if (len > 34) size -= 0.12;

    // If many skills, steal a bit of vertical space back
    if (skillCount > 6) size -= (skillCount - 6) * 0.02;

    return clamp(size, 0.85, 1.15);
}

export const UnitCard: React.FC<UnitCardProps> = ({
                                                      unit,
                                                      showArtwork = true,
                                                      disableFlip = false,
                                                  }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [flipped, setFlipped] = useState(false);

    const { getVisibleEntry } = useCodex();

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

    // Resolve visible skills once per render
    const visibleSkills = useMemo(() => {
        const keys = unit.abilityKeys ?? [];
        return keys
            .map((k) => {
                const codex = getVisibleEntry("abilities", k);
                if (!codex) return null;
                return { key: k, codex };
            })
            .filter((x): x is { key: string; codex: any } => !!x);
    }, [unit.abilityKeys, getVisibleEntry]);

    // Tooltip hover handling (sticky)
    const [hoveredSkill, setHoveredSkill] = useState<HoveredSkill | null>(null);
    const hoveringTooltipRef = useRef(false);
    const clearTimerRef = useRef<number | null>(null);

    const clearHoverSoon = () => {
        if (clearTimerRef.current) window.clearTimeout(clearTimerRef.current);
        clearTimerRef.current = window.setTimeout(() => {
            if (!hoveringTooltipRef.current) setHoveredSkill(null);
        }, 60);
    };

    const handleSkillEnter = (e: React.MouseEvent, abilityKey: string) => {
        const codex = getVisibleEntry("abilities", abilityKey);
        if (!codex) return;

        if (clearTimerRef.current) window.clearTimeout(clearTimerRef.current);

        setHoveredSkill({
            data: codex,
            coords: { x: e.clientX + 12, y: e.clientY, mode: "pixel" },
        });
    };

    const handleSkillMove = (e: React.MouseEvent) => {
        setHoveredSkill((prev) =>
            prev
                ? { ...prev, coords: { x: e.clientX + 12, y: e.clientY, mode: "pixel" } }
                : prev
        );
    };

    const onTooltipEnter = () => {
        hoveringTooltipRef.current = true;
        if (clearTimerRef.current) window.clearTimeout(clearTimerRef.current);
    };

    const onTooltipLeave = () => {
        hoveringTooltipRef.current = false;
        clearHoverSoon();
    };

    const backNameSize = computeBackNameFontSizeRem(d.displayName, visibleSkills.length);

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

                {/* BACK: Abilities */}
                <div className="cardFace cardBack">
                    <div className="cardBackContent">
                        <div
                            className="backName"
                            style={{
                                fontSize: `${backNameSize}rem`,
                                background: gradient,
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                            }}
                            title={d.displayName}
                        >
                            {d.displayName}
                        </div>

                        {visibleSkills.length === 0 ? (
                            <div className="noSkills">No abilities</div>
                        ) : (
                            <div className="skillsList">
                                {visibleSkills.map(({ key, codex }) => (
                                    <div
                                        key={key}
                                        className="skill"
                                        onMouseEnter={(e) => handleSkillEnter(e, key)}
                                        onMouseMove={handleSkillMove}
                                        onMouseLeave={clearHoverSoon}
                                    >
                                        {codex.displayName}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {hoveredSkill && (
                <SkillTooltip
                    hoveredSkill={hoveredSkill}
                    onMouseEnter={onTooltipEnter}
                    onMouseLeave={onTooltipLeave}
                />
            )}
        </motion.div>
    );
};