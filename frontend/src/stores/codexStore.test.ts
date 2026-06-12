import { apiClient } from "@/api/apiClient";
import { resetCodexTokenAuditDevFlagsForTests } from "@/lib/codex/codexTokenAudit";
import { useCodexStore } from "@/stores/codexStore";

vi.mock("@/api/apiClient", () => ({
    apiClient: {
        getCodex: vi.fn(),
    },
}));

const mockedApiClient = vi.mocked(apiClient);
const auditWindow = window as Window & typeof globalThis & {
    __downloadCodexTokenAudit?: unknown;
    __downloadCodexDiagnosticsReport?: unknown;
};

describe("useCodexStore", () => {
    beforeEach(() => {
        useCodexStore.getState().reset();
        mockedApiClient.getCodex.mockReset();
        resetCodexTokenAuditDevFlagsForTests();
        delete auditWindow.__downloadCodexTokenAudit;
        delete auditWindow.__downloadCodexDiagnosticsReport;
        window.history.replaceState({}, "", "/");
    });

    it("groups entries by exportKind and indexes them by entryKey", async () => {
        mockedApiClient.getCodex.mockResolvedValue([
            {
                exportKind: "abilities",
                entryKey: "UnitAbility_Blossom_2",
                displayName: "Blossom",
                descriptionLines: ["Bloom"],
                referenceKeys: ["Hero_A"],
            },
            {
                exportKind: "units",
                entryKey: "Hero_A",
                displayName: "Hero A",
                descriptionLines: ["Leader"],
                referenceKeys: [],
            },
        ]);

        await useCodexStore.getState().loadEntries();

        const state = useCodexStore.getState();
        expect(state.entries).toHaveLength(2);
        expect(state.entriesByKey.UnitAbility_Blossom_2?.displayName).toBe("Blossom");
        expect(state.entriesByKind.abilities).toHaveLength(1);
        expect(state.entriesByKind.units).toHaveLength(1);
        expect(state.entriesByKindKey.abilities.UnitAbility_Blossom_2?.displayName).toBe("Blossom");
        expect(state.getEntry("abilities", "UnitAbility_Blossom_2")?.displayName).toBe("Blossom");
        expect(state.getEntry("ABILITIES", " UnitAbility_Blossom_2 ")?.displayName).toBe("Blossom");
    });

    it("keeps kind-scoped entry lookup stable when entry keys collide across kinds", async () => {
        mockedApiClient.getCodex.mockResolvedValue([
            {
                exportKind: "districts",
                entryKey: "Shared_Key",
                displayName: "District Label",
                descriptionLines: ["District text"],
                referenceKeys: [],
            },
            {
                exportKind: "improvements",
                entryKey: "Shared_Key",
                displayName: "Improvement Label",
                descriptionLines: ["Improvement text"],
                referenceKeys: [],
            },
        ]);

        await useCodexStore.getState().loadEntries();

        const state = useCodexStore.getState();
        expect(state.getEntry("districts", "Shared_Key")?.displayName).toBe("District Label");
        expect(state.getEntry("improvements", "Shared_Key")?.displayName).toBe("Improvement Label");
        expect(state.getEntry("units", "Shared_Key")).toBeUndefined();
    });

    it("resolves related entries, ignoring self references and unresolved keys", async () => {
        mockedApiClient.getCodex.mockResolvedValue([
            {
                exportKind: "abilities",
                entryKey: "UnitAbility_Blossom_2",
                displayName: "Blossom",
                descriptionLines: ["Bloom"],
                referenceKeys: ["UnitAbility_Blossom_2", "Hero_A", "Missing_Key"],
            },
            {
                exportKind: "heroes",
                entryKey: "Hero_A",
                displayName: "Hero A",
                descriptionLines: ["Leader"],
                referenceKeys: [],
            },
        ]);

        await useCodexStore.getState().loadEntries();

        const state = useCodexStore.getState();
        const entry = state.getEntryByKey("UnitAbility_Blossom_2");
        expect(entry).toBeDefined();

        const related = state.getRelatedEntries(entry!);
        expect(related).toHaveLength(1);
        expect(related[0].entryKey).toBe("Hero_A");
    });

    it("handles missing optional arrays by normalizing them to empty arrays", async () => {
        mockedApiClient.getCodex.mockResolvedValue([
            {
                exportKind: "equipment",
                entryKey: "Equipment_Accessory_03_Definition",
                displayName: "Crimson Wing Rune",
                descriptionLines: undefined,
                referenceKeys: undefined,
                facts: undefined,
                sections: undefined,
                publicContextKeys: undefined,
            },
        ] as any);

        await useCodexStore.getState().loadEntries();

        const entry = useCodexStore.getState().getEntryByKey("Equipment_Accessory_03_Definition");
        expect(entry?.descriptionLines).toEqual([]);
        expect(entry?.referenceKeys).toEqual([]);
        expect(entry?.facts).toEqual([]);
        expect(entry?.sections).toEqual([]);
        expect(entry?.publicContextKeys).toEqual([]);
    });

    it("normalizes structured codex metadata from the API", async () => {
        mockedApiClient.getCodex.mockResolvedValue([
            {
                exportKind: "populations",
                entryKey: "Population_Aspect",
                displayName: "Aspect",
                descriptionLines: [],
                referenceKeys: [],
                facts: [
                    { label: " Faction ", value: " Faction_Aspect ", referenceKey: " Faction_Aspect " },
                    { label: "", value: "ignored" },
                ],
                sections: [
                    {
                        title: " Worker effects ",
                        lines: ["+1 [CultureColored] Influence"],
                        items: [],
                    },
                    {
                        title: "Threshold rewards",
                        lines: [],
                        items: [
                            {
                                label: " At 5 population ",
                                referenceKey: " Extractor_Nutrient ",
                                facts: [{ label: "Reward", value: "Nutrient Extractor" }],
                                lines: [],
                            },
                            {
                                label: " At 15 population ",
                                referenceKey: " Extractor_Garden ",
                                facts: [],
                                lines: [],
                            },
                        ],
                    },
                ],
                publicContextKeys: ["Population_Aspect", "Faction_Aspect"],
            },
        ] as any);

        await useCodexStore.getState().loadEntries();

        const entry = useCodexStore.getState().getEntryByKey("Population_Aspect");
        expect(entry?.facts).toEqual([
            { label: "Faction", value: "Faction_Aspect", referenceKey: "Faction_Aspect" },
        ]);
        expect(entry?.sections?.[0]).toEqual({
            title: "Worker effects",
            lines: ["+1 [CultureColored] Influence"],
            items: [],
        });
        expect(entry?.sections?.[1].items?.[0]).toEqual({
            label: "At 5 population",
            referenceKey: "Extractor_Nutrient",
            facts: [{ label: "Reward", value: "Nutrient Extractor", referenceKey: null }],
            lines: [],
        });
        expect(entry?.sections?.[1].items?.[1]).toEqual({
            label: "At 15 population",
            referenceKey: "Extractor_Garden",
            facts: [],
            lines: [],
        });
        expect(entry?.publicContextKeys).toEqual(["Population_Aspect", "Faction_Aspect"]);
    });

    it("normalizes camel-case Codex export kinds for category registration", async () => {
        mockedApiClient.getCodex.mockResolvedValue([
            {
                exportKind: "diplomaticTreaties",
                entryKey: "Treaty_VisionExchange",
                displayName: "Vision Exchange",
                descriptionLines: ["Shares vision."],
                referenceKeys: [],
            },
        ] as any);

        await useCodexStore.getState().loadEntries();

        const state = useCodexStore.getState();
        expect(state.entries[0].exportKind).toBe("diplomatictreaties");
        expect(state.getEntriesByKind("diplomatictreaties")).toHaveLength(1);
        expect(state.getEntry("diplomaticTreaties", "Treaty_VisionExchange")?.displayName)
            .toBe("Vision Exchange");
    });

    it("classifies bonus-derived statuses separately from hidden modifiers", async () => {
        mockedApiClient.getCodex.mockResolvedValue([
            {
                exportKind: "bonuses",
                entryKey: "Status_PublicOpinion_Test",
                displayName: "Public Opinion Status",
                category: "Status",
                kind: "Status",
                descriptionLines: ["Diplomatic status."],
                referenceKeys: ["ActionCostModifier_Test"],
            },
            {
                exportKind: "bonuses",
                entryKey: "ActionCostModifier_Test",
                displayName: "Action Cost Modifier Test",
                category: "Cost Modifier",
                kind: "Cost Modifier",
                descriptionLines: [],
                referenceKeys: [],
            },
        ]);

        await useCodexStore.getState().loadEntries();

        const state = useCodexStore.getState();
        expect(state.getEntry("statuses", "Status_PublicOpinion_Test")?.displayName)
            .toBe("Public Opinion Status");
        expect(state.getEntry("modifiers", "ActionCostModifier_Test")?.displayName)
            .toBe("Action Cost Modifier Test");
        expect(state.getEntriesByKind("statuses")).toHaveLength(1);
        expect(state.getEntriesByKind("modifiers")).toHaveLength(1);
        expect(state.searchEntries("cost modifier")).toHaveLength(1);
        expect(state.getRelatedEntries(state.getEntryByKey("Status_PublicOpinion_Test")!))
            .toEqual([state.getEntryByKey("ActionCostModifier_Test")]);
    });

    it("searches across displayName, entryKey, exportKind, and descriptionLines with optional kind filtering", async () => {
        mockedApiClient.getCodex.mockResolvedValue([
            {
                exportKind: "abilities",
                entryKey: "UnitAbility_Blossom_2",
                displayName: "Blossom Burst",
                descriptionLines: ["Massive blooming wave"],
                referenceKeys: [],
            },
            {
                exportKind: "units",
                entryKey: "Hero_A",
                displayName: "Hero A",
                descriptionLines: ["Bloom specialist"],
                referenceKeys: [],
            },
        ]);

        await useCodexStore.getState().loadEntries();

        const state = useCodexStore.getState();
        expect(state.searchEntries("bloom")).toHaveLength(2);
        expect(state.searchEntries("bloom", "abilities")).toHaveLength(1);
        expect(state.searchEntries("hero_a")).toHaveLength(1);
        expect(state.searchEntries("units")).toHaveLength(1);
    });

    it("avoids duplicate fetches when already loaded", async () => {
        mockedApiClient.getCodex.mockResolvedValue([
            {
                exportKind: "tech",
                entryKey: "Tech_A",
                displayName: "Tech A",
                descriptionLines: [],
                referenceKeys: [],
            },
        ]);

        await useCodexStore.getState().loadEntries();
        await useCodexStore.getState().loadEntries();

        expect(mockedApiClient.getCodex).toHaveBeenCalledTimes(1);
    });

    it("filters invalid display names before store population while keeping valid bracket-prefixed names", async () => {
        mockedApiClient.getCodex.mockResolvedValue([
            {
                exportKind: "abilities",
                entryKey: "Ability_Percent",
                displayName: " %Placeholder Name",
                descriptionLines: ["Should be filtered"],
                referenceKeys: [],
            },
            {
                exportKind: "abilities",
                entryKey: "Ability_Tbd",
                displayName: " TBD Internal",
                descriptionLines: ["Should be filtered"],
                referenceKeys: [],
            },
            {
                exportKind: "abilities",
                entryKey: "Ability_BracketTbd",
                displayName: "   [TBD] Internal",
                descriptionLines: ["Should be filtered"],
                referenceKeys: [],
            },
            {
                exportKind: "abilities",
                entryKey: "Ability_ThreeDigitsA",
                displayName: "Unit 001 Placeholder",
                descriptionLines: ["Should be filtered"],
                referenceKeys: [],
            },
            {
                exportKind: "abilities",
                entryKey: "Ability_ThreeDigitsB",
                displayName: "like282this",
                descriptionLines: ["Should be filtered"],
                referenceKeys: [],
            },
            {
                exportKind: "abilities",
                entryKey: "Ability_ThreeDigitsC",
                displayName: "Advanced Extractor 123",
                descriptionLines: ["Should be filtered"],
                referenceKeys: [],
            },
            {
                exportKind: "abilities",
                entryKey: "Ability_ValidBracket",
                displayName: "[LuxuryResource01] Auric Coral",
                descriptionLines: ["Should remain"],
                referenceKeys: ["Ability_Percent", "Ability_Resolved"],
            },
            {
                exportKind: "abilities",
                entryKey: "Ability_Resolved",
                displayName: "Resolved Ability",
                descriptionLines: ["Valid target"],
                referenceKeys: [],
            },
            {
                exportKind: "abilities",
                entryKey: "Ability_ValidText",
                displayName: "Advanced Auric Coral Extractor",
                descriptionLines: ["Should remain"],
                referenceKeys: [],
            },
        ]);

        await useCodexStore.getState().loadEntries();

        const state = useCodexStore.getState();
        expect(state.entries).toHaveLength(3);
        expect(state.entries.map((entry) => entry.entryKey)).toEqual([
            "Ability_ValidBracket",
            "Ability_Resolved",
            "Ability_ValidText",
        ]);
        expect(state.getEntryByKey("Ability_Percent")).toBeUndefined();
        expect(state.getEntryByKey("Ability_Tbd")).toBeUndefined();
        expect(state.getEntryByKey("Ability_BracketTbd")).toBeUndefined();
        expect(state.getEntryByKey("Ability_ThreeDigitsA")).toBeUndefined();
        expect(state.getEntryByKey("Ability_ThreeDigitsB")).toBeUndefined();
        expect(state.getEntryByKey("Ability_ThreeDigitsC")).toBeUndefined();
        expect(state.getEntryByKey("Ability_ValidBracket")?.displayName).toBe("[LuxuryResource01] Auric Coral");
        expect(state.getEntryByKey("Ability_ValidText")?.displayName).toBe("Advanced Auric Coral Extractor");
        expect(state.searchEntries("placeholder")).toHaveLength(0);
        expect(state.searchEntries("tbd")).toHaveLength(0);
        expect(state.searchEntries("001")).toHaveLength(0);
        expect(state.searchEntries("282")).toHaveLength(0);
        expect(state.searchEntries("123")).toHaveLength(0);
        expect(state.searchEntries("auric")).toHaveLength(2);
        expect(state.getRelatedEntries(state.getEntryByKey("Ability_ValidBracket")!)).toEqual([
            state.getEntryByKey("Ability_Resolved"),
        ]);
        expect(state.entriesByKind.abilities).toHaveLength(3);
    });

    it("publishes and auto-downloads a dev-only token audit exactly once when explicitly requested", async () => {
        window.history.replaceState({}, "", "/codex?codexAudit=1");
        const downloadClick = vi.fn();
        const appendSpy = vi.spyOn(document.body, "appendChild");
        const originalCreateObjectURL = URL.createObjectURL;
        const originalRevokeObjectURL = URL.revokeObjectURL;
        URL.createObjectURL = vi.fn(() => "blob:codex-audit");
        URL.revokeObjectURL = vi.fn(() => {});
        let createdAnchor: HTMLAnchorElement | null = null;
        const originalCreateElement = document.createElement.bind(document);
        const createElementSpy = vi.spyOn(document, "createElement").mockImplementation(((tagName: string) => {
            if (tagName.toLowerCase() === "a") {
                const anchor = originalCreateElement("a");
                anchor.click = downloadClick;
                createdAnchor = anchor;
                return anchor;
            }

            return originalCreateElement(tagName);
        }) as typeof document.createElement);
        const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});

        mockedApiClient.getCodex.mockResolvedValue([
            {
                exportKind: "improvements",
                entryKey: "Improvement_AuricCoral",
                displayName: "[LuxuryResource01] Auric Coral",
                descriptionLines: ["Gain [DustColored] per season."],
                referenceKeys: [],
            },
            {
                exportKind: "improvements",
                entryKey: "Improvement_Internal",
                displayName: "[TBD] Internal",
                descriptionLines: ["Still includes [LuxuryResource01]."],
                referenceKeys: [],
            },
        ]);

        await useCodexStore.getState().loadEntries();
        await useCodexStore.getState().loadEntries({ force: true });

        expect(auditWindow.__downloadCodexTokenAudit).toEqual(expect.any(Function));
        expect(downloadClick).toHaveBeenCalledTimes(1);
        expect(infoSpy).toHaveBeenCalledWith("Codex token audit downloaded");
        expect(createdAnchor).not.toBeNull();
        const downloadedAnchor = createdAnchor as unknown as HTMLAnchorElement;
        expect(downloadedAnchor.download).toBe("codex-token-audit.txt");

        createElementSpy.mockRestore();
        URL.createObjectURL = originalCreateObjectURL;
        URL.revokeObjectURL = originalRevokeObjectURL;
        appendSpy.mockRestore();
        infoSpy.mockRestore();
    });

    it("publishes and auto-downloads a dev/admin-only diagnostics report when explicitly requested", async () => {
        window.history.replaceState({}, "", "/admin/import?admin=1&codexDiagnostics=1");
        const downloadClick = vi.fn();
        const appendSpy = vi.spyOn(document.body, "appendChild");
        const originalCreateObjectURL = URL.createObjectURL;
        const originalRevokeObjectURL = URL.revokeObjectURL;
        URL.createObjectURL = vi.fn(() => "blob:codex-diagnostics");
        URL.revokeObjectURL = vi.fn(() => {});
        let createdAnchor: HTMLAnchorElement | null = null;
        const originalCreateElement = document.createElement.bind(document);
        const createElementSpy = vi.spyOn(document, "createElement").mockImplementation(((tagName: string) => {
            if (tagName.toLowerCase() === "a") {
                const anchor = originalCreateElement("a");
                anchor.click = downloadClick;
                createdAnchor = anchor;
                return anchor;
            }

            return originalCreateElement(tagName);
        }) as typeof document.createElement);
        const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});

        mockedApiClient.getCodex.mockResolvedValue([
            {
                exportKind: "abilities",
                entryKey: "UnitAbility_Blossom",
                displayName: "Blossom",
                descriptionLines: ["Gain [DustColored] near [Unit_Necro_Drone]."],
                referenceKeys: ["Unit_Necro_Drone", "Unit_Necro_Drone", "Unknown_Key"],
            },
            {
                exportKind: "units",
                entryKey: "Unit_Necro_Drone",
                displayName: "[Unit_Necro_Drone] Drone",
                descriptionLines: [],
                referenceKeys: [],
            },
        ]);

        await useCodexStore.getState().loadEntries();
        await useCodexStore.getState().loadEntries({ force: true });

        expect(auditWindow.__downloadCodexDiagnosticsReport).toEqual(expect.any(Function));
        expect(downloadClick).toHaveBeenCalledTimes(1);
        expect(infoSpy).toHaveBeenCalledWith("Codex diagnostics report downloaded");
        expect(URL.createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
        expect(createdAnchor).not.toBeNull();
        const downloadedAnchor = createdAnchor as unknown as HTMLAnchorElement;
        expect(downloadedAnchor.download).toBe("codex-diagnostics-report.txt");

        createElementSpy.mockRestore();
        URL.createObjectURL = originalCreateObjectURL;
        URL.revokeObjectURL = originalRevokeObjectURL;
        appendSpy.mockRestore();
        infoSpy.mockRestore();
    });

    it("does not publish diagnostics downloads outside admin mode", async () => {
        window.history.replaceState({}, "", "/codex?codexDiagnostics=1");
        const downloadClick = vi.fn();
        const originalCreateObjectURL = URL.createObjectURL;
        const originalRevokeObjectURL = URL.revokeObjectURL;
        URL.createObjectURL = vi.fn(() => "blob:codex-diagnostics");
        URL.revokeObjectURL = vi.fn(() => {});

        mockedApiClient.getCodex.mockResolvedValue([
            {
                exportKind: "units",
                entryKey: "Unit_Necro_Drone",
                displayName: "Drone",
                descriptionLines: ["Gain [DustColored]."],
                referenceKeys: [],
            },
        ]);

        await useCodexStore.getState().loadEntries();

        expect(auditWindow.__downloadCodexDiagnosticsReport).toBeUndefined();
        expect(downloadClick).not.toHaveBeenCalled();
        expect(URL.createObjectURL).not.toHaveBeenCalled();

        URL.createObjectURL = originalCreateObjectURL;
        URL.revokeObjectURL = originalRevokeObjectURL;
    });
});
