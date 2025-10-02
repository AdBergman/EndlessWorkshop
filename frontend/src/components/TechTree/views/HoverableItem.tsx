import React, { useState } from "react";
import ImprovementTooltip from "../../Tooltips/ImprovementTooltip";
import DistrictTooltip from "../../Tooltips/DistrictTooltip";
import { improvementsMap } from "@/utils/improvementsMap";
import { districtsMap } from "@/utils/districtsMap";
import {
    createHoveredImprovement,
    createHoveredDistrict,
    HoveredWithCoords,
} from "../../Tooltips/hoverHelpers";

type HoverType = "Improvement" | "District";

interface HoverableItemProps {
    type: HoverType;
    name: string;
    prefix: string;
}

const HoverableItem: React.FC<HoverableItemProps> = ({
                                                         type,
                                                         name,
                                                         prefix,
                                                     }) => {
    const [hovered, setHovered] = useState<HoveredWithCoords<any> | null>(null);

    const handleMouseEnter = (e: React.MouseEvent<HTMLSpanElement>) => {
        if (type === "Improvement") {
            const imp = improvementsMap.get(name);
            if (!imp) return;
            setHovered(createHoveredImprovement(imp, e));
        } else if (type === "District") {
            const dist = districtsMap.get(name);
            if (!dist) return;
            setHovered(createHoveredDistrict(dist, e));
        }
    };

    const handleMouseLeave = () => setHovered(null);

    return (
        <div style={{ display: "inline-block" }}>
            {prefix}
            <span
                style={{ textDecoration: "underline", cursor: "pointer" }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {name}
            </span>

            {/* Pass the entire 'hovered' object directly to the child tooltips */}
            {hovered && type === "Improvement" && (
                <ImprovementTooltip hoveredImprovement={hovered} />
            )}
            {hovered && type === "District" && (
                <DistrictTooltip hoveredDistrict={hovered} />
            )}
        </div>
    );
};

export default HoverableItem;
