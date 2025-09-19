import React, { useState } from "react";
import ImprovementTooltip from "../../tooltips/ImprovementTooltip";
import { Improvement } from "@dataTypes/dataTypes";

interface UnlockLineProps {
    line: string;
    // optionally, you can pass a lookup function to get full Improvement object by name
    getImprovementByName?: (name: string) => Improvement;
}

const UnlockLine: React.FC<UnlockLineProps> = ({ line, getImprovementByName }) => {
    const prefix = "Improvement: ";
    const [hoveredImprovement, setHoveredImprovement] = useState<Improvement & { coords: { xPct: number; yPct: number } } | null>(null);

    if (line.startsWith(prefix)) {
        const improvementName = line.slice(prefix.length);

        const handleMouseEnter = (e: React.MouseEvent<HTMLSpanElement>) => {
            if (getImprovementByName) {
                const improvement = getImprovementByName(improvementName);
                if (improvement) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const xPct = (rect.left / window.innerWidth) * 100;
                    const yPct = (rect.top / window.innerHeight) * 100;
                    setHoveredImprovement({ ...improvement, coords: { xPct, yPct } });
                }
            }
        };

        const handleMouseLeave = () => {
            setHoveredImprovement(null);
        };

        return (
            <div style={{ position: "relative" }}>
                {prefix}
                <span
                    style={{
                        textDecoration: "underline",
                        cursor: "pointer",
                    }}
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
    } else {
        return <div>{line}</div>;
    }
};

export default UnlockLine;
