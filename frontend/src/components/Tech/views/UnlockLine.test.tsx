import { render, screen } from "@testing-library/react";
import UnlockLine from "@/components/Tech/views/UnlockLine";
import { useGameData } from "@/context/GameDataContext";
import { useDistrictStore } from "@/stores/districtStore";
import { useImprovementStore } from "@/stores/improvementStore";

vi.mock("@/context/GameDataContext", () => ({
    useGameData: vi.fn(),
}));

const mockedUseGameData = vi.mocked(useGameData);

describe("UnlockLine district/improvement resolution", () => {
    beforeEach(() => {
        useDistrictStore.getState().reset();
        useImprovementStore.getState().reset();
        useDistrictStore.setState({
            districtsByKey: {
                District_Harbor: {
                    districtKey: "District_Harbor",
                    displayName: "Harbor",
                    descriptionLines: [],
                },
            },
        });
        useImprovementStore.setState({
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

    it("uses backend unlockCategory when a key exists in both domains", () => {
        useDistrictStore.setState({
            districtsByKey: {
                Shared_Key: {
                    districtKey: "Shared_Key",
                    displayName: "Shared District",
                    descriptionLines: [],
                },
            },
        });
        useImprovementStore.setState({
            improvementsByKey: {
                Shared_Key: {
                    improvementKey: "Shared_Key",
                    displayName: "Shared Improvement",
                    descriptionLines: [],
                    unique: "City",
                    cost: [],
                },
            },
        });

        render(
            <UnlockLine
                unlock={{
                    unlockType: "Constructible",
                    unlockKey: "Shared_Key",
                    unlockCategory: "Improvement",
                }}
            />
        );

        expect(screen.getByText(/Improvement:/)).toBeInTheDocument();
        expect(screen.getByText("Shared Improvement")).toBeInTheDocument();
        expect(screen.queryByText("Shared District")).not.toBeInTheDocument();
    });
});
