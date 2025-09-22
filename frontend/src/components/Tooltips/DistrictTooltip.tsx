import React from "react";
import ReactDOM from "react-dom";
import BaseTooltip from "./BaseTooltip";
import { District } from "@dataTypes/dataTypes";

interface DistrictTooltipProps {
    hoveredDistrict: District & { coords: { xPct: number; yPct: number } };
}

const DistrictTooltip: React.FC<DistrictTooltipProps> = ({ hoveredDistrict }) => {
    const { name, info, effect, tileBonus, adjacencyBonus, placementPrereq, coords } = hoveredDistrict;

    return ReactDOM.createPortal(
        <BaseTooltip coords={coords}>
            <div style={{ minWidth: "200px" }}>
                <div style={{ fontWeight: 500 }}>{name}</div>

                {info && info.length > 0 && (
                    <div style={{ marginTop: "0.2rem", display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                        {info.map((i, idx) => <div key={idx}>{i}</div>)}
                    </div>
                )}

                {effect && (
                    <div style={{ marginTop: "0.2rem" }}>
                        <strong>Effect:</strong> {effect}
                    </div>
                )}

                {tileBonus && tileBonus.length > 0 && (
                    <div style={{ marginTop: "0.2rem", display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                        <strong>Tile Bonus:</strong>
                        {tileBonus.map((tb, idx) => <div key={idx} style={{ paddingLeft: "0.6rem" }}>{tb}</div>)}
                    </div>
                )}

                {adjacencyBonus && adjacencyBonus.length > 0 && (
                    <div style={{ marginTop: "0.2rem", display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                        <strong>Adjacency Bonus:</strong>
                        {adjacencyBonus.map((ab, idx) => <div key={idx} style={{ paddingLeft: "0.6rem" }}>{ab}</div>)}
                    </div>
                )}

                {placementPrereq && (
                    <div style={{ marginTop: "0.2rem" }}>
                        <strong>Placement:</strong> {placementPrereq}
                    </div>
                )}
            </div>
        </BaseTooltip>,
        document.body
    );
};

export default DistrictTooltip;
