import { buildEntriesByKey,buildEntriesByKindKey } from "@/lib/codex/codexRefs";
import {
cleanupCodexPageStores,
getSummaryRowForButton,
resetCodexPageTestState,
seedCodexEntries
} from "@/pages/testUtils/codexPageHarness";
import { LocationProbe } from "@/pages/testUtils/codexPageTestUtils";
import { useCodexStore } from "@/stores/codexStore";
import type { CodexEntry } from "@/types/dataTypes";
import { cleanup,render,screen,within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter,Route,Routes } from "react-router-dom";
import CodexPage from "./CodexPage";

describe("CodexPage reference overview rows", () => {
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

    it("renders shallow reference category lists with exact resource, effect, and trait context", async () => {
        const user = userEvent.setup();
        const entries: CodexEntry[] = [
            {
                exportKind: "resources",
                entryKey: "Resource_Luxury01",
                displayName: "Klax",
                category: null,
                kind: "Resource",
                descriptionLines: [],
                referenceKeys: ["Extractor_Luxury01", "Extractor_Luxury01_Tier2"],
                facts: [{ label: "Type", value: "Luxury resource" }],
                sections: [
                    { title: "Effects", lines: ["+15 [PublicOrderColored] Approval on City"] },
                    {
                        title: "Extractors",
                        items: [
                            { label: "[Luxury01] Klax Extractor", referenceKey: "Extractor_Luxury01" },
                            { label: "Advanced [Luxury01] Klax Extractor", referenceKey: "Extractor_Luxury01_Tier2" },
                        ],
                    },
                ],
                publicContextKeys: ["Resource_Luxury01", "Extractor_Luxury01", "Extractor_Luxury01_Tier2"],
            },
            {
                exportKind: "resources",
                entryKey: "Resource_Strategic01",
                displayName: "Titanium",
                category: null,
                kind: "Resource",
                descriptionLines: [],
                referenceKeys: ["Extractor_Strategic01"],
                facts: [{ label: "Type", value: "Strategic resource" }],
                sections: [
                    {
                        title: "Extractors",
                        items: [
                            { label: "[Strategic01Colored] Titanium Extractor", referenceKey: "Extractor_Strategic01" },
                        ],
                    },
                ],
                publicContextKeys: ["Resource_Strategic01", "Extractor_Strategic01"],
            },
            {
                exportKind: "extractors",
                entryKey: "Extractor_Luxury01",
                displayName: "[Luxury01] Klax Extractor",
                descriptionLines: ["+1 [Luxury01] Klax per District Level"],
                referenceKeys: ["Resource_Luxury01"],
            },
            {
                exportKind: "extractors",
                entryKey: "Extractor_Luxury01_Tier2",
                displayName: "Advanced [Luxury01] Klax Extractor",
                descriptionLines: ["+2 [Luxury01] Klax per District Level"],
                referenceKeys: ["Resource_Luxury01"],
            },
            {
                exportKind: "extractors",
                entryKey: "Extractor_Strategic01",
                displayName: "[Strategic01Colored] Titanium Extractor",
                descriptionLines: ["+1 [Strategic01Colored] Titanium per District Level"],
                referenceKeys: ["Resource_Strategic01"],
            },
            {
                exportKind: "councilors",
                entryKey: "Notable_Elder_MinorFaction_Hydracorn",
                displayName: "Atea",
                category: "Defense",
                kind: "Councilor",
                descriptionLines: ["Public councilor."],
                referenceKeys: [],
                publicContextKeys: [
                    "CouncilorEffect_Defense21",
                    "PartnerEffect_Hydracorn_PartnerTrait01",
                ],
            },
            {
                exportKind: "councilorEffects",
                entryKey: "CouncilorEffect_Defense21",
                displayName: "Travels Well",
                category: "Defense",
                kind: "Councilor Effect",
                descriptionLines: [],
                referenceKeys: [],
                facts: [
                    { label: "Role", value: "Defense" },
                    { label: "Kind", value: "Councilor Effect" },
                ],
                sections: [{
                    title: "Effects",
                    lines: [
                        "+100% [HealthRegen] Health Regeneration in Guard stance",
                        "+1 [MovementPoints] Movement Points outside battle",
                    ],
                }],
                publicContextKeys: ["CouncilorEffect_Defense21"],
            },
            {
                exportKind: "partnerEffects",
                entryKey: "PartnerEffect_Hydracorn_PartnerTrait01",
                displayName: "Hopeless Romantic",
                category: "Hero",
                kind: "Partner Effect",
                descriptionLines: [],
                referenceKeys: [],
                facts: [
                    { label: "Scope", value: "Hero" },
                    { label: "Kind", value: "Partner Effect" },
                ],
                sections: [{
                    title: "Effects",
                    lines: [
                        "+1 [FoodColored][IndustryColored][DustColored][ScienceColored][CultureColored] per Hero Level on Haven",
                        "+1 [MovementPoints] Movement Points outside battle",
                    ],
                }],
                publicContextKeys: ["PartnerEffect_Hydracorn_PartnerTrait01"],
            },
            {
                exportKind: "traits",
                entryKey: "ProtectorateTrait_DaughterOfBor_Trait01",
                displayName: "Fierce Independence",
                category: "Protectorate",
                kind: "Trait",
                descriptionLines: [
                    "+3 [Defense] Defense on Unit",
                    "+1 [Defense] Defense per Pacified Villages under Protectorate on Unit",
                    "Protectorate: Daughters of Bor",
                ],
                referenceKeys: ["MinorFaction_DaughterOfBor"],
                facts: [
                    { label: "Kind", value: "Trait" },
                    { label: "Trait type", value: "Protectorate" },
                ],
                sections: [{
                    title: "Effects",
                    lines: [
                        "+3 [Defense] Defense on Unit",
                        "+1 [Defense] Defense per Pacified Villages under Protectorate on Unit",
                    ],
                }],
                publicContextKeys: ["ProtectorateTrait_DaughterOfBor_Trait01", "MinorFaction_DaughterOfBor"],
            },
            {
                exportKind: "traits",
                entryKey: "ProtectorateTrait_MangroveOfHarmony_Trait01",
                displayName: "Precious Seedlings",
                category: "Protectorate",
                kind: "Trait",
                descriptionLines: ["Protectorate: Mangrove of Harmony"],
                referenceKeys: ["MinorFaction_MangroveOfHarmony"],
                facts: [
                    { label: "Kind", value: "Trait" },
                    { label: "Trait type", value: "Protectorate" },
                ],
                publicContextKeys: ["ProtectorateTrait_MangroveOfHarmony_Trait01", "MinorFaction_MangroveOfHarmony"],
            },
            {
                exportKind: "minorfactions",
                entryKey: "MinorFaction_DaughterOfBor",
                displayName: "Daughters of Bor",
                category: "DaughterOfBor",
                kind: "MinorFaction",
                descriptionLines: ["Hostile minor faction."],
                referenceKeys: [],
            },
            {
                exportKind: "minorfactions",
                entryKey: "MinorFaction_MangroveOfHarmony",
                displayName: "Mangrove of Harmony",
                category: "MangroveOfHarmony",
                kind: "MinorFaction",
                descriptionLines: ["Pacifist minor faction."],
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

        render(
            <MemoryRouter initialEntries={["/codex?category=resources"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "All Resources" })).toBeInTheDocument();
        const resourcesSummary = screen.getByRole("heading", { name: "All Resources" })
            .closest(".codex-summaryDossier") as HTMLElement;
        expect(within(resourcesSummary).getByText("Reference list")).toBeInTheDocument();
        expect(within(resourcesSummary).queryByText("Scan exported effect lines and exact linked entries in a compact reference list."))
            .not.toBeInTheDocument();
        expect(within(resourcesSummary).queryByText("Category overview")).not.toBeInTheDocument();
        const resourceOverview = screen.getByLabelText("Resources overview");
        expect(within(resourceOverview).getByText("Luxury")).toBeInTheDocument();
        expect(within(resourceOverview).queryByText("Luxury / Resource")).not.toBeInTheDocument();
        const klaxEffects = within(resourceOverview).getByLabelText("Klax effects");
        expect(klaxEffects).toHaveTextContent("+15 Approval on City");
        expect(within(klaxEffects).getByAltText("PublicOrderColored")).toBeInTheDocument();
        expect(within(resourceOverview).getByRole("button", { name: /Extractor: Klax Extractor/i }))
            .toBeInTheDocument();
        expect(within(resourceOverview).queryByRole("button", { name: /Extractor: Advanced Klax Extractor/i }))
            .not.toBeInTheDocument();
        expect(within(resourceOverview).getByText("Strategic")).toBeInTheDocument();
        expect(within(resourceOverview).queryByText("Strategic / Resource")).not.toBeInTheDocument();
        expect(within(resourceOverview).getByRole("button", { name: /Extractor: Titanium Extractor/i }))
            .toBeInTheDocument();

        await user.click(within(getCategoryToolbar())
            .getByRole("button", { name: /councilor effects/i }));
        const councilorEffectSummary = screen.getByRole("heading", { name: "All Councilor Effects" })
            .closest(".codex-summaryDossier") as HTMLElement;
        expect(within(councilorEffectSummary).getByText("Reference list")).toBeInTheDocument();
        const councilorEffectOverview = await screen.findByLabelText("Councilor Effects overview");
        expect(within(councilorEffectOverview).getByText("Defense")).toBeInTheDocument();
        expect(within(councilorEffectOverview).queryByText("Defense / Councilor Effect")).not.toBeInTheDocument();
        const travelsWellEffects = within(councilorEffectOverview).getByLabelText("Travels Well effects");
        expect(travelsWellEffects).toHaveTextContent("+100% Health Regeneration in Guard stance");
        expect(travelsWellEffects).toHaveTextContent("+1 Movement Points outside battle");
        expect(within(travelsWellEffects).getByAltText("HealthRegen")).toBeInTheDocument();
        expect(within(councilorEffectOverview).getByRole("button", { name: /Source: Atea/i }))
            .toBeInTheDocument();

        await user.click(within(getCategoryToolbar())
            .getByRole("button", { name: /partner effects/i }));
        const partnerEffectSummary = screen.getByRole("heading", { name: "All Partner Effects" })
            .closest(".codex-summaryDossier") as HTMLElement;
        expect(within(partnerEffectSummary).getByText("Reference list")).toBeInTheDocument();
        const partnerEffectOverview = await screen.findByLabelText("Partner Effects overview");
        expect(within(partnerEffectOverview).getByText("Hero")).toBeInTheDocument();
        expect(within(partnerEffectOverview).queryByText("Hero / Partner Effect")).not.toBeInTheDocument();
        const hopelessRomanticEffects = within(partnerEffectOverview).getByLabelText("Hopeless Romantic effects");
        expect(hopelessRomanticEffects).toHaveTextContent("+1 per Hero Level on Haven");
        expect(hopelessRomanticEffects).toHaveTextContent("+1 Movement Points outside battle");
        expect(within(hopelessRomanticEffects).getByAltText("MovementPoints")).toBeInTheDocument();
        expect(within(partnerEffectOverview).getByRole("button", { name: /Source: Atea/i }))
            .toBeInTheDocument();

        await user.click(within(getCategoryToolbar())
            .getByRole("button", { name: /traits/i }));
        const traitsSummary = screen.getByRole("heading", { name: "All Traits" })
            .closest(".codex-summaryDossier") as HTMLElement;
        expect(within(traitsSummary).getByText("Reference list")).toBeInTheDocument();
        const traitsOverview = await screen.findByLabelText("Traits overview");
        expect(within(traitsOverview).getAllByText("Protectorate")).toHaveLength(2);
        const fierceIndependenceEffects = within(traitsOverview).getByLabelText("Fierce Independence effects");
        expect(fierceIndependenceEffects).toHaveTextContent("+3 Defense on Unit");
        expect(fierceIndependenceEffects)
            .toHaveTextContent("+1 Defense per Pacified Villages under Protectorate on Unit");
        expect(within(fierceIndependenceEffects).getAllByAltText("Defense")).toHaveLength(2);
        expect(within(traitsOverview).getByRole("button", { name: /Minor Faction: Daughters of Bor/i }))
            .toBeInTheDocument();
        expect(within(traitsOverview).getByRole("button", { name: /Minor Faction: Mangrove of Harmony/i }))
            .toBeInTheDocument();
        expect(within(traitsOverview).queryByLabelText("Precious Seedlings effects")).not.toBeInTheDocument();
        expect(within(traitsOverview).queryByText("Protectorate: Mangrove of Harmony")).not.toBeInTheDocument();
    });



    it("renders Victory Conditions as compact planning reference rows from exported facts", async () => {
        const user = userEvent.setup();
        seedCodexEntries([
            {
                exportKind: "victoryconditions",
                entryKey: "VictoryCondition_EndGameDefinition_Standard_AllResearchesDone_05",
                displayName: "Enlightenment",
                category: "Victory",
                kind: "Victory condition",
                descriptionLines: ["Science Victory"],
                referenceKeys: ["VictoryPath_Enrich"],
                facts: [
                    { label: "Type", value: "Victory condition" },
                    { label: "Objective", value: "Final era technologies" },
                    { label: "Required technologies formula", value: "Min(6, Max(2, World Difficulty))" },
                    { label: "Current exported-game value", value: "6" },
                    { label: "Victory path", value: "Impress", referenceKey: "VictoryPath_Enrich" },
                    { label: "Required hold duration formula", value: "Game Speed Multiplier * 10" },
                    { label: "Current exported-game hold duration", value: "10 turns" },
                    { label: "Threshold note", value: "Exact threshold depends on game setup." },
                    { label: "Kind", value: "Victory condition" },
                    { label: "Category", value: "Victory" },
                ],
                sections: [{
                    title: "Source references",
                    items: [{
                        label: "Arcana of the Ancients",
                        referenceKey: "Technology_Science_00",
                        facts: [{ label: "Type", value: "Required technology" }],
                    }],
                }],
            },
        ]);

        render(
            <MemoryRouter initialEntries={["/codex?category=victoryconditions"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        await screen.findByRole("heading", { name: "All Victory Conditions" });
        const summaryList = screen.getByLabelText("Victory Conditions overview");
        const row = getSummaryRowForButton(within(summaryList).getByRole("button", { name: /Enlightenment/i }));
        expect(row).toHaveClass("codex-summaryList__item--victoryConditionArchive");
        expect(within(row).getByText("Science Victory")).toBeInTheDocument();
        expect(within(row).getByText("Objective:")).toBeInTheDocument();
        expect(within(row).getByText("Final era technologies")).toBeInTheDocument();
        expect(within(row).getByText("Requirement:")).toBeInTheDocument();
        expect(within(row).getByText("Min(6, Max(2, World Difficulty))")).toBeInTheDocument();
        expect(within(row).getByText("Current 6")).toBeInTheDocument();
        expect(within(row).getByText("Hold 10 turns")).toBeInTheDocument();
        expect(within(row).getByText("Impress")).toBeInTheDocument();
        expect(within(row).getByText("Note:")).toBeInTheDocument();
        expect(within(row).getByText("Exact threshold depends on game setup.")).toBeInTheDocument();

        await user.click(row);

        expect(await screen.findByRole("heading", { name: "Enlightenment" })).toBeInTheDocument();
        expect(screen.getByText("Required technologies formula")).toBeInTheDocument();
        expect(screen.getByText("Game Speed Multiplier * 10")).toBeInTheDocument();
    });



    it("renders Wonders as compact reference rows from exported effects and footprint", async () => {
        const user = userEvent.setup();
        seedCodexEntries([
            {
                exportKind: "naturalwonders",
                entryKey: "NaturalWonder_CrystalDunes",
                displayName: "Crystal Dunes",
                category: "World",
                kind: "Natural wonder",
                descriptionLines: [],
                referenceKeys: [],
                facts: [
                    { label: "Type", value: "Natural wonder" },
                    { label: "Footprint", value: "3 tiles" },
                    { label: "Kind", value: "Natural wonder" },
                    { label: "Category", value: "World" },
                ],
                sections: [{
                    title: "Effects",
                    lines: [
                        "+1 [Strategic03Colored] Lazualin per Turn",
                        "+1 [Strategic04Colored] Hyperium per Turn",
                        "+1 [Strategic05Colored] Eradione per Turn",
                        "+1 [Strategic06Colored] Thalitine per Turn",
                    ],
                }],
            },
        ]);

        render(
            <MemoryRouter initialEntries={["/codex?category=naturalwonders"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        await screen.findByRole("heading", { name: "All Wonders" });
        expect(screen.queryByRole("complementary", { name: /codex results/i })).not.toBeInTheDocument();
        expect(document.querySelector(".codex-workspace--referenceOverview")).toBeInTheDocument();
        const summaryList = screen.getByLabelText("Wonders overview");
        const entryButton = within(summaryList).getByRole("button", { name: /Crystal Dunes/i });
        const row = entryButton.closest(".codex-summaryList__item") as HTMLElement;
        expect(row).toHaveClass("codex-summaryList__item--shallow");
        expect(within(row).getByText("3 tiles")).toBeInTheDocument();
        expect(within(row).getByLabelText("Crystal Dunes effects")).toHaveTextContent("Lazualin per Turn");
        expect(within(row).getByLabelText("Crystal Dunes effects")).toHaveTextContent("Hyperium per Turn");
        expect(within(row).getByLabelText("Crystal Dunes effects")).toHaveTextContent("Eradione per Turn");
        expect(within(row).queryByText(/Thalitine per Turn/i)).not.toBeInTheDocument();
        expect(within(row).queryByText("Natural wonder")).not.toBeInTheDocument();
        expect(within(row).queryByText("World")).not.toBeInTheDocument();

        await user.click(entryButton);

        expect(await screen.findByRole("heading", { name: "Crystal Dunes" })).toBeInTheDocument();
        expect(screen.getByRole("complementary", { name: /codex results/i })).toBeInTheDocument();
        expect(screen.getByText("Footprint")).toBeInTheDocument();
        expect(screen.getByText("3 tiles")).toBeInTheDocument();
        expect(screen.getByText("Kind")).toBeInTheDocument();
        expect(screen.getAllByText("Natural wonder")).toHaveLength(2);
    });



    it("renders Population archive rows from worker effects, threshold rewards, and quiet metadata", async () => {
        const user = userEvent.setup();
        const entries: CodexEntry[] = [
            {
                exportKind: "populations",
                entryKey: "Population_KinOfSheredyn",
                displayName: "Kin of Sheredyn",
                descriptionLines: ["Faction: Faction_KinOfSheredyn", "At 5 population: Fallback should not win"],
                referenceKeys: ["Faction_KinOfSheredyn", "KinOfSheredyn_DistrictImprovement_01"],
                facts: [
                    { label: "Faction", value: "Faction_KinOfSheredyn", referenceKey: "Faction_KinOfSheredyn" },
                    { label: "Type", value: "Major faction population" },
                    { label: "Default population", value: "Yes" },
                    { label: "Custom faction availability", value: "Available" },
                    { label: "Base food cost", value: "60" },
                ],
                sections: [
                    {
                        title: "Worker effects",
                        lines: ["+2 [IndustryColored] Industry on [PopulationCategory_02] Artisans"],
                    },
                    {
                        title: "Threshold rewards",
                        items: [
                            {
                                label: "At 5 population",
                                referenceKey: "KinOfSheredyn_DistrictImprovement_01",
                                facts: [{
                                    label: "Reward",
                                    value: "Military Press",
                                    referenceKey: "KinOfSheredyn_DistrictImprovement_01",
                                }],
                            },
                            {
                                label: "At 15 population",
                                lines: ["+1 [IndustryColored] Industry on Kin of Sheredyn Population"],
                            },
                        ],
                    },
                ],
            },
            {
                exportKind: "populations",
                entryKey: "Population_Minor_Ametrine",
                displayName: "Ametrine",
                descriptionLines: [],
                referenceKeys: [],
                facts: [
                    { label: "Faction", value: "Ametrine", referenceKey: "MinorFaction_Ametrine" },
                    { label: "Type", value: "Minor faction population" },
                    { label: "Default population", value: "No" },
                    { label: "Custom faction availability", value: "Available" },
                    { label: "Base food cost", value: "60" },
                ],
                sections: [{
                    title: "Worker effects",
                    lines: ["+2 [ScienceColored] Science on [PopulationCategory_02] Artisans"],
                }],
            },
            {
                exportKind: "populations",
                entryKey: "Population_Called",
                displayName: "Called Population",
                descriptionLines: [],
                referenceKeys: [],
                facts: [
                    { label: "Type", value: "Created by action" },
                    { label: "Default population", value: "No" },
                    { label: "Custom faction availability", value: "Not available" },
                    { label: "Base food cost", value: "0" },
                ],
                sections: [],
            },
            {
                exportKind: "factions",
                entryKey: "Faction_KinOfSheredyn",
                displayName: "Kin of Sheredyn",
                descriptionLines: ["Major faction."],
                referenceKeys: [],
            },
            {
                exportKind: "minorFactions",
                entryKey: "MinorFaction_Ametrine",
                displayName: "Ametrine",
                descriptionLines: ["Minor faction."],
                referenceKeys: [],
            },
            {
                exportKind: "improvements",
                entryKey: "KinOfSheredyn_DistrictImprovement_01",
                displayName: "Military Press",
                descriptionLines: ["+1 [IndustryColored] Industry."],
                referenceKeys: [],
                facts: [{ label: "Category", value: "Military" }],
                sections: [{ title: "Effects", lines: ["+1 [IndustryColored] Industry."] }],
            },
        ];
        seedCodexEntries(entries);

        render(
            <MemoryRouter initialEntries={["/codex?category=populations"]}>
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

        await screen.findByRole("heading", { name: "All Populations" });
        const rail = screen.getByRole("complementary", { name: /population archive filters/i });
        expect(within(rail).getByRole("button", { name: /all 3/i })).toBeInTheDocument();
        expect(within(rail).getByRole("button", { name: /other 3/i })).toBeInTheDocument();
        expect(within(rail).queryByRole("button", { name: /major faction 1/i })).not.toBeInTheDocument();
        expect(within(rail).queryByRole("button", { name: /minor faction 1/i })).not.toBeInTheDocument();
        expect(within(rail).queryByRole("button", { name: /created by action 1/i })).not.toBeInTheDocument();

        const summaryList = screen.getByLabelText("Populations overview");
        const row = getSummaryRowForButton(within(summaryList).getByRole("button", { name: "Kin of Sheredyn" }));
        expect(row).toHaveClass("codex-summaryList__item--populationArchive");
        const populationFaction = within(row).getByLabelText("Population faction");
        expect(within(populationFaction).getByText("Kin of Sheredyn")).toBeInTheDocument();
        expect(within(populationFaction).getByLabelText("Kin of Sheredyn")).toBeInTheDocument();
        expect(within(row).queryByText("Major Faction")).not.toBeInTheDocument();
        expect(within(row).queryByText("Default")).not.toBeInTheDocument();
        expect(within(row).queryByText("Custom")).not.toBeInTheDocument();
        expect(within(row).queryByText("Food 60")).not.toBeInTheDocument();
        expect(within(row).getByText("Worker:")).toBeInTheDocument();
        expect(within(row).getByText(/\+2/)).toBeInTheDocument();
        expect(within(row).getByText("5 population:")).toBeInTheDocument();
        expect(within(row).getByRole("button", { name: "Open Military Press in Codex" })).toBeInTheDocument();
        expect(within(row).queryByText("Fallback should not win")).not.toBeInTheDocument();

        const ametrineRow = getSummaryRowForButton(within(summaryList).getByRole("button", { name: "Ametrine" }));
        const ametrineFaction = within(ametrineRow).getByLabelText("Population faction");
        expect(within(ametrineFaction).getByText("Ametrine")).toBeInTheDocument();
        expect(within(ametrineFaction).getByLabelText("Ametrine")).toBeInTheDocument();
        expect(within(ametrineRow).queryByText("Minor Faction")).not.toBeInTheDocument();
        expect(within(ametrineRow).queryByText("Custom")).not.toBeInTheDocument();
        expect(within(ametrineRow).queryByText("Food 60")).not.toBeInTheDocument();

        const calledRow = getSummaryRowForButton(within(summaryList).getByRole("button", { name: "Called Population" }));
        expect(within(calledRow).queryByLabelText("Population faction")).not.toBeInTheDocument();
        expect(within(calledRow).queryByText("Created by Action")).not.toBeInTheDocument();
        expect(within(calledRow).queryByText("No Custom")).not.toBeInTheDocument();
        expect(within(calledRow).queryByText("Food 0")).not.toBeInTheDocument();
        expect(within(calledRow).getByText("No public population effects exported yet.")).toBeInTheDocument();

        await user.click(within(row).getByRole("button", { name: "Open Military Press in Codex" }));
        expect(await screen.findByRole("heading", { name: "Military Press" })).toBeInTheDocument();
        expect(screen.getByTestId("location-probe")).toHaveTextContent("/codex?category=improvements&entry=KinOfSheredyn_DistrictImprovement_01");
    });




});
