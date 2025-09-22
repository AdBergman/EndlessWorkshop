import React, { useState } from "react";
import { Tech, Improvement, District } from "@dataTypes/dataTypes";
import BaseTooltip from "./BaseTooltip";
import ImprovementTooltip from "./ImprovementTooltip";
import DistrictTooltip from "./DistrictTooltip";
import TooltipSection from "./TooltipSection";
import { improvementsMap } from "../../types/improvementsMap";
import { districtsMap } from "../../types/districtsMap";
import { createHoveredImprovement, createHoveredDistrict } from "./hoverHelpers";

interface TechTooltipProps {
    hoveredTech: Tech & { coords: { xPct: number; yPct: number } };
    onMouseEnter: () => void;
    onMouseLeave: () => void;
}

const TechTooltip: React.FC<TechTooltipProps> = ({ hoveredTech, onMouseEnter, onMouseLeave }) => {
    const [hoveredImprovement, setHoveredImprovement] = useState<Improvement & { coords: { xPct: number; yPct: number } } | null>(null);
    const [hoveredDistrict, setHoveredDistrict] = useState<District & { coords: { xPct: number; yPct: number } } | null>(null);

    const renderUnlockLine = (line: string, index: number) => {
        const impPrefix = "Improvement: ";
        const distPrefix = "District: ";

        if (line.startsWith(impPrefix)) {
            const impName = line.slice(impPrefix.length);
            const impObj = improvementsMap.get(impName);
            if (!impObj) return <div key={index}>{line}</div>;

            const handleMouseEnter = (e: React.MouseEvent<HTMLSpanElement>) => {
                setHoveredImprovement({ ...createHoveredImprovement(impObj, e).data, coords: createHoveredImprovement(impObj, e).coords });
            };
            const handleMouseLeave = () => setHoveredImprovement(null);

            return (
                <div key={index} style={{ display: "inline-block" }}>
                    <span>{impPrefix}</span>
                    <span
                        style={{ textDecoration: "underline", cursor: "pointer" }}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    >
                        {impName}
                    </span>
                </div>
            );
        }

        if (line.startsWith(distPrefix)) {
            const distName = line.slice(distPrefix.length);
            const distObj = districtsMap.get(distName);
            if (!distObj) return <div key={index}>{line}</div>;

            const handleMouseEnter = (e: React.MouseEvent<HTMLSpanElement>) => {
                setHoveredDistrict({ ...createHoveredDistrict(distObj, e).data, coords: createHoveredDistrict(distObj, e).coords });
            };
            const handleMouseLeave = () => setHoveredDistrict(null);

            return (
                <div key={index} style={{ display: "inline-block" }}>
                    <span>{distPrefix}</span>
                    <span
                        style={{ textDecoration: "underline", cursor: "pointer" }}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    >
                        {distName}
                    </span>
                </div>
            );
        }

        return <div key={index}>{line}</div>;
    };

    return (
        <div onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
            <BaseTooltip coords={hoveredTech.coords} hideDelay={250}>
                <div style={{ fontWeight: 600 }}>{hoveredTech.name}</div>

                {hoveredTech.unlocks && hoveredTech.unlocks.length > 0 && (
                    <TooltipSection title="Unlocks:">
                        {hoveredTech.unlocks.map(renderUnlockLine)}
                    </TooltipSection>
                )}

                {hoveredTech.effects && hoveredTech.effects.length > 0 && (
                    <TooltipSection title="Effects:">
                        {hoveredTech.effects.map((eff, i) => (
                            <div key={i}>{eff}</div>
                        ))}
                    </TooltipSection>
                )}

                {hoveredImprovement && <ImprovementTooltip hoveredImprovement={hoveredImprovement} />}
                {hoveredDistrict && <DistrictTooltip hoveredDistrict={hoveredDistrict} />}
            </BaseTooltip>
        </div>
    );
};

export default TechTooltip;
