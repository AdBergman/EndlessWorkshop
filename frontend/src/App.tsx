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
                                    <PageSeo
                                        title="EL2 Tech Tree Planner | Endless Workshop"
                                        description="Explore the Endless Legend 2 technology tree, view unlocks, and plan research paths with the EWShop interactive tech planner."
                                        path="/tech"
                                        jsonLd={{
                                            "@context": "https://schema.org",
                                            "@type": "WebPage",
                                            name: "EL2 Tech Tree Planner",
                                            description:
                                                "Interactive Endless Legend 2 technology tree planner and reference.",
                                            url: "https://endlessworkshop.dev/tech",
                                        }}
                                    />
                                    <TechContainer />
                                </>
                            }
                        />

                        <Route
                            path="units"
                            element={
                                <>
                                    <PageSeo
                                        title="EL2 Unit Evolution Explorer | Endless Workshop"
                                        description="Explore Endless Legend 2 unit evolution, stats, and progression with the EWShop interactive unit explorer."
                                        path="/units"
                                        jsonLd={{
                                            "@context": "https://schema.org",
                                            "@type": "WebPage",
                                            name: "EL2 Unit Evolution Explorer",
                                            description:
                                                "Interactive Endless Legend 2 unit evolution explorer and reference.",
                                            url: "https://endlessworkshop.dev/units",
                                        }}
                                    />
                                    <UnitEvolutionExplorer />
                                </>
                            }
                        />

                        <Route
                            path="codex"
                            element={
                                <>
                                    <PageSeo
                                        title="EL2 Codex Encyclopedia | Endless Workshop"
                                        description="Browse the Endless Legend 2 codex, encyclopedia entries, and cross-linked workshop reference data in Endless Workshop."
                                        path="/codex"
                                        jsonLd={{
                                            "@context": "https://schema.org",
                                            "@type": "CollectionPage",
                                            name: "EL2 Codex Encyclopedia",
                                            description:
                                                "Searchable Endless Legend 2 codex and encyclopedia reference.",
                                            url: "https://endlessworkshop.dev/codex",
                                            about: "Endless Legend 2",
                                        }}
                                    />
                                    <CodexPage />
                                </>
                            }
                        />

                        <Route
                            path="summary"
                            element={
                                <>
                                    <PageSeo
                                        title="Endless Legend 2 Game Summary | Endless Workshop"
                                        description="Review Endless Legend 2 game summaries and shared build information in Endless Workshop."
                                        path="/summary"
                                        jsonLd={{
                                            "@context": "https://schema.org",
                                            "@type": "WebPage",
                                            name: "Endless Legend 2 Game Summary",
                                            description:
                                                "Victory summary import and analysis page for Endless Legend 2.",
                                            url: "https://endlessworkshop.dev/summary",
                                        }}
                                    />
                                    <GameSummaryPage />
                                </>
                            }
                        />

                        <Route
                            path="mods"
                            element={
                                <>
                                    <PageSeo
                                        title="EL2 Mods | Essentials Pack & Tools | Endless Workshop"
                                        description="Download the EL2 Essentials Pack and supporting Endless Legend 2 mods, with concise install guidance and release links."
                                        path="/mods"
                                        jsonLd={{
                                            "@context": "https://schema.org",
                                            "@type": "CollectionPage",
                                            name: "EL2 Mods",
                                            description:
                                                "Endless Legend 2 mod pack downloads, support tools, and installation guidance.",
                                            url: "https://endlessworkshop.dev/mods",
                                            about: "Endless Legend 2 mods",
                                        }}
                                    />
                                    <ModsPage />
                                </>
                            }
                        />

                        <Route
                            path="info"
                            element={
                                <>
                                    <PageSeo
                                        title="About Endless Workshop | Endless Legend 2 Tools"
                                        description="Learn about Endless Workshop, an interactive Endless Legend 2 reference and planning tool for tech trees, units, and gameplay systems."
                                        path="/info"
                                        jsonLd={{
                                            "@context": "https://schema.org",
                                            "@type": "AboutPage",
                                            name: "About Endless Workshop",
                                            description:
                                                "About Endless Workshop and its Endless Legend 2 reference tools.",
                                            url: "https://endlessworkshop.dev/info",
                                        }}
                                    />
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
