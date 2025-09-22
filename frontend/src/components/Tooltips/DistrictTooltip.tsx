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
            <div style={{ minWidth: "220px" }}>
                <div style={{ fontWeight: 600 }}>{name}</div>
                {info && <div style={{ marginTop: "0.2rem" }}>{info}</div>}
                {effect && effect.length > 0 && (
                    <div style={{ marginTop: "0.2rem" }}>
                        <strong>Effect:</strong>
                        <div style={{ paddingLeft: "0.6rem", display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                            {effect.map((eff, i) => <div key={i}>{eff}</div>)}
                        </div>
                    </div>
                )}
                {tileBonus && (
                    <div style={{ marginTop: "0.2rem" }}>
                        <strong>Tile Bonus:</strong> {tileBonus}
                    </div>
                )}
                {adjacencyBonus && (
                    <div style={{ marginTop: "0.2rem" }}>
                        <strong>Adjacency Bonus:</strong> {adjacencyBonus}
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
