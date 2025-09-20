import React, { useState } from "react";
import ImprovementTooltip from "../../Tooltips/ImprovementTooltip";

import { Improvement } from "@dataTypes/dataTypes";
import { improvementsMap } from "../../../types/improvementsMap";

interface UnlockLineProps {
    line: string;
}

const UnlockLine: React.FC<UnlockLineProps> = ({ line }) => {
    const [hoveredImprovement, setHoveredImprovement] = useState<
        (Improvement & { coords: { xPct: number; yPct: number } }) | null
    >(null);

    const prefix = "Improvement: ";

    if (!line.startsWith(prefix)) return <div>{line}</div>;

    const improvementName = line.slice(prefix.length);
    const impObj = improvementsMap.get(improvementName);

    const handleMouseEnter = (e: React.MouseEvent<HTMLSpanElement>) => {
        if (!impObj) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const xPct = (rect.left / window.innerWidth) * 100;
        const yPct = (rect.top / window.innerHeight) * 100;

        setHoveredImprovement({ ...impObj, coords: { xPct, yPct } });
    };

    const handleMouseLeave = () => setHoveredImprovement(null);

    return (
        <div style={{ position: "relative", display: "inline-block" }}>
            {prefix}
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
};

export default UnlockLine;
