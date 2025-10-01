import React from "react";
import ReactDOM from "react-dom";
import BaseTooltip from "./BaseTooltip";
import TooltipSection from "./TooltipSection";
import {Improvement} from "@/types/dataTypes";
import {TooltipFlavor} from "@/components/Tooltips/TooltipFlavor";

interface ImprovementTooltipProps {
    hoveredImprovement: Improvement & { coords: { xPct: number; yPct: number } };
}

const ImprovementTooltip: React.FC<ImprovementTooltipProps> = ({ hoveredImprovement }) => {
    const { name, effects, unique, coords } = hoveredImprovement;

    return ReactDOM.createPortal(
        <BaseTooltip coords={coords}>
            <div style={{minWidth: "200px"}}>
                <div style={{fontWeight: 500}}>{name}</div>

                <TooltipFlavor unique={unique}/>

                {effects.length > 0 && (
                    <TooltipSection title="Effects:">
                        {effects.map((eff, i) => <div key={i}>{eff}</div>)}
                    </TooltipSection>
                )}
            </div>
        </BaseTooltip>,
        document.body
    );
};

export default ImprovementTooltip;
