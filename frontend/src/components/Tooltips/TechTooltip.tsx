import React, {useState} from "react";
import {District, Improvement, Tech, Unit} from "@/types/dataTypes";
import BaseTooltip from "./BaseTooltip";
import ImprovementTooltip from "./ImprovementTooltip";
import DistrictTooltip from "./DistrictTooltip";
import UnitTooltip from "@/components/Tooltips/UnitTooltip";
import TooltipSection from "./TooltipSection";
import {createHoveredDistrict, createHoveredImprovement, createHoveredUnit, HoveredWithCoords,} from "./hoverHelpers";
import {useGameData} from "@/context/GameDataContext";
import "./TechTooltip.css";

interface TechTooltipProps {
    hoveredTech: Tech & { coords: { xPct: number; yPct: number } };
    onMouseEnter: () => void;
    onMouseLeave: () => void;
}

// Reusable hovered state types
type HoveredImprovementState = HoveredWithCoords<Improvement> | null;
type HoveredDistrictState = HoveredWithCoords<District> | null;
type HoveredUnitState = HoveredWithCoords<Unit> | null;

const TechTooltip: React.FC<TechTooltipProps> = ({
                                                     hoveredTech,
                                                     onMouseEnter,
                                                     onMouseLeave,
                                                 }) => {
    const { districts, improvements, units, selectedFaction } = useGameData();

    const [hoveredImprovement, setHoveredImprovement] =
        useState<HoveredImprovementState>(null);
    const [hoveredDistrict, setHoveredDistrict] =
        useState<HoveredDistrictState>(null);
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

    const renderUnlockLine = (line: string, index: number) => {
        const impPrefix = "Improvement: ";
        const distPrefix = "District: ";
        const unitPrefix = "Unit Specialization: ";

        if (line.startsWith(impPrefix)) {
            const name = line.slice(impPrefix.length);
            const obj = improvements.get(name);
            if (!obj) return <div key={index}>{line}</div>;

            return (
                <div key={index} style={{ display: "block" }}>
                    <span>{impPrefix}</span>
                    <span
                        className="hoverable-link"
                        onMouseEnter={(e) =>
                            setHoveredImprovement(createHoveredImprovement(obj, e))
                        }
                        onMouseLeave={() => setHoveredImprovement(null)}
                    >
            {name}
          </span>
                </div>
            );
        }

        if (line.startsWith(distPrefix)) {
            const name = line.slice(distPrefix.length);
            const obj = districts.get(name);
            if (!obj) return <div key={index}>{line}</div>;

            return (
                <div key={index} style={{ display: "block" }}>
                    <span>{distPrefix}</span>
                    <span
                        className="hoverable-link"
                        onMouseEnter={(e) =>
                            setHoveredDistrict(createHoveredDistrict(obj, e))
                        }
                        onMouseLeave={() => setHoveredDistrict(null)}
                    >
            {name}
          </span>
                </div>
            );
        }

        if (line.startsWith(unitPrefix)) {
            const name = line.slice(unitPrefix.length);
            const obj = units?.get(name);
            if (!obj) return <div key={index}>{line}</div>;

            return (
                <div key={index} style={{ display: "block" }}>
                    <span>{unitPrefix}</span>
                    <span
                        className="hoverable-link unit-link"
                        onMouseEnter={(e) => setHoveredUnit(createHoveredUnit(obj, e))}
                        onMouseLeave={() => setHoveredUnit(null)}
                        onClick={() => {
                            const faction = selectedFaction?.uiLabel.toLowerCase();
                            const unit = obj.name.toLowerCase().replace(/\s+/g, "_");
                            window.open(`/units?faction=${faction}&unit=${unit}`, "_blank");
                        }}
                    >
        {name}
      </span>
                </div>
            );
        }


        return <div key={index}>{line}</div>;
    };

    return (
        <BaseTooltip
            coords={hoveredTech.coords}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            {/* Header + copy icon */}
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

            {hoveredTech.unlocks?.length > 0 && (
                <TooltipSection title="Unlocks:">
                    {hoveredTech.unlocks.map(renderUnlockLine)}
                </TooltipSection>
            )}

            {hoveredTech.effects?.length > 0 && (
                <TooltipSection title="Effects:">
                    {hoveredTech.effects.map((eff, i) => (
                        <div key={i}>{eff}</div>
                    ))}
                </TooltipSection>
            )}

            {/* Nested hover tooltips */}
            {hoveredImprovement && (
                <ImprovementTooltip hoveredImprovement={hoveredImprovement} />
            )}
            {hoveredDistrict && <DistrictTooltip hoveredDistrict={hoveredDistrict} />}
            {hoveredUnit && <UnitTooltip hoveredUnit={hoveredUnit} />}
        </BaseTooltip>
    );
};

export default TechTooltip;
