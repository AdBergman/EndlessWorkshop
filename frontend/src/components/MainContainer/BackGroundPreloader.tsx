import { useEffect } from "react";

interface Props {
    currentEra: number;
    maxEra: number;
    getBackgroundUrl: (era: number) => string;
}

export default function BackgroundPreloader({ currentEra, maxEra, getBackgroundUrl }: Props) {
    useEffect(() => {
        const next = currentEra + 1;
        if (next <= maxEra) {
            const img = new Image();
            img.src = getBackgroundUrl(next);
        }
    }, [currentEra, maxEra, getBackgroundUrl]);

    return null; // nothing visible
}
