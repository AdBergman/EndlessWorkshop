import React from "react";
import { Tech } from "../../types/techTypes";

interface TooltipProps {
    hoveredTech: Tech & { coords: { xPct: number; yPct: number } };
}

const Tooltip: React.FC<TooltipProps> = ({ hoveredTech }) => {
    return (
        <div
            className="tech-tooltip"
            style={{
                position: "absolute",
                top: `${hoveredTech.coords.yPct}%`,
                left: `${hoveredTech.coords.xPct + 5}%`,
                transform: "translateY(-50%)",
                pointerEvents: "none",
                backgroundColor: "rgba(0,0,0,0.85)",
                color: "#fff",
                padding: "0.4rem 0.8rem",
                borderRadius: "4px",
                fontFamily: "'Inter', sans-serif",
                fontWeight: 500,
                fontSize: "0.9rem",
                lineHeight: 1.3,
                whiteSpace: "normal",
                zIndex: 10,
                WebkitFontSmoothing: "antialiased",
                MozOsxFontSmoothing: "grayscale",
                textShadow: "0 0 1px rgba(0,0,0,0.5)",
            }}
        >
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

            {hoveredTech.effect && hoveredTech.effect.length > 0 && (
                <div style={{ marginTop: "0.2rem" }}>
                    <strong>Effects:</strong>
                    {hoveredTech.effect.map((eff, i) => (
                        <div key={i} style={{ paddingLeft: "0.6rem" }}>
                            {eff}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Tooltip;
