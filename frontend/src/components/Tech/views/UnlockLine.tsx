import React, { useMemo } from "react";
import HoverableItem from "./HoverableItem";
import type { TechUnlockRef } from "@/types/dataTypes";
import { useGameData } from "@/context/GameDataContext";

interface UnlockLineProps {
    unlock: TechUnlockRef;
}

const UnlockLine: React.FC<UnlockLineProps> = ({ unlock }) => {
    const { districts, improvements } = useGameData();

    const unlockType = (unlock.unlockType ?? "").trim().toUpperCase();
    const unlockKey = (unlock.unlockKey ?? "").trim();

    // Only show constructibles
    if (unlockType !== "CONSTRUCTIBLE") return null;
    if (!unlockKey) return null;

    const resolved = useMemo(() => {
        const dist = districts.get(unlockKey);
        if (dist) {
            return {
                kind: "District" as const,
                display: dist.displayName ?? unlockKey,
            };
        }

        const imp = improvements.get(unlockKey);
        if (imp) {
            return {
                kind: "Improvement" as const,
                display: imp.displayName ?? unlockKey,
            };
        }

        return null;
    }, [unlockKey, districts, improvements]);

    // If we cannot resolve → do not render anything
    if (!resolved) return null;

    return (
        <HoverableItem
            type="Constructible"
            name={resolved.display}
            unlockKey={unlockKey}
            prefix={`${resolved.kind}: `}
        />
    );
};

export default UnlockLine;