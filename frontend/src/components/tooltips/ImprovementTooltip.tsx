import React from "react";
import ReactDOM from "react-dom";
import BaseTooltip from "./BaseTooltip";
import { Improvement } from "@dataTypes/dataTypes";

interface ImprovementTooltipProps {
    hoveredImprovement: Improvement & { coords: { xPct: number; yPct: number } };
}

const ImprovementTooltip: React.FC<ImprovementTooltipProps> = ({ hoveredImprovement }) => {
    const { name, effects, unique, coords } = hoveredImprovement;

    return ReactDOM.createPortal(
        <BaseTooltip coords={coords}>
            <div style={{ minWidth: "200px" }}> {/* same size as TechTooltip */}
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
            </div>
        </BaseTooltip>,
        document.body // portal ensures it floats above the table
    );
};

export default ImprovementTooltip;
