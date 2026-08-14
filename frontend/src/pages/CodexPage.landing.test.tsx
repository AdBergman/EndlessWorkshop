import { apiClient } from "@/api/apiClient";
import {
cleanupCodexPageStores,
resetCodexPageTestState,
seedCodexEntries
} from "@/pages/testUtils/codexPageHarness";
import { seedDefaultCodexStore } from "@/pages/testUtils/codexPageTestUtils";
import { useCodexStore } from "@/stores/codexStore";
import { cleanup,render,screen,waitFor,within } from "@testing-library/react";
import { MemoryRouter,Route,Routes } from "react-router-dom";
import CodexPage from "./CodexPage";

describe("CodexPage landing hydration", () => {
    beforeEach(() => {
        resetCodexPageTestState();
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
        vi.unstubAllEnvs();
        cleanupCodexPageStores();
    });

    function getLandingCategoryIndex() {
        return screen.getByLabelText("Codex category index");
    }

    function getLandingCategoryLabels() {
        return within(getLandingCategoryIndex())
            .getAllByRole("button")
            .map((button) => button.querySelector(".codex-overview__kind")?.textContent?.trim());
    }

    it("uses landing category cards as category navigation on the default route", async () => {
        render(
            <MemoryRouter initialEntries={["/codex"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "Encyclopedia Index" })).toBeInTheDocument();
        expect(getLandingCategoryIndex()).toBeInTheDocument();
        expect(screen.queryByRole("toolbar", { name: /filter codex by category/i })).not.toBeInTheDocument();
        expect(screen.queryByRole("group", { name: /war & units/i })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /war & units/i })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /all categories/i })).not.toBeInTheDocument();
    });



    it("shows stable landing placeholders while Codex summaries are hydrating", async () => {
        const originalLoadSummary = useCodexStore.getState().loadSummary;
        const loadSummary = vi.fn().mockResolvedValue(undefined);

        useCodexStore.setState({
            entries: [],
            entriesByKey: {},
            entriesByKind: {},
            entriesByKindKey: {},
            categorySummaries: [],
            loading: true,
            error: null,
            summaryLoaded: false,
            summaryLoading: true,
            summaryError: null,
            loadSummary,
        });

        try {
            render(
                <MemoryRouter initialEntries={["/codex"]}>
                    <Routes>
                        <Route path="/codex" element={<CodexPage />} />
                    </Routes>
                </MemoryRouter>
            );

            expect(await screen.findByRole("heading", { name: "Encyclopedia Index" })).toBeInTheDocument();
            const loadingIndex = screen.getByLabelText("Codex category index loading");
            expect(loadingIndex).toBeInTheDocument();
            expect(within(loadingIndex).getByText("Loading encyclopedia categories…")).toBeInTheDocument();
            expect(within(loadingIndex).queryAllByRole("button")).toHaveLength(0);
            expect(screen.queryByLabelText("Codex category index")).not.toBeInTheDocument();
        } finally {
            useCodexStore.setState({ loadSummary: originalLoadSummary });
        }
    });



    it("keeps existing landing category cards visible during a refetch", async () => {
        seedDefaultCodexStore();
        useCodexStore.setState({ loading: true });

        render(
            <MemoryRouter initialEntries={["/codex"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "Encyclopedia Index" })).toBeInTheDocument();
        expect(screen.queryByLabelText("Codex category index loading")).not.toBeInTheDocument();
        const categoryIndex = getLandingCategoryIndex();
        expect(within(categoryIndex).getByRole("button", {
            name: /districts 2 city tiles, exploitations, and terrain infrastructure/i,
        })).toBeInTheDocument();
    });



    it("shows the game data version block on the landing page when freshness is available", async () => {
        vi.mocked(apiClient.getDataFreshness).mockResolvedValueOnce({
            available: true,
            latestImportAtUtc: "2026-06-23T10:30:00Z",
            game: "Endless Legend 2",
            gameVersion: "0.82",
            exporterVersion: "0.1.0",
            exportedAtUtc: "2026-06-22T05:57:36Z",
            sourceLabel: "local-imports",
            importedFileCount: 22,
            importedKinds: ["abilities", "tech"],
            note: null,
        });

        render(
            <MemoryRouter initialEntries={["/codex"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        const freshnessBlock = await screen.findByLabelText("Game data version");
        const categoryIndex = getLandingCategoryIndex();
        expect(Boolean(categoryIndex.compareDocumentPosition(freshnessBlock) & Node.DOCUMENT_POSITION_FOLLOWING))
            .toBe(true);
        expect(freshnessBlock).toBeVisible();
        expect(within(freshnessBlock).getByText("Game Data Version")).toBeInTheDocument();
        expect(within(freshnessBlock).getByText("Endless Legend 2 v0.82")).toBeVisible();
        expect(within(freshnessBlock).getByText("Snapshot date: 22 Jun 2026")).toBeVisible();
        expect(within(freshnessBlock).getByText(
            "Data shown on Endless Workshop is generated from game files. Snapshot date indicates when this data was last extracted from the game."
        )).toBeInTheDocument();
        expect(within(freshnessBlock).queryByText(/exporter version/i)).not.toBeInTheDocument();
        expect(within(freshnessBlock).queryByText(/local-imports/i)).not.toBeInTheDocument();
    });



    it("hides the game data version block quietly when freshness is unavailable or fails", async () => {
        vi.mocked(apiClient.getDataFreshness).mockRejectedValueOnce(new Error("freshness unavailable"));

        render(
            <MemoryRouter initialEntries={["/codex"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "Encyclopedia Index" })).toBeInTheDocument();
        await waitFor(() => expect(apiClient.getDataFreshness).toHaveBeenCalled());
        expect(screen.queryByLabelText("Game data version")).not.toBeInTheDocument();
    });



    it.each([
        ["/codex?category=districts"],
        ["/codex?category=districts&entry=District_MarketSquare"],
    ])("does not show the game data version block outside the landing page at %s", async (route) => {
        vi.mocked(apiClient.getDataFreshness).mockResolvedValueOnce({
            available: true,
            latestImportAtUtc: "2026-06-23T10:30:00Z",
            game: "Endless Legend 2",
            gameVersion: "0.82",
            exporterVersion: "0.1.0",
            exportedAtUtc: "2026-06-22T05:57:36Z",
            sourceLabel: "local-imports",
            importedFileCount: 22,
            importedKinds: ["districts"],
            note: null,
        });

        render(
            <MemoryRouter initialEntries={[route]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => expect(apiClient.getDataFreshness).toHaveBeenCalled());
        expect(screen.queryByLabelText("Game data version")).not.toBeInTheDocument();
    });



    it("renders local-visible categories directly in the landing category index during development", async () => {
        seedCodexEntries([
            { exportKind: "units", entryKey: "Unit_A", displayName: "Unit A", descriptionLines: [], referenceKeys: [] },
            { exportKind: "abilities", entryKey: "Ability_A", displayName: "Ability A", descriptionLines: [], referenceKeys: [] },
            { exportKind: "statuses", entryKey: "Status_A", displayName: "Status A", descriptionLines: [], referenceKeys: [] },
            { exportKind: "equipment", entryKey: "Equipment_A", displayName: "Equipment A", descriptionLines: [], referenceKeys: [] },
            { exportKind: "tech", entryKey: "Tech_A", displayName: "Tech A", descriptionLines: [], referenceKeys: [] },
            { exportKind: "districts", entryKey: "District_A", displayName: "District A", descriptionLines: [], referenceKeys: [] },
            { exportKind: "improvements", entryKey: "Improvement_A", displayName: "Improvement A", descriptionLines: [], referenceKeys: [] },
            { exportKind: "resources", entryKey: "Resource_A", displayName: "Resource A", descriptionLines: [], referenceKeys: [] },
            { exportKind: "extractors", entryKey: "Extractor_A", displayName: "Extractor A", descriptionLines: [], referenceKeys: [] },
            { exportKind: "actions", entryKey: "Action_A", displayName: "Action A", descriptionLines: [], referenceKeys: [] },
            { exportKind: "factions", entryKey: "Faction_A", displayName: "Faction A", descriptionLines: [], referenceKeys: [] },
            { exportKind: "minorFactions", entryKey: "MinorFaction_A", displayName: "Minor Faction A", descriptionLines: [], referenceKeys: [] },
            { exportKind: "populations", entryKey: "Population_A", displayName: "Population A", descriptionLines: [], referenceKeys: [] },
            { exportKind: "heroes", entryKey: "Hero_A", displayName: "Hero A", descriptionLines: [], referenceKeys: [] },
            { exportKind: "councilors", entryKey: "Councilor_A", displayName: "Councilor A", descriptionLines: [], referenceKeys: [] },
            { exportKind: "traits", entryKey: "Trait_A", displayName: "Trait A", descriptionLines: [], referenceKeys: [] },
            {
                exportKind: "diplomaticTreaties",
                entryKey: "Treaty_A",
                displayName: "Treaty A",
                descriptionLines: [],
                referenceKeys: [],
            },
            { exportKind: "victorypaths", entryKey: "VictoryPath_A", displayName: "Victory Path A", descriptionLines: [], referenceKeys: [] },
            { exportKind: "victoryconditions", entryKey: "VictoryCondition_A", displayName: "Victory Condition A", descriptionLines: [], referenceKeys: [] },
            { exportKind: "quests", entryKey: "Quest_A", displayName: "Quest A", descriptionLines: [], referenceKeys: [] },
            { exportKind: "naturalwonders", entryKey: "NaturalWonder_A", displayName: "Natural Wonder A", descriptionLines: [], referenceKeys: [] },
            {
                exportKind: "councilorEffects",
                entryKey: "CouncilorEffect_A",
                displayName: "Councilor Effect A",
                descriptionLines: [],
                referenceKeys: [],
            },
            {
                exportKind: "partnerEffects",
                entryKey: "PartnerEffect_A",
                displayName: "Partner Effect A",
                descriptionLines: [],
                referenceKeys: [],
            },
            { exportKind: "modifiers", entryKey: "Modifier_A", displayName: "Modifier A", descriptionLines: [], referenceKeys: [] },
        ]);

        render(
            <MemoryRouter initialEntries={["/codex"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        await screen.findByRole("heading", { name: "Encyclopedia Index" });
        const categoryLabels = getLandingCategoryLabels();
        expect(categoryLabels).toEqual([
            "Abilities",
            "Actions",
            "Councilors",
            "Councilor Effects",
            "Partner Effects",
            "Districts",
            "Resources",
            "Equipment",
            "Factions",
            "Diplomacy",
            "Heroes",
            "Improvements",
            "Minor Factions",
            "Populations",
            "Statuses",
            "Tech",
            "Traits",
            "Units",
            "Victory Conditions",
            "Victory Paths",
            "Wonders",
        ]);
        expect(categoryLabels).not.toContain("Modifiers");
        expect(categoryLabels).not.toContain("Extractors");
        expect(categoryLabels).not.toContain("Quests");
    });



    it("requests only codex summaries on the default landing route when entries are not cached", async () => {
        const originalLoadEntries = useCodexStore.getState().loadEntries;
        const originalLoadSummary = useCodexStore.getState().loadSummary;
        const loadEntries = vi.fn().mockResolvedValue(undefined);
        const loadSummary = vi.fn().mockResolvedValue(undefined);

        useCodexStore.setState({
            entries: [],
            entriesByKey: {},
            entriesByKind: {},
            entriesByKindKey: {},
            categorySummaries: [],
            loading: false,
            error: null,
            summaryLoaded: false,
            summaryLoading: false,
            summaryError: null,
            lastLoadedAt: undefined,
            loadEntries,
            loadSummary,
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
                expect(loadSummary).toHaveBeenCalledTimes(1);
            });
            expect(loadEntries).not.toHaveBeenCalled();
        } finally {
            useCodexStore.setState({
                loadEntries: originalLoadEntries,
                loadSummary: originalLoadSummary,
            });
        }
    });



});
