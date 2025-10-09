import { useEffect } from "react";

interface Props {
    selectedFaction: string;
    maxEra: number;
    getBackgroundUrl: (era: number) => string;
}

const preloadedFactions = new Set<string>();

export default function BackgroundPreloader({ selectedFaction, maxEra, getBackgroundUrl }: Props) {
    useEffect(() => {
        if (!selectedFaction || preloadedFactions.has(selectedFaction)) return;

        for (let era = 1; era <= maxEra; era++) {
            const img = new Image();
            img.src = getBackgroundUrl(era);
        }

        preloadedFactions.add(selectedFaction);
    }, [selectedFaction, maxEra, getBackgroundUrl]);

    return null;
}
