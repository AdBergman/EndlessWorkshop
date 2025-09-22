import React, { useState } from "react";
import ImprovementTooltip from "../../Tooltips/ImprovementTooltip";
import DistrictTooltip from "../../Tooltips/DistrictTooltip";
import { Improvement, District } from "@dataTypes/dataTypes";
import { improvementsMap } from "../../../types/improvementsMap";
import { districtsMap } from "../../../types/districtsMap";

interface UnlockLineProps {
    line: string;
}

const UnlockLine: React.FC<UnlockLineProps> = ({ line }) => {
    const [hoveredImprovement, setHoveredImprovement] = useState<
        (Improvement & { coords: { xPct: number; yPct: number } }) | null
    >(null);

    const [hoveredDistrict, setHoveredDistrict] = useState<
        (District & { coords: { xPct: number; yPct: number } }) | null
    >(null);

    const impPrefix = "Improvement: ";
    const distPrefix = "District: ";

    // Hover handler utility
    const getCoords = (e: React.MouseEvent<HTMLSpanElement>) => ({
        xPct: (e.currentTarget.getBoundingClientRect().left / window.innerWidth) * 100,
        yPct: (e.currentTarget.getBoundingClientRect().top / window.innerHeight) * 100,
    });

    // Improvement line
    if (line.startsWith(impPrefix)) {
        const improvementName = line.slice(impPrefix.length);
        const impObj = improvementsMap.get(improvementName);

        const handleMouseEnter = (e: React.MouseEvent<HTMLSpanElement>) => {
            if (!impObj) return;
            setHoveredImprovement({ ...impObj, coords: getCoords(e) });
        };

        const handleMouseLeave = () => setHoveredImprovement(null);

        return (
            <div style={{ position: "relative", display: "inline-block" }}>
                {impPrefix}
                <span
                    style={{ textDecoration: "underline", cursor: "pointer" }}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    {improvementName}
                </span>
                {hoveredImprovement && (
                    <ImprovementTooltip hoveredImprovement={hoveredImprovement} />
                )}
            </div>
        );
    }

    // District line
    if (line.startsWith(distPrefix)) {
        const districtName = line.slice(distPrefix.length);
        const distObj = districtsMap.get(districtName);

        const handleMouseEnter = (e: React.MouseEvent<HTMLSpanElement>) => {
            if (!distObj) return;
            setHoveredDistrict({ ...distObj, coords: getCoords(e) });
        };

        const handleMouseLeave = () => setHoveredDistrict(null);

        return (
            <div style={{ position: "relative", display: "inline-block" }}>
                {distPrefix}
                <span
                    style={{ textDecoration: "underline", cursor: "pointer" }}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    {districtName}
                </span>
                {hoveredDistrict && (
                    <DistrictTooltip hoveredDistrict={hoveredDistrict} />
                )}
            </div>
        );
    }

    // Fallback: just render the line normally
    return <div>{line}</div>;
};

export default UnlockLine;
