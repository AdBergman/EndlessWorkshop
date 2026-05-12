import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HoverableItem from "@/components/Tech/views/HoverableItem";
import { useGameData } from "@/context/GameDataContext";
import { useDistrictImprovementStore } from "@/stores/districtImprovementStore";

vi.mock("@/context/GameDataContext", () => ({
    useGameData: vi.fn(),
}));

// Mock tooltips
vi.mock("@/components/Tooltips/ImprovementTooltip", () => ({
    default: ({ hoveredImprovement }: any) => (
        <div data-testid="imp-tooltip">{hoveredImprovement.data.displayName}</div>
    ),
}));

vi.mock("@/components/Tooltips/DistrictTooltip", () => ({
    default: ({ hoveredDistrict }: any) => (
        <div data-testid="dist-tooltip">{hoveredDistrict.data.displayName}</div>
    ),
}));

const mockedUseGameData = vi.mocked(useGameData);

describe("HoverableItem", () => {
    beforeEach(() => {
        useDistrictImprovementStore.getState().reset();
        useDistrictImprovementStore.setState({
            improvementsByKey: {
                Improvement_Traveler_Shrine: {
                    improvementKey: "Improvement_Traveler_Shrine",
                    displayName: "Traveler's Shrine",
                    descriptionLines: ["Gain Dust."],
                    unique: "City",
                    cost: [],
                },
            },
            districtsByKey: {
                District_Communal_Habitations: {
                    districtKey: "District_Communal_Habitations",
                    displayName: "Communal Habitations",
                    descriptionLines: ["Housing for the populace."],
                },
            },
        });

        mockedUseGameData.mockReturnValue({
            units: new Map(),
        } as any);
    });

    it("renders improvement tooltip on hover", async () => {
        const user = userEvent.setup();
        const name = "Traveler's Shrine";
        render(
            <HoverableItem
                type="Constructible"
                name={name}
                unlockKey="Improvement_Traveler_Shrine"
                prefix="💎 "
            />
        );

        const hoverTarget = screen.getByText(name, { selector: "span" });
        await user.hover(hoverTarget);

        const tooltip = await screen.findByTestId("imp-tooltip");
        expect(tooltip).toHaveTextContent(name);

        await user.unhover(hoverTarget);
        expect(screen.queryByTestId("imp-tooltip")).toBeNull();
    });

    it("renders district tooltip on hover", async () => {
        const user = userEvent.setup();
        const name = "Communal Habitations";
        render(
            <HoverableItem
                type="Constructible"
                name={name}
                unlockKey="District_Communal_Habitations"
                prefix="🏘️ "
            />
        );

        const hoverTarget = screen.getByText(name, { selector: "span" });
        await user.hover(hoverTarget);

        const tooltip = await screen.findByTestId("dist-tooltip");
        expect(tooltip).toHaveTextContent(name);

        await user.unhover(hoverTarget);
        expect(screen.queryByTestId("dist-tooltip")).toBeNull();
    });

    it("renders without crashing", () => {
        render(
            <HoverableItem
                type="Constructible"
                name="Traveler's Shrine"
                unlockKey="Improvement_Traveler_Shrine"
                prefix="💎 "
            />
        );
        render(
            <HoverableItem
                type="Constructible"
                name="Communal Habitations"
                unlockKey="District_Communal_Habitations"
                prefix="🏘️ "
            />
        );
    });

    it("renders the prefix", () => {
        const prefix = "💎 ";
        const name = "Traveler's Shrine";
        render(
            <HoverableItem
                type="Constructible"
                name={name}
                unlockKey="Improvement_Traveler_Shrine"
                prefix={prefix}
            />
        );

        // Get the span and check its parent for the prefix
        const span = screen.getByText(name, { selector: "span" });
        expect(span.parentElement).toHaveTextContent(/^💎 /);
    });

    it("does not show tooltip before hover", () => {
        render(
            <HoverableItem
                type="Constructible"
                name="Traveler's Shrine"
                unlockKey="Improvement_Traveler_Shrine"
                prefix="💎 "
            />
        );
        expect(screen.queryByTestId("imp-tooltip")).toBeNull();
    });
});
