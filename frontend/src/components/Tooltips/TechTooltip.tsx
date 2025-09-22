import React, { useState } from "react";
import { Tech, Improvement, District } from "@dataTypes/dataTypes";
import BaseTooltip from "./BaseTooltip";
import ImprovementTooltip from "./ImprovementTooltip";
import DistrictTooltip from "./DistrictTooltip";
import { improvementsMap } from "../../types/improvementsMap";
import { districtsMap } from "../../types/districtsMap";

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

        // Improvement
        if (line.startsWith(impPrefix)) {
            const impName = line.slice(impPrefix.length);
            const impObj = improvementsMap.get(impName);
            if (!impObj) return <div key={index}>{line}</div>;

            const handleMouseEnter = (e: React.MouseEvent<HTMLSpanElement>) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const xPct = (rect.left / window.innerWidth) * 100;
                const yPct = (rect.top / window.innerHeight) * 100;
                setHoveredImprovement({ ...impObj, coords: { xPct, yPct } });
            };
            const handleMouseLeave = () => setHoveredImprovement(null);

            return (
                <div key={index} style={{ display: "inline-block" }}>
                    {impPrefix}
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

        // District
        if (line.startsWith(distPrefix)) {
            const distName = line.slice(distPrefix.length);
            const distObj = districtsMap.get(distName);
            if (!distObj) return <div key={index}>{line}</div>;

            const handleMouseEnter = (e: React.MouseEvent<HTMLSpanElement>) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const xPct = (rect.left / window.innerWidth) * 100;
                const yPct = (rect.top / window.innerHeight) * 100;
                setHoveredDistrict({ ...distObj, coords: { xPct, yPct } });
            };
            const handleMouseLeave = () => setHoveredDistrict(null);

            return (
                <div key={index} style={{ display: "inline-block" }}>
                    {distPrefix}
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

        // Fallback: plain text
        return <div key={index}>{line}</div>;
    };

    return (
        <div
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <BaseTooltip coords={hoveredTech.coords} hideDelay={250}>
                <div style={{ fontWeight: 600 }}>{hoveredTech.name}</div>

                {hoveredTech.unlocks && hoveredTech.unlocks.length > 0 && (
                    <div style={{ marginTop: "0.2rem" }}>
                        <strong>Unlocks:</strong>
                        <div style={{ paddingLeft: "0.6rem", display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                            {hoveredTech.unlocks.map(renderUnlockLine)}
                        </div>
                    </div>
                )}

                {hoveredTech.effects && hoveredTech.effects.length > 0 && (
                    <div style={{ marginTop: "0.2rem" }}>
                        <strong>Effects:</strong>
                        {hoveredTech.effects.map((eff, i) => (
                            <div key={i} style={{ paddingLeft: "0.6rem" }}>
                                {eff}
                            </div>
                        ))}
                    </div>
                )}

                {hoveredImprovement && <ImprovementTooltip hoveredImprovement={hoveredImprovement} />}
                {hoveredDistrict && <DistrictTooltip hoveredDistrict={hoveredDistrict} />}
            </BaseTooltip>
        </div>
    );
};

export default TechTooltip;
