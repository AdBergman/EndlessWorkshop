import { buildEntriesByKey,buildEntriesByKindKey } from "@/lib/codex/codexRefs";
import {
cleanupCodexPageStores,
getSummaryRowForButton,
resetCodexPageTestState
} from "@/pages/testUtils/codexPageHarness";
import { LocationProbe } from "@/pages/testUtils/codexPageTestUtils";
import { useCodexStore } from "@/stores/codexStore";
import type { CodexEntry } from "@/types/dataTypes";
import { cleanup,render,screen,within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter,Route,Routes } from "react-router-dom";
import CodexPage from "./CodexPage";

describe("CodexPage equipment and population metadata rendering", () => {
    beforeEach(() => {
        resetCodexPageTestState();
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
        vi.unstubAllEnvs();
        cleanupCodexPageStores();
    });

    it("uses Equipment archive rows instead of generic structured kind summaries", async () => {
        const entries: CodexEntry[] = [
            {
                exportKind: "equipment",
                entryKey: "Equipment_Weapon_02_Definition",
                displayName: "Dawnblade",
                descriptionLines: [],
                referenceKeys: [],
                facts: [
                    { label: "Type", value: "One-Handed Weapon" },
                    { label: "Slot", value: "Weapon" },
                    { label: "Rarity", value: "Rare" },
                    { label: "Tier", value: "2" },
                    { label: "Value", value: "120.00" },
                ],
                sections: [{ title: "Effects", lines: ["+2 [Might] Might"] }],
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
        const dawnbladeRow = getSummaryRowForButton(within(summaryList).getByRole("button", { name: /dawnblade/i }));
        expect(dawnbladeRow).toHaveTextContent("One-Handed Weapon");
        expect(dawnbladeRow).toHaveTextContent("Rare");
        expect(dawnbladeRow).toHaveTextContent("Tier 2");
        expect(dawnbladeRow).toHaveTextContent("Value 120");
        expect(dawnbladeRow).toHaveTextContent("Might");
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
        expect(screen.getAllByText("Type").length).toBeGreaterThan(0);
        expect(screen.getByText("Weapon")).toBeInTheDocument();
        expect(screen.getAllByText("Rarity").length).toBeGreaterThan(0);
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



    it("renders metadata-only entries with nested section item facts", async () => {
        const entries: CodexEntry[] = [
            {
                exportKind: "actions",
                entryKey: "ActionTypeBuildBridge",
                displayName: "Build Bridge",
                descriptionLines: [],
                referenceKeys: [],
                facts: [
                    { label: "Category", value: "Constructible Action" },
                    { label: "Kind", value: "Action" },
                ],
                sections: [
                    {
                        title: "Cost modifiers",
                        lines: [],
                        items: [
                            {
                                label: "Influence cost multiplier",
                                facts: [
                                    { label: "Cost type", value: "Influence" },
                                    { label: "Display value", value: "-50%" },
                                ],
                                lines: ["Applies to bridge construction."],
                            },
                        ],
                    },
                ],
            },
        ];

        useCodexStore.setState({
            entries,
            entriesByKey: buildEntriesByKey(entries),
            entriesByKind: { actions: entries },
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
        expect(screen.getByRole("complementary", { name: /action archive filters/i })).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /build bridge actions applies to bridge construction/i }))
            .not.toBeInTheDocument();
        expect(screen.getByText("Action dossier")).toBeInTheDocument();
        expect(screen.getByText("Constructible Action")).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Cost modifiers" })).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Influence cost multiplier" })).toBeInTheDocument();
        expect(screen.getByText("Cost type")).toBeInTheDocument();
        expect(screen.getByText("Influence")).toBeInTheDocument();
        expect(screen.getByText("Display value")).toBeInTheDocument();
        expect(screen.getByText("-50%")).toBeInTheDocument();
        expect(screen.getAllByText("Applies to bridge construction.").length).toBeGreaterThanOrEqual(1);
        expect(screen.queryByText("Influence cost multiplier: Cost type: Influence; Display value: -50%"))
            .not.toBeInTheDocument();
        expect(screen.queryByText("No public description has been added for this entry yet.")).not.toBeInTheDocument();
    });



    it("renders exported population metadata without duplicating fallback description lines", async () => {
        const entries: CodexEntry[] = [
            {
                exportKind: "populations",
                entryKey: "Population_Aspect",
                displayName: "Aspect",
                descriptionLines: [
                    "Faction: Faction_Aspect",
                    "At 5 population: Fallback should not win",
                ],
                referenceKeys: [],
                facts: [
                    { label: "Faction", value: "Faction_Aspect", referenceKey: "Faction_Aspect" },
                    { label: "Type", value: "Major faction population" },
                    { label: "Base food cost", value: "60" },
                ],
                sections: [
                    {
                        title: "Worker effects",
                        lines: ["+1 [CultureColored] Influence"],
                    },
                    {
                        title: "Threshold rewards",
                        items: [
                            {
                                label: "At 5 population",
                                facts: [{ label: "Reward", value: "Nutrient Extractor" }],
                            },
                        ],
                    },
                ],
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
            <MemoryRouter initialEntries={["/codex?category=populations&entry=Population_Aspect"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "Aspects" })).toBeInTheDocument();
        const detailPane = screen.getByRole("region", { name: /selected codex entry/i });
        expect(within(detailPane).getByText("Population dossier")).toBeInTheDocument();
        expect(within(detailPane).getAllByText("Aspects").length).toBeGreaterThanOrEqual(1);
        expect(within(detailPane).getByText("Major faction population")).toBeInTheDocument();
        expect(within(detailPane).getByRole("heading", { name: "Worker effects" })).toBeInTheDocument();
        expect(within(detailPane).getByText(/\+1/)).toBeInTheDocument();
        expect(within(detailPane).getByRole("heading", { name: "Population thresholds" })).toBeInTheDocument();
        expect(within(detailPane).getByText("At 5 population")).toBeInTheDocument();
        expect(within(detailPane).getByText("Nutrient Extractor")).toBeInTheDocument();
        expect(within(detailPane).queryByRole("button", { name: /nutrient extractor/i })).not.toBeInTheDocument();
        expect(screen.queryByText("Fallback should not win")).not.toBeInTheDocument();
    });



    it("renders exact Population threshold Improvement targets as light summaries and dedupes only shown targets", async () => {
        const user = userEvent.setup();
        const entries: CodexEntry[] = [
            {
                exportKind: "populations",
                entryKey: "Population_Minor_DaughterOfBor",
                displayName: "Daughter of Bor",
                descriptionLines: [],
                referenceKeys: [
                    "MinorFaction_DaughterOfBor",
                    "DistrictImprovement_MinorFaction_06",
                    "DistrictImprovement_Unrelated",
                ],
                facts: [
                    { label: "Faction", value: "Daughters of Bor", referenceKey: "MinorFaction_DaughterOfBor" },
                    { label: "Type", value: "Minor faction population" },
                    { label: "Base food cost", value: "60" },
                ],
                sections: [
                    {
                        title: "Threshold rewards",
                        items: [
                            {
                                label: "At 5 population",
                                referenceKey: "DistrictImprovement_MinorFaction_06",
                                facts: [
                                    {
                                        label: "Reward",
                                        value: "Bor’s Sparring Ring",
                                        referenceKey: "DistrictImprovement_MinorFaction_06",
                                    },
                                ],
                            },
                            {
                                label: "At 15 population",
                                lines: ["+1 [IndustryColored] Industry on Daughter of Bor Population"],
                            },
                        ],
                    },
                ],
            },
            {
                exportKind: "improvements",
                entryKey: "DistrictImprovement_MinorFaction_06",
                displayName: "Bor’s Sparring Ring",
                category: "Military",
                kind: "Improvement",
                descriptionLines: ["+200 [FortificationColored] District Fortification on City Hall"],
                referenceKeys: [],
                facts: [
                    { label: "Kind", value: "Improvement" },
                    { label: "Category", value: "Military" },
                ],
                sections: [{ title: "Effects", lines: ["+200 [FortificationColored] District Fortification on City Hall"] }],
            },
            {
                exportKind: "improvements",
                entryKey: "DistrictImprovement_Unrelated",
                displayName: "Unrelated Workshop",
                category: "Industry",
                kind: "Improvement",
                descriptionLines: ["+1 [IndustryColored] Industry"],
                referenceKeys: [],
                facts: [
                    { label: "Kind", value: "Improvement" },
                    { label: "Category", value: "Industry" },
                ],
                sections: [{ title: "Effects", lines: ["+1 [IndustryColored] Industry"] }],
            },
            {
                exportKind: "minorFactions",
                entryKey: "MinorFaction_DaughterOfBor",
                displayName: "Daughters of Bor",
                category: "Daughter of Bor",
                kind: "MinorFaction",
                descriptionLines: ["Minor faction overview."],
                referenceKeys: [],
            },
        ];

        useCodexStore.setState({
            entries,
            entriesByKey: buildEntriesByKey(entries),
            entriesByKind: {
                populations: entries.filter((entry) => entry.exportKind === "populations"),
                improvements: entries.filter((entry) => entry.exportKind === "improvements"),
                minorFactions: entries.filter((entry) => entry.exportKind === "minorFactions"),
            },
            entriesByKindKey: buildEntriesByKindKey(entries),
            loading: false,
            error: null,
        });

        render(
            <MemoryRouter initialEntries={["/codex?category=populations&entry=Population_Minor_DaughterOfBor"]}>
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

        expect(await screen.findByRole("heading", { name: "Daughter of Bor" })).toBeInTheDocument();
        expect(screen.getAllByText("Bor’s Sparring Ring").length).toBeGreaterThanOrEqual(2);

        const thresholdSummary = screen.getByRole("button", {
            name: "Bor’s Sparring Ring Military / Improvement +200 District Fortification on City Hall",
        });
        expect(thresholdSummary).toHaveTextContent("Bor’s Sparring Ring");
        expect(thresholdSummary).toHaveTextContent("Military / Improvement");
        expect(thresholdSummary).toHaveTextContent("+200 District Fortification on City Hall");
        expect(thresholdSummary).not.toHaveTextContent("[FortificationColored]");
        expect(thresholdSummary).toHaveClass("codex-thresholdTarget");

        const relatedSection = screen.getByRole("region", { name: /related entries/i });
        expect(within(relatedSection).queryByRole("button", { name: /bor’s sparring ring improvements/i }))
            .not.toBeInTheDocument();
        expect(within(relatedSection).getByRole("button", { name: /unrelated workshop improvements/i }))
            .toBeInTheDocument();
        expect(within(relatedSection).getByRole("button", { name: /daughters of bor minor factions/i }))
            .toBeInTheDocument();

        await user.click(thresholdSummary);
        expect(await screen.findByRole("heading", { name: "Bor’s Sparring Ring" })).toBeInTheDocument();
        expect(screen.getByTestId("location-probe")).toHaveTextContent("/codex?category=improvements&entry=DistrictImprovement_MinorFaction_06");
    });



    it("renders exact Population threshold Unit targets as restrained one-line summaries", async () => {
        const user = userEvent.setup();
        const entries: CodexEntry[] = [
            {
                exportKind: "populations",
                entryKey: "Population_Minor_Horatio",
                displayName: "Inferior Imitation",
                descriptionLines: [],
                referenceKeys: ["Unit_HoratioBeta"],
                facts: [
                    { label: "Faction", value: "Pilgrim Agent" },
                    { label: "Type", value: "Population" },
                ],
                sections: [
                    {
                        title: "Threshold rewards",
                        items: [
                            {
                                label: "At 5 population",
                                referenceKey: "Unit_HoratioBeta",
                                facts: [
                                    {
                                        label: "Reward",
                                        value: "Horatio Clone",
                                        referenceKey: "Unit_HoratioBeta",
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                exportKind: "units",
                entryKey: "Unit_HoratioBeta",
                displayName: "Horatio Clone",
                kind: "Unit",
                descriptionLines: [],
                referenceKeys: [],
                facts: [
                    { label: "Kind", value: "Unit" },
                    { label: "Class", value: "Ranged" },
                ],
                sections: [
                    {
                        title: "Stats",
                        lines: ["+3 [AttackRange] Attack Range"],
                    },
                ],
            },
        ];

        useCodexStore.setState({
            entries,
            entriesByKey: buildEntriesByKey(entries),
            entriesByKind: {
                populations: entries.filter((entry) => entry.exportKind === "populations"),
                units: entries.filter((entry) => entry.exportKind === "units"),
            },
            entriesByKindKey: buildEntriesByKindKey(entries),
            loading: false,
            error: null,
        });

        render(
            <MemoryRouter initialEntries={["/codex?category=populations&entry=Population_Minor_Horatio"]}>
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

        expect(await screen.findByRole("heading", { name: "Inferior Imitation" })).toBeInTheDocument();

        const thresholdSummary = screen.getByRole("button", {
            name: "Horatio Clone Unit +3 Attack Range",
        });
        expect(thresholdSummary).toHaveClass("codex-thresholdTarget");
        expect(thresholdSummary).toHaveTextContent("Horatio Clone");
        expect(thresholdSummary).toHaveTextContent("Unit");
        expect(thresholdSummary).toHaveTextContent("+3 Attack Range");

        expect(screen.queryByRole("region", { name: /related entries/i })).not.toBeInTheDocument();

        await user.click(thresholdSummary);
        expect(await screen.findByRole("heading", { name: "Horatio Clone" })).toBeInTheDocument();
        expect(screen.getByTestId("location-probe")).toHaveTextContent("/codex?category=units&entry=Unit_HoratioBeta");
    });




});
