import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter, MemoryRouter, Route, Routes } from "react-router-dom";
import TopContainer from "@/components/TopContainer/TopContainer";
import CodexPage from "./CodexPage";
import { useCodexStore } from "@/stores/codexStore";
import { buildEntriesByKey, buildEntriesByKindKey } from "@/lib/codex/codexRefs";
import { BackButton, LocationProbe, seedDefaultCodexStore } from "@/pages/testUtils/codexPageTestUtils";
import type { CodexEntry } from "@/types/dataTypes";

describe("CodexPage", () => {
    beforeEach(() => {
        useCodexStore.getState().reset();
        seedDefaultCodexStore();
    });

    afterEach(() => {
        cleanup();
        useCodexStore.getState().reset();
    });

    it("stays on /codex and shows the overview when no entry is selected", async () => {
        const { container } = render(
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
        expect(screen.getByText("categories")).toBeInTheDocument();
        expect(screen.getByText("Browse the archive by category, then inspect descriptions and resolved related links.")).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Categories" })).toBeInTheDocument();
        expect(screen.getByText("City tiles, exploitations, and terrain infrastructure.")).toBeInTheDocument();
        expect(container.querySelector('img.codex-kindIcon--overview[src="/svg/factions/UI_Common_District.svg"]'))
            .toBeInTheDocument();
        expect(screen.queryByRole("heading", { name: "Market Square" })).not.toBeInTheDocument();
    });

    it("requests codex entries on page mount when the global bootstrap has not populated the store yet", async () => {
        const originalLoadEntries = useCodexStore.getState().loadEntries;
        const loadEntries = vi.fn().mockResolvedValue(undefined);

        useCodexStore.setState({
            entries: [],
            entriesByKey: {},
            entriesByKind: {},
            entriesByKindKey: {},
            loading: false,
            error: null,
            lastLoadedAt: undefined,
            loadEntries,
        });

        try {
            render(
                <MemoryRouter initialEntries={["/codex"]}>
                    <Routes>
                        <Route path="/codex" element={<CodexPage />} />
                    </Routes>
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(loadEntries).toHaveBeenCalledTimes(1);
            });
        } finally {
            useCodexStore.setState({ loadEntries: originalLoadEntries });
        }
    });

    it("treats extractors as their own codex category instead of counting them as districts", async () => {
        const entries: CodexEntry[] = [
            {
                exportKind: "districts",
                entryKey: "District_BloomHarbor",
                displayName: "Bloom Harbor",
                descriptionLines: ["Supports blossom logistics."],
                referenceKeys: [],
            },
            {
                exportKind: "extractors",
                entryKey: "Extractor_Luxury01",
                displayName: "Klax Extractor",
                category: "Extractors",
                kind: "District",
                descriptionLines: ["Extracts Klax from worked territory."],
                referenceKeys: ["District_BloomHarbor"],
            },
        ];

        useCodexStore.setState({
            entries,
            entriesByKey: buildEntriesByKey(entries),
            entriesByKind: {
                districts: entries.filter((entry) => entry.exportKind === "districts"),
                extractors: entries.filter((entry) => entry.exportKind === "extractors"),
            },
            entriesByKindKey: buildEntriesByKindKey(entries),
            loading: false,
            error: null,
        });

        render(
            <MemoryRouter initialEntries={["/codex"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        const toolbar = await screen.findByRole("toolbar", { name: /filter codex by kind/i });
        expect(within(toolbar).getByRole("button", { name: /districts 1/i })).toBeInTheDocument();
        expect(within(toolbar).getByRole("button", { name: /extractors 1/i })).toBeInTheDocument();

        const kindIndex = await screen.findByLabelText("Codex kinds");
        expect(within(kindIndex).getByRole("button", { name: /extractors 1/i })).toBeInTheDocument();
        expect(screen.getByText("Resource extraction districts and upgrades.")).toBeInTheDocument();
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

        expect(screen.getByLabelText("2 records in view")).toBeInTheDocument();
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

    it("renders the all-factions summary icon as a monochrome category icon", async () => {
        const entries: CodexEntry[] = [
            {
                exportKind: "factions",
                entryKey: "Faction_Mukag",
                displayName: "Faction_Mukag",
                descriptionLines: ["Affinity: Tahuks"],
                referenceKeys: [],
            },
        ];

        useCodexStore.setState({
            entries,
            entriesByKey: buildEntriesByKey(entries),
            entriesByKind: {
                factions: entries,
            },
            entriesByKindKey: buildEntriesByKindKey(entries),
            loading: false,
            error: null,
        });

        const { container } = render(
            <MemoryRouter initialEntries={["/codex?category=factions"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "All Factions" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /all factions/i })).toBeInTheDocument();
        expect(
            container.querySelector(
                'img.codex-kindIcon--result.codex-kindIcon--monochrome[src="/svg/quests/UI_QuestCategory_Faction.svg"]'
            )
        ).toBeInTheDocument();
    });

    it("pushes category and entry states so browser back returns to category then index", async () => {
        const user = userEvent.setup();

        render(
            <MemoryRouter initialEntries={["/codex"]}>
                <Routes>
                    <Route
                        path="/codex"
                        element={
                            <>
                                <LocationProbe />
                                <BackButton />
                                <CodexPage />
                            </>
                        }
                    />
                </Routes>
            </MemoryRouter>
        );

        const kindIndex = await screen.findByLabelText("Codex kinds");
        await user.click(within(kindIndex).getByRole("button", { name: /districts 2/i }));

        await waitFor(() => {
            expect(screen.getByTestId("location-probe")).toHaveTextContent("/codex?category=districts");
        });
        expect(screen.getByRole("heading", { name: "All Districts" })).toBeInTheDocument();

        const summaryList = screen.getByLabelText("Districts overview");
        await user.click(within(summaryList).getByRole("button", { name: /market square/i }));

        await waitFor(() => {
            expect(screen.getByTestId("location-probe")).toHaveTextContent(
                "/codex?category=districts&entry=District_MarketSquare"
            );
        });
        expect(screen.getByRole("heading", { name: "Market Square" })).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Back" }));
        await waitFor(() => {
            expect(screen.getByTestId("location-probe")).toHaveTextContent("/codex?category=districts");
        });
        expect(screen.getByRole("heading", { name: "All Districts" })).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Back" }));
        await waitFor(() => {
            expect(screen.getByTestId("location-probe")).toHaveTextContent("/codex");
        });
        expect(screen.getByRole("heading", { name: "Codex Overview" })).toBeInTheDocument();
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
        const { container } = render(
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
        expect(container.querySelector('img.codex-kindIcon--relatedChip[src="/svg/constructibles/UI_Resource_Luxury_Klak.svg"]'))
            .toBeInTheDocument();
        expect(container.querySelector('img[src="/svg/constructibles/UI_Resource_Luxury_Klak.svg"]'))
            .toBeInTheDocument();
    });

    it("uses exact resource icons in resource entry detail headers", async () => {
        const { container } = render(
            <MemoryRouter initialEntries={["/codex?entry=Improvement_AuricCoral"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "Auric Coral" })).toBeInTheDocument();
        expect(container.querySelector('img.codex-kindIcon--detail[src="/svg/constructibles/UI_Resource_Luxury_Klak.svg"]'))
            .toBeInTheDocument();
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
        expect(within(relatedSection).getByText("Quests")).toBeInTheDocument();
        expect(within(relatedSection).getByText("Factions")).toBeInTheDocument();
        expect(within(relatedSection).getByText("Minor Factions")).toBeInTheDocument();

        expect(
            within(relatedSection).getAllByRole("button", {
                name: /a haunted path quest .* last lords .* chapter 1 .* step 2/i,
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
            expect(within(results).getByText("Necrophages · Chapter 6")).toBeInTheDocument();
        });
        expect(within(results).getByText("2 questlines")).toBeInTheDocument();
        expect(within(results).getByText("4 quest nodes")).toBeInTheDocument();
        expect(within(results).queryByText("Main questline")).not.toBeInTheDocument();
        expect(within(results).queryByText("Alternate questline 2")).not.toBeInTheDocument();
        expect(within(results).queryByText("Necrophages alternate questline 2 · Chapter 6")).not.toBeInTheDocument();

        const bitterTruthGroups = within(results).getAllByRole("button", { name: /a bitter truth/i });
        expect(bitterTruthGroups).toHaveLength(1);
        expect(within(results).queryByRole("button", { name: /step 1/i })).not.toBeInTheDocument();
        expect(within(results).queryByRole("button", { name: /step 2/i })).not.toBeInTheDocument();
        expect(within(results).queryByText(/Chapter 06 Step 01/i)).not.toBeInTheDocument();

        const detailPane = screen.getByLabelText("Selected codex entry");
        expect(within(detailPane).getByText("Quest Progression")).toBeInTheDocument();
        expect(within(detailPane).getByText("Main questline")).toBeInTheDocument();
        expect(within(detailPane).getByText("Alternate questline 2")).toBeInTheDocument();

        const mainStepTwo = detailPane.querySelector<HTMLButtonElement>(
            '[data-entry-key="FactionQuest_Necrophage_Chapter06_Step02"]'
        );
        expect(mainStepTwo).not.toBeNull();
        await user.click(mainStepTwo!);
        expect(screen.getByTestId("location-probe")).toHaveTextContent(
            "/codex?entry=FactionQuest_Necrophage_Chapter06_Step02"
        );
        expect(await screen.findByRole("heading", { name: "A Bitter Truth" })).toBeInTheDocument();
        expect(within(detailPane).getByText("Necrophages · Chapter 6")).toBeInTheDocument();
        expect(within(detailPane).getByText("Major Faction Quest")).toBeInTheDocument();
        expect(mainStepTwo).toHaveAttribute("aria-pressed", "true");

        const mainStepOne = detailPane.querySelector<HTMLButtonElement>(
            '[data-entry-key="FactionQuest_Necrophage_Chapter06_Step01"]'
        );
        expect(mainStepOne).not.toBeNull();
        await user.click(mainStepOne!);
        const duplicateRelatedSection = await screen.findByRole("region", { name: /related entries/i });
        expect(
            within(duplicateRelatedSection).getByRole("button", {
                name: /a bitter truth quest .* necrophages .* chapter 6 .* step 2/i,
            })
        ).toBeInTheDocument();

        await user.clear(screen.getByRole("combobox", { name: /search the encyclopedia/i }));
        await user.type(screen.getByRole("combobox", { name: /search the encyclopedia/i }), "Brave New World");
        await user.click(await within(results).findByRole("button", { name: /brave new world/i }));
        const relatedSection = await screen.findByRole("region", { name: /related entries/i });
        expect(within(relatedSection).getByRole("button", { name: /a fresh lead/i })).toBeInTheDocument();
    });

    it("opens numbered questline deep links with alternate context and related labels", async () => {
        const entries: CodexEntry[] = [
            {
                exportKind: "quests",
                entryKey: "FactionQuest_Necrophage02_Chapter06_Step02",
                displayName: "A Bitter Truth",
                category: "MajorFaction",
                kind: "Quest",
                descriptionLines: ["The alternate questline continues."],
                referenceKeys: ["FactionQuest_Necrophage02_Chapter06_Step03"],
            },
            {
                exportKind: "quests",
                entryKey: "FactionQuest_Necrophage02_Chapter06_Step03",
                displayName: "A Bitter Truth",
                category: "MajorFaction",
                kind: "Quest",
                descriptionLines: ["The next alternate questline step."],
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
            <MemoryRouter initialEntries={["/codex?entry=FactionQuest_Necrophage02_Chapter06_Step02"]}>
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

        expect(await screen.findByRole("heading", { name: "A Bitter Truth" })).toBeInTheDocument();
        expect(screen.getByTestId("location-probe")).toHaveTextContent(
            "/codex?entry=FactionQuest_Necrophage02_Chapter06_Step02"
        );
        const detailPane = screen.getByLabelText("Selected codex entry");
        expect(within(detailPane).getByText("Necrophages · Chapter 6")).toBeInTheDocument();
        expect(within(detailPane).getByText("Alternate questline 2")).toBeInTheDocument();
        expect(within(detailPane).getByText("Step 2")).toBeInTheDocument();
        const selectedPathNode = detailPane.querySelector<HTMLButtonElement>(
            '[data-entry-key="FactionQuest_Necrophage02_Chapter06_Step02"]'
        );
        expect(selectedPathNode).toHaveAttribute("aria-pressed", "true");

        const relatedSection = await screen.findByRole("region", { name: /related entries/i });
        expect(
            within(relatedSection).getByRole("button", {
                name: /a bitter truth quest .* necrophages .* chapter 6 .* alternate questline 2 .* step 3/i,
            })
        ).toBeInTheDocument();
    });

    it("uses grouped quest rows in the summary detail instead of repeated quest nodes", async () => {
        const user = userEvent.setup();
        const entries: CodexEntry[] = [
            {
                exportKind: "quests",
                entryKey: "FactionQuest_Necrophage_Chapter06_Step01",
                displayName: "A Bitter Truth",
                category: "MajorFaction",
                kind: "Quest",
                descriptionLines: ["The first main node."],
                referenceKeys: [],
            },
            {
                exportKind: "quests",
                entryKey: "FactionQuest_Necrophage_Chapter06_Step02",
                displayName: "A Bitter Truth",
                category: "MajorFaction",
                kind: "Quest",
                descriptionLines: ["The second main node."],
                referenceKeys: [],
            },
            {
                exportKind: "quests",
                entryKey: "FactionQuest_Necrophage02_Chapter06_Step01",
                displayName: "A Bitter Truth",
                category: "MajorFaction",
                kind: "Quest",
                descriptionLines: ["The first alternate node."],
                referenceKeys: [],
            },
            {
                exportKind: "quests",
                entryKey: "FactionQuest_Necrophage02_Chapter06_Step02",
                displayName: "A Bitter Truth",
                category: "MajorFaction",
                kind: "Quest",
                descriptionLines: ["The second alternate node."],
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
            <MemoryRouter initialEntries={["/codex"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        await user.click(
            within(screen.getByRole("toolbar", { name: /filter codex by kind/i })).getByRole("button", {
                name: /quests 4/i,
            })
        );

        expect(await screen.findByRole("heading", { name: "All Quests" })).toBeInTheDocument();
        const summaryList = screen.getByLabelText("Quests overview");
        expect(within(summaryList).getAllByRole("button", { name: /a bitter truth/i })).toHaveLength(1);
        expect(within(summaryList).getByText(/Necrophages · Chapter 6 · 2 questlines · 4 quest nodes/i)).toBeInTheDocument();
        expect(within(summaryList).queryByText("The first main node.")).not.toBeInTheDocument();
        expect(within(summaryList).queryByText("The second alternate node.")).not.toBeInTheDocument();
    });

    it("structures faction details into affinity, traits, notes, and dossier index anchors", async () => {
        const entries: CodexEntry[] = [
            {
                exportKind: "factions",
                entryKey: "Faction_Aspect",
                displayName: "Faction_Aspect",
                descriptionLines: [
                    "Affinity: Aspects",
                    "Opening faction note.",
                    "Trait: Diplomat",
                    "They prioritize Diplomacy and peace.",
                    "Trait: Common Rights",
                    "+10 [PublicOrderColored] Public Opinion due to neighbors",
                ],
                referenceKeys: ["Trait_Diplomat"],
            },
            {
                exportKind: "traits",
                entryKey: "Trait_Diplomat",
                displayName: "Diplomat",
                descriptionLines: ["Treaties are easier."],
                referenceKeys: [],
            },
        ];

        useCodexStore.setState({
            entries,
            entriesByKey: buildEntriesByKey(entries),
            entriesByKind: {
                factions: entries.filter((entry) => entry.exportKind === "factions"),
                traits: entries.filter((entry) => entry.exportKind === "traits"),
            },
            entriesByKindKey: buildEntriesByKindKey(entries),
            loading: false,
            error: null,
        });

        render(
            <MemoryRouter initialEntries={["/codex?entry=Faction_Aspect"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        const detailPane = await screen.findByLabelText(/selected codex entry/i);
        expect(within(detailPane).getByRole("heading", { name: "Aspects" })).toBeInTheDocument();
        expect(within(detailPane).getByText("Faction dossier")).toBeInTheDocument();
        expect(within(detailPane).queryByRole("navigation", { name: /faction dossier index/i })).not.toBeInTheDocument();
        expect(within(detailPane).getByRole("heading", { name: "Affinity" })).toBeInTheDocument();
        expect(within(detailPane).getAllByText("Aspects").length).toBeGreaterThan(0);
        expect(within(detailPane).getByRole("heading", { name: "Diplomat" })).toBeInTheDocument();
        expect(within(detailPane).getByText("They prioritize Diplomacy and peace.")).toBeInTheDocument();
        expect(within(detailPane).getByRole("heading", { name: "Common Rights" })).toBeInTheDocument();
        expect(within(detailPane).getByText(/Public Opinion due to neighbors/)).toBeInTheDocument();
        expect(within(detailPane).getByRole("heading", { name: "Notes" })).toBeInTheDocument();
        expect(within(detailPane).getByText("Opening faction note.")).toBeInTheDocument();
        expect(within(detailPane).queryByText("Description")).not.toBeInTheDocument();
    });

    it("keeps non-faction detail entries on the generic description renderer", async () => {
        render(
            <MemoryRouter initialEntries={["/codex?entry=District_MarketSquare"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        const detailPane = await screen.findByLabelText(/selected codex entry/i);
        expect(within(detailPane).getByText("Description")).toBeInTheDocument();
        expect(within(detailPane).getByText("Centralized trade district.")).toBeInTheDocument();
        expect(within(detailPane).queryByText("Faction dossier")).not.toBeInTheDocument();
    });

    it("summarizes faction rows with affinity and trait metadata", async () => {
        const user = userEvent.setup();
        const entries: CodexEntry[] = [
            {
                exportKind: "factions",
                entryKey: "Faction_Aspect",
                displayName: "Faction_Aspect",
                descriptionLines: [
                    "Affinity: Aspects",
                    "Trait: Diplomat",
                    "They prioritize Diplomacy and peace.",
                    "Trait: Common Rights",
                    "Population bonuses are improved.",
                    "Trait: Fencing",
                    "Unlocks dueling schools.",
                    "Trait: Trade Code",
                    "Markets are stronger.",
                ],
                referenceKeys: [],
            },
        ];

        useCodexStore.setState({
            entries,
            entriesByKey: buildEntriesByKey(entries),
            entriesByKind: {
                factions: entries,
            },
            entriesByKindKey: buildEntriesByKindKey(entries),
            loading: false,
            error: null,
        });

        render(
            <MemoryRouter initialEntries={["/codex?category=factions"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        const resultsPane = await screen.findByLabelText("Codex results");
        expect(within(resultsPane).getByText("Affinity: Aspects")).toBeInTheDocument();
        expect(within(resultsPane).getByText("Traits: Diplomat, Common Rights, +2 traits")).toBeInTheDocument();

        await user.click(within(resultsPane).getByRole("button", { name: /all factions/i }));
        const summaryList = await screen.findByLabelText("Factions overview");
        expect(within(summaryList).getByText("Affinity: Aspects")).toBeInTheDocument();
        expect(within(summaryList).getByText("Traits: Diplomat, Common Rights, Fencing, +1 trait")).toBeInTheDocument();
        expect(within(summaryList).queryByText(/They prioritize Diplomacy and peace.*Population bonuses/s)).not.toBeInTheDocument();
    });

    it("orders faction related entry groups by gameplay usefulness", async () => {
        const entries: CodexEntry[] = [
            {
                exportKind: "factions",
                entryKey: "Faction_Aspect",
                displayName: "Faction_Aspect",
                descriptionLines: ["Affinity: Aspects", "Trait: Diplomat", "They prioritize Diplomacy and peace."],
                referenceKeys: [
                    "Hero_Aspects",
                    "District_Foundation",
                    "Trait_Diplomat",
                    "Unit_Sentry",
                    "Tech_CommonRights",
                    "Population_Aspects",
                    "Ability_Bloom",
                ],
            },
            {
                exportKind: "heroes",
                entryKey: "Hero_Aspects",
                displayName: "Polemephon",
                descriptionLines: ["Hero."],
                referenceKeys: [],
            },
            {
                exportKind: "districts",
                entryKey: "District_Foundation",
                displayName: "Foundation",
                descriptionLines: ["District."],
                referenceKeys: [],
            },
            {
                exportKind: "traits",
                entryKey: "Trait_Diplomat",
                displayName: "Diplomat",
                descriptionLines: ["Trait."],
                referenceKeys: [],
            },
            {
                exportKind: "units",
                entryKey: "Unit_Sentry",
                displayName: "Sentry",
                descriptionLines: ["Unit."],
                referenceKeys: [],
            },
            {
                exportKind: "tech",
                entryKey: "Tech_CommonRights",
                displayName: "Common Rights",
                descriptionLines: ["Tech."],
                referenceKeys: [],
            },
            {
                exportKind: "populations",
                entryKey: "Population_Aspects",
                displayName: "Aspects",
                descriptionLines: ["Population."],
                referenceKeys: [],
            },
            {
                exportKind: "abilities",
                entryKey: "Ability_Bloom",
                displayName: "Bloom",
                descriptionLines: ["Ability."],
                referenceKeys: [],
            },
        ];

        useCodexStore.setState({
            entries,
            entriesByKey: buildEntriesByKey(entries),
            entriesByKind: entries.reduce<Record<string, CodexEntry[]>>((acc, entry) => {
                acc[entry.exportKind] = [...(acc[entry.exportKind] ?? []), entry];
                return acc;
            }, {}),
            entriesByKindKey: buildEntriesByKindKey(entries),
            loading: false,
            error: null,
        });

        const { container } = render(
            <MemoryRouter initialEntries={["/codex?entry=Faction_Aspect"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        const relatedSection = await screen.findByRole("region", { name: /related entries/i });
        expect(within(relatedSection).queryByText(/links \/ .*groups/i)).not.toBeInTheDocument();

        const labels = Array.from(container.querySelectorAll(".codex-related__groupLabel span:last-child"))
            .map((node) => node.textContent);
        expect(labels).toEqual([
            "Traits",
            "Units",
            "Tech",
            "Districts",
            "Heroes",
            "Populations",
            "Abilities",
        ]);
    });

    it("renders equipment codex entries as structured dossiers from current description lines", async () => {
        const entries: CodexEntry[] = [
            {
                exportKind: "equipment",
                entryKey: "Equipment_Weapon_02_Definition",
                displayName: "Dawnblade",
                descriptionLines: [
                    "Type: Weapon",
                    "Slot: Main hand",
                    "Rarity: Rare",
                    "Tier: 2",
                    "Access pool: Hero",
                    "Value: 120",
                    "Forged for close combat.",
                ],
                referenceKeys: [],
            },
        ];

        useCodexStore.setState({
            entries,
            entriesByKey: buildEntriesByKey(entries),
            entriesByKind: { equipment: entries },
            entriesByKindKey: buildEntriesByKindKey(entries),
            loading: false,
            error: null,
        });

        render(
            <MemoryRouter initialEntries={["/codex?category=equipment&entry=Equipment_Weapon_02_Definition"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "Dawnblade" })).toBeInTheDocument();
        expect(screen.getByText("Equipment dossier")).toBeInTheDocument();
        expect(screen.getByText("Type")).toBeInTheDocument();
        expect(screen.getByText("Weapon")).toBeInTheDocument();
        expect(screen.getByText("Rarity")).toBeInTheDocument();
        expect(screen.getByText("Rare")).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Notes" })).toBeInTheDocument();
        expect(screen.getByText("Forged for close combat.")).toBeInTheDocument();
    });

    it("renders population worker effects and thresholds without exporter metadata", async () => {
        const entries: CodexEntry[] = [
            {
                exportKind: "populations",
                entryKey: "Population_Consortium",
                displayName: "The Consortium",
                descriptionLines: [
                    "Faction: Mukag",
                    "Type: Minor faction population",
                    "Base food cost: 60",
                    "Worker: +4 Dust on Scribes",
                    "At 5 population: Unlocks The Consortium’s Bazaar",
                    "At 15 population: +1 Dust on Consortium Population",
                ],
                referenceKeys: [],
            },
        ];

        useCodexStore.setState({
            entries,
            entriesByKey: buildEntriesByKey(entries),
            entriesByKind: { populations: entries },
            entriesByKindKey: buildEntriesByKindKey(entries),
            loading: false,
            error: null,
        });

        render(
            <MemoryRouter initialEntries={["/codex?category=populations&entry=Population_Consortium"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "The Consortium" })).toBeInTheDocument();
        expect(screen.getByText("Population dossier")).toBeInTheDocument();
        expect(screen.getByText("Tahuk")).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Worker" })).toBeInTheDocument();
        expect(screen.getByText("+4 Dust on Scribes")).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Population thresholds" })).toBeInTheDocument();
        expect(screen.getByText("5 population")).toBeInTheDocument();
        expect(screen.getByText("Unlocks The Consortium’s Bazaar")).toBeInTheDocument();
    });

    it("renders hero codex facts from exported description lines instead of parsing ownership from keys", async () => {
        const entries: CodexEntry[] = [
            {
                exportKind: "heroes",
                entryKey: "Hero_Aspect_Archer_0",
                displayName: "Polemephon",
                descriptionLines: [
                    "Faction: Hero",
                    "Class: Archer",
                    "Attack: 42",
                ],
                referenceKeys: [],
            },
        ];

        useCodexStore.setState({
            entries,
            entriesByKey: buildEntriesByKey(entries),
            entriesByKind: { heroes: entries },
            entriesByKindKey: buildEntriesByKindKey(entries),
            loading: false,
            error: null,
        });

        render(
            <MemoryRouter initialEntries={["/codex?category=heroes&entry=Hero_Aspect_Archer_0"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "Polemephon" })).toBeInTheDocument();
        expect(screen.getByText("Hero dossier")).toBeInTheDocument();
        expect(screen.getByText("Faction")).toBeInTheDocument();
        expect(screen.getByText("Hero")).toBeInTheDocument();
        expect(screen.getByText("Class")).toBeInTheDocument();
        expect(screen.getByText("Archer")).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Notes" })).toBeInTheDocument();
        expect(screen.getByText("Attack: 42")).toBeInTheDocument();
    });

    it("renders Tahuk as the public hero faction label while keeping Mukag references stable", async () => {
        const entries: CodexEntry[] = [
            {
                exportKind: "heroes",
                entryKey: "Hero_Mukag_Archer_0",
                displayName: "Uranpar",
                descriptionLines: [
                    "Faction: Tahuk",
                    "Class: Archer",
                ],
                referenceKeys: ["Faction_Mukag"],
            },
            {
                exportKind: "factions",
                entryKey: "Faction_Mukag",
                displayName: "Faction_Mukag",
                descriptionLines: ["Affinity: Tahuks"],
                referenceKeys: [],
            },
        ];

        useCodexStore.setState({
            entries,
            entriesByKey: buildEntriesByKey(entries),
            entriesByKind: { heroes: [entries[0]], factions: [entries[1]] },
            entriesByKindKey: buildEntriesByKindKey(entries),
            loading: false,
            error: null,
        });

        render(
            <MemoryRouter initialEntries={["/codex?category=heroes&entry=Hero_Mukag_Archer_0"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "Uranpar" })).toBeInTheDocument();
        expect(screen.getByText("Faction")).toBeInTheDocument();
        expect(screen.getAllByText("Tahuk").length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText("Related entries")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Tahuk Factions / Tahuk" })).toBeInTheDocument();
    });

    it("renders councilor effects as structured sections", async () => {
        const entries: CodexEntry[] = [
            {
                exportKind: "councilors",
                entryKey: "Councilor_Kin_Governor",
                displayName: "Sheredyn Envoy",
                descriptionLines: [
                    "Faction: KinOfSheredyn",
                    "Role: Governor",
                    "Councilor effect: +2 Science on Cities",
                    "Partner effect: +1 Influence on Alliance",
                ],
                referenceKeys: [],
            },
        ];

        useCodexStore.setState({
            entries,
            entriesByKey: buildEntriesByKey(entries),
            entriesByKind: { councilors: entries },
            entriesByKindKey: buildEntriesByKindKey(entries),
            loading: false,
            error: null,
        });

        render(
            <MemoryRouter initialEntries={["/codex?category=councilors&entry=Councilor_Kin_Governor"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "Sheredyn Envoy" })).toBeInTheDocument();
        expect(screen.getByText("Councilor dossier")).toBeInTheDocument();
        expect(screen.getByText("Kin of Sheredyn")).toBeInTheDocument();
        expect(screen.getByText("Governor")).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Councilor effect" })).toBeInTheDocument();
        expect(screen.getByText("+2 Science on Cities")).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Partner effect" })).toBeInTheDocument();
        expect(screen.getByText("+1 Influence on Alliance")).toBeInTheDocument();
    });

    it("renders trait codex facts without requiring exporter metadata", async () => {
        const entries: CodexEntry[] = [
            {
                exportKind: "traits",
                entryKey: "Trait_Diplomat",
                displayName: "Diplomat",
                descriptionLines: [
                    "Category: Faction",
                    "Cost: 2",
                    "Required affinity: Aspect",
                    "Excludes: Warmonger",
                    "Improves diplomatic leverage.",
                ],
                referenceKeys: [],
            },
        ];

        useCodexStore.setState({
            entries,
            entriesByKey: buildEntriesByKey(entries),
            entriesByKind: { traits: entries },
            entriesByKindKey: buildEntriesByKindKey(entries),
            loading: false,
            error: null,
        });

        render(
            <MemoryRouter initialEntries={["/codex?category=traits&entry=Trait_Diplomat"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "Diplomat" })).toBeInTheDocument();
        expect(screen.getByText("Trait dossier")).toBeInTheDocument();
        expect(screen.getByText("Category")).toBeInTheDocument();
        expect(screen.getByText("Faction")).toBeInTheDocument();
        expect(screen.getByText("Required affinity")).toBeInTheDocument();
        expect(screen.getByText("Aspects")).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Notes" })).toBeInTheDocument();
        expect(screen.getByText("Improves diplomatic leverage.")).toBeInTheDocument();
    });

    it("renders minor faction codex facts from current text prefixes", async () => {
        const entries: CodexEntry[] = [
            {
                exportKind: "minorfactions",
                entryKey: "MinorFaction_Noquensii",
                displayName: "Noquensii",
                descriptionLines: [
                    "Disposition: Diplomatic",
                    "Faction affinity: Necrophage",
                    "Population: Noquensii",
                    "Unit: Singer",
                    "Trait: Silver Tongue",
                    "Known for sharp songs.",
                ],
                referenceKeys: [],
            },
        ];

        useCodexStore.setState({
            entries,
            entriesByKey: buildEntriesByKey(entries),
            entriesByKind: { minorfactions: entries },
            entriesByKindKey: buildEntriesByKindKey(entries),
            loading: false,
            error: null,
        });

        render(
            <MemoryRouter initialEntries={["/codex?category=minorfactions&entry=MinorFaction_Noquensii"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "Noquensii" })).toBeInTheDocument();
        expect(screen.getByText("Minor faction dossier")).toBeInTheDocument();
        expect(screen.getByText("Disposition")).toBeInTheDocument();
        expect(screen.getByText("Diplomatic")).toBeInTheDocument();
        expect(screen.getByText("Faction affinity")).toBeInTheDocument();
        expect(screen.getByText("Necrophages")).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Notes" })).toBeInTheDocument();
        expect(screen.getByText("Known for sharp songs.")).toBeInTheDocument();
    });

    it("keeps generic paragraph rendering when no structured codex lines are present", async () => {
        const entries: CodexEntry[] = [
            {
                exportKind: "abilities",
                entryKey: "Ability_Bloom",
                displayName: "Bloom",
                descriptionLines: ["A plain ability description."],
                referenceKeys: [],
            },
        ];

        useCodexStore.setState({
            entries,
            entriesByKey: buildEntriesByKey(entries),
            entriesByKind: { abilities: entries },
            entriesByKindKey: buildEntriesByKindKey(entries),
            loading: false,
            error: null,
        });

        render(
            <MemoryRouter initialEntries={["/codex?category=abilities&entry=Ability_Bloom"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "Bloom" })).toBeInTheDocument();
        const detailPane = screen.getByRole("region", { name: /selected codex entry/i });
        expect(within(detailPane).getByText("Description")).toBeInTheDocument();
        expect(within(detailPane).getByText("A plain ability description.")).toBeInTheDocument();
        expect(screen.queryByText("Ability dossier")).not.toBeInTheDocument();
    });

    it("uses structured facts in kind summaries when current lines support it", async () => {
        const entries: CodexEntry[] = [
            {
                exportKind: "equipment",
                entryKey: "Equipment_Weapon_02_Definition",
                displayName: "Dawnblade",
                descriptionLines: [
                    "Type: Weapon",
                    "Slot: Main hand",
                    "Rarity: Rare",
                    "Tier: 2",
                ],
                referenceKeys: [],
            },
        ];

        useCodexStore.setState({
            entries,
            entriesByKey: buildEntriesByKey(entries),
            entriesByKind: { equipment: entries },
            entriesByKindKey: buildEntriesByKindKey(entries),
            loading: false,
            error: null,
        });

        render(
            <MemoryRouter initialEntries={["/codex?category=equipment"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        const summaryList = await screen.findByLabelText("Equipment overview");
        expect(within(summaryList).getByRole("button", { name: /dawnblade/i })).toHaveTextContent(
            "Weapon / Main hand / Rare / Tier 2"
        );
    });
});
