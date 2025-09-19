import React, { ReactNode } from "react";

interface BaseTooltipProps {
    coords: { xPct: number; yPct: number };
    children: ReactNode;
}

const BaseTooltip: React.FC<BaseTooltipProps> = ({ coords , children }) => {
    return (
        <div
            className="base-tooltip"
            style={{
                position: "absolute",
                top: `${coords.yPct}%`,
                left: `${coords.xPct + 5}%`,
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
            {children}
        </div>
    );
};

export default BaseTooltip;
