import React, { useState } from "react";
import ImprovementTooltip from "../../Tooltips/ImprovementTooltip";
import DistrictTooltip from "../../Tooltips/DistrictTooltip";
import { createHoveredImprovement, createHoveredDistrict, HoveredWithCoords } from "../../Tooltips/hoverHelpers";
import { useGameData } from "@/context/GameDataContext";

type HoverType = "Improvement" | "District";

interface HoverableItemProps {
    type: HoverType;
    name: string;
    prefix: string;
}

const HoverableItem: React.FC<HoverableItemProps> = ({ type, name, prefix }) => {
    const { improvements, districts } = useGameData();
    const [hovered, setHovered] = useState<HoveredWithCoords<any> | null>(null);

    const handleMouseEnter = (e: React.MouseEvent<HTMLSpanElement>) => {
        if (type === "Improvement") {
            const imp = improvements.get(name);
            if (!imp) return;
            setHovered(createHoveredImprovement(imp, e));
        } else if (type === "District") {
            const dist = districts.get(name);
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

            {hovered && type === "Improvement" && <ImprovementTooltip hoveredImprovement={hovered} />}
            {hovered && type === "District" && <DistrictTooltip hoveredDistrict={hovered} />}
        </div>
    );
};

export default HoverableItem;
