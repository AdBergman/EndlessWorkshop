import React, {useCallback, useEffect, useMemo, useState} from 'react';
import TechTree from '../TechTree/TechTree';
import SpreadSheetView from '../TechTree/views/SpreadSheetView';
import BackgroundPreloader from './BackGroundPreloader';
import {ERA_THRESHOLDS, Tech} from '@/types/dataTypes';
import {useGameData} from '@/context/GameDataContext';
import './MainContainer.css';

const MAX_ERA = 6;

const MainContainer: React.FC = () => {
    const { selectedFaction, selectedTechs, setSelectedTechs, techs } = useGameData();

    // --- Hook: Load shared build from URL once ---
    useSharedBuildLoader(setSelectedTechs);

    // --- Derive selected tech objects ---
    const selectedTechObjects = useMemo(() => {
        const techNameSet = new Set(selectedTechs);
        return Array.from(techs.values()).filter(t => techNameSet.has(t.name));
    }, [selectedTechs, techs]);

    // --- Era management hook ---
    const { era, maxUnlockedEra, handleNextEra, handlePrevEra } = useEraController(selectedTechObjects);

    // --- Background URL helper ---
    const getBackgroundUrl = useCallback(
        (eraNumber: number) => `/graphics/techEraScreens/${selectedFaction.toLowerCase()}_era_${eraNumber}.png`,
        [selectedFaction]
    );

    return (
        <main className="main-container">
            <TechTree
                era={era}
                maxUnlockedEra={maxUnlockedEra}
                onEraChange={dir => (dir === 'next' ? handleNextEra() : handlePrevEra())}
            />

            <BackgroundPreloader
                currentEra={era}
                maxEra={maxUnlockedEra}
                getBackgroundUrl={getBackgroundUrl}
            />

            <div className="view-container">
                <SpreadSheetView />
            </div>
        </main>
    );
};

export default MainContainer;




// ------------------------ INTERNAL HOOKS --------------------------------- //
// Hook to load shared build once from URL
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

                // filter only valid techs (just in case)
                const validTechs = data.techIds.filter((name: string) => !!name);
                if (!cancelled) setSelectedTechs(validTechs);
            } catch (err) {
                console.error("Failed to load shared build", err);
            }
        };

        loadBuild();

        return () => {
            cancelled = true;
        };
    }, [setSelectedTechs]);
}

// Hook to manage era and maxUnlockedEra
function useEraController(selectedTechObjects: Tech[]) {
    const [era, setEra] = useState(1);

    const handlePrevEra = useCallback(() => setEra(prev => Math.max(1, prev - 1)), []);
    const handleNextEra = useCallback(() => setEra(prev => Math.min(MAX_ERA, prev + 1)), []);

    const maxUnlockedEra = useMemo(() => {
        const eraCounts = Array(MAX_ERA).fill(0);
        selectedTechObjects.forEach(t => {
            if (t.era >= 1 && t.era <= MAX_ERA) eraCounts[t.era - 1]++;
        });

        let unlocked = 1;
        for (let i = 2; i <= MAX_ERA; i++) {
            const required = ERA_THRESHOLDS[i];
            const totalSelectedPrev = eraCounts.slice(0, i - 1).reduce((a, b) => a + b, 0);
            if (totalSelectedPrev >= required) unlocked = i;
            else break;
        }
        return unlocked;
    }, [selectedTechObjects]);

    return { era, maxUnlockedEra, handleNextEra, handlePrevEra };
}
