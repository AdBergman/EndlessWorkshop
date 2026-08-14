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
import { cleanup,render,screen,waitFor,within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter,Route,Routes } from "react-router-dom";
import CodexPage from "./CodexPage";

describe("CodexPage ability archive", () => {
    beforeEach(() => {
        resetCodexPageTestState();
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
        vi.unstubAllEnvs();
        cleanupCodexPageStores();
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



});
