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

describe("CodexPage action and diplomacy metadata rendering", () => {
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




});
