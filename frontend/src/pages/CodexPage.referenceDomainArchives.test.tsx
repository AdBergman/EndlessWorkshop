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

describe("CodexPage reference domain archives", () => {
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

    it("renders Improvements as a category archive with focus navigation and effect-first rows", async () => {
        const user = userEvent.setup();
        const entries: CodexEntry[] = [
            {
                exportKind: "improvements",
                entryKey: "DistrictImprovement_Bridge_00",
                displayName: "Flood Plain",
                category: "Bridge",
                kind: "Improvement",
                descriptionLines: [],
                referenceKeys: [],
                facts: [
                    { label: "Kind", value: "Improvement" },
                    { label: "Category", value: "Bridge" },
                ],
                sections: [{
                    title: "Effects",
                    lines: [
                        "Doubles [FoodColored] Food on Bridge when adjacent to Foundation",
                        "Doubles [IndustryColored] Industry on Bridge when adjacent to Foundation",
                        "Doubles [DustColored] Dust on Bridge when adjacent to Foundation",
                        "Doubles [ScienceColored] Science on Bridge when adjacent to Foundation",
                        "Doubles [CultureColored] Influence on Bridge when adjacent to Foundation",
                    ],
                }],
            },
            {
                exportKind: "improvements",
                entryKey: "DistrictImprovement_Money_00",
                displayName: "Dust Refinery",
                category: "Money",
                kind: "Improvement",
                descriptionLines: [],
                referenceKeys: [],
                facts: [
                    { label: "Kind", value: "Improvement" },
                    { label: "Category", value: "Money" },
                ],
            },
            {
                exportKind: "improvements",
                entryKey: "DistrictImprovement_PublicOrder_00",
                displayName: "Traveler's Shrine",
                category: "PublicOrder",
                kind: "Improvement",
                descriptionLines: [],
                referenceKeys: [],
                facts: [
                    { label: "Kind", value: "Improvement" },
                    { label: "Category", value: "PublicOrder" },
                ],
                sections: [{ title: "Effects", lines: ["+10 [PublicOrderColored] Approval"] }],
            },
            {
                exportKind: "tech",
                entryKey: "Technology_City_01",
                displayName: "City Planning",
                descriptionLines: ["Unlocks city structures."],
                referenceKeys: [],
            },
        ];

        seedCodexEntries(entries);

        render(
            <MemoryRouter initialEntries={["/codex?category=improvements"]}>
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

        expect(await screen.findByRole("heading", { name: "All Improvements" })).toBeInTheDocument();
        const improvementRail = screen.getByRole("complementary", { name: /improvement archive filters/i });
        expect(improvementRail).toBeInTheDocument();
        expect(screen.queryByRole("complementary", { name: /codex results/i })).not.toBeInTheDocument();
        expect(document.querySelector(".codex-workspace--improvementArchive")).toBeInTheDocument();
        expect(within(improvementRail).getByRole("button", { name: "All 3" })).toHaveAttribute("aria-pressed", "true");
        expect(within(improvementRail).getByRole("button", { name: "Bridge 1" })).toBeInTheDocument();
        expect(within(improvementRail).getByRole("button", { name: "Dust 1" })).toBeInTheDocument();
        expect(within(improvementRail).getByRole("button", { name: "Approval 1" })).toBeInTheDocument();

        const improvementsOverview = screen.getByLabelText("Improvements overview");
        const floodPlainRow = getSummaryRowForButton(
            within(improvementsOverview).getByRole("button", { name: /flood plain/i })
        );
        expect(floodPlainRow).toHaveTextContent("Doubles Food on Bridge when adjacent to Foundation");
        expect(floodPlainRow).toHaveTextContent("Doubles Influence on Bridge when adjacent to Foundation");
        expect(within(floodPlainRow).getByRole("img", { name: "FoodColored" })).toBeInTheDocument();
        expect(floodPlainRow).toHaveTextContent("Bridge");
        expect(floodPlainRow).not.toHaveTextContent("Kind Improvement");

        const dustRefineryRow = getSummaryRowForButton(
            within(improvementsOverview).getByRole("button", { name: /dust refinery/i })
        );
        expect(dustRefineryRow).toHaveTextContent("Dust");
        expect(dustRefineryRow).toHaveTextContent("No public improvement effects exported yet.");

        await user.click(within(improvementRail).getByRole("button", { name: "Dust 1" }));

        expect(within(improvementRail).getByRole("button", { name: "Dust 1" })).toHaveAttribute("aria-pressed", "true");
        expect(within(improvementsOverview).getByText("Dust Refinery")).toBeInTheDocument();
        expect(within(improvementsOverview).queryByText("Flood Plain")).not.toBeInTheDocument();

        await user.click(within(improvementRail).getByRole("button", { name: "Dust 1" }));

        expect(within(improvementRail).getByRole("button", { name: "All 3" })).toHaveAttribute("aria-pressed", "true");
        expect(within(improvementsOverview).getByText("Flood Plain")).toBeInTheDocument();

        const searchInput = screen.getByRole("combobox", { name: /search the encyclopedia/i });
        await user.type(searchInput, "shrine");

        expect(within(improvementRail).getByRole("button", { name: "All 1" })).toHaveAttribute("aria-pressed", "true");
        expect(within(improvementRail).getByRole("button", { name: "Approval 1" })).toBeInTheDocument();
        expect(within(improvementRail).getByRole("button", { name: "Bridge 0" })).toBeInTheDocument();
        expect(within(improvementsOverview).getByText("Traveler's Shrine")).toBeInTheDocument();
        expect(within(improvementsOverview).queryByText("Dust Refinery")).not.toBeInTheDocument();

        cleanup();
        seedCodexEntries(entries);

        render(
            <MemoryRouter initialEntries={["/codex?category=improvements&entry=DistrictImprovement_Bridge_00"]}>
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

        expect(await screen.findByRole("heading", { name: "Flood Plain" })).toBeInTheDocument();
        const detailImprovementRail = screen.getByRole("complementary", { name: /improvement archive filters/i });

        await user.click(within(detailImprovementRail).getByRole("button", { name: "Dust 1" }));

        expect(await screen.findByRole("heading", { name: "All Improvements" })).toBeInTheDocument();
        expect(screen.queryByRole("heading", { name: "Flood Plain" })).not.toBeInTheDocument();
        expect(screen.getByTestId("location-probe")).toHaveTextContent("/codex?category=improvements");
        expect(within(screen.getByLabelText("Improvements overview")).getByText("Dust Refinery")).toBeInTheDocument();
    });



    it("renders Districts as a category archive with focus navigation, effect rows, and exact resource links", async () => {
        const user = userEvent.setup();
        const entries: CodexEntry[] = [
            {
                exportKind: "districts",
                entryKey: "District_Tier1_Food",
                displayName: "Farm",
                kind: "District",
                descriptionLines: [],
                referenceKeys: [],
                facts: [
                    { label: "Kind", value: "District" },
                    { label: "Category", value: "Food" },
                    { label: "Tier", value: "1" },
                ],
                sections: [{
                    title: "Effects",
                    lines: [
                        "+3 [FoodColored] Food per District Level",
                        "+1 [FoodColored] on Tile producing [FoodColored] Food",
                    ],
                }],
            },
            {
                exportKind: "districts",
                entryKey: "Extractor_Luxury01",
                displayName: "[Luxury01] Klax Extractor",
                kind: "District",
                descriptionLines: [],
                referenceKeys: ["Resource_Luxury01"],
                facts: [
                    { label: "Kind", value: "District" },
                    { label: "Category", value: "Resource" },
                ],
                sections: [
                    {
                        title: "Extracted resource",
                        items: [{ label: "Klax", referenceKey: "Resource_Luxury01" }],
                    },
                    {
                        title: "Effects",
                        lines: [
                            "+1 [Luxury01] Klax per District Level",
                            "+10 [Luxury01] Klax stock capacity per District Level",
                        ],
                    },
                ],
            },
            {
                exportKind: "districts",
                entryKey: "District_Tier2_Military",
                displayName: "Advanced Keep",
                kind: "District",
                descriptionLines: [],
                referenceKeys: [],
                facts: [
                    { label: "Kind", value: "District" },
                    { label: "Category", value: "Military" },
                    { label: "Tier", value: "2" },
                ],
                sections: [],
            },
            {
                exportKind: "resources",
                entryKey: "Resource_Luxury01",
                displayName: "Klax",
                kind: "Resource",
                descriptionLines: ["Luxury resource."],
                referenceKeys: [],
                facts: [{ label: "Resource type", value: "Luxury" }],
            },
            {
                exportKind: "improvements",
                entryKey: "DistrictImprovement_Food_00",
                displayName: "Granary",
                kind: "Improvement",
                descriptionLines: [],
                referenceKeys: [],
                facts: [
                    { label: "Kind", value: "Improvement" },
                    { label: "Category", value: "Food" },
                ],
            },
        ];

        seedCodexEntries(entries);

        render(
            <MemoryRouter initialEntries={["/codex?category=districts"]}>
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

        expect(await screen.findByRole("heading", { name: "All Districts" })).toBeInTheDocument();
        const districtRail = screen.getByRole("complementary", { name: /district archive filters/i });
        expect(districtRail).toBeInTheDocument();
        expect(screen.queryByRole("complementary", { name: /codex results/i })).not.toBeInTheDocument();
        expect(document.querySelector(".codex-workspace--districtArchive")).toBeInTheDocument();
        expect(within(districtRail).getByRole("button", { name: "All 3" })).toHaveAttribute("aria-pressed", "true");
        expect(within(districtRail).getByRole("button", { name: "Food 1" })).toBeInTheDocument();
        expect(within(districtRail).getByRole("button", { name: "Dust 0" })).toBeInTheDocument();
        expect(within(districtRail).getByRole("button", { name: "Resource 1" })).toBeInTheDocument();
        expect(within(districtRail).getByRole("button", { name: "Wonder 0" })).toBeInTheDocument();

        const districtsOverview = screen.getByLabelText("Districts overview");
        const farmRow = getSummaryRowForButton(
            within(districtsOverview).getByRole("button", { name: /farm/i })
        );
        expect(farmRow).toHaveTextContent("+3 Food per District Level");
        expect(farmRow).toHaveTextContent("Food");
        expect(farmRow).toHaveTextContent("Tier 1");
        expect(within(farmRow).getAllByRole("img", { name: "FoodColored" }).length).toBeGreaterThan(0);
        expect(farmRow).not.toHaveTextContent("Kind District");

        const extractorRow = getSummaryRowForButton(
            within(districtsOverview).getByRole("button", { name: /klax extractor/i })
        );
        expect(extractorRow).toHaveTextContent("Extracts:");
        expect(within(extractorRow).getByRole("button", { name: /open klax in codex/i })).toBeInTheDocument();

        const keepRow = getSummaryRowForButton(
            within(districtsOverview).getByRole("button", { name: /advanced keep/i })
        );
        expect(keepRow).toHaveTextContent("Military");
        expect(keepRow).toHaveTextContent("Tier 2");
        expect(keepRow).toHaveTextContent("No public district effects exported yet.");

        await user.click(within(districtRail).getByRole("button", { name: "Resource 1" }));

        expect(within(districtRail).getByRole("button", { name: "Resource 1" })).toHaveAttribute("aria-pressed", "true");
        expect(within(districtsOverview).getByRole("button", { name: /klax extractor/i })).toBeInTheDocument();
        expect(within(districtsOverview).queryByText("Farm")).not.toBeInTheDocument();

        await user.click(within(districtsOverview).getByRole("button", { name: /open klax in codex/i }));

        expect(await screen.findByRole("heading", { name: "Klax" })).toBeInTheDocument();
        expect(screen.getByTestId("location-probe")).toHaveTextContent("/codex?entry=Resource_Luxury01");

        cleanup();
        seedCodexEntries(entries);

        render(
            <MemoryRouter initialEntries={["/codex?category=districts&entry=District_Tier1_Food"]}>
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

        expect(await screen.findByRole("heading", { name: "Farm" })).toBeInTheDocument();
        const detailDistrictRail = screen.getByRole("complementary", { name: /district archive filters/i });

        await user.click(within(detailDistrictRail).getByRole("button", { name: "Military 1" }));

        expect(await screen.findByRole("heading", { name: "All Districts" })).toBeInTheDocument();
        expect(screen.queryByRole("heading", { name: "Farm" })).not.toBeInTheDocument();
        expect(screen.getByTestId("location-probe")).toHaveTextContent("/codex?category=districts");
        expect(within(screen.getByLabelText("Districts overview")).getByText("Advanced Keep")).toBeInTheDocument();
    });



    it("adds a Trait Type rail while keeping Trait rows reference-focused", async () => {
        const user = userEvent.setup();
        seedShallowReferenceLayoutEntries();

        render(
            <MemoryRouter initialEntries={["/codex?category=traits"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "All Traits" })).toBeInTheDocument();
        expect(screen.getByRole("complementary", { name: /trait archive filters/i })).toBeInTheDocument();
        expect(document.querySelector(".codex-workspace--traitArchive")).toBeInTheDocument();
        expect(document.querySelector(".codex-workspace--referenceOverview")).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: "All 2" })).toHaveAttribute("aria-pressed", "true");
        expect(screen.getByRole("button", { name: "Faction 1" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Protectorate 1" })).toBeInTheDocument();
        expect(within(screen.getByLabelText("Traits overview")).getByText("Harmonious Tactics")).toBeInTheDocument();
        expect(within(screen.getByLabelText("Traits overview")).getByText("Fierce Independence")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Faction 1" }));

        expect(screen.getByRole("button", { name: "Faction 1" })).toHaveAttribute("aria-pressed", "true");
        expect(await screen.findByRole("heading", { name: "All Traits" })).toBeInTheDocument();
        expect(within(screen.getByLabelText("Traits overview")).getByText("Harmonious Tactics")).toBeInTheDocument();
        expect(within(screen.getByLabelText("Traits overview")).queryByText("Fierce Independence")).not.toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Faction 1" }));

        expect(screen.getByRole("button", { name: "All 2" })).toHaveAttribute("aria-pressed", "true");
        expect(within(screen.getByLabelText("Traits overview")).getByText("Fierce Independence")).toBeInTheDocument();

        const searchInput = screen.getByRole("combobox", { name: /search the encyclopedia/i });
        await user.type(searchInput, "Harmonious");

        expect(screen.getByRole("button", { name: "All 1" })).toHaveAttribute("aria-pressed", "true");
        expect(screen.getByRole("button", { name: "Faction 1" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Protectorate 0" })).toBeInTheDocument();
        expect(within(screen.getByLabelText("Traits overview")).getByText("Harmonious Tactics")).toBeInTheDocument();
        expect(within(screen.getByLabelText("Traits overview")).queryByText("Fierce Independence")).not.toBeInTheDocument();

        cleanup();
        seedShallowReferenceLayoutEntries();

        render(
            <MemoryRouter initialEntries={["/codex?category=traits&entry=Trait_DaughterOfBor"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "Fierce Independence" })).toBeInTheDocument();
        expect(screen.getByRole("complementary", { name: /trait archive filters/i })).toBeInTheDocument();
        expect(document.querySelector(".codex-workspace--referenceOverview")).not.toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Faction 1" }));

        expect(await screen.findByRole("heading", { name: "All Traits" })).toBeInTheDocument();
        expect(screen.queryByRole("heading", { name: "Fierce Independence" })).not.toBeInTheDocument();
        expect(within(screen.getByLabelText("Traits overview")).getByText("Harmonious Tactics")).toBeInTheDocument();
        expect(within(screen.getByLabelText("Traits overview")).queryByText("Fierce Independence")).not.toBeInTheDocument();

        cleanup();
        seedShallowReferenceLayoutEntries();

        render(
            <MemoryRouter initialEntries={["/codex?category=tech"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "All Tech" })).toBeInTheDocument();
        expect(screen.getByRole("complementary", { name: /tech archive filters/i })).toBeInTheDocument();
        expect(document.querySelector(".codex-workspace--referenceOverview")).not.toBeInTheDocument();

        cleanup();
        seedShallowReferenceLayoutEntries();

        render(
            <MemoryRouter
                initialEntries={[
                    "/codex?category=partnereffects&entry=PartnerEffect_Hydracorn_PartnerTrait01",
                ]}
            >
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "Hopeless Romantic" })).toBeInTheDocument();
        expect(screen.getByRole("complementary", { name: /codex results/i })).toBeInTheDocument();
        expect(document.querySelector(".codex-workspace--referenceOverview")).not.toBeInTheDocument();
    });



    it("renders Quests as an archive with a Quest Category rail and no Codex progression widget", async () => {
        const user = userEvent.setup();
        const questEntries: CodexEntry[] = [
            {
                exportKind: "quests",
                entryKey: "FactionQuest_LastLord_Chapter01_Step01",
                displayName: "A Fragile Dawn",
                category: "MajorFaction",
                kind: "Quest",
                descriptionLines: ["The Last Lords awaken."],
                referenceKeys: [
                    "Faction_LastLord",
                    "FactionQuest_LastLord_Chapter02_Step01",
                    "Equipment_Armor_03_Definition",
                ],
                facts: [
                    { label: "Kind", value: "Quest" },
                    { label: "Category", value: "MajorFaction" },
                    { label: "Chapter", value: "1" },
                    { label: "Mandatory", value: "Yes" },
                ],
                sections: [
                    { title: "Objective", lines: ["Secure the first Last Lords foothold."] },
                    {
                        title: "Rewards",
                        lines: ["Equipment reward: Archite Plate"],
                        items: [{
                            label: "Archite Plate",
                            referenceKey: "Equipment_Armor_03_Definition",
                        }],
                    },
                ],
            },
            {
                exportKind: "quests",
                entryKey: "FactionQuest_LastLord_Chapter02_Step01",
                displayName: "A Blighted Resurrection",
                category: "MajorFaction",
                kind: "Quest",
                descriptionLines: ["The resurrection begins."],
                referenceKeys: ["Faction_Necrophage", "FactionQuest_LastLord_Chapter03_Step01"],
                facts: [
                    { label: "Kind", value: "Quest" },
                    { label: "Category", value: "MajorFaction" },
                    { label: "Chapter", value: "2" },
                    { label: "Mandatory", value: "Yes" },
                ],
            },
            {
                exportKind: "quests",
                entryKey: "MinorFaction_GenericQuest_01",
                displayName: "Night Terrors",
                category: "MinorFaction",
                kind: "Quest",
                descriptionLines: ["Brutal attacks befall the settlement."],
                referenceKeys: [],
                facts: [
                    { label: "Kind", value: "Quest" },
                    { label: "Category", value: "MinorFaction" },
                    { label: "Mandatory", value: "Yes" },
                ],
            },
            {
                exportKind: "quests",
                entryKey: "Collectible_Quest_001",
                displayName: "A Bloody Trail",
                category: "Curiosity",
                kind: "Quest",
                descriptionLines: ["Follow the tracks."],
                referenceKeys: [],
                facts: [
                    { label: "Kind", value: "Quest" },
                    { label: "Category", value: "Curiosity" },
                    { label: "Mandatory", value: "Yes" },
                ],
            },
            {
                exportKind: "quests",
                entryKey: "AwakeningQuest_CustomFaction01_Step01",
                displayName: "Something on the Shore",
                category: "Awakening",
                kind: "Quest",
                descriptionLines: ["A strange traveler asks for help."],
                referenceKeys: [],
                facts: [
                    { label: "Kind", value: "Quest" },
                    { label: "Category", value: "Awakening" },
                    { label: "Mandatory", value: "Yes" },
                ],
            },
        ];
        const entries: CodexEntry[] = [
            ...questEntries,
            {
                exportKind: "factions",
                entryKey: "Faction_LastLord",
                displayName: "Last Lords",
                descriptionLines: ["A major faction."],
                referenceKeys: [],
            },
            {
                exportKind: "factions",
                entryKey: "Faction_Necrophage",
                displayName: "Necrophages",
                descriptionLines: ["A major faction."],
                referenceKeys: [],
            },
            {
                exportKind: "equipment",
                entryKey: "Equipment_Armor_03_Definition",
                displayName: "Archite Plate",
                descriptionLines: [],
                referenceKeys: [],
                sections: [{ title: "Effects", lines: ["+20 [Defense] Defense on Hero"] }],
            },
        ];

        useCodexStore.setState({
            entries,
            entriesByKey: buildEntriesByKey(entries),
            entriesByKind: {
                quests: questEntries,
                factions: entries.filter((entry) => entry.exportKind === "factions"),
                equipment: entries.filter((entry) => entry.exportKind === "equipment"),
            },
            entriesByKindKey: buildEntriesByKindKey(entries),
            loading: false,
            error: null,
        });

        render(
            <MemoryRouter initialEntries={["/codex?category=quests"]}>
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

        expect(await screen.findByRole("heading", { name: "All Quests" })).toBeInTheDocument();
        const questRail = screen.getByRole("complementary", { name: /quest archive filters/i });
        expect(questRail).toBeInTheDocument();
        expect(document.querySelector(".codex-workspace--questArchive")).toBeInTheDocument();
        expect(within(questRail).getByRole("button", { name: "All 5" })).toHaveAttribute("aria-pressed", "true");
        expect(within(questRail).getByRole("button", { name: "Major Faction 2" })).toBeInTheDocument();
        expect(within(questRail).getByRole("button", { name: "Minor Faction 1" })).toBeInTheDocument();
        expect(within(questRail).getByRole("button", { name: "Curiosity 1" })).toBeInTheDocument();
        expect(within(questRail).getByRole("button", { name: "Awakening 1" })).toBeInTheDocument();
        expect(within(questRail).getByRole("button", { name: "Last Lords 1" })).toBeInTheDocument();
        expect(within(questRail).getByRole("button", { name: "Necrophages 1" })).toBeInTheDocument();
        const summaryList = screen.getByLabelText("Quests overview");
        expect(within(summaryList).getByText("A Fragile Dawn")).toBeInTheDocument();
        expect(within(summaryList).getByText("Secure the first Last Lords foothold.")).toBeInTheDocument();
        expect(within(summaryList).getByText("Rewards: Equipment reward: Archite Plate")).toBeInTheDocument();
        expect(within(summaryList).getByRole("button", { name: /open archite plate in codex/i })).toBeInTheDocument();
        expect(within(summaryList).getByText("Night Terrors")).toBeInTheDocument();
        expect(within(summaryList).queryByText(/quest nodes/i)).not.toBeInTheDocument();
        expect(within(summaryList).queryByText("Major Faction / Chapter 1 / Mandatory")).not.toBeInTheDocument();

        await user.click(within(questRail).getByRole("button", { name: "Major Faction 2" }));

        expect(within(questRail).getByRole("button", { name: "Major Faction 2" })).toHaveAttribute("aria-pressed", "true");
        expect(within(summaryList).getByText("A Fragile Dawn")).toBeInTheDocument();
        expect(within(summaryList).queryByText("Night Terrors")).not.toBeInTheDocument();

        await user.click(within(questRail).getByRole("button", { name: "Last Lords 1" }));

        expect(within(questRail).getByRole("button", { name: "Last Lords 1" })).toHaveAttribute("aria-pressed", "true");
        expect(within(summaryList).getByText("A Fragile Dawn")).toBeInTheDocument();
        expect(within(summaryList).queryByText("A Blighted Resurrection")).not.toBeInTheDocument();

        await user.click(within(questRail).getByRole("button", { name: "All 5" }));

        const searchInput = screen.getByRole("combobox", { name: /search the encyclopedia/i });
        await user.type(searchInput, "resurrection");
        expect(within(questRail).getByRole("button", { name: "All 1" })).toBeInTheDocument();
        expect(within(summaryList).getByText("A Blighted Resurrection")).toBeInTheDocument();
        expect(within(summaryList).queryByText("A Fragile Dawn")).not.toBeInTheDocument();

        cleanup();
        useCodexStore.setState({
            entries,
            entriesByKey: buildEntriesByKey(entries),
            entriesByKind: {
                quests: questEntries,
                factions: entries.filter((entry) => entry.exportKind === "factions"),
                equipment: entries.filter((entry) => entry.exportKind === "equipment"),
            },
            entriesByKindKey: buildEntriesByKindKey(entries),
            loading: false,
            error: null,
        });

        render(
            <MemoryRouter initialEntries={["/codex?category=quests&entry=FactionQuest_LastLord_Chapter01_Step01"]}>
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

        expect(await screen.findByRole("heading", { name: "A Fragile Dawn" })).toBeInTheDocument();
        const detailPane = screen.getByLabelText("Selected codex entry");
        expect(within(detailPane).queryByText("Quest Progression")).not.toBeInTheDocument();
        expect(within(detailPane).getByText("Major Faction")).toBeInTheDocument();
        expect(within(detailPane).getByText("Chapter 1")).toBeInTheDocument();
        const relatedSection = await screen.findByRole("region", { name: /related entries/i });
        expect(within(relatedSection).getByRole("button", { name: /a blighted resurrection quest .* major faction .* chapter 2 .* mandatory/i }))
            .toBeInTheDocument();

        const detailQuestRail = screen.getByRole("complementary", { name: /quest archive filters/i });
        await user.click(within(detailQuestRail).getByRole("button", { name: "Minor Faction 1" }));

        expect(await screen.findByRole("heading", { name: "All Quests" })).toBeInTheDocument();
        expect(screen.getByTestId("location-probe")).toHaveTextContent("/codex?category=quests");
        expect(within(screen.getByLabelText("Quests overview")).getByText("Night Terrors")).toBeInTheDocument();
        expect(screen.queryByRole("heading", { name: "A Fragile Dawn" })).not.toBeInTheDocument();
    });



});
