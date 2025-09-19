import React from 'react';
import './TopContainer.css';

interface TopContainerProps {
    selectedFaction: string;
    setSelectedFaction: (faction: string) => void;
    currentView: 'TechTree' | 'CityPlanner';
    setCurrentView: (view: 'TechTree' | 'CityPlanner') => void;
}

const factions = ["Kin", "Aspect", "Necrophage", "Lords", "Tahuk"];

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

            {/* View selector buttons (techtree / city planner) */}
            <div className="view-selector">
                <button
                    className={currentView === 'TechTree' ? 'active' : ''}
                    onClick={() => setCurrentView('TechTree')}
                >
                    Tech Tree
                </button>
                <button
                    className={currentView === 'CityPlanner' ? 'active' : ''}
                    onClick={() => setCurrentView('CityPlanner')}
                >
                    City Planner
                </button>
            </div>

            {/* Faction buttons */}
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
    );
};

export default TopContainer;
