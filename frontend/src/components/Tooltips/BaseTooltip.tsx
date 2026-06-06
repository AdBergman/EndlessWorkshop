import React from "react";
import type { PixelTooltipCoords } from "./hoverHelpers";

interface BaseTooltipProps {
    coords: { xPct: number; yPct: number } | PixelTooltipCoords;
    children: React.ReactNode;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    tooltipStyle?: React.CSSProperties;
}

const isPixelCoords = (
    coords: BaseTooltipProps["coords"]
): coords is PixelTooltipCoords => "mode" in coords && coords.mode === "pixel";

const BaseTooltip: React.FC<BaseTooltipProps> = ({
                                                     coords,
                                                     children,
                                                     onMouseEnter,
                                                     onMouseLeave,
                                                     tooltipStyle,
                                                 }) => {
    // --- Determine styling based on the coordinate system ---
    let positionStyles: React.CSSProperties;
    if (isPixelCoords(coords)) {
        // Use absolute pixel coordinates for portaled tooltips (e.g., SpreadsheetView / Unit cards)
        const viewportX = coords.x - window.scrollX;
        positionStyles = coords.placement === "left"
            ? {
                position: "absolute",
                top: `${coords.y}px`,
                right: `${Math.max(12, window.innerWidth - viewportX)}px`,
                transform: "translateY(-50%)",
            }
            : {
                position: "absolute",
                top: `${coords.y}px`,
                left: `${coords.x}px`,
                transform: "translateY(-50%)",
            };
    } else {
        // Use percentage-based coordinates for tooltips within a specific container (e.g., TechTree)
        positionStyles = {
            position: "absolute",
            top: `${coords.yPct}%`,
            left: `${coords.xPct + 4}%`,
            transform: "translateY(-75%)",
        };
    }

    const baseStyles: React.CSSProperties = {
        // Must remain auto for sticky hover to work
        pointerEvents: "auto",

        backgroundColor: "#151515",
        color: "#f2f2f2",

        padding: "8px 12px",
        borderRadius: "6px",

        fontFamily: "'Inter', sans-serif",
        fontWeight: 500,
        fontSize: "0.88rem",
        lineHeight: 1.4,

        zIndex: 20,

        /* Hug content, but cap width for long lines */
        width: "max-content",
        maxWidth: "min(320px, calc(100vw - 24px))",

        whiteSpace: "normal",
        overflowWrap: "anywhere",

        border: "1px solid rgba(255, 140, 64, 0.35)",

        boxShadow:
            "0 10px 24px rgba(0,0,0,0.55), 0 2px 6px rgba(0,0,0,0.45)",
    };

    return (
        <div
            className="base-tooltip"
            style={{ ...baseStyles, ...tooltipStyle, ...positionStyles }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            {children}
        </div>
    );
};

export default BaseTooltip;
