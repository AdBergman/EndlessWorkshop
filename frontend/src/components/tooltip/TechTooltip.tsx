import React from "react";
import { Tech } from "@dataTypes/dataTypes";
import BaseTooltip from "./BaseTooltip";

interface TechTooltipProps {
    hoveredTech: Tech & { coords: { xPct: number; yPct: number } };
}

const TechTooltip: React.FC<TechTooltipProps> = ({ hoveredTech }) => {
    return (
        <BaseTooltip xPct={hoveredTech.coords.xPct} yPct={hoveredTech.coords.yPct}>
            <div>{hoveredTech.name}</div>

            {hoveredTech.unlocks && hoveredTech.unlocks.length > 0 && (
                <div style={{ marginTop: "0.2rem" }}>
                    <strong>Unlocks:</strong>
                    {hoveredTech.unlocks.map((item, i) => (
                        <div key={i} style={{ paddingLeft: "0.6rem" }}>
                            {item}
                        </div>
                    ))}
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
        </BaseTooltip>
    );
};

export default TechTooltip;
