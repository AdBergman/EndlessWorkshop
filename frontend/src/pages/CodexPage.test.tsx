import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter, MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import TopContainer from "@/components/TopContainer/TopContainer";
import CodexPage from "./CodexPage";
import { useCodexStore } from "@/stores/codexStore";
import { buildEntriesByKey, buildEntriesByKindKey } from "@/lib/codex/codexRefs";
import type { CodexEntry } from "@/types/dataTypes";

function LocationProbe() {
    const location = useLocation();

    return <div data-testid="location-probe">{`${location.pathname}${location.search}`}</div>;
}

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
                    displayName: "Bloom Harbor",
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
                    displayName: "Bloom Harbor",
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
                        displayName: "Bloom Harbor",
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
        cleanup();
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

        expect(await screen.findByTestId("location-probe")).toHaveTextContent("/codex");
        expect(await screen.findByRole("heading", { name: "Codex Overview" })).toBeInTheDocument();
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

        const kindIndex = await screen.findByLabelText("Codex kinds");
        await user.click(within(kindIndex).getByRole("button", { name: /districts 2/i }));

        expect(await screen.findByRole("heading", { name: "All Districts" })).toBeInTheDocument();
    });

    it("resets query, kind, and selection when navigating back to plain /codex", async () => {
        const user = userEvent.setup();
        window.history.replaceState({}, "", "/codex");

        render(
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

        expect(await screen.findByRole("heading", { name: "Market Square" })).toBeInTheDocument();
    });

    it("falls back to the overview for invalid deep links without selecting the first entry", async () => {
        render(
            <MemoryRouter initialEntries={["/codex?entry=Does_Not_Exist"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "Codex Overview" })).toBeInTheDocument();
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

        const relatedSection = await screen.findByLabelText(/selected codex entry/i);
        expect(within(relatedSection).getByRole("button", { name: /auric coral improvements/i })).toBeInTheDocument();
        expect(screen.queryByText("[LuxuryResource01]")).not.toBeInTheDocument();
        expect(screen.queryByText("[DustColored]")).not.toBeInTheDocument();
    });

    it("renders same-title quest-to-quest related entries with new kind labels", async () => {
        const entries: CodexEntry[] = [
            {
                exportKind: "quests",
                entryKey: "FactionQuest_LastLord_Chapter01_Step01",
                displayName: "A Haunted Path",
                descriptionLines: ["The first step."],
                referenceKeys: [
                    "FactionQuest_LastLord_Chapter01_Step02",
                    "Faction_LastLord",
                    "Population_LastLord",
                    "MinorFaction_Ametrine",
                    "Trait_Protectorate",
                ],
            },
            {
                exportKind: "quests",
                entryKey: "FactionQuest_LastLord_Chapter01_Step02",
                displayName: "A Haunted Path",
                descriptionLines: ["The second step."],
                referenceKeys: [],
            },
            {
                exportKind: "factions",
                entryKey: "Faction_LastLord",
                displayName: "Last Lords",
                descriptionLines: ["Dust-bound nobles."],
                referenceKeys: [],
            },
            {
                exportKind: "populations",
                entryKey: "Population_LastLord",
                displayName: "Last Lord Population",
                descriptionLines: ["Faction population."],
                referenceKeys: [],
            },
            {
                exportKind: "minorfactions",
                entryKey: "MinorFaction_Ametrine",
                displayName: "Ametrine",
                descriptionLines: ["Minor faction."],
                referenceKeys: [],
            },
            {
                exportKind: "traits",
                entryKey: "Trait_Protectorate",
                displayName: "Protectorate",
                descriptionLines: ["Protectorate trait."],
                referenceKeys: [],
            },
        ];

        useCodexStore.setState({
            entries,
            entriesByKey: buildEntriesByKey(entries),
            entriesByKind: {
                quests: entries.filter((entry) => entry.exportKind === "quests"),
                factions: entries.filter((entry) => entry.exportKind === "factions"),
                populations: entries.filter((entry) => entry.exportKind === "populations"),
                minorfactions: entries.filter((entry) => entry.exportKind === "minorfactions"),
                traits: entries.filter((entry) => entry.exportKind === "traits"),
            },
            entriesByKindKey: buildEntriesByKindKey(entries),
            loading: false,
            error: null,
        });

        render(
            <MemoryRouter initialEntries={["/codex?entry=FactionQuest_LastLord_Chapter01_Step01"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        const relatedSection = await screen.findByRole("region", { name: /related entries/i });

        expect(
            within(relatedSection).getAllByRole("button", {
                name: /a haunted path quest .* last lord .* chapter 1 .* step 2/i,
            })
        ).toHaveLength(1);
        expect(within(relatedSection).getByRole("button", { name: /last lords factions/i })).toBeInTheDocument();
        expect(within(relatedSection).getByRole("button", { name: /last lord population populations/i })).toBeInTheDocument();
        expect(within(relatedSection).getByRole("button", { name: /ametrine minor factions/i })).toBeInTheDocument();
        expect(within(relatedSection).getByRole("button", { name: /protectorate traits/i })).toBeInTheDocument();
    });

    it("keeps faction quest display names distinct while showing duplicate-title context separately", async () => {
        const user = userEvent.setup();
        const entries: CodexEntry[] = [
            {
                exportKind: "quests",
                entryKey: "FactionQuest_LastLord_Chapter01_Step01",
                displayName: "A Fragile Dawn",
                category: "MajorFaction",
                kind: "Quest",
                descriptionLines: ["The Last Lords awaken."],
                referenceKeys: ["FactionQuest_LastLord_Chapter02_Step01"],
            },
            {
                exportKind: "quests",
                entryKey: "FactionQuest_LastLord_Chapter02_Step01",
                displayName: "A Blighted Resurrection",
                category: "MajorFaction",
                kind: "Quest",
                descriptionLines: ["The resurrection begins."],
                referenceKeys: ["FactionQuest_LastLord_Chapter03_Step01"],
            },
            {
                exportKind: "quests",
                entryKey: "FactionQuest_LastLord_Chapter03_Step01",
                displayName: "The Fork in the Road",
                category: "MajorFaction",
                kind: "Quest",
                descriptionLines: ["A branch in the quest line."],
                referenceKeys: [],
            },
            {
                exportKind: "quests",
                entryKey: "FactionQuest_Necrophage_Chapter01_Step01",
                displayName: "Brave New World",
                category: "MajorFaction",
                kind: "Quest",
                descriptionLines: ["The Necrophage opening."],
                referenceKeys: ["FactionQuest_Necrophage_Chapter04_Step01"],
            },
            {
                exportKind: "quests",
                entryKey: "FactionQuest_Necrophage_Chapter04_Step01",
                displayName: "A Fresh Lead",
                category: "MajorFaction",
                kind: "Quest",
                descriptionLines: ["The Necrophage lead continues."],
                referenceKeys: [],
            },
            {
                exportKind: "quests",
                entryKey: "FactionQuest_Necrophage_Chapter06_Step01",
                displayName: "A Bitter Truth",
                category: "MajorFaction",
                kind: "Quest",
                descriptionLines: ["A Necrophage shared-title branch."],
                referenceKeys: ["FactionQuest_Necrophage_Chapter06_Step02"],
            },
            {
                exportKind: "quests",
                entryKey: "FactionQuest_Necrophage_Chapter06_Step02",
                displayName: "A Bitter Truth",
                category: "MajorFaction",
                kind: "Quest",
                descriptionLines: ["Another Necrophage shared-title branch."],
                referenceKeys: [],
            },
            {
                exportKind: "quests",
                entryKey: "FactionQuest_Necrophage02_Chapter06_Step01",
                displayName: "A Bitter Truth",
                category: "MajorFaction",
                kind: "Quest",
                descriptionLines: ["A shared-title branch."],
                referenceKeys: ["FactionQuest_Necrophage02_Chapter06_Step02"],
            },
            {
                exportKind: "quests",
                entryKey: "FactionQuest_Necrophage02_Chapter06_Step02",
                displayName: "A Bitter Truth",
                category: "MajorFaction",
                kind: "Quest",
                descriptionLines: ["Another shared-title branch."],
                referenceKeys: [],
            },
        ];

        useCodexStore.setState({
            entries,
            entriesByKey: buildEntriesByKey(entries),
            entriesByKind: {
                quests: entries,
            },
            entriesByKindKey: buildEntriesByKindKey(entries),
            loading: false,
            error: null,
        });

        render(
            <MemoryRouter initialEntries={["/codex?entry=FactionQuest_Necrophage_Chapter04_Step01"]}>
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

        expect(await screen.findByRole("heading", { name: "A Fresh Lead" })).toBeInTheDocument();

        await user.clear(screen.getByRole("combobox", { name: /search the encyclopedia/i }));
        await user.type(screen.getByRole("combobox", { name: /search the encyclopedia/i }), "A Bitter Truth");

        const results = screen.getByLabelText("Codex results");
        await waitFor(() => {
            expect(within(results).getByText("Necrophage · Chapter 6")).toBeInTheDocument();
        });
        expect(within(results).getByText("2 questlines")).toBeInTheDocument();
        expect(within(results).getByText("4 quest nodes")).toBeInTheDocument();
        expect(within(results).getByText("Main questline")).toBeInTheDocument();
        expect(within(results).getByText("Alternate questline 2")).toBeInTheDocument();
        expect(within(results).queryByText("Necrophage alternate questline 2 · Chapter 6")).not.toBeInTheDocument();

        const bitterTruthGroups = within(results).getAllByRole("button", { name: /a bitter truth/i });
        expect(bitterTruthGroups).toHaveLength(1);
        expect(within(results).getAllByRole("button", { name: /step 1/i }).length).toBeGreaterThan(0);
        expect(within(results).getAllByRole("button", { name: /step 2/i }).length).toBeGreaterThan(0);
        expect(within(results).queryByText(/Chapter 06 Step 01/i)).not.toBeInTheDocument();

        await user.click(
            within(results).getByRole("button", {
                name: /step 2 another necrophage shared-title branch/i,
            })
        );
        expect(screen.getByTestId("location-probe")).toHaveTextContent(
            "/codex?entry=FactionQuest_Necrophage_Chapter06_Step02"
        );
        expect(await screen.findByRole("heading", { name: "A Bitter Truth" })).toBeInTheDocument();
        const detailPane = screen.getByLabelText("Selected codex entry");
        expect(within(detailPane).getByText("Necrophage · Chapter 6")).toBeInTheDocument();
        expect(within(detailPane).getByText("Step 2")).toBeInTheDocument();
        expect(within(detailPane).getByText("Major Faction Quest")).toBeInTheDocument();

        await user.click(
            within(results).getByRole("button", {
                name: /step 1 a necrophage shared-title branch/i,
            })
        );
        const duplicateRelatedSection = await screen.findByRole("region", { name: /related entries/i });
        expect(
            within(duplicateRelatedSection).getByRole("button", {
                name: /a bitter truth quest .* necrophage .* chapter 6 .* step 2/i,
            })
        ).toBeInTheDocument();

        await user.clear(screen.getByRole("combobox", { name: /search the encyclopedia/i }));
        await user.type(screen.getByRole("combobox", { name: /search the encyclopedia/i }), "Brave New World");
        await user.click(await within(results).findByRole("button", { name: /brave new world/i }));
        const relatedSection = await screen.findByRole("region", { name: /related entries/i });
        expect(within(relatedSection).getByRole("button", { name: /a fresh lead/i })).toBeInTheDocument();
    });
});
