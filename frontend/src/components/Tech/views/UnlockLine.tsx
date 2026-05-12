import React, { useMemo } from "react";
import HoverableItem from "./HoverableItem";
import type { TechUnlockRef } from "@/types/dataTypes";
import { useGameData } from "@/context/GameDataContext";
import { selectDistrictsByKey, useDistrictStore } from "@/stores/districtStore";
import { selectImprovementsByKey, useImprovementStore } from "@/stores/improvementStore";
import { resolveConstructibleUnlock } from "@/utils/unlocks";

interface UnlockLineProps {
    unlock: TechUnlockRef;
}

const UnlockLine: React.FC<UnlockLineProps> = ({ unlock }) => {
    const { units } = useGameData();

    const unlockType = (unlock.unlockType ?? "").trim().toUpperCase();
    const unlockKey = (unlock.unlockKey ?? "").trim();
    const districtsByKey = useDistrictStore(selectDistrictsByKey);
    const improvementsByKey = useImprovementStore(selectImprovementsByKey);

    const resolved = useMemo(() => {
        if (!unlockKey || unlockType !== "CONSTRUCTIBLE") return null;

        return resolveConstructibleUnlock(unlock, {
            districtsByKey,
            improvementsByKey,
            units,
        });
    }, [unlock, unlockKey, unlockType, districtsByKey, improvementsByKey, units]);

    if (!resolved) return null;

    return (
        <HoverableItem
            type={resolved.kind === "Unit" ? "Unit" : "Constructible"}
            name={resolved.displayName}
            unlockKey={unlockKey}
            constructibleKind={resolved.kind === "Unit" ? undefined : resolved.kind}
            prefix={`${resolved.kind}: `}
        />
    );
};

export default UnlockLine;
