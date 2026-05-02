import { apiClient } from "@/api/apiClient";
import { useCodexStore } from "@/stores/codexStore";

vi.mock("@/api/apiClient", () => ({
    apiClient: {
        getCodex: vi.fn(),
    },
}));

const mockedApiClient = vi.mocked(apiClient);

describe("useCodexStore", () => {
    beforeEach(() => {
        useCodexStore.getState().reset();
        mockedApiClient.getCodex.mockReset();
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

    it("handles missing referenceKeys and descriptionLines by normalizing them to empty arrays", async () => {
        mockedApiClient.getCodex.mockResolvedValue([
            {
                exportKind: "equipment",
                entryKey: "Equipment_Accessory_03_Definition",
                displayName: "Crimson Wing Rune",
                descriptionLines: undefined,
                referenceKeys: undefined,
            },
        ] as any);

        await useCodexStore.getState().loadEntries();

        const entry = useCodexStore.getState().getEntryByKey("Equipment_Accessory_03_Definition");
        expect(entry?.descriptionLines).toEqual([]);
        expect(entry?.referenceKeys).toEqual([]);
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
});
