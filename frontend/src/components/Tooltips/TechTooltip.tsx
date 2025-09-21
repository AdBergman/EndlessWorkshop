import React, { useState, useRef, useEffect } from "react";
import { Tech, Improvement } from "@dataTypes/dataTypes";
import BaseTooltip from "./BaseTooltip";
import ImprovementTooltip from "./ImprovementTooltip";
import { improvementsMap } from "../../types/improvementsMap";

interface TechTooltipProps {
    hoveredTech: Tech & { coords: { xPct: number; yPct: number } };
    onMouseEnter: () => void;
    onMouseLeave: () => void;
}

const TechTooltip: React.FC<TechTooltipProps> = ({ hoveredTech, onMouseEnter, onMouseLeave }) => {
    const [hoveredImprovement, setHoveredImprovement] = useState<Improvement & { coords: { xPct: number; yPct: number } } | null>(null);

    const renderUnlockLine = (line: string, index: number) => {
        const prefix = "Improvement: ";
        if (!line.startsWith(prefix)) return <div key={index}>{line}</div>;

        const impName = line.slice(prefix.length);
        const impObj = improvementsMap.get(impName);
        if (!impObj) return <div key={index}>{line}</div>;

        const handleImpMouseEnter = (e: React.MouseEvent<HTMLSpanElement>) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const xPct = (rect.left / window.innerWidth) * 100;
            const yPct = (rect.top / window.innerHeight) * 100;
            setHoveredImprovement({ ...impObj, coords: { xPct, yPct } });
        };

        const handleImpMouseLeave = () => setHoveredImprovement(null);

        return (
            <div key={index} style={{ display: "inline-block" }}>
                {prefix}
                <span
                    style={{ textDecoration: "underline", cursor: "pointer" }}
                    onMouseEnter={handleImpMouseEnter}
                    onMouseLeave={handleImpMouseLeave}
                >
                    {impName}
                </span>
            </div>
        );
    };

    return (
        <div
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <BaseTooltip coords={hoveredTech.coords} hideDelay={250}>
                <div>{hoveredTech.name}</div>

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
            </BaseTooltip>
        </div>
    );
};

export default TechTooltip;
