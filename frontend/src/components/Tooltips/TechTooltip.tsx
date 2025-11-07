import React, { useState } from "react";
import { Tech, Improvement, District } from "@/types/dataTypes";
import BaseTooltip from "./BaseTooltip";
import ImprovementTooltip from "./ImprovementTooltip";
import DistrictTooltip from "./DistrictTooltip";
import TooltipSection from "./TooltipSection";
import {
    createHoveredImprovement,
    createHoveredDistrict,
    HoveredWithCoords,
} from "./hoverHelpers";
import { useGameData } from "@/context/GameDataContext";
import "./TechTooltip.css";

interface TechTooltipProps {
    hoveredTech: Tech & { coords: { xPct: number; yPct: number } };
    onMouseEnter: () => void;
    onMouseLeave: () => void;
}

type HoveredImprovementState = HoveredWithCoords<Improvement> | null;
type HoveredDistrictState = HoveredWithCoords<District> | null;

const TechTooltip: React.FC<TechTooltipProps> = ({
                                                     hoveredTech,
                                                     onMouseEnter,
                                                     onMouseLeave,
                                                 }) => {
    const { districts, improvements, selectedFaction } = useGameData();
    const [hoveredImprovement, setHoveredImprovement] =
        useState<HoveredImprovementState>(null);
    const [hoveredDistrict, setHoveredDistrict] =
        useState<HoveredDistrictState>(null);
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

        if (line.startsWith(impPrefix)) {
            const impName = line.slice(impPrefix.length);
            const impObj = improvements.get(impName);
            if (!impObj) return <div key={index}>{line}</div>;

            return (
                <div key={index} style={{ display: "block" }}>
                    <span>{impPrefix}</span>
                    <span
                        className="hoverable-link"
                        onMouseEnter={(e) =>
                            setHoveredImprovement(createHoveredImprovement(impObj, e))
                        }
                        onMouseLeave={() => setHoveredImprovement(null)}
                    >
            {impName}
          </span>
                </div>
            );
        }

        if (line.startsWith(distPrefix)) {
            const distName = line.slice(distPrefix.length);
            const distObj = districts.get(distName);
            if (!distObj) return <div key={index}>{line}</div>;

            return (
                <div key={index} style={{ display: "block" }}>
                    <span>{distPrefix}</span>
                    <span
                        className="hoverable-link"
                        onMouseEnter={(e) =>
                            setHoveredDistrict(createHoveredDistrict(distObj, e))
                        }
                        onMouseLeave={() => setHoveredDistrict(null)}
                    >
            {distName}
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
            {/* Title row with inline copy icon */}
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

            {hoveredImprovement && (
                <ImprovementTooltip hoveredImprovement={hoveredImprovement} />
            )}
            {hoveredDistrict && (
                <DistrictTooltip hoveredDistrict={hoveredDistrict} />
            )}
        </BaseTooltip>
    );
};

export default TechTooltip;
