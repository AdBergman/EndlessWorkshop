import React, { useEffect } from "react";
import {
    BrowserRouter as Router,
    Outlet,
    Route,
    Routes,
    useLocation,
    Navigate,
} from "react-router-dom";
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
import PageSeo from "@/components/Seo/PageSeo";
import { publicRouteSeo } from "@/components/Seo/routeSeo";

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

function SeoRoute({
    routeKey,
    children,
}: {
    routeKey: Exclude<keyof typeof publicRouteSeo, "home">;
    children: React.ReactNode;
}) {
    const seo = publicRouteSeo[routeKey];

    return (
        <>
            <PageSeo
                title={seo.title}
                description={seo.description}
                path={seo.path}
                robots={seo.robots}
                ogType={seo.ogType}
                imageUrl={seo.imageUrl}
                jsonLd={seo.jsonLd}
            />
            {children}
        </>
    );
}

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
                                <SeoRoute routeKey="tech">
                                    <TechContainer />
                                </SeoRoute>
                            }
                        />

                        <Route
                            path="units"
                            element={
                                <SeoRoute routeKey="units">
                                    <UnitEvolutionExplorer />
                                </SeoRoute>
                            }
                        />

                        <Route
                            path="codex"
                            element={
                                <SeoRoute routeKey="codex">
                                    <CodexPage />
                                </SeoRoute>
                            }
                        />

                        <Route
                            path="summary"
                            element={
                                <SeoRoute routeKey="summary">
                                    <GameSummaryPage />
                                </SeoRoute>
                            }
                        />

                        <Route
                            path="mods"
                            element={
                                <SeoRoute routeKey="mods">
                                    <ModsPage />
                                </SeoRoute>
                            }
                        />

                        <Route
                            path="info"
                            element={
                                <SeoRoute routeKey="info">
                                    <InfoPage />
                                </SeoRoute>
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
