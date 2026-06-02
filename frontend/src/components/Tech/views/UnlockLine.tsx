import React, { useMemo } from "react";
import HoverableItem from "./HoverableItem";
import type { TechUnlockRef } from "@/types/dataTypes";
import { selectDistrictsByKey, useDistrictStore } from "@/stores/districtStore";
import { selectImprovementsByKey, useImprovementStore } from "@/stores/improvementStore";
import { selectUnitsByKey, useUnitStore } from "@/stores/unitStore";
import { getFallbackUnlockDescription, resolveConstructibleUnlock } from "@/utils/unlocks";
import { renderDescriptionLine } from "@/lib/descriptionLine/descriptionLineRenderer";
import { TechUnlockIcon } from "@/features/icons/TechUnlockIcon";

interface UnlockLineProps {
    unlock: TechUnlockRef;
}

const UnlockLine: React.FC<UnlockLineProps> = ({ unlock }) => {
    const unlockKey = (unlock.unlockKey ?? "").trim();
    const districtsByKey = useDistrictStore(selectDistrictsByKey);
    const improvementsByKey = useImprovementStore(selectImprovementsByKey);
    const unitsByKey = useUnitStore(selectUnitsByKey);

    const resolved = useMemo(() => {
        if (!unlockKey) return null;

        return resolveConstructibleUnlock(unlock, {
            districtsByKey,
            improvementsByKey,
            unitsByKey,
        });
    }, [unlock, unlockKey, districtsByKey, improvementsByKey, unitsByKey]);

    const fallback = useMemo(() => {
        if (resolved) return null;
        return getFallbackUnlockDescription(unlock);
    }, [resolved, unlock]);

    if (!resolved && !fallback) return null;

    if (fallback) {
        return (
            <div className="techSheetUnlockLine techSheetUnlockLine--wrapped">
                <TechUnlockIcon unlock={unlock} resolvedKind={fallback.kind} />
                <span>
                    <span>{`${fallback.kind}: `}</span>
                    <span>{fallback.key}</span>
                    {fallback.descriptionLines.map((line, index) => (
                        <span key={`${fallback.key}-${index}`}>
                            {index === 0 ? " - " : "; "}
                            {renderDescriptionLine(line)}
                        </span>
                    ))}
                </span>
            </div>
        );
    }

    if (!resolved) return null;

    return (
        <div className="techSheetUnlockLine">
            <TechUnlockIcon unlock={unlock} resolvedKind={resolved.kind} />
            <HoverableItem
                type={resolved.kind === "Unit" ? "Unit" : "Constructible"}
                name={resolved.displayName}
                unlockKey={unlockKey}
                constructibleKind={resolved.kind === "Unit" ? undefined : resolved.kind}
                prefix={`${resolved.kind}: `}
            />
        </div>
    );
};

export default UnlockLine;
