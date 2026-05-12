import React from "react";
import "./TopContainer.css";
import { useShareProcessingGate } from "@/context/appOrchestration";
import {NavLink, useLocation, useNavigate} from "react-router-dom";
import {Faction} from "@/types/dataTypes";
import {
    selectSelectedFaction,
    selectSetSelectedFaction,
    useFactionSelectionStore,
} from "@/stores/factionSelectionStore";
import {useTechPlannerStore} from "@/stores/techPlannerStore";

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
    { path: "/mods", label: "Mods" },
    { path: "/info", label: "Info" },
];

const TopContainer: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const isProcessingSharedBuild = useShareProcessingGate();
    const selectedFaction = useFactionSelectionStore(selectSelectedFaction);
    const setSelectedFaction = useFactionSelectionStore(selectSetSelectedFaction);
    const clearSelectedTechs = useTechPlannerStore((state) => state.clearSelectedTechs);
    const showFactionSelector = !isProcessingSharedBuild;

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
                        onClick={(event) => {
                            if (route.path !== "/codex") return;

                            event.preventDefault();
                            navigate({
                                pathname: "/codex",
                                search: "",
                            }, {
                                state: {
                                    codexResetNonce: `${Date.now()}:${location.key}`,
                                },
                            });
                        }}
                        className={({ isActive }) => (isActive ? "active" : "")}
                    >
                        {route.label}
                    </NavLink>
                ))}
            </div>

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
                                clearSelectedTechs();
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
