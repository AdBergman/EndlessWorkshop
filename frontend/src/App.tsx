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
import LandscapeWrapper from "./components/Layout/LandscapeWrapper";
import PageSeo from "@/components/Seo/PageSeo";
import { AppRouteSeoKey, publicRouteSeo } from "@/components/Seo/routeSeo";

import "./App.css";

const GameSummaryPage = lazy(() => import("./components/GameSummary/GameSummaryPage"));
const UnitEvolutionExplorer = lazy(() =>
    import("@/components/Units/UnitEvolutionExplorer").then((module) => ({
        default: module.UnitEvolutionExplorer,
    }))
);
const AdminImportPage = lazy(() => import("@/components/AdminImport/AdminImportPage"));
const CodexPage = lazy(() => import("@/pages/CodexPage"));
const ModsPage = lazy(() => import("@/pages/ModsPage"));

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
    return <Suspense fallback={null}>{children}</Suspense>;
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
