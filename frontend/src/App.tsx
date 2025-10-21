import React, { useEffect } from "react";
import { BrowserRouter as Router, Outlet, Route, Routes, useLocation } from "react-router-dom";
import TopContainer from './components/TopContainer/TopContainer';
import MainContainer from './components/MainContainer/MainContainer';
import InfoPage from './components/InfoPage/InfoPage';
import GameDataProvider from './context/GameDataProvider';
import LandscapeWrapper from './components/Layout/LandscapeWrapper';
import DemoUnitCard from '@/components/Units/UnitCard/DemoUnitCard';

import './App.css';
import {UnitCarouselDemo} from "@/components/Units/UnitCarouselDemo";

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
    useCloudflareSPA(); // Track route changes for SPA

    return (
        <GameDataProvider>
            <LandscapeWrapper>
                <div className="app">
                    <TopContainer />
                    <Outlet />
                </div>
            </LandscapeWrapper>
        </GameDataProvider>
    );
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<AppLayout />}>
                    <Route index element={<MainContainer />} />
                    <Route path="info" element={<InfoPage />} />
                    <Route path="demo-unit-card" element={<DemoUnitCard />} />
                    <Route path="demo-carousel" element={<UnitCarouselDemo />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
