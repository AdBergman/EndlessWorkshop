import React, {useEffect} from "react";
import {BrowserRouter as Router, Outlet, Route, Routes, useLocation} from "react-router-dom";
import TopContainer from './components/TopContainer/TopContainer';
import TechContainer from './components/Tech/TechContainer';
import InfoPage from './components/InfoPage/InfoPage';
import GameDataProvider from './context/GameDataProvider';
import { useGameData } from './context/GameDataContext';
import LandscapeWrapper from './components/Layout/LandscapeWrapper';

import './App.css';
import {UnitEvolutionExplorer} from "@/components/Units/UnitEvolutionExplorer";

// Extend the Window type for Cloudflare beacon
declare global {
    interface Window {
        _cf?: any; // Cloudflare beacon object
    }
}

// SPA pageview tracking hook for Cloudflare
const useCloudflareSPA = () => {
    const location = useLocation();

    useEffect(() => {
        if (window._cf?.push) {
            window._cf.push(["trackPageView"]);
        }
    }, [location]);
};

const AppLayout: React.FC = () => {
    const location = useLocation(); // Keep this for CloudflareSPA and logging
    console.log("AppLayout rendering. Current path:", location.pathname);
    useCloudflareSPA(); // Track route changes for SPA

    const { isProcessingSharedBuild } = useGameData(); // Consume the new state

    return (
        <LandscapeWrapper>
            <div className="app">
                <TopContainer />
                {isProcessingSharedBuild ? null : <Outlet />} {/* Conditionally render Outlet */}
            </div>
        </LandscapeWrapper>
    );
};

function App() {
    return (
        <Router>
            <GameDataProvider> {/* GameDataProvider now wraps the Routes */}
                <Routes>
                    <Route path="/*" element={<AppLayout />}>
                        <Route index element={<InfoPage />} />
                        <Route path="info" element={<InfoPage />} />
                        <Route path="tech" element={<TechContainer />} />
                        <Route path="units" element={<UnitEvolutionExplorer />} />
                    </Route>
                </Routes>
            </GameDataProvider>
        </Router>
    );
}

export default App;
