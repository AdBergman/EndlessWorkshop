const routePreloads = new Map<string, Promise<unknown>>();

export const loadGameSummaryPage = () => import("./components/GameSummary/GameSummaryPage");

export const loadUnitEvolutionExplorer = () =>
    import("@/components/Units/UnitEvolutionExplorer").then((module) => ({
        default: module.UnitEvolutionExplorer,
    }));

export const loadAdminImportPage = () => import("@/components/AdminImport/AdminImportPage");
export const loadCodexPage = () => import("@/pages/CodexPage");
export const loadModsPage = () => import("@/pages/ModsPage");
export const loadQuestExplorerPage = () => import("@/pages/QuestExplorerPage");

const preloaders: Record<string, () => Promise<unknown>> = {
    "/units": loadUnitEvolutionExplorer,
    "/codex": loadCodexPage,
    "/quests": loadQuestExplorerPage,
    "/mods": loadModsPage,
};

type RouteWarmupConnection = {
    effectiveType?: string;
    saveData?: boolean;
};

const ROUTES_WITH_HEAVY_STARTUP = ["/codex", "/quests", "/summary"];

function normalizedRoutePath(path: string): string {
    const [pathname] = path.split(/[?#]/, 1);
    return pathname || "/";
}

function routeMatches(pathname: string, routePath: string): boolean {
    return pathname === routePath || pathname.startsWith(`${routePath}/`);
}

function connectionAllowsWarmup(connection: RouteWarmupConnection | undefined): boolean {
    if (!connection) return true;
    if (connection.saveData) return false;

    return connection.effectiveType !== "slow-2g" && connection.effectiveType !== "2g";
}

export function getPrimaryRoutePreloadPaths(
    currentPath: string,
    connection?: RouteWarmupConnection
): string[] {
    const pathname = normalizedRoutePath(currentPath);
    if (!connectionAllowsWarmup(connection)) return [];
    if (ROUTES_WITH_HEAVY_STARTUP.some((routePath) => routeMatches(pathname, routePath))) return [];

    return Object.keys(preloaders).filter((routePath) => !routeMatches(pathname, routePath));
}

export function preloadRoutePath(path: string): void {
    const preloader = preloaders[path];
    if (!preloader || routePreloads.has(path)) return;

    const preload = preloader().catch((error) => {
        routePreloads.delete(path);
        throw error;
    });

    routePreloads.set(path, preload);
    void preload.catch(() => undefined);
}

export function warmPrimaryRouteChunks(currentPath = window.location.pathname): void {
    if (typeof window === "undefined") return;

    const warm = () => {
        const connection = "connection" in navigator
            ? navigator.connection as RouteWarmupConnection | undefined
            : undefined;

        getPrimaryRoutePreloadPaths(currentPath, connection).forEach(preloadRoutePath);
    };

    if ("requestIdleCallback" in window) {
        window.requestIdleCallback(warm, { timeout: 2500 });
        return;
    }

    globalThis.setTimeout(warm, 1200);
}
