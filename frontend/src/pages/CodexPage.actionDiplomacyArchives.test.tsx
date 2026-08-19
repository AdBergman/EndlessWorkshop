import { buildEntriesByKey,buildEntriesByKindKey } from "@/lib/codex/codexRefs";
import {
cleanupCodexPageStores,
getSummaryRowForButton,
resetCodexPageTestState,
seedActionArchiveEntries,
seedCodexEntries
} from "@/pages/testUtils/codexPageHarness";
import { LocationProbe } from "@/pages/testUtils/codexPageTestUtils";
import { useCodexStore } from "@/stores/codexStore";
import type { CodexEntry } from "@/types/dataTypes";
import { cleanup,render,screen,within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter,Route,Routes } from "react-router-dom";
import CodexPage from "./CodexPage";

describe("CodexPage Action and Diplomacy archives", () => {
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



    it("summarizes faction overview rows with affinity and strategic hooks", async () => {
        const entries: CodexEntry[] = [
            {
                exportKind: "factions",
                entryKey: "Faction_Aspect",
                displayName: "Faction_Aspect",
                descriptionLines: [
                    "Affinity: Aspects",
                    "Aspects can spread [Coral] Coral on the map.",
                    "Trait: Diplomat",
                    "They prioritize Diplomacy and peace.",
                    "Trait: Common Rights",
                    "Population bonuses are improved.",
                    "Trait: Fencing",
                    "Unlocks dueling schools.",
                    "Trait: Trade Code",
                    "Markets are stronger.",
                ],
                sections: [{
                    title: "Effects",
                    lines: ["Aspects can spread [Coral] Coral on the map."],
                }],
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

        const summaryList = await screen.findByLabelText("Factions overview");
        expect(screen.queryByRole("complementary", { name: /codex results/i })).not.toBeInTheDocument();
        expect(within(summaryList).getByText("Affinity: Aspects")).toBeInTheDocument();
        expect(within(summaryList).getByLabelText("Aspects effects"))
            .toHaveTextContent("Aspects can spread Coral on the map.");
        expect(within(summaryList).queryByText("Traits: Diplomat, Common Rights, Fencing, +1 trait"))
            .not.toBeInTheDocument();
        expect(within(summaryList).queryByText(/They prioritize Diplomacy and peace.*Population bonuses/s)).not.toBeInTheDocument();
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



});
