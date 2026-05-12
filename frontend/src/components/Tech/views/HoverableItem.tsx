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
import { selectDistrictsByKey, useDistrictStore } from "@/stores/districtStore";
import { selectImprovementsByKey, useImprovementStore } from "@/stores/improvementStore";
import { resolveConstructibleUnlock } from "@/utils/unlocks";
import type { ConstructibleUnlockKind } from "@/utils/unlocks";

type HoverType = "Constructible" | "Unit";

interface HoverableItemProps {
    type: HoverType;
    name: string;       // display name
    unlockKey: string;  // key used for lookups (districtKey / improvementKey / unitKey)
    constructibleKind?: Exclude<ConstructibleUnlockKind, "Unit">;
    prefix?: string;
}

const HoverableItem: React.FC<HoverableItemProps> = ({
    type,
    name,
    unlockKey,
    constructibleKind,
    prefix = "",
}) => {
    const { units } = useGameData();
    const districtsByKey = useDistrictStore(selectDistrictsByKey);
    const improvementsByKey = useImprovementStore(selectImprovementsByKey);

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

        const resolved = resolveConstructibleUnlock(
            {
                unlockType: "Constructible",
                unlockKey: key,
                constructibleKind,
            },
            { districtsByKey, improvementsByKey, units }
        );

        if (resolved?.kind === "Improvement") {
            setHoveredDist(null);
            setHoveredUnit(null);
            setHoveredImp(createHoveredImprovement(resolved.improvement, e));
            return;
        }

        if (resolved?.kind === "District") {
            setHoveredImp(null);
            setHoveredUnit(null);
            setHoveredDist(createHoveredDistrict(resolved.district, e));
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
