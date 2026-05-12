import React, { useState } from "react";
import ImprovementTooltip from "../../Tooltips/ImprovementTooltip";
import DistrictTooltip from "../../Tooltips/DistrictTooltip";
import UnitTooltip from "../../Tooltips/UnitTooltip";
import {
    createHoveredImprovement,
    createHoveredDistrict,
    createHoveredUnit,
    HoveredWithCoords,
} from "../../Tooltips/hoverHelpers";
import { useGameData } from "@/context/GameDataContext";
import type { District, Improvement, Unit } from "@/types/dataTypes";
import {
    selectDistrictByKey,
    selectImprovementByKey,
    useDistrictImprovementStore,
} from "@/stores/districtImprovementStore";

type HoverType = "Constructible" | "Unit";

interface HoverableItemProps {
    type: HoverType;
    name: string;       // display name
    unlockKey: string;  // key used for lookups (districtKey / improvementKey / unitKey)
    prefix?: string;
}

const HoverableItem: React.FC<HoverableItemProps> = ({ type, name, unlockKey, prefix = "" }) => {
    const { units } = useGameData();
    const improvement = useDistrictImprovementStore(selectImprovementByKey(unlockKey));
    const district = useDistrictImprovementStore(selectDistrictByKey(unlockKey));

    const [hoveredImp, setHoveredImp] = useState<HoveredWithCoords<Improvement> | null>(null);
    const [hoveredDist, setHoveredDist] = useState<HoveredWithCoords<District> | null>(null);
    const [hoveredUnit, setHoveredUnit] = useState<HoveredWithCoords<Unit> | null>(null);

    const clearHover = () => {
        setHoveredImp(null);
        setHoveredDist(null);
        setHoveredUnit(null);
    };

    const handleMouseEnter = (e: React.MouseEvent<HTMLSpanElement>) => {
        const key = (unlockKey ?? "").trim();
        if (!key) return;

        if (type === "Unit") {
            const unit = units.get(key);
            if (!unit) return;

            setHoveredImp(null);
            setHoveredDist(null);
            setHoveredUnit(createHoveredUnit(unit, e));
            return;
        }

        if (improvement) {
            setHoveredDist(null);
            setHoveredUnit(null);
            setHoveredImp(createHoveredImprovement(improvement, e));
            return;
        }

        if (district) {
            setHoveredImp(null);
            setHoveredUnit(null);
            setHoveredDist(createHoveredDistrict(district, e));
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
            {hoveredUnit && <UnitTooltip hoveredUnit={hoveredUnit} />}
        </div>
    );
};

export default HoverableItem;
