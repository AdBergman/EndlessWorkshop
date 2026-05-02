import React, { useEffect } from "react";
import {
    BrowserRouter as Router,
    Outlet,
    Route,
    Routes,
    useLocation,
    Navigate,
} from "react-router-dom";
import { Helmet } from "react-helmet-async";

import TopContainer from "./components/TopContainer/TopContainer";
import TechContainer from "./components/Tech/TechContainer";
import InfoPage from "./components/InfoPage/InfoPage";
import GameDataProvider from "./context/GameDataProvider";
import { useGameData } from "./context/GameDataContext";
import LandscapeWrapper from "./components/Layout/LandscapeWrapper";
import GameSummaryPage from "./components/GameSummary/GameSummaryPage";
import { UnitEvolutionExplorer } from "@/components/Units/UnitEvolutionExplorer";
import AdminImportPage from "@/components/AdminImport/AdminImportPage";
import CodexPage from "@/pages/CodexPage";
import ModsPage from "@/pages/ModsPage";

import "./App.css";

// Extend the Window type for Cloudflare beacon
declare global {
    interface Window {
        _cf?: any;
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
    const location = useLocation();
    console.log("AppLayout rendering. Current path:", location.pathname);

    useCloudflareSPA();

    const { isProcessingSharedBuild } = useGameData();
    const appClassName = location.pathname.startsWith("/codex") ? "app app--codex" : "app";

    return (
        <LandscapeWrapper>
            <div className={appClassName}>
                <TopContainer />
                {isProcessingSharedBuild ? null : <Outlet />}
            </div>
        </LandscapeWrapper>
    );
};

function App() {
    return (
        <Router>
            <GameDataProvider>
                <Routes>
                    <Route path="/*" element={<AppLayout />}>
                        <Route index element={<Navigate to="/tech" replace />} />

                        <Route
                            path="tech"
                            element={
                                <>
                                    <Helmet>
                                        <title>EL2 Tech Tree Planner | Endless Workshop</title>
                                        <meta
                                            name="description"
                                            content="Explore the Endless Legend 2 technology tree, view unlocks, and plan research paths with the EWShop interactive tech planner."
                                        />
                                    </Helmet>
                                    <TechContainer />
                                </>
                            }
                        />

                        <Route
                            path="units"
                            element={
                                <>
                                    <Helmet>
                                        <title>EL2 Unit Evolution Explorer | Endless Workshop</title>
                                        <meta
                                            name="description"
                                            content="Explore Endless Legend 2 unit evolution, stats, and progression with the EWShop interactive unit explorer."
                                        />
                                    </Helmet>
                                    <UnitEvolutionExplorer />
                                </>
                            }
                        />

                        <Route
                            path="codex"
                            element={
                                <>
                                    <Helmet>
                                        <title>EL2 Codex Encyclopedia | Endless Workshop</title>
                                        <meta
                                            name="description"
                                            content="Browse the Endless Legend 2 codex, encyclopedia entries, and cross-linked workshop reference data in Endless Workshop."
                                        />
                                    </Helmet>
                                    <CodexPage />
                                </>
                            }
                        />

                        <Route
                            path="summary"
                            element={
                                <>
                                    <Helmet>
                                        <title>Endless Legend 2 Game Summary | Endless Workshop</title>
                                        <meta
                                            name="description"
                                            content="Review Endless Legend 2 game summaries and shared build information in Endless Workshop."
                                        />
                                    </Helmet>
                                    <GameSummaryPage />
                                </>
                            }
                        />

                        <Route
                            path="mods"
                            element={
                                <>
                                    <Helmet>
                                        <title>EL2 Mods | Essentials Pack & Tools | Endless Workshop</title>
                                        <meta
                                            name="description"
                                            content="Download the EL2 Essentials Pack and supporting Endless Legend 2 mods, with concise install guidance and release links."
                                        />
                                    </Helmet>
                                    <ModsPage />
                                </>
                            }
                        />

                        <Route
                            path="info"
                            element={
                                <>
                                    <Helmet>
                                        <title>About Endless Workshop | Endless Legend 2 Tools</title>
                                        <meta
                                            name="description"
                                            content="Learn about Endless Workshop, an interactive Endless Legend 2 reference and planning tool for tech trees, units, and gameplay systems."
                                        />
                                    </Helmet>
                                    <InfoPage />
                                </>
                            }
                        />

                        <Route path="admin/import" element={<AdminImportPage />} />
                    </Route>
                </Routes>
            </GameDataProvider>
        </Router>
    );
}

export default App;
