import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter, MemoryRouter, Route, Routes } from "react-router-dom";
import TopContainer from "@/components/TopContainer/TopContainer";
import CodexPage from "./CodexPage";
import { useCodexStore } from "@/stores/codexStore";
import { buildEntriesByKey, buildEntriesByKindKey } from "@/lib/codex/codexRefs";
import { BackButton, LocationProbe, seedDefaultCodexStore } from "@/pages/testUtils/codexPageTestUtils";
import type { CodexEntry } from "@/types/dataTypes";

function seedCodexEntries(entries: CodexEntry[]) {
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
}

function seedShallowReferenceLayoutEntries() {
    seedCodexEntries([
        {
            exportKind: "councilors",
            entryKey: "Councilor_Atea",
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
                lines: ["+100% [HealthRegen] Health Regeneration in Guard stance"],
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
                lines: ["+1 [MovementPoints] Movement Points outside battle"],
            }],
            publicContextKeys: ["PartnerEffect_Hydracorn_PartnerTrait01"],
        },
        {
            exportKind: "resources",
            entryKey: "Resource_Luxury01",
            displayName: "Klax",
            category: null,
            kind: "Resource",
            descriptionLines: [],
            referenceKeys: [],
            facts: [{ label: "Type", value: "Luxury resource" }],
            sections: [{ title: "Effects", lines: ["+15 [PublicOrderColored] Approval on City"] }],
        },
        {
            exportKind: "traits",
            entryKey: "Trait_DaughterOfBor",
            displayName: "Fierce Independence",
            category: "Protectorate",
            kind: "Trait",
            descriptionLines: [],
            referenceKeys: [],
            facts: [
                { label: "Kind", value: "Trait" },
                { label: "Category", value: "Protectorate" },
            ],
            sections: [{ title: "Effects", lines: ["+3 [Defense] Defense on Unit"] }],
        },
        {
            exportKind: "tech",
            entryKey: "Technology_Test",
            displayName: "Test Technology",
            descriptionLines: ["Unlocks a test technology."],
            referenceKeys: [],
        },
        {
            exportKind: "modifiers",
            entryKey: "Modifier_Test",
            displayName: "Hidden Modifier",
            descriptionLines: [],
            referenceKeys: [],
        },
    ]);
}

describe("CodexPage", () => {
    beforeEach(() => {
        useCodexStore.getState().reset();
        seedDefaultCodexStore();
    });

    afterEach(() => {
        cleanup();
        useCodexStore.getState().reset();
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
        expect(screen.getByRole("heading", { level: 2, name: "Encyclopedia" })).toBeInTheDocument();
        expect(await screen.findByRole("heading", { name: "Encyclopedia Index" })).toBeInTheDocument();
        expect(screen.queryByRole("heading", { name: "Codex Overview" })).not.toBeInTheDocument();
        expect(within(screen.getByLabelText("Codex encyclopedia statistics")).getByText("categories")).toBeInTheDocument();
        expect(screen.getByText("Browse categories, then inspect descriptions and resolved related links.")).toBeInTheDocument();
        const categoryIndex = screen.getByLabelText("Codex category index");
        expect(categoryIndex).toBeInTheDocument();
        expect(within(categoryIndex).getByRole("button", {
            name: /districts 2 city tiles, exploitations, and terrain infrastructure/i,
        })).toBeInTheDocument();
        expect(getLandingCategoryLabels()).not.toContain("Modifiers");
        expect(screen.getByText("City tiles, exploitations, and terrain infrastructure.")).toBeInTheDocument();
        expect(container.querySelector('img.codex-kindIcon--overview[src="/svg/factions/UI_Common_District.svg"]'))
            .toBeInTheDocument();
        expect(screen.queryByRole("complementary", { name: /codex results/i })).not.toBeInTheDocument();
        expect(screen.queryByRole("heading", { name: "Market Square" })).not.toBeInTheDocument();
        expect(screen.queryByRole("toolbar", { name: /filter codex by category/i })).not.toBeInTheDocument();
    });

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

    it("renders all visible categories directly in the landing category index", async () => {
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
            { exportKind: "quests", entryKey: "Quest_A", displayName: "Quest A", descriptionLines: [], referenceKeys: [] },
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
            "Diplomatic Treaties",
            "Heroes",
            "Improvements",
            "Minor Factions",
            "Populations",
            "Quests",
            "Statuses",
            "Tech",
            "Traits",
            "Units",
        ]);
        expect(categoryLabels).not.toContain("Modifiers");
        expect(categoryLabels).not.toContain("Extractors");
    });

    it("renders all visible categories in a wrapping category shelf on category pages", async () => {
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
            { exportKind: "quests", entryKey: "Quest_A", displayName: "Quest A", descriptionLines: [], referenceKeys: [] },
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
            <MemoryRouter initialEntries={["/codex?category=tech"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        await screen.findByRole("heading", { name: "All Tech" });
        const toolbar = getCategoryToolbar();
        expect(toolbar).toHaveClass("codex-categoryShelf__chips--wrap");
        const categoryLabels = within(toolbar).getAllByRole("button")
            .map((button) => button.querySelector("span:not(.codex-kindFilter__count)")?.textContent?.trim());

        expect(categoryLabels).toEqual([
            "All",
            "Abilities",
            "Actions",
            "Councilors",
            "Councilor Effects",
            "Partner Effects",
            "Districts",
            "Resources",
            "Equipment",
            "Factions",
            "Diplomatic Treaties",
            "Heroes",
            "Improvements",
            "Minor Factions",
            "Populations",
            "Quests",
            "Statuses",
            "Tech",
            "Traits",
            "Units",
        ]);
        expect(categoryLabels).not.toContain("Modifiers");
        expect(categoryLabels).not.toContain("Extractors");
    });

    it("renders Ability overview metadata from exported facts while keeping left rows compact", async () => {
        seedCodexEntries([
            {
                exportKind: "abilities",
                entryKey: "UnitAbility_AlwaysRetaliate",
                displayName: "Always Retaliate",
                category: "COMMON02",
                kind: "PASSIVE / ABILITY",
                descriptionLines: ["Passive"],
                referenceKeys: [],
                facts: [
                    { label: "Ability mechanic", value: "Passive" },
                    { label: "Ability source", value: "Unit ability" },
                    { label: "Combat role", value: "Retaliation" },
                    { label: "Kind", value: "Ability" },
                ],
            },
            {
                exportKind: "abilities",
                entryKey: "UnitAbility_ArcaneStrike",
                displayName: "Arcane Strike",
                category: "Tactical",
                kind: "Ability",
                descriptionLines: ["Tactical / Enemies / Range 3 / Cost 1 Battle Token"],
                referenceKeys: [],
                facts: [
                    { label: "Category", value: "Tactical" },
                    { label: "Target", value: "Enemies" },
                    { label: "Range", value: "3" },
                    { label: "Cost", value: "1 Battle Token" },
                    { label: "Ability mechanic", value: "Active" },
                    { label: "Ability source", value: "Battle skill" },
                    { label: "Combat role", value: "Damage" },
                ],
                sections: [
                    {
                        title: "Effects",
                        lines: [
                            [
                                "Ignores the Defense of targeted Units",
                                "Deals 80% of the Hero's [Damage] Damage",
                                "Deals 6 extra Damage per Determination",
                                "Applies Burning for 1 turn",
                            ].join("\n"),
                        ],
                    },
                ],
            },
            {
                exportKind: "abilities",
                entryKey: "Ability_ActiveBattleSkillNameOnly",
                displayName: "Active Battle Skill Name Only",
                descriptionLines: ["Status apply appears in prose without exported metadata facts."],
                referenceKeys: [],
            },
        ]);

        render(
            <MemoryRouter initialEntries={["/codex?category=abilities"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "Ability Archive" })).toBeInTheDocument();
        const filterRail = screen.getByLabelText("Ability catalog filters");
        expect(within(filterRail).queryByText("Ability archive")).not.toBeInTheDocument();
        expect(within(filterRail).queryByText("Choose a shelf to browse combat and empire abilities."))
            .not.toBeInTheDocument();
        expect(within(filterRail).getByRole("group", { name: "Mechanics" })).toBeInTheDocument();
        expect(within(filterRail).getByRole("group", { name: "Sources" })).toBeInTheDocument();
        expect(within(filterRail).queryByRole("button", { name: /always retaliate/i })).not.toBeInTheDocument();
        expect(screen.queryByLabelText("Codex results")).not.toBeInTheDocument();

        const abilitiesOverview = screen.getByLabelText("Abilities overview");
        const overviewRow = within(abilitiesOverview).getByRole("button", { name: /always retaliate/i });
        expect(overviewRow.querySelector("img.codex-kindIcon--summaryEntry")).toHaveAttribute(
            "src",
            "/svg/unit-abilities/UI_UnitAbility_AlwaysRetaliate.svg"
        );
        const metadata = within(overviewRow).getByLabelText("Exported metadata");
        expect(overviewRow.querySelector(".codex-summaryList__titleLine .codex-summaryList__metadata"))
            .toBe(metadata);
        expect(within(metadata).getByText("Mechanic")).toBeInTheDocument();
        expect(within(metadata).getByText("Passive")).toBeInTheDocument();
        expect(within(metadata).getByText("Source")).toBeInTheDocument();
        expect(within(metadata).getByText("Unit ability")).toBeInTheDocument();
        expect(within(metadata).getByText("Role")).toBeInTheDocument();
        expect(within(metadata).getByText("Retaliation")).toBeInTheDocument();
        expect(overviewRow.querySelector(".codex-summaryList__description")).not.toBeInTheDocument();
        expect(overviewRow.querySelector(".codex-summaryList__context")).not.toBeInTheDocument();
        expect(within(overviewRow).queryByText(/common02/i)).not.toBeInTheDocument();
        expect(within(overviewRow).queryByText(/passive \/ ability/i)).not.toBeInTheDocument();

        const usefulPreviewRow = within(abilitiesOverview).getByRole("button", { name: /arcane strike/i });
        expect(within(usefulPreviewRow).getByText("Tactical / Enemies / Range 3 / Cost 1 Battle Token"))
            .toBeInTheDocument();
        const effectPreview = within(usefulPreviewRow).getByLabelText("Effect preview");
        expect(within(effectPreview).getByText("Ignores the Defense of targeted Units")).toBeInTheDocument();
        expect(within(effectPreview).getByAltText("Damage")).toBeInTheDocument();
        expect(within(effectPreview).getByText("Deals 6 extra Damage per Determination")).toBeInTheDocument();
        expect(within(effectPreview).queryByText("Applies Burning for 1 turn")).not.toBeInTheDocument();
        expect(
            within(effectPreview).queryByText(
                "Ignores the Defense of targeted Units Deals 80% of the Hero's Damage Deals 6 extra Damage per Determination"
            )
        ).not.toBeInTheDocument();
        expect(
            Array.from(effectPreview.querySelectorAll(".codex-summaryList__effectPreviewLine")).map((line) =>
                line.textContent?.replace(/\s+/g, " ").trim()
            )
        ).toEqual([
            "Ignores the Defense of targeted Units",
            "Deals 80% of the Hero's Damage",
            "Deals 6 extra Damage per Determination",
        ]);
        expect(
            Array.from(effectPreview.querySelectorAll(".codex-summaryList__effectPreviewLine")).map((line) =>
                line.tagName
            )
        ).toEqual(["SPAN", "SPAN", "SPAN"]);
        expect(effectPreview.querySelectorAll(".codex-summaryList__effectPreviewLine")).toHaveLength(3);
        expect(usefulPreviewRow.querySelector(".codex-summaryList__context")).not.toBeInTheDocument();

        const thinOverviewRow = within(abilitiesOverview).getByRole("button", {
            name: /active battle skill name only/i,
        });
        expect(thinOverviewRow.querySelector("img.codex-kindIcon--summaryEntry")).toBeInTheDocument();
        expect(thinOverviewRow.querySelector(".codex-summaryList__metadata")).not.toBeInTheDocument();
    });

    it("renders Status overview metadata from exported facts while keeping left rows compact", async () => {
        seedCodexEntries([
            {
                exportKind: "statuses",
                entryKey: "Status_PublicOpinion_Test",
                displayName: "Public Opinion Status",
                descriptionLines: ["A diplomatic status."],
                referenceKeys: [],
                facts: [
                    { label: "Scope", value: "Diplomatic Ambassy" },
                    { label: "Duration", value: "10 turns" },
                    { label: "Status type", value: "Public Opinion" },
                ],
            },
            {
                exportKind: "statuses",
                entryKey: "Status_UnitDurationNameOnly",
                displayName: "Unit 10 turns Name Only",
                descriptionLines: ["Unit scope and 10 turns appear in prose only."],
                referenceKeys: [],
            },
        ]);

        render(
            <MemoryRouter initialEntries={["/codex?category=statuses"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "All Statuses" })).toBeInTheDocument();
        const resultsPane = screen.getByLabelText("Codex results");
        const leftRow = within(resultsPane).getByRole("button", { name: /public opinion status/i });
        expect(leftRow.querySelector("img.codex-kindIcon--result")).toBeInTheDocument();
        expect(leftRow.querySelector(".codex-resultRow__factChips")).not.toBeInTheDocument();

        const statusesOverview = screen.getByLabelText("Statuses overview");
        const overviewRow = within(statusesOverview).getByRole("button", { name: /public opinion status/i });
        expect(overviewRow.querySelector("img.codex-kindIcon--summaryEntry")).toBeInTheDocument();
        const metadata = within(overviewRow).getByLabelText("Exported metadata");
        expect(within(metadata).getByText("Scope")).toBeInTheDocument();
        expect(within(metadata).getByText("Diplomatic Ambassy")).toBeInTheDocument();
        expect(within(metadata).getByText("Duration")).toBeInTheDocument();
        expect(within(metadata).getByText("10 turns")).toBeInTheDocument();
        expect(within(metadata).queryByText("Public Opinion")).not.toBeInTheDocument();

        const thinRow = within(resultsPane).getByRole("button", { name: /unit 10 turns name only/i });
        expect(thinRow).toBeInTheDocument();
        expect(thinRow.querySelector(".codex-resultRow__factChips")).not.toBeInTheDocument();
        const thinOverviewRow = within(statusesOverview).getByRole("button", { name: /unit 10 turns name only/i });
        expect(thinOverviewRow.querySelector(".codex-summaryList__metadata")).not.toBeInTheDocument();
    });

    it("does not render Ability or Status overview metadata chips for other Codex categories", async () => {
        seedCodexEntries([
            {
                exportKind: "tech",
                entryKey: "Tech_MetadataTrap",
                displayName: "Metadata Trap",
                descriptionLines: ["A tech entry with tempting fact labels."],
                referenceKeys: [],
                facts: [
                    { label: "Ability mechanic", value: "Active" },
                    { label: "Scope", value: "Empire" },
                    { label: "Duration", value: "10 turns" },
                ],
            },
        ]);

        render(
            <MemoryRouter initialEntries={["/codex?category=tech"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "All Tech" })).toBeInTheDocument();
        const resultsPane = screen.getByLabelText("Codex results");
        const row = within(resultsPane).getByRole("button", { name: /metadata trap/i });
        expect(row.querySelector(".codex-resultRow__factChips")).not.toBeInTheDocument();
        const techOverview = screen.getByLabelText("Tech overview");
        expect(techOverview.querySelector(".codex-summaryList__metadata")).not.toBeInTheDocument();
        expect(screen.queryByLabelText("Tech filters")).not.toBeInTheDocument();
    });

    it("filters the Ability catalog from the left rail using exported facts only", async () => {
        const user = userEvent.setup();
        seedCodexEntries([
            {
                exportKind: "abilities",
                entryKey: "UnitAbility_AlwaysRetaliate",
                displayName: "Always Retaliate",
                descriptionLines: ["Counterattack when possible."],
                referenceKeys: [],
                facts: [
                    { label: "Ability mechanic", value: "Reaction" },
                    { label: "Ability source", value: "Unit ability" },
                    { label: "Combat role", value: "Retaliation" },
                ],
            },
            {
                exportKind: "abilities",
                entryKey: "UnitAbility_PreciseVolley",
                displayName: "Precise Volley",
                descriptionLines: ["Applies a status from an active battle skill."],
                referenceKeys: [],
                facts: [
                    { label: "Ability mechanic", value: "Active" },
                    { label: "Ability source", value: "Battle skill" },
                    { label: "Combat role", value: "Damage, Movement, Status apply" },
                ],
            },
            {
                exportKind: "abilities",
                entryKey: "Ability_ActiveBattleSkillNameOnly",
                displayName: "Active Battle Skill Name Only",
                descriptionLines: ["Active battle skill and status apply appear in prose only."],
                referenceKeys: [],
            },
            {
                exportKind: "abilities",
                entryKey: "Ability_PassiveNoRole",
                displayName: "Quiet Discipline",
                descriptionLines: ["Passive support ability without a curated role."],
                referenceKeys: [],
                facts: [
                    { label: "Ability mechanic", value: "Passive" },
                ],
            },
        ]);

        render(
            <MemoryRouter initialEntries={["/codex?category=abilities"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "Ability Archive" })).toBeInTheDocument();
        const filters = screen.getByLabelText("Abilities filters");
        expect(within(filters).queryByRole("button", { name: /all/i })).not.toBeInTheDocument();
        const popularGroup = within(filters).getByRole("group", { name: "Ability Role" });
        const mechanicGroup = within(filters).getByRole("group", { name: "Mechanics" });
        const sourceGroup = within(filters).getByRole("group", { name: "Sources" });
        expect(within(popularGroup).getByRole("button", { name: /damage\s+1/i })).toBeInTheDocument();
        expect(within(popularGroup).getByRole("button", { name: /status apply\s+1/i })).toBeInTheDocument();
        expect(within(popularGroup).queryByRole("button", { name: /heal\s+0/i })).not.toBeInTheDocument();
        expect(within(mechanicGroup).getByRole("button", { name: /active\s+1/i })).toBeInTheDocument();
        expect(within(mechanicGroup).getByRole("button", { name: /passive\s+1/i })).toBeInTheDocument();
        expect(within(sourceGroup).getByRole("button", { name: /battle skill\s+1/i })).toBeInTheDocument();
        expect(within(sourceGroup).queryByRole("button", { name: /unit ability event\s+0/i })).not.toBeInTheDocument();
        expect(within(filters).queryByRole("group", { name: "Role" })).not.toBeInTheDocument();
        expect(within(filters).queryByRole("button", { name: "Clear" })).not.toBeInTheDocument();
        expect(within(filters).queryByText("Current shelf")).not.toBeInTheDocument();

        await user.click(within(popularGroup).getByRole("button", { name: /status apply\s+1/i }));

        const abilitiesOverview = screen.getByLabelText("Abilities overview");
        expect(await screen.findByRole("heading", { name: "Status Apply Abilities" })).toBeInTheDocument();
        expect(within(abilitiesOverview).getByRole("button", { name: /precise volley/i })).toBeInTheDocument();
        expect(within(abilitiesOverview).queryByRole("button", { name: /always retaliate/i })).not.toBeInTheDocument();
        expect(within(abilitiesOverview).queryByRole("button", { name: /active battle skill name only/i }))
            .not.toBeInTheDocument();

        expect(within(popularGroup).getByRole("button", { name: /status apply\s+1/i }))
            .toHaveAttribute("aria-pressed", "true");
        expect(within(filters).getByRole("group", { name: "Ability Role" })).toBeInTheDocument();
        expect(within(filters).getByRole("group", { name: "Mechanics" })).toBeInTheDocument();
        expect(within(filters).getByRole("group", { name: "Sources" })).toBeInTheDocument();
        expect(within(popularGroup).queryByRole("button", { name: /reactive skill\s+0/i }))
            .not.toBeInTheDocument();
        expect(within(mechanicGroup).getByRole("button", { name: /passive\s+0/i })).toBeDisabled();
        expect(within(sourceGroup).getByRole("button", { name: /unit ability event\s+0/i })).toBeDisabled();
        expect(within(filters).queryByText("Current shelf")).not.toBeInTheDocument();

        await user.click(within(filters).getByRole("button", { name: "Clear" }));

        expect(await screen.findByRole("heading", { name: "Ability Archive" })).toBeInTheDocument();
        expect(within(abilitiesOverview).getByRole("button", { name: /always retaliate/i })).toBeInTheDocument();
        expect(within(abilitiesOverview).getByRole("button", { name: /active battle skill name only/i }))
            .toBeInTheDocument();

        await user.click(within(mechanicGroup).getByRole("button", { name: /passive\s+1/i }));
        expect(await screen.findByRole("heading", { name: "Passive Abilities" })).toBeInTheDocument();
        expect(within(abilitiesOverview).getByRole("button", { name: /quiet discipline/i })).toBeInTheDocument();
        expect(within(popularGroup).getByRole("button", { name: /damage\s+0/i })).toBeDisabled();
        expect(within(popularGroup).getByRole("button", { name: /status apply\s+0/i })).toBeDisabled();
        expect(within(popularGroup).queryByRole("button", { name: /reactive skill\s+0/i }))
            .not.toBeInTheDocument();

        await user.click(within(filters).getByRole("button", { name: "Clear" }));

        await user.click(within(mechanicGroup).getByRole("button", { name: /active\s+1/i }));
        expect(await screen.findByRole("heading", { name: "Active Abilities" })).toBeInTheDocument();
        expect(within(abilitiesOverview).getByRole("button", { name: /precise volley/i })).toBeInTheDocument();
        expect(within(abilitiesOverview).queryByRole("button", { name: /always retaliate/i })).not.toBeInTheDocument();

        await user.click(within(abilitiesOverview).getByRole("button", { name: /precise volley/i }));
        expect(await screen.findByRole("heading", { name: "Precise Volley" })).toBeInTheDocument();
        expect(screen.getByLabelText("Ability catalog filters")).toBeInTheDocument();
    });

    it("does not apply catalog filters to Statuses in this prototype", async () => {
        seedCodexEntries([
            {
                exportKind: "statuses",
                entryKey: "Status_PublicOpinion_Test",
                displayName: "Public Opinion Status",
                descriptionLines: ["A diplomatic status."],
                referenceKeys: [],
                facts: [
                    { label: "Scope", value: "Diplomatic Ambassy" },
                    { label: "Duration", value: "10 turns" },
                    { label: "Status type", value: "Public Opinion" },
                ],
            },
            {
                exportKind: "statuses",
                entryKey: "Status_Unit_Hobbled",
                displayName: "Hobbled",
                descriptionLines: ["A unit status."],
                referenceKeys: [],
                facts: [
                    { label: "Scope", value: "Unit" },
                    { label: "Duration", value: "1 turn" },
                    { label: "Status type", value: "Land Speed" },
                ],
            },
            {
                exportKind: "statuses",
                entryKey: "Status_ProseOnly",
                displayName: "Unit 10 turns Prose Only",
                descriptionLines: ["Unit and 10 turns appear in prose only."],
                referenceKeys: [],
            },
        ]);

        render(
            <MemoryRouter initialEntries={["/codex?category=statuses"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "All Statuses" })).toBeInTheDocument();
        expect(screen.queryByLabelText("Statuses filters")).not.toBeInTheDocument();
        const resultsPane = screen.getByLabelText("Codex results");
        expect(within(resultsPane).getByRole("button", { name: /public opinion status/i })).toBeInTheDocument();
        expect(within(resultsPane).getByRole("button", { name: /hobbled/i })).toBeInTheDocument();
        expect(within(resultsPane).getByRole("button", { name: /unit 10 turns prose only/i })).toBeInTheDocument();

        const statusesOverview = screen.getByLabelText("Statuses overview");
        expect(within(statusesOverview).getByRole("button", { name: /public opinion status/i })).toBeInTheDocument();
        expect(within(statusesOverview).getByRole("button", { name: /hobbled/i })).toBeInTheDocument();
    });

    it("returns to the full encyclopedia when selecting All from the category shelf", async () => {
        const user = userEvent.setup();
        seedCodexEntries([
            { exportKind: "tech", entryKey: "Tech_A", displayName: "Tech A", descriptionLines: [], referenceKeys: [] },
            { exportKind: "actions", entryKey: "Action_A", displayName: "Action A", descriptionLines: [], referenceKeys: [] },
        ]);

        render(
            <MemoryRouter initialEntries={["/codex?category=tech"]}>
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

        expect(await screen.findByRole("heading", { name: "All Tech" })).toBeInTheDocument();
        const toolbar = getCategoryToolbar();
        const allButton = within(toolbar).getByRole("button", { name: /all/i });
        expect(allButton).toHaveAttribute("aria-pressed", "false");

        await user.click(allButton);

        expect(await screen.findByRole("heading", { name: "Encyclopedia Index" })).toBeInTheDocument();
        expect(screen.getByTestId("location-probe")).toHaveTextContent("/codex");
        expect(screen.queryByRole("toolbar", { name: /filter codex by category/i })).not.toBeInTheDocument();
    });

    it("highlights category chips for category deep links", async () => {
        seedCodexEntries([
            { exportKind: "actions", entryKey: "Action_A", displayName: "Action A", descriptionLines: [], referenceKeys: [] },
            { exportKind: "abilities", entryKey: "Ability_A", displayName: "Ability A", descriptionLines: [], referenceKeys: [] },
            { exportKind: "equipment", entryKey: "Equipment_A", displayName: "Equipment A", descriptionLines: [], referenceKeys: [] },
            {
                exportKind: "partnerEffects",
                entryKey: "PartnerEffect_A",
                displayName: "Partner Effect A",
                descriptionLines: [],
                referenceKeys: [],
            },
        ]);

        render(
            <MemoryRouter initialEntries={["/codex?category=partnereffects"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "All Partner Effects" })).toBeInTheDocument();
        const partnerHeader = document.querySelector(".codex-header") as HTMLElement;
        expect(partnerHeader.querySelector(".codex-pageTitle")).not.toBeInTheDocument();
        expect(within(getCategoryToolbar()).getByRole("button", { name: /all/i }))
            .toHaveAttribute("aria-pressed", "false");
        expect(within(getCategoryToolbar()).getByRole("button", { name: /partner effects/i }))
            .toHaveAttribute("aria-pressed", "true");

        cleanup();

        render(
            <MemoryRouter initialEntries={["/codex?category=equipment"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "All Equipment" })).toBeInTheDocument();
        const equipmentHeader = document.querySelector(".codex-header") as HTMLElement;
        expect(equipmentHeader.querySelector(".codex-pageTitle")).not.toBeInTheDocument();
        expect(within(getCategoryToolbar()).getByRole("button", { name: /all/i }))
            .toHaveAttribute("aria-pressed", "false");
        expect(within(getCategoryToolbar()).getByRole("button", { name: /equipment/i }))
            .toHaveAttribute("aria-pressed", "true");

        cleanup();

        render(
            <MemoryRouter initialEntries={["/codex?category=actions"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "All Actions" })).toBeInTheDocument();
        const actionsHeader = document.querySelector(".codex-header") as HTMLElement;
        expect(actionsHeader.querySelector(".codex-pageTitle")).not.toBeInTheDocument();
        expect(within(getCategoryToolbar()).getByRole("button", { name: /all/i }))
            .toHaveAttribute("aria-pressed", "false");
        expect(within(getCategoryToolbar()).getByRole("button", { name: /actions/i }))
            .toHaveAttribute("aria-pressed", "true");
    });

    it("keeps category routes on the existing category page layout", async () => {
        seedCodexEntries([
            {
                exportKind: "tech",
                entryKey: "Technology_Test",
                displayName: "Test Technology",
                descriptionLines: ["Unlocks a test technology."],
                referenceKeys: [],
            },
        ]);

        render(
            <MemoryRouter initialEntries={["/codex?category=tech"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "All Tech" })).toBeInTheDocument();
        const codexHeader = document.querySelector(".codex-header") as HTMLElement;
        expect(codexHeader.querySelector(".codex-pageTitle")).not.toBeInTheDocument();
        expect(within(codexHeader).queryByRole("heading", { name: "Tech" })).not.toBeInTheDocument();
        expect(screen.getByRole("complementary", { name: /codex results/i })).toBeInTheDocument();
        expect(within(getCategoryToolbar()).getByRole("button", { name: /all/i }))
            .toHaveAttribute("aria-pressed", "false");
        expect(within(getCategoryToolbar()).getByRole("button", { name: /tech/i }))
            .toHaveAttribute("aria-pressed", "true");
        expect(screen.queryByRole("heading", { name: "Encyclopedia Index" })).not.toBeInTheDocument();
    });

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
        expect(within(getCategoryToolbar()).getByRole("button", { name: /partner effects 1/i }))
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
        expect(within(getCategoryToolbar()).getByRole("button", { name: /councilor effects 1/i }))
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

    it("keeps traits, tech, and selected effect entries on the split layout", async () => {
        seedShallowReferenceLayoutEntries();

        render(
            <MemoryRouter initialEntries={["/codex?category=traits"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "All Traits" })).toBeInTheDocument();
        expect(screen.getByRole("complementary", { name: /codex results/i })).toBeInTheDocument();
        expect(document.querySelector(".codex-workspace--referenceOverview")).not.toBeInTheDocument();

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
        expect(screen.getByRole("complementary", { name: /codex results/i })).toBeInTheDocument();
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
        expect(screen.getByRole("button", { name: /all districts/i })).toBeInTheDocument();
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
            "Diplomatic Treaties",
            "Heroes",
            "Statuses",
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
        expect(within(getCategoryToolbar()).getByRole("button", { name: /councilors 1/i }))
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
        expect(screen.getByTestId("location-probe")).toHaveTextContent("/codex?entry=CouncilorEffect_Defense21");

        const input = screen.getByRole("combobox", { name: /search the encyclopedia/i });
        await user.clear(input);
        await user.type(input, "Klax");

        expect(input).toHaveAttribute("aria-autocomplete", "none");
        expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
        const resultsPane = screen.getByRole("complementary", { name: /codex results/i });
        expect(await within(resultsPane).findByRole("button", { name: /klax resources/i })).toBeInTheDocument();
    });

    it("cleans technical effect context labels on detail pages without rewriting mechanics", async () => {
        const entries: CodexEntry[] = [
            {
                exportKind: "councilorEffects",
                entryKey: "CouncilorEffect_Defense21",
                displayName: "Travels Well",
                category: "Effect_Defense21",
                kind: "Councilor Effect",
                descriptionLines: [],
                referenceKeys: [],
                facts: [
                    { label: "Role", value: "Defense" },
                    { label: "Kind", value: "Councilor Effect" },
                ],
                sections: [{ title: "Effects", lines: ["+4 [Defense] Defense on Hero."] }],
            },
            {
                exportKind: "partnerEffects",
                entryKey: "PartnerEffect_Hydracorn_PartnerTrait01",
                displayName: "Agile Politico",
                category: "PartnerEffectCouncillorDisputeEvent003PartnerTrait",
                kind: "Partner Effect",
                descriptionLines: [],
                referenceKeys: [],
                facts: [{ label: "Kind", value: "Partner Effect" }],
                sections: [{ title: "Effects", lines: ["+5 [Determination] Determination"] }],
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
            <MemoryRouter initialEntries={["/codex?category=counciloreffects&entry=CouncilorEffect_Defense21"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "Travels Well" })).toBeInTheDocument();
        const councilorDetail = screen.getByRole("heading", { name: "Travels Well" }).closest(".codex-detail") as HTMLElement;
        const councilorMeta = councilorDetail.querySelector(".codex-detail__metaRow") as HTMLElement;
        expect(within(councilorMeta).getByText("Councilor Effects")).toBeInTheDocument();
        expect(within(councilorMeta).getByText("Defense")).toBeInTheDocument();
        expect(within(councilorMeta).queryByText(/Effect Defense21/i)).not.toBeInTheDocument();
        expect(within(councilorMeta).queryByText(/Councilor Effect$/i)).not.toBeInTheDocument();
        expect(within(councilorDetail).getByText("+4")).toBeInTheDocument();
        expect(within(councilorDetail).getByText("Defense on Hero.")).toBeInTheDocument();

        cleanup();
        useCodexStore.getState().reset();
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
            <MemoryRouter initialEntries={["/codex?category=partnereffects&entry=PartnerEffect_Hydracorn_PartnerTrait01"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "Agile Politico" })).toBeInTheDocument();
        const partnerDetail = screen.getByRole("heading", { name: "Agile Politico" }).closest(".codex-detail") as HTMLElement;
        const partnerMeta = partnerDetail.querySelector(".codex-detail__metaRow") as HTMLElement;
        expect(within(partnerMeta).getByText("Partner Effects")).toBeInTheDocument();
        expect(within(partnerMeta).queryByText(/Partner Effect Councillor Dispute Event003 Partner Trait/i)).not.toBeInTheDocument();
        expect(within(partnerMeta).queryByText(/^Partner Effect$/i)).not.toBeInTheDocument();
        expect(within(partnerDetail).getByText("+5")).toBeInTheDocument();
        expect(within(partnerDetail).getByText("Determination")).toBeInTheDocument();
    });

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
                    { label: "Category", value: "Protectorate" },
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
                    { label: "Category", value: "Protectorate" },
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
            .getByRole("button", { name: /councilor effects 1/i }));
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
            .getByRole("button", { name: /partner effects 1/i }));
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
            .getByRole("button", { name: /traits 2/i }));
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

    it("renders status details while keeping related modifiers hidden from navigation but linkable", async () => {
        const user = userEvent.setup();
        const entries: CodexEntry[] = [
            {
                exportKind: "statuses",
                entryKey: "Status_PublicOpinion_Test",
                displayName: "Public Opinion Status",
                category: "Status",
                kind: "Status",
                descriptionLines: [],
                referenceKeys: [],
                publicContextKeys: ["ActionCostModifier_Test"],
                facts: [
                    { label: "Category", value: "Diplomacy" },
                    { label: "Kind", value: "Status" },
                    { label: "Duration", value: "10 turns" },
                ],
                sections: [
                    {
                        title: "Status mechanics",
                        lines: ["Changes treaty Public Opinion while active."],
                    },
                ],
            },
            {
                exportKind: "modifiers",
                entryKey: "ActionCostModifier_Test",
                displayName: "Action Cost Modifier Test",
                category: "Cost Modifier",
                kind: "Cost Modifier",
                descriptionLines: [],
                referenceKeys: [],
                facts: [
                    { label: "Category", value: "Cost Modifier" },
                    { label: "Kind", value: "Action Cost Modifier" },
                    { label: "Cost type", value: "Influence" },
                    { label: "Value", value: "-50%" },
                ],
                sections: [
                    {
                        title: "Modifier mechanics",
                        lines: ["Reduces the action Influence cost."],
                    },
                ],
            },
        ];

        useCodexStore.setState({
            entries,
            entriesByKey: buildEntriesByKey(entries),
            entriesByKind: {
                statuses: entries.filter((entry) => entry.exportKind === "statuses"),
                modifiers: entries.filter((entry) => entry.exportKind === "modifiers"),
            },
            entriesByKindKey: buildEntriesByKindKey(entries),
            loading: false,
            error: null,
        });

        render(
            <MemoryRouter initialEntries={["/codex?category=statuses&entry=Status_PublicOpinion_Test"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "Public Opinion Status" })).toBeInTheDocument();
        expect(screen.getByText("Status dossier")).toBeInTheDocument();
        expect(screen.getAllByText("10 turns").length).toBeGreaterThan(0);
        expect(screen.getByRole("heading", { name: "Status mechanics" })).toBeInTheDocument();
        expect(screen.getByText("Changes treaty Public Opinion while active.")).toBeInTheDocument();
        expect(within(getCategoryToolbar()).queryByRole("button", { name: /modifiers/i })).not.toBeInTheDocument();

        const relatedSection = screen.getByRole("region", { name: /related entries/i });
        await user.click(within(relatedSection).getByRole("button", { name: /action cost modifier test modifiers/i }));

        expect(await screen.findByRole("heading", { name: "Action Cost Modifier Test" })).toBeInTheDocument();
        expect(screen.getByText("Modifier dossier")).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Modifier mechanics" })).toBeInTheDocument();
        expect(screen.getByText("Reduces the action Influence cost.")).toBeInTheDocument();
        expect(within(getCategoryToolbar()).queryByRole("button", { name: /modifiers/i })).not.toBeInTheDocument();
    });

    it("links exact status mentions inline on ability details while keeping unresolved mentions plain", async () => {
        const user = userEvent.setup();
        const entries: CodexEntry[] = [
            {
                exportKind: "abilities",
                entryKey: "UnitAbility_JinxedStrike",
                displayName: "Jinxed Strike",
                category: "Combat",
                kind: "Ability",
                descriptionLines: [],
                referenceKeys: ["Status_Unit_Jinxed", "Status_Unit_Jinxed_2"],
                publicContextKeys: ["Status_Unit_Jinxed", "Status_Unit_Jinxed_2"],
                facts: [
                    { label: "Kind", value: "Ability" },
                    { label: "Category", value: "Combat" },
                ],
                sections: [
                    {
                        title: "Effects",
                        lines: [
                            "[DoubleArrow] Restores [Health] Health, deals [Damage] Damage, grants [Shield] Shield, and spends [Focus] Focus",
                            "[DoubleArrow] Applies Jinxed II Status to the attacked Units",
                            "[DoubleArrow] Applies UnJinxed II Status to the attacker",
                            "[DoubleArrow] Applies Ghosted Status if the target is already cursed",
                        ],
                    },
                ],
            },
            {
                exportKind: "statuses",
                entryKey: "Status_Unit_Jinxed",
                displayName: "Jinxed",
                category: "Status",
                kind: "Status",
                descriptionLines: ["Jinxed lowers Accuracy for one turn."],
                referenceKeys: [],
                facts: [
                    { label: "Category", value: "Status" },
                    { label: "Kind", value: "Status" },
                ],
            },
            {
                exportKind: "statuses",
                entryKey: "Status_Unit_Jinxed_2",
                displayName: "Jinxed II",
                category: "Status",
                kind: "Status",
                descriptionLines: ["Jinxed II lowers Accuracy for two turns."],
                referenceKeys: [],
                facts: [
                    { label: "Category", value: "Status" },
                    { label: "Kind", value: "Status" },
                ],
                sections: [
                    {
                        title: "Status mechanics",
                        items: [
                            {
                                label: "Accuracy",
                                facts: [
                                    { label: "Affected stat", value: "Accuracy" },
                                    { label: "Change", value: "-20%" },
                                ],
                                lines: ["-20% [Accuracy] Accuracy"],
                            },
                        ],
                    },
                ],
            },
        ];

        useCodexStore.setState({
            entries,
            entriesByKey: buildEntriesByKey(entries),
            entriesByKind: {
                abilities: entries.filter((entry) => entry.exportKind === "abilities"),
                statuses: entries.filter((entry) => entry.exportKind === "statuses"),
            },
            entriesByKindKey: buildEntriesByKindKey(entries),
            loading: false,
            error: null,
        });

        render(
            <MemoryRouter initialEntries={["/codex?category=abilities&entry=UnitAbility_JinxedStrike"]}>
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

        expect(await screen.findByRole("heading", { name: "Jinxed Strike" })).toBeInTheDocument();
        const tokenLine = screen.getByText(/Restores/).closest("p");
        expect(tokenLine).toHaveTextContent("Restores Health, deals Damage, grants Shield, and spends Focus");
        expect(tokenLine).not.toHaveTextContent("[Health]");
        expect(tokenLine).not.toHaveTextContent("[Damage]");
        expect(tokenLine).not.toHaveTextContent("[Shield]");
        expect(tokenLine).not.toHaveTextContent("[Focus]");

        const inlineLink = screen.getByRole("button", { name: "Open Jinxed II in Codex" });
        const linkedLine = inlineLink.closest("p");
        expect(linkedLine).toHaveTextContent("Applies Jinxed II Status to the attacked Units");
        expect(inlineLink).toHaveTextContent("Jinxed II");
        expect(linkedLine).not.toHaveTextContent("Jinxed II lowers Accuracy for two turns.");

        expect(screen.getByText(/Applies UnJinxed II Status to the attacker/)).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /Open UnJinxed/i })).not.toBeInTheDocument();
        expect(screen.getByText(/Applies Ghosted Status if the target is already cursed/)).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /Open Ghosted/i })).not.toBeInTheDocument();

        const relatedSection = screen.getByRole("region", { name: /related entries/i });
        expect(within(relatedSection).getByRole("button", { name: /jinxed ii statuses/i })).toBeInTheDocument();

        inlineLink.focus();
        expect(inlineLink).toHaveFocus();
        expect(await screen.findByRole("tooltip")).toHaveTextContent("Jinxed II");
        inlineLink.blur();
        await waitFor(() => expect(screen.queryByRole("tooltip")).not.toBeInTheDocument());

        await user.hover(inlineLink);
        expect(await screen.findByRole("tooltip")).toHaveTextContent("Jinxed II");
        expect(screen.getByRole("tooltip")).toHaveTextContent("Accuracy");

        await user.click(inlineLink);
        expect(await screen.findByRole("heading", { name: "Jinxed II" })).toBeInTheDocument();
        expect(screen.getByTestId("location-probe")).toHaveTextContent("/codex?entry=Status_Unit_Jinxed_2");
    });

    it("previews resolved granted abilities on Unit details while keeping related entries available", async () => {
        const user = userEvent.setup();
        const entries: CodexEntry[] = [
            {
                exportKind: "units",
                entryKey: "Unit_KinOfSheredyn_Archer",
                displayName: "Archer",
                kind: "Unit",
                category: "Kin of Sheredyn",
                descriptionLines: [],
                referenceKeys: [
                    "Faction_KinOfSheredyn",
                    "UnitAbility_Ranged_3",
                    "UnitAbility_TeamPlayer_1",
                    "UnitAbility_Scouting",
                ],
                facts: [
                    { label: "Kind", value: "Unit" },
                    { label: "Tier", value: "0" },
                    { label: "Faction", value: "Kin of Sheredyn" },
                    { label: "Class", value: "Ranged" },
                    { label: "Spawn type", value: "Land" },
                ],
                sections: [
                    {
                        title: "Granted abilities",
                        items: [
                            { label: "Ranged III", referenceKey: "UnitAbility_Ranged_3" },
                            { label: "Coordinated Attack I", referenceKey: "UnitAbility_TeamPlayer_1" },
                            { label: "Unresolved Drill", referenceKey: "UnitAbility_Missing" },
                        ],
                    },
                    {
                        title: "Stats",
                        lines: [
                            "+3 [AttackRange] Attack Range",
                            "+55 [Damage] Damage",
                        ],
                    },
                ],
            },
            {
                exportKind: "abilities",
                entryKey: "UnitAbility_Ranged_3",
                displayName: "Ranged III",
                category: "Passive",
                kind: "Ability",
                descriptionLines: ["+3 [AttackRange] Attack Range"],
                referenceKeys: [],
                facts: [
                    { label: "Kind", value: "Ability" },
                    { label: "Category", value: "Passive" },
                ],
                sections: [{ title: "Effects", lines: ["+3 [AttackRange] Attack Range"] }],
            },
            {
                exportKind: "abilities",
                entryKey: "UnitAbility_TeamPlayer_1",
                displayName: "Coordinated Attack I",
                category: "Combat",
                kind: "Ability",
                descriptionLines: ["When attacking a Unit adjacent to two friendly Units: \n[DoubleArrow] Adds 15% [Damage] Damage"],
                referenceKeys: [],
                facts: [
                    { label: "Kind", value: "Ability" },
                    { label: "Category", value: "Combat" },
                ],
                sections: [
                    {
                        title: "Effects",
                        lines: ["[DoubleArrow] Adds 15% [Damage] Damage"],
                    },
                ],
            },
            {
                exportKind: "abilities",
                entryKey: "UnitAbility_Scouting",
                displayName: "Scouting",
                category: "Passive",
                kind: "Ability",
                descriptionLines: ["+1 [VisionRange] Vision Range"],
                referenceKeys: [],
                facts: [
                    { label: "Kind", value: "Ability" },
                    { label: "Category", value: "Passive" },
                ],
                sections: [{ title: "Effects", lines: ["+1 [VisionRange] Vision Range"] }],
            },
            {
                exportKind: "factions",
                entryKey: "Faction_KinOfSheredyn",
                displayName: "Kin of Sheredyn",
                category: "Kin of Sheredyn",
                kind: "Faction",
                descriptionLines: ["Faction overview."],
                referenceKeys: [],
            },
        ];

        useCodexStore.setState({
            entries,
            entriesByKey: buildEntriesByKey(entries),
            entriesByKind: {
                units: entries.filter((entry) => entry.exportKind === "units"),
                abilities: entries.filter((entry) => entry.exportKind === "abilities"),
                factions: entries.filter((entry) => entry.exportKind === "factions"),
            },
            entriesByKindKey: buildEntriesByKindKey(entries),
            loading: false,
            error: null,
        });

        render(
            <MemoryRouter initialEntries={["/codex?category=units&entry=Unit_KinOfSheredyn_Archer"]}>
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

        expect(await screen.findByRole("heading", { name: "Archer" })).toBeInTheDocument();

        const rangedPreview = screen.getByRole("button", { name: "Ranged III Passive / Ability +3 Attack Range" });
        expect(rangedPreview).toHaveTextContent("Ranged III");
        expect(rangedPreview).toHaveTextContent("Passive / Ability");
        expect(rangedPreview).toHaveTextContent("+3 Attack Range");
        expect(rangedPreview).not.toHaveTextContent("[AttackRange]");
        expect(rangedPreview.querySelector(".codex-kindIcon--grantedAbility")).toBeInTheDocument();

        const coordinatedPreview = screen.getByRole("button", {
            name: "Coordinated Attack I Combat / Ability Adds 15% Damage",
        });
        expect(coordinatedPreview).toHaveTextContent("Adds 15% Damage");
        expect(coordinatedPreview).not.toHaveTextContent("[Damage]");
        coordinatedPreview.focus();
        expect(coordinatedPreview).toHaveFocus();

        expect(screen.getByRole("heading", { name: "Unresolved Drill" })).toBeInTheDocument();

        const relatedSection = screen.getByRole("region", { name: /related entries/i });
        expect(within(relatedSection).queryByRole("button", { name: /ranged iii abilities/i })).not.toBeInTheDocument();
        expect(within(relatedSection).queryByRole("button", { name: /coordinated attack i abilities/i })).not.toBeInTheDocument();
        expect(within(relatedSection).getByRole("button", { name: /scouting abilities/i })).toBeInTheDocument();
        expect(within(relatedSection).getByRole("button", { name: /kin of sheredyn factions/i })).toBeInTheDocument();

        await user.click(coordinatedPreview);
        expect(await screen.findByRole("heading", { name: "Coordinated Attack I" })).toBeInTheDocument();
        expect(screen.getByTestId("location-probe")).toHaveTextContent("/codex?entry=UnitAbility_TeamPlayer_1");
    });

    it("previews resolved granted abilities on Equipment details without repeating them in Related Entries", async () => {
        const user = userEvent.setup();
        const entries: CodexEntry[] = [
            {
                exportKind: "equipment",
                entryKey: "Equipment_BloodmarkBow",
                displayName: "Bloodmark Bow",
                kind: "Bow",
                category: "Weapon",
                descriptionLines: [],
                referenceKeys: [
                    "UnitAbility_Ranged_4",
                    "UnitAbility_BreachingAttack_1",
                    "UnitAbility_Missing",
                    "UnitAbility_Scouting",
                    "Faction_LastLords",
                ],
                facts: [
                    { label: "Kind", value: "Bow" },
                    { label: "Slot", value: "Weapon" },
                    { label: "Tier", value: "3" },
                ],
                sections: [
                    {
                        title: "Granted abilities",
                        items: [
                            { label: "Ranged IV", referenceKey: "UnitAbility_Ranged_4" },
                            { label: "Breaching Attack I", referenceKey: "UnitAbility_BreachingAttack_1" },
                            { label: "Unresolved Strike", referenceKey: "UnitAbility_Missing" },
                        ],
                    },
                    {
                        title: "Stats",
                        lines: ["+70 [Damage] Damage"],
                    },
                ],
            },
            {
                exportKind: "abilities",
                entryKey: "UnitAbility_Ranged_4",
                displayName: "Ranged IV",
                category: "Passive",
                kind: "Ability",
                descriptionLines: ["+4 [AttackRange] Attack Range"],
                referenceKeys: [],
                facts: [
                    { label: "Kind", value: "Ability" },
                    { label: "Category", value: "Passive" },
                ],
                sections: [{ title: "Effects", lines: ["+4 [AttackRange] Attack Range"] }],
            },
            {
                exportKind: "abilities",
                entryKey: "UnitAbility_BreachingAttack_1",
                displayName: "Breaching Attack I",
                category: "Combat",
                kind: "Ability",
                descriptionLines: ["Applies Vulnerable I Status to targeted Units"],
                referenceKeys: [],
                facts: [
                    { label: "Kind", value: "Ability" },
                    { label: "Category", value: "Combat" },
                ],
                sections: [{ title: "Effects", lines: ["Applies Vulnerable I Status to targeted Units"] }],
            },
            {
                exportKind: "abilities",
                entryKey: "UnitAbility_Scouting",
                displayName: "Scouting",
                category: "Passive",
                kind: "Ability",
                descriptionLines: ["+1 [VisionRange] Vision Range"],
                referenceKeys: [],
                facts: [
                    { label: "Kind", value: "Ability" },
                    { label: "Category", value: "Passive" },
                ],
                sections: [{ title: "Effects", lines: ["+1 [VisionRange] Vision Range"] }],
            },
            {
                exportKind: "factions",
                entryKey: "Faction_LastLords",
                displayName: "Last Lords",
                category: "Last Lords",
                kind: "Faction",
                descriptionLines: ["Faction overview."],
                referenceKeys: [],
            },
        ];

        useCodexStore.setState({
            entries,
            entriesByKey: buildEntriesByKey(entries),
            entriesByKind: {
                equipment: entries.filter((entry) => entry.exportKind === "equipment"),
                abilities: entries.filter((entry) => entry.exportKind === "abilities"),
                factions: entries.filter((entry) => entry.exportKind === "factions"),
            },
            entriesByKindKey: buildEntriesByKindKey(entries),
            loading: false,
            error: null,
        });

        render(
            <MemoryRouter initialEntries={["/codex?category=equipment&entry=Equipment_BloodmarkBow"]}>
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

        expect(await screen.findByRole("heading", { name: "Bloodmark Bow" })).toBeInTheDocument();

        const rangedPreview = screen.getByRole("button", { name: "Ranged IV Passive / Ability +4 Attack Range" });
        expect(rangedPreview).toHaveTextContent("Ranged IV");
        expect(rangedPreview).toHaveTextContent("+4 Attack Range");
        expect(rangedPreview).not.toHaveTextContent("[AttackRange]");

        const breachingPreview = screen.getByRole("button", {
            name: "Breaching Attack I Combat / Ability Applies Vulnerable I Status to targeted Units",
        });
        expect(breachingPreview).toHaveTextContent("Combat / Ability");
        expect(breachingPreview).toHaveTextContent("Applies Vulnerable I Status to targeted Units");

        expect(screen.getByRole("heading", { name: "Unresolved Strike" })).toBeInTheDocument();

        const relatedSection = screen.getByRole("region", { name: /related entries/i });
        expect(within(relatedSection).queryByRole("button", { name: /ranged iv abilities/i })).not.toBeInTheDocument();
        expect(within(relatedSection).queryByRole("button", { name: /breaching attack i abilities/i })).not.toBeInTheDocument();
        expect(within(relatedSection).getByRole("button", { name: /scouting abilities/i })).toBeInTheDocument();
        expect(within(relatedSection).getByRole("button", { name: /last lords factions/i })).toBeInTheDocument();

        await user.click(breachingPreview);
        expect(await screen.findByRole("heading", { name: "Breaching Attack I" })).toBeInTheDocument();
        expect(screen.getByTestId("location-probe")).toHaveTextContent("/codex?entry=UnitAbility_BreachingAttack_1");
    });

    it("previews resolved granted abilities on Hero details without repeating them in Related Entries", async () => {
        const user = userEvent.setup();
        const entries: CodexEntry[] = [
            {
                exportKind: "heroes",
                entryKey: "Hero_GreenScion_Test",
                displayName: "Arol'chis",
                kind: "Hero",
                category: "Green Scion",
                descriptionLines: [],
                referenceKeys: [
                    "MinorFaction_GreenScion",
                    "UnitAbility_Fly",
                    "UnitAbility_Quickfooted",
                    "UnitAbility_Scouting",
                    "UnitAbility_Hero_Missing",
                ],
                facts: [
                    { label: "Class", value: "Support" },
                    { label: "Faction", value: "Green Scion" },
                ],
                sections: [
                    {
                        title: "Granted abilities",
                        items: [
                            { label: "Flying", referenceKey: "UnitAbility_Fly" },
                            { label: "Evasive Maneuvers", referenceKey: "UnitAbility_Quickfooted" },
                            { label: "Unresolved Hero Gift", referenceKey: "UnitAbility_Hero_Missing" },
                        ],
                    },
                    {
                        title: "Stats",
                        lines: ["+2 [Focus] Focus"],
                    },
                ],
            },
            {
                exportKind: "abilities",
                entryKey: "UnitAbility_Fly",
                displayName: "Flying",
                category: "Passive",
                kind: "Ability",
                descriptionLines: ["Can fly over obstacles."],
                referenceKeys: [],
                facts: [
                    { label: "Kind", value: "Ability" },
                    { label: "Category", value: "Passive" },
                ],
                sections: [{ title: "Effects", lines: ["Can fly over obstacles."] }],
            },
            {
                exportKind: "abilities",
                entryKey: "UnitAbility_Quickfooted",
                displayName: "Evasive Maneuvers",
                category: "Passive",
                kind: "Ability",
                descriptionLines: ["-30% [Damage] Damage from attacks of opportunity."],
                referenceKeys: [],
                facts: [
                    { label: "Kind", value: "Ability" },
                    { label: "Category", value: "Passive" },
                ],
                sections: [{ title: "Effects", lines: ["-30% [Damage] Damage from attacks of opportunity."] }],
            },
            {
                exportKind: "abilities",
                entryKey: "UnitAbility_Scouting",
                displayName: "Scouting",
                category: "Passive",
                kind: "Ability",
                descriptionLines: ["+1 [VisionRange] Vision Range"],
                referenceKeys: [],
                facts: [
                    { label: "Kind", value: "Ability" },
                    { label: "Category", value: "Passive" },
                ],
                sections: [{ title: "Effects", lines: ["+1 [VisionRange] Vision Range"] }],
            },
            {
                exportKind: "minorFactions",
                entryKey: "MinorFaction_GreenScion",
                displayName: "Green Scion",
                kind: "MinorFaction",
                descriptionLines: ["Minor faction overview."],
                referenceKeys: [],
            },
        ];

        useCodexStore.setState({
            entries,
            entriesByKey: buildEntriesByKey(entries),
            entriesByKind: {
                heroes: entries.filter((entry) => entry.exportKind === "heroes"),
                abilities: entries.filter((entry) => entry.exportKind === "abilities"),
                minorFactions: entries.filter((entry) => entry.exportKind === "minorFactions"),
            },
            entriesByKindKey: buildEntriesByKindKey(entries),
            loading: false,
            error: null,
        });

        render(
            <MemoryRouter initialEntries={["/codex?category=heroes&entry=Hero_GreenScion_Test"]}>
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

        expect(await screen.findByRole("heading", { name: "Arol'chis" })).toBeInTheDocument();

        const flyingPreview = screen.getByRole("button", { name: "Flying Passive / Ability Can fly over obstacles." });
        expect(flyingPreview).toHaveTextContent("Flying");
        expect(flyingPreview).toHaveTextContent("Passive / Ability");

        const evasivePreview = screen.getByRole("button", {
            name: "Evasive Maneuvers Passive / Ability -30% Damage from attacks of opportunity.",
        });
        expect(evasivePreview).toHaveTextContent("-30% Damage from attacks of opportunity.");
        expect(evasivePreview).not.toHaveTextContent("[Damage]");

        expect(screen.getByRole("heading", { name: "Unresolved Hero Gift" })).toBeInTheDocument();

        const relatedSection = screen.getByRole("region", { name: /related entries/i });
        expect(within(relatedSection).queryByRole("button", { name: /flying abilities/i })).not.toBeInTheDocument();
        expect(within(relatedSection).queryByRole("button", { name: /evasive maneuvers abilities/i })).not.toBeInTheDocument();
        expect(within(relatedSection).getByRole("button", { name: /scouting abilities/i })).toBeInTheDocument();
        expect(within(relatedSection).getByRole("button", { name: /green scion minor factions/i })).toBeInTheDocument();

        await user.click(evasivePreview);
        expect(await screen.findByRole("heading", { name: "Evasive Maneuvers" })).toBeInTheDocument();
        expect(screen.getByTestId("location-probe")).toHaveTextContent("/codex?entry=UnitAbility_Quickfooted");
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
                    name: /districts 2/i,
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
                name: /a haunted path quest .* last lords .* chapter 1 .* step 2/i,
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
            within(getLandingCategoryIndex()).getByRole("button", {
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
                sections: [
                    {
                        title: "Unlocks",
                        lines: ["Force Treaty"],
                    },
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
        expect(within(detailPane).getByRole("heading", { name: "Unlocks" })).toBeInTheDocument();
        expect(within(detailPane).getByText("Force Treaty")).toBeInTheDocument();
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

    it("renders a compact faction package from exact outbound and reverse refs without promoting text-only mentions", async () => {
        const user = userEvent.setup();
        const entries: CodexEntry[] = [
            {
                exportKind: "factions",
                entryKey: "Faction_Aspect",
                displayName: "Faction_Aspect",
                descriptionLines: [
                    "Affinity: Aspects",
                    "Trait: Diplomat",
                    "Text-only actions and resources should stay in prose.",
                ],
                referenceKeys: [
                    "Population_Aspects",
                    "Unit_Sentry",
                    "Unit_Envoy",
                    "Tech_CommonRights",
                    "Hero_Polemephon",
                ],
            },
            {
                exportKind: "populations",
                entryKey: "Population_Aspects",
                displayName: "Aspects",
                descriptionLines: ["Calm diplomatic population."],
                referenceKeys: [],
            },
            {
                exportKind: "units",
                entryKey: "Unit_Sentry",
                displayName: "Sentry",
                descriptionLines: ["Protects the opening army."],
                referenceKeys: [],
            },
            {
                exportKind: "units",
                entryKey: "Unit_Envoy",
                displayName: "Envoy",
                descriptionLines: ["Supports treaty pressure."],
                referenceKeys: [],
            },
            {
                exportKind: "units",
                entryKey: "Unit_ReverseSpecialist",
                displayName: "Reverse Specialist",
                descriptionLines: ["Reverse unit that should not displace exact outbound core units."],
                referenceKeys: ["Faction_Aspect"],
            },
            {
                exportKind: "tech",
                entryKey: "Tech_CommonRights",
                displayName: "Common Rights",
                descriptionLines: ["Improves peaceful expansion."],
                referenceKeys: [],
            },
            ...["I", "II", "III", "IV", "V"].map((suffix) => ({
                exportKind: "tech",
                entryKey: `Tech_Aspect_${suffix}`,
                displayName: `Aspect Tech ${suffix}`,
                descriptionLines: [`Aspect tech ${suffix}.`],
                referenceKeys: ["Faction_Aspect"],
            })),
            {
                exportKind: "heroes",
                entryKey: "Hero_Polemephon",
                displayName: "Polemephon",
                descriptionLines: ["Faction hero."],
                referenceKeys: [],
            },
            {
                exportKind: "heroes",
                entryKey: "Hero_AspectDiplomat",
                displayName: "Aspect Diplomat",
                descriptionLines: ["Reverse faction hero."],
                referenceKeys: ["Faction_Aspect"],
            },
            ...["01", "02", "03", "04"].map((suffix) => ({
                exportKind: "quests",
                entryKey: `FactionQuest_Aspect_Chapter${suffix}_Step01`,
                displayName: suffix === "02" ? "Aspect Quest 01" : `Aspect Quest ${suffix}`,
                category: "MajorFaction",
                kind: "Quest",
                descriptionLines: [`Quest ${suffix}.`],
                referenceKeys: ["Faction_Aspect"],
            })),
            {
                exportKind: "councilors",
                entryKey: "Councilor_Aspect",
                displayName: "Aspect Speaker",
                descriptionLines: ["Council support."],
                referenceKeys: ["Faction_Aspect"],
            },
            {
                exportKind: "bonuses",
                entryKey: "Status_AspectCalm",
                displayName: "Aspect Calm",
                category: "Status",
                kind: "Status",
                descriptionLines: ["A public status."],
                referenceKeys: ["Faction_Aspect"],
            },
            {
                exportKind: "traits",
                entryKey: "Trait_Diplomat",
                displayName: "Diplomat",
                descriptionLines: ["Exact trait ref stays out of the package prototype."],
                referenceKeys: ["Faction_Aspect"],
            },
            {
                exportKind: "actions",
                entryKey: "Action_AspectParley",
                displayName: "Aspect Parley",
                descriptionLines: ["Exact action ref stays out of the package prototype."],
                referenceKeys: ["Faction_Aspect"],
            },
            {
                exportKind: "resources",
                entryKey: "Resource_Klax",
                displayName: "Klax",
                descriptionLines: ["Exact resource ref stays out of the package prototype."],
                referenceKeys: ["Faction_Aspect"],
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
            <MemoryRouter initialEntries={["/codex?entry=Faction_Aspect"]}>
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

        const detailPane = await screen.findByLabelText(/selected codex entry/i);
        const packageSection = within(detailPane).getByRole("region", { name: "Faction package" });
        expect(within(packageSection).getByText("Population")).toBeInTheDocument();
        expect(within(packageSection).getByText("Core Units")).toBeInTheDocument();
        expect(within(packageSection).getByText("Faction Techs")).toBeInTheDocument();
        expect(within(packageSection).getAllByText("Heroes").length).toBeGreaterThan(0);
        expect(within(packageSection).getByText("Questline")).toBeInTheDocument();
        expect(within(packageSection).getByText("Councilors")).toBeInTheDocument();
        expect(within(packageSection).getAllByText("Statuses").length).toBeGreaterThan(0);

        expect(within(packageSection).getByRole("button", { name: /Sentry/ })).toBeInTheDocument();
        expect(within(packageSection).getByRole("button", { name: /Envoy/ })).toBeInTheDocument();
        expect(within(packageSection).queryByRole("button", { name: /Reverse Specialist/ })).not.toBeInTheDocument();
        expect(within(packageSection).getByRole("button", { name: /Common Rights/ })).toBeInTheDocument();
        expect(within(packageSection).getByRole("button", { name: /Aspect Tech III/ })).toBeInTheDocument();
        expect(within(packageSection).queryByRole("button", { name: /Aspect Tech IV/ })).not.toBeInTheDocument();
        expect(within(packageSection).getByText("Showing 4 of 6 exact refs")).toBeInTheDocument();
        expect(within(packageSection).getAllByRole("button", { name: /Aspect Quest 01/ })).toHaveLength(1);
        expect(within(packageSection).getByRole("button", { name: /Aspect Quest 04/ })).toBeInTheDocument();
        expect(within(packageSection).getByText("Showing 3 of 4 exact refs")).toBeInTheDocument();
        expect(within(packageSection).queryByRole("button", { name: /^Diplomat\b/ })).not.toBeInTheDocument();
        expect(within(packageSection).queryByRole("button", { name: /^Aspect Parley\b/ })).not.toBeInTheDocument();
        expect(within(packageSection).queryByRole("button", { name: /^Klax\b/ })).not.toBeInTheDocument();

        const relatedSection = within(detailPane).getByRole("region", { name: /related entries/i });
        expect(within(relatedSection).getByRole("button", { name: /Sentry/ })).toBeInTheDocument();
        expect(within(relatedSection).getByRole("button", { name: /Common Rights/ })).toBeInTheDocument();

        await user.click(within(packageSection).getByRole("button", { name: /Sentry/ }));
        expect(await screen.findByTestId("location-probe")).toHaveTextContent("/codex?entry=Unit_Sentry");
    });

    it("uses associated unit labeling for sparse faction pages and keeps text-only mentions plain", async () => {
        const entries: CodexEntry[] = [
            {
                exportKind: "factions",
                entryKey: "Faction_Mukag",
                displayName: "Faction_Mukag",
                descriptionLines: [
                    "Affinity: Mukag",
                    "Trait: Ashen Dream",
                    "Action: Call the Mist",
                    "Resource: Glasssteel",
                ],
                referenceKeys: [],
            },
            {
                exportKind: "units",
                entryKey: "Unit_TahukGuard",
                displayName: "Tahuk Guard",
                descriptionLines: ["Defensive faction unit."],
                referenceKeys: ["Faction_Mukag"],
            },
            {
                exportKind: "tech",
                entryKey: "Tech_TahukRites",
                displayName: "Tahuk Rites",
                descriptionLines: ["Associated technology."],
                referenceKeys: ["Faction_Mukag"],
            },
            {
                exportKind: "quests",
                entryKey: "FactionQuest_Mukag_Chapter01_Step01",
                displayName: "Tahuk Quest",
                category: "MajorFaction",
                kind: "Quest",
                descriptionLines: ["First Tahuk quest."],
                referenceKeys: ["Faction_Mukag"],
            },
            {
                exportKind: "traits",
                entryKey: "Trait_AshenDream",
                displayName: "Ashen Dream",
                descriptionLines: ["Trait should not be promoted by text."],
                referenceKeys: [],
            },
            {
                exportKind: "actions",
                entryKey: "Action_CallTheMist",
                displayName: "Call the Mist",
                descriptionLines: ["Action should not be promoted by text."],
                referenceKeys: [],
            },
            {
                exportKind: "resources",
                entryKey: "Resource_Glasssteel",
                displayName: "Glasssteel",
                descriptionLines: ["Resource should not be promoted by text."],
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
            <MemoryRouter initialEntries={["/codex?entry=Faction_Mukag"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        const detailPane = await screen.findByLabelText(/selected codex entry/i);
        const packageSection = within(detailPane).getByRole("region", { name: "Faction package" });
        expect(within(packageSection).getByText("Associated Units")).toBeInTheDocument();
        expect(within(packageSection).queryByText("Core Units")).not.toBeInTheDocument();
        expect(within(packageSection).getByRole("button", { name: /Tahuk Guard/ })).toBeInTheDocument();
        expect(within(packageSection).getByRole("button", { name: /Tahuk Rites/ })).toBeInTheDocument();
        expect(within(packageSection).getByRole("button", { name: /Tahuk Quest/ })).toBeInTheDocument();
        expect(within(packageSection).queryByRole("button", { name: /Ashen Dream/ })).not.toBeInTheDocument();
        expect(within(packageSection).queryByRole("button", { name: /Call the Mist/ })).not.toBeInTheDocument();
        expect(within(packageSection).queryByRole("button", { name: /Glasssteel/ })).not.toBeInTheDocument();
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
        expect(screen.getByRole("button", { name: /build bridge actions applies to bridge construction/i }))
            .toBeInTheDocument();
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
        expect(screen.getByTestId("location-probe")).toHaveTextContent("/codex?entry=DistrictImprovement_MinorFaction_06");
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
        expect(screen.getByTestId("location-probe")).toHaveTextContent("/codex?entry=Unit_HoratioBeta");
    });

    it("renders metadata when descriptionLines is nullish after API normalization boundaries", async () => {
        const entries = [
            {
                exportKind: "actions",
                entryKey: "ActionTypeVisionExchange",
                displayName: "Vision Exchange",
                descriptionLines: null,
                referenceKeys: [],
                facts: [{ label: "Category", value: "Empire Action" }],
                sections: [
                    {
                        title: "Effects",
                        lines: ["Shares vision with another empire."],
                    },
                ],
            },
        ] as unknown as CodexEntry[];

        useCodexStore.setState({
            entries,
            entriesByKey: buildEntriesByKey(entries),
            entriesByKind: { actions: entries },
            entriesByKindKey: buildEntriesByKindKey(entries),
            loading: false,
            error: null,
        });

        render(
            <MemoryRouter initialEntries={["/codex?category=actions&entry=ActionTypeVisionExchange"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "Vision Exchange" })).toBeInTheDocument();
        expect(screen.getByText("Empire Action")).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Effects" })).toBeInTheDocument();
        expect(screen.getAllByText("Shares vision with another empire.").length).toBeGreaterThanOrEqual(1);
    });

    it("shows category-specific empty messaging for sparse action entries", async () => {
        const entries: CodexEntry[] = [
            {
                exportKind: "actions",
                entryKey: "ActionTypeNoPublicSummary",
                displayName: "No Public Summary",
                descriptionLines: [],
                referenceKeys: [],
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
            <MemoryRouter initialEntries={["/codex?category=actions&entry=ActionTypeNoPublicSummary"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "No Public Summary" })).toBeInTheDocument();
        expect(screen.getByText("No public gameplay summary has been added for this action yet.")).toBeInTheDocument();
        expect(screen.queryByText("No public description has been added for this entry yet.")).not.toBeInTheDocument();
    });

    it("flags action entries that only expose classification metadata", async () => {
        const entries: CodexEntry[] = [
            {
                exportKind: "actions",
                entryKey: "ActionTypeClassificationOnly",
                displayName: "Classification Only Action",
                category: "Empire Action",
                kind: "Action",
                descriptionLines: [],
                referenceKeys: [],
                facts: [
                    { label: "Category", value: "Empire Action" },
                    { label: "Kind", value: "Action" },
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
            <MemoryRouter initialEntries={["/codex?category=actions&entry=ActionTypeClassificationOnly"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "Classification Only Action" })).toBeInTheDocument();
        expect(screen.getByText("Empire Action")).toBeInTheDocument();
        expect(screen.getByText("No public gameplay summary has been added for this action yet.")).toBeInTheDocument();
    });

    it("browses and renders representative diplomatic treaty entries through generic metadata", async () => {
        const user = userEvent.setup();
        const entries: CodexEntry[] = [
            {
                exportKind: "diplomatictreaties",
                entryKey: "Treaty_VisionExchange",
                displayName: "Vision Exchange",
                category: "Beneficial Discovery",
                kind: "Diplomatic Treaty",
                descriptionLines: [
                    "Signing this Treaty will show each Empire the Tiles over which the other has vision.",
                ],
                referenceKeys: [],
                facts: [
                    { label: "Category", value: "Beneficial Discovery" },
                    { label: "Bilateral", value: "Yes" },
                    { label: "Duration", value: "30 turns" },
                    { label: "Kind", value: "Diplomatic Treaty" },
                ],
            },
            {
                exportKind: "diplomatictreaties",
                entryKey: "Declaration_OpenBorders",
                displayName: "Open Borders",
                category: "Beneficial Defense",
                kind: "Diplomatic Treaty",
                descriptionLines: [
                    "Signing this Treaty will open the borders between the two Empires.",
                ],
                referenceKeys: [],
                facts: [
                    { label: "Category", value: "Beneficial Defense" },
                    { label: "Bilateral", value: "Yes" },
                    { label: "Duration", value: "30 turns" },
                    { label: "Kind", value: "Diplomatic Treaty" },
                ],
                sections: [
                    {
                        title: "Effects",
                        lines: ["Units may enter allied territories without Public Opinion loss."],
                    },
                ],
            },
            {
                exportKind: "diplomatictreaties",
                entryKey: "Declaration_JustifiedWar",
                displayName: "Justified War",
                category: "War",
                kind: "Diplomatic Treaty",
                descriptionLines: [
                    "Declare a Justified War on this Empire for free.",
                ],
                referenceKeys: [],
                facts: [
                    { label: "Category", value: "War" },
                    { label: "Bilateral", value: "No" },
                    { label: "Kind", value: "Diplomatic Treaty" },
                ],
                sections: [
                    {
                        title: "Effects",
                        lines: ["Only available when Public Opinion reaches a very low threshold."],
                    },
                ],
            },
        ];

        useCodexStore.setState({
            entries,
            entriesByKey: buildEntriesByKey(entries),
            entriesByKind: { diplomatictreaties: entries },
            entriesByKindKey: buildEntriesByKindKey(entries),
            loading: false,
            error: null,
        });

        render(
            <MemoryRouter initialEntries={["/codex?category=diplomatictreaties&entry=Treaty_VisionExchange"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "Vision Exchange" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /all diplomatic treaties/i })).toBeInTheDocument();
        expect(screen.getByText("Diplomatic treaty dossier")).toBeInTheDocument();
        expect(screen.getByText("Beneficial Discovery")).toBeInTheDocument();
        expect(screen.getByText("30 turns")).toBeInTheDocument();

        const resultsPane = screen.getByRole("complementary", { name: /codex results/i });
        await user.click(within(resultsPane).getByRole("button", { name: /open borders/i }));
        expect(await screen.findByRole("heading", { name: "Open Borders" })).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Effects" })).toBeInTheDocument();
        expect(screen.getAllByText("Units may enter allied territories without Public Opinion loss.").length)
            .toBeGreaterThanOrEqual(1);

        await user.click(within(resultsPane).getByRole("button", { name: /justified war/i }));
        expect(await screen.findByRole("heading", { name: "Justified War" })).toBeInTheDocument();
        expect(screen.getByText("War")).toBeInTheDocument();
        expect(screen.getByText("One-sided")).toBeInTheDocument();
    });

    it("renders exact Diplomatic Treaty applied Status refs as compact mechanics summaries", async () => {
        const user = userEvent.setup();
        const entries: CodexEntry[] = [
            {
                exportKind: "diplomatictreaties",
                entryKey: "Declaration_CloseBorders",
                displayName: "Close Borders",
                category: "Hostile Defense",
                kind: "Diplomatic Treaty",
                descriptionLines: [],
                referenceKeys: ["Status_PublicOpinion_YouClosedBorders"],
                facts: [
                    { label: "Category", value: "Hostile Defense" },
                    { label: "Participation", value: "One-sided" },
                    { label: "Kind", value: "Diplomatic Treaty" },
                ],
                sections: [
                    {
                        title: "Applied statuses",
                        items: [
                            {
                                label: "Closed Borders declared",
                                referenceKey: "Status_PublicOpinion_YouClosedBorders",
                                facts: [{ label: "Applies to", value: "Other empire" }],
                                lines: [],
                            },
                        ],
                    },
                ],
                publicContextKeys: ["Status_PublicOpinion_YouClosedBorders"],
            },
            {
                exportKind: "diplomatictreaties",
                entryKey: "Declaration_MissingStatus",
                displayName: "Missing Status Treaty",
                category: "Hostile Defense",
                kind: "Diplomatic Treaty",
                descriptionLines: [],
                referenceKeys: ["Status_Missing"],
                sections: [
                    {
                        title: "Applied statuses",
                        items: [
                            {
                                label: "Mystery Status",
                                referenceKey: "Status_Missing",
                                facts: [{ label: "Applies to", value: "Other empire" }],
                                lines: [],
                            },
                        ],
                    },
                ],
                publicContextKeys: ["Status_Missing"],
            },
            {
                exportKind: "statuses",
                entryKey: "Status_PublicOpinion_YouClosedBorders",
                displayName: "Closed Borders declared",
                category: "Status",
                kind: "Status",
                descriptionLines: [],
                referenceKeys: [],
                facts: [
                    { label: "Scope", value: "Diplomatic Ambassy" },
                    { label: "Duration", value: "10 turns" },
                    { label: "Kind", value: "Status" },
                ],
                sections: [
                    {
                        title: "Status mechanics",
                        items: [
                            {
                                label: "Public Opinion",
                                facts: [
                                    { label: "Affected stat", value: "Public Opinion" },
                                    { label: "Change", value: "-25" },
                                ],
                                lines: ["-25 [PublicOpinion] Public Opinion"],
                            },
                        ],
                    },
                ],
            },
        ];

        useCodexStore.setState({
            entries,
            entriesByKey: buildEntriesByKey(entries),
            entriesByKind: {
                diplomatictreaties: entries.filter((entry) => entry.exportKind === "diplomatictreaties"),
                statuses: entries.filter((entry) => entry.exportKind === "statuses"),
            },
            entriesByKindKey: buildEntriesByKindKey(entries),
            loading: false,
            error: null,
        });

        render(
            <MemoryRouter initialEntries={["/codex?category=diplomatictreaties&entry=Declaration_CloseBorders"]}>
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

        expect(await screen.findByRole("heading", { name: "Close Borders" })).toBeInTheDocument();

        const statusSummary = screen.getByRole("button", {
            name: "Closed Borders declared Diplomatic Ambassy / 10 turns -25 Public Opinion",
        });
        expect(statusSummary).toHaveClass("codex-statusTarget");
        expect(statusSummary).not.toHaveTextContent("[PublicOpinion]");

        const detailPane = screen.getByRole("region", { name: "Selected codex entry" });
        expect(within(detailPane).getByText("Related entries")).toBeInTheDocument();
        expect(within(detailPane).getByText("Statuses")).toBeInTheDocument();

        await user.click(statusSummary);
        expect(screen.getByTestId("location-probe")).toHaveTextContent("/codex?entry=Status_PublicOpinion_YouClosedBorders");

        const resultsPane = screen.getByRole("complementary", { name: /codex results/i });
        await user.click(within(resultsPane).getByRole("button", { name: /missing status treaty/i }));
        expect(await screen.findByRole("heading", { name: "Missing Status Treaty" })).toBeInTheDocument();
        expect(screen.getByText("Mystery Status")).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /Mystery Status.*Public Opinion/i })).not.toBeInTheDocument();
    });

    it("browses and renders representative action entries with null descriptions", async () => {
        const user = userEvent.setup();
        const entries: CodexEntry[] = [
            {
                exportKind: "actions",
                entryKey: "ActionTypeBuildBridge",
                displayName: "Build Bridge",
                category: "Action",
                kind: "Action",
                descriptionLines: [],
                referenceKeys: [],
                facts: [
                    { label: "Reference key", value: "ActionTypeBuildBridge" },
                    { label: "Kind", value: "Action" },
                    { label: "Category", value: "Action" },
                ],
                sections: [
                    {
                        title: "Cost modifiers",
                        items: [
                            {
                                label: "Turn cost multiplier",
                                facts: [
                                    { label: "Cost type", value: "Turn" },
                                    { label: "Operation", value: "Mult" },
                                    { label: "Value", value: "0.50" },
                                ],
                                lines: ["Temporary Bridge takes less time to build."],
                            },
                        ],
                    },
                ],
            },
            {
                exportKind: "actions",
                entryKey: "ActionTypeBuildDam",
                displayName: "Build Dam",
                category: "Action",
                kind: "Action",
                descriptionLines: [],
                referenceKeys: [],
                facts: [
                    { label: "Reference key", value: "ActionTypeBuildDam" },
                    { label: "Kind", value: "Action" },
                    { label: "Category", value: "Action" },
                ],
                sections: [
                    {
                        title: "Cost modifiers",
                        items: [
                            {
                                label: "Money cost multiplier",
                                facts: [
                                    { label: "Cost type", value: "Money" },
                                    { label: "Operation", value: "Mult" },
                                    { label: "Value", value: "0.90" },
                                ],
                                lines: ["Reduces the [DustColored] Dust cost to build Dams."],
                            },
                        ],
                    },
                ],
            },
            {
                exportKind: "actions",
                entryKey: "FactionActionTypeMukag_MonsoonFestival",
                displayName: "Mukag Monsoon Festival",
                category: "Faction Action",
                kind: "Faction Action",
                descriptionLines: [],
                referenceKeys: [],
                facts: [
                    { label: "Reference key", value: "FactionActionTypeMukag_MonsoonFestival" },
                    { label: "Kind", value: "Faction Action" },
                    { label: "Category", value: "Faction Action" },
                ],
            },
            {
                exportKind: "actions",
                entryKey: "EmpireActionTypeMukag_Light01",
                displayName: "Mukag Light01",
                category: "Empire Action",
                kind: "Empire Action",
                descriptionLines: [],
                referenceKeys: [],
                facts: [
                    { label: "Reference key", value: "EmpireActionTypeMukag_Light01" },
                    { label: "Kind", value: "Empire Action" },
                    { label: "Category", value: "Empire Action" },
                    { label: "UI category", value: "Light" },
                ],
                sections: [
                    {
                        title: "Action mechanics",
                        lines: ["Static formulas are shown from public-safe DB/RPN relationships."],
                        items: [
                            {
                                label: "Empire project cost",
                                facts: [
                                    { label: "Value type", value: "Science" },
                                    { label: "Formula", value: "10 + 30 * SGELevel" },
                                ],
                                lines: ["Empire project resource cost before applicable cost modifiers."],
                            },
                            {
                                label: "Population added",
                                facts: [
                                    { label: "Value type", value: "Population" },
                                    { label: "Formula", value: "1" },
                                ],
                                lines: ["Population units added to the related settlement."],
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
        const codexHeader = document.querySelector(".codex-header") as HTMLElement;
        expect(codexHeader.querySelector(".codex-pageTitle")).not.toBeInTheDocument();
        expect(within(codexHeader).queryByRole("heading", { name: "Actions" })).not.toBeInTheDocument();
        expect(within(codexHeader).queryByRole("heading", { name: "Build Bridge" })).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: /all actions/i })).toBeInTheDocument();
        expect(screen.getByText("Action dossier")).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Cost modifiers" })).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Turn cost multiplier" })).toBeInTheDocument();
        expect(screen.queryByText("Reference key")).not.toBeInTheDocument();
        expect(screen.queryByText("ActionTypeBuildBridge")).not.toBeInTheDocument();
        expect(screen.queryByText("No public description has been added for this entry yet.")).not.toBeInTheDocument();

        const resultsPane = screen.getByRole("complementary", { name: /codex results/i });
        await user.click(within(resultsPane).getByRole("button", { name: /build dam/i }));
        expect(await screen.findByRole("heading", { name: "Build Dam" })).toBeInTheDocument();
        expect(screen.getByText("0.90")).toBeInTheDocument();
        expect(screen.getAllByText(/Reduces the/).length).toBeGreaterThanOrEqual(1);

        await user.click(within(resultsPane).getByRole("button", { name: /mukag monsoon festival/i }));
        expect(await screen.findByRole("heading", { name: "Mukag Monsoon Festival" })).toBeInTheDocument();
        expect(within(screen.getByRole("region", { name: /selected codex entry/i }))
            .getAllByText("Faction Action").length).toBeGreaterThanOrEqual(1);

        await user.click(within(resultsPane).getByRole("button", { name: /mukag light01/i }));
        expect(await screen.findByRole("heading", { name: "Mukag Light01" })).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Action mechanics" })).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Empire project cost" })).toBeInTheDocument();
        expect(screen.getByText("10 + 30 * SGELevel")).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Population added" })).toBeInTheDocument();
    });

    it("searches actions and diplomatic treaties through existing Codex search", async () => {
        const user = userEvent.setup();
        const entries: CodexEntry[] = [
            {
                exportKind: "actions",
                entryKey: "ActionTypeBuildBridge",
                displayName: "Build Bridge",
                descriptionLines: [],
                referenceKeys: [],
                facts: [{ label: "Kind", value: "Action" }],
                sections: [
                    {
                        title: "Action mechanics",
                        lines: [],
                        items: [
                            {
                                label: "Turn cost",
                                referenceKey: null,
                                facts: [{ label: "Cost", value: "2 turns" }],
                                lines: ["Builds a bridge over a river tile."],
                            },
                        ],
                    },
                ],
            },
            {
                exportKind: "diplomatictreaties",
                entryKey: "Declaration_JustifiedWar",
                displayName: "Justified War",
                descriptionLines: ["Declare a Justified War on this Empire for free."],
                referenceKeys: [],
                facts: [{ label: "Kind", value: "Diplomatic Treaty" }],
            },
        ];

        useCodexStore.setState({
            entries,
            entriesByKey: buildEntriesByKey(entries),
            entriesByKind: {
                actions: entries.filter((entry) => entry.exportKind === "actions"),
                diplomatictreaties: entries.filter((entry) => entry.exportKind === "diplomatictreaties"),
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

        const input = await screen.findByRole("combobox", { name: /search the encyclopedia/i });
        await user.type(input, "river tile");
        expect(await screen.findByRole("button", { name: /build bridge/i })).toBeInTheDocument();
        expect(input).toHaveAttribute("aria-autocomplete", "none");
        expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
        expect(within(getCategoryToolbar()).getByRole("button", { name: /all/i }))
            .toHaveAttribute("aria-pressed", "true");

        await user.clear(input);
        await user.type(input, "justified");
        expect(await screen.findByRole("button", { name: /justified war/i })).toBeInTheDocument();
        const resultsPane = screen.getByRole("complementary", { name: /codex results/i });
        expect(within(resultsPane).getByText("Diplomatic Treaties")).toBeInTheDocument();

        await user.clear(input);
        await user.type(input, "ActionTypeBuildBridge");
        expect(await screen.findByRole("button", { name: /build bridge/i })).toBeInTheDocument();
        expect(within(resultsPane).getByText("Actions")).toBeInTheDocument();
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
        const dossier = screen.getByText("Hero dossier").closest("section");
        expect(dossier).not.toBeNull();
        expect(within(dossier!).getByText("Faction")).toBeInTheDocument();
        expect(within(dossier!).getByText("Hero")).toBeInTheDocument();
        expect(within(dossier!).getByText("Class")).toBeInTheDocument();
        expect(within(dossier!).getByText("Archer")).toBeInTheDocument();
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
        expect(screen.getByRole("button", { name: "Tahuk Factions / Tahuk Affinity: Tahuk" }))
            .toBeInTheDocument();
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
        expect(screen.getAllByText("Governor").length).toBeGreaterThan(0);
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
