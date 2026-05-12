import { useCallback, useMemo, useState } from "react";
import { ERA_THRESHOLDS, type Tech } from "@/types/dataTypes";

export const MAX_TECH_ERA = 6;

export function useTechEraController(selectedTechObjects: Tech[]) {
    const [era, setEra] = useState(1);

    const handlePrevEra = useCallback(() => setEra((prev) => Math.max(1, prev - 1)), []);
    const handleNextEra = useCallback(() => setEra((prev) => Math.min(MAX_TECH_ERA, prev + 1)), []);

    const maxUnlockedEra = useMemo(() => {
        const eraCounts = Array(MAX_TECH_ERA).fill(0);

        selectedTechObjects.forEach((tech) => {
            if (tech.era >= 1 && tech.era <= MAX_TECH_ERA) eraCounts[tech.era - 1]++;
        });

        let unlockedEra = 1;
        for (let eraIndex = 2; eraIndex <= MAX_TECH_ERA; eraIndex++) {
            const required = ERA_THRESHOLDS[eraIndex];
            const totalSelectedPrev = eraCounts.slice(0, eraIndex - 1).reduce((a, b) => a + b, 0);
            if (totalSelectedPrev >= required) unlockedEra = eraIndex;
            else break;
        }

        return unlockedEra;
    }, [selectedTechObjects]);

    return { era, setEra, maxUnlockedEra, handleNextEra, handlePrevEra };
}
