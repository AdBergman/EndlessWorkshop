import { useEffect } from "react";
import type { FactionInfo } from "@/types/dataTypes";

interface Props {
    selectedFaction: FactionInfo;
    maxEra: number;
    getBackgroundUrl: (factionLabel: string, era: number) => string;
}

const preloadedFactions = new Set<string>();

export default function BackgroundPreloader({ selectedFaction, maxEra, getBackgroundUrl }: Props) {
    useEffect(() => {
        if (!selectedFaction || preloadedFactions.has(selectedFaction.uiLabel)) return;

        for (let era = 1; era <= maxEra; era++) {
            const img = new Image();
            img.src = getBackgroundUrl(selectedFaction.uiLabel, era);
        }

        preloadedFactions.add(selectedFaction.uiLabel);
    }, [selectedFaction, maxEra, getBackgroundUrl]);

    return null;
}
