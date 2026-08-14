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

describe("CodexPage metadata relationship rendering", () => {
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
        const heroTags = within(heroRow).getByLabelText("Hero tags");
        expect(within(heroTags).getByRole("button", { name: /open flying in codex/i })).toBeInTheDocument();
        expect(heroRow).not.toHaveTextContent("UnitAbility_Hero_Unresolved");

        await user.click(within(heroTags).getByRole("button", { name: /open flying in codex/i }));
        await waitFor(() => {
            expect(screen.getByTestId("location-probe")).toHaveTextContent("/codex?entry=Ability_Fly");
        });
        expect(screen.getByRole("heading", { name: "Flying" })).toBeInTheDocument();
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




});
