import { buildEntriesByKey,buildEntriesByKindKey } from "@/lib/codex/codexRefs";
import {
cleanupCodexPageStores,
resetCodexPageTestState,
richDistrict,
richImprovement,
richTech,
richUnit,
seedCodexEntries,
seedRichDistricts,
seedRichImprovements,
seedRichUnits
} from "@/pages/testUtils/codexPageHarness";
import { LocationProbe } from "@/pages/testUtils/codexPageTestUtils";
import { useCodexStore } from "@/stores/codexStore";
import { useTechStore } from "@/stores/techStore";
import { useUnitStore } from "@/stores/unitStore";
import type { CodexEntry } from "@/types/dataTypes";
import { cleanup,render,screen,waitFor,within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter,Route,Routes } from "react-router-dom";
import CodexPage from "./CodexPage";

describe("CodexPage rich planning enrichment", () => {
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

    it("enriches Tech details with exact rich prerequisite links without changing archive rows", async () => {
        const user = userEvent.setup();
        const entries: CodexEntry[] = [
            {
                exportKind: "tech",
                entryKey: "Tech_Current",
                displayName: "Current Tech",
                descriptionLines: [],
                referenceKeys: [],
                facts: [
                    { label: "Era", value: "3" },
                    { label: "Quadrant", value: "Discovery" },
                ],
                sections: [{ title: "Effects", lines: ["+20 [ScienceColored] Science"] }],
            },
            {
                exportKind: "tech",
                entryKey: "Tech_Prereq",
                displayName: "Prerequisite Tech",
                descriptionLines: ["Required foundation."],
                referenceKeys: [],
                facts: [{ label: "Era", value: "2" }],
            },
            {
                exportKind: "tech",
                entryKey: "Tech_Exclusive",
                displayName: "Exclusive Tech",
                descriptionLines: ["An alternate path."],
                referenceKeys: [],
                facts: [{ label: "Era", value: "2" }],
            },
        ];

        seedCodexEntries(entries);
        useTechStore.getState().replaceTechs([
            richTech({
                techKey: "Tech_Current",
                prereq: "Tech_Prereq",
                excludes: "Tech_Exclusive",
            }),
        ]);

        render(
            <MemoryRouter initialEntries={["/codex?category=tech&entry=Tech_Current"]}>
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

        expect(await screen.findByRole("heading", { name: "Current Tech" })).toBeInTheDocument();

        const prerequisiteSection = screen.getByRole("region", { name: "Prerequisites" });
        expect(within(prerequisiteSection).getByText("Requires")).toBeInTheDocument();
        expect(within(prerequisiteSection).getByText("Exclusive with")).toBeInTheDocument();

        const prerequisiteLink = within(prerequisiteSection).getByRole("button", {
            name: "Open Prerequisite Tech in Codex",
        });
        expect(prerequisiteLink).toHaveTextContent("Prerequisite Tech");
        expect(within(prerequisiteSection).getByRole("button", {
            name: "Open Exclusive Tech in Codex",
        })).toHaveTextContent("Exclusive Tech");

        prerequisiteLink.focus();
        expect(await screen.findByRole("tooltip")).toHaveTextContent("Prerequisite Tech");
        expect(screen.getByRole("tooltip")).toHaveTextContent("Required foundation.");
        prerequisiteLink.blur();
        await waitFor(() => expect(screen.queryByRole("tooltip")).not.toBeInTheDocument());

        await user.click(prerequisiteLink);
        expect(await screen.findByRole("heading", { name: "Prerequisite Tech" })).toBeInTheDocument();
        expect(screen.getByTestId("location-probe")).toHaveTextContent("/codex?category=tech&entry=Tech_Prereq");

        await user.click(screen.getByRole("button", { name: /tech/i }));
        const techOverview = await screen.findByLabelText("Tech overview");
        expect(techOverview).toHaveTextContent("Current Tech");
        expect(within(techOverview).queryByText("Requires")).not.toBeInTheDocument();
        expect(within(techOverview).queryByText("Exclusive with")).not.toBeInTheDocument();
    });



    it("enriches District details with exact planning links without changing archive rows", async () => {
        const user = userEvent.setup();
        const entries: CodexEntry[] = [
            {
                exportKind: "districts",
                entryKey: "District_Current",
                displayName: "Canal District",
                descriptionLines: [],
                referenceKeys: ["Tech_Irrigation", "District_OldCanal", "District_GrandCanal", "Resource_Pearls", "Tech_RelatedOnly"],
                facts: [
                    { label: "Category", value: "Food" },
                    { label: "Tier", value: "1" },
                ],
                sections: [
                    { title: "Effects", lines: ["+10 [FoodColored] Food"] },
                    {
                        title: "Extracted resource",
                        items: [{ label: "Pearls", referenceKey: "Resource_Pearls" }],
                    },
                ],
            },
            {
                exportKind: "tech",
                entryKey: "Tech_Irrigation",
                displayName: "Irrigation",
                descriptionLines: ["Unlocks water planning."],
                referenceKeys: [],
            },
            {
                exportKind: "districts",
                entryKey: "District_OldCanal",
                displayName: "Old Canal",
                descriptionLines: ["A smaller canal district."],
                referenceKeys: [],
            },
            {
                exportKind: "districts",
                entryKey: "District_GrandCanal",
                displayName: "Grand Canal",
                descriptionLines: ["A larger canal district."],
                referenceKeys: [],
            },
            {
                exportKind: "resources",
                entryKey: "Resource_Pearls",
                displayName: "Pearls",
                descriptionLines: ["Luxury resource."],
                referenceKeys: [],
            },
            {
                exportKind: "tech",
                entryKey: "Tech_RelatedOnly",
                displayName: "Related Only",
                descriptionLines: ["Still a normal related entry."],
                referenceKeys: [],
            },
        ];

        seedCodexEntries(entries);
        seedRichDistricts([
            richDistrict({
                districtKey: "District_OldCanal",
                levelUp: {
                    targetDistrictKey: "District_Current",
                    requiredAdjacentDistrictCount: 2,
                },
            }),
            richDistrict({
                districtKey: "District_Current",
                constructibleLevel: 2,
                constructionCost: ["120 Industry"],
                isFactionSpecific: true,
                unlockTechnologyKeys: ["Tech_Irrigation", "Tech_Missing"],
                levelUp: {
                    targetDistrictKey: "District_GrandCanal",
                    requiredAdjacentDistrictCount: 4,
                },
                placementPrerequisites: {
                    neighbourTiles: {
                        operator: "AnyTile",
                        territoryConstraint: "SameRegion",
                        ignoreCliff: true,
                    },
                    terrain: {
                        constraint: "Forbidden",
                        terrainTypeKeys: ["TerrainType_Ocean", "TerrainType_Lake"],
                        canBuildOnWasteland: false,
                        canBuildOnMud: false,
                    },
                    river: {
                        constraint: "NoRiver",
                    },
                    pointOfInterest: {
                        constraint: "NoResourceDeposit",
                        pointOfInterestKeys: [],
                    },
                },
            }),
        ]);

        render(
            <MemoryRouter initialEntries={["/codex?category=districts&entry=District_Current"]}>
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

        expect(await screen.findByRole("heading", { name: "Canal District" })).toBeInTheDocument();

        const referenceSection = screen.getByRole("region", { name: "District Reference" });
        expect(within(referenceSection).getByText("Strategic profile")).toBeInTheDocument();
        expect(referenceSection).toHaveTextContent("Food");
        expect(referenceSection).toHaveTextContent("Tier 1");
        expect(referenceSection).toHaveTextContent("Constructible level 2");
        expect(referenceSection).toHaveTextContent("Faction-specific");
        expect(referenceSection).toHaveTextContent("Cost: 120 Industry");
        expect(within(referenceSection).getByText("Strategic effects")).toBeInTheDocument();
        expect(referenceSection).toHaveTextContent("+10 Food");
        expect(within(referenceSection).getByText("Extracts")).toBeInTheDocument();
        expect(within(referenceSection).getByRole("button", {
            name: "Open Pearls in Codex",
        })).toHaveTextContent("Pearls");
        expect(within(referenceSection).getByText("Unlocked by")).toBeInTheDocument();
        expect(within(referenceSection).getByText("Upgrades from")).toBeInTheDocument();
        expect(within(referenceSection).getByText("Upgrades into")).toBeInTheDocument();
        expect(within(referenceSection).getByText("Known placement")).toBeInTheDocument();
        const techLink = within(referenceSection).getByRole("button", {
            name: "Open Irrigation in Codex",
        });
        expect(techLink).toHaveTextContent("Irrigation");
        expect(within(referenceSection).getByRole("button", {
            name: "Open Old Canal in Codex",
        })).toHaveTextContent("Old Canal");
        expect(within(referenceSection).getByRole("button", {
            name: "Open Grand Canal in Codex",
        })).toHaveTextContent("Grand Canal");
        expect(referenceSection).toHaveTextContent("2 adjacent districts");
        expect(referenceSection).toHaveTextContent("4 adjacent districts");
        expect(referenceSection).toHaveTextContent("Adjacent tile in same region");
        expect(referenceSection).toHaveTextContent("Cliffs ignored for adjacency");
        expect(referenceSection).toHaveTextContent("Forbidden terrain: Ocean, Lake");
        expect(referenceSection).toHaveTextContent("Cannot build on wasteland");
        expect(referenceSection).toHaveTextContent("Cannot build on mud");
        expect(referenceSection).toHaveTextContent("No river");
        expect(referenceSection).toHaveTextContent("No resource deposit");
        expect(referenceSection).not.toHaveTextContent("Tech_Missing");

        const relatedSection = screen.getByRole("region", { name: /related entries/i });
        expect(within(relatedSection).queryByRole("button", { name: /irrigation/i })).not.toBeInTheDocument();
        expect(within(relatedSection).queryByRole("button", { name: /old canal/i })).not.toBeInTheDocument();
        expect(within(relatedSection).queryByRole("button", { name: /grand canal/i })).not.toBeInTheDocument();
        expect(within(relatedSection).queryByRole("button", { name: /pearls/i })).not.toBeInTheDocument();
        expect(within(relatedSection).getByRole("button", { name: /related only/i })).toBeInTheDocument();

        techLink.focus();
        expect(await screen.findByRole("tooltip")).toHaveTextContent("Irrigation");
        techLink.blur();
        await waitFor(() => expect(screen.queryByRole("tooltip")).not.toBeInTheDocument());

        await user.click(techLink);
        expect(await screen.findByRole("heading", { name: "Irrigation" })).toBeInTheDocument();
        expect(screen.getByTestId("location-probe")).toHaveTextContent("/codex?entry=Tech_Irrigation");

        await user.click(within(getCategoryToolbar()).getByRole("button", { name: /districts/i }));
        const districtsOverview = await screen.findByLabelText("Districts overview");
        expect(districtsOverview).toHaveTextContent("Canal District");
        expect(within(districtsOverview).queryByText("Unlocked by")).not.toBeInTheDocument();
        expect(within(districtsOverview).queryByText("Upgrades into")).not.toBeInTheDocument();
    });



    it("enriches Unit details with exact rich evolution links without changing archive rows", async () => {
        const user = userEvent.setup();
        const entries: CodexEntry[] = [
            {
                exportKind: "units",
                entryKey: "Unit_Current",
                displayName: "Current Unit",
                descriptionLines: [],
                referenceKeys: [],
                facts: [
                    { label: "Tier", value: "2" },
                    { label: "Class", value: "Infantry" },
                ],
                sections: [{ title: "Stats", lines: ["+120 [Health] Health"] }],
            },
            {
                exportKind: "units",
                entryKey: "Unit_Previous",
                displayName: "Previous Unit",
                descriptionLines: ["Earlier battlefield form."],
                referenceKeys: [],
                facts: [{ label: "Tier", value: "1" }],
                sections: [{ title: "Stats", lines: ["+80 [Health] Health"] }],
            },
            {
                exportKind: "units",
                entryKey: "Unit_Evolved",
                displayName: "Evolved Unit",
                descriptionLines: ["Later battlefield form."],
                referenceKeys: [],
                facts: [{ label: "Tier", value: "3" }],
                sections: [{ title: "Stats", lines: ["+180 [Health] Health"] }],
            },
            {
                exportKind: "abilities",
                entryKey: "Ability_HiddenHelper",
                displayName: "Hidden Helper Ability",
                descriptionLines: ["Internal helper."],
                referenceKeys: [],
            },
        ];

        seedCodexEntries(entries);
        seedRichUnits([
            richUnit({
                unitKey: "Unit_Current",
                previousUnitKey: "Unit_Previous",
                nextEvolutionUnitKeys: ["Unit_Evolved"],
                abilityKeys: ["Ability_HiddenHelper"],
            }),
        ]);

        render(
            <MemoryRouter initialEntries={["/codex?category=units&entry=Unit_Current"]}>
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

        expect(await screen.findByRole("heading", { name: "Current Unit" })).toBeInTheDocument();

        const evolutionSection = screen.getByRole("region", { name: "Evolution" });
        expect(within(evolutionSection).getByText("Previous")).toBeInTheDocument();
        expect(within(evolutionSection).getByText("Evolves into")).toBeInTheDocument();
        const previousLink = within(evolutionSection).getByRole("button", {
            name: "Open Previous Unit in Codex",
        });
        expect(previousLink).toHaveTextContent("Previous Unit");
        expect(within(evolutionSection).getByRole("button", {
            name: "Open Evolved Unit in Codex",
        })).toHaveTextContent("Evolved Unit");
        expect(evolutionSection).not.toHaveTextContent("Hidden Helper Ability");

        previousLink.focus();
        expect(await screen.findByRole("tooltip")).toHaveTextContent("Previous Unit");
        expect(screen.getByRole("tooltip")).toHaveTextContent("+80 Health");
        previousLink.blur();
        await waitFor(() => expect(screen.queryByRole("tooltip")).not.toBeInTheDocument());

        await user.click(previousLink);
        expect(await screen.findByRole("heading", { name: "Previous Unit" })).toBeInTheDocument();
        expect(screen.getByTestId("location-probe")).toHaveTextContent("/codex?category=units&entry=Unit_Previous");

        await user.click(screen.getByRole("button", { name: /units/i }));
        const unitsOverview = await screen.findByLabelText("Units overview");
        expect(unitsOverview).toHaveTextContent("Current Unit");
        expect(within(unitsOverview).queryByText("Previous")).not.toBeInTheDocument();
        expect(within(unitsOverview).queryByText("Evolves into")).not.toBeInTheDocument();
    });



    it("previews exact Tech unlock targets while keeping unresolved unlocks plain and Related Entries available", async () => {
        const user = userEvent.setup();
        const entries: CodexEntry[] = [
            {
                exportKind: "tech",
                entryKey: "Aspect_Technology_00",
                displayName: "Asceticism",
                kind: "Technology",
                category: "Development",
                descriptionLines: [],
                referenceKeys: [
                    "Faction_Aspect",
                    "Aspect_DistrictImprovement_01",
                    "Aspect_DistrictImprovement_RelatedOnly",
                ],
                facts: [
                    { label: "Kind", value: "Technology" },
                    { label: "Tier", value: "1" },
                    { label: "Faction", value: "Aspect" },
                    { label: "Era", value: "1" },
                    { label: "Quadrant", value: "Development" },
                ],
                sections: [
                    {
                        title: "Unlocks",
                        items: [
                            {
                                label: "Ascetic Existence",
                                referenceKey: "Aspect_DistrictImprovement_01",
                                facts: [{ label: "Unlock type", value: "Improvement unlock" }],
                            },
                            {
                                label: "Text-only Observatory",
                                facts: [{ label: "Unlock type", value: "Improvement unlock" }],
                            },
                            {
                                label: "Missing Improvement",
                                referenceKey: "Aspect_DistrictImprovement_Missing",
                                facts: [{ label: "Unlock type", value: "Improvement unlock" }],
                            },
                        ],
                    },
                    {
                        title: "Effects",
                        lines: ["+10 [DustColored] Dust on Capital"],
                    },
                ],
            },
            {
                exportKind: "improvements",
                entryKey: "Aspect_DistrictImprovement_01",
                displayName: "Ascetic Existence",
                category: "Industry",
                kind: "Improvement",
                descriptionLines: ["A focused capital improvement."],
                referenceKeys: [],
                facts: [
                    { label: "Category", value: "Industry" },
                    { label: "Kind", value: "Improvement" },
                ],
                sections: [{ title: "Effects", lines: ["+10 [DustColored] Dust on Capital"] }],
            },
            {
                exportKind: "improvements",
                entryKey: "Aspect_DistrictImprovement_RelatedOnly",
                displayName: "Related Workshop",
                category: "Industry",
                kind: "Improvement",
                descriptionLines: ["Related only."],
                referenceKeys: [],
                facts: [
                    { label: "Category", value: "Industry" },
                    { label: "Kind", value: "Improvement" },
                ],
                sections: [{ title: "Effects", lines: ["+2 [IndustryColored] Industry"] }],
            },
            {
                exportKind: "factions",
                entryKey: "Faction_Aspect",
                displayName: "Aspects",
                category: "Aspects",
                kind: "Faction",
                descriptionLines: ["Faction overview."],
                referenceKeys: [],
            },
        ];

        useCodexStore.setState({
            entries,
            entriesByKey: buildEntriesByKey(entries),
            entriesByKind: {
                tech: entries.filter((entry) => entry.exportKind === "tech"),
                improvements: entries.filter((entry) => entry.exportKind === "improvements"),
                factions: entries.filter((entry) => entry.exportKind === "factions"),
            },
            entriesByKindKey: buildEntriesByKindKey(entries),
            loading: false,
            error: null,
        });

        render(
            <MemoryRouter initialEntries={["/codex?category=tech&entry=Aspect_Technology_00"]}>
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

        expect(await screen.findByRole("heading", { name: "Asceticism" })).toBeInTheDocument();

        const unlockSummary = screen.getByRole("button", {
            name: "Ascetic Existence Industry / Improvement +10 Dust on Capital",
        });
        expect(unlockSummary).toHaveClass("codex-unlockTarget");
        expect(unlockSummary).toHaveTextContent("Ascetic Existence");
        expect(unlockSummary).toHaveTextContent("Industry / Improvement");
        expect(unlockSummary).toHaveTextContent("+10 Dust on Capital");
        expect(unlockSummary).not.toHaveTextContent("[DustColored]");
        unlockSummary.focus();
        expect(unlockSummary).toHaveFocus();

        expect(screen.getByRole("heading", { name: "Text-only Observatory" })).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /text-only observatory/i })).not.toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Missing Improvement" })).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /missing improvement/i })).not.toBeInTheDocument();

        const relatedSection = screen.getByRole("region", { name: /related entries/i });
        expect(within(relatedSection).getByRole("button", {
            name: /ascetic existence improvements/i,
        })).toBeInTheDocument();
        expect(within(relatedSection).getByRole("button", {
            name: /related workshop improvements/i,
        })).toBeInTheDocument();
        expect(within(relatedSection).getByRole("button", { name: /aspects factions/i })).toBeInTheDocument();

        await user.click(unlockSummary);
        expect(await screen.findByRole("heading", { name: "Ascetic Existence" })).toBeInTheDocument();
        expect(screen.getByTestId("location-probe")).toHaveTextContent("/codex?entry=Aspect_DistrictImprovement_01");
    });



    it("hides Tech prerequisite enrichment when rich data or exact target entries are unavailable", async () => {
        const entries: CodexEntry[] = [
            {
                exportKind: "tech",
                entryKey: "Tech_Current",
                displayName: "Current Tech",
                descriptionLines: ["A public technology."],
                referenceKeys: [],
            },
            {
                exportKind: "improvements",
                entryKey: "Tech_Missing",
                displayName: "Wrong Kind",
                descriptionLines: [],
                referenceKeys: [],
            },
        ];

        seedCodexEntries(entries);
        useTechStore.getState().replaceTechs([
            richTech({
                techKey: "Tech_Current",
                prereq: "Tech_Missing",
                excludes: "Tech_Exclusive_Missing",
            }),
        ]);

        render(
            <MemoryRouter initialEntries={["/codex?category=tech&entry=Tech_Current"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "Current Tech" })).toBeInTheDocument();
        expect(screen.queryByRole("region", { name: "Prerequisites" })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /wrong kind/i })).not.toBeInTheDocument();

        useTechStore.getState().reset();
        cleanup();

        seedCodexEntries(entries);
        render(
            <MemoryRouter initialEntries={["/codex?category=tech&entry=Tech_Current"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "Current Tech" })).toBeInTheDocument();
        expect(screen.queryByRole("region", { name: "Prerequisites" })).not.toBeInTheDocument();
    });



    it("enriches Improvement details with exact unlock links and safe placement only", async () => {
        const entries: CodexEntry[] = [
            {
                exportKind: "improvements",
                entryKey: "Improvement_Current",
                displayName: "Public Library",
                descriptionLines: [],
                referenceKeys: [],
                facts: [{ label: "Category", value: "Science" }],
                sections: [{ title: "Effects", lines: ["+15 [ScienceColored] Science"] }],
            },
            {
                exportKind: "tech",
                entryKey: "Tech_PublicArchives",
                displayName: "Public Archives",
                descriptionLines: ["Unlocks civic libraries."],
                referenceKeys: [],
            },
            {
                exportKind: "districts",
                entryKey: "District_WrongKind",
                displayName: "Wrong Kind",
                descriptionLines: [],
                referenceKeys: [],
            },
        ];

        seedCodexEntries(entries);
        seedRichImprovements([
            richImprovement({
                improvementKey: "Improvement_Current",
                unlockTechnologyKeys: ["Tech_PublicArchives", "District_WrongKind"],
                placementPrerequisites: {
                    neighbourTiles: {
                        operator: "SpecificTerrain",
                        territoryConstraint: "SameRegion",
                        ignoreCliff: null,
                    },
                },
            }),
        ]);

        render(
            <MemoryRouter initialEntries={["/codex?category=improvements&entry=Improvement_Current"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "Public Library" })).toBeInTheDocument();

        const planningSection = screen.getByRole("region", { name: "Planning" });
        expect(within(planningSection).getByText("Unlocked by")).toBeInTheDocument();
        expect(within(planningSection).getByRole("button", {
            name: "Open Public Archives in Codex",
        })).toHaveTextContent("Public Archives");
        expect(planningSection).not.toHaveTextContent("Wrong Kind");
        expect(planningSection).not.toHaveTextContent("Placement");
        expect(planningSection).not.toHaveTextContent("SpecificTerrain");
    });



    it("hides Unit rich enrichment when rich data or exact evolution targets are unavailable", async () => {
        const entries: CodexEntry[] = [
            {
                exportKind: "units",
                entryKey: "Unit_Current",
                displayName: "Current Unit",
                descriptionLines: ["A public unit."],
                referenceKeys: [],
            },
            {
                exportKind: "abilities",
                entryKey: "Unit_Missing",
                displayName: "Wrong Kind",
                descriptionLines: [],
                referenceKeys: [],
            },
        ];

        seedCodexEntries(entries);
        seedRichUnits([
            richUnit({
                unitKey: "Unit_Current",
                previousUnitKey: "Unit_Missing",
                nextEvolutionUnitKeys: ["Unit_Evolved_Missing"],
            }),
        ]);

        render(
            <MemoryRouter initialEntries={["/codex?category=units&entry=Unit_Current"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "Current Unit" })).toBeInTheDocument();
        expect(screen.queryByRole("region", { name: "Evolution" })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /wrong kind/i })).not.toBeInTheDocument();

        useUnitStore.getState().reset();
        cleanup();

        seedCodexEntries(entries);
        render(
            <MemoryRouter initialEntries={["/codex?category=units&entry=Unit_Current"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "Current Unit" })).toBeInTheDocument();
        expect(screen.queryByRole("region", { name: "Evolution" })).not.toBeInTheDocument();
    });




});
