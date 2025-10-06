import React, { useState } from "react";
import { Tech, Improvement, District } from "@/types/dataTypes";
import BaseTooltip from "./BaseTooltip";
import ImprovementTooltip from "./ImprovementTooltip";
import DistrictTooltip from "./DistrictTooltip";
import TooltipSection from "./TooltipSection";
import { createHoveredImprovement, createHoveredDistrict, HoveredWithCoords } from "./hoverHelpers";
import { useGameData } from "@/context/GameDataContext";

interface TechTooltipProps {
    hoveredTech: Tech & { coords: { xPct: number; yPct: number } };
    onMouseEnter: () => void;
    onMouseLeave: () => void;
}

// Reusable types for hovered state
type HoveredImprovementState = HoveredWithCoords<Improvement> | null;
type HoveredDistrictState = HoveredWithCoords<District> | null;

const TechTooltip: React.FC<TechTooltipProps> = ({ hoveredTech, onMouseEnter, onMouseLeave }) => {
    const { districts, improvements } = useGameData();

    const [hoveredImprovement, setHoveredImprovement] = useState<HoveredImprovementState>(null);
    const [hoveredDistrict, setHoveredDistrict] = useState<HoveredDistrictState>(null);

    const renderUnlockLine = (line: string, index: number) => {
        const impPrefix = "Improvement: ";
        const distPrefix = "District: ";

        if (line.startsWith(impPrefix)) {
            const impName = line.slice(impPrefix.length);
            const impObj = improvements.get(impName);
            if (!impObj) return <div key={index}>{line}</div>;

            const handleMouseEnter = (e: React.MouseEvent<HTMLSpanElement>) => {
                setHoveredImprovement(createHoveredImprovement(impObj, e));
            };
            const handleMouseLeave = () => setHoveredImprovement(null);

            return (
                <div key={index} style={{ display: "block" }}>
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
            const distObj = districts.get(distName);
            if (!distObj) return <div key={index}>{line}</div>;

            const handleMouseEnter = (e: React.MouseEvent<HTMLSpanElement>) => {
                setHoveredDistrict(createHoveredDistrict(distObj, e));
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
        <BaseTooltip
            coords={hoveredTech.coords}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
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
    );
};

export default TechTooltip;
