import React, { useState } from "react";
import ImprovementTooltip from "../../Tooltips/ImprovementTooltip";
import DistrictTooltip from "../../Tooltips/DistrictTooltip";
import { createHoveredImprovement, createHoveredDistrict, HoveredWithCoords } from "../../Tooltips/hoverHelpers";
import { useGameData } from "@/context/GameDataContext";
import type { District, Improvement } from "@/types/dataTypes";

type HoverType = "Constructible" | "Unit";

interface HoverableItemProps {
    type: HoverType;
    name: string;       // display name
    unlockKey: string;  // key used for lookups (districtKey / improvementKey)
    prefix?: string;
}

const HoverableItem: React.FC<HoverableItemProps> = ({ type, name, unlockKey, prefix = "" }) => {
    const { improvements, districts } = useGameData();

    const [hoveredImp, setHoveredImp] = useState<HoveredWithCoords<Improvement> | null>(null);
    const [hoveredDist, setHoveredDist] = useState<HoveredWithCoords<District> | null>(null);

    const clearHover = () => {
        setHoveredImp(null);
        setHoveredDist(null);
    };

    const handleMouseEnter = (e: React.MouseEvent<HTMLSpanElement>) => {
        if (type === "Unit") return;

        const key = (unlockKey ?? "").trim();
        if (!key) return;

        const imp = improvements.get(key);
        if (imp) {
            setHoveredDist(null);
            setHoveredImp(createHoveredImprovement(imp, e));
            return;
        }

        const dist = districts.get(key);
        if (dist) {
            setHoveredImp(null);
            setHoveredDist(createHoveredDistrict(dist, e));
        }
    };

    return (
        <div style={{ display: "inline-block" }}>
            {prefix}
            <span
                style={{ textDecoration: "underline", cursor: "pointer" }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={clearHover}
            >
                {name}
            </span>

            {hoveredImp && <ImprovementTooltip hoveredImprovement={hoveredImp} />}
            {hoveredDist && <DistrictTooltip hoveredDistrict={hoveredDist} />}
        </div>
    );
};

export default HoverableItem;