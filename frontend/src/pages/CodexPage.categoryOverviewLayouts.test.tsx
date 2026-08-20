import {
cleanupCodexPageStores,
resetCodexPageTestState,
seedCodexEntries,
seedShallowReferenceLayoutEntries
} from "@/pages/testUtils/codexPageHarness";
import { useCodexStore } from "@/stores/codexStore";
import type { CodexEntry } from "@/types/dataTypes";
import { cleanup,render,screen,waitFor,within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter,Route,Routes } from "react-router-dom";
import CodexPage from "./CodexPage";

describe("CodexPage category overview layouts", () => {
    beforeEach(() => {
        resetCodexPageTestState();
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
        vi.unstubAllEnvs();
        cleanupCodexPageStores();
    });

    function getCategoryToolbar() {
        return screen.getByRole("toolbar", { name: /filter codex by category/i });
    }

    it("uses a full-width shallow overview for partner and councilor effect category routes", async () => {
        seedShallowReferenceLayoutEntries();

        render(
            <MemoryRouter initialEntries={["/codex?category=partnereffects"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "All Partner Effects" })).toBeInTheDocument();
        expect(screen.queryByRole("complementary", { name: /codex results/i })).not.toBeInTheDocument();
        expect(document.querySelector(".codex-workspace--referenceOverview")).toBeInTheDocument();
        expect(within(getCategoryToolbar()).getByRole("button", { name: /partner effects/i }))
            .toHaveAttribute("aria-pressed", "true");
        expect(within(getCategoryToolbar()).queryByRole("button", { name: /modifiers/i }))
            .not.toBeInTheDocument();

        const partnerOverview = screen.getByLabelText("Partner Effects overview");
        expect(within(partnerOverview).getByText("Hero")).toBeInTheDocument();
        expect(within(partnerOverview).getByLabelText("Hopeless Romantic effects"))
            .toHaveTextContent("+1 Movement Points outside battle");
        expect(within(partnerOverview).getByRole("button", { name: /Source: Atea/i }))
            .toBeInTheDocument();

        cleanup();
        seedShallowReferenceLayoutEntries();

        render(
            <MemoryRouter initialEntries={["/codex?category=counciloreffects"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "All Councilor Effects" })).toBeInTheDocument();
        expect(screen.queryByRole("complementary", { name: /codex results/i })).not.toBeInTheDocument();
        expect(document.querySelector(".codex-workspace--referenceOverview")).toBeInTheDocument();
        expect(within(getCategoryToolbar()).getByRole("button", { name: /councilor effects/i }))
            .toHaveAttribute("aria-pressed", "true");

        const councilorOverview = screen.getByLabelText("Councilor Effects overview");
        expect(within(councilorOverview).getByText("Defense")).toBeInTheDocument();
        expect(within(councilorOverview).getByLabelText("Travels Well effects"))
            .toHaveTextContent("+100% Health Regeneration in Guard stance");
        expect(within(councilorOverview).getByRole("button", { name: /Source: Atea/i }))
            .toBeInTheDocument();
    });



    it("uses full-width overview for resources while keeping selected and search states split", async () => {
        const user = userEvent.setup();
        seedShallowReferenceLayoutEntries();

        render(
            <MemoryRouter initialEntries={["/codex?category=resources"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "All Resources" })).toBeInTheDocument();
        expect(screen.queryByRole("complementary", { name: /codex results/i })).not.toBeInTheDocument();
        expect(document.querySelector(".codex-workspace--referenceOverview")).toBeInTheDocument();
        const resourceOverview = screen.getByLabelText("Resources overview");
        expect(within(resourceOverview).getByLabelText("Klax effects")).toHaveTextContent("+15 Approval on City");

        cleanup();
        seedShallowReferenceLayoutEntries();

        render(
            <MemoryRouter initialEntries={["/codex?category=resources&entry=Resource_Luxury01"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "Klax" })).toBeInTheDocument();
        expect(screen.getByRole("complementary", { name: /codex results/i })).toBeInTheDocument();
        expect(document.querySelector(".codex-workspace--referenceOverview")).not.toBeInTheDocument();

        cleanup();
        seedShallowReferenceLayoutEntries();

        render(
            <MemoryRouter initialEntries={["/codex?category=resources"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        const searchInput = await screen.findByRole("combobox", { name: /search the encyclopedia/i });
        await user.type(searchInput, "Klax");

        expect(await screen.findByRole("heading", { name: "All Resources" })).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.getByRole("complementary", { name: /codex results/i })).toBeInTheDocument();
        });
        expect(document.querySelector(".codex-workspace--referenceOverview")).not.toBeInTheDocument();
    });



    it("renders resource overview icons and sorts resources by exported type groups", async () => {
        const entries: CodexEntry[] = [
            {
                exportKind: "resources",
                entryKey: "Resource_Strategic02",
                displayName: "Glasssteel",
                descriptionLines: [],
                referenceKeys: ["Extractor_Strategic02"],
                facts: [{ label: "Type", value: "Strategic resource" }],
                sections: [{
                    title: "Extractors",
                    items: [{ label: "Glasssteel Extractor", referenceKey: "Extractor_Strategic02" }],
                }],
            },
            {
                exportKind: "resources",
                entryKey: "Resource_SpecificCorpse",
                displayName: "Corpses",
                descriptionLines: [],
                referenceKeys: [],
                facts: [{ label: "Type", value: "Specific resource" }],
            },
            {
                exportKind: "resources",
                entryKey: "Resource_Luxury10",
                displayName: "Auric Coral",
                descriptionLines: [],
                referenceKeys: ["Extractor_Luxury10"],
                facts: [{ label: "Type", value: "Luxury resource" }],
                sections: [{
                    title: "Extractors",
                    items: [{ label: "Auric Coral Extractor", referenceKey: "Extractor_Luxury10" }],
                }],
            },
            {
                exportKind: "resources",
                entryKey: "Resource_Strategic01",
                displayName: "Titanium",
                descriptionLines: [],
                referenceKeys: ["Extractor_Strategic01"],
                facts: [{ label: "Type", value: "Strategic resource" }],
                sections: [{
                    title: "Extractors",
                    items: [{ label: "Titanium Extractor", referenceKey: "Extractor_Strategic01" }],
                }],
            },
            {
                exportKind: "resources",
                entryKey: "Resource_Luxury01",
                displayName: "Klax",
                descriptionLines: [],
                referenceKeys: ["Extractor_Luxury01"],
                facts: [{ label: "Type", value: "Luxury resource" }],
                sections: [{
                    title: "Effects",
                    lines: ["+15 [PublicOrderColored] Approval on City"],
                }, {
                    title: "Extractors",
                    items: [{ label: "Klax Extractor", referenceKey: "Extractor_Luxury01" }],
                }],
            },
            {
                exportKind: "resources",
                entryKey: "Resource_Exotic01",
                displayName: "Fallen Spirit",
                descriptionLines: [],
                referenceKeys: [],
                facts: [{ label: "Type", value: "Exotic resource" }],
            },
            {
                exportKind: "extractors",
                entryKey: "Extractor_Luxury01",
                displayName: "Klax Extractor",
                descriptionLines: [],
                referenceKeys: ["Resource_Luxury01"],
            },
            {
                exportKind: "extractors",
                entryKey: "Extractor_Luxury10",
                displayName: "Auric Coral Extractor",
                descriptionLines: [],
                referenceKeys: ["Resource_Luxury10"],
            },
            {
                exportKind: "extractors",
                entryKey: "Extractor_Strategic01",
                displayName: "Titanium Extractor",
                descriptionLines: [],
                referenceKeys: ["Resource_Strategic01"],
            },
            {
                exportKind: "extractors",
                entryKey: "Extractor_Strategic02",
                displayName: "Glasssteel Extractor",
                descriptionLines: [],
                referenceKeys: ["Resource_Strategic02"],
            },
            {
                exportKind: "modifiers",
                entryKey: "Modifier_Test",
                displayName: "Modifier Test",
                descriptionLines: [],
                referenceKeys: [],
            },
        ];
        seedCodexEntries(entries);

        const { container } = render(
            <MemoryRouter initialEntries={["/codex?category=resources"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "All Resources" })).toBeInTheDocument();
        expect(screen.queryByRole("complementary", { name: /codex results/i })).not.toBeInTheDocument();
        expect(document.querySelector(".codex-workspace--referenceOverview")).toBeInTheDocument();
        expect(within(getCategoryToolbar()).queryByRole("button", { name: /extractors/i })).not.toBeInTheDocument();
        expect(within(getCategoryToolbar()).queryByRole("button", { name: /modifiers/i })).not.toBeInTheDocument();

        const rowLabels = Array.from(container.querySelectorAll(".codex-summaryList__item--shallow .codex-summaryList__name"))
            .map((element) => element.textContent?.trim());
        expect(rowLabels).toEqual([
            "Auric Coral",
            "Klax",
            "Glasssteel",
            "Titanium",
            "Corpses",
            "Fallen Spirit",
        ]);
        expect(container.querySelector(
            'img.codex-kindIcon--summaryResource[src="/svg/constructibles/UI_Resource_Luxury_Klak.svg"]'
        )).toBeInTheDocument();
        expect(within(screen.getByLabelText("Resources overview"))
            .getByRole("button", { name: /Extractor: Klax Extractor/i })).toBeInTheDocument();
    });



    it("requests only the active category when entries are not cached", async () => {
        const originalLoadCategory = useCodexStore.getState().loadCategory;
        const originalLoadSummary = useCodexStore.getState().loadSummary;
        const loadCategory = vi.fn().mockResolvedValue(undefined);
        const loadSummary = vi.fn().mockResolvedValue(undefined);

        useCodexStore.setState({
            entries: [],
            entriesByKey: {},
            entriesByKind: {},
            entriesByKindKey: {},
            categorySummaries: [],
            loading: false,
            error: null,
            fullLoaded: false,
            categoryLoadStates: {},
            summaryLoaded: false,
            summaryLoading: false,
            summaryError: null,
            lastLoadedAt: undefined,
            loadCategory,
            loadSummary,
        });

        try {
            render(
                <MemoryRouter initialEntries={["/codex?category=districts"]}>
                    <Routes>
                        <Route path="/codex" element={<CodexPage />} />
                    </Routes>
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(loadCategory).toHaveBeenCalledWith("districts");
            });
            expect(loadSummary).toHaveBeenCalledTimes(1);
        } finally {
            useCodexStore.setState({
                loadCategory: originalLoadCategory,
                loadSummary: originalLoadSummary,
            });
        }
    });




});
