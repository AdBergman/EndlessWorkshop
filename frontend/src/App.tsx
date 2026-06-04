import React, { lazy, Suspense, useEffect } from "react";
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
import { useShareProcessingGate } from "./context/appOrchestration";
import PageSeo from "@/components/Seo/PageSeo";
import { AppRouteSeoKey, publicRouteSeo } from "@/components/Seo/routeSeo";
import {
    loadAdminImportPage,
    loadCodexPage,
    loadGameSummaryPage,
    loadModsPage,
    loadQuestExplorerPage,
    loadUnitEvolutionExplorer,
    warmPrimaryRouteChunks,
} from "@/routeLoaders";

import "./App.css";

const GameSummaryPage = lazy(loadGameSummaryPage);
const UnitEvolutionExplorer = lazy(loadUnitEvolutionExplorer);
const AdminImportPage = lazy(loadAdminImportPage);
const CodexPage = lazy(loadCodexPage);
const ModsPage = lazy(loadModsPage);
const QuestExplorerPage = lazy(loadQuestExplorerPage);

class RouteChunkBoundary extends React.Component<
    { children: React.ReactNode; resetKey: string },
    { hasError: boolean }
> {
    state = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidUpdate(previousProps: { resetKey: string }) {
        if (previousProps.resetKey !== this.props.resetKey && this.state.hasError) {
            this.setState({ hasError: false });
        }
    }

    render() {
        if (this.state.hasError) {
            return (
                <main className="route-state route-state--error" role="alert">
                    <h1>Route failed to load</h1>
                    <p>The page bundle did not load cleanly. Refreshing will request the current build again.</p>
                    <button type="button" onClick={() => window.location.reload()}>
                        Reload
                    </button>
                </main>
            );
        }

        return this.props.children;
    }
}

function RouteLoadingFallback() {
    return (
        <main className="route-state" aria-live="polite" aria-busy="true">
            <div className="route-state__spinner" aria-hidden="true" />
            <span>Loading page...</span>
        </main>
    );
}

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

    useCloudflareSPA();

    const isProcessingSharedBuild = useShareProcessingGate();
    const isCodexRoute = location.pathname.startsWith("/codex");
    const isQuestExplorerRoute = location.pathname.startsWith("/quests");
    let appClassName = "app";
    let appHue: "orange" | "gold" | "teal" | "neutral" = "orange";

    if (isCodexRoute) {
        appClassName = "app app--codex";
        appHue = "neutral";
    } else if (isQuestExplorerRoute) {
        appClassName = "app app--quests";
        appHue = "gold";
    }

    useEffect(() => {
        warmPrimaryRouteChunks();
    }, []);

    return (
        <div className={appClassName} data-ew-hue={appHue}>
            <TopContainer />
            {isProcessingSharedBuild ? null : <Outlet />}
        </div>
    );
};

function SeoRoute({
    routeKey,
    children,
}: {
    routeKey: AppRouteSeoKey;
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

function LazyRoute({ children }: { children: React.ReactNode }) {
    const location = useLocation();

    return (
        <RouteChunkBoundary resetKey={location.key}>
            <Suspense fallback={<RouteLoadingFallback />}>{children}</Suspense>
        </RouteChunkBoundary>
    );
}

export function AppRoutes() {
    return (
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
                            <LazyRoute>
                                <UnitEvolutionExplorer />
                            </LazyRoute>
                        </SeoRoute>
                    }
                />

                <Route
                    path="codex"
                    element={
                        <SeoRoute routeKey="codex">
                            <LazyRoute>
                                <CodexPage />
                            </LazyRoute>
                        </SeoRoute>
                    }
                />

                <Route
                    path="quests/*"
                    element={
                        <SeoRoute routeKey="quests">
                            <LazyRoute>
                                <QuestExplorerPage />
                            </LazyRoute>
                        </SeoRoute>
                    }
                />

                <Route
                    path="summary"
                    element={
                        <SeoRoute routeKey="summary">
                            <LazyRoute>
                                <GameSummaryPage />
                            </LazyRoute>
                        </SeoRoute>
                    }
                />

                <Route
                    path="mods"
                    element={
                        <SeoRoute routeKey="mods">
                            <LazyRoute>
                                <ModsPage />
                            </LazyRoute>
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

                <Route
                    path="admin/import"
                    element={
                        <LazyRoute>
                            <AdminImportPage />
                        </LazyRoute>
                    }
                />
            </Route>
        </Routes>
    );
}

function App() {
    return (
        <Router>
            <GameDataProvider>
                <AppRoutes />
            </GameDataProvider>
        </Router>
    );
}

export default App;
