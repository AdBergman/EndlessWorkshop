import React from "react";
import "./TopContainer.css";
import {useGameData} from "@/context/GameDataContext";
import {NavLink, useLocation} from "react-router-dom";
import {Faction} from "@/types/dataTypes";

const factions = [
    { isMajor: true, enumFaction: Faction.KIN, minorName: null, uiLabel: "Kin" },
    { isMajor: true, enumFaction: Faction.LORDS, minorName: null, uiLabel: "Lords" },
    { isMajor: true, enumFaction: Faction.TAHUK, minorName: null, uiLabel: "Tahuk" },
    { isMajor: true, enumFaction: Faction.ASPECTS, minorName: null, uiLabel: "Aspects" },
    { isMajor: true, enumFaction: Faction.NECROPHAGES, minorName: null, uiLabel: "Necrophages" },
];

const routes = [
    { path: "/tech", label: "Tech" },
    { path: "/units", label: "Units" },
    { path: "/codex", label: "Codex" },
    { path: "/summary", label: "Summary" },
    { path: "/info", label: "Info" },
];

const TopContainer: React.FC = () => {
    const { selectedFaction, setSelectedFaction, setSelectedTechs, isProcessingSharedBuild } = useGameData(); // Consume isProcessingSharedBuild
    const location = useLocation();
    const showFactionSelector = !isProcessingSharedBuild && !location.pathname.startsWith("/codex");

    return (
        <header className="top-container">
            <div className="logo-container">
                <img src="/graphics/cog.svg" alt="Workshop Icon" className="top-bar-icon" />
                <div className="logo-title">Endless Workshop</div>
            </div>

            <div className="view-selector">
                {routes.map((route) => (
                    <NavLink
                        key={route.label}
                        to={route.path}
                        className={({ isActive }) => (isActive ? "active" : "")}
                    >
                        {route.label}
                    </NavLink>
                ))}
            </div>

            {/* Conditionally render faction selector based on isProcessingSharedBuild */}
            {showFactionSelector && (
                <div className="faction-selector">
                    {factions.map((f) => (
                        <button
                            key={f.uiLabel}
                            className={
                                selectedFaction.isMajor &&
                                f.isMajor &&
                                selectedFaction.enumFaction === f.enumFaction
                                    ? "active"
                                    : ""
                            }
                            onClick={() => {
                                setSelectedFaction(f);
                                setSelectedTechs([]); // clear tech tree selections
                            }}
                        >
                            {f.uiLabel}
                        </button>
                    ))}
                </div>
            )}
        </header>
    );
};

export default TopContainer;
