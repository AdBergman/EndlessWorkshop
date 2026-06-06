import React, { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import "./UnitCard.css";

import { FACTION_COLORS } from "@/types/factionColors";
import type { Codex, Unit } from "@/types/dataTypes";
import { DEFAULT_UNIT_IMAGE } from "@/utils/assetHelpers";
import { deriveUnit } from "@/lib/units/deriveUnit";
import { useCodex } from "@/hooks/useCodex";
import SkillTooltip, { HoveredSkill } from "../../Tooltips/SkillTooltip";
import { getAbilityIconPath } from "@/features/icons/abilityIconResolver";
import { IconImg } from "@/features/icons/IconImg";
import { getFactionIconPath } from "@/features/icons/factionIconResolver";
import { getUnitClassIcons, type UnitClassIcon } from "@/features/icons/unitClassIconResolver";
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

function getTierRankLabel(tierLabel: string | null): string | null {
    if (!tierLabel) return null;
    const match = tierLabel.match(/(\d+|[IVXLCDM]+)$/i);
    if (!match) return tierLabel.replace(/^Tier\s+/i, "");

    const value = match[1].toUpperCase();
    const numberToRoman: Record<string, string> = {
        "1": "I",
        "2": "II",
        "3": "III",
        "4": "IV",
        "5": "V",
        "6": "VI",
        "7": "VII",
        "8": "VIII",
        "9": "IX",
        "10": "X",
    };

    return numberToRoman[value] ?? value;
}

function getTierRankNumberLabel(tierRankLabel: string | null): string | null {
    if (!tierRankLabel) return null;

    const romanToNumber: Record<string, number> = {
        I: 1,
        II: 2,
        III: 3,
        IV: 4,
        V: 5,
        VI: 6,
        VII: 7,
        VIII: 8,
        IX: 9,
        X: 10,
    };

    const parsed = Number(tierRankLabel) || romanToNumber[tierRankLabel.toUpperCase()] || 0;
    return parsed > 0 ? String(parsed) : tierRankLabel;
}

function getTooltipCoordsFromElement(element: HTMLElement): { x: number; y: number; mode: "pixel" } {
    const rect = element.getBoundingClientRect();
    return { x: rect.right + 10, y: rect.top + rect.height / 2, mode: "pixel" };
}

function buildClassFallbackCodex(icon: UnitClassIcon): Codex {
    const fallbackLines = icon.fallbackDescriptionLines.length > 0
        ? icon.fallbackDescriptionLines
        : [`${icon.label} unit class.`];

    return {
        exportKind: "abilities",
        entryKey: icon.bonusAbilityKey ?? `UnitClass_${icon.classKey}`,
        displayName: icon.label,
        kind: "Ability",
        category: null,
        descriptionLines: fallbackLines,
        referenceKeys: icon.bonusAbilityKey ? [icon.bonusAbilityKey] : [],
    };
}

function buildTierTooltipCodex(tierLabel: string, tierRankLabel: string): Codex {
    return {
        exportKind: "units",
        entryKey: `UnitTier_${tierRankLabel}`,
        displayName: tierLabel,
        kind: "Unit Tier",
        category: null,
        descriptionLines: ["Evolution tier."],
        referenceKeys: [],
    };
}

function TierRankSeal({ label }: { label: string }) {
    return (
        <svg
            className="tierRankSvg"
            viewBox="0 0 36 36"
            aria-hidden="true"
            focusable="false"
        >
            <path
                className="tierRankSealGlow"
                d="M18 1.8 23.3 4 29 3.8 32.2 8.7 34.2 14 32.5 19.5 32.2 25.3 27.3 28.5 23.3 32 18 34.2 12.7 32 7.2 32.2 3.8 27.3 1.8 22 3.5 16.5 3.8 10.7 8.7 7.5 12.7 4z"
            />
            <path
                className="tierRankSealOuter"
                d="M18 2.8 22.7 5 28 5 31 9.5 33 14.2 31.4 19.2 31 24.5 26.5 27.5 22.7 31 18 33.2 13.3 31 8 31 5 26.5 3 21.8 4.6 16.8 5 11.5 9.5 8.5 13.3 5z"
            />
            <circle className="tierRankSealRim" cx="18" cy="18" r="12.2" />
            <circle className="tierRankSealCore" cx="18" cy="18" r="9.1" />
            <path
                className="tierRankSealShine"
                d="M9.7 15.2c1.8-5.1 6.8-8 12.1-6.8 2 .4 3.7 1.4 5 2.8-2.7-1.4-6.1-1.8-9.6-.8-3.3.9-5.9 2.7-7.5 4.8Z"
            />
            <text
                className="tierRankNumber"
                x="18"
                y="22.4"
                textAnchor="middle"
            >
                {label}
            </text>
        </svg>
    );
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
    const tierRankLabel = getTierRankLabel(d.tierLabel);
    const tierRankNumberLabel = getTierRankNumberLabel(tierRankLabel);
    const hasClassMetadata = classIcons.length > 0;

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

    const showTooltip = (data: Codex, coords: { x: number; y: number; mode: "pixel" }) => {
        if (clearTimerRef.current) window.clearTimeout(clearTimerRef.current);

        setHoveredSkill({
            data,
            coords,
        });
    };

    const handleClassIconEnter = (e: React.MouseEvent<HTMLElement>, icon: UnitClassIcon) => {
        const codex = icon.bonusAbilityKey
            ? getVisibleEntry("abilities", icon.bonusAbilityKey)
            : undefined;

        showTooltip(
            codex ?? buildClassFallbackCodex(icon),
            { x: e.clientX + 12, y: e.clientY, mode: "pixel" }
        );
    };

    const handleClassIconFocus = (e: React.FocusEvent<HTMLElement>, icon: UnitClassIcon) => {
        const codex = icon.bonusAbilityKey
            ? getVisibleEntry("abilities", icon.bonusAbilityKey)
            : undefined;

        showTooltip(codex ?? buildClassFallbackCodex(icon), getTooltipCoordsFromElement(e.currentTarget));
    };

    const handleTierEnter = (e: React.MouseEvent<HTMLElement>) => {
        if (!d.tierLabel || !tierRankLabel) return;
        showTooltip(
            buildTierTooltipCodex(d.tierLabel, tierRankLabel),
            { x: e.clientX + 12, y: e.clientY, mode: "pixel" }
        );
    };

    const handleTierFocus = (e: React.FocusEvent<HTMLElement>) => {
        if (!d.tierLabel || !tierRankLabel) return;
        showTooltip(
            buildTierTooltipCodex(d.tierLabel, tierRankLabel),
            getTooltipCoordsFromElement(e.currentTarget)
        );
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
                        </div>
                    </div>

                    {showArtwork && (
                        <div
                            className="artContainer"
                            style={{
                                ["--unit-art-accent" as any]: factionIconColor,
                            }}
                        >
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

                            {hasClassMetadata && (
                                <div
                                    className="unitArtIdentityPlate"
                                    aria-label={d.classLabel ?? undefined}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="unitClassIconGroup">
                                        {classIcons.map((icon) => (
                                            <button
                                                key={icon.path}
                                                type="button"
                                                className="unitClassIconButton"
                                                aria-label={`${icon.label}${icon.bonusTargetLabel ? `: bonus vs ${icon.bonusTargetLabel}` : ""}`}
                                                onMouseEnter={(e) => handleClassIconEnter(e, icon)}
                                                onMouseMove={handleSkillMove}
                                                onMouseLeave={clearHoverSoon}
                                                onFocus={(e) => handleClassIconFocus(e, icon)}
                                                onBlur={clearHoverSoon}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <img
                                                    src={icon.path}
                                                    alt=""
                                                    aria-hidden="true"
                                                    draggable={false}
                                                    className="unitClassIcon"
                                                />
                                            </button>
                                        ))}
                                    </div>

                                </div>
                            )}

                            {tierRankLabel && tierRankNumberLabel && (
                                <button
                                    type="button"
                                    className="tierRankBadge unitArtTierSeal"
                                    aria-label={d.tierLabel ?? tierRankLabel}
                                    data-tier-rank={tierRankLabel}
                                    onMouseEnter={handleTierEnter}
                                    onMouseMove={handleSkillMove}
                                    onMouseLeave={clearHoverSoon}
                                    onFocus={handleTierFocus}
                                    onBlur={clearHoverSoon}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <TierRankSeal label={tierRankNumberLabel} />
                                </button>
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
                                        className={`skill ${iconPath ? "" : "skillNoIcon"}`}
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
