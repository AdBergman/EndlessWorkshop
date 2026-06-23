import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter, MemoryRouter, Route, Routes } from "react-router-dom";
import TopContainer from "@/components/TopContainer/TopContainer";
import CodexPage from "./CodexPage";
import { useCodexStore } from "@/stores/codexStore";
import { useDistrictStore } from "@/stores/districtStore";
import { useFactionStore } from "@/stores/factionStore";
import { useHeroStore } from "@/stores/heroStore";
import { useImprovementStore } from "@/stores/improvementStore";
import { useSkillStore } from "@/stores/skillStore";
import { useTechStore } from "@/stores/techStore";
import { useUnitStore } from "@/stores/unitStore";
import { buildEntriesByKey, buildEntriesByKindKey } from "@/lib/codex/codexRefs";
import { BackButton, LocationProbe, seedDefaultCodexStore } from "@/pages/testUtils/codexPageTestUtils";
import type {
    CodexEntry,
    District,
    Hero,
    HeroSkill,
    Improvement,
    RichFaction,
    Skills,
    SkillTier,
    SkillTree,
    Tech,
    Unit,
} from "@/types/dataTypes";

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

function getSummaryRowForButton(button: HTMLElement): HTMLElement {
    const row = button.closest(".codex-summaryList__item");
    if (!(row instanceof HTMLElement)) {
        throw new Error("Expected summary button to be inside a summary row.");
    }

    return row;
}

const richTech = (overrides: Partial<Tech>): Tech => ({
    techKey: "Tech_Current",
    name: "Current Tech",
    era: 1,
    type: "Discovery",
    unlocks: [],
    descriptionLines: [],
    prereq: null,
    factions: [],
    excludes: null,
    coords: { xPct: 0, yPct: 0 },
    ...overrides,
});

const richUnit = (overrides: Partial<Unit>): Unit => ({
    unitKey: "Unit_Current",
    displayName: "Current Unit",
    artId: null,
    faction: null,
    isMajorFaction: true,
    isHero: false,
    isChosen: false,
    spawnType: "Land",
    previousUnitKey: null,
    nextEvolutionUnitKeys: [],
    evolutionTierIndex: 0,
    unitClassKey: null,
    unitClassDisplayName: null,
    attackSkillKey: null,
    abilityKeys: [],
    descriptionLines: [],
    ...overrides,
});

const richDistrict = (overrides: Partial<District>): District => ({
    districtKey: "District_Current",
    displayName: "Current District",
    descriptionLines: [],
    unlockTechnologyKeys: [],
    levelUp: null,
    placementPrerequisites: null,
    ...overrides,
});

const richImprovement = (overrides: Partial<Improvement>): Improvement => ({
    improvementKey: "Improvement_Current",
    displayName: "Current Improvement",
    descriptionLines: [],
    unique: "City",
    cost: [],
    unlockTechnologyKeys: [],
    placementPrerequisites: null,
    ...overrides,
});

const richFaction = (overrides: Partial<RichFaction>): RichFaction => ({
    factionKey: "Faction_Aspect",
    publicDisplayName: "Aspects",
    lore: null,
    factionKind: "major",
    affinityKey: null,
    affinityType: null,
    traitKeys: [],
    populationKeys: [],
    unitKeys: [],
    baseUnitKeys: [],
    heroKeys: [],
    gatedTechnologyKeys: [],
    startingFactionQuestKey: null,
    specificQuestKeys: [],
    protectorateTraitKeys: [],
    ...overrides,
});

const heroFixture = (overrides: Partial<Hero>): Hero => ({
    unitKey: "Hero_Current",
    displayName: "Current Hero",
    faction: null,
    factionKey: null,
    isMajorFaction: true,
    heroKey: "Hero_Current",
    heroClassKey: "HeroClass_Archer",
    originKind: "majorFaction",
    originFactionKey: "Faction_Kin",
    minorFactionKey: null,
    unitClassKey: "UnitClass_Ranged_Hero",
    attackSkillKey: null,
    ownAbilityKeys: [],
    abilityKeys: [],
    combatAbilityKeys: [],
    tacticalAbilityKeys: [],
    passiveAbilityKeys: [],
    mechanicalAbilityKeys: [],
    classRuleAbilityKeys: [],
    hiddenHelperAbilityKeys: [],
    defaultSkillKeys: [],
    applicableSkillTreeKeys: [],
    descriptionLines: [],
    referenceKeys: [],
    ...overrides,
});

const heroSkillTree = (overrides: Partial<SkillTree>): SkillTree => ({
    treeKey: "HeroSkillTree_Archer",
    treeType: "Class",
    isHidden: false,
    tierPlacementKeys: ["HeroSkillTree_Archer::HeroSkillTier_Archer_1"],
    tierKeys: ["HeroSkillTier_Archer_1"],
    skillKeys: ["HeroSkill_Archer02"],
    referenceKeys: [],
    classPrerequisiteKey: null,
    factionPrerequisiteKey: null,
    ...overrides,
});

const heroSkillTier = (overrides: Partial<SkillTier>): SkillTier => ({
    tierPlacementKey: "HeroSkillTree_Archer::HeroSkillTier_Archer_1",
    tierKey: "HeroSkillTier_Archer_1",
    treeKey: "HeroSkillTree_Archer",
    treeType: "Class",
    tierIndex: 0,
    levelPrerequisite: 0,
    skillKeys: ["HeroSkill_Archer02"],
    referenceKeys: [],
    ...overrides,
});

const heroSkill = (overrides: Partial<HeroSkill>): HeroSkill => ({
    skillKey: "HeroSkill_Archer02",
    entryKey: "HeroSkill_Archer02",
    kind: "HeroSkill",
    displayName: "HeroSkill_Archer02",
    publicDisplayName: "Terrain Logistics",
    primaryAbilityKey: "UnitAbility_Hero_Archer02",
    descriptionLines: [],
    resolvedDisplayName: "Terrain Logistics",
    resolvedSummaryLines: ["Gain 5 [Experience] Experience to all Units of the Army"],
    resolvedMechanicKind: "reaction",
    resolvedMechanicTags: [],
    isObsolete: false,
    isActive: false,
    isPassive: true,
    placements: [],
    prerequisiteSkillKeys: [],
    inhibitedBySkillKeys: [],
    lockedBySkillKeys: [],
    effects: [],
    unitAbilityKeys: [],
    battleSkillKeys: [],
    battleAbilityKeys: [],
    descriptorKeys: [],
    unitAbilityEventKeys: [],
    rewardPerKillInBattleEffectKeys: [],
    statAffinityNames: [],
    defaultForHeroKeys: [],
    referenceKeys: [],
    ...overrides,
});

function seedRichUnits(units: Unit[]) {
    useUnitStore.setState({
        units,
        unitsByKey: units.reduce<Record<string, Unit>>((acc, unit) => {
            acc[unit.unitKey] = unit;
            return acc;
        }, {}),
        unitKeys: units.map((unit) => unit.unitKey),
        duplicateUnitKeys: [],
        loading: false,
        loaded: true,
        error: null,
    });
}

function seedRichDistricts(districts: District[]) {
    useDistrictStore.setState({
        districts,
        districtsByKey: districts.reduce<Record<string, District>>((acc, district) => {
            acc[district.districtKey] = district;
            return acc;
        }, {}),
        districtKeys: districts.map((district) => district.districtKey),
        duplicateDistrictKeys: [],
        loading: false,
        loaded: true,
        error: null,
    });
}

function seedRichImprovements(improvements: Improvement[]) {
    useImprovementStore.setState({
        improvements,
        improvementsByKey: improvements.reduce<Record<string, Improvement>>((acc, improvement) => {
            acc[improvement.improvementKey] = improvement;
            return acc;
        }, {}),
        improvementKeys: improvements.map((improvement) => improvement.improvementKey),
        duplicateImprovementKeys: [],
        loading: false,
        loaded: true,
        error: null,
    });
}

function seedRichFactions(factions: RichFaction[]) {
    useFactionStore.getState().replaceFactions(factions);
}

function seedHeroes(heroes: Hero[]) {
    useHeroStore.getState().replaceHeroes(heroes);
}

function seedSkills(skills: Partial<Skills>) {
    useSkillStore.getState().replaceSkills({
        skillTrees: [],
        skillTiers: [],
        skills: [],
        heroSkillDefaults: [],
        ...skills,
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
                { label: "Trait type", value: "Protectorate" },
            ],
            sections: [{ title: "Effects", lines: ["+3 [Defense] Defense on Unit"] }],
        },
        {
            exportKind: "traits",
            entryKey: "Trait_HarmoniousTactics",
            displayName: "Harmonious Tactics",
            category: "Faction",
            kind: "Trait",
            descriptionLines: [],
            referenceKeys: [],
            facts: [
                { label: "Kind", value: "Trait" },
                { label: "Trait type", value: "Faction" },
            ],
            sections: [{
                title: "Effects",
                lines: ["Allied Units get [Damage] Damage bonus until the end of the round."],
            }],
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

function seedActionArchiveEntries() {
    seedCodexEntries([
        {
            exportKind: "actions",
            entryKey: "ActionTypeBuildBridge",
            displayName: "Build Bridge",
            category: "Action",
            kind: "Action",
            descriptionLines: [],
            referenceKeys: [],
            facts: [
                { label: "Kind", value: "Action" },
                { label: "Category", value: "Action" },
            ],
            sections: [{
                title: "Action mechanics",
                items: [{
                    label: "Money cost multiplier",
                    facts: [
                        { label: "Affected cost", value: "Money" },
                        { label: "Modifier", value: "-100%" },
                    ],
                }],
            }],
        },
        {
            exportKind: "actions",
            entryKey: "ActionTypeKinBuildChosen",
            displayName: "Kin Build Chosen",
            category: "Faction Action",
            kind: "Faction Action",
            descriptionLines: [],
            referenceKeys: [],
            facts: [
                { label: "Kind", value: "Faction Action" },
                { label: "Category", value: "Faction Action" },
            ],
        },
        {
            exportKind: "actions",
            entryKey: "ActionTypeMukagLight01",
            displayName: "Mukag Light",
            category: "Empire Action",
            kind: "Empire Action",
            descriptionLines: [],
            referenceKeys: [],
            facts: [
                { label: "Kind", value: "Empire Action" },
                { label: "Category", value: "Empire Action" },
                { label: "UI category", value: "Light" },
            ],
        },
        {
            exportKind: "actions",
            entryKey: "ActionTypeRepairDistrict",
            displayName: "Repair District",
            category: "Constructible Action",
            kind: "Constructible Action",
            descriptionLines: [],
            referenceKeys: [],
            facts: [
                { label: "Kind", value: "Constructible Action" },
                { label: "Category", value: "Constructible Action" },
                { label: "Action type", value: "Repair District" },
            ],
        },
        {
            exportKind: "actions",
            entryKey: "ActionTypeTerraformationEnrich",
            displayName: "Terraformation Enrich",
            category: "Terraforming Action",
            kind: "Terraforming Action",
            descriptionLines: [],
            referenceKeys: [],
            facts: [
                { label: "Kind", value: "Terraforming Action" },
                { label: "Category", value: "Terraforming Action" },
                { label: "Action type", value: "Terraformation Enrich" },
            ],
        },
        {
            exportKind: "actions",
            entryKey: "ActionTypeMove",
            displayName: "Move",
            category: "Army Action",
            kind: "Army Action",
            descriptionLines: [],
            referenceKeys: [],
            facts: [
                { label: "Kind", value: "Army Action" },
                { label: "Category", value: "Army Action" },
            ],
        },
        {
            exportKind: "tech",
            entryKey: "Technology_Test",
            displayName: "Test Technology",
            descriptionLines: ["Unlocks a test technology."],
            referenceKeys: [],
        },
    ]);
}

describe("CodexPage", () => {
    beforeEach(() => {
        useCodexStore.getState().reset();
        useDistrictStore.getState().reset();
        useFactionStore.getState().reset();
        useHeroStore.getState().reset();
        useImprovementStore.getState().reset();
        useSkillStore.getState().reset();
        useTechStore.getState().reset();
        useUnitStore.getState().reset();
        seedRichDistricts([]);
        seedRichImprovements([]);
        seedRichFactions([]);
        seedHeroes([]);
        seedSkills({});
        seedDefaultCodexStore();
    });

    afterEach(() => {
        cleanup();
        vi.unstubAllEnvs();
        useCodexStore.getState().reset();
        useDistrictStore.getState().reset();
        useFactionStore.getState().reset();
        useHeroStore.getState().reset();
        useImprovementStore.getState().reset();
        useSkillStore.getState().reset();
        useTechStore.getState().reset();
        useUnitStore.getState().reset();
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
        expect(screen.queryByLabelText("Codex encyclopedia statistics")).not.toBeInTheDocument();
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

    it("renders local-visible categories directly in the landing category index during development", async () => {
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
        expect(screen.getByTestId("location-probe")).toHaveTextContent("/codex?entry=KinOfSheredyn_DistrictImprovement_01");
    });

    it("filters Population rows by exported Type and returns detail routes to the archive", async () => {
        const user = userEvent.setup();
        seedCodexEntries([
            {
                exportKind: "populations",
                entryKey: "Population_Aspect",
                displayName: "Aspect",
                descriptionLines: [],
                referenceKeys: [],
                facts: [
                    { label: "Type", value: "Major faction population" },
                    { label: "Base food cost", value: "60" },
                ],
                sections: [{
                    title: "Worker effects",
                    lines: ["+1 [CultureColored] Influence"],
                }],
            },
            ...Array.from({ length: 4 }, (_, index): CodexEntry => ({
                exportKind: "populations",
                entryKey: `Population_Major_${index + 2}`,
                displayName: `Major Population ${index + 2}`,
                descriptionLines: [],
                referenceKeys: [],
                facts: [{ label: "Type", value: "Major faction population" }],
                sections: [{
                    title: "Worker effects",
                    lines: ["+1 [IndustryColored] Industry"],
                }],
            })),
            {
                exportKind: "populations",
                entryKey: "Population_Minor_Ametrine",
                displayName: "Ametrine",
                descriptionLines: [],
                referenceKeys: [],
                facts: [
                    { label: "Type", value: "Minor faction population" },
                    { label: "Base food cost", value: "60" },
                ],
                sections: [{
                    title: "Worker effects",
                    lines: ["+2 [ScienceColored] Science on Artisans"],
                }],
            },
        ]);

        render(
            <MemoryRouter initialEntries={["/codex?category=populations&entry=Population_Aspect"]}>
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

        expect(await screen.findByRole("heading", { name: "Aspects" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /major faction 5/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /other 1/i })).toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: /other 1/i }));

        expect(await screen.findByRole("heading", { name: "All Populations" })).toBeInTheDocument();
        expect(screen.getByTestId("location-probe")).toHaveTextContent("/codex?category=populations");
        expect(screen.getByRole("button", { name: "Ametrine" })).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Aspects" })).not.toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: /other 1/i }));
        expect(screen.getByRole("button", { name: "Aspects" })).toBeInTheDocument();

        await user.type(screen.getByRole("combobox", { name: /search the encyclopedia/i }), "science");
        expect(screen.getByRole("button", { name: "Ametrine" })).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Aspects" })).not.toBeInTheDocument();
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
                svgIcon: { source: "ability-icons", key: "UnitAbility_AlwaysRetaliate" },
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
                    { label: "Target", value: "EmptyTile,Allies,Enemies" },
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
                descriptionLines: ["Apply Status appears in prose without exported metadata facts."],
                referenceKeys: [],
            },
            {
                exportKind: "abilities",
                entryKey: "UnitAbility_FreeGuard",
                displayName: "Free Guard",
                descriptionLines: ["Tactical / Allies / Range 1 / Cost Free"],
                referenceKeys: [],
                facts: [
                    { label: "Target", value: "Allies" },
                    { label: "Range", value: "1" },
                    { label: "Cost", value: "Free" },
                    { label: "Ability mechanic", value: "Active" },
                    { label: "Ability source", value: "Battle skill" },
                    { label: "Combat role", value: "Shield" },
                ],
                sections: [{ title: "Effects", lines: ["Grants Shielded I Status to target Unit"] }],
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
        expect(within(metadata).getByText("Passive")).toBeInTheDocument();
        expect(within(metadata).queryByText("Mechanic")).not.toBeInTheDocument();
        expect(within(metadata).queryByText("Source")).not.toBeInTheDocument();
        expect(within(metadata).queryByText("Unit ability")).not.toBeInTheDocument();
        expect(within(metadata).queryByText("Role")).not.toBeInTheDocument();
        expect(within(metadata).queryByText("Retaliation")).not.toBeInTheDocument();
        expect(overviewRow.querySelector(".codex-summaryList__description")).not.toBeInTheDocument();
        expect(overviewRow.querySelector(".codex-summaryList__context")).not.toBeInTheDocument();
        expect(within(overviewRow).queryByText(/common02/i)).not.toBeInTheDocument();
        expect(within(overviewRow).queryByText(/passive \/ ability/i)).not.toBeInTheDocument();

        const usefulPreviewButton = within(abilitiesOverview).getByRole("button", { name: /arcane strike/i });
        const usefulPreviewRow = getSummaryRowForButton(usefulPreviewButton);
        const usefulMetadata = within(usefulPreviewRow).getByLabelText("Exported metadata");
        expect(within(usefulMetadata).getByText("Active")).toBeInTheDocument();
        expect(within(usefulMetadata).getByText("Target: Empty Tile, Allies, Enemies")).toBeInTheDocument();
        expect(within(usefulMetadata).getByText("Range 3")).toBeInTheDocument();
        expect(within(usefulMetadata).queryByText("Mechanic")).not.toBeInTheDocument();
        expect(within(usefulMetadata).queryByText("Source")).not.toBeInTheDocument();
        expect(within(usefulMetadata).queryByText("Battle skill")).not.toBeInTheDocument();
        expect(within(usefulMetadata).queryByText("Role")).not.toBeInTheDocument();
        expect(within(usefulMetadata).queryByText("Damage")).not.toBeInTheDocument();
        expect(within(usefulMetadata).queryByText("Cost")).not.toBeInTheDocument();
        expect(within(usefulMetadata).queryByText("1 Battle Token")).not.toBeInTheDocument();
        expect(within(usefulPreviewRow).queryByText("Tactical / Enemies / Range 3 / Cost 1 Battle Token"))
            .not.toBeInTheDocument();
        const effectPreview = within(usefulPreviewRow).getByLabelText("Effect preview");
        expect(within(effectPreview).getByText("Ignores the Defense of targeted Units")).toBeInTheDocument();
        expect(within(effectPreview).getByAltText("Damage")).toBeInTheDocument();
        expect(within(effectPreview).getByText("Deals 6 extra Damage per Determination")).toBeInTheDocument();
        expect(within(effectPreview).getByText("Applies Burning for 1 turn")).toBeInTheDocument();
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
            "Applies Burning for 1 turn",
        ]);
        expect(
            Array.from(effectPreview.querySelectorAll(".codex-summaryList__effectPreviewLine")).map((line) =>
                line.tagName
            )
        ).toEqual(["SPAN", "SPAN", "SPAN", "SPAN"]);
        expect(effectPreview.querySelectorAll(".codex-summaryList__effectPreviewLine")).toHaveLength(4);
        expect(usefulPreviewRow.querySelector(".codex-summaryList__context")).not.toBeInTheDocument();

        const freeCostRow = within(abilitiesOverview).getByRole("button", { name: /free guard/i });
        const freeCostMetadata = within(freeCostRow).getByLabelText("Exported metadata");
        expect(within(freeCostMetadata).getByText("Active")).toBeInTheDocument();
        expect(within(freeCostMetadata).getByText("Target: Allies")).toBeInTheDocument();
        expect(within(freeCostMetadata).getByText("Range 1")).toBeInTheDocument();
        expect(within(freeCostMetadata).getByText("Free")).toBeInTheDocument();
        expect(within(freeCostMetadata).queryByText("Source")).not.toBeInTheDocument();
        expect(within(freeCostMetadata).queryByText("Battle skill")).not.toBeInTheDocument();
        expect(within(freeCostMetadata).queryByText("Role")).not.toBeInTheDocument();
        expect(within(freeCostMetadata).queryByText("Shield")).not.toBeInTheDocument();
        expect(within(freeCostRow).queryByText("Tactical / Allies / Range 1 / Cost Free")).not.toBeInTheDocument();

        const thinOverviewRow = within(abilitiesOverview).getByRole("button", {
            name: /active battle skill name only/i,
        });
        expect(thinOverviewRow.querySelector("img.codex-kindIcon--summaryEntry")).not.toBeInTheDocument();
        expect(thinOverviewRow.querySelector(".codex-summaryList__metadata")).not.toBeInTheDocument();
    });

    it("surfaces search-matched Ability effect lines and suppresses catalog taxonomy leakage", async () => {
        const user = userEvent.setup();

        seedCodexEntries([
            {
                exportKind: "abilities",
                entryKey: "UnitAbility_HiddenEffectStrike",
                displayName: "Hidden Effect Strike",
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
                    { label: "Combat role", value: "Damage, Apply Status" },
                ],
                sections: [
                    {
                        title: "Effects",
                        lines: [
                            [
                                "Ignores the Defense of targeted Units",
                                "Deals 30% of the Hero's [Damage] Damage",
                                "Deals 5 extra Damage per Determination",
                                "Pushes targeted Units 1 tile",
                                "Grants Focused I Status to the Hero",
                                "Removes Shielded Status from targeted Units",
                                "Applies Burning I Status to targeted Units",
                                "Applies Weakened II Status to targeted Units",
                            ].join("\n"),
                        ],
                    },
                ],
            },
            {
                exportKind: "abilities",
                entryKey: "UnitAbility_LastLord_Chilling",
                displayName: "Chilling Coup",
                category: "Combat",
                kind: "Ability",
                descriptionLines: ["Combat"],
                referenceKeys: [],
                facts: [
                    { label: "Ability mechanic", value: "Reaction" },
                    { label: "Ability source", value: "Battle ability" },
                    { label: "Combat role", value: "Apply Status" },
                ],
                sections: [{ title: "Effects", lines: ["Applies Terrorized I Status to all enemy Units"] }],
            },
        ]);

        render(
            <MemoryRouter initialEntries={["/codex?category=abilities"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        const abilitiesOverview = await screen.findByLabelText("Abilities overview");
        const taxonomyLeakButton = within(abilitiesOverview).getByRole("button", { name: /chilling coup/i });
        const taxonomyLeakRow = getSummaryRowForButton(taxonomyLeakButton);
        expect(within(taxonomyLeakRow).queryByText(/last lords \/ combat \/ ability/i)).not.toBeInTheDocument();
        expect(within(taxonomyLeakRow).queryByText(/combat \/ ability/i)).not.toBeInTheDocument();
        expect(within(taxonomyLeakRow).getByText("Applies Terrorized I Status to all enemy Units"))
            .toBeInTheDocument();

        await user.type(screen.getByRole("combobox", { name: /search the encyclopedia/i }), "weakened");

        await waitFor(() => {
            expect(screen.getByRole("heading", { name: "Ability Archive" })).toBeInTheDocument();
            expect(within(abilitiesOverview).queryByRole("button", { name: /chilling coup/i })).not.toBeInTheDocument();
        });
        const searchMatchedButton = within(abilitiesOverview).getByRole("button", { name: /hidden effect strike/i });
        const searchMatchedRow = getSummaryRowForButton(searchMatchedButton);
        const effectPreview = within(searchMatchedRow).getByLabelText("Effect preview");
        const previewLines = Array.from(effectPreview.querySelectorAll(".codex-summaryList__effectPreviewLine"))
            .map((line) => line.textContent?.replace(/\s+/g, " ").trim());

        expect(previewLines).toEqual([
            "Ignores the Defense of targeted Units",
            "Deals 30% of the Hero's Damage",
            "Deals 5 extra Damage per Determination",
            "Pushes targeted Units 1 tile",
            "Grants Focused I Status to the Hero",
            "Removes Shielded Status from targeted Units",
            "Applies Weakened II Status to targeted Units",
        ]);
        expect(previewLines).toHaveLength(7);
        expect(within(effectPreview).queryByText("Applies Burning I Status to targeted Units")).not.toBeInTheDocument();
        expect(
            within(effectPreview).queryByText(
                "Ignores the Defense of targeted Units Deals 30% of the Hero's Damage Applies Weakened II Status to targeted Units"
            )
        ).not.toBeInTheDocument();
    });

    it("renders a quiet Ability Archive no-results state for empty search matches", async () => {
        const user = userEvent.setup();

        seedCodexEntries([
            {
                exportKind: "abilities",
                entryKey: "UnitAbility_AlwaysRetaliate",
                displayName: "Always Retaliate",
                descriptionLines: ["Always retaliates."],
                referenceKeys: [],
                facts: [{ label: "Ability mechanic", value: "Passive" }],
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
        await user.type(screen.getByRole("combobox", { name: /search the encyclopedia/i }), "no ability should match this");

        expect(await screen.findByText("No abilities matched.")).toBeInTheDocument();
        expect(screen.getByText("Clear filters or change the search query to browse the archive.")).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /always retaliate/i })).not.toBeInTheDocument();
    });

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
        expect(screen.getByLabelText("Tech filters")).toBeInTheDocument();
        const techOverview = screen.getByLabelText("Tech overview");
        expect(techOverview).toHaveTextContent("Metadata Trap");
        expect(techOverview).not.toHaveTextContent("Active");
        expect(techOverview).not.toHaveTextContent("Empire");
        expect(techOverview).not.toHaveTextContent("10 turns");
    });

    it("renders the Tech archive with fact filters, effect previews, compact exact unlock links, and detail-to-filter reset", async () => {
        const user = userEvent.setup();
        const entries: CodexEntry[] = [
            {
                exportKind: "tech",
                entryKey: "Aspect_Technology_00",
                displayName: "Asceticism",
                kind: "Technology",
                category: "Development",
                descriptionLines: [],
                referenceKeys: ["Aspect_DistrictImprovement_01"],
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
                            },
                            {
                                label: "Missing Improvement",
                                referenceKey: "Aspect_DistrictImprovement_Missing",
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
                exportKind: "tech",
                entryKey: "Common_Technology_Defense_02",
                displayName: "Shield Doctrine",
                kind: "Technology",
                category: "Defense",
                descriptionLines: [],
                referenceKeys: [],
                facts: [
                    { label: "Kind", value: "Technology" },
                    { label: "Tier", value: "2" },
                    { label: "Era", value: "2" },
                    { label: "Quadrant", value: "Defense" },
                ],
                sections: [{ title: "Effects", lines: ["+20 [Defense] Defense on Units"] }],
            },
            {
                exportKind: "improvements",
                entryKey: "Aspect_DistrictImprovement_01",
                displayName: "Ascetic Existence",
                category: "Industry",
                kind: "Improvement",
                descriptionLines: ["A focused capital improvement."],
                referenceKeys: [],
            },
        ];

        seedCodexEntries(entries);

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

        const techFilters = screen.getByLabelText("Tech filters");
        expect(within(techFilters).getByRole("button", { name: "Era 1 1" })).toBeInTheDocument();
        expect(within(techFilters).getByRole("button", { name: "Era 2 1" })).toBeInTheDocument();
        expect(within(techFilters).getByRole("button", { name: "Development 1" })).toBeInTheDocument();
        expect(within(techFilters).getByRole("button", { name: "Defense 1" })).toBeInTheDocument();
        expect(within(techFilters).getByRole("button", { name: "Aspect 1" })).toBeInTheDocument();

        await user.click(within(techFilters).getByRole("button", { name: "Development 1" }));

        expect(screen.getByTestId("location-probe")).toHaveTextContent("/codex?category=tech");
        expect(await screen.findByRole("heading", { name: "All Tech" })).toBeInTheDocument();

        const techOverview = screen.getByLabelText("Tech overview");
        expect(techOverview).toHaveTextContent("Asceticism");
        expect(techOverview).not.toHaveTextContent("Shield Doctrine");

        const titleButton = within(techOverview).getByRole("button", { name: /asceticism/i });
        const row = getSummaryRowForButton(titleButton);
        const metadata = within(row).getByLabelText("Tech metadata");
        expect(within(metadata).getByText("Era 1")).toBeInTheDocument();
        expect(within(metadata).getByText("Development")).toBeInTheDocument();
        expect(within(metadata).getByText("Aspect")).toBeInTheDocument();

        const effects = within(row).getByLabelText("Tech effect preview");
        expect(effects).toHaveTextContent("+10 Dust on Capital");
        expect(effects).not.toHaveTextContent("[DustColored]");

        const unlocks = within(row).getByLabelText("Tech unlocks");
        expect(within(unlocks).getByRole("button", { name: "Open Ascetic Existence in Codex" }))
            .toBeInTheDocument();
        expect(within(unlocks).queryByText("Missing Improvement")).not.toBeInTheDocument();

        await user.click(within(techFilters).getByRole("button", { name: "Development 1" }));
        expect(await screen.findByText("Shield Doctrine")).toBeInTheDocument();

        await user.click(within(techFilters).getByRole("button", { name: "Era 2 1" }));
        expect(techOverview).not.toHaveTextContent("Asceticism");
        expect(techOverview).toHaveTextContent("Shield Doctrine");
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
                    { label: "Combat role", value: "Damage, Movement, Apply Status" },
                ],
            },
            {
                exportKind: "abilities",
                entryKey: "Ability_ActiveBattleSkillNameOnly",
                displayName: "Active Battle Skill Name Only",
                descriptionLines: ["Active battle skill and Apply Status appear in prose only."],
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

        expect(await screen.findByRole("heading", { name: "Ability Archive" })).toBeInTheDocument();
        const filters = screen.getByLabelText("Abilities filters");
        expect(within(filters).queryByRole("button", { name: /all/i })).not.toBeInTheDocument();
        const popularGroup = within(filters).getByRole("group", { name: "Ability Role" });
        const mechanicGroup = within(filters).getByRole("group", { name: "Mechanics" });
        const sourceGroup = within(filters).getByRole("group", { name: "Sources" });
        expect(within(popularGroup).getByRole("button", { name: /damage\s+1/i })).toBeInTheDocument();
        expect(within(popularGroup).getByRole("button", { name: /apply status\s+1/i })).toBeInTheDocument();
        expect(within(popularGroup).queryByRole("button", { name: /heal\s+0/i })).not.toBeInTheDocument();
        expect(within(mechanicGroup).getByRole("button", { name: /active\s+1/i })).toBeInTheDocument();
        expect(within(mechanicGroup).getByRole("button", { name: /passive\s+1/i })).toBeInTheDocument();
        expect(within(sourceGroup).getByRole("button", { name: /battle skill\s+1/i })).toBeInTheDocument();
        expect(within(sourceGroup).queryByRole("button", { name: /unit ability event\s+0/i })).not.toBeInTheDocument();
        expect(within(filters).queryByRole("group", { name: "Role" })).not.toBeInTheDocument();
        expect(within(filters).queryByRole("button", { name: "Clear" })).not.toBeInTheDocument();
        expect(within(filters).queryByText("Current shelf")).not.toBeInTheDocument();

        await user.click(within(popularGroup).getByRole("button", { name: /apply status\s+1/i }));

        const abilitiesOverview = screen.getByLabelText("Abilities overview");
        expect(await screen.findByRole("heading", { name: "Apply Status Abilities" })).toBeInTheDocument();
        expect(within(abilitiesOverview).getByRole("button", { name: /precise volley/i })).toBeInTheDocument();
        expect(within(abilitiesOverview).queryByRole("button", { name: /always retaliate/i })).not.toBeInTheDocument();
        expect(within(abilitiesOverview).queryByRole("button", { name: /active battle skill name only/i }))
            .not.toBeInTheDocument();

        expect(within(popularGroup).getByRole("button", { name: /apply status\s+1/i }))
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
        expect(within(popularGroup).getByRole("button", { name: /apply status\s+0/i })).toBeDisabled();
        expect(within(popularGroup).queryByRole("button", { name: /reactive skill\s+0/i }))
            .not.toBeInTheDocument();

        await user.click(within(filters).getByRole("button", { name: "Clear" }));

        await user.click(within(mechanicGroup).getByRole("button", { name: /active\s+1/i }));
        expect(await screen.findByRole("heading", { name: "Active Abilities" })).toBeInTheDocument();
        expect(within(abilitiesOverview).getByRole("button", { name: /precise volley/i })).toBeInTheDocument();
        expect(within(abilitiesOverview).queryByRole("button", { name: /always retaliate/i })).not.toBeInTheDocument();

        await user.click(within(abilitiesOverview).getByRole("button", { name: /precise volley/i }));
        expect(await screen.findByRole("heading", { name: "Precise Volley" })).toBeInTheDocument();
        expect(screen.getByTestId("location-probe")).toHaveTextContent(
            "/codex?category=abilities&entry=UnitAbility_PreciseVolley"
        );
        expect(screen.getByLabelText("Ability catalog filters")).toBeInTheDocument();

        await user.click(within(mechanicGroup).getByRole("button", { name: /active\s+1/i }));
        expect(await screen.findByRole("heading", { name: "Ability Archive" })).toBeInTheDocument();
        expect(screen.getByTestId("location-probe")).toHaveTextContent("/codex?category=abilities");
        expect(within(screen.getByLabelText("Abilities overview"))
            .getByRole("button", { name: /precise volley/i })).toBeInTheDocument();

        await user.click(within(screen.getByRole("group", { name: "Ability Role" }))
            .getByRole("button", { name: /apply status\s+1/i }));
        expect(await screen.findByRole("heading", { name: "Apply Status Abilities" })).toBeInTheDocument();
        await user.click(within(screen.getByLabelText("Abilities overview"))
            .getByRole("button", { name: /precise volley/i }));
        expect(await screen.findByRole("heading", { name: "Precise Volley" })).toBeInTheDocument();
        expect(screen.getByTestId("location-probe")).toHaveTextContent(
            "/codex?category=abilities&entry=UnitAbility_PreciseVolley"
        );

        await user.click(within(filters).getByRole("button", { name: "Clear" }));
        expect(await screen.findByRole("heading", { name: "Ability Archive" })).toBeInTheDocument();
        expect(screen.getByTestId("location-probe")).toHaveTextContent("/codex?category=abilities");
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

    it("adds an Action Type rail while preserving generic Action rows and detail behavior", async () => {
        const user = userEvent.setup();
        seedActionArchiveEntries();

        render(
            <MemoryRouter initialEntries={["/codex?category=actions"]}>
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

        expect(await screen.findByRole("heading", { name: "All Actions" })).toBeInTheDocument();
        const actionRail = screen.getByRole("complementary", { name: /action archive filters/i });
        expect(actionRail).toBeInTheDocument();
        expect(screen.queryByRole("complementary", { name: /codex results/i })).not.toBeInTheDocument();
        expect(document.querySelector(".codex-workspace--actionArchive")).toBeInTheDocument();
        expect(within(actionRail).getByRole("button", { name: "All 6" })).toHaveAttribute("aria-pressed", "true");
        expect(within(actionRail).getByRole("button", { name: "Action 1" })).toBeInTheDocument();
        expect(within(actionRail).getByRole("button", { name: "Faction 1" })).toBeInTheDocument();
        expect(within(actionRail).getByRole("button", { name: "Empire 1" })).toBeInTheDocument();
        expect(within(actionRail).getByRole("button", { name: "Constructible 1" })).toBeInTheDocument();
        expect(within(actionRail).getByRole("button", { name: "Terraforming 1" })).toBeInTheDocument();
        expect(within(actionRail).getByRole("button", { name: "Army 1" })).toBeInTheDocument();
        const actionsOverview = screen.getByLabelText("Actions overview");
        expect(within(actionsOverview).getByText("Build Bridge")).toBeInTheDocument();
        expect(within(actionsOverview).getByText("Kin Build Chosen")).toBeInTheDocument();
        expect(within(actionsOverview).queryByText("Money")).not.toBeInTheDocument();
        expect(within(actionsOverview).queryByText("Action / Action")).not.toBeInTheDocument();

        await user.click(within(actionRail).getByRole("button", { name: "Faction 1" }));

        expect(within(actionRail).getByRole("button", { name: "Faction 1" })).toHaveAttribute("aria-pressed", "true");
        expect(await screen.findByRole("heading", { name: "All Actions" })).toBeInTheDocument();
        expect(within(screen.getByLabelText("Actions overview")).getByText("Kin Build Chosen")).toBeInTheDocument();
        expect(within(screen.getByLabelText("Actions overview")).queryByText("Build Bridge")).not.toBeInTheDocument();

        await user.click(within(actionRail).getByRole("button", { name: "Faction 1" }));

        expect(within(actionRail).getByRole("button", { name: "All 6" })).toHaveAttribute("aria-pressed", "true");
        expect(within(screen.getByLabelText("Actions overview")).getByText("Build Bridge")).toBeInTheDocument();

        const searchInput = screen.getByRole("combobox", { name: /search the encyclopedia/i });
        await user.type(searchInput, "bridge");

        expect(within(actionRail).getByRole("button", { name: "All 1" })).toHaveAttribute("aria-pressed", "true");
        expect(within(actionRail).getByRole("button", { name: "Action 1" })).toBeInTheDocument();
        expect(within(actionRail).getByRole("button", { name: "Faction 0" })).toBeInTheDocument();
        expect(within(screen.getByLabelText("Actions overview")).getByText("Build Bridge")).toBeInTheDocument();
        expect(within(screen.getByLabelText("Actions overview")).queryByText("Kin Build Chosen")).not.toBeInTheDocument();

        cleanup();
        seedActionArchiveEntries();

        render(
            <MemoryRouter initialEntries={["/codex?category=actions&entry=ActionTypeBuildBridge"]}>
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

        expect(await screen.findByRole("heading", { name: "Build Bridge" })).toBeInTheDocument();
        const detailActionRail = screen.getByRole("complementary", { name: /action archive filters/i });

        await user.click(within(detailActionRail).getByRole("button", { name: "Faction 1" }));

        expect(await screen.findByRole("heading", { name: "All Actions" })).toBeInTheDocument();
        expect(screen.queryByRole("heading", { name: "Build Bridge" })).not.toBeInTheDocument();
        expect(screen.getByTestId("location-probe")).toHaveTextContent("/codex?category=actions");
        expect(within(screen.getByLabelText("Actions overview")).getByText("Kin Build Chosen")).toBeInTheDocument();

        cleanup();
        seedActionArchiveEntries();

        render(
            <MemoryRouter initialEntries={["/codex?category=tech"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "All Tech" })).toBeInTheDocument();
        expect(screen.getByRole("complementary", { name: /tech archive filters/i })).toBeInTheDocument();
    });

    it("keeps Action archive rows shallow while preserving detail mechanics and related modifiers", async () => {
        const user = userEvent.setup();
        const entries: CodexEntry[] = [
            {
                exportKind: "actions",
                entryKey: "ActionTypeBuildBridge",
                displayName: "Build Bridge",
                category: "Action",
                kind: "Action",
                descriptionLines: [],
                referenceKeys: ["ActionCostModifier_Test"],
                publicContextKeys: ["ActionCostModifier_Test"],
                facts: [
                    { label: "Kind", value: "Action" },
                    { label: "Category", value: "Action" },
                ],
                sections: [
                    {
                        title: "Action mechanics",
                        items: [
                            {
                                label: "Money cost multiplier",
                                facts: [
                                    { label: "Affected cost", value: "Money" },
                                    { label: "Modifier", value: "-100%" },
                                ],
                                lines: ["Modifier-heavy construction cost output."],
                            },
                        ],
                    },
                ],
            },
            {
                exportKind: "actions",
                entryKey: "ActionTypePublicEffect",
                displayName: "Public Effect Action",
                category: "Action",
                kind: "Action",
                descriptionLines: [],
                referenceKeys: [],
                facts: [
                    { label: "Kind", value: "Action" },
                    { label: "Category", value: "Action" },
                ],
                sections: [
                    {
                        title: "Effects",
                        lines: ["Creates a bridge over a river tile."],
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
                    { label: "Kind", value: "Action Cost Modifier" },
                    { label: "Category", value: "Cost Modifier" },
                ],
                sections: [
                    {
                        title: "Modifier mechanics",
                        lines: ["Reduces the action Dust cost."],
                    },
                ],
            },
        ];

        useCodexStore.setState({
            entries,
            entriesByKey: buildEntriesByKey(entries),
            entriesByKind: {
                actions: entries.filter((entry) => entry.exportKind === "actions"),
                modifiers: entries.filter((entry) => entry.exportKind === "modifiers"),
            },
            entriesByKindKey: buildEntriesByKindKey(entries),
            loading: false,
            error: null,
        });

        render(
            <MemoryRouter initialEntries={["/codex?category=actions"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "All Actions" })).toBeInTheDocument();
        const actionsOverview = screen.getByLabelText("Actions overview");
        expect(within(actionsOverview).getByText("Build Bridge")).toBeInTheDocument();
        expect(within(actionsOverview).getByText("Public Effect Action")).toBeInTheDocument();
        expect(within(actionsOverview).getByText("Creates a bridge over a river tile.")).toBeInTheDocument();
        expect(within(actionsOverview).queryByText("Money cost multiplier")).not.toBeInTheDocument();
        expect(within(actionsOverview).queryByText("Modifier-heavy construction cost output.")).not.toBeInTheDocument();
        expect(within(actionsOverview).queryByText("Action Cost Modifier Test")).not.toBeInTheDocument();
        expect(within(actionsOverview).queryByText("Money")).not.toBeInTheDocument();
        expect(within(getCategoryToolbar()).queryByRole("button", { name: /modifiers/i })).not.toBeInTheDocument();

        await user.click(within(actionsOverview).getByRole("button", { name: /build bridge/i }));

        expect(await screen.findByRole("heading", { name: "Build Bridge" })).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Action mechanics" })).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Money cost multiplier" })).toBeInTheDocument();
        expect(screen.getByText("Modifier-heavy construction cost output.")).toBeInTheDocument();
        const relatedSection = screen.getByRole("region", { name: /related entries/i });
        expect(within(relatedSection).getByRole("button", { name: /action cost modifier test modifiers/i }))
            .toBeInTheDocument();
    });

    it("adds a Treaty Category rail while preserving Diplomatic Treaty rows and detail behavior", async () => {
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
                    "Signing this Treaty will open the borders between the two Empires without affecting your [PublicOpinion] Public Opinion.",
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
                entryKey: "Declaration_CloseBorders",
                displayName: "Close Borders",
                category: "Hostile Defense",
                kind: "Diplomatic Treaty",
                descriptionLines: [
                    "Declare your borders closed to the other Empire.",
                ],
                referenceKeys: [],
                facts: [
                    { label: "Category", value: "Hostile Defense" },
                    { label: "Bilateral", value: "No" },
                    { label: "Duration", value: "30 turns" },
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
            {
                exportKind: "diplomatictreaties",
                entryKey: "Declaration_Compliment",
                displayName: "Compliment",
                category: "Repeatable Declaration",
                kind: "Diplomatic Treaty",
                descriptionLines: [
                    "Send a Compliment to improve Public Opinion.",
                ],
                referenceKeys: [],
                facts: [
                    { label: "Category", value: "Repeatable Declaration" },
                    { label: "Bilateral", value: "No" },
                    { label: "Duration", value: "5 turns" },
                    { label: "Kind", value: "Diplomatic Treaty" },
                ],
            },
            {
                exportKind: "diplomatictreaties",
                entryKey: "Treaty_ShareCoralExploitation",
                displayName: "Share Coral Exploitation",
                category: "Beneficial Economy",
                kind: "Diplomatic Treaty",
                descriptionLines: [
                    "Signing this Treaty will give additional Dust and Influence incomes.",
                ],
                referenceKeys: [],
                facts: [
                    { label: "Category", value: "Beneficial Economy" },
                    { label: "Bilateral", value: "Yes" },
                    { label: "Duration", value: "30 turns" },
                    { label: "Kind", value: "Diplomatic Treaty" },
                ],
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

        seedCodexEntries(entries);

        render(
            <MemoryRouter initialEntries={["/codex?category=diplomatictreaties"]}>
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

        expect(await screen.findByRole("heading", { name: "All Diplomacy" })).toBeInTheDocument();
        const diplomacyRail = screen.getByRole("complementary", { name: /diplomacy archive filters/i });
        expect(diplomacyRail).toBeInTheDocument();
        expect(screen.queryByRole("complementary", { name: /codex results/i })).not.toBeInTheDocument();
        expect(document.querySelector(".codex-workspace--diplomacyArchive")).toBeInTheDocument();
        expect(within(diplomacyRail).getByRole("button", { name: "All 6" })).toHaveAttribute("aria-pressed", "true");
        expect(within(diplomacyRail).getByRole("button", { name: "War 1" })).toBeInTheDocument();
        expect(within(diplomacyRail).getByRole("button", { name: "Defense 2" })).toBeInTheDocument();
        expect(within(diplomacyRail).getByRole("button", { name: "Discovery 1" })).toBeInTheDocument();
        expect(within(diplomacyRail).getByRole("button", { name: "Society 0" })).toBeInTheDocument();
        expect(within(diplomacyRail).getByRole("button", { name: "Declarations 1" })).toBeInTheDocument();
        expect(within(diplomacyRail).getByRole("button", { name: "Economy 1" })).toBeInTheDocument();
        expect(within(screen.getByLabelText("Diplomacy overview")).getByText("Open Borders")).toBeInTheDocument();
        expect(within(screen.getByLabelText("Diplomacy overview")).getByText("Close Borders")).toBeInTheDocument();
        const openBordersRow = getSummaryRowForButton(
            within(screen.getByLabelText("Diplomacy overview")).getByRole("button", { name: /open borders/i })
        );
        expect(openBordersRow).toHaveTextContent("Defense");
        expect(openBordersRow).toHaveTextContent("Bilateral");
        expect(openBordersRow).toHaveTextContent("30 turns");
        expect(within(openBordersRow).getByRole("img", { name: "PublicOpinion" })).toBeInTheDocument();
        expect(openBordersRow).not.toHaveTextContent("Beneficial Defense / Diplomatic Treaty");

        await user.click(within(diplomacyRail).getByRole("button", { name: "Defense 2" }));

        expect(within(diplomacyRail).getByRole("button", { name: "Defense 2" })).toHaveAttribute("aria-pressed", "true");
        expect(within(screen.getByLabelText("Diplomacy overview")).getByText("Open Borders")).toBeInTheDocument();
        const closeBordersRow = getSummaryRowForButton(
            within(screen.getByLabelText("Diplomacy overview")).getByRole("button", { name: /close borders/i })
        );
        expect(closeBordersRow).toHaveTextContent("Defense");
        expect(closeBordersRow).toHaveTextContent("One-sided");
        expect(closeBordersRow).toHaveTextContent("30 turns");
        expect(closeBordersRow).toHaveTextContent("Declare your borders closed to the other Empire.");
        const closeBordersSignals = within(closeBordersRow).getByLabelText("Treaty effect signals");
        expect(closeBordersSignals).toHaveTextContent("-25 Public Opinion");
        expect(within(closeBordersSignals).getByRole("img", { name: "PublicOpinion" })).toBeInTheDocument();
        expect(closeBordersRow).not.toHaveTextContent("Other empire");
        expect(within(screen.getByLabelText("Diplomacy overview")).queryByText("Justified War")).not.toBeInTheDocument();

        await user.click(within(diplomacyRail).getByRole("button", { name: "Defense 2" }));

        expect(within(diplomacyRail).getByRole("button", { name: "All 6" })).toHaveAttribute("aria-pressed", "true");
        expect(within(screen.getByLabelText("Diplomacy overview")).getByText("Justified War")).toBeInTheDocument();
        const justifiedWarRow = getSummaryRowForButton(
            within(screen.getByLabelText("Diplomacy overview")).getByRole("button", { name: /justified war/i })
        );
        expect(justifiedWarRow).toHaveTextContent("War");
        expect(justifiedWarRow).toHaveTextContent("One-sided");
        expect(justifiedWarRow).not.toHaveTextContent("Duration");

        const searchInput = screen.getByRole("combobox", { name: /search the encyclopedia/i });
        await user.type(searchInput, "vision");

        expect(within(diplomacyRail).getByRole("button", { name: "All 1" })).toHaveAttribute("aria-pressed", "true");
        expect(within(diplomacyRail).getByRole("button", { name: "Discovery 1" })).toBeInTheDocument();
        expect(within(diplomacyRail).getByRole("button", { name: "Defense 0" })).toBeInTheDocument();
        expect(within(screen.getByLabelText("Diplomacy overview")).getByText("Vision Exchange")).toBeInTheDocument();
        expect(within(screen.getByLabelText("Diplomacy overview")).queryByText("Open Borders")).not.toBeInTheDocument();

        cleanup();
        seedCodexEntries(entries);

        render(
            <MemoryRouter initialEntries={["/codex?category=diplomatictreaties&entry=Treaty_VisionExchange"]}>
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

        expect(await screen.findByRole("heading", { name: "Vision Exchange" })).toBeInTheDocument();
        const detailDiplomacyRail = screen.getByRole("complementary", { name: /diplomacy archive filters/i });

        await user.click(within(detailDiplomacyRail).getByRole("button", { name: "War 1" }));

        expect(await screen.findByRole("heading", { name: "All Diplomacy" })).toBeInTheDocument();
        expect(screen.queryByRole("heading", { name: "Vision Exchange" })).not.toBeInTheDocument();
        expect(screen.getByTestId("location-probe")).toHaveTextContent("/codex?category=diplomatictreaties");
        expect(within(screen.getByLabelText("Diplomacy overview")).getByText("Justified War")).toBeInTheDocument();
    });

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
                    { label: "Scope", value: "Diplomatic Ambassy" },
                    { label: "Category", value: "Diplomacy" },
                    { label: "Kind", value: "Status" },
                    { label: "Duration", value: "10 turns" },
                    { label: "Polarity", value: "Malus" },
                    { label: "Status type", value: "Public Opinion" },
                ],
                sections: [
                    {
                        title: "Status mechanics",
                        lines: ["Changes treaty Public Opinion while active."],
                    },
                    {
                        title: "Effects",
                        lines: ["Diplomatic pressure while borders are closed."],
                    },
                    {
                        title: "Status interactions",
                        items: [
                            {
                                label: "Ahead in the Polls",
                                referenceKey: "Status_City_Approval_Test",
                                facts: [{ label: "Interaction", value: "Cancels on apply" }],
                            },
                            {
                                label: "Missing Status",
                                referenceKey: "Status_Missing_Interaction",
                                facts: [{ label: "Interaction", value: "Inhibited by" }],
                            },
                        ],
                    },
                ],
            },
            {
                exportKind: "statuses",
                entryKey: "Status_City_Approval_Test",
                displayName: "Ahead in the Polls",
                category: "Status",
                kind: "Status",
                descriptionLines: [],
                referenceKeys: [],
                facts: [
                    { label: "Scope", value: "City" },
                    { label: "Polarity", value: "Bonus" },
                ],
                sections: [
                    {
                        title: "Status mechanics",
                        lines: ["+15 Approval"],
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
        const mechanicsHeading = screen.getByRole("heading", { name: "Status mechanics" });
        const statusProfile = screen.getByLabelText("Status profile");
        expect(Boolean(mechanicsHeading.compareDocumentPosition(statusProfile) & Node.DOCUMENT_POSITION_FOLLOWING))
            .toBe(true);
        expect(within(statusProfile).getByText("Scope")).toBeInTheDocument();
        expect(within(statusProfile).getByText("Diplomacy")).toBeInTheDocument();
        expect(within(statusProfile).getByText("Duration")).toBeInTheDocument();
        expect(within(statusProfile).getByText("10 turns")).toBeInTheDocument();
        expect(within(statusProfile).getByText("Polarity")).toBeInTheDocument();
        expect(within(statusProfile).getByText("Malus")).toBeInTheDocument();
        expect(within(statusProfile).queryByText("Kind")).not.toBeInTheDocument();
        expect(within(statusProfile).queryByText("Category")).not.toBeInTheDocument();
        expect(within(statusProfile).queryByText("Status type")).not.toBeInTheDocument();
        expect(screen.getByText("Changes treaty Public Opinion while active.")).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Effects" })).toBeInTheDocument();
        expect(screen.getByText("Diplomatic pressure while borders are closed.")).toBeInTheDocument();
        const statusInteractions = screen.getByLabelText("Status interactions");
        expect(within(statusInteractions).getByText("Cancels on apply")).toBeInTheDocument();
        expect(within(statusInteractions).getByRole("button", { name: "Open Ahead in the Polls in Codex" }))
            .toBeInTheDocument();
        expect(within(statusInteractions).queryByText("Missing Status")).not.toBeInTheDocument();
        expect(within(getCategoryToolbar()).queryByRole("button", { name: /modifiers/i })).not.toBeInTheDocument();

        const relatedSection = screen.getByRole("region", { name: /related entries/i });
        await user.click(within(relatedSection).getByRole("button", { name: /action cost modifier test modifiers/i }));

        expect(await screen.findByRole("heading", { name: "Action Cost Modifier Test" })).toBeInTheDocument();
        expect(screen.getByText("Modifier dossier")).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Modifier mechanics" })).toBeInTheDocument();
        expect(screen.getByText("Reduces the action Influence cost.")).toBeInTheDocument();
        expect(within(getCategoryToolbar()).queryByRole("button", { name: /modifiers/i })).not.toBeInTheDocument();
    });

    it("renders thin Status details with profile facts and no empty Duration label", async () => {
        seedCodexEntries([
            {
                exportKind: "statuses",
                entryKey: "Status_Unit_Thin",
                displayName: "Thin Unit Status",
                category: "Status",
                kind: "Status",
                descriptionLines: [],
                referenceKeys: [],
                facts: [
                    { label: "Scope", value: "Unit" },
                    { label: "Category", value: "Status" },
                    { label: "Kind", value: "Status" },
                ],
            },
        ]);

        render(
            <MemoryRouter initialEntries={["/codex?category=statuses&entry=Status_Unit_Thin"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "Thin Unit Status" })).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Status mechanics" })).toBeInTheDocument();
        expect(screen.getByText("No public mechanics exported yet.")).toBeInTheDocument();
        const statusProfile = screen.getByLabelText("Status profile");
        expect(within(statusProfile).getByText("Scope")).toBeInTheDocument();
        expect(within(statusProfile).getByText("Unit")).toBeInTheDocument();
        expect(within(statusProfile).queryByText("Duration")).not.toBeInTheDocument();
        expect(within(statusProfile).queryByText("Kind")).not.toBeInTheDocument();
        expect(within(statusProfile).queryByText("Category")).not.toBeInTheDocument();
    });

    it("shows grouped exact relationship sources on Status details without prose-only matches", async () => {
        const user = userEvent.setup();
        const entries: CodexEntry[] = [
            {
                exportKind: "statuses",
                entryKey: "Status_Unit_VulnerableI",
                displayName: "Vulnerable I",
                category: "Status",
                kind: "Status",
                descriptionLines: [],
                referenceKeys: [],
                facts: [{ label: "Scope", value: "Unit" }],
                sections: [{ title: "Status mechanics", lines: ["-30% [Defense] Defense"] }],
            },
            {
                exportKind: "abilities",
                entryKey: "UnitAbility_BreachingAttack",
                displayName: "Breaching Attack",
                category: "Tactical",
                kind: "Ability",
                descriptionLines: [],
                referenceKeys: ["Status_Unit_VulnerableI"],
                facts: [{ label: "Ability mechanic", value: "Active" }],
                sections: [{ title: "Effects", lines: ["Applies Vulnerable I Status to targeted Units."] }],
            },
            {
                exportKind: "diplomaticTreaties",
                entryKey: "DiplomaticTreaty_CloseBorders",
                displayName: "Close Borders",
                category: "Diplomacy",
                kind: "Diplomatic Treaty",
                descriptionLines: [],
                publicContextKeys: ["Status_Unit_VulnerableI"],
                referenceKeys: [],
            },
            {
                exportKind: "actions",
                entryKey: "Action_Intimidate",
                displayName: "Intimidate",
                category: "Diplomacy",
                kind: "Action",
                descriptionLines: [],
                referenceKeys: ["Status_Unit_VulnerableI"],
            },
            {
                exportKind: "factions",
                entryKey: "Faction_Test",
                displayName: "Test Faction",
                category: "Faction",
                kind: "Faction",
                descriptionLines: [],
                referenceKeys: ["Status_Unit_VulnerableI"],
            },
            {
                exportKind: "abilities",
                entryKey: "UnitAbility_ProseOnly",
                displayName: "Prose Only Vulnerable",
                category: "Tactical",
                kind: "Ability",
                descriptionLines: ["Mentions Vulnerable I but has no exact reference."],
                referenceKeys: [],
                sections: [{ title: "Effects", lines: ["Mentions Vulnerable I in prose only."] }],
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
            <MemoryRouter initialEntries={["/codex?category=statuses&entry=Status_Unit_VulnerableI"]}>
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

        expect(await screen.findByRole("heading", { name: "Vulnerable I" })).toBeInTheDocument();
        const exactReferences = screen.getByRole("region", { name: /exact status references/i });
        expect(within(exactReferences).getByText("Abilities")).toBeInTheDocument();
        expect(within(exactReferences).getByText("Diplomacy")).toBeInTheDocument();
        expect(within(exactReferences).getByText("Actions")).toBeInTheDocument();
        expect(within(exactReferences).getByText("Factions")).toBeInTheDocument();
        expect(within(exactReferences).getByRole("button", { name: /breaching attack abilities/i }))
            .toBeInTheDocument();
        expect(within(exactReferences).getByRole("button", { name: /close borders diplomacy/i }))
            .toBeInTheDocument();
        expect(within(exactReferences).getByRole("button", { name: /intimidate actions/i }))
            .toBeInTheDocument();
        expect(within(exactReferences).getByRole("button", { name: /test faction factions/i }))
            .toBeInTheDocument();
        expect(within(exactReferences).queryByRole("button", { name: /prose only vulnerable/i }))
            .not.toBeInTheDocument();

        await user.click(within(exactReferences).getByRole("button", { name: /breaching attack abilities/i }));

        expect(await screen.findByRole("heading", { name: "Breaching Attack" })).toBeInTheDocument();
        expect(screen.getByTestId("location-probe")).toHaveTextContent("/codex?entry=UnitAbility_BreachingAttack");
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

    it("links exact status mentions inline in Ability Archive previews while keeping unresolved mentions plain", async () => {
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
                    { label: "Ability mechanic", value: "Active" },
                    { label: "Ability source", value: "Battle skill" },
                    { label: "Combat role", value: "Apply Status" },
                    { label: "Target", value: "Enemies" },
                    { label: "Range", value: "3" },
                    { label: "Cost", value: "1 Battle Token" },
                ],
                sections: [
                    {
                        title: "Effects",
                        lines: [
                            "[DoubleArrow] Applies Jinxed II Status to the attacked Units",
                            "[DoubleArrow] Applies UnJinxed II Status to the attacker",
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
            },
            {
                exportKind: "statuses",
                entryKey: "Status_Unit_Jinxed_2",
                displayName: "Jinxed II",
                category: "Status",
                kind: "Status",
                descriptionLines: ["Jinxed II lowers Accuracy for two turns."],
                referenceKeys: [],
                sections: [
                    {
                        title: "Status mechanics",
                        lines: ["-20% [Accuracy] Accuracy"],
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
            <MemoryRouter initialEntries={["/codex?category=abilities"]}>
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

        const abilitiesOverview = await screen.findByLabelText("Abilities overview");
        const abilityButton = within(abilitiesOverview).getByRole("button", { name: /jinxed strike/i });
        const abilityRow = getSummaryRowForButton(abilityButton);
        const effectPreview = within(abilityRow).getByLabelText("Effect preview");
        const inlineLink = within(effectPreview).getByRole("button", { name: "Open Jinxed II in Codex" });
        const linkedLine = inlineLink.closest(".codex-summaryList__effectPreviewLine");

        expect(linkedLine).toHaveTextContent("Applies Jinxed II Status to the attacked Units");
        expect(inlineLink).toHaveTextContent("Jinxed II");
        expect(within(effectPreview).getByText(/Applies UnJinxed II Status to the attacker/)).toBeInTheDocument();
        expect(within(effectPreview).queryByRole("button", { name: /Open UnJinxed/i })).not.toBeInTheDocument();

        inlineLink.focus();
        expect(inlineLink).toHaveFocus();
        expect(await screen.findByRole("tooltip")).toHaveTextContent("Jinxed II");
        inlineLink.blur();
        await waitFor(() => expect(screen.queryByRole("tooltip")).not.toBeInTheDocument());

        await user.click(inlineLink);
        expect(await screen.findByRole("heading", { name: "Jinxed II" })).toBeInTheDocument();
        expect(screen.getByTestId("location-probe")).toHaveTextContent("/codex?entry=Status_Unit_Jinxed_2");
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
                    { label: "Ability mechanic", value: "Active" },
                    { label: "Ability source", value: "Battle skill" },
                    { label: "Combat role", value: "Apply Status" },
                    { label: "Target", value: "Enemies" },
                    { label: "Range", value: "3" },
                    { label: "Cost", value: "1 Battle Token" },
                    { label: "Kind", value: "Ability" },
                    { label: "Category", value: "Combat" },
                ],
                sections: [
                    {
                        title: "Battle mechanics",
                        items: [
                            {
                                label: "Applies status",
                                referenceKey: "Status_Unit_Jinxed_2",
                            },
                        ],
                    },
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
        expect(screen.getByText("Ability dossier")).toBeInTheDocument();
        const effectsHeading = screen.getByRole("heading", { name: "Effects" });
        const profile = screen.getByLabelText("Ability profile");
        expect(Boolean(effectsHeading.compareDocumentPosition(profile) & Node.DOCUMENT_POSITION_FOLLOWING))
            .toBe(true);
        expect(within(profile).getByText("Mechanic")).toBeInTheDocument();
        expect(within(profile).getByText("Active")).toBeInTheDocument();
        expect(within(profile).getByText("Target")).toBeInTheDocument();
        expect(within(profile).getByText("Enemies")).toBeInTheDocument();
        expect(within(profile).getByText("Range")).toBeInTheDocument();
        expect(within(profile).getByText("3")).toBeInTheDocument();
        expect(within(profile).getByText("Cost")).toBeInTheDocument();
        expect(within(profile).getByText("1 Battle Token")).toBeInTheDocument();
        expect(within(profile).queryByText("Source")).not.toBeInTheDocument();
        expect(within(profile).queryByText("Battle skill")).not.toBeInTheDocument();
        expect(within(profile).queryByText("Role")).not.toBeInTheDocument();
        expect(within(profile).queryByText("Apply Status")).not.toBeInTheDocument();
        expect(within(profile).queryByText("Kind")).not.toBeInTheDocument();
        expect(within(profile).queryByText("Category")).not.toBeInTheDocument();
        expect(screen.queryByText(/Combat \/ Ability/i)).not.toBeInTheDocument();

        expect(screen.getByRole("heading", { name: "Battle mechanics" })).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Applies status" })).toBeInTheDocument();
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

        const relatedSection = screen.getByRole("region", { name: /linked statuses & references/i });
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

    it("renders passive Ability details without empty target range or cost labels", async () => {
        const entries: CodexEntry[] = [
            {
                exportKind: "abilities",
                entryKey: "UnitAbility_PassiveShield",
                displayName: "Chosen of the Chosen",
                category: "Passive",
                kind: "Ability",
                descriptionLines: ["+3 bonus [Shield] Shield when gaining [Shield] Shield per [Resilience] Resilience"],
                referenceKeys: [],
                facts: [
                    { label: "Ability mechanic", value: "Passive" },
                    { label: "Kind", value: "Ability" },
                    { label: "Category", value: "Passive" },
                ],
                sections: [
                    {
                        title: "Effects",
                        lines: [
                            "+3 bonus [Shield] Shield when gaining [Shield] Shield per [Resilience] Resilience",
                            "+2 bonus [Shield] Shield when gaining [Shield] Shield per [Might] Might",
                        ],
                    },
                ],
            },
        ];

        useCodexStore.setState({
            entries,
            entriesByKey: buildEntriesByKey(entries),
            entriesByKind: {
                abilities: entries,
            },
            entriesByKindKey: buildEntriesByKindKey(entries),
            loading: false,
            error: null,
        });

        render(
            <MemoryRouter initialEntries={["/codex?category=abilities&entry=UnitAbility_PassiveShield"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "Chosen of the Chosen" })).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Effects" })).toBeInTheDocument();
        const shieldLine = screen.getByText(/\+3 bonus/).closest("p");
        expect(shieldLine)
            .toHaveTextContent("+3 bonus Shield when gaining Shield per Resilience");
        const profile = screen.getByLabelText("Ability profile");
        expect(within(profile).getByText("Mechanic")).toBeInTheDocument();
        expect(within(profile).getByText("Passive")).toBeInTheDocument();
        expect(within(profile).queryByText("Target")).not.toBeInTheDocument();
        expect(within(profile).queryByText("Range")).not.toBeInTheDocument();
        expect(within(profile).queryByText("Cost")).not.toBeInTheDocument();
        expect(within(profile).queryByText("Kind")).not.toBeInTheDocument();
        expect(within(profile).queryByText("Category")).not.toBeInTheDocument();
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
                svgIcon: { source: "ability-icons", key: "UnitAbility_Ranged_3" },
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

    it("renders Equipment as an archive with Type and Rarity navigation", async () => {
        const user = userEvent.setup();
        const entries: CodexEntry[] = [
            {
                exportKind: "equipment",
                entryKey: "Equipment_BloodmarkBow",
                displayName: "Bloodmark Bow",
                descriptionLines: [],
                referenceKeys: [
                    "UnitAbility_Ranged_4",
                    "UnitAbility_DefenseExpert_2",
                    "UnitAbility_Overwatch_1",
                    "UnitAbility_SwiftDraw_1",
                    "UnitAbility_Missing",
                ],
                facts: [
                    { label: "Type", value: "Bow" },
                    { label: "Slot", value: "Weapon" },
                    { label: "Rarity", value: "Rare" },
                    { label: "Tier", value: "2" },
                    { label: "Value", value: "400.00" },
                ],
                sections: [
                    {
                        title: "Effects",
                        lines: ["+1 [Might] Might", "+1 [Determination] Determination"],
                    },
                    {
                        title: "Granted abilities",
                        items: [
                            { label: "Ranged IV", referenceKey: "UnitAbility_Ranged_4" },
                            { label: "Defense Expert II", referenceKey: "UnitAbility_DefenseExpert_2" },
                            { label: "Overwatch I", referenceKey: "UnitAbility_Overwatch_1" },
                            { label: "Swift Draw I", referenceKey: "UnitAbility_SwiftDraw_1" },
                            { label: "Unresolved Strike", referenceKey: "UnitAbility_Missing" },
                        ],
                    },
                ],
            },
            {
                exportKind: "equipment",
                entryKey: "Equipment_ArchitePlate",
                displayName: "Archite Plate",
                descriptionLines: [],
                referenceKeys: ["UnitAbility_DefenseExpert_2"],
                facts: [
                    { label: "Type", value: "Armor" },
                    { label: "Slot", value: "Armor" },
                    { label: "Rarity", value: "Legendary" },
                    { label: "Tier", value: "3" },
                    { label: "Value", value: "1000.00" },
                ],
                sections: [
                    {
                        title: "Effects",
                        lines: ["+20 [Defense] Defense on Hero"],
                    },
                    {
                        title: "Granted abilities",
                        items: [{ label: "Defense Expert II", referenceKey: "UnitAbility_DefenseExpert_2" }],
                    },
                ],
            },
            {
                exportKind: "abilities",
                entryKey: "UnitAbility_Ranged_4",
                displayName: "Ranged IV",
                category: "Passive",
                kind: "Ability",
                descriptionLines: [],
                referenceKeys: [],
                facts: [
                    { label: "Kind", value: "Ability" },
                    { label: "Category", value: "Passive" },
                ],
                sections: [{ title: "Effects", lines: ["+4 [AttackRange] Attack Range"] }],
            },
            {
                exportKind: "abilities",
                entryKey: "UnitAbility_DefenseExpert_2",
                displayName: "Defense Expert II",
                category: "Passive",
                kind: "Ability",
                descriptionLines: [],
                referenceKeys: [],
                facts: [
                    { label: "Kind", value: "Ability" },
                    { label: "Category", value: "Passive" },
                ],
                sections: [{ title: "Effects", lines: ["+20 [Defense] Defense"] }],
            },
            {
                exportKind: "abilities",
                entryKey: "UnitAbility_Overwatch_1",
                displayName: "Overwatch I",
                category: "Reaction",
                kind: "Ability",
                descriptionLines: [],
                referenceKeys: [],
                facts: [
                    { label: "Kind", value: "Ability" },
                    { label: "Category", value: "Reaction" },
                ],
                sections: [{ title: "Effects", lines: ["Retaliates against attackers"] }],
            },
            {
                exportKind: "abilities",
                entryKey: "UnitAbility_SwiftDraw_1",
                displayName: "Swift Draw I",
                category: "Passive",
                kind: "Ability",
                descriptionLines: [],
                referenceKeys: [],
                facts: [
                    { label: "Kind", value: "Ability" },
                    { label: "Category", value: "Passive" },
                ],
                sections: [{ title: "Effects", lines: ["Acts earlier in battle"] }],
            },
        ];

        seedCodexEntries(entries);

        render(
            <MemoryRouter initialEntries={["/codex?category=equipment"]}>
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

        expect(await screen.findByRole("heading", { name: "All Equipment" })).toBeInTheDocument();
        expect(screen.getByLabelText("Equipment filters")).toBeInTheDocument();
        expect(screen.queryByLabelText("Codex results")).not.toBeInTheDocument();

        const typeGroup = screen.getByRole("group", { name: "Type" });
        const rarityGroup = screen.getByRole("group", { name: "Rarity" });
        expect(within(typeGroup).getByRole("button", { name: "Bow 1" })).toBeInTheDocument();
        expect(within(typeGroup).getByRole("button", { name: "Armor 1" })).toBeInTheDocument();
        expect(within(rarityGroup).getByRole("button", { name: "Rare 1" })).toBeInTheDocument();

        const bloodmarkRow = getSummaryRowForButton(screen.getByRole("button", { name: /bloodmark bow/i }));
        expect(bloodmarkRow).toHaveTextContent("Bloodmark Bow");
        expect(bloodmarkRow).toHaveTextContent("+1");
        expect(bloodmarkRow).toHaveTextContent("Might");
        expect(bloodmarkRow).toHaveTextContent("Determination");
        expect(screen.getAllByText("Bow").length).toBeGreaterThan(0);
        expect(screen.getAllByText("Rare").length).toBeGreaterThan(0);
        expect(screen.getByText("Tier 2")).toBeInTheDocument();
        expect(screen.getByText("Value 400")).toBeInTheDocument();
        expect(bloodmarkRow).toHaveTextContent("Grants:");
        expect(within(bloodmarkRow).getByRole("button", { name: "Open Ranged IV in Codex" })).toBeInTheDocument();
        expect(within(bloodmarkRow).getByRole("button", { name: "Open Defense Expert II in Codex" })).toBeInTheDocument();
        expect(within(bloodmarkRow).getByRole("button", { name: "Open Overwatch I in Codex" })).toBeInTheDocument();
        expect(bloodmarkRow).toHaveTextContent("+1 more");
        expect(bloodmarkRow.querySelector(".codex-grantedAbilityPreview")).not.toBeInTheDocument();
        expect(screen.queryByText("Unresolved Strike")).not.toBeInTheDocument();

        await user.hover(within(bloodmarkRow).getByRole("button", { name: "Open Ranged IV in Codex" }));

        expect(await screen.findByRole("tooltip")).toHaveTextContent("Ranged IV");
        expect(screen.getByRole("tooltip")).toHaveTextContent("Attack Range");

        await user.click(within(typeGroup).getByRole("button", { name: "Bow 1" }));

        expect(screen.getByText("Bloodmark Bow")).toBeInTheDocument();
        expect(screen.queryByText("Archite Plate")).not.toBeInTheDocument();

        const filteredBloodmarkRow = getSummaryRowForButton(screen.getByRole("button", { name: /bloodmark bow/i }));
        await user.click(within(filteredBloodmarkRow).getByRole("button", { name: "Open Ranged IV in Codex" }));

        expect(await screen.findByRole("heading", { name: "Ranged IV" })).toBeInTheDocument();
        expect(screen.getByTestId("location-probe")).toHaveTextContent("/codex?entry=UnitAbility_Ranged_4");

        await user.click(within(typeGroup).getByRole("button", { name: "Bow 1" }));

        expect(screen.getByText("Archite Plate")).toBeInTheDocument();
    });

    it("returns from Equipment detail to the archive list when a rail filter changes", async () => {
        const user = userEvent.setup();
        const entries: CodexEntry[] = [
            {
                exportKind: "equipment",
                entryKey: "Equipment_BloodmarkBow",
                displayName: "Bloodmark Bow",
                descriptionLines: [],
                referenceKeys: [],
                facts: [
                    { label: "Type", value: "Bow" },
                    { label: "Rarity", value: "Rare" },
                    { label: "Tier", value: "2" },
                    { label: "Value", value: "400.00" },
                ],
                sections: [{ title: "Effects", lines: ["+1 [Might] Might"] }],
            },
            {
                exportKind: "equipment",
                entryKey: "Equipment_ArchitePlate",
                displayName: "Archite Plate",
                descriptionLines: [],
                referenceKeys: [],
                facts: [
                    { label: "Type", value: "Armor" },
                    { label: "Rarity", value: "Legendary" },
                    { label: "Tier", value: "3" },
                    { label: "Value", value: "1000.00" },
                ],
                sections: [{ title: "Effects", lines: ["+20 [Defense] Defense on Hero"] }],
            },
        ];

        seedCodexEntries(entries);

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

        await user.click(within(screen.getByRole("group", { name: "Rarity" })).getByRole("button", { name: "Rare 1" }));

        expect(await screen.findByRole("heading", { name: "All Equipment" })).toBeInTheDocument();
        expect(screen.getByTestId("location-probe")).toHaveTextContent("/codex?category=equipment");
        expect(screen.getByText("Bloodmark Bow")).toBeInTheDocument();
        expect(screen.queryByText("Archite Plate")).not.toBeInTheDocument();
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

    it("enriches District details with exact planning links without changing archive rows", async () => {
        const user = userEvent.setup();
        const entries: CodexEntry[] = [
            {
                exportKind: "districts",
                entryKey: "District_Current",
                displayName: "Canal District",
                descriptionLines: [],
                referenceKeys: ["Tech_Irrigation", "District_GrandCanal", "Tech_RelatedOnly"],
                facts: [{ label: "Category", value: "Food" }],
                sections: [{ title: "Effects", lines: ["+10 [FoodColored] Food"] }],
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
                entryKey: "District_GrandCanal",
                displayName: "Grand Canal",
                descriptionLines: ["A larger canal district."],
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
                districtKey: "District_Current",
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

        const planningSection = screen.getByRole("region", { name: "Planning" });
        expect(within(planningSection).getByText("Unlocked by")).toBeInTheDocument();
        expect(within(planningSection).getByText("Upgrades into")).toBeInTheDocument();
        expect(within(planningSection).getByText("Placement")).toBeInTheDocument();
        const techLink = within(planningSection).getByRole("button", {
            name: "Open Irrigation in Codex",
        });
        expect(techLink).toHaveTextContent("Irrigation");
        expect(within(planningSection).getByRole("button", {
            name: "Open Grand Canal in Codex",
        })).toHaveTextContent("Grand Canal");
        expect(planningSection).toHaveTextContent("4 adjacent districts");
        expect(planningSection).toHaveTextContent("Adjacent tile in same region");
        expect(planningSection).not.toHaveTextContent("Tech_Missing");

        const relatedSection = screen.getByRole("region", { name: /related entries/i });
        expect(within(relatedSection).queryByRole("button", { name: /irrigation/i })).not.toBeInTheDocument();
        expect(within(relatedSection).queryByRole("button", { name: /grand canal/i })).not.toBeInTheDocument();
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

    it("enriches Hero details with exact origin, skill paths, and default skill ability links", async () => {
        const user = userEvent.setup();
        const entries: CodexEntry[] = [
            {
                exportKind: "heroes",
                entryKey: "Hero_Current",
                displayName: "Lieutenant Brezvez",
                descriptionLines: ["Faction: Kin of Sheredyn", "Class: Archer"],
                referenceKeys: ["Faction_Kin", "UnitAbility_Hero_Archer02"],
                facts: [
                    { label: "Faction", value: "Kin of Sheredyn" },
                    { label: "Class", value: "Archer" },
                ],
                sections: [{
                    title: "Stats",
                    lines: [
                        "+140 [Health] Health",
                        "+40 [Damage] Damage",
                        "+3 [MovementPoints] Movement Points",
                        "+5% [Experience] Experience gain per [Intuition] Intuition",
                    ],
                }],
            },
            {
                exportKind: "factions",
                entryKey: "Faction_Kin",
                displayName: "Kin of Sheredyn",
                descriptionLines: ["Ranged major faction."],
                referenceKeys: [],
            },
            {
                exportKind: "abilities",
                entryKey: "UnitAbility_Hero_Archer02",
                displayName: "Terrain Logistics",
                descriptionLines: ["Gain experience for the army."],
                referenceKeys: [],
                facts: [{ label: "Ability mechanic", value: "Passive" }],
                sections: [{ title: "Effects", lines: ["Gain 5 [Experience] Experience"] }],
            },
        ];

        seedCodexEntries(entries);
        seedHeroes([
            heroFixture({
                unitKey: "Hero_Current",
                originFactionKey: "Faction_Kin",
                applicableSkillTreeKeys: [
                    "HeroSkillTree_Archer",
                    "HeroSkillTree_Faction",
                    "HeroSkillTree_Synergy",
                ],
            }),
        ]);
        seedSkills({
            skillTrees: [
                heroSkillTree({ treeKey: "HeroSkillTree_Archer", treeType: "Class" }),
                heroSkillTree({
                    treeKey: "HeroSkillTree_Faction",
                    treeType: "Faction",
                    tierPlacementKeys: ["HeroSkillTree_Faction::HeroSkillTier_Faction_2"],
                    tierKeys: ["HeroSkillTier_Faction_2"],
                    skillKeys: ["HeroSkill_Faction02"],
                }),
                heroSkillTree({
                    treeKey: "HeroSkillTree_Synergy",
                    treeType: "Synergy",
                    tierPlacementKeys: [],
                    tierKeys: [],
                    skillKeys: [],
                }),
            ],
            skillTiers: [
                heroSkillTier({}),
                heroSkillTier({
                    tierPlacementKey: "HeroSkillTree_Faction::HeroSkillTier_Faction_2",
                    tierKey: "HeroSkillTier_Faction_2",
                    treeKey: "HeroSkillTree_Faction",
                    treeType: "Faction",
                    tierIndex: 1,
                    levelPrerequisite: 4,
                    skillKeys: ["HeroSkill_Faction02"],
                }),
            ],
            skills: [
                heroSkill({
                    skillKey: "HeroSkill_Archer02",
                    publicDisplayName: "Terrain Logistics",
                    primaryAbilityKey: "UnitAbility_Hero_Archer02",
                    resolvedSummaryLines: [
                        "Gain 5 [Experience] Experience to all Units of the Army",
                    ],
                }),
                heroSkill({
                    skillKey: "HeroSkill_Faction02",
                    publicDisplayName: "Patient Mentor",
                    primaryAbilityKey: "UnitAbility_Missing",
                    resolvedSummaryLines: [
                        "Gain 5 [Experience] Experience to non-Hero Units of the Army",
                    ],
                }),
            ],
            heroSkillDefaults: [
                {
                    heroKey: "Hero_Current",
                    defaultSkillKeys: ["HeroSkill_Archer02"],
                    referenceKeys: ["HeroSkill_Archer02"],
                    factionKey: "Faction_Kin",
                    classKey: "HeroClass_Archer",
                },
            ],
        });

        render(
            <MemoryRouter initialEntries={["/codex?category=heroes&entry=Hero_Current"]}>
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

        expect(await screen.findByRole("heading", { name: "Lieutenant Brezvez" })).toBeInTheDocument();

        const heroProfile = screen.getByRole("region", { name: "Hero profile" });
        expect(within(heroProfile).queryByText("Origin")).not.toBeInTheDocument();
        expect(within(heroProfile).getAllByText("Faction").length).toBeGreaterThanOrEqual(1);
        const originLink = within(heroProfile).getByRole("button", { name: "Open Kin of Sheredyn in Codex" });
        expect(originLink).toHaveTextContent("Kin of Sheredyn");
        expect(within(heroProfile).getAllByText("Class").length).toBeGreaterThanOrEqual(2);
        expect(within(heroProfile).getByText("Archer")).toBeInTheDocument();
        const baseStats = within(heroProfile).getByRole("region", { name: "Base stats" });
        expect(baseStats).toHaveTextContent("Damage");
        expect(baseStats).toHaveTextContent("Health");
        expect(baseStats).toHaveTextContent("Movement Points");
        expect(within(heroProfile).getByRole("region", { name: "Scaling" })).toHaveTextContent(
            "Experience gain per Intuition"
        );
        expect(within(heroProfile).getByText("Skill paths")).toBeInTheDocument();
        expect(heroProfile).toHaveTextContent("Class");
        expect(heroProfile).toHaveTextContent("Faction");
        expect(heroProfile).toHaveTextContent("Synergy");
        expect(within(heroProfile).getByText("Starting skills")).toBeInTheDocument();
        expect(within(heroProfile).getAllByText("Terrain Logistics").length).toBeGreaterThanOrEqual(2);
        expect(heroProfile).toHaveTextContent("Gain 5");
        expect(heroProfile).toHaveTextContent("Experience to all Units of the Army");
        expect(within(heroProfile).getByText("Skill options")).toBeInTheDocument();
        expect(within(heroProfile).getByRole("region", { name: "Class skill options" })).toBeInTheDocument();
        expect(within(heroProfile).getByRole("region", { name: "Faction skill options" })).toBeInTheDocument();
        expect(within(heroProfile).getByRole("region", { name: "Unlock threshold 0" })).toHaveTextContent(
            "Unlock threshold: 0"
        );
        expect(within(heroProfile).getByRole("region", { name: "Unlock threshold 4" })).toHaveTextContent(
            "Unlock threshold: 4"
        );
        expect(within(heroProfile).queryByRole("region", { name: "T1 skills" })).not.toBeInTheDocument();
        expect(within(heroProfile).queryByRole("region", { name: "T4 skills" })).not.toBeInTheDocument();
        expect(heroProfile).toHaveTextContent("Patient Mentor");
        expect(heroProfile).not.toHaveTextContent("UnitAbility_Missing");

        const abilityLinks = within(heroProfile).getAllByRole("button", {
            name: "Open Terrain Logistics in Codex",
        });
        expect(abilityLinks).toHaveLength(2);
        const abilityLink = abilityLinks[0];
        await user.hover(abilityLink);
        expect(await screen.findByRole("tooltip")).toHaveTextContent("Terrain Logistics");
        await user.unhover(abilityLink);
        await waitFor(() => expect(screen.queryByRole("tooltip")).not.toBeInTheDocument());

        expect(screen.queryByRole("region", { name: /related entries/i })).not.toBeInTheDocument();
        expect(screen.queryByText("Hero dossier")).not.toBeInTheDocument();

        await user.click(abilityLink);
        expect(await screen.findByRole("heading", { name: "Terrain Logistics" })).toBeInTheDocument();
        expect(screen.getByTestId("location-probe")).toHaveTextContent("/codex?entry=UnitAbility_Hero_Archer02");

        await user.click(within(getCategoryToolbar()).getByRole("button", { name: "Heroes" }));
        const heroesOverview = await screen.findByLabelText("Heroes overview");
        expect(heroesOverview).toHaveTextContent("Lieutenant Brezvez");
        expect(within(heroesOverview).queryByText("Hero profile")).not.toBeInTheDocument();
        expect(within(heroesOverview).queryByText("Starting skills")).not.toBeInTheDocument();
    });

    it("hides Hero rich enrichment when rich data or exact targets are unavailable", async () => {
        const entries: CodexEntry[] = [
            {
                exportKind: "heroes",
                entryKey: "Hero_Current",
                displayName: "Current Hero",
                descriptionLines: ["A public hero."],
                referenceKeys: [],
                facts: [{ label: "Class", value: "Archer" }],
            },
            {
                exportKind: "tech",
                entryKey: "Faction_Kin",
                displayName: "Wrong Kind Origin",
                descriptionLines: [],
                referenceKeys: [],
            },
            {
                exportKind: "statuses",
                entryKey: "UnitAbility_Hero_Archer02",
                displayName: "Wrong Kind Ability",
                descriptionLines: [],
                referenceKeys: [],
            },
        ];

        seedCodexEntries(entries);
        render(
            <MemoryRouter initialEntries={["/codex?category=heroes&entry=Hero_Current"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "Current Hero" })).toBeInTheDocument();
        expect(screen.queryByRole("region", { name: "Hero profile" })).not.toBeInTheDocument();

        cleanup();
        seedCodexEntries(entries);
        seedHeroes([
            heroFixture({
                unitKey: "Hero_Current",
                originFactionKey: "Faction_Kin",
                hiddenHelperAbilityKeys: ["UnitAbility_Hero_Archer02"],
                applicableSkillTreeKeys: ["HeroSkillTree_Hidden"],
            }),
        ]);
        seedSkills({
            skillTrees: [
                heroSkillTree({
                    treeKey: "HeroSkillTree_Hidden",
                    treeType: "Hidden",
                    isHidden: true,
                }),
            ],
            skills: [
                heroSkill({
                    skillKey: "HeroSkill_Raw",
                    publicDisplayName: null,
                    resolvedDisplayName: "HeroSkill_Raw",
                    primaryAbilityKey: "UnitAbility_Hero_Archer02",
                }),
            ],
            heroSkillDefaults: [
                {
                    heroKey: "Hero_Current",
                    defaultSkillKeys: ["HeroSkill_Raw"],
                    referenceKeys: [],
                    factionKey: null,
                    classKey: null,
                },
            ],
        });

        render(
            <MemoryRouter initialEntries={["/codex?category=heroes&entry=Hero_Current"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "Current Hero" })).toBeInTheDocument();
        const heroProfile = screen.getByRole("region", { name: "Hero profile" });
        expect(within(heroProfile).getByText("Class")).toBeInTheDocument();
        expect(heroProfile).not.toHaveTextContent("Wrong Kind Origin");
        expect(heroProfile).not.toHaveTextContent("Wrong Kind Ability");
        expect(heroProfile).not.toHaveTextContent("HeroSkill_Raw");
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

    it("enriches major Faction details from exact rich faction keys and hides surfaced package links from generic related entries", async () => {
        const user = userEvent.setup();
        const entries: CodexEntry[] = [
            {
                exportKind: "factions",
                entryKey: "Faction_Aspect",
                displayName: "Aspects",
                descriptionLines: ["Affinity: Aspects"],
                referenceKeys: ["Trait_Diplomat", "Unit_Sentry", "Tech_Aspect", "Hero_Aspect"],
            },
            {
                exportKind: "traits",
                entryKey: "Trait_Diplomat",
                displayName: "Diplomat",
                descriptionLines: ["Treaties are easier."],
                referenceKeys: [],
            },
            {
                exportKind: "populations",
                entryKey: "Population_Aspect",
                displayName: "Aspects",
                descriptionLines: ["Symbiotic population."],
                referenceKeys: [],
            },
            {
                exportKind: "units",
                entryKey: "Unit_Sentry",
                displayName: "Sentry",
                descriptionLines: ["Opening army unit."],
                referenceKeys: [],
            },
            {
                exportKind: "heroes",
                entryKey: "Hero_Aspect",
                displayName: "Polemephon",
                descriptionLines: ["Faction hero."],
                referenceKeys: [],
            },
            {
                exportKind: "tech",
                entryKey: "Tech_Aspect",
                displayName: "Symbiotic Research",
                descriptionLines: ["Faction technology."],
                referenceKeys: [],
            },
            {
                exportKind: "quests",
                entryKey: "FactionQuest_Aspect_Chapter01_Step01",
                displayName: "Aspect Awakening",
                category: "MajorFaction",
                kind: "Quest",
                descriptionLines: ["Quest opener."],
                referenceKeys: [],
            },
            {
                exportKind: "traits",
                entryKey: "Trait_UnresolvedByRich",
                displayName: "Unresolved by Rich",
                descriptionLines: ["Only a public reference."],
                referenceKeys: [],
            },
        ];

        seedCodexEntries(entries);
        seedRichFactions([
            richFaction({
                factionKey: "Faction_Aspect",
                traitKeys: ["Trait_Diplomat", "Trait_Missing"],
                populationKeys: ["Population_Aspect"],
                baseUnitKeys: ["Unit_Sentry"],
                unitKeys: ["Unit_Sentry", "Unit_RosterOnly"],
                heroKeys: ["Hero_Aspect"],
                gatedTechnologyKeys: ["Tech_Aspect"],
                startingFactionQuestKey: "FactionQuest_Aspect_Chapter01_Step01",
            }),
        ]);

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
        expect(within(packageSection).getByText("Faction Traits")).toBeInTheDocument();
        expect(within(packageSection).getByText("Population")).toBeInTheDocument();
        expect(within(packageSection).getByText("Core Units")).toBeInTheDocument();
        expect(within(packageSection).getAllByText("Heroes").length).toBeGreaterThan(0);
        expect(within(packageSection).getByText("Faction Techs")).toBeInTheDocument();
        expect(within(packageSection).getByText("Questline")).toBeInTheDocument();
        expect(within(packageSection).getByRole("button", { name: /Diplomat/ })).toBeInTheDocument();
        expect(within(packageSection).getByRole("button", { name: /Sentry/ })).toBeInTheDocument();
        expect(within(packageSection).queryByRole("button", { name: /Unit_RosterOnly/ })).not.toBeInTheDocument();

        const relatedSection = within(detailPane).queryByRole("region", { name: /related entries/i });
        expect(relatedSection).toBeNull();

        await user.click(within(packageSection).getByRole("button", { name: /Sentry/ }));
        expect(await screen.findByTestId("location-probe")).toHaveTextContent("/codex?entry=Unit_Sentry");
    });

    it("enriches Minor Faction details with exact rich protectorate package links", async () => {
        const entries: CodexEntry[] = [
            {
                exportKind: "minorFactions",
                entryKey: "MinorFaction_Ametrine",
                displayName: "Ametrine",
                category: null,
                kind: "MinorFaction",
                descriptionLines: [
                    "Disposition: Pacifist",
                    "Faction affinity: Ametrine",
                    "Ametrine lore.",
                ],
                referenceKeys: ["Population_Ametrine", "Unit_Ametrine", "Trait_Ametrine"],
                facts: [
                    { label: "Kind", value: "MinorFaction" },
                    { label: "Disposition", value: "Pacifist" },
                    { label: "Faction affinity", value: "Ametrine" },
                ],
                sections: [{ title: "Identity", lines: ["Ametrine lore."] }],
            },
            {
                exportKind: "populations",
                entryKey: "Population_Ametrine",
                displayName: "Ametrine",
                descriptionLines: ["Population."],
                referenceKeys: [],
            },
            {
                exportKind: "units",
                entryKey: "Unit_Ametrine",
                displayName: "Crusher",
                descriptionLines: ["Minor faction unit."],
                referenceKeys: [],
            },
            {
                exportKind: "heroes",
                entryKey: "Hero_Ametrine",
                displayName: "Ametrine Elder",
                descriptionLines: ["Minor faction notable."],
                referenceKeys: [],
            },
            {
                exportKind: "traits",
                entryKey: "Trait_Ametrine",
                displayName: "Chant of the Rocks",
                descriptionLines: ["Protectorate trait."],
                referenceKeys: [],
            },
            {
                exportKind: "quests",
                entryKey: "MinorFaction_SpecificQuest_Ametrine01",
                displayName: "Ametrine Quest",
                category: "MinorFaction",
                kind: "Quest",
                descriptionLines: ["Quest."],
                referenceKeys: [],
            },
        ];

        seedCodexEntries(entries);
        seedRichFactions([
            richFaction({
                factionKey: "MinorFaction_Ametrine",
                publicDisplayName: "Ametrine",
                factionKind: "minor",
                populationKeys: ["Population_Ametrine"],
                baseUnitKeys: ["Unit_Ametrine"],
                heroKeys: ["Hero_Ametrine"],
                protectorateTraitKeys: ["Trait_Ametrine"],
                specificQuestKeys: ["MinorFaction_SpecificQuest_Ametrine01"],
            }),
        ]);

        render(
            <MemoryRouter initialEntries={["/codex?category=minorfactions&entry=MinorFaction_Ametrine"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        const detailPane = await screen.findByLabelText(/selected codex entry/i);
        expect(within(detailPane).getByText("Identity")).toBeInTheDocument();
        const packageSection = within(detailPane).getByRole("region", { name: "Faction package" });
        expect(within(packageSection).getByText("Core Unit")).toBeInTheDocument();
        expect(within(packageSection).getByText("Protectorate Traits")).toBeInTheDocument();
        expect(within(packageSection).getByText("Quest")).toBeInTheDocument();
        expect(within(packageSection).getByRole("button", { name: /Crusher/ })).toBeInTheDocument();
        expect(within(packageSection).getByRole("button", { name: /Chant of the Rocks/ })).toBeInTheDocument();
        expect(within(packageSection).getByRole("button", { name: /Ametrine Quest/ })).toBeInTheDocument();
        expect(within(detailPane).queryByRole("region", { name: /related entries/i })).toBeNull();
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
        expect(within(getCategoryToolbar()).getByRole("button", { name: /diplomacy/i })).toBeInTheDocument();
        expect(screen.getByRole("complementary", { name: /diplomacy archive filters/i })).toBeInTheDocument();
        expect(screen.queryByRole("complementary", { name: /codex results/i })).not.toBeInTheDocument();
        expect(screen.getByText("Diplomatic treaty dossier")).toBeInTheDocument();
        expect(screen.getByText("Beneficial Discovery")).toBeInTheDocument();
        expect(screen.getByText("30 turns")).toBeInTheDocument();

        const diplomacyRail = screen.getByRole("complementary", { name: /diplomacy archive filters/i });
        await user.click(within(diplomacyRail).getByRole("button", { name: "Defense 1" }));
        await user.click(within(screen.getByLabelText("Diplomacy overview")).getByRole("button", { name: /open borders/i }));
        expect(await screen.findByRole("heading", { name: "Open Borders" })).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Effects" })).toBeInTheDocument();
        expect(screen.getAllByText("Units may enter allied territories without Public Opinion loss.").length)
            .toBeGreaterThanOrEqual(1);

        await user.click(within(diplomacyRail).getByRole("button", { name: "War 1" }));
        await user.click(within(screen.getByLabelText("Diplomacy overview")).getByRole("button", { name: /justified war/i }));
        expect(await screen.findByRole("heading", { name: "Justified War" })).toBeInTheDocument();
        expect(screen.getAllByText("War").length).toBeGreaterThanOrEqual(1);
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
        expect(screen.getByRole("complementary", { name: /action archive filters/i })).toBeInTheDocument();
        expect(screen.getByText("Action dossier")).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Cost modifiers" })).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Turn cost multiplier" })).toBeInTheDocument();
        expect(screen.queryByText("Reference key")).not.toBeInTheDocument();
        expect(screen.queryByText("ActionTypeBuildBridge")).not.toBeInTheDocument();
        expect(screen.queryByText("No public description has been added for this entry yet.")).not.toBeInTheDocument();

        cleanup();
        useCodexStore.setState({
            entries,
            entriesByKey: buildEntriesByKey(entries),
            entriesByKind: { actions: entries },
            entriesByKindKey: buildEntriesByKindKey(entries),
            loading: false,
            error: null,
        });

        render(
            <MemoryRouter initialEntries={["/codex?category=actions&entry=ActionTypeBuildDam"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "Build Dam" })).toBeInTheDocument();
        expect(screen.getByText("0.90")).toBeInTheDocument();
        expect(screen.getAllByText(/Reduces the/).length).toBeGreaterThanOrEqual(1);

        cleanup();
        useCodexStore.setState({
            entries,
            entriesByKey: buildEntriesByKey(entries),
            entriesByKind: { actions: entries },
            entriesByKindKey: buildEntriesByKindKey(entries),
            loading: false,
            error: null,
        });

        render(
            <MemoryRouter initialEntries={["/codex?category=actions&entry=FactionActionTypeMukag_MonsoonFestival"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "Mukag Monsoon Festival" })).toBeInTheDocument();
        expect(within(screen.getByRole("region", { name: /selected codex entry/i }))
            .getAllByText("Faction Action").length).toBeGreaterThanOrEqual(1);

        cleanup();
        useCodexStore.setState({
            entries,
            entriesByKey: buildEntriesByKey(entries),
            entriesByKind: { actions: entries },
            entriesByKindKey: buildEntriesByKindKey(entries),
            loading: false,
            error: null,
        });

        render(
            <MemoryRouter initialEntries={["/codex?category=actions&entry=EmpireActionTypeMukag_Light01"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

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
        expect(within(resultsPane).getByText("Diplomacy")).toBeInTheDocument();

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
        const detailPane = screen.getByRole("region", { name: /selected codex entry/i });
        expect(within(detailPane).getByText("Faction")).toBeInTheDocument();
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

        const { container } = render(
            <MemoryRouter initialEntries={["/codex?category=traits&entry=Trait_Diplomat"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "Diplomat" })).toBeInTheDocument();
        const traitDossier = container.querySelector(".codex-structuredDossier");
        expect(traitDossier).toBeInTheDocument();
        expect(within(traitDossier as HTMLElement).getByText("Trait dossier")).toBeInTheDocument();
        expect(within(traitDossier as HTMLElement).getByText("Category")).toBeInTheDocument();
        expect(within(traitDossier as HTMLElement).getByText("Faction")).toBeInTheDocument();
        expect(within(traitDossier as HTMLElement).getByText("Required affinity")).toBeInTheDocument();
        expect(within(traitDossier as HTMLElement).getByText("Aspects")).toBeInTheDocument();
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

    it("renders Heroes as an archive with Class and Faction filters", async () => {
        const user = userEvent.setup();
        const entries: CodexEntry[] = [
            {
                exportKind: "heroes",
                entryKey: "Hero_Kin_Archer",
                displayName: "Aria",
                descriptionLines: [],
                referenceKeys: ["Faction_KinOfSheredyn"],
                facts: [
                    { label: "Faction", value: "Kin of Sheredyn" },
                    { label: "Class", value: "Ranged Hero" },
                ],
                sections: [{ title: "Stats", lines: ["+140 [Health] Health", "+40 [Damage] Damage"] }],
            },
            {
                exportKind: "heroes",
                entryKey: "Hero_Kin_Warrior",
                displayName: "Borin",
                descriptionLines: [],
                referenceKeys: ["Faction_KinOfSheredyn"],
                facts: [
                    { label: "Faction", value: "Kin of Sheredyn" },
                    { label: "Class", value: "Infantry Hero" },
                ],
                sections: [{ title: "Stats", lines: ["+200 [Health] Health", "+10 [Defense] Defense"] }],
            },
            {
                exportKind: "heroes",
                entryKey: "Hero_Tahuk_Rider",
                displayName: "Cala",
                descriptionLines: [],
                referenceKeys: [],
                facts: [
                    { label: "Faction", value: "Tahuk" },
                    { label: "Class", value: "Cavalry Hero" },
                ],
                sections: [{ title: "Stats", lines: ["+180 [Health] Health", "+4 [MovementPoints] Movement Points"] }],
            },
            {
                exportKind: "factions",
                entryKey: "Faction_KinOfSheredyn",
                displayName: "Kin of Sheredyn",
                descriptionLines: ["Major faction."],
                referenceKeys: [],
            },
        ];

        seedCodexEntries(entries);

        render(
            <MemoryRouter initialEntries={["/codex?category=heroes"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "All Heroes" })).toBeInTheDocument();
        expect(screen.getByRole("complementary", { name: /hero archive filters/i })).toBeInTheDocument();
        expect(screen.queryByRole("complementary", { name: /codex results/i })).not.toBeInTheDocument();

        const heroRail = screen.getByRole("complementary", { name: /hero archive filters/i });
        expect(within(heroRail).getByRole("button", { name: "Ranged Hero 1" })).toBeInTheDocument();
        expect(within(heroRail).getByRole("button", { name: "Kin of Sheredyn 2" })).toBeInTheDocument();

        const summaryList = screen.getByLabelText("Heroes overview");
        const ariaRow = getSummaryRowForButton(within(summaryList).getByRole("button", { name: /aria/i }));
        expect(within(ariaRow).getByLabelText("Kin of Sheredyn")).toBeInTheDocument();
        expect(ariaRow).toHaveTextContent("Ranged Hero");
        expect(ariaRow).toHaveTextContent("Health");
        expect(ariaRow).toHaveTextContent("Damage");

        await user.click(within(heroRail).getByRole("button", { name: "Ranged Hero 1" }));
        expect(screen.getByRole("heading", { name: "All Heroes" })).toBeInTheDocument();
        expect(within(summaryList).getByRole("button", { name: /aria/i })).toBeInTheDocument();
        expect(within(summaryList).queryByRole("button", { name: /borin/i })).not.toBeInTheDocument();

        await user.click(within(heroRail).getByRole("button", { name: "Kin of Sheredyn 1" }));
        expect(within(summaryList).getByRole("button", { name: /aria/i })).toBeInTheDocument();
        expect(within(summaryList).queryByRole("button", { name: /cala/i })).not.toBeInTheDocument();

        await user.click(within(heroRail).getByRole("button", { name: "Clear" }));
        expect(within(summaryList).getByRole("button", { name: /borin/i })).toBeInTheDocument();
        expect(within(summaryList).getByRole("button", { name: /cala/i })).toBeInTheDocument();
    });

    it("returns from Hero detail to the archive when Hero filters change", async () => {
        const user = userEvent.setup();
        const entries: CodexEntry[] = [
            {
                exportKind: "heroes",
                entryKey: "Hero_Kin_Archer",
                displayName: "Aria",
                descriptionLines: [],
                referenceKeys: [],
                facts: [
                    { label: "Faction", value: "Kin of Sheredyn" },
                    { label: "Class", value: "Ranged Hero" },
                ],
                sections: [{ title: "Stats", lines: ["+140 [Health] Health"] }],
            },
        ];

        seedCodexEntries(entries);

        render(
            <MemoryRouter initialEntries={["/codex?category=heroes&entry=Hero_Kin_Archer"]}>
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

        expect(await screen.findByRole("heading", { name: "Aria" })).toBeInTheDocument();
        const heroRail = screen.getByRole("complementary", { name: /hero archive filters/i });
        await user.click(within(heroRail).getByRole("button", { name: "Ranged Hero 1" }));

        await waitFor(() => {
            expect(screen.getByTestId("location-probe")).toHaveTextContent("/codex?category=heroes");
        });
        expect(screen.getByRole("heading", { name: "All Heroes" })).toBeInTheDocument();
    });

    it("renders exact Hero granted ability links without unresolved reference leakage", async () => {
        const user = userEvent.setup();
        const entries: CodexEntry[] = [
            {
                exportKind: "heroes",
                entryKey: "Hero_GreenScion",
                displayName: "Clar'usta",
                descriptionLines: [],
                referenceKeys: ["Ability_Fly", "UnitAbility_Hero_Unresolved"],
                facts: [
                    { label: "Faction", value: "Green Scion" },
                    { label: "Class", value: "Flying Swarm Hero" },
                ],
                sections: [{ title: "Stats", lines: ["+140 [Health] Health", "+3 [MovementPoints] Movement Points"] }],
            },
            {
                exportKind: "abilities",
                entryKey: "Ability_Fly",
                displayName: "Flying",
                descriptionLines: ["Can fly over terrain."],
                referenceKeys: [],
                facts: [{ label: "Ability mechanic", value: "Passive" }],
                sections: [{ title: "Effects", lines: ["Can pass over blockers."] }],
            },
        ];

        seedCodexEntries(entries);

        render(
            <MemoryRouter initialEntries={["/codex?category=heroes"]}>
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

        const summaryList = await screen.findByLabelText("Heroes overview");
        const heroRow = getSummaryRowForButton(within(summaryList).getByRole("button", { name: /clar'usta/i }));
        expect(heroRow).not.toHaveTextContent("Grants:");
        expect(within(heroRow).getByRole("button", { name: /open flying in codex/i })).toBeInTheDocument();
        expect(heroRow).not.toHaveTextContent("UnitAbility_Hero_Unresolved");

        await user.click(within(heroRow).getByRole("button", { name: /open flying in codex/i }));
        await waitFor(() => {
            expect(screen.getByTestId("location-probe")).toHaveTextContent("/codex?entry=Ability_Fly");
        });
        expect(screen.getByRole("heading", { name: "Flying" })).toBeInTheDocument();
    });

    it("renders Units as an archive with Class, Faction, and Tier filters", async () => {
        const user = userEvent.setup();
        const entries: CodexEntry[] = [
            {
                exportKind: "units",
                entryKey: "Unit_Kin_Archer",
                displayName: "Archer",
                descriptionLines: [],
                referenceKeys: ["Faction_KinOfSheredyn", "Ability_Ranged"],
                facts: [
                    { label: "Kind", value: "Unit" },
                    { label: "Tier", value: "1" },
                    { label: "Faction", value: "Kin of Sheredyn" },
                    { label: "Class", value: "Ranged" },
                    { label: "Spawn type", value: "Land" },
                ],
                sections: [
                    {
                        title: "Granted abilities",
                        items: [{ label: "Ranged III", referenceKey: "Ability_Ranged" }],
                    },
                    {
                        title: "Stats",
                        lines: [
                            "+3 [AttackRange] Attack Range",
                            "+140 [Health] Health",
                            "+40 [Damage] Damage",
                            "+3 [MovementPoints] Movement Points",
                        ],
                    },
                ],
            },
            {
                exportKind: "units",
                entryKey: "Unit_Kin_Warrior",
                displayName: "Warrior",
                descriptionLines: [],
                referenceKeys: ["Faction_KinOfSheredyn"],
                facts: [
                    { label: "Kind", value: "Unit" },
                    { label: "Tier", value: "2" },
                    { label: "Faction", value: "Kin of Sheredyn" },
                    { label: "Class", value: "Infantry" },
                    { label: "Spawn type", value: "Land" },
                ],
                sections: [{ title: "Stats", lines: ["+200 [Health] Health", "+15 [Defense] Defense"] }],
            },
            {
                exportKind: "units",
                entryKey: "Unit_Tahuk_Rider",
                displayName: "Rider",
                descriptionLines: [],
                referenceKeys: [],
                facts: [
                    { label: "Kind", value: "Unit" },
                    { label: "Tier", value: "1" },
                    { label: "Faction", value: "Tahuk" },
                    { label: "Class", value: "Cavalry" },
                    { label: "Spawn type", value: "Land" },
                ],
                sections: [{ title: "Stats", lines: ["+180 [Health] Health", "+4 [MovementPoints] Movement Points"] }],
            },
            {
                exportKind: "factions",
                entryKey: "Faction_KinOfSheredyn",
                displayName: "Kin of Sheredyn",
                descriptionLines: ["Major faction."],
                referenceKeys: [],
            },
            {
                exportKind: "abilities",
                entryKey: "Ability_Ranged",
                displayName: "Ranged III",
                descriptionLines: ["Ranged attack."],
                referenceKeys: [],
                facts: [{ label: "Ability mechanic", value: "Passive" }],
                sections: [{ title: "Effects", lines: ["Can attack at range."] }],
            },
        ];

        seedCodexEntries(entries);

        render(
            <MemoryRouter initialEntries={["/codex?category=units"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "All Units" })).toBeInTheDocument();
        expect(document.querySelector(".codex-workspace--unitArchive")).toBeInTheDocument();
        expect(screen.getByRole("complementary", { name: /unit archive filters/i })).toBeInTheDocument();
        expect(screen.queryByRole("complementary", { name: /codex results/i })).not.toBeInTheDocument();

        const unitRail = screen.getByRole("complementary", { name: /unit archive filters/i });
        expect(within(unitRail).getByRole("button", { name: "Ranged 1" })).toBeInTheDocument();
        expect(within(unitRail).getByRole("button", { name: "Kin of Sheredyn 2" })).toBeInTheDocument();
        expect(within(unitRail).getByRole("button", { name: "Tier 1 2" })).toBeInTheDocument();

        const summaryList = screen.getByLabelText("Units overview");
        const archerRow = getSummaryRowForButton(within(summaryList).getByRole("button", { name: /archer/i }));
        expect(within(archerRow).getByLabelText("Kin of Sheredyn")).toBeInTheDocument();
        expect(archerRow).toHaveTextContent("Ranged");
        expect(archerRow).toHaveTextContent("Tier 1");
        expect(archerRow).toHaveTextContent("Attack Range");
        expect(archerRow).toHaveTextContent("Health");
        expect(within(archerRow).getByRole("button", { name: /open ranged iii in codex/i })).toBeInTheDocument();
        expect(archerRow).not.toHaveTextContent("Spawn type");
        expect(archerRow).not.toHaveTextContent("Kind Unit");

        await user.click(within(unitRail).getByRole("button", { name: "Ranged 1" }));
        expect(within(summaryList).getByRole("button", { name: /archer/i })).toBeInTheDocument();
        expect(within(summaryList).queryByRole("button", { name: /warrior/i })).not.toBeInTheDocument();

        await user.click(within(unitRail).getByRole("button", { name: "Kin of Sheredyn 1" }));
        expect(within(summaryList).getByRole("button", { name: /archer/i })).toBeInTheDocument();
        expect(within(summaryList).queryByRole("button", { name: /rider/i })).not.toBeInTheDocument();

        await user.click(within(unitRail).getByRole("button", { name: "Clear" }));
        expect(within(summaryList).getByRole("button", { name: /warrior/i })).toBeInTheDocument();
        expect(within(summaryList).getByRole("button", { name: /rider/i })).toBeInTheDocument();
    });

    it("returns from Unit detail to the archive when Unit filters change", async () => {
        const user = userEvent.setup();
        const entries: CodexEntry[] = [
            {
                exportKind: "units",
                entryKey: "Unit_Kin_Archer",
                displayName: "Archer",
                descriptionLines: [],
                referenceKeys: [],
                facts: [
                    { label: "Kind", value: "Unit" },
                    { label: "Tier", value: "1" },
                    { label: "Faction", value: "Kin of Sheredyn" },
                    { label: "Class", value: "Ranged" },
                ],
                sections: [{ title: "Stats", lines: ["+140 [Health] Health"] }],
            },
        ];

        seedCodexEntries(entries);

        render(
            <MemoryRouter initialEntries={["/codex?category=units&entry=Unit_Kin_Archer"]}>
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
        const unitRail = screen.getByRole("complementary", { name: /unit archive filters/i });
        await user.click(within(unitRail).getByRole("button", { name: "Ranged 1" }));

        await waitFor(() => {
            expect(screen.getByTestId("location-probe")).toHaveTextContent("/codex?category=units");
        });
        expect(screen.getByRole("heading", { name: "All Units" })).toBeInTheDocument();
    });

    it("keeps unresolved Unit granted ability references out of archive rows", async () => {
        const entries: CodexEntry[] = [
            {
                exportKind: "units",
                entryKey: "Unit_GreenScion_Swarm",
                displayName: "Swarm Guard",
                descriptionLines: [],
                referenceKeys: ["Ability_Swarm", "UnitAbility_Unresolved"],
                facts: [
                    { label: "Kind", value: "Unit" },
                    { label: "Tier", value: "2" },
                    { label: "Faction", value: "Green Scion" },
                    { label: "Class", value: "Swarm" },
                ],
                sections: [
                    {
                        title: "Granted abilities",
                        items: [
                            { label: "Swarm", referenceKey: "Ability_Swarm" },
                            { label: "Missing Unit Gift", referenceKey: "UnitAbility_Unresolved" },
                        ],
                    },
                    { title: "Stats", lines: ["+140 [Health] Health", "+3 [MovementPoints] Movement Points"] },
                ],
            },
            {
                exportKind: "abilities",
                entryKey: "Ability_Swarm",
                displayName: "Swarm",
                descriptionLines: ["Swarm movement."],
                referenceKeys: [],
                facts: [{ label: "Ability mechanic", value: "Passive" }],
                sections: [{ title: "Effects", lines: ["Moves as a swarm."] }],
            },
        ];

        seedCodexEntries(entries);

        render(
            <MemoryRouter initialEntries={["/codex?category=units"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        const summaryList = await screen.findByLabelText("Units overview");
        const unitRow = getSummaryRowForButton(within(summaryList).getByRole("button", { name: /swarm guard/i }));
        expect(within(unitRow).getByRole("button", { name: /open swarm in codex/i })).toBeInTheDocument();
        expect(unitRow).not.toHaveTextContent("Missing Unit Gift");
        expect(unitRow).not.toHaveTextContent("UnitAbility_Unresolved");
    });
});
