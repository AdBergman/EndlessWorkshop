import React, { useMemo, useState } from "react";
import { District, Improvement, Tech, Unit, TechUnlockRef } from "@/types/dataTypes";
import BaseTooltip from "./BaseTooltip";
import ImprovementTooltip from "./ImprovementTooltip";
import DistrictTooltip from "./DistrictTooltip";
import UnitTooltip from "@/components/Tooltips/UnitTooltip";
import TooltipSection from "./TooltipSection";
import {
    createHoveredDistrict,
    createHoveredImprovement,
    createHoveredUnit,
    HoveredWithCoords,
} from "./hoverHelpers";
import { useGameData } from "@/context/GameDataContext";
import "./TechTooltip.css";

interface TechTooltipProps {
    hoveredTech: Tech;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
}

type HoveredImprovementState = HoveredWithCoords<Improvement> | null;
type HoveredDistrictState = HoveredWithCoords<District> | null;
type HoveredUnitState = HoveredWithCoords<Unit> | null;

const isType = (u: TechUnlockRef, t: string) =>
    (u.unlockType ?? "").trim().toUpperCase() === t.trim().toUpperCase();

const keyOf = (v: unknown) => (typeof v === "string" ? v.trim() : "");

const TechTooltip: React.FC<TechTooltipProps> = ({ hoveredTech, onMouseEnter, onMouseLeave }) => {
    const { districts, improvements, units, selectedFaction } = useGameData();

    const [hoveredImprovement, setHoveredImprovement] = useState<HoveredImprovementState>(null);
    const [hoveredDistrict, setHoveredDistrict] = useState<HoveredDistrictState>(null);
    const [hoveredUnit, setHoveredUnit] = useState<HoveredUnitState>(null);
    const [copied, setCopied] = useState(false);

    const handleCopyLink = () => {
        if (!selectedFaction) return;
        const faction = selectedFaction.uiLabel.toLowerCase();
        const tech = hoveredTech.name.toLowerCase().replace(/\s+/g, "_");
        const link = `${window.location.origin}/tech?faction=${faction}&tech=${tech}`;
        navigator.clipboard.writeText(link).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        });
    };

    /**
     * Build a fast lookup from unlockKey -> constructible object.
     * This is the *correct join* for TechUnlockRef.unlockKey, and it’s computed once per data refresh.
     *
     * We intentionally only index:
     * - improvementKey/districtKey (primary IDs)
     * - constructibleKey (if present on DTO)
     *
     * We do NOT index by display name here (units are the only legacy exception elsewhere).
     */
    const improvementByUnlockKey = useMemo(() => {
        const m = new Map<string, Improvement>();

        for (const imp of improvements.values()) {
            const k1 = keyOf((imp as any).improvementKey);
            if (k1) m.set(k1, imp);

            const k2 = keyOf((imp as any).constructibleKey);
            if (k2) m.set(k2, imp);
        }

        return m;
    }, [improvements]);

    const districtByUnlockKey = useMemo(() => {
        const m = new Map<string, District>();

        for (const dist of districts.values()) {
            const k1 = keyOf((dist as any).districtKey);
            if (k1) m.set(k1, dist);

            const k2 = keyOf((dist as any).constructibleKey);
            if (k2) m.set(k2, dist);
        }

        return m;
    }, [districts]);

    const renderUnlockRef = (u: TechUnlockRef, index: number) => {
        // 2) show ONLY constructible in this tooltip
        if (!isType(u, "Constructible")) return null;

        const unlockKey = keyOf(u.unlockKey);
        if (!unlockKey) return null;

        // Resolve object (improvement first, then district)
        const imp = improvementByUnlockKey.get(unlockKey);
        if (imp) {
            return (
                <div key={index} style={{ display: "block" }}>
                    <span>Constructible: </span>
                    <span
                        className="hoverable-link"
                        onMouseEnter={(e) => {
                            setHoveredDistrict(null);
                            setHoveredImprovement(createHoveredImprovement(imp, e));
                        }}
                        onMouseLeave={() => setHoveredImprovement(null)}
                    >
                        {/* 1) show NAME, never the key */}
                        {imp.displayName}
                    </span>
                </div>
            );
        }

        const dist = districtByUnlockKey.get(unlockKey);
        if (dist) {
            return (
                <div key={index} style={{ display: "block" }}>
                    <span>Constructible: </span>
                    <span
                        className="hoverable-link"
                        onMouseEnter={(e) => {
                            setHoveredImprovement(null);
                            setHoveredDistrict(createHoveredDistrict(dist, e));
                        }}
                        onMouseLeave={() => setHoveredDistrict(null)}
                    >
                        {/* 1) show NAME, never the key */}
                        {dist.displayName}
                    </span>
                </div>
            );
        }

        // If we can’t resolve, still show something (but keep it obvious it’s unresolved)
        return (
            <div key={index} style={{ display: "block", opacity: 0.9 }}>
                <span>Constructible: </span>
                <span className="hoverable-link" style={{ textDecoration: "none", cursor: "default" }}>
                    {unlockKey}
                </span>
            </div>
        );
    };

    // Optional: pre-filter unlocks so we don’t even iterate over Actions etc.
    const constructibleUnlocks = useMemo(
        () => (hoveredTech.unlocks ?? []).filter((u) => isType(u, "Constructible") && keyOf(u.unlockKey)),
        [hoveredTech.unlocks]
    );

    return (
        <BaseTooltip coords={hoveredTech.coords} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
            <div className="techTooltipHeader">
                <span className="techTooltipName">{hoveredTech.name}</span>
                <button
                    className={`copyInlineButton ${copied ? "copied" : ""}`}
                    title={copied ? "Copied!" : "Copy link"}
                    onClick={handleCopyLink}
                >
                    ⧉
                </button>
            </div>

            {constructibleUnlocks.length > 0 && (
                <TooltipSection title="Unlocks:">
                    {constructibleUnlocks.map(renderUnlockRef)}
                </TooltipSection>
            )}

            {(hoveredTech.descriptionLines?.length ?? 0) > 0 && (
                <TooltipSection title="Effects:">
                    {hoveredTech.descriptionLines.map((line, i) => (
                        <div key={i}>{line}</div>
                    ))}
                </TooltipSection>
            )}

            {/* Nested hover tooltips */}
            {hoveredImprovement && <ImprovementTooltip hoveredImprovement={hoveredImprovement} />}
            {hoveredDistrict && <DistrictTooltip hoveredDistrict={hoveredDistrict} />}
            {hoveredUnit && <UnitTooltip hoveredUnit={hoveredUnit} />}
        </BaseTooltip>
    );
};

export default TechTooltip;