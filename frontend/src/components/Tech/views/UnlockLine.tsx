import React, { useMemo } from "react";
import HoverableItem from "./HoverableItem";
import type { TechUnlockRef } from "@/types/dataTypes";
import { selectDistrictsByKey, useDistrictStore } from "@/stores/districtStore";
import { selectImprovementsByKey, useImprovementStore } from "@/stores/improvementStore";
import { selectUnitsByKey, useUnitStore } from "@/stores/unitStore";
import { resolveConstructibleUnlock } from "@/utils/unlocks";

interface UnlockLineProps {
    unlock: TechUnlockRef;
}

const UnlockLine: React.FC<UnlockLineProps> = ({ unlock }) => {
    const unlockType = (unlock.unlockType ?? "").trim().toUpperCase();
    const unlockKey = (unlock.unlockKey ?? "").trim();
    const districtsByKey = useDistrictStore(selectDistrictsByKey);
    const improvementsByKey = useImprovementStore(selectImprovementsByKey);
    const unitsByKey = useUnitStore(selectUnitsByKey);

    const resolved = useMemo(() => {
        if (!unlockKey || unlockType !== "CONSTRUCTIBLE") return null;

        return resolveConstructibleUnlock(unlock, {
            districtsByKey,
            improvementsByKey,
            unitsByKey,
        });
    }, [unlock, unlockKey, unlockType, districtsByKey, improvementsByKey, unitsByKey]);

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
