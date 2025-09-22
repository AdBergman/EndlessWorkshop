import React from 'react';
import './TopContainer.css';

interface TopContainerProps {
    selectedFaction: string;
    setSelectedFaction: (faction: string) => void;
    currentView: 'TechTree' | 'CityPlanner';
    setCurrentView: (view: 'TechTree' | 'CityPlanner') => void;
}

// All factions in your game
const factions = ["Kin", "Aspect", "Necrophage", "Lords", "Tahuk"];
// Only available faction(s)
const availableFactions = ["Kin"];

// All views
const allViews: ('TechTree' | 'CityPlanner')[] = ["TechTree", "CityPlanner"];
// Only available view(s)
const availableViews: ('TechTree' | 'CityPlanner')[] = ["TechTree"];

const TopContainer: React.FC<TopContainerProps> = ({
                                                       selectedFaction,
                                                       setSelectedFaction,
                                                       currentView,
                                                       setCurrentView
                                                   }) => {
    return (
        <header className="top-container">
            {/* Logo and title */}
            <div className="logo-container">
                <img src="/graphics/cog.svg" alt="Workshop Icon" className="top-bar-icon" />
                <div className="logo-title">Endless Workshop</div>
            </div>

            {/* View selector */}
            <div className="view-selector">
                {allViews.map(view => {
                    const isAvailable = availableViews.includes(view);
                    return (
                        <button
                            key={view}
                            className={`${currentView === view ? 'active' : ''} ${!isAvailable ? 'disabled' : ''}`}
                            onClick={() => isAvailable && setCurrentView(view)}
                            title={!isAvailable ? "Coming Soon" : ""}
                        >
                            {view}
                        </button>
                    );
                })}
            </div>

            {/* Faction buttons */}
            <div className="faction-selector">
                {factions.map(f => {
                    const isAvailable = availableFactions.includes(f);
                    return (
                        <button
                            key={f}
                            className={`${f === selectedFaction ? 'active' : ''} ${!isAvailable ? 'disabled' : ''}`}
                            onClick={() => isAvailable && setSelectedFaction(f)}
                            title={!isAvailable ? "Coming Soon" : ""}
                        >
                            {f}
                        </button>
                    );
                })}
            </div>
        </header>
    );
};

export default TopContainer;
