import React, { ReactNode, useCallback, useState } from "react";
import GameDataContext from "./GameDataContext";
import ShareBuildHydrator from "@/context/ShareBuildHydrator";
import { useSavedTechBuildActions } from "@/features/techBuilds/useSavedTechBuildActions";

interface Props {
    children: ReactNode;
}

const GameDataProvider: React.FC<Props> = ({ children }) => {
    const [sharedBuildLoaded, setSharedBuildLoaded] = useState(false);
    const { applySavedTechBuild, createSavedTechBuild, getSavedBuild } = useSavedTechBuildActions();
    const [isProcessingSharedBuild, setIsProcessingSharedBuild] = useState(
        () => !!new URLSearchParams(window.location.search).get("share")
    );
    const handleSharedBuildLoaded = useCallback(() => setSharedBuildLoaded(true), []);

    return (
        <GameDataContext.Provider
            value={{
                createSavedTechBuild,
                getSavedBuild,

                isProcessingSharedBuild,
            }}
        >
            <ShareBuildHydrator
                sharedBuildLoaded={sharedBuildLoaded}
                onSharedBuildLoaded={handleSharedBuildLoaded}
                onProcessingChange={setIsProcessingSharedBuild}
                applySavedTechBuild={applySavedTechBuild}
            />
            {children}
        </GameDataContext.Provider>
    );
};

export default GameDataProvider;
