import React, { useState, useRef } from "react";
import ImprovementTooltip from "../../Tooltips/ImprovementTooltip";
import DistrictTooltip from "../../Tooltips/DistrictTooltip";
import { improvementsMap } from "../../../types/improvementsMap";
import { districtsMap } from "../../../types/districtsMap";
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
    useContainer?: boolean; // new optional prop
}

const HoverableItem: React.FC<HoverableItemProps> = ({
                                                         type,
                                                         name,
                                                         prefix,
                                                         useContainer = true, // default true
                                                     }) => {
    const [hovered, setHovered] = useState<HoveredWithCoords<any> | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseEnter = (e: React.MouseEvent<HTMLSpanElement>) => {
        const container = useContainer ? containerRef.current ?? undefined : undefined;

        if (type === "Improvement") {
            const imp = improvementsMap.get(name);
            if (!imp) return;
            setHovered(createHoveredImprovement(imp, e, container));
        } else if (type === "District") {
            const dist = districtsMap.get(name);
            if (!dist) return;
            setHovered(createHoveredDistrict(dist, e, container));
        }
    };

    const handleMouseLeave = () => setHovered(null);

    return (
        <div ref={containerRef} style={{ position: "relative", display: "inline-block" }}>
            {prefix}
            <span
                style={{ textDecoration: "underline", cursor: "pointer" }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {name}
            </span>

            {hovered && type === "Improvement" && (
                <ImprovementTooltip
                    hoveredImprovement={{
                        ...hovered.data,
                        coords: hovered.coords,
                    }}
                />
            )}
            {hovered && type === "District" && (
                <DistrictTooltip
                    hoveredDistrict={{
                        ...hovered.data,
                        coords: hovered.coords,
                    }}
                />
            )}
        </div>
    );
};

export default HoverableItem;
