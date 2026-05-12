import { render, screen } from "@testing-library/react";
import UnlockLine from "@/components/Tech/views/UnlockLine";
import { useGameData } from "@/context/GameDataContext";
import { useDistrictImprovementStore } from "@/stores/districtImprovementStore";

vi.mock("@/context/GameDataContext", () => ({
    useGameData: vi.fn(),
}));

const mockedUseGameData = vi.mocked(useGameData);

describe("UnlockLine district/improvement resolution", () => {
    beforeEach(() => {
        useDistrictImprovementStore.getState().reset();
        useDistrictImprovementStore.setState({
            districtsByKey: {
                District_Harbor: {
                    districtKey: "District_Harbor",
                    displayName: "Harbor",
                    descriptionLines: [],
                },
            },
            improvementsByKey: {
                Improvement_Market: {
                    improvementKey: "Improvement_Market",
                    displayName: "Market",
                    descriptionLines: [],
                    unique: "City",
                    cost: [],
                },
            },
        });
        mockedUseGameData.mockReturnValue({
            units: new Map(),
        } as any);
    });

    it("renders district and improvement unlock lines from their own store domains", () => {
        const { rerender } = render(
            <UnlockLine unlock={{ unlockType: "Constructible", unlockKey: "District_Harbor" }} />
        );

        expect(screen.getByText(/District:/)).toBeInTheDocument();
        expect(screen.getByText("Harbor")).toBeInTheDocument();

        rerender(
            <UnlockLine unlock={{ unlockType: "Constructible", unlockKey: "Improvement_Market" }} />
        );

        expect(screen.getByText(/Improvement:/)).toBeInTheDocument();
        expect(screen.getByText("Market")).toBeInTheDocument();
    });

    it("renders nothing for missing district or improvement keys", () => {
        const { container } = render(
            <UnlockLine unlock={{ unlockType: "Constructible", unlockKey: "Missing_Key" }} />
        );

        expect(container).toBeEmptyDOMElement();
    });
});

