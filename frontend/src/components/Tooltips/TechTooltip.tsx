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
import { renderDescriptionLine } from "@/lib/descriptionLine/descriptionLineRenderer";
import { selectDistrictsByKey, useDistrictStore } from "@/stores/districtStore";
import { selectImprovementsByKey, useImprovementStore } from "@/stores/improvementStore";
import { resolveConstructibleUnlock } from "@/utils/unlocks";

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
    const { units, selectedFaction } = useGameData();
    const districtsByKey = useDistrictStore(selectDistrictsByKey);
    const improvementsByKey = useImprovementStore(selectImprovementsByKey);

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

    const visibleUnlocks = useMemo(
        () =>
            (hoveredTech.unlocks ?? []).filter((u) => {
                const k = keyOf(u.unlockKey);
                if (!k) return false;
                return isType(u, "Constructible") || isType(u, "Unit");
            }),
        [hoveredTech.unlocks]
    );

    const renderUnlockRef = (u: TechUnlockRef, index: number) => {
        const unlockKey = keyOf(u.unlockKey);
        if (!unlockKey) return null;

        if (isType(u, "Constructible") || isType(u, "Unit")) {
            const resolved = resolveConstructibleUnlock(u, {
                districtsByKey,
                improvementsByKey,
                units,
            });
            if (!resolved) return null;

            if (resolved.kind === "Unit") {
                const faction = selectedFaction?.uiLabel?.toLowerCase() ?? "";
                const unitParam = encodeURIComponent(unlockKey);

                return (
                    <div key={index} style={{ display: "block" }}>
                        <span>Unit: </span>
                        <span
                            className="hoverable-link unit-link"
                            onMouseEnter={(e) => setHoveredUnit(createHoveredUnit(resolved.unit, e))}
                            onMouseLeave={() => setHoveredUnit(null)}
                            onClick={() => window.open(`/units?faction=${faction}&unit=${unitParam}`, "_blank")}
                        >
                            {resolved.displayName}
                        </span>
                    </div>
                );
            }

            if (resolved.kind === "Improvement") {
                return (
                    <div key={index} style={{ display: "block" }}>
                        <span>Improvement: </span>
                        <span
                            className="hoverable-link"
                            onMouseEnter={(e) => {
                                setHoveredDistrict(null);
                                setHoveredImprovement(createHoveredImprovement(resolved.improvement, e));
                            }}
                            onMouseLeave={() => setHoveredImprovement(null)}
                        >
                            {resolved.displayName}
                        </span>
                    </div>
                );
            }

            if (resolved.kind === "District") {
                return (
                    <div key={index} style={{ display: "block" }}>
                        <span>District: </span>
                        <span
                            className="hoverable-link"
                            onMouseEnter={(e) => {
                                setHoveredImprovement(null);
                                setHoveredDistrict(createHoveredDistrict(resolved.district, e));
                            }}
                            onMouseLeave={() => setHoveredDistrict(null)}
                        >
                            {resolved.displayName}
                        </span>
                    </div>
                );
            }
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
