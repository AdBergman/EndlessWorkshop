import React from "react";
import "./TechNode.css";

interface TechNodeProps {
    coords: { xPct: number; yPct: number };
    selected: boolean;
    locked?: boolean;
    onClick: () => void;
    onHoverChange?: (hovered: boolean) => void;
    offsetPx?: number;

    // Phase 1: If selected, show this number inside the node
    orderNumber?: number;
}

const BOX_SIZE_PCT = 4.95;

const TechNode: React.FC<TechNodeProps> = ({
                                               coords,
                                               selected,
                                               locked = false,
                                               onClick,
                                               onHoverChange,
                                               offsetPx,
                                               orderNumber,
                                           }) => {
    const clickable = !locked;

    return (
        <div
            data-testid="tech-node"
            className={`tech-node ${selected ? "selected" : ""} ${locked ? "locked" : ""}`}
            onClick={clickable ? onClick : undefined}
            onMouseEnter={() => onHoverChange?.(true)}
            onMouseLeave={() => onHoverChange?.(false)}
            style={{
                position: "absolute",
                left: `${coords.xPct}%`,
                top: `calc(${coords.yPct}% + ${offsetPx ?? 0}px)`,
                width: `${BOX_SIZE_PCT}%`,
                aspectRatio: "1 / 1",
                transform: "translate(3%, 3%)",
            }}
        >
            {selected && typeof orderNumber === "number" && orderNumber > 0 && (
                <div className="tech-order-token" aria-hidden="true">
                    {orderNumber}
                </div>
            )}
        </div>
    );
};

export default TechNode;