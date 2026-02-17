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
import {renderDescriptionLine} from "@/lib/descriptionLine/descriptionLineRenderer";

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

    // Pre-filter so we don't even iterate Actions/CostModifiers etc.
    const visibleUnlocks = useMemo(
        () =>
            (hoveredTech.unlocks ?? []).filter((u) => {
                const k = keyOf(u.unlockKey);
                if (!k) return false;
                // Show only Constructible + (optional) Unit
                return isType(u, "Constructible") || isType(u, "Unit");
            }),
        [hoveredTech.unlocks]
    );

    const renderUnlockRef = (u: TechUnlockRef, index: number) => {
        const unlockKey = keyOf(u.unlockKey);
        if (!unlockKey) return null;

        // Constructible -> resolve to Improvement or District; if not resolvable, hide it.
        if (isType(u, "Constructible")) {
            // These MUST be keyed by improvementKey / districtKey in the provider.
            const imp = improvements.get(unlockKey);
            if (imp) {
                return (
                    <div key={index} style={{ display: "block" }}>
                        <span>Improvement: </span>
                        <span
                            className="hoverable-link"
                            onMouseEnter={(e) => {
                                setHoveredDistrict(null);
                                setHoveredImprovement(createHoveredImprovement(imp, e));
                            }}
                            onMouseLeave={() => setHoveredImprovement(null)}
                        >
              {imp.displayName ?? unlockKey}
            </span>
                    </div>
                );
            }

            const dist = districts.get(unlockKey);
            if (dist) {
                return (
                    <div key={index} style={{ display: "block" }}>
                        <span>District: </span>
                        <span
                            className="hoverable-link"
                            onMouseEnter={(e) => {
                                setHoveredImprovement(null);
                                setHoveredDistrict(createHoveredDistrict(dist, e));
                            }}
                            onMouseLeave={() => setHoveredDistrict(null)}
                        >
              {dist.displayName ?? unlockKey}
            </span>
                    </div>
                );
            }

            return null;
        }

        // Unit: legacy backend is name-based; best-effort resolve by NAME. If not resolved, hide.
        if (isType(u, "Unit")) {
            const faction = selectedFaction?.uiLabel?.toLowerCase() ?? "";
            const slugFromKey = unlockKey.toLowerCase().replace(/\s+/g, "_");

            const unit =
                units?.get(unlockKey) ??
                units?.get(unlockKey.replace(/_/g, " ")) ??
                null;

            if (!unit) return null;

            return (
                <div key={index} style={{ display: "block" }}>
                    <span>Unit: </span>
                    <span
                        className="hoverable-link unit-link"
                        onMouseEnter={(e) => setHoveredUnit(createHoveredUnit(unit, e))}
                        onMouseLeave={() => setHoveredUnit(null)}
                        onClick={() => window.open(`/units?faction=${faction}&unit=${slugFromKey}`, "_blank")}
                    >
            {unit.name}
          </span>
                </div>
            );
        }

        return null;
    };

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

            {visibleUnlocks.length > 0 && (
                <TooltipSection title="Unlocks:">{visibleUnlocks.map(renderUnlockRef)}</TooltipSection>
            )}

            {(hoveredTech.descriptionLines?.length ?? 0) > 0 && (
                <TooltipSection title="Effects:">
                    {hoveredTech.descriptionLines.map((line, i) => (
                        <div key={i}>{renderDescriptionLine(line)}</div>
                    ))}
                </TooltipSection>
            )}

            {hoveredImprovement && <ImprovementTooltip hoveredImprovement={hoveredImprovement} />}
            {hoveredDistrict && <DistrictTooltip hoveredDistrict={hoveredDistrict} />}
            {hoveredUnit && <UnitTooltip hoveredUnit={hoveredUnit} />}
        </BaseTooltip>
    );
};

export default TechTooltip;