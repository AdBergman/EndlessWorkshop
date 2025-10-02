import React from 'react';
import './TopContainer.css';
import { useAppContext } from '@/context/AppContext';
import { NavLink } from 'react-router-dom'; // Import NavLink

// All factions in your game
const factions = ["Kin", "Aspect", "Necrophage", "Lords", "Tahuk"];
// Only available faction(s)
const availableFactions = ["Kin"];

// Define the application's main routes
const routes = [
    { path: '/', label: 'TechTree', isAvailable: true },
    { path: '/city-planner', label: 'CityPlanner', isAvailable: false }, // Coming soon
    { path: '/info', label: 'Info', isAvailable: true },
];

const TopContainer: React.FC = () => {
    // The component now only gets data it needs, not navigation state.
    const { selectedFaction, setSelectedFaction } = useAppContext();

    return (
        <header className="top-container">
            <div className="logo-container">
                <img src="/graphics/cog.svg" alt="Workshop Icon" className="top-bar-icon" />
                <div className="logo-title">Endless Workshop</div>
            </div>

            {/* View selector now uses NavLink for routing */}
            <div className="view-selector">
                {routes.map(route => (
                    <NavLink
                        key={route.label}
                        to={route.path}
                        // NavLink automatically adds the 'active' class, but we can customize it
                        // to also handle the disabled state.
                        className={({ isActive }) =>
                            `${isActive ? 'active' : ''} ${!route.isAvailable ? 'disabled' : ''}`
                        }
                        // Prevent navigation for disabled links
                        onClick={(e) => !route.isAvailable && e.preventDefault()}
                        title={!route.isAvailable ? "Coming Soon" : ""}
                    >
                        {route.label}
                    </NavLink>
                ))}
            </div>

            {/* Faction buttons remain unchanged */}
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
