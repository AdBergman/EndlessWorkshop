import { refreshStoresAfterAdminImport } from "./adminImportRefresh";
import { useCodexStore } from "@/stores/codexStore";
import { useDistrictStore } from "@/stores/districtStore";
import { useFactionStore } from "@/stores/factionStore";
import { useHeroStore } from "@/stores/heroStore";
import { useImprovementStore } from "@/stores/improvementStore";
import { useQuestStore } from "@/stores/questStore";
import { useSkillStore } from "@/stores/skillStore";
import { useTechStore } from "@/stores/techStore";
import { useUnitStore } from "@/stores/unitStore";

vi.mock("@/stores/districtStore", () => ({
    useDistrictStore: { getState: vi.fn() },
}));

vi.mock("@/stores/factionStore", () => ({
    useFactionStore: { getState: vi.fn() },
}));

vi.mock("@/stores/heroStore", () => ({
    useHeroStore: { getState: vi.fn() },
}));

vi.mock("@/stores/improvementStore", () => ({
    useImprovementStore: { getState: vi.fn() },
}));

vi.mock("@/stores/skillStore", () => ({
    useSkillStore: { getState: vi.fn() },
}));

vi.mock("@/stores/unitStore", () => ({
    useUnitStore: { getState: vi.fn() },
}));

vi.mock("@/stores/techStore", () => ({
    useTechStore: { getState: vi.fn() },
}));

vi.mock("@/stores/codexStore", () => ({
    useCodexStore: { getState: vi.fn() },
}));

vi.mock("@/stores/questStore", () => ({
    useQuestStore: { getState: vi.fn() },
}));

type MockedStoreHook = {
    getState: ReturnType<typeof vi.fn>;
};

const mockedDistrictGetState = (useDistrictStore as unknown as MockedStoreHook).getState;
const mockedFactionGetState = (useFactionStore as unknown as MockedStoreHook).getState;
const mockedHeroGetState = (useHeroStore as unknown as MockedStoreHook).getState;
const mockedImprovementGetState = (useImprovementStore as unknown as MockedStoreHook).getState;
const mockedSkillGetState = (useSkillStore as unknown as MockedStoreHook).getState;
const mockedUnitGetState = (useUnitStore as unknown as MockedStoreHook).getState;
const mockedTechGetState = (useTechStore as unknown as MockedStoreHook).getState;
const mockedCodexGetState = (useCodexStore as unknown as MockedStoreHook).getState;
const mockedQuestGetState = (useQuestStore as unknown as MockedStoreHook).getState;

describe("refreshStoresAfterAdminImport", () => {
    const refreshDistricts = vi.fn();
    const refreshFactions = vi.fn();
    const refreshHeroes = vi.fn();
    const refreshImprovements = vi.fn();
    const refreshSkills = vi.fn();
    const refreshUnits = vi.fn();
    const refreshTechs = vi.fn();
    const loadEntries = vi.fn();
    const refreshQuestExplorer = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        mockedDistrictGetState.mockReturnValue({ refreshDistricts });
        mockedFactionGetState.mockReturnValue({ refreshFactions });
        mockedHeroGetState.mockReturnValue({ refreshHeroes });
        mockedImprovementGetState.mockReturnValue({ refreshImprovements });
        mockedSkillGetState.mockReturnValue({ refreshSkills });
        mockedUnitGetState.mockReturnValue({ refreshUnits });
        mockedTechGetState.mockReturnValue({ refreshTechs });
        mockedCodexGetState.mockReturnValue({ loadEntries });
        mockedQuestGetState.mockReturnValue({ refreshQuestExplorer });

        refreshDistricts.mockResolvedValue(undefined);
        refreshFactions.mockResolvedValue(undefined);
        refreshHeroes.mockResolvedValue(undefined);
        refreshImprovements.mockResolvedValue(undefined);
        refreshSkills.mockResolvedValue(undefined);
        refreshUnits.mockResolvedValue(undefined);
        refreshTechs.mockResolvedValue(undefined);
        loadEntries.mockResolvedValue(undefined);
        refreshQuestExplorer.mockResolvedValue(undefined);
    });

    it.each([
        ["districts", refreshDistricts],
        ["factions", refreshFactions],
        ["heroes", refreshHeroes],
        ["improvements", refreshImprovements],
        ["skills", refreshSkills],
        ["units", refreshUnits],
        ["techs", refreshTechs],
        ["quests", refreshQuestExplorer],
    ])("refreshes the %s store after a successful admin import", async (moduleId, refresh) => {
        await expect(refreshStoresAfterAdminImport(moduleId)).resolves.toEqual({ ok: true });

        expect(refresh).toHaveBeenCalledTimes(1);
    });

    it("force-loads codex entries after codex import", async () => {
        await expect(refreshStoresAfterAdminImport("codex")).resolves.toEqual({ ok: true });

        expect(loadEntries).toHaveBeenCalledWith({ force: true });
    });

    it("reports refresh failures without throwing", async () => {
        refreshTechs.mockRejectedValue(new Error("backend unavailable"));

        await expect(refreshStoresAfterAdminImport("techs")).resolves.toEqual({
            ok: false,
            message: "backend unavailable",
        });
    });

    it("allows unknown modules as a no-op", async () => {
        await expect(refreshStoresAfterAdminImport("unknown")).resolves.toEqual({ ok: true });

        expect(refreshDistricts).not.toHaveBeenCalled();
        expect(refreshFactions).not.toHaveBeenCalled();
        expect(refreshHeroes).not.toHaveBeenCalled();
        expect(refreshImprovements).not.toHaveBeenCalled();
        expect(refreshSkills).not.toHaveBeenCalled();
        expect(refreshUnits).not.toHaveBeenCalled();
        expect(refreshTechs).not.toHaveBeenCalled();
        expect(loadEntries).not.toHaveBeenCalled();
        expect(refreshQuestExplorer).not.toHaveBeenCalled();
    });
});
