import { refreshStoresAfterAdminImport } from "./adminImportRefresh";
import { useCodexStore } from "@/stores/codexStore";
import { useDistrictStore } from "@/stores/districtStore";
import { useImprovementStore } from "@/stores/improvementStore";
import { useTechStore } from "@/stores/techStore";
import { useUnitStore } from "@/stores/unitStore";

vi.mock("@/stores/districtStore", () => ({
    useDistrictStore: { getState: vi.fn() },
}));

vi.mock("@/stores/improvementStore", () => ({
    useImprovementStore: { getState: vi.fn() },
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

type MockedStoreHook = {
    getState: ReturnType<typeof vi.fn>;
};

const mockedDistrictGetState = (useDistrictStore as unknown as MockedStoreHook).getState;
const mockedImprovementGetState = (useImprovementStore as unknown as MockedStoreHook).getState;
const mockedUnitGetState = (useUnitStore as unknown as MockedStoreHook).getState;
const mockedTechGetState = (useTechStore as unknown as MockedStoreHook).getState;
const mockedCodexGetState = (useCodexStore as unknown as MockedStoreHook).getState;

describe("refreshStoresAfterAdminImport", () => {
    const refreshDistricts = vi.fn();
    const refreshImprovements = vi.fn();
    const refreshUnits = vi.fn();
    const refreshTechs = vi.fn();
    const loadEntries = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        mockedDistrictGetState.mockReturnValue({ refreshDistricts });
        mockedImprovementGetState.mockReturnValue({ refreshImprovements });
        mockedUnitGetState.mockReturnValue({ refreshUnits });
        mockedTechGetState.mockReturnValue({ refreshTechs });
        mockedCodexGetState.mockReturnValue({ loadEntries });

        refreshDistricts.mockResolvedValue(undefined);
        refreshImprovements.mockResolvedValue(undefined);
        refreshUnits.mockResolvedValue(undefined);
        refreshTechs.mockResolvedValue(undefined);
        loadEntries.mockResolvedValue(undefined);
    });

    it.each([
        ["districts", refreshDistricts],
        ["improvements", refreshImprovements],
        ["units", refreshUnits],
        ["techs", refreshTechs],
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
        expect(refreshImprovements).not.toHaveBeenCalled();
        expect(refreshUnits).not.toHaveBeenCalled();
        expect(refreshTechs).not.toHaveBeenCalled();
        expect(loadEntries).not.toHaveBeenCalled();
    });
});
