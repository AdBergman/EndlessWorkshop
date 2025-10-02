import React from "react";
import ReactDOM from "react-dom";
import BaseTooltip from "./BaseTooltip";
import TooltipSection from "./TooltipSection";
import { District } from "@/types/dataTypes";
import { HoveredWithCoords } from "./hoverHelpers";

interface DistrictTooltipProps {
    hoveredDistrict: HoveredWithCoords<District>;
}

const DistrictTooltip: React.FC<DistrictTooltipProps> = ({ hoveredDistrict }) => {
    // Destructure the data and coords from the new prop shape
    const { data, coords } = hoveredDistrict;
    const { name, info, effect, tileBonus, adjacencyBonus, placementPrereq } = data;

    return ReactDOM.createPortal(
        <BaseTooltip coords={coords}>
            <div style={{ minWidth: "200px" }}>
                <div style={{ fontWeight: 500 }}>{name}</div>

                {info && info.length > 0 && (
                    <TooltipSection>{info.map((i, idx) => <div key={idx}>{i}</div>)}</TooltipSection>
                )}

                {effect && <TooltipSection title="Effect:">{effect}</TooltipSection>}

                {tileBonus && tileBonus.length > 0 && (
                    <TooltipSection title="Tile Bonus:">
                        {tileBonus.map((tb, idx) => <div key={idx}>{tb}</div>)}
                    </TooltipSection>
                )}

                {adjacencyBonus && adjacencyBonus.length > 0 && (
                    <TooltipSection title="Adjacency Bonus:">
                        {adjacencyBonus.map((ab, idx) => <div key={idx}>{ab}</div>)}
                    </TooltipSection>
                )}

                {placementPrereq && <TooltipSection title="Placement:">{placementPrereq}</TooltipSection>}
            </div>
        </BaseTooltip>,
        document.body
    );
};

export default DistrictTooltip;
