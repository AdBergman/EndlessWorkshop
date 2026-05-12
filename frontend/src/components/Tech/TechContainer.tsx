// TechContainer.tsx

import React, {useEffect, useMemo, useState} from "react";
import TechTree from "@/components/Tech/TechTree";
import SpreadSheetView from "@/components/Tech/views/SpreadSheetView";
import {getTechsByKeys, selectTechs, selectTechsByKey, useTechStore} from "@/stores/techStore";
import {selectSelectedTechs, useTechPlannerStore} from "@/stores/techPlannerStore";
import {selectSelectedFaction, useFactionSelectionStore} from "@/stores/factionSelectionStore";
import {useTechRouteHydration} from "@/components/Tech/useTechRouteHydration";
import {MAX_TECH_ERA, useTechEraController} from "@/components/Tech/useTechEraController";
import "./TechContainer.css";

const TechContainer: React.FC = () => {
    const allTechData = useTechStore(selectTechs);
    const techsByKey = useTechStore(selectTechsByKey);
    const selectedFaction = useFactionSelectionStore(selectSelectedFaction);
    const selectedTechs = useTechPlannerStore(selectSelectedTechs);

    const [firstEraLoaded, setFirstEraLoaded] = useState(false);
    const [importToast, setImportToast] = useState<string | null>(null);

    const selectedTechObjects = useMemo(() => {
        return getTechsByKeys(selectedTechs, techsByKey);
    }, [selectedTechs, techsByKey]);

    const eraController = useTechEraController(selectedTechObjects);

    useTechRouteHydration({
        setEra: eraController.setEra,
        setImportToast,
    });

    useEffect(() => {
        if (!selectedFaction) return;

        let cancelled = false;
        setFirstEraLoaded(false);

        const preload = new Image();
        preload.src = `/graphics/techEraScreens/${selectedFaction.uiLabel.toLowerCase()}_era_1.webp`;

        preload.onload = () => {
            if (!cancelled) setFirstEraLoaded(true);
        };
        preload.onerror = () => {
            if (!cancelled) setFirstEraLoaded(true);
        };

        return () => {
            cancelled = true;
            preload.onload = null;
            preload.onerror = null;
        };
    }, [selectedFaction]);

    useEffect(() => {
        if (!selectedFaction || !firstEraLoaded) return;

        for (let eraIndex = 2; eraIndex <= MAX_TECH_ERA; eraIndex++) {
            const img = new Image();
            img.src = `/graphics/techEraScreens/${selectedFaction.uiLabel.toLowerCase()}_era_${eraIndex}.webp`;
        }
    }, [selectedFaction, firstEraLoaded]);

    return (
        <main className={`main-container ${firstEraLoaded ? "loaded" : ""}`}>
            <h1 className="seo-hidden">
                Endless Legend 2 Tech Tree Planner, Explorer, and Build Sharing Tool
            </h1>

            <div className="seo-hidden" aria-hidden="true">
                {allTechData.map((tech) => (
                    <span key={tech.techKey}>{tech.name}. </span>
                ))}
            </div>

            {firstEraLoaded && (
                <>
                    {importToast ? (
                        <div
                            style={{
                                position: "absolute",
                                top: 12,
                                left: 12,
                                zIndex: 50,
                                padding: "8px 10px",
                                borderRadius: 10,
                                border: "1px solid rgba(255,255,255,0.14)",
                                background: "rgba(0,0,0,0.45)",
                                color: "rgba(255,255,255,0.92)",
                                fontSize: 12,
                                pointerEvents: "none",
                            }}
                        >
                            {importToast}
                        </div>
                    ) : null}

                    <TechTree
                        era={eraController.era}
                        maxUnlockedEra={eraController.maxUnlockedEra}
                        onEraChange={(direction) =>
                            direction === "next" ? eraController.handleNextEra() : eraController.handlePrevEra()
                        }
                    />

                    <div className="view-container">
                        <SpreadSheetView />
                    </div>
                </>
            )}
        </main>
    );
};

export default TechContainer;
