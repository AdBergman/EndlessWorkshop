import { buildEntriesByKey,buildEntriesByKindKey } from "@/lib/codex/codexRefs";
import {
cleanupCodexPageStores,
resetCodexPageTestState,
seedCodexEntries
} from "@/pages/testUtils/codexPageHarness";
import { LocationProbe } from "@/pages/testUtils/codexPageTestUtils";
import { useCodexStore } from "@/stores/codexStore";
import type { CodexEntry } from "@/types/dataTypes";
import { cleanup,render,screen,waitFor,within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter,Route,Routes } from "react-router-dom";
import CodexPage from "./CodexPage";

describe("CodexPage hidden and promoted data categories", () => {
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

    it("keeps extractors as hidden top-level data instead of visible category cards", async () => {
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

        const kindIndex = await screen.findByLabelText("Codex category index");
        expect(within(kindIndex).getByRole("button", { name: /districts 1/i })).toBeInTheDocument();
        expect(within(kindIndex).queryByRole("button", { name: /extractors 1/i })).not.toBeInTheDocument();
        expect(screen.queryByText("Resource extraction districts and upgrades.")).not.toBeInTheDocument();
    });



    it("keeps direct extractor routes available without showing Extractors in navigation", async () => {
        const entries: CodexEntry[] = [
            {
                exportKind: "resources",
                entryKey: "Resource_Luxury01",
                displayName: "Klax",
                descriptionLines: ["Luxury resource."],
                referenceKeys: ["Extractor_Luxury01_Tier2"],
            },
            {
                exportKind: "extractors",
                entryKey: "Extractor_Luxury01_Tier2",
                displayName: "Advanced Klax Extractor",
                category: "Extractors",
                kind: "District",
                descriptionLines: ["+2 [Luxury01] Klax per District Level"],
                referenceKeys: ["Resource_Luxury01"],
            },
        ];

        useCodexStore.setState({
            entries,
            entriesByKey: buildEntriesByKey(entries),
            entriesByKind: {
                resources: entries.filter((entry) => entry.exportKind === "resources"),
                extractors: entries.filter((entry) => entry.exportKind === "extractors"),
            },
            entriesByKindKey: buildEntriesByKindKey(entries),
            loading: false,
            error: null,
        });

        render(
            <MemoryRouter initialEntries={["/codex?category=extractors&entry=Extractor_Luxury01_Tier2"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "Advanced Klax Extractor" })).toBeInTheDocument();
        expect(screen.getByRole("complementary", { name: /codex results/i })).toBeInTheDocument();
        expect(within(getCategoryToolbar()).queryByRole("button", { name: /extractors/i })).not.toBeInTheDocument();
        expect(within(getCategoryToolbar()).queryByRole("button", { name: /modifiers/i })).not.toBeInTheDocument();
    });



    it("hides Quests from top-level navigation while keeping search and direct routes available", async () => {
        const user = userEvent.setup();
        const entries: CodexEntry[] = [
            {
                exportKind: "quests",
                entryKey: "FactionQuest_LastLord_Chapter01_Step01",
                displayName: "A Fragile Dawn",
                category: "MajorFaction",
                kind: "Quest",
                descriptionLines: ["The Last Lords awaken."],
                referenceKeys: [],
                facts: [
                    { label: "Kind", value: "Quest" },
                    { label: "Category", value: "MajorFaction" },
                    { label: "Chapter", value: "1" },
                    { label: "Mandatory", value: "Yes" },
                ],
            },
            {
                exportKind: "abilities",
                entryKey: "Ability_A",
                displayName: "Guarded Advance",
                descriptionLines: ["A public ability."],
                referenceKeys: [],
            },
        ];

        useCodexStore.setState({
            entries,
            entriesByKey: buildEntriesByKey(entries),
            entriesByKind: {
                quests: entries.filter((entry) => entry.exportKind === "quests"),
                abilities: entries.filter((entry) => entry.exportKind === "abilities"),
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

        const kindIndex = await screen.findByLabelText("Codex category index");
        expect(within(kindIndex).queryByRole("button", { name: /quests 1/i })).not.toBeInTheDocument();

        await user.type(screen.getByRole("combobox", { name: /search the encyclopedia/i }), "fragile");

        expect(await screen.findByRole("button", { name: /a fragile dawn/i })).toBeInTheDocument();
        expect(screen.queryByLabelText("Codex category index")).not.toBeInTheDocument();

        cleanup();
        useCodexStore.setState({
            entries,
            entriesByKey: buildEntriesByKey(entries),
            entriesByKind: {
                quests: entries.filter((entry) => entry.exportKind === "quests"),
                abilities: entries.filter((entry) => entry.exportKind === "abilities"),
            },
            entriesByKindKey: buildEntriesByKindKey(entries),
            loading: false,
            error: null,
        });

        render(
            <MemoryRouter initialEntries={["/codex?category=quests"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "All Quests" })).toBeInTheDocument();
        expect(screen.getByRole("complementary", { name: /quest archive filters/i })).toBeInTheDocument();
        expect(within(getCategoryToolbar()).queryByRole("button", { name: /quests/i })).not.toBeInTheDocument();

        cleanup();
        useCodexStore.setState({
            entries,
            entriesByKey: buildEntriesByKey(entries),
            entriesByKind: {
                quests: entries.filter((entry) => entry.exportKind === "quests"),
                abilities: entries.filter((entry) => entry.exportKind === "abilities"),
            },
            entriesByKindKey: buildEntriesByKindKey(entries),
            loading: false,
            error: null,
        });

        render(
            <MemoryRouter initialEntries={["/codex?category=quests&entry=FactionQuest_LastLord_Chapter01_Step01"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "A Fragile Dawn" })).toBeInTheDocument();
        expect(screen.getByLabelText("Selected codex entry")).toBeInTheDocument();
        expect(within(getCategoryToolbar()).queryByRole("button", { name: /quests/i })).not.toBeInTheDocument();
    });

    it("opens a hidden rich-search result through its canonical category route", async () => {
        const user = userEvent.setup();
        seedCodexEntries([
            {
                exportKind: "modifiers",
                entryKey: "ActionCostModifier_RaiseRuin_Decrease_00",
                displayName: "Ruin Expedition Discount",
                category: "Cost Modifier",
                kind: "Cost Modifier",
                descriptionLines: ["Spend less Influence while protecting Approval during ruin expeditions."],
                referenceKeys: [],
            },
            {
                exportKind: "abilities",
                entryKey: "Ability_GuardedAdvance",
                displayName: "Guarded Advance",
                descriptionLines: ["A public ability."],
                referenceKeys: [],
            },
        ]);

        render(
            <MemoryRouter initialEntries={["/codex"]}>
                <Routes>
                    <Route
                        path="/codex"
                        element={(
                            <>
                                <LocationProbe />
                                <CodexPage />
                            </>
                        )}
                    />
                </Routes>
            </MemoryRouter>
        );

        await screen.findByRole("heading", { name: "Encyclopedia Index" });
        expect(getLandingCategoryLabels()).not.toContain("Modifiers");

        await user.type(screen.getByRole("combobox", { name: /search the encyclopedia/i }), "approval");

        const results = await screen.findByLabelText("Codex results");
        const hiddenResult = within(results).getByRole("button", { name: /ruin expedition discount/i });
        await user.click(hiddenResult);

        await waitFor(() => expect(screen.getByTestId("location-probe")).toHaveTextContent(
            "/codex?category=modifiers&entry=ActionCostModifier_RaiseRuin_Decrease_00"
        ));
        expect(await screen.findByRole("heading", { name: "Ruin Expedition Discount" }))
            .toBeInTheDocument();
        expect(within(getCategoryToolbar()).queryByRole("button", { name: /modifiers/i }))
            .not.toBeInTheDocument();
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
            within(getLandingCategoryIndex()).getByRole("button", {
                name: /districts 2/i,
            })
        );

        await waitFor(() => {
            expect(screen.getByRole("heading", { name: "All Districts" })).toBeInTheDocument();
        });

        expect(screen.getByLabelText("2 entries in view")).toBeInTheDocument();
        expect(screen.getByRole("complementary", { name: /district archive filters/i })).toBeInTheDocument();
        expect(screen.queryByRole("complementary", { name: /codex results/i })).not.toBeInTheDocument();
        const districtsSummary = screen.getByRole("heading", { name: "All Districts" })
            .closest(".codex-summaryDossier") as HTMLElement;
        expect(within(districtsSummary).getByText("Category overview")).toBeInTheDocument();
        expect(within(districtsSummary).queryByText("Reference list")).not.toBeInTheDocument();
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

        const kindIndex = await screen.findByLabelText("Codex category index");
        await user.click(within(kindIndex).getByRole("button", { name: /districts 2/i }));

        expect(await screen.findByRole("heading", { name: "All Districts" })).toBeInTheDocument();
    });



    it("orders new Codex categories in the direct shelf while keeping modifiers out of top-level navigation", async () => {
        const entries: CodexEntry[] = [
            {
                exportKind: "abilities",
                entryKey: "Ability_A",
                displayName: "Ability A",
                descriptionLines: ["Ability."],
                referenceKeys: [],
            },
            {
                exportKind: "actions",
                entryKey: "Action_A",
                displayName: "Action A",
                descriptionLines: [],
                referenceKeys: [],
                facts: [{ label: "Kind", value: "Action" }],
            },
            {
                exportKind: "factions",
                entryKey: "Faction_A",
                displayName: "Faction A",
                descriptionLines: ["Faction."],
                referenceKeys: [],
            },
            {
                exportKind: "diplomatictreaties",
                entryKey: "Treaty_A",
                displayName: "Treaty A",
                descriptionLines: ["Treaty."],
                referenceKeys: [],
            },
            {
                exportKind: "victorypaths",
                entryKey: "VictoryPath_A",
                displayName: "Victory Path A",
                descriptionLines: ["Victory path."],
                referenceKeys: [],
            },
            {
                exportKind: "victoryconditions",
                entryKey: "VictoryCondition_A",
                displayName: "Victory Condition A",
                descriptionLines: ["Victory condition."],
                referenceKeys: [],
            },
            {
                exportKind: "heroes",
                entryKey: "Hero_A",
                displayName: "Hero A",
                descriptionLines: ["Hero."],
                referenceKeys: [],
            },
            {
                exportKind: "statuses",
                entryKey: "Status_A",
                displayName: "Status A",
                descriptionLines: [],
                referenceKeys: [],
                facts: [{ label: "Kind", value: "Status" }],
            },
            {
                exportKind: "modifiers",
                entryKey: "CostModifier_A",
                displayName: "Modifier A",
                descriptionLines: [],
                referenceKeys: [],
                facts: [{ label: "Kind", value: "Cost Modifier" }],
            },
            {
                exportKind: "resources",
                entryKey: "Resource_Luxury01",
                displayName: "Klax",
                descriptionLines: ["Luxury resource."],
                referenceKeys: [],
            },
            {
                exportKind: "naturalwonders",
                entryKey: "NaturalWonder_A",
                displayName: "Natural Wonder A",
                descriptionLines: ["Natural wonder."],
                referenceKeys: [],
            },
            {
                exportKind: "councilorEffects",
                entryKey: "CouncilorEffect_Defense21",
                displayName: "Travels Well",
                descriptionLines: ["Councilor effect."],
                referenceKeys: [],
            },
            {
                exportKind: "partnerEffects",
                entryKey: "PartnerEffect_Hydracorn_PartnerTrait01",
                displayName: "Hopeless Romantic",
                descriptionLines: ["Partner effect."],
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
            <MemoryRouter initialEntries={["/codex"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        const overviewLabels = getLandingCategoryLabels();
        expect(overviewLabels).toEqual([
            "Abilities",
            "Actions",
            "Councilor Effects",
            "Partner Effects",
            "Resources",
            "Factions",
            "Diplomacy",
            "Heroes",
            "Statuses",
            "Victory Conditions",
            "Victory Paths",
            "Wonders",
        ]);
        expect(within(screen.getByLabelText("Codex category index"))
            .getByRole("button", { name: /statuses 1 public conditions/i })).toBeInTheDocument();
        expect(overviewLabels).not.toContain("Modifiers");
        expect(within(screen.getByLabelText("Codex category index"))
            .getByRole("button", { name: /resources 1 strategic and luxury resources/i })).toBeInTheDocument();
        expect(within(screen.getByLabelText("Codex category index"))
            .getByRole("button", { name: /councilor effects 1/i })).toBeInTheDocument();
        expect(within(screen.getByLabelText("Codex category index"))
            .getByRole("button", { name: /partner effects 1/i })).toBeInTheDocument();
        expect(within(screen.getByLabelText("Codex category index"))
            .getByRole("button", { name: /victory paths 1/i })).toBeInTheDocument();
        expect(within(screen.getByLabelText("Codex category index"))
            .getByRole("button", { name: /victory conditions 1/i })).toBeInTheDocument();
        expect(within(screen.getByLabelText("Codex category index"))
            .getByRole("button", { name: /wonders 1/i })).toBeInTheDocument();
    });



    it("keeps exporter return kinds searchable and linkable after top-level promotion", async () => {
        const user = userEvent.setup();
        const entries: CodexEntry[] = [
            {
                exportKind: "councilors",
                entryKey: "Councilor_Atea",
                displayName: "Atea",
                category: "Councilor",
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
                referenceKeys: ["Councilor_Atea"],
                facts: [{ label: "Role", value: "Defense" }],
                sections: [{ title: "Effects", lines: ["[Defense] Defense on Hero."] }],
                publicContextKeys: ["CouncilorEffect_Defense21", "Councilor_Atea"],
            },
            {
                exportKind: "partnerEffects",
                entryKey: "PartnerEffect_Hydracorn_PartnerTrait01",
                displayName: "Hopeless Romantic",
                category: "Hero",
                kind: "Partner Effect",
                descriptionLines: [],
                referenceKeys: ["Councilor_Atea"],
                facts: [{ label: "Scope", value: "Hero" }],
                sections: [{ title: "Effects", lines: ["+1 [MovementPoints] Movement Points outside battle."] }],
                publicContextKeys: ["PartnerEffect_Hydracorn_PartnerTrait01", "Councilor_Atea"],
            },
            {
                exportKind: "resources",
                entryKey: "Resource_Luxury01",
                displayName: "Klax",
                category: "Luxury",
                kind: "Resource",
                descriptionLines: [],
                referenceKeys: ["Extractor_Luxury01"],
                facts: [{ label: "Type", value: "Luxury" }],
                sections: [{ title: "Effects", lines: ["Activates a booster effect."] }],
                publicContextKeys: ["Resource_Luxury01", "Extractor_Luxury01"],
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
            <MemoryRouter initialEntries={["/codex?category=councilors&entry=Councilor_Atea"]}>
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

        expect(await screen.findByRole("heading", { name: "Atea" })).toBeInTheDocument();
        expect(within(getCategoryToolbar()).getByRole("button", { name: /councilors/i }))
            .toHaveAttribute("aria-pressed", "true");
        expect(within(getCategoryToolbar()).getByRole("button", { name: /resources/i }))
            .toBeInTheDocument();
        expect(within(getCategoryToolbar()).getByRole("button", { name: /councilor effects/i }))
            .toBeInTheDocument();
        expect(within(getCategoryToolbar()).getByRole("button", { name: /partner effects/i }))
            .toBeInTheDocument();

        const relatedSection = screen.getByRole("region", { name: /related entries/i });
        expect(within(relatedSection).getByText("Councilor Effects")).toBeInTheDocument();
        expect(within(relatedSection).getByText("Partner Effects")).toBeInTheDocument();
        await user.click(within(relatedSection).getByRole("button", { name: /travels well councilor effects/i }));

        expect(await screen.findByRole("heading", { name: "Travels Well" })).toBeInTheDocument();
        const detail = screen.getByRole("heading", { name: "Travels Well" }).closest(".codex-detail") as HTMLElement;
        const detailMeta = detail.querySelector(".codex-detail__metaRow") as HTMLElement;
        expect(within(detailMeta).getByText("Councilor Effects")).toBeInTheDocument();
        expect(within(detailMeta).getByText("Defense")).toBeInTheDocument();
        expect(within(detailMeta).queryByText("Defense / Councilor Effect")).not.toBeInTheDocument();
        expect(screen.getByTestId("location-probe")).toHaveTextContent("/codex?category=counciloreffects&entry=CouncilorEffect_Defense21");

        await user.click(within(getCategoryToolbar()).getByRole("button", { name: /^all/i }));
        const input = screen.getByRole("combobox", { name: /search the encyclopedia/i });
        await user.clear(input);
        await user.type(input, "Klax");

        expect(input).toHaveAttribute("aria-autocomplete", "none");
        expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
        const resultsPane = screen.getByRole("complementary", { name: /codex results/i });
        expect(await within(resultsPane).findByRole("button", { name: /klax resources/i })).toBeInTheDocument();
    });



});
