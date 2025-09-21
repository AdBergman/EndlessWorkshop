import React, { useEffect, useRef, useState } from "react";

interface BaseTooltipProps {
    coords: { xPct: number; yPct: number };
    children: React.ReactNode;
    hideDelay?: number; // milliseconds
}

const BaseTooltip: React.FC<BaseTooltipProps> = ({ coords, children, hideDelay = 500 }) => {
    const [visible, setVisible] = useState(true);
    const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = () => {
        if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current);
            hideTimeoutRef.current = null;
        }
        setVisible(true);
    };

    const handleMouseLeave = () => {
        hideTimeoutRef.current = setTimeout(() => setVisible(false), hideDelay);
    };

    // clear timeout on unmount
    useEffect(() => {
        return () => {
            if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
        };
    }, []);

    if (!visible) return null;

    return (
        <div
            className="base-tooltip"
            style={{
                position: "absolute",
                top: `${coords.yPct}%`,
                left: `${coords.xPct + 5}%`,
                transform: "translateY(-50%)",
                pointerEvents: "auto", // allow hover
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
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {children}
        </div>
    );
};

export default BaseTooltip;
