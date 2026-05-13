import { render, screen } from "@testing-library/react";
import type React from "react";
import { MemoryRouter } from "react-router-dom";
import { AppRoutes } from "./App";

vi.mock("./components/TopContainer/TopContainer", () => ({
    default: () => <nav aria-label="top navigation">Top navigation</nav>,
}));

vi.mock("./components/Layout/LandscapeWrapper", () => ({
    default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("./components/Seo/PageSeo", () => ({
    default: () => null,
}));

vi.mock("./components/Tech/TechContainer", async () => {
    const { useLocation } = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");

    return {
        default: () => {
            const location = useLocation();
            return <main data-testid="route-tech">{`${location.pathname}${location.search}`}</main>;
        },
    };
});

vi.mock("./components/GameSummary/GameSummaryPage", async () => {
    const { useLocation } = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");

    return {
        default: () => {
            const location = useLocation();
            return <main data-testid="route-summary">{`${location.pathname}${location.search}`}</main>;
        },
    };
});

vi.mock("@/components/Units/UnitEvolutionExplorer", async () => {
    const { useLocation } = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");

    return {
        UnitEvolutionExplorer: () => {
            const location = useLocation();
            return <main data-testid="route-units">{`${location.pathname}${location.search}`}</main>;
        },
    };
});

vi.mock("@/pages/CodexPage", async () => {
    const { useLocation } = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");

    return {
        default: () => {
            const location = useLocation();
            return <main data-testid="route-codex">{`${location.pathname}${location.search}`}</main>;
        },
    };
});

vi.mock("@/pages/ModsPage", async () => {
    const { useLocation } = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");

    return {
        default: () => {
            const location = useLocation();
            return <main data-testid="route-mods">{`${location.pathname}${location.search}`}</main>;
        },
    };
});

vi.mock("@/components/AdminImport/AdminImportPage", async () => {
    const { useLocation } = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");

    return {
        default: () => {
            const location = useLocation();
            return <main data-testid="route-admin-import">{`${location.pathname}${location.search}`}</main>;
        },
    };
});

function renderRoute(initialEntry: string) {
    return render(
        <MemoryRouter initialEntries={[initialEntry]}>
            <AppRoutes />
        </MemoryRouter>
    );
}

describe("App lazy route bundle isolation", () => {
    it.each([
        ["/tech", "route-tech"],
        ["/units?faction=kin&unitKey=Unit_Kin_Root", "route-units"],
        ["/codex?entry=District_MarketSquare", "route-codex"],
        ["/summary", "route-summary"],
        ["/mods", "route-mods"],
        ["/admin/import?admin=1", "route-admin-import"],
    ])("renders %s through the app route tree", async (initialEntry, testId) => {
        renderRoute(initialEntry);

        expect(await screen.findByTestId(testId)).toHaveTextContent(initialEntry);
    });
});
