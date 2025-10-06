import React, { useEffect, useState, useMemo } from 'react';
import TechTree from '../TechTree/TechTree';
import SpreadSheetView from '../TechTree/views/SpreadSheetView';
import BackgroundPreloader from './BackGroundPreloader';
import { Tech, ERA_THRESHOLDS } from '@/types/dataTypes';
import './MainContainer.css';
import { useAppContext } from '@/context/AppContext';
import { useGameData } from '@/context/GameDataContext';



const maxEra = 6;

const MainContainer: React.FC = () => {
    const [era, setEra] = useState(1);

    const { selectedFaction, selectedTechs: selectedTechNames } = useAppContext();
    const { techs } = useGameData(); // <- Using GameDataProvider
    const allTechs = useMemo(() => Array.from(techs.values()), [techs]);

    const selectedTechObjects = useMemo(() => {
        const techNameSet = new Set(selectedTechNames);
        return allTechs.filter(tech => techNameSet.has(tech.name));
    }, [selectedTechNames, allTechs]);

    const handlePrevEra = () => setEra(prev => Math.max(1, prev - 1));
    const handleNextEra = () => setEra(prev => Math.min(maxEra, prev + 1));

    const maxUnlockedEra = useMemo(() => {
        const eraCounts = Array(maxEra).fill(0);
        selectedTechObjects.forEach(t => {
            if (t.era >= 1 && t.era <= maxEra) eraCounts[t.era - 1]++;
        });

        let unlocked = 1;
        for (let i = 2; i <= maxEra; i++) {
            const required = ERA_THRESHOLDS[i];
            const totalSelectedPrev = eraCounts.slice(0, i - 1).reduce((a, b) => a + b, 0);
            if (totalSelectedPrev >= required) unlocked = i;
            else break;
        }
        return unlocked;
    }, [selectedTechObjects]);

    const getBackgroundUrl = (eraNumber: number) =>
        `/graphics/techEraScreens/${selectedFaction.toLowerCase()}_era_${eraNumber}.png`;

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
