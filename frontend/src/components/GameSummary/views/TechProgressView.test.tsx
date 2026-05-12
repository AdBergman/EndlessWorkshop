import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import TechProgressView from "@/components/GameSummary/views/TechProgressView";
import { useEndGameReportStore } from "@/stores/endGameReportStore";
import { useTechStore } from "@/stores/techStore";
import type { EndGameExport } from "@/types/endGameReport";
import type { Tech } from "@/types/dataTypes";

const tech = (overrides: Partial<Tech>): Tech => ({
    techKey: "Tech_Workshop",
    name: "Workshop",
    era: 1,
    type: "Industry",
    unlocks: [],
    descriptionLines: [],
    prereq: null,
    factions: [],
    excludes: null,
    coords: { xPct: 0, yPct: 0 },
    ...overrides,
});

const report: EndGameExport = {
    meta: {
        version: "test",
        generatedAtUtc: "2026-05-12T00:00:00Z",
        gameId: "test-game",
    },
    allStats: {
        maxTurn: 12,
        empires: [
            {
                empireIndex: 0,
                factionKey: "kin",
                factionDisplayName: "Kin",
                perTurn: [],
            },
        ],
        topScoreEmpire: 0,
        topScore: 100,
    },
    techOrder: {
        empireCount: 1,
        entryCount: 2,
        entries: [
            {
                empireIndex: 0,
                turn: 3,
                technologyDefinitionName: "Tech_Store_Label",
                technologyDisplayName: "%Tech_Store_Label",
            },
            {
                empireIndex: 0,
                turn: 5,
                technologyDefinitionName: "Tech_Report_Label",
                technologyDisplayName: "Report Label",
            },
        ],
    },
};

const LocationProbe = () => {
    const location = useLocation();
    return (
        <div>
            <div data-testid="route">{location.pathname}</div>
            <div data-testid="nav-state">{JSON.stringify(location.state ?? null)}</div>
        </div>
    );
};

describe("TechProgressView passive tech lookups", () => {
    beforeEach(() => {
        useEndGameReportStore.getState().clear();
        useTechStore.getState().reset();
        useTechStore.getState().replaceTechs([
            tech({
                techKey: "Tech_Store_Label",
                name: "Store Label",
            }),
        ]);
        useEndGameReportStore.getState().setOk({ rawJsonText: "{}", report });
    });

    it("uses techStore labels for passive summary display and filtering", async () => {
        const user = userEvent.setup();

        render(
            <MemoryRouter initialEntries={["/summary"]}>
                <TechProgressView />
            </MemoryRouter>
        );

        expect(screen.getByText("Store Label")).toBeInTheDocument();
        expect(screen.getByText("Report Label")).toBeInTheDocument();

        await user.type(screen.getByLabelText("Filter techs"), "store");

        expect(screen.getByText("Store Label")).toBeInTheDocument();
        expect(screen.queryByText("Report Label")).not.toBeInTheDocument();
    });

    it("falls back to the report tech definition when no store label exists", async () => {
        useEndGameReportStore.getState().setOk({
            rawJsonText: "{}",
            report: {
                ...report,
                techOrder: {
                    empireCount: 1,
                    entryCount: 1,
                    entries: [
                        {
                            empireIndex: 0,
                            turn: 8,
                            technologyDefinitionName: "Tech_Missing_From_Store",
                            technologyDisplayName: "%Tech_Missing_From_Store",
                        },
                    ],
                },
            },
        });

        render(
            <MemoryRouter initialEntries={["/summary"]}>
                <TechProgressView />
            </MemoryRouter>
        );

        expect(screen.getByText("Tech_Missing_From_Store")).toBeInTheDocument();
    });

    it("keeps summary to tech tree navigation state based on report tech keys", async () => {
        const user = userEvent.setup();

        render(
            <MemoryRouter initialEntries={["/summary"]}>
                <Routes>
                    <Route path="/summary" element={<TechProgressView />} />
                    <Route path="/tech" element={<LocationProbe />} />
                </Routes>
            </MemoryRouter>
        );

        await user.click(screen.getByRole("button", { name: "View in Tech Tree (Player)" }));

        await waitFor(() => {
            expect(screen.getByTestId("route")).toHaveTextContent("/tech");
        });

        expect(screen.getByTestId("nav-state")).toHaveTextContent('"source":"gamesummary"');
        expect(screen.getByTestId("nav-state")).toHaveTextContent(
            '"techKeys":["Tech_Store_Label","Tech_Report_Label"]'
        );
        expect(screen.getByTestId("nav-state")).toHaveTextContent('"focusTechKey":"Tech_Report_Label"');
    });
});
