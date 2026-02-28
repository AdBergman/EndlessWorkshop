import React from "react";
import ReactDOM from "react-dom";
import BaseTooltip from "./BaseTooltip";
import TooltipSection from "./TooltipSection";
import { renderDescriptionLine } from "@/lib/descriptionLine/descriptionLineRenderer";
import type { Codex } from "@/types/dataTypes";

type PixelCoords = { x: number; y: number; mode: "pixel" };

export type HoveredSkill = {
    data: Codex;
    coords: PixelCoords;
};

interface SkillTooltipProps {
    hoveredSkill: HoveredSkill;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
}

const SkillTooltip: React.FC<SkillTooltipProps> = ({
                                                       hoveredSkill,
                                                       onMouseEnter,
                                                       onMouseLeave,
                                                   }) => {
    const { data, coords } = hoveredSkill;
    const { displayName, descriptionLines } = data;

    return ReactDOM.createPortal(
        <BaseTooltip coords={coords} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
            <div style={{ minWidth: "220px" }}>
                <div style={{ fontWeight: 500 }}>{displayName}</div>

                {(descriptionLines?.length ?? 0) > 0 && (
                    <TooltipSection>
                        {descriptionLines.map((line, idx) => (
                            <div key={idx}>{renderDescriptionLine(line)}</div>
                        ))}
                    </TooltipSection>
                )}
            </div>
        </BaseTooltip>,
        document.body
    );
};

export default SkillTooltip;