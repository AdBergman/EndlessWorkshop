import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter, MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import TopContainer from "@/components/TopContainer/TopContainer";
import GameDataContext from "@/context/GameDataContext";
import CodexPage from "./CodexPage";
import { useCodexStore } from "@/stores/codexStore";
import { Faction } from "@/types/dataTypes";

function LocationProbe() {
    const location = useLocation();

    return <div data-testid="location-probe">{`${location.pathname}${location.search}`}</div>;
}

const gameDataContextValue = {
    districts: new Map(),
    improvements: new Map(),
    techs: new Map(),
    codexByKindKey: new Map(),
    selectedFaction: {
        isMajor: true,
        enumFaction: Faction.KIN,
        minorName: null,
        uiLabel: "Kin",
    },
    setSelectedFaction: () => {},
    selectedTechs: [],
    setSelectedTechs: () => {},
    isProcessingSharedBuild: false,
};

describe("CodexPage", () => {
    beforeEach(() => {
        useCodexStore.getState().reset();
        useCodexStore.setState({
            entries: [
                {
                    exportKind: "districts",
                    entryKey: "District_MarketSquare",
                    displayName: "[DustColored] Market Square",
                    descriptionLines: ["Centralized trade district."],
                    referenceKeys: ["Improvement_AuricCoral"],
                },
                {
                    exportKind: "districts",
                    entryKey: "District_BloomHarbor",
                    displayName: "",
                    descriptionLines: ["Supports blossom logistics."],
                    referenceKeys: [],
                },
                {
                    exportKind: "improvements",
                    entryKey: "Improvement_AuricCoral",
                    displayName: "[LuxuryResource01] Auric Coral",
                    descriptionLines: ["Rare sea harvest."],
                    referenceKeys: [],
                },
            ],
            entriesByKey: {
                District_MarketSquare: {
                    exportKind: "districts",
                    entryKey: "District_MarketSquare",
                    displayName: "[DustColored] Market Square",
                    descriptionLines: ["Centralized trade district."],
                    referenceKeys: ["Improvement_AuricCoral"],
                },
                District_BloomHarbor: {
                    exportKind: "districts",
                    entryKey: "District_BloomHarbor",
                    displayName: "",
                    descriptionLines: ["Supports blossom logistics."],
                    referenceKeys: [],
                },
                Improvement_AuricCoral: {
                    exportKind: "improvements",
                    entryKey: "Improvement_AuricCoral",
                    displayName: "[LuxuryResource01] Auric Coral",
                    descriptionLines: ["Rare sea harvest."],
                    referenceKeys: [],
                },
            },
            entriesByKind: {
                districts: [
                    {
                        exportKind: "districts",
                        entryKey: "District_MarketSquare",
                        displayName: "[DustColored] Market Square",
                        descriptionLines: ["Centralized trade district."],
                        referenceKeys: ["Improvement_AuricCoral"],
                    },
                    {
                        exportKind: "districts",
                        entryKey: "District_BloomHarbor",
                        displayName: "",
                        descriptionLines: ["Supports blossom logistics."],
                        referenceKeys: [],
                    },
                ],
                improvements: [
                    {
                        exportKind: "improvements",
                        entryKey: "Improvement_AuricCoral",
                        displayName: "[LuxuryResource01] Auric Coral",
                        descriptionLines: ["Rare sea harvest."],
                        referenceKeys: [],
                    },
                ],
            },
            loading: false,
            error: null,
        });
    });

    afterEach(() => {
        useCodexStore.getState().reset();
    });

    it("stays on /codex and shows the overview when no entry is selected", async () => {
        render(
            <MemoryRouter initialEntries={["/codex"]}>
                <Routes>
                    <Route
                        path="/codex"
                        element={
                            <>
                                <LocationProbe />
                                <CodexPage />
                            </>
                        }
                    />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByTestId("location-probe")).toHaveTextContent("/codex");
        expect(screen.getByRole("heading", { name: "Codex Overview" })).toBeInTheDocument();
        expect(screen.getByText("Codex is a searchable encyclopedia of game data.")).toBeInTheDocument();
        expect(screen.queryByRole("heading", { name: "Market Square" })).not.toBeInTheDocument();
    });

    it("shows a synthetic kind summary row and summary detail when filtering by kind", async () => {
        const user = userEvent.setup();

        render(
            <MemoryRouter initialEntries={["/codex"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        await user.click(
            within(screen.getByRole("toolbar", { name: /filter codex by kind/i })).getByRole("button", {
                name: /districts 2/i,
            })
        );

        await waitFor(() => {
            expect(screen.getByRole("heading", { name: "All Districts" })).toBeInTheDocument();
        });

        expect(screen.getByRole("button", { name: /all districts/i })).toBeInTheDocument();
        const summaryList = screen.getByLabelText("Districts overview");
        expect(within(summaryList).getByRole("button", { name: /market square/i })).toBeInTheDocument();
        expect(within(summaryList).getByRole("button", { name: /bloom harbor/i })).toBeInTheDocument();
        expect(screen.queryByText("District_BloomHarbor")).not.toBeInTheDocument();
        expect(screen.queryByText("[DustColored]")).not.toBeInTheDocument();
    });

    it("uses overview kind rows as entry points into the existing kind summary", async () => {
        const user = userEvent.setup();

        render(
            <MemoryRouter initialEntries={["/codex"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        const kindIndex = screen.getByLabelText("Codex kinds");
        await user.click(within(kindIndex).getByRole("button", { name: /districts 2/i }));

        expect(screen.getByRole("heading", { name: "All Districts" })).toBeInTheDocument();
    });

    it("resets query, kind, and selection when navigating back to plain /codex", async () => {
        const user = userEvent.setup();
        window.history.replaceState({}, "", "/codex");

        render(
            <GameDataContext.Provider value={gameDataContextValue}>
                <BrowserRouter>
                    <Routes>
                        <Route
                            path="/codex"
                            element={
                                <>
                                    <LocationProbe />
                                    <TopContainer />
                                    <CodexPage />
                                </>
                            }
                        />
                    </Routes>
                </BrowserRouter>
            </GameDataContext.Provider>
        );

        await user.click(within(screen.getByRole("toolbar", { name: /filter codex by kind/i })).getByRole("button", {
            name: /districts 2/i,
        }));
        await user.type(screen.getByRole("combobox", { name: /search the encyclopedia/i }), "market");

        await waitFor(() => {
            expect(
                within(screen.getByRole("toolbar", { name: /filter codex by kind/i })).getByRole("button", {
                    name: /districts 2/i,
                })
            ).toHaveAttribute("aria-pressed", "true");
        });
        expect(screen.getByRole("combobox", { name: /search the encyclopedia/i })).toHaveValue("market");
        expect(screen.getByTestId("location-probe")).not.toHaveTextContent(/^\/codex$/);

        await user.click(screen.getByRole("link", { name: "Codex" }));

        await waitFor(() => {
            expect(screen.getByRole("heading", { name: "Codex Overview" })).toBeInTheDocument();
        });

        expect(`${window.location.pathname}${window.location.search}`).toBe("/codex");
        expect(screen.getByRole("combobox", { name: /search the encyclopedia/i })).toHaveValue("");
        expect(
            within(screen.getByRole("toolbar", { name: /filter codex by kind/i })).getByRole("button", {
                name: /all 3/i,
            })
        ).toHaveAttribute("aria-pressed", "true");
        expect(screen.queryByRole("heading", { name: "All Districts" })).not.toBeInTheDocument();
    });

    it("keeps valid deep links working", async () => {
        render(
            <MemoryRouter initialEntries={["/codex?entry=District_MarketSquare"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByRole("heading", { name: "Market Square" })).toBeInTheDocument();
    });

    it("falls back to the overview for invalid deep links without selecting the first entry", async () => {
        render(
            <MemoryRouter initialEntries={["/codex?entry=Does_Not_Exist"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByRole("heading", { name: "Codex Overview" })).toBeInTheDocument();
        expect(screen.queryByRole("heading", { name: "Market Square" })).not.toBeInTheDocument();
    });

    it("renders tokenized labels in detail panes and related links without leaking bracket text", async () => {
        render(
            <MemoryRouter initialEntries={["/codex?entry=District_MarketSquare"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        const relatedSection = screen.getByLabelText(/selected codex entry/i);
        expect(within(relatedSection).getByRole("button", { name: /auric coral improvements/i })).toBeInTheDocument();
        expect(screen.queryByText("[LuxuryResource01]")).not.toBeInTheDocument();
        expect(screen.queryByText("[DustColored]")).not.toBeInTheDocument();
    });
});
