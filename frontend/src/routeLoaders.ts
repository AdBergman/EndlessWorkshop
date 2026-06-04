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
    "/summary": loadGameSummaryPage,
    "/mods": loadModsPage,
};

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

export function warmPrimaryRouteChunks(): void {
    if (typeof window === "undefined") return;

    const warm = () => {
        preloadRoutePath("/quests");
        preloadRoutePath("/summary");
        preloadRoutePath("/codex");
        preloadRoutePath("/units");
        preloadRoutePath("/mods");
    };

    if ("requestIdleCallback" in window) {
        window.requestIdleCallback(warm, { timeout: 2500 });
        return;
    }

    globalThis.setTimeout(warm, 1200);
}
