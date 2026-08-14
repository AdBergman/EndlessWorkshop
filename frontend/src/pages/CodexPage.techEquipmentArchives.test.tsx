import {
cleanupCodexPageStores,
getSummaryRowForButton,
resetCodexPageTestState,
seedCodexEntries
} from "@/pages/testUtils/codexPageHarness";
import { LocationProbe } from "@/pages/testUtils/codexPageTestUtils";
import type { CodexEntry } from "@/types/dataTypes";
import { cleanup,render,screen,waitFor,within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter,Route,Routes } from "react-router-dom";
import CodexPage from "./CodexPage";

describe("CodexPage Tech Equipment Hero Unit archives", () => {
    beforeEach(() => {
        resetCodexPageTestState();
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
        vi.unstubAllEnvs();
        cleanupCodexPageStores();
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
                sections: [{
                    title: "Stats",
                    lines: [
                        "+140 [Health] Health",
                        "+40 [Damage] Damage",
                        "+3 [MovementPoints] Movement Points",
                        "+5% [Focus] Critical",
                        "+3 [VisionRange] Vision Range",
                    ],
                }],
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
        const ariaMetadata = within(ariaRow).getByLabelText("Hero metadata");
        expect(within(ariaMetadata).getByLabelText("Hero class")).toHaveTextContent("Ranged Hero");
        expect(within(ariaMetadata).getByLabelText("Kin of Sheredyn")).toHaveClass(
            "codex-summaryList__metadataIcon--heroFaction"
        );
        expect(ariaRow).toHaveTextContent("Health");
        expect(ariaRow).toHaveTextContent("Damage");
        expect(ariaRow).toHaveTextContent("0 Defense");
        expect(ariaRow).toHaveTextContent("Vision Range");
        expect(within(ariaRow).getByLabelText("Hero stat preview").querySelectorAll(".codex-summaryList__heroStatLine"))
            .toHaveLength(6);

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
        const archerMetadata = within(archerRow).getByLabelText("Unit metadata");
        expect(within(archerRow).getByLabelText("Kin of Sheredyn")).toBeInTheDocument();
        expect(within(archerMetadata).getByLabelText("Unit type")).toHaveTextContent("Ranged");
        expect(within(archerMetadata).getByLabelText("Unit tags")).toHaveTextContent("Ranged III");
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



});
