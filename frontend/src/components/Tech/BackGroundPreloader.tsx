import { useEffect } from "react";
import { FactionInfo } from "@/context/GameDataContext"; // Assuming FactionInfo is exported from GameDataContext

interface Props {
    selectedFaction: FactionInfo; // Updated type
    maxEra: number;
    getBackgroundUrl: (factionLabel: string, era: number) => string; // Updated signature
}

const preloadedFactions = new Set<string>();

export default function BackgroundPreloader({ selectedFaction, maxEra, getBackgroundUrl }: Props) {
    useEffect(() => {
        if (!selectedFaction || preloadedFactions.has(selectedFaction.uiLabel)) return; // Use uiLabel

        for (let era = 1; era <= maxEra; era++) {
            const img = new Image();
            img.src = getBackgroundUrl(selectedFaction.uiLabel, era); // Pass uiLabel
        }

        preloadedFactions.add(selectedFaction.uiLabel); // Use uiLabel
    }, [selectedFaction, maxEra, getBackgroundUrl]);

    return null;
}
