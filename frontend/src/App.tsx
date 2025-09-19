import React, { useState } from 'react';
import TechTree from './components/techTree/TechTree';
import './App.css';
import SpreadSheetView from "./components/techTree/views/SpreadSheetView";

const factions = ["Kin", "Aspect", "Necrophage", "Lords", "Tahuk"];
const maxEra = 6; // dynamically could derive from JSON if needed

function App() {
    const [selectedFaction, setSelectedFaction] = useState("Kin");
    const [era, setEra] = useState(1);
    const [selectedTechs, setSelectedTechs] = useState<string[]>([]);

    const handleTechClick = (techName: string) => {
        setSelectedTechs(prev =>
            prev.includes(techName)
                ? prev.filter(t => t !== techName)
                : [...prev, techName]
        );
    };

    const handlePrevEra = () => setEra(prev => Math.max(1, prev - 1));
    const handleNextEra = () => setEra(prev => Math.min(maxEra, prev + 1));

    return (
        <div className="App">
            <header className="top-bar">
                {/* Left side: icon + title */}
                <div className="logo-container">
                    <img src="/graphics/cog.svg" alt="Workshop Icon" className="top-bar-icon" />
                    <div className="logo-title">Endless Workshop</div>
                </div>

                {/* Right side: faction buttons */}
                <div className="faction-selector">
                    {factions.map(f => (
                        <button
                            key={f}
                            className={f === selectedFaction ? 'active' : ''}
                            onClick={() => setSelectedFaction(f)}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </header>

            <main className="main-content">
                <TechTree
                    era={era}
                    faction={selectedFaction}
                    onEraChange={(dir) => dir === 'next' ? handleNextEra() : handlePrevEra()}
                    selectedTechs={selectedTechs}
                    onTechClick={handleTechClick}
                />
            </main>
            <div>
                <SpreadSheetView techs={selectedTechs} />
            </div>
        </div>
    );
}

export default App;
