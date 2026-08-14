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

describe("CodexPage category visibility", () => {
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

    it("hides local-only categories from production navigation while keeping direct routes available", async () => {
        vi.stubEnv("DEV", false);

        const entries: CodexEntry[] = [
            {
                exportKind: "victoryconditions",
                entryKey: "VictoryCondition_A",
                displayName: "Victory Condition A",
                descriptionLines: ["Hold a decisive advantage."],
                referenceKeys: [],
            },
            {
                exportKind: "victorypaths",
                entryKey: "VictoryPath_A",
                displayName: "Victory Path A",
                descriptionLines: ["Pursue a strategic victory path."],
                referenceKeys: [],
            },
            {
                exportKind: "abilities",
                entryKey: "Ability_A",
                displayName: "Ability A",
                descriptionLines: [],
                referenceKeys: [],
            },
        ];
        seedCodexEntries(entries);

        render(
            <MemoryRouter initialEntries={["/codex"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        await screen.findByRole("heading", { name: "Encyclopedia Index" });
        const categoryLabels = getLandingCategoryLabels();
        expect(categoryLabels).toContain("Abilities");
        expect(categoryLabels).not.toContain("Victory Conditions");
        expect(categoryLabels).not.toContain("Victory Paths");

        cleanup();
        seedCodexEntries(entries);

        render(
            <MemoryRouter initialEntries={["/codex?category=victoryconditions"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "All Victory Conditions" })).toBeInTheDocument();
        expect(within(getCategoryToolbar()).queryByRole("button", { name: /victory conditions/i }))
            .not.toBeInTheDocument();
    });



    it("renders local-visible categories in a wrapping category shelf on category pages during development", async () => {
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
            .map((button) => button.querySelector("span")?.textContent?.trim());

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



    it("uses the same compact top panel shell for Abilities and generic categories", async () => {
        seedCodexEntries([
            {
                exportKind: "abilities",
                entryKey: "Ability_A",
                displayName: "Ability A",
                descriptionLines: [],
                referenceKeys: [],
            },
            {
                exportKind: "traits",
                entryKey: "Trait_A",
                displayName: "Trait A",
                descriptionLines: [],
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
        const abilityHeader = document.querySelector(".codex-header") as HTMLElement;
        const abilityShelf = document.querySelector(".codex-categoryShelf") as HTMLElement;
        expect(abilityHeader).toHaveClass("codex-header--compact");
        expect(abilityShelf).not.toHaveClass("codex-categoryShelf--abilityCatalog");

        cleanup();

        render(
            <MemoryRouter initialEntries={["/codex?category=traits"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "All Traits" })).toBeInTheDocument();
        const traitsHeader = document.querySelector(".codex-header") as HTMLElement;
        const traitsShelf = document.querySelector(".codex-categoryShelf") as HTMLElement;
        expect(traitsHeader.className).toBe(abilityHeader.className);
        expect(traitsShelf.className).toBe(abilityShelf.className);
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
        expect(screen.getByRole("complementary", { name: /tech archive filters/i })).toBeInTheDocument();
        expect(within(getCategoryToolbar()).getByRole("button", { name: /all/i }))
            .toHaveAttribute("aria-pressed", "false");
        expect(within(getCategoryToolbar()).getByRole("button", { name: /tech/i }))
            .toHaveAttribute("aria-pressed", "true");
        expect(screen.queryByRole("heading", { name: "Encyclopedia Index" })).not.toBeInTheDocument();
    });




});
