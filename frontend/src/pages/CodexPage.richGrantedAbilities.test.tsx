import { buildEntriesByKey,buildEntriesByKindKey } from "@/lib/codex/codexRefs";
import {
cleanupCodexPageStores,
resetCodexPageTestState
} from "@/pages/testUtils/codexPageHarness";
import { LocationProbe } from "@/pages/testUtils/codexPageTestUtils";
import { useCodexStore } from "@/stores/codexStore";
import type { CodexEntry } from "@/types/dataTypes";
import { cleanup,render,screen,within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter,Route,Routes } from "react-router-dom";
import CodexPage from "./CodexPage";

describe("CodexPage rich granted ability enrichment", () => {
    beforeEach(() => {
        resetCodexPageTestState();
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
        vi.unstubAllEnvs();
        cleanupCodexPageStores();
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
        expect(screen.getByTestId("location-probe")).toHaveTextContent("/codex?category=abilities&entry=UnitAbility_TeamPlayer_1");
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
        expect(screen.getByTestId("location-probe")).toHaveTextContent("/codex?category=abilities&entry=UnitAbility_BreachingAttack_1");
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
        expect(screen.getByTestId("location-probe")).toHaveTextContent("/codex?category=abilities&entry=UnitAbility_Quickfooted");
    });




});
