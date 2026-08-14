import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter, MemoryRouter, Route, Routes } from "react-router-dom";
import { apiClient } from "@/api/apiClient";
import TopContainer from "@/components/TopContainer/TopContainer";
import CodexPage from "./CodexPage";
import { useCodexStore } from "@/stores/codexStore";
import { useTechStore } from "@/stores/techStore";
import { useUnitStore } from "@/stores/unitStore";
import { buildEntriesByKey, buildEntriesByKindKey } from "@/lib/codex/codexRefs";
import { BackButton, LocationProbe, seedDefaultCodexStore } from "@/pages/testUtils/codexPageTestUtils";
import {
    cleanupCodexPageStores,
    getSummaryRowForButton,
    heroFixture,
    heroSkill,
    heroSkillTier,
    heroSkillTree,
    mockDefaultCodexPageApi,
    resetCodexPageTestState,
    richDistrict,
    richFaction,
    richImprovement,
    richTech,
    richUnit,
    seedActionArchiveEntries,
    seedCodexEntries,
    seedHeroes,
    seedRichDistricts,
    seedRichFactions,
    seedRichImprovements,
    seedRichUnits,
    seedShallowReferenceLayoutEntries,
    seedSkills,
} from "@/pages/testUtils/codexPageHarness";
import type { CodexEntry } from "@/types/dataTypes";

describe("CodexPage route state", () => {
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

    function getLandingCategoryIndex() {
        return screen.getByLabelText("Codex category index");
    }

    function getLandingCategoryLabels() {
        return within(getLandingCategoryIndex())
            .getAllByRole("button")
            .map((button) => button.querySelector(".codex-overview__kind")?.textContent?.trim());
    }

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

        const kindIndex = await screen.findByLabelText("Codex category index");
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
        expect(screen.getByRole("heading", { name: "Encyclopedia Index" })).toBeInTheDocument();
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

        await user.click(within(getLandingCategoryIndex()).getByRole("button", {
            name: /districts 2/i,
        }));
        await user.type(screen.getByRole("combobox", { name: /search the encyclopedia/i }), "market");

        await waitFor(() => {
            expect(
                within(getCategoryToolbar()).getByRole("button", {
                    name: /districts/i,
                })
            ).toHaveAttribute("aria-pressed", "true");
        });
        expect(screen.getByRole("combobox", { name: /search the encyclopedia/i })).toHaveValue("market");
        expect(screen.getByTestId("location-probe")).not.toHaveTextContent(/^\/codex$/);

        await user.click(screen.getByRole("link", { name: "Codex" }));

        await waitFor(() => {
            expect(screen.getByRole("heading", { name: "Encyclopedia Index" })).toBeInTheDocument();
        });

        expect(`${window.location.pathname}${window.location.search}`).toBe("/codex");
        expect(screen.getByRole("combobox", { name: /search the encyclopedia/i })).toHaveValue("");
        expect(screen.queryByRole("toolbar", { name: /filter codex by category/i })).not.toBeInTheDocument();
        expect(screen.queryByRole("heading", { name: "All Districts" })).not.toBeInTheDocument();
    });



    it("keeps the search input focused and editable on the plain Codex route", async () => {
        const user = userEvent.setup();

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

        const input = await screen.findByRole("combobox", { name: /search the encyclopedia/i });
        await user.click(input);
        await user.type(input, "blo");

        const results = screen.getByLabelText("Codex results");
        expect(within(results).getByRole("button", { name: /bloom harbor/i })).toBeInTheDocument();
        expect(input).toHaveValue("blo");
        expect(input).toHaveFocus();

        await user.type(input, "om");

        expect(input).toHaveValue("bloom");
        expect(input).toHaveFocus();
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

        expect(await screen.findByRole("heading", { name: "Encyclopedia Index" })).toBeInTheDocument();
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
                name: /a haunted path quests \/ quest/i,
            })
        ).toHaveLength(1);
        expect(within(relatedSection).getByRole("button", { name: /last lords factions/i })).toBeInTheDocument();
        expect(within(relatedSection).getByRole("button", { name: /last lord population populations/i })).toBeInTheDocument();
        expect(within(relatedSection).getByRole("button", { name: /ametrine minor factions/i })).toBeInTheDocument();
        expect(within(relatedSection).getByRole("button", { name: /protectorate traits/i })).toBeInTheDocument();
    });



    it("renders related entries from publicContextKeys without self-links or unresolved raw keys", async () => {
        const entries: CodexEntry[] = [
            {
                exportKind: "actions",
                entryKey: "ActionTypeBuildBridge",
                displayName: "Build Bridge",
                descriptionLines: [],
                referenceKeys: ["ActionTypeBuildBridge"],
                publicContextKeys: [
                    "ActionTypeBuildBridge",
                    "Trait_Engineer",
                    "Missing_Public_Context_Key",
                    "EmpireActionTypeUnknown_TestAction",
                    "DistrictImprovement_Bridge_00",
                ],
                facts: [{ label: "Kind", value: "Action" }],
            },
            {
                exportKind: "traits",
                entryKey: "Trait_Engineer",
                displayName: "Engineer",
                descriptionLines: ["Bridge specialist."],
                referenceKeys: [],
            },
            {
                exportKind: "improvements",
                entryKey: "DistrictImprovement_Bridge_00",
                displayName: "Bridge",
                descriptionLines: [],
                referenceKeys: [],
                sections: [
                    {
                        title: "Effects",
                        lines: ["Allows units to cross river tiles."],
                    },
                ],
            },
        ];

        useCodexStore.setState({
            entries,
            entriesByKey: buildEntriesByKey(entries),
            entriesByKind: {
                actions: entries.filter((entry) => entry.exportKind === "actions"),
                traits: entries.filter((entry) => entry.exportKind === "traits"),
                improvements: entries.filter((entry) => entry.exportKind === "improvements"),
            },
            entriesByKindKey: buildEntriesByKindKey(entries),
            loading: false,
            error: null,
        });

        render(
            <MemoryRouter initialEntries={["/codex?category=actions&entry=ActionTypeBuildBridge"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "Build Bridge" })).toBeInTheDocument();
        const relatedSection = screen.getByRole("region", { name: /related entries/i });
        expect(within(relatedSection).getByRole("button", { name: /engineer traits/i })).toBeInTheDocument();
        expect(within(relatedSection).getByRole("button", { name: /bridge improvements/i })).toBeInTheDocument();
        expect(within(relatedSection).getByText("Allows units to cross river tiles.")).toBeInTheDocument();
        expect(within(relatedSection).queryByRole("button", { name: /build bridge actions/i })).not.toBeInTheDocument();
        expect(screen.queryByText("Missing_Public_Context_Key")).not.toBeInTheDocument();
        expect(screen.queryByText("EmpireActionTypeUnknown_TestAction")).not.toBeInTheDocument();
    });



});
