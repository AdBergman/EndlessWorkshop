import { buildEntriesByKey,buildEntriesByKindKey } from "@/lib/codex/codexRefs";
import {
cleanupCodexPageStores,
resetCodexPageTestState,
richFaction,
seedCodexEntries,
seedRichFactions
} from "@/pages/testUtils/codexPageHarness";
import { LocationProbe } from "@/pages/testUtils/codexPageTestUtils";
import { useCodexStore } from "@/stores/codexStore";
import type { CodexEntry } from "@/types/dataTypes";
import { cleanup,render,screen,within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter,Route,Routes } from "react-router-dom";
import CodexPage from "./CodexPage";

describe("CodexPage faction details", () => {
    beforeEach(() => {
        resetCodexPageTestState();
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
        vi.unstubAllEnvs();
        cleanupCodexPageStores();
    });

    it("uses a full-width major Faction overview with strategic hooks", async () => {
        const entries: CodexEntry[] = [
            {
                exportKind: "factions",
                entryKey: "Faction_Mukag",
                displayName: "Faction_Mukag",
                descriptionLines: ["Affinity: Tahuks", "Mukag can spend Science on territorial empire actions."],
                referenceKeys: [],
                sections: [{
                    title: "Effects",
                    lines: ["Mukag can spend Science on territorial empire actions."],
                }],
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

        expect(await screen.findByRole("heading", { name: "All Factions" })).toBeInTheDocument();
        expect(screen.queryByRole("complementary", { name: /codex results/i })).not.toBeInTheDocument();
        expect(document.querySelector(".codex-workspace--referenceOverview")).toBeInTheDocument();

        const overview = screen.getByLabelText("Factions overview");
        expect(within(overview).getByRole("button", { name: /Tahuk/i })).toBeInTheDocument();
        expect(within(overview).getByText("Affinity: Tahuk")).toBeInTheDocument();
        expect(within(overview).getByLabelText("Tahuk effects"))
            .toHaveTextContent("Tahuk can spend Science on territorial empire actions.");
    });



    it("uses a full-width Minor Faction overview with disposition, identity, and unit hooks", async () => {
        const entries: CodexEntry[] = [
            {
                exportKind: "minorFactions",
                entryKey: "MinorFaction_Ametrine",
                displayName: "Ametrine",
                kind: "MinorFaction",
                descriptionLines: [
                    "Disposition: Pacifist",
                    "Faction affinity: Ametrine",
                    "Ancient mineral folk seek their ossified ancestors.",
                    "Population: Ametrine",
                    "Unit: Crusher",
                    "Unit: Elite Crusher",
                    "Trait: Chant of the Rocks",
                ],
                referenceKeys: [],
                facts: [
                    { label: "Disposition", value: "Pacifist" },
                    { label: "Faction affinity", value: "Ametrine" },
                ],
                sections: [
                    { title: "Identity", lines: ["Ancient mineral folk seek their ossified ancestors."] },
                    { title: "Traits", lines: ["Chant of the Rocks"] },
                ],
            },
        ];

        useCodexStore.setState({
            entries,
            entriesByKey: buildEntriesByKey(entries),
            entriesByKind: {
                minorfactions: entries,
            },
            entriesByKindKey: buildEntriesByKindKey(entries),
            loading: false,
            error: null,
        });

        render(
            <MemoryRouter initialEntries={["/codex?category=minorfactions"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "All Minor Factions" })).toBeInTheDocument();
        expect(screen.queryByRole("complementary", { name: /codex results/i })).not.toBeInTheDocument();
        const overview = screen.getByLabelText("Minor Factions overview");
        expect(within(overview).getByText("Pacifist · Affinity: Ametrine")).toBeInTheDocument();
        expect(within(overview).getByLabelText("Ametrine effects"))
            .toHaveTextContent("Ancient mineral folk seek their ossified ancestors.");
        expect(within(overview).getByLabelText("Ametrine effects"))
            .toHaveTextContent("Units: Crusher / Elite Crusher");
        expect(within(overview).getByLabelText("Ametrine effects"))
            .toHaveTextContent("Traits: Chant of the Rocks");
    });



    it("structures faction details into core effects and traits without a duplicate strategy profile", async () => {
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
        expect(screen.getByRole("complementary", { name: /codex results/i })).toBeInTheDocument();
        expect(within(detailPane).queryByText("Strategy profile")).not.toBeInTheDocument();
        expect(within(detailPane).queryByText("Major faction profile")).not.toBeInTheDocument();
        expect(within(detailPane).getByText("Faction dossier")).toBeInTheDocument();
        expect(within(detailPane).queryByRole("navigation", { name: /faction dossier index/i })).not.toBeInTheDocument();
        expect(within(detailPane).getByRole("heading", { name: "Core Effects" })).toBeInTheDocument();
        expect(within(detailPane).getAllByText("Aspects").length).toBeGreaterThan(0);
        expect(within(detailPane).getByRole("heading", { name: "Unlocks" })).toBeInTheDocument();
        expect(within(detailPane).getByText("Force Treaty")).toBeInTheDocument();
        expect(within(detailPane).getByRole("heading", { name: "Diplomat" })).toBeInTheDocument();
        expect(within(detailPane).getByText("They prioritize Diplomacy and peace.")).toBeInTheDocument();
        expect(within(detailPane).getByRole("heading", { name: "Common Rights" })).toBeInTheDocument();
        expect(within(detailPane).getByText(/Public Opinion due to neighbors/)).toBeInTheDocument();
        expect(within(detailPane).getAllByText("Opening faction note.").length).toBeGreaterThan(0);
        expect(within(detailPane).queryByText("Description")).not.toBeInTheDocument();
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
        const packageSection = within(detailPane).getByRole("region", { name: "Faction systems" });
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
        expect(within(packageSection).getByText("Showing 4 of 6")).toBeInTheDocument();
        expect(within(packageSection).getAllByRole("button", { name: /Aspect Quest 01/ })).toHaveLength(1);
        expect(within(packageSection).getByRole("button", { name: /Aspect Quest 04/ })).toBeInTheDocument();
        expect(within(packageSection).getByText("Showing 3 of 4")).toBeInTheDocument();
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
        const packageSection = within(detailPane).getByRole("region", { name: "Faction systems" });
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
        const packageSection = within(detailPane).getByRole("region", { name: "Faction systems" });
        expect(within(detailPane).queryByText("Strategy profile")).not.toBeInTheDocument();
        expect(within(detailPane).queryByText("Major faction profile")).not.toBeInTheDocument();
        expect(within(detailPane).queryByText("1 population")).not.toBeInTheDocument();
        expect(within(detailPane).queryByText("1 unit")).not.toBeInTheDocument();
        expect(within(detailPane).queryByText("1 tech")).not.toBeInTheDocument();
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
        expect(within(detailPane).queryByText("Strategy profile")).not.toBeInTheDocument();
        expect(within(detailPane).queryByText("Minor faction profile")).not.toBeInTheDocument();
        expect(within(detailPane).getAllByText("Pacifist").length).toBeGreaterThan(0);
        const packageSection = within(detailPane).getByRole("region", { name: "Faction systems" });
        expect(within(packageSection).getByText("Core Unit")).toBeInTheDocument();
        expect(within(packageSection).getByText("Protectorate Traits")).toBeInTheDocument();
        expect(within(packageSection).getByText("Quest")).toBeInTheDocument();
        expect(within(packageSection).getByRole("button", { name: /Crusher/ })).toBeInTheDocument();
        expect(within(packageSection).getByRole("button", { name: /Chant of the Rocks/ })).toBeInTheDocument();
        expect(within(packageSection).getByRole("button", { name: /Ametrine Quest/ })).toBeInTheDocument();
        expect(within(detailPane).queryByRole("region", { name: /related entries/i })).toBeNull();
    });


});
