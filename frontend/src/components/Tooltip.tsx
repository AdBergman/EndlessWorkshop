import React from "react";

export class Tooltip extends React.Component<{
    hoveredTech: { name: string; coords: { xPct: number; yPct: number } }
}> {
    render() {
        return <div
            className="tech-tooltip"
            style={{
                position: "absolute",
                top: `${this.props.hoveredTech.coords.yPct}%`,
                left: `${this.props.hoveredTech.coords.xPct + 5}%`,
                transform: "translateY(-50%)",
                pointerEvents: "none",
                backgroundColor: "rgba(0,0,0,0.8)",
                color: "#fff",
                padding: "0.3rem 0.6rem",
                borderRadius: "4px",
                fontSize: "0.8rem",
                whiteSpace: "nowrap",
                zIndex: 10,
            }}
        >
            {this.props.hoveredTech.name}
        </div>;
    }
}