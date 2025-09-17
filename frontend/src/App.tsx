import React, { useState } from 'react';
import TechTree from './components/TechTree';
import './App.css';

const factions = ["Kin", "Aspect", "Necrophage", "Lords", "Tahuk"];

function App() {
    const [selectedFaction, setSelectedFaction] = useState("Kin"); // default

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
                <TechTree era={1} faction={selectedFaction} />
            </main>
        </div>
    );
}

export default App;
