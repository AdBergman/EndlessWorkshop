import React from 'react';
import './TopContainer.css';
import { useGameData } from '@/context/GameDataContext';
import { NavLink } from 'react-router-dom';
import {trackTabClick} from "@/analytics"; // Import NavLink

const factions = ["Kin", "Lords", "Tahuk", "Aspect", "Necrophage", ];
const availableFactions = ["Kin", "Lords", "Tahuk"];

// Define the application's main routes
const routes = [
    { path: '/', label: 'TechTree', isAvailable: true },
    { path: '/city-planner', label: 'CityPlanner', isAvailable: false }, // Coming soon
    { path: '/info', label: 'Info', isAvailable: true },
];

const TopContainer: React.FC = () => {
    const { selectedFaction, setSelectedFaction, setSelectedTechs } = useGameData();

    return (
        <header className="top-container">
            <div className="logo-container">
                <img src="/graphics/cog.svg" alt="Workshop Icon" className="top-bar-icon" />
                <div className="logo-title">Endless Workshop</div>
            </div>

            <div className="view-selector">
                {routes.map(route => (
                    <NavLink
                        key={route.label}
                        to={route.path}
                        className={({ isActive }) =>
                            `${isActive ? 'active' : ''} ${!route.isAvailable ? 'disabled' : ''}`
                        }
                        onClick={(e) => {
                            if (!route.isAvailable) {
                                e.preventDefault();
                            } else {
                                trackTabClick(route.label);
                            }
                        }}
                        title={!route.isAvailable ? "Coming Soon" : ""}
                    >
                        {route.label}
                    </NavLink>

                ))}
            </div>

            <div className="faction-selector">
                {factions.map(f => {
                    const isAvailable = availableFactions.includes(f);
                    return (
                        <button
                            key={f}
                            className={`${f === selectedFaction ? 'active' : ''} ${!isAvailable ? 'disabled' : ''}`}
                            onClick={() => {
                                if (isAvailable) {
                                    setSelectedFaction(f);   // change faction
                                    setSelectedTechs([]);    // clear selected techs
                                }
                            }}
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
