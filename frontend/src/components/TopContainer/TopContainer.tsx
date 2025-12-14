import React, { useEffect } from "react";
import "./TopContainer.css";
import { useGameData } from "@/context/GameDataContext"; // Import useGameData
import { NavLink } from "react-router-dom";
import { getBackgroundUrl } from "@/utils/getBackgroundUrl";
import { Faction } from "@/types/dataTypes";

const factions = [
    { isMajor: true, enumFaction: Faction.KIN, minorName: null, uiLabel: "Kin" },
    { isMajor: true, enumFaction: Faction.LORDS, minorName: null, uiLabel: "Lords" },
    { isMajor: true, enumFaction: Faction.TAHUK, minorName: null, uiLabel: "Tahuk" },
    { isMajor: true, enumFaction: Faction.ASPECTS, minorName: null, uiLabel: "Aspects" },
    { isMajor: true, enumFaction: Faction.NECROPHAGES, minorName: null, uiLabel: "Necrophages" },
];

const MAX_ERA = 6;

// ✅ Available routes only — clean and simple
const routes = [
    { path: "/info", label: "Info" },
    { path: "/tech", label: "Tech" },
    { path: "/units", label: "Units" },
    // { path: "/summary", label: "Game Summary" }, // intentionally hidden for now
];

const TopContainer: React.FC = () => {
    const { selectedFaction, setSelectedFaction, setSelectedTechs, isProcessingSharedBuild } = useGameData(); // Consume isProcessingSharedBuild

    // Preload backgrounds on faction change
    useEffect(() => {
        if (!selectedFaction) return;

        for (let era = 1; era <= MAX_ERA; era++) {
            const img = new Image();
            img.src = getBackgroundUrl(selectedFaction.uiLabel, era);
        }
    }, [selectedFaction]);

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
            {!isProcessingSharedBuild && (
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
