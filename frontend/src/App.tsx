import React, { useState } from 'react';
import TechTree from './components/TechTree';
import './App.css';

const factions = ["Kin", "Aspect", "Necrophage", "Lords", "Tahuk"];
const maxEra = 6; // dynamically could derive from JSON if needed

function App() {
    const [selectedFaction, setSelectedFaction] = useState("Kin");
    const [era, setEra] = useState(1);

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
                />
            </main>
        </div>
    );
}

export default App;
