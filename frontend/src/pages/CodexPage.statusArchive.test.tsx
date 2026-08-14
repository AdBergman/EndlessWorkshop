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

describe("CodexPage status archive", () => {
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

    it("renders Status overview metadata from exported facts with a Scope rail", async () => {
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
                    { label: "Polarity", value: "Malus" },
                    { label: "Status type", value: "Public Opinion" },
                ],
                sections: [
                    {
                        title: "Status mechanics",
                        lines: ["-25 [PublicOpinion] Public Opinion"],
                        items: [{
                            label: "Public Opinion",
                            facts: [
                                { label: "Stat", value: "Public Opinion" },
                                { label: "Value", value: "-25" },
                            ],
                        }],
                    },
                    {
                        title: "Effects",
                        lines: ["Diplomatic pressure while borders are closed."],
                    },
                ],
            },
            {
                exportKind: "statuses",
                entryKey: "Status_UnitDurationNameOnly",
                displayName: "Unit 10 turns Name Only",
                descriptionLines: ["Unit scope and 10 turns appear in prose only."],
                referenceKeys: [],
                facts: [
                    { label: "Scope", value: "Unit" },
                    { label: "Duration", value: "1 turns" },
                ],
            },
            {
                exportKind: "statuses",
                entryKey: "Status_Unit_Rich",
                displayName: "Rich Unit Status",
                descriptionLines: [],
                referenceKeys: [],
                facts: [
                    { label: "Scope", value: "Unit" },
                ],
                sections: [
                    {
                        title: "Status mechanics",
                        items: [
                            {
                                label: "Damage",
                                lines: ["+25% [Damage] Damage"],
                                facts: [
                                    { label: "Stat", value: "Damage" },
                                    { label: "Value", value: "+25%" },
                                ],
                            },
                            {
                                label: "Critical",
                                lines: ["+20% [Focus] Critical"],
                                facts: [
                                    { label: "Stat", value: "Critical" },
                                    { label: "Value", value: "+20%" },
                                ],
                            },
                            {
                                label: "Action Token",
                                lines: ["Disables Action Token"],
                            },
                            {
                                label: "Movement Points",
                                lines: ["Disables [MovementPoints] Movement Points"],
                            },
                        ],
                    },
                ],
            },
            {
                exportKind: "statuses",
                entryKey: "Status_City_EffectsOnly",
                displayName: "Effects Only City Status",
                descriptionLines: [],
                referenceKeys: [],
                facts: [
                    { label: "Scope", value: "City" },
                ],
                sections: [
                    {
                        title: "Effects",
                        lines: ["Will greatly improve Approval of this City."],
                    },
                ],
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
        expect(screen.getByLabelText("Status archive filters")).toBeInTheDocument();
        expect(screen.queryByLabelText("Codex results")).not.toBeInTheDocument();
        const statusFilters = screen.getByLabelText("Statuses filters");
        const scopeGroup = within(statusFilters).getByRole("group", { name: "Scope" });
        expect(within(scopeGroup).getByRole("button", { name: /other\s+4/i })).toBeInTheDocument();
        expect(within(scopeGroup).queryByRole("button", { name: /diplomacy\s+1/i })).not.toBeInTheDocument();
        expect(within(scopeGroup).queryByRole("button", { name: /unit\s+2/i })).not.toBeInTheDocument();

        const statusesOverview = screen.getByLabelText("Statuses overview");
        const overviewRow = within(statusesOverview).getByRole("button", { name: /public opinion status/i });
        expect(overviewRow.querySelector("img.codex-kindIcon--summaryEntry")).not.toBeInTheDocument();
        const effectPreview = within(overviewRow).getByLabelText("Status effect preview");
        expect(effectPreview).toHaveTextContent("-25");
        expect(effectPreview).toHaveTextContent("Public Opinion");
        expect(effectPreview).not.toHaveTextContent("Diplomatic pressure while borders are closed.");
        expect(effectPreview.querySelectorAll(".codex-summaryList__statusEffectLine")).toHaveLength(1);
        const metadata = within(overviewRow).getByLabelText("Status metadata");
        expect(metadata.closest(".codex-summaryList__titleLine")).toBeTruthy();
        expect(Boolean(metadata.compareDocumentPosition(effectPreview) & Node.DOCUMENT_POSITION_FOLLOWING))
            .toBe(true);
        expect(within(metadata).getByText("Diplomacy")).toBeInTheDocument();
        expect(within(metadata).getByText("10 turns")).toBeInTheDocument();
        expect(within(metadata).getByText("Malus")).toBeInTheDocument();
        expect(within(metadata).queryByText("Public Opinion")).not.toBeInTheDocument();
        expect(within(effectPreview).queryByText("Diplomacy")).not.toBeInTheDocument();
        expect(within(effectPreview).queryByText("10 turns")).not.toBeInTheDocument();
        expect(within(effectPreview).queryByText("Malus")).not.toBeInTheDocument();
        expect(within(overviewRow).queryByText("Status type")).not.toBeInTheDocument();

        const thinOverviewRow = within(statusesOverview).getByRole("button", { name: /unit 10 turns name only/i });
        expect(within(thinOverviewRow).getByText("No public mechanics exported yet.")).toBeInTheDocument();
        const thinMetadata = within(thinOverviewRow).getByLabelText("Status metadata");
        expect(within(thinMetadata).getByText("Unit")).toBeInTheDocument();
        expect(within(thinMetadata).getByText("1 turn")).toBeInTheDocument();

        const richOverviewRow = within(statusesOverview).getByRole("button", { name: /rich unit status/i });
        const richPreview = within(richOverviewRow).getByLabelText("Status effect preview");
        expect(richPreview).toHaveTextContent("Damage");
        expect(richPreview).toHaveTextContent("Critical");
        expect(richPreview).toHaveTextContent("Disables Action Token");
        expect(richPreview).not.toHaveTextContent("Disables Movement Points");
        expect(richPreview.querySelectorAll(".codex-summaryList__statusEffectLine")).toHaveLength(3);

        const effectsOnlyRow = within(statusesOverview).getByRole("button", { name: /effects only city status/i });
        const effectsOnlyPreview = within(effectsOnlyRow).getByLabelText("Status effect preview");
        expect(effectsOnlyPreview).toHaveTextContent("Will greatly improve Approval of this City.");
        const effectsOnlyMetadata = within(effectsOnlyRow).getByLabelText("Status metadata");
        expect(effectsOnlyMetadata.closest(".codex-summaryList__titleLine")).toBeTruthy();
        expect(within(effectsOnlyMetadata).getByText("City")).toBeInTheDocument();
        expect(within(effectsOnlyMetadata).queryByText(/turn/i)).not.toBeInTheDocument();
    });



    it("filters the Status archive by exported Scope only", async () => {
        const user = userEvent.setup();
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
                entryKey: "Status_City_Ahead",
                displayName: "Ahead in the Polls",
                descriptionLines: ["A city approval status."],
                referenceKeys: [],
                facts: [
                    { label: "Scope", value: "City" },
                    { label: "Duration", value: "10 turns" },
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
                entryKey: "Status_Unit_Shielded",
                displayName: "Shielded",
                descriptionLines: ["A unit status."],
                referenceKeys: [],
                facts: [
                    { label: "Scope", value: "Unit" },
                ],
            },
            {
                exportKind: "statuses",
                entryKey: "Status_Unit_Brace",
                displayName: "Brace",
                descriptionLines: ["Another unit status."],
                referenceKeys: [],
                facts: [
                    { label: "Scope", value: "Unit" },
                ],
            },
            {
                exportKind: "statuses",
                entryKey: "Status_Unit_Guarded",
                displayName: "Guarded",
                descriptionLines: ["Another unit status."],
                referenceKeys: [],
                facts: [
                    { label: "Scope", value: "Unit" },
                ],
            },
            {
                exportKind: "statuses",
                entryKey: "Status_Unit_Focused",
                displayName: "Focused",
                descriptionLines: ["Another unit status."],
                referenceKeys: [],
                facts: [
                    { label: "Scope", value: "Unit" },
                ],
            },
            {
                exportKind: "statuses",
                entryKey: "Status_City_Watch",
                displayName: "City Watch",
                descriptionLines: ["Another city status."],
                referenceKeys: [],
                facts: [
                    { label: "Scope", value: "City" },
                ],
            },
            {
                exportKind: "statuses",
                entryKey: "Status_City_Festival",
                displayName: "Festival",
                descriptionLines: ["Another city status."],
                referenceKeys: [],
                facts: [
                    { label: "Scope", value: "City" },
                ],
            },
            {
                exportKind: "statuses",
                entryKey: "Status_City_Garrison",
                displayName: "Garrisoned",
                descriptionLines: ["Another city status."],
                referenceKeys: [],
                facts: [
                    { label: "Scope", value: "City" },
                ],
            },
            {
                exportKind: "statuses",
                entryKey: "Status_City_Riot",
                displayName: "Riot Watch",
                descriptionLines: ["Another city status."],
                referenceKeys: [],
                facts: [
                    { label: "Scope", value: "City" },
                ],
            },
            {
                exportKind: "statuses",
                entryKey: "Status_Diplomacy_Rumor",
                displayName: "Rumor Campaign",
                descriptionLines: ["Another diplomacy status."],
                referenceKeys: [],
                facts: [
                    { label: "Scope", value: "Diplomatic Ambassy" },
                ],
            },
            {
                exportKind: "statuses",
                entryKey: "Status_Diplomacy_Embargo",
                displayName: "Embargo Pressure",
                descriptionLines: ["Another diplomacy status."],
                referenceKeys: [],
                facts: [
                    { label: "Scope", value: "Diplomatic Ambassy" },
                ],
            },
            {
                exportKind: "statuses",
                entryKey: "Status_Diplomacy_Favor",
                displayName: "Diplomatic Favor",
                descriptionLines: ["Another diplomacy status."],
                referenceKeys: [],
                facts: [
                    { label: "Scope", value: "Diplomatic Ambassy" },
                ],
            },
            {
                exportKind: "statuses",
                entryKey: "Status_Diplomacy_Grievance",
                displayName: "Grievance",
                descriptionLines: ["Another diplomacy status."],
                referenceKeys: [],
                facts: [
                    { label: "Scope", value: "Diplomatic Ambassy" },
                ],
            },
            {
                exportKind: "statuses",
                entryKey: "Status_Army_Routed",
                displayName: "Routed Army",
                descriptionLines: ["A small-scope army status."],
                referenceKeys: [],
                facts: [
                    { label: "Scope", value: "Army" },
                ],
            },
            {
                exportKind: "statuses",
                entryKey: "Status_Population_Unrest",
                displayName: "Population Unrest",
                descriptionLines: ["A small-scope population status."],
                referenceKeys: [],
                facts: [
                    { label: "Scope", value: "Population" },
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
                    <Route
                        path="/codex"
                        element={(
                            <>
                                <CodexPage />
                                <LocationProbe />
                            </>
                        )}
                    />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "All Statuses" })).toBeInTheDocument();
        expect(screen.getByLabelText("Status archive filters")).toBeInTheDocument();
        expect(screen.queryByLabelText("Codex results")).not.toBeInTheDocument();
        const filters = screen.getByLabelText("Statuses filters");
        const scopeGroup = within(filters).getByRole("group", { name: "Scope" });
        expect(within(scopeGroup).getByRole("button", { name: /diplomacy\s+5/i })).toBeInTheDocument();
        expect(within(scopeGroup).getByRole("button", { name: /city\s+5/i })).toBeInTheDocument();
        expect(within(scopeGroup).getByRole("button", { name: /unit\s+5/i })).toBeInTheDocument();
        expect(within(scopeGroup).getByRole("button", { name: /other\s+2/i })).toBeInTheDocument();
        expect(within(scopeGroup).queryByRole("button", { name: /army\s+1/i })).not.toBeInTheDocument();
        expect(within(scopeGroup).queryByRole("button", { name: /population\s+1/i })).not.toBeInTheDocument();
        expect(within(scopeGroup).queryByRole("button", { name: /unit 10 turns prose only/i }))
            .not.toBeInTheDocument();

        const statusesOverview = screen.getByLabelText("Statuses overview");
        expect(within(statusesOverview).getByRole("button", { name: /public opinion status/i })).toBeInTheDocument();
        expect(within(statusesOverview).getByRole("button", { name: /ahead in the polls/i })).toBeInTheDocument();
        expect(within(statusesOverview).getByRole("button", { name: /hobbled/i })).toBeInTheDocument();
        expect(within(statusesOverview).getByRole("button", { name: /shielded/i })).toBeInTheDocument();
        expect(within(statusesOverview).getByRole("button", { name: /unit 10 turns prose only/i }))
            .toBeInTheDocument();

        await user.click(within(scopeGroup).getByRole("button", { name: /other\s+2/i }));

        expect(within(scopeGroup).getByRole("button", { name: /other\s+2/i }))
            .toHaveAttribute("aria-pressed", "true");
        expect(within(statusesOverview).getByRole("button", { name: /routed army/i })).toBeInTheDocument();
        expect(within(statusesOverview).getByRole("button", { name: /population unrest/i })).toBeInTheDocument();
        expect(within(statusesOverview).queryByRole("button", { name: /hobbled/i })).not.toBeInTheDocument();
        expect(within(statusesOverview).queryByRole("button", { name: /public opinion status/i }))
            .not.toBeInTheDocument();

        await user.click(within(scopeGroup).getByRole("button", { name: /other\s+2/i }));

        expect(within(statusesOverview).getByRole("button", { name: /public opinion status/i })).toBeInTheDocument();
        expect(within(statusesOverview).getByRole("button", { name: /unit 10 turns prose only/i }))
            .toBeInTheDocument();

        await user.click(within(scopeGroup).getByRole("button", { name: /unit\s+5/i }));

        expect(within(scopeGroup).getByRole("button", { name: /unit\s+5/i }))
            .toHaveAttribute("aria-pressed", "true");
        expect(within(statusesOverview).getByRole("button", { name: /hobbled/i })).toBeInTheDocument();
        expect(within(statusesOverview).getByRole("button", { name: /shielded/i })).toBeInTheDocument();
        expect(within(statusesOverview).queryByRole("button", { name: /public opinion status/i }))
            .not.toBeInTheDocument();
        expect(within(statusesOverview).queryByRole("button", { name: /unit 10 turns prose only/i }))
            .not.toBeInTheDocument();

        await user.click(within(scopeGroup).getByRole("button", { name: /unit\s+5/i }));

        expect(within(statusesOverview).getByRole("button", { name: /public opinion status/i })).toBeInTheDocument();
        expect(within(statusesOverview).getByRole("button", { name: /unit 10 turns prose only/i }))
            .toBeInTheDocument();

        await user.click(within(scopeGroup).getByRole("button", { name: /city\s+5/i }));
        expect(within(statusesOverview).getByRole("button", { name: /ahead in the polls/i })).toBeInTheDocument();
        expect(within(statusesOverview).queryByRole("button", { name: /hobbled/i })).not.toBeInTheDocument();

        await user.click(within(filters).getByRole("button", { name: "Clear" }));
        expect(within(statusesOverview).getByRole("button", { name: /hobbled/i })).toBeInTheDocument();

        await user.click(within(scopeGroup).getByRole("button", { name: /unit\s+5/i }));
        await user.type(screen.getByRole("combobox", { name: /search the encyclopedia/i }), "hobbled");

        expect(within(statusesOverview).getByRole("button", { name: /hobbled/i })).toBeInTheDocument();
        expect(within(statusesOverview).queryByRole("button", { name: /shielded/i })).not.toBeInTheDocument();
        expect(within(statusesOverview).queryByRole("button", { name: /ahead in the polls/i }))
            .not.toBeInTheDocument();
        expect(screen.getByTestId("location-probe")).toHaveTextContent("/codex?category=statuses");
    });



    it("returns from Status detail routes to the Status archive when Scope filters change", async () => {
        const user = userEvent.setup();
        seedCodexEntries([
            {
                exportKind: "statuses",
                entryKey: "Status_Unit_Hobbled",
                displayName: "Hobbled",
                descriptionLines: ["A unit status."],
                referenceKeys: [],
                facts: [
                    { label: "Scope", value: "Unit" },
                ],
            },
            {
                exportKind: "statuses",
                entryKey: "Status_City_Ahead",
                displayName: "Ahead in the Polls",
                descriptionLines: ["A city approval status."],
                referenceKeys: [],
                facts: [
                    { label: "Scope", value: "City" },
                ],
            },
            {
                exportKind: "statuses",
                entryKey: "Status_City_Watch",
                displayName: "City Watch",
                descriptionLines: ["Another city status."],
                referenceKeys: [],
                facts: [
                    { label: "Scope", value: "City" },
                ],
            },
            {
                exportKind: "statuses",
                entryKey: "Status_City_Festival",
                displayName: "Festival",
                descriptionLines: ["Another city status."],
                referenceKeys: [],
                facts: [
                    { label: "Scope", value: "City" },
                ],
            },
            {
                exportKind: "statuses",
                entryKey: "Status_City_Garrison",
                displayName: "Garrisoned",
                descriptionLines: ["Another city status."],
                referenceKeys: [],
                facts: [
                    { label: "Scope", value: "City" },
                ],
            },
            {
                exportKind: "statuses",
                entryKey: "Status_City_Riot",
                displayName: "Riot Watch",
                descriptionLines: ["Another city status."],
                referenceKeys: [],
                facts: [
                    { label: "Scope", value: "City" },
                ],
            },
        ]);

        render(
            <MemoryRouter initialEntries={["/codex?category=statuses&entry=Status_Unit_Hobbled"]}>
                <Routes>
                    <Route
                        path="/codex"
                        element={(
                            <>
                                <CodexPage />
                                <LocationProbe />
                            </>
                        )}
                    />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "Hobbled" })).toBeInTheDocument();
        const filters = screen.getByLabelText("Statuses filters");
        const scopeGroup = within(filters).getByRole("group", { name: "Scope" });

        await user.click(within(scopeGroup).getByRole("button", { name: /city\s+5/i }));

        expect(await screen.findByRole("heading", { name: "All Statuses" })).toBeInTheDocument();
        expect(screen.getByTestId("location-probe")).toHaveTextContent("/codex?category=statuses");
        const statusesOverview = screen.getByLabelText("Statuses overview");
        expect(within(statusesOverview).getByRole("button", { name: /ahead in the polls/i })).toBeInTheDocument();
        expect(within(statusesOverview).queryByRole("button", { name: /hobbled/i })).not.toBeInTheDocument();

        await user.click(within(filters).getByRole("button", { name: "Clear" }));

        expect(within(statusesOverview).getByRole("button", { name: /hobbled/i })).toBeInTheDocument();
        expect(screen.getByTestId("location-probe")).toHaveTextContent("/codex?category=statuses");
    });



    it("does not show empty exact relationship groups on Status details or source hints on Status archive rows", async () => {
        seedCodexEntries([
            {
                exportKind: "statuses",
                entryKey: "Status_Unit_Standalone",
                displayName: "Standalone Status",
                category: "Status",
                kind: "Status",
                descriptionLines: [],
                referenceKeys: [],
                facts: [{ label: "Scope", value: "Unit" }],
                sections: [{ title: "Status mechanics", lines: ["+10 [Defense] Defense"] }],
            },
        ]);

        render(
            <MemoryRouter initialEntries={["/codex?category=statuses&entry=Status_Unit_Standalone"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "Standalone Status" })).toBeInTheDocument();
        expect(screen.queryByRole("region", { name: /exact status references/i })).not.toBeInTheDocument();

        cleanup();

        render(
            <MemoryRouter initialEntries={["/codex?category=statuses"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        const statusesOverview = await screen.findByLabelText("Statuses overview");
        const row = within(statusesOverview).getByRole("button", { name: /standalone status/i });
        expect(within(row).queryByText(/exact status references/i)).not.toBeInTheDocument();
        expect(within(row).queryByText(/referenced by/i)).not.toBeInTheDocument();
    });




});
