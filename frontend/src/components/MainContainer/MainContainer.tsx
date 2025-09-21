import React, { useEffect, useState, useMemo } from 'react';
import TechTree from '../TechTree/TechTree';
import SpreadSheetView from '../TechTree/views/SpreadSheetView';
import { Tech, ERA_THRESHOLDS } from '../../types/dataTypes';
import techTreeJson from '../../data/techTree.json';
import './MainContainer.css';

interface MainContainerProps {
    currentView: 'TechTree' | 'CityPlanner';
    selectedFaction: string;
}

const maxEra = 6;

const MainContainer: React.FC<MainContainerProps> = ({ currentView, selectedFaction }) => {
    const [era, setEra] = useState(1);
    const [selectedTechs, setSelectedTechs] = useState<Tech[]>([]);

    // Filter selectedTechs when faction changes
    useEffect(() => {
        setSelectedTechs(prev =>
            prev.filter(t => t.faction.includes(selectedFaction))
        );
    }, [selectedFaction]);

    const handleTechClick = (techName: string) => {
        const techObj = (techTreeJson as Tech[]).find(t => t.name === techName);
        if (!techObj) return;

        setSelectedTechs(prev =>
            prev.some(t => t.name === techName)
                ? prev.filter(t => t.name !== techName)
                : [...prev, techObj]
        );
    };

    const handlePrevEra = () => setEra(prev => Math.max(1, prev - 1));
    const handleNextEra = () => setEra(prev => Math.min(maxEra, prev + 1));

    // ---------- NEW: compute maxUnlockedEra ----------
    const maxUnlockedEra = useMemo(() => {
        // Count selected techs by era
        const eraCounts = [0, 0, 0, 0, 0, 0]; // index 0 = era 1, etc.
        selectedTechs.forEach(t => {
            if (t.era >= 1 && t.era <= maxEra) eraCounts[t.era - 1]++;
        });

        // Determine max unlocked era based on thresholds
        let unlocked = 1; // era 1 always unlocked
        for (let i = 2; i <= maxEra; i++) {
            const required = ERA_THRESHOLDS[i]; // number of techs required from previous eras
            const totalSelectedPrev = eraCounts.slice(0, i - 1).reduce((a, b) => a + b, 0);
            if (totalSelectedPrev >= required) unlocked = i;
            else break;
        }
        return unlocked;
    }, [selectedTechs]);

    // --------------------------------------------------

    if (currentView === 'TechTree') {
        return (
            <main className="main-container">
                <TechTree
                    era={era}
                    faction={selectedFaction}
                    selectedTechs={selectedTechs}
                    maxUnlockedEra={maxUnlockedEra} // pass prop
                    onTechClick={handleTechClick}
                    onEraChange={(dir) => (dir === 'next' ? handleNextEra() : handlePrevEra())}
                />

                <div className="view-container">
                    <SpreadSheetView techs={selectedTechs} />
                </div>
            </main>
        );
    }

    if (currentView === 'CityPlanner') {
        return <div className="main-container">City Planner placeholder</div>;
    }

    return null;
};

export default MainContainer;
