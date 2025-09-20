import React, { useState } from 'react';
import TechTree from '@components/TechTree/TechTree';
import SpreadSheetView from '@components/TechTree/views/SpreadSheetView';
import { Tech } from '@dataTypes/dataTypes';
import techTreeJson from '@data/techTree.json';
import './MainContainer.css';

interface MainContainerProps {
    currentView: 'TechTree' | 'CityPlanner';
    selectedFaction: string;
}

const maxEra = 6;

const MainContainer: React.FC<MainContainerProps> = ({ currentView, selectedFaction }) => {
    // All internal state lives here now
    const [era, setEra] = useState(1);
    const [selectedTechs, setSelectedTechs] = useState<Tech[]>([]);

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

    if (currentView === 'TechTree') {
        return (
            <main className="main-container">
                {/* TechTree */}
                <TechTree
                    era={era}
                    faction={selectedFaction}
                    selectedTechs={selectedTechs}
                    onTechClick={handleTechClick}
                    onEraChange={(dir) => (dir === 'next' ? handleNextEra() : handlePrevEra())}
                />

                {/* Bottom view container */}
                <div className="view-container">
                    {/* Here you can add toggle later between SpreadsheetView / InfographicView */}
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
