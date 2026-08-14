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

describe("CodexPage metadata overview and search rendering", () => {
    beforeEach(() => {
        resetCodexPageTestState();
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
        vi.unstubAllEnvs();
        cleanupCodexPageStores();
    });

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
        expect(screen.queryByLabelText("Codex landing summary")).not.toBeInTheDocument();
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


});
