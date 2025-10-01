import React from "react";

interface BaseTooltipProps {
    coords: { xPct: number; yPct: number } | { x: number; y: number; mode: 'pixel' };
    children: React.ReactNode;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
}

const BaseTooltip: React.FC<BaseTooltipProps> = ({ coords, children, onMouseEnter, onMouseLeave }) => {
    // --- Determine styling based on the coordinate system ---
    let positionStyles: React.CSSProperties;
    if ('mode' in coords && coords.mode === 'pixel') {
        // Use absolute pixel coordinates for portaled tooltips (e.g., from SpreadsheetView)
        positionStyles = {
            position: "absolute",
            top: `${coords.y}px`,
            left: `${coords.x}px`,
            transform: "translateY(-50%)", // Vertically center on the cursor
        };
    } else {
        // Use percentage-based coordinates for tooltips within a specific container (e.g., TechTree)
        positionStyles = {
            position: "absolute",
            top: `${coords.yPct}%`,
            left: `${coords.xPct + 1}%`, // Use a small offset for a better experience
            transform: "translateY(-50%)",
        };
    }

    const baseStyles: React.CSSProperties = {
        // This MUST be auto for the onMouseEnter/Leave handlers to work.
        pointerEvents: "auto",
        backgroundColor: "rgba(0,0,0,0.85)",
        color: "#fff",
        padding: "0.4rem 0.8rem",
        borderRadius: "4px",
        fontFamily: "'Inter', sans-serif",
        fontWeight: 500,
        fontSize: "0.9rem",
        lineHeight: 1.3,
        zIndex: 10,
        textShadow: "0 0 1px rgba(0,0,0,0.5)",
    };

    return (
        <div
            className="base-tooltip"
            style={{ ...baseStyles, ...positionStyles }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            {children}
        </div>
    );
};

export default BaseTooltip;
