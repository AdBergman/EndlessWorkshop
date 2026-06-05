import React, { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import "./UnitCard.css";

import { FACTION_COLORS } from "@/types/factionColors";
import type { Unit } from "@/types/dataTypes";
import { DEFAULT_UNIT_IMAGE } from "@/utils/assetHelpers";
import { deriveUnit } from "@/lib/units/deriveUnit";
import { useCodex } from "@/hooks/useCodex";
import SkillTooltip, { HoveredSkill } from "../../Tooltips/SkillTooltip";
import { getAbilityIconPath } from "@/features/icons/abilityIconResolver";
import { IconImg } from "@/features/icons/IconImg";
import { getFactionIconPath } from "@/features/icons/factionIconResolver";
import { getUnitClassIcons } from "@/features/icons/unitClassIconResolver";
import { getUnitCardStatIconPath, type UnitCardStat } from "@/features/icons/unitStatIcons";

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

function StatValue({ stat, label, value }: { stat: UnitCardStat; label: string; value: number | string }) {
    const iconPath = getUnitCardStatIconPath(stat);

    return (
        <div className="stat" title={label}>
            {iconPath ? (
                <IconImg
                    path={iconPath}
                    title={label}
                    className="statIcon"
                    size={16}
                    decorative
                />
            ) : null}
            <span>{value}</span>
        </div>
    );
}

function getCompactTierLabel(tierLabel: string | null): string | null {
    if (!tierLabel) return null;
    const match = tierLabel.match(/(\d+|[IVXLCDM]+)$/i);
    if (!match) return tierLabel.replace(/^Tier\s+/i, "T");

    const value = match[1].toUpperCase();
    const romanToNumber: Record<string, string> = {
        I: "1",
        II: "2",
        III: "3",
        IV: "4",
        V: "5",
        VI: "6",
        VII: "7",
        VIII: "8",
        IX: "9",
        X: "10",
    };

    return `T${romanToNumber[value] ?? value}`;
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
    const factionIconSource = d.unit.faction?.trim() || (!d.isMinor ? d.majorEnumFaction : null);
    const factionIconPath = factionIconSource
        ? getFactionIconPath(factionIconSource)
        : null;
    const factionIconColor = d.isMinor
        ? "var(--unit-card-minor-accent, var(--ew-accent, #ff7f32))"
        : colors.border;
    const classIcons = useMemo(
        () => getUnitClassIcons(d.classKey, d.classLabel),
        [d.classKey, d.classLabel]
    );
    const compactTierLabel = getCompactTierLabel(d.tierLabel);
    const hasIdentityMetadata = classIcons.length > 0 || !!compactTierLabel;

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
                return { key: k, codex, iconPath: getAbilityIconPath(k) };
            })
            .filter((x): x is { key: string; codex: any; iconPath: string | null } => !!x);
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
            whileHover={{ scale: 1.04, y: -2 }}
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
                        border: `1px solid ${colors.border}`,
                        boxShadow: `0 12px 28px rgba(0,0,0,0.42), 0 0 8px ${colors.accent}33`,
                    }}
                />

                {/* FRONT */}
                <div className={`cardFace cardFront ${d.isMinor ? "minorCardFace" : ""}`}>
                    <div className={`header ${d.isMinor ? "minorHeader" : ""} ${factionIconPath ? "headerWithIcon" : ""}`}>
                        <div className="nameBlock">
                            <div
                                className="name"
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

                        <div
                            className="unitIdentityStack"
                            aria-label={d.typeLine ?? undefined}
                            style={{
                                ["--unit-identity-color" as any]: factionIconColor,
                            }}
                        >
                            {factionIconPath && (
                                <span
                                    className={`factionIcon ${d.isMinor ? "minorFactionIcon" : ""}`}
                                    aria-hidden="true"
                                    style={{
                                        ["--faction-icon-path" as any]: `url("${factionIconPath}")`,
                                        ["--faction-icon-color" as any]: factionIconColor,
                                    }}
                                />
                            )}

                            {hasIdentityMetadata && (
                                <span className="unitTypeTierCluster">
                                    {classIcons.map((icon) => (
                                        <span
                                            key={icon.path}
                                            className="unitClassIconSlot"
                                            aria-label={icon.label}
                                            data-tooltip={icon.label}
                                        >
                                            <span
                                                className="unitClassIcon"
                                                aria-hidden="true"
                                                style={{
                                                    ["--unit-class-icon-path" as any]: `url("${icon.path}")`,
                                                }}
                                            />
                                        </span>
                                    ))}
                                    {compactTierLabel && (
                                        <span
                                            className="tierBadge"
                                            aria-label={d.tierLabel ?? compactTierLabel}
                                            data-tooltip={d.tierLabel ?? compactTierLabel}
                                        >
                                            {compactTierLabel}
                                        </span>
                                    )}
                                </span>
                            )}
                        </div>
                    </div>

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
                                        loading="eager"
                                        onLoad={() => setImageLoaded(true)}
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = DEFAULT_UNIT_IMAGE;
                                        }}
                                        initial={{ opacity: 1, scale: 0.98 }}
                                        animate={{
                                            opacity: 1,
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
                            <StatValue stat="damage" label="Damage" value={d.stats.damage ?? "—"} />
                            <StatValue stat="health" label="Health" value={d.stats.health ?? "—"} />
                            <StatValue stat="defense" label="Defense" value={d.stats.defense ?? 0} />
                        </div>

                        <div className="statsRow">
                            <StatValue stat="movement" label="Movement" value={d.stats.movement ?? "—"} />
                            <StatValue stat="focus" label="Focus / Critical Chance" value={d.stats.focus ?? 0} />
                            <StatValue stat="upkeep" label="Upkeep" value={d.stats.upkeep ?? 0} />
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
                            }}
                            title={d.displayName}
                        >
                            {d.displayName}
                        </div>

                        {visibleSkills.length === 0 ? (
                            <div className="noSkills">No abilities</div>
                        ) : (
                            <div className="skillsList">
                                {visibleSkills.map(({ key, codex, iconPath }) => (
                                    <div
                                        key={key}
                                        className="skill"
                                        onMouseEnter={(e) => handleSkillEnter(e, key)}
                                        onMouseMove={handleSkillMove}
                                        onMouseLeave={clearHoverSoon}
                                    >
                                        {iconPath ? (
                                            <IconImg
                                                path={iconPath}
                                                title={codex.displayName}
                                                className="skillIcon"
                                                size={20}
                                                decorative
                                            />
                                        ) : null}
                                        <span className="skillLabel">{codex.displayName}</span>
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
