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

describe("CodexPage lore fact metadata rendering", () => {
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




});
