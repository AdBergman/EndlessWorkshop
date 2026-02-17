import React from "react";
import ReactDOM from "react-dom";
import BaseTooltip from "./BaseTooltip";
import TooltipSection from "./TooltipSection";
import { Improvement } from "@/types/dataTypes";
import { TooltipFlavor } from "@/components/Tooltips/TooltipFlavor";
import { HoveredWithCoords } from "./hoverHelpers";
import {renderDescriptionLine} from "@/lib/descriptionLine/descriptionLineRenderer";

interface ImprovementTooltipProps {
    hoveredImprovement: HoveredWithCoords<Improvement>;
}

const ImprovementTooltip: React.FC<ImprovementTooltipProps> = ({ hoveredImprovement }) => {
    const { data, coords } = hoveredImprovement;
    const { displayName, descriptionLines, unique, cost } = data;

    return ReactDOM.createPortal(
        <BaseTooltip coords={coords}>
            <div style={{ minWidth: "220px" }}>
                <div style={{ fontWeight: 500 }}>{displayName}</div>

                <TooltipFlavor unique={unique} />

                {(descriptionLines?.length ?? 0) > 0 && (
                    <TooltipSection title="Effects:">
                        {(descriptionLines ?? []).map((line, i) => (
                            <div key={i}>{renderDescriptionLine(line)}</div>
                        ))}
                    </TooltipSection>
                )}

                {(cost?.length ?? 0) > 0 && (
                    <TooltipSection title="Cost:">
                        {(cost ?? []).map((c, i) => (
                            <div key={i}>{c}</div>
                        ))}
                    </TooltipSection>
                )}
            </div>
        </BaseTooltip>,
        document.body
    );
};

export default ImprovementTooltip;