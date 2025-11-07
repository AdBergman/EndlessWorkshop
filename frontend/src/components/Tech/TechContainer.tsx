import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import TechTree from "@/components/Tech/TechTree";
import SpreadSheetView from "@/components/Tech/views/SpreadSheetView";
import { ERA_THRESHOLDS, Tech } from "@/types/dataTypes";
import { useGameData } from "@/context/GameDataContext";
import "./TechContainer.css";

const MAX_ERA = 6;
const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, "_");

const TechContainer: React.FC = () => {
    const {
        selectedFaction,
        setSelectedFaction,
        selectedTechs,
        setSelectedTechs,
        techs,
    } = useGameData();

    const [firstEraLoaded, setFirstEraLoaded] = useState(false);

    // --- Hook: Load shared build from URL once ---
    useSharedBuildLoader(setSelectedTechs);

    // --- Derive selected tech objects ---
    const selectedTechObjects = useMemo(() => {
        const techNameSet = new Set(selectedTechs);
        return Array.from(techs.values()).filter((t) => techNameSet.has(t.name));
    }, [selectedTechs, techs]);

    // --- Era management hook ---
    const eraController = useEraController(selectedTechObjects);

    // --- Deep link handler for /tech?faction=kin&tech=strength_of_garin ---
    useDeepLinkedTech({
        techs,
        selectedFaction,
        setSelectedFaction,
        setSelectedTechs,
        setEra: eraController.setEra,
    });

    // --- Preload first era for selected faction and show main container when loaded ---
    useEffect(() => {
        if (!selectedFaction) return;
        const img = new Image();
        img.src = `/graphics/techEraScreens/${selectedFaction.uiLabel.toLowerCase()}_era_1.png`;
        img.onload = () => setFirstEraLoaded(true);
        img.onerror = () => setFirstEraLoaded(true);
        return () => {
            img.onload = null;
            img.onerror = null;
        };
    }, [selectedFaction]);

    // --- Preload all remaining eras in the background ---
    useEffect(() => {
        if (!selectedFaction) return;
        for (let e = 1; e <= MAX_ERA; e++) {
            const img = new Image();
            img.src =
                e === 6
                    ? "/graphics/techEraScreens/default_era_6.png"
                    : `/graphics/techEraScreens/${selectedFaction.uiLabel.toLowerCase()}_era_${e}.png`;
        }
    }, [selectedFaction]);

    return (
        <main className={`main-container ${firstEraLoaded ? "loaded" : ""}`}>
            {firstEraLoaded && (
                <>
                    <TechTree
                        era={eraController.era}
                        maxUnlockedEra={eraController.maxUnlockedEra}
                        onEraChange={(dir) =>
                            dir === "next"
                                ? eraController.handleNextEra()
                                : eraController.handlePrevEra()
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

//
// ------------------------ INTERNAL HOOKS --------------------------------- //
//

/** Handles loading of shared builds from a ?share=UUID param */
function useSharedBuildLoader(setSelectedTechs: (names: string[]) => void) {
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const shareUuid = params.get("share");
        if (!shareUuid) return;

        let cancelled = false;
        const loadBuild = async () => {
            try {
                const res = await fetch(`/api/builds/${shareUuid}`);
                if (!res.ok) throw new Error("Build not found");
                const data = await res.json();
                const validTechs = data.techIds.filter((name: string) => !!name);
                if (!cancelled) setSelectedTechs(validTechs);
            } catch (err) {
                console.error("Failed to load shared build", err);
            }
        };
        loadBuild();
        return () => { cancelled = true; };
    }, [setSelectedTechs]);
}

/** Handles deep-link routing for /tech?faction=X&tech=Y */
function useDeepLinkedTech({
                               techs,
                               selectedFaction,
                               setSelectedFaction,
                               setSelectedTechs,
                               setEra,
                           }: {
    techs: Map<string, Tech>;
    selectedFaction: any;
    setSelectedFaction: (faction: any) => void;
    setSelectedTechs: (names: string[]) => void;
    setEra: (era: number) => void;
}) {
    const [params] = useSearchParams();
    const appliedRef = useRef(false);

    useEffect(() => {
        if (appliedRef.current) return;
        if (techs.size === 0) return;

        const factionParam = params.get("faction");
        const techParam = params.get("tech");
        if (!factionParam || !techParam) return;

        appliedRef.current = true;

        // 1️⃣ Select faction
        const fi = {
            isMajor: true,
            enumFaction: factionParam.toUpperCase() as any,
            minorName: null,
            uiLabel: factionParam.toLowerCase(),
        };

        if (!selectedFaction.isMajor || selectedFaction.enumFaction !== fi.enumFaction) {
            setSelectedFaction(fi);
        }

        // 2️⃣ Find and select tech
        const match = Array.from(techs.values()).find(
            (t) => normalize(t.name) === normalize(techParam)
        );

        if (match) {
            setSelectedTechs([match.name]);
            setEra(match.era);

            // ✅ Clean the URL silently (no reload)
            const newUrl = window.location.origin + "/tech";
            window.history.replaceState({}, "", newUrl);
        } else {
            console.warn("⚠️ No tech match found for", techParam);
        }
    }, [techs]);
}

/** Handles era progression logic and unlocks */
function useEraController(selectedTechObjects: Tech[]) {
    const [era, setEra] = useState(1);

    const handlePrevEra = useCallback(
        () => setEra((prev) => Math.max(1, prev - 1)),
        []
    );
    const handleNextEra = useCallback(
        () => setEra((prev) => Math.min(MAX_ERA, prev + 1)),
        []
    );

    const maxUnlockedEra = useMemo(() => {
        const eraCounts = Array(MAX_ERA).fill(0);
        selectedTechObjects.forEach((t) => {
            if (t.era >= 1 && t.era <= MAX_ERA) eraCounts[t.era - 1]++;
        });

        let unlocked = 1;
        for (let i = 2; i <= MAX_ERA; i++) {
            const required = ERA_THRESHOLDS[i];
            const totalSelectedPrev = eraCounts
                .slice(0, i - 1)
                .reduce((a, b) => a + b, 0);
            if (totalSelectedPrev >= required) unlocked = i;
            else break;
        }
        return unlocked;
    }, [selectedTechObjects]);

    return { era, setEra, maxUnlockedEra, handleNextEra, handlePrevEra };
}
