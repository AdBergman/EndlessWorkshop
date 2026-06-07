import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TechContainer from "@/components/Tech/TechContainer";
import { apiClient } from "@/api/apiClient";
import { useDistrictStore } from "@/stores/districtStore";
import { useImprovementStore } from "@/stores/improvementStore";
import { useTechStore } from "@/stores/techStore";
import { useUnitStore } from "@/stores/unitStore";
import { type Tech } from "@/types/dataTypes";

vi.mock("@/api/apiClient", () => ({
    apiClient: {
        getDistricts: vi.fn(),
        getImprovements: vi.fn(),
        getTechs: vi.fn(),
        getUnits: vi.fn(),
    },
}));

const mockedApiClient = vi.mocked(apiClient);

const tech = (overrides: Partial<Tech>): Tech => ({
    techKey: "Tech_Workshop",
    name: "Workshop",
    era: 1,
    type: "Industry",
    unlocks: [],
    descriptionLines: [],
    prereq: null,
    factions: ["KIN"],
    excludes: null,
    coords: { xPct: 0, yPct: 0 },
    ...overrides,
});

describe("TechContainer passive tech reads", () => {
    beforeEach(() => {
        useDistrictStore.getState().reset();
        useImprovementStore.getState().reset();
        useUnitStore.getState().reset();
        useTechStore.getState().reset();

        mockedApiClient.getDistricts.mockReset();
        mockedApiClient.getImprovements.mockReset();
        mockedApiClient.getTechs.mockReset();
        mockedApiClient.getUnits.mockReset();

        mockedApiClient.getDistricts.mockResolvedValue([]);
        mockedApiClient.getImprovements.mockResolvedValue([]);
        mockedApiClient.getTechs.mockResolvedValue([]);
        mockedApiClient.getUnits.mockResolvedValue([]);

        useTechStore.getState().replaceTechs([
            tech({
                techKey: "Tech_Store_Only",
                name: "Store Only",
            }),
        ]);
    });

    it("renders SEO hidden tech labels from techStore without using context techs", () => {
        const { container } = render(
            <MemoryRouter initialEntries={["/tech"]}>
                <TechContainer />
            </MemoryRouter>
        );

        const seoText = container.querySelector(".seo-hidden[aria-hidden='true']")?.textContent ?? "";

        expect(seoText).toContain("Store Only.");
    });
});
