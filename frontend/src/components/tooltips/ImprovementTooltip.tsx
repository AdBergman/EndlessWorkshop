import React from "react";
import BaseTooltip from "./BaseTooltip";
import { Improvement } from "@dataTypes/dataTypes";

interface ImprovementTooltipProps {
    hoveredImprovement: Improvement & { coords: { xPct: number; yPct: number } };
}

const ImprovementTooltip: React.FC<ImprovementTooltipProps> = ({ hoveredImprovement }) => {
    const { name, effects, unique } = hoveredImprovement;

    return (
        <BaseTooltip coords={hoveredImprovement.coords}>
            <div>{name}</div>

            <div style={{ marginTop: "0.2rem" }}>
                <strong>Type:</strong> {unique}
            </div>

            {effects.length > 0 && (
                <div style={{ marginTop: "0.2rem" }}>
                    <strong>Effects:</strong>
                    {effects.map((eff, i) => (
                        <div key={i} style={{ paddingLeft: "0.6rem" }}>
                            {eff}
                        </div>
                    ))}
                </div>
            )}
        </BaseTooltip>
    );
};

export default ImprovementTooltip;
