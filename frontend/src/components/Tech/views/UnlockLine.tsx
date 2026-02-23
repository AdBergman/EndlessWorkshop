import React, { useMemo } from "react";
import HoverableItem from "./HoverableItem";
import type { TechUnlockRef } from "@/types/dataTypes";
import { useGameData } from "@/context/GameDataContext";

interface UnlockLineProps {
    unlock: TechUnlockRef;
}

const UnlockLine: React.FC<UnlockLineProps> = ({ unlock }) => {
    const { districts, improvements, units } = useGameData();

    const unlockType = (unlock.unlockType ?? "").trim().toUpperCase();
    const unlockKey = (unlock.unlockKey ?? "").trim();

    if (!unlockKey) return null;

    // We only render District / Improvement / Unit unlocks.
    // In your model they are all typically CONSTRUCTIBLE, and units have Unit_* keys.
    if (unlockType !== "CONSTRUCTIBLE") return null;

    const resolved = useMemo(() => {
        // Units
        if (unlockKey.startsWith("Unit_")) {
            const unit = units.get(unlockKey);
            if (unit) {
                return {
                    kind: "Unit" as const,
                    display: unit.displayName ?? unlockKey,
                    hoverType: "Unit" as const,
                };
            }
            return null;
        }

        // Districts
        const dist = districts.get(unlockKey);
        if (dist) {
            return {
                kind: "District" as const,
                display: dist.displayName ?? unlockKey,
                hoverType: "Constructible" as const,
            };
        }

        // Improvements
        const imp = improvements.get(unlockKey);
        if (imp) {
            return {
                kind: "Improvement" as const,
                display: imp.displayName ?? unlockKey,
                hoverType: "Constructible" as const,
            };
        }

        return null;
    }, [unlockKey, units, districts, improvements]);

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