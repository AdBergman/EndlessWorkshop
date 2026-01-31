import React from "react";
import "./TechNode.css";

interface TechNodeProps {
    coords: { xPct: number; yPct: number };
    selected: boolean;
    locked?: boolean;

    onClick: (e: React.MouseEvent<HTMLDivElement>) => void;

    onHoverChange?: (hovered: boolean) => void;
    offsetPx?: number;
    orderNumber?: number;

    adminActive?: boolean;
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
                                               adminActive = false,
                                           }) => {
    const clickable = !locked;

    return (
        <div
            data-testid="tech-node"
            className={`tech-node ${selected ? "selected" : ""} ${locked ? "locked" : ""} ${
                adminActive ? "tech-node--adminActive" : ""
            }`}
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