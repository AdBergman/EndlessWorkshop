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
    const { data, coords } = hoveredDistrict;
    const { displayName, descriptionLines } = data;

    return ReactDOM.createPortal(
        <BaseTooltip coords={coords}>
            <div style={{ minWidth: "220px" }}>
                <div style={{ fontWeight: 500 }}>{displayName}</div>

                {(descriptionLines?.length ?? 0) > 0 && (
                    <TooltipSection>
                        {descriptionLines.map((line, idx) => (
                            <div key={idx}>{line}</div>
                        ))}
                    </TooltipSection>
                )}
            </div>
        </BaseTooltip>,
        document.body
    );
};

export default DistrictTooltip;