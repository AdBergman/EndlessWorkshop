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

describe("CodexPage rich hero enrichment", () => {
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
                    tierPlacementKeys: [
                        "HeroSkillTree_Faction::HeroSkillTier_Faction_2",
                        "HeroSkillTree_Faction::HeroSkillTier_Common_2",
                    ],
                    tierKeys: ["HeroSkillTier_Faction_2", "HeroSkillTier_Common_2"],
                    skillKeys: ["HeroSkill_Faction02", "HeroSkill_Common02"],
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
                heroSkillTier({
                    tierPlacementKey: "HeroSkillTree_Faction::HeroSkillTier_Common_2",
                    tierKey: "HeroSkillTier_Common_2",
                    treeKey: "HeroSkillTree_Faction",
                    treeType: "Faction",
                    tierIndex: 4,
                    levelPrerequisite: 4,
                    skillKeys: ["HeroSkill_Common02"],
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
                heroSkill({
                    skillKey: "HeroSkill_Common02",
                    publicDisplayName: "Tireless Pace",
                    primaryAbilityKey: null,
                    resolvedSummaryLines: [
                        "Gain 1 [MovementPoints] Movement Points",
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
        expect(heroProfile).toHaveTextContent("Common");
        expect(within(heroProfile).getByText("Starting skills")).toBeInTheDocument();
        expect(within(heroProfile).getAllByText("Terrain Logistics").length).toBeGreaterThanOrEqual(2);
        expect(heroProfile).toHaveTextContent("Gain 5");
        expect(heroProfile).toHaveTextContent("Experience to all Units of the Army");
        expect(within(heroProfile).getByText("Skill options")).toBeInTheDocument();
        const classSkillOptions = within(heroProfile).getByRole("region", { name: "Class skill options" });
        expect(classSkillOptions).toBeInTheDocument();
        expect(within(classSkillOptions).getAllByText("Terrain Logistics")).toHaveLength(1);
        expect(within(classSkillOptions).getByRole("button", {
            name: "Open Terrain Logistics in Codex",
        })).toHaveTextContent("Terrain Logistics");
        const factionSkillOptions = within(heroProfile).getByRole("region", { name: "Faction skill options" });
        expect(factionSkillOptions).toBeInTheDocument();
        expect(factionSkillOptions).toHaveTextContent("Patient Mentor");
        expect(factionSkillOptions).not.toHaveTextContent("Tireless Pace");
        const commonSkillOptions = within(heroProfile).getByRole("region", { name: "Common skill options" });
        expect(commonSkillOptions).toHaveTextContent("Tireless Pace");
        expect(within(heroProfile).getByRole("region", { name: "Unlock threshold 0" })).toHaveTextContent(
            "Unlock threshold: 0"
        );
        expect(within(heroProfile).getAllByRole("region", { name: "Unlock threshold 4" })).toHaveLength(2);
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



});
