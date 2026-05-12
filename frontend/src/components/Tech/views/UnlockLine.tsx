import React, { useMemo } from "react";
import HoverableItem from "./HoverableItem";
import type { TechUnlockRef } from "@/types/dataTypes";
import { useGameData } from "@/context/GameDataContext";
import {
    selectDistrictByKey,
    selectImprovementByKey,
    useDistrictImprovementStore,
} from "@/stores/districtImprovementStore";

interface UnlockLineProps {
    unlock: TechUnlockRef;
}

const UnlockLine: React.FC<UnlockLineProps> = ({ unlock }) => {
    const { units } = useGameData();

    const unlockType = (unlock.unlockType ?? "").trim().toUpperCase();
    const unlockKey = (unlock.unlockKey ?? "").trim();
    const district = useDistrictImprovementStore(selectDistrictByKey(unlockKey));
    const improvement = useDistrictImprovementStore(selectImprovementByKey(unlockKey));

    const unit = unlockKey.startsWith("Unit_") ? units.get(unlockKey) : undefined;

    const resolved = useMemo(() => {
        if (!unlockKey || unlockType !== "CONSTRUCTIBLE") return null;

        // Units
        if (unit) {
            return {
                kind: "Unit" as const,
                display: unit.displayName ?? unlockKey,
                hoverType: "Unit" as const,
            };
        }

        // Districts
        if (district) {
            return {
                kind: "District" as const,
                display: district.displayName ?? unlockKey,
                hoverType: "Constructible" as const,
            };
        }

        // Improvements
        if (improvement) {
            return {
                kind: "Improvement" as const,
                display: improvement.displayName ?? unlockKey,
                hoverType: "Constructible" as const,
            };
        }

        return null;
    }, [unlockKey, unlockType, unit, district, improvement]);

    if (!resolved) return null;

    return (
        <HoverableItem
            type={resolved.hoverType}
            name={resolved.display}
            unlockKey={unlockKey}
            prefix={`${resolved.kind}: `}
        />
    );
};

export default UnlockLine;
