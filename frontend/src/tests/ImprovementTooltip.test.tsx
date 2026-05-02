import { render, screen } from "@testing-library/react";
import ImprovementTooltip from "../components/Tooltips/ImprovementTooltip";
import type { Improvement } from "@/types/dataTypes";
import type { HoveredWithCoords } from "@/components/Tooltips/hoverHelpers";

function createMockImprovement(
    data: Improvement,
    coords: HoveredWithCoords<Improvement>["coords"] = { xPct: 50, yPct: 50 }
): HoveredWithCoords<Improvement> {
    return { data, coords };
}

describe("ImprovementTooltip", () => {
    it("renders correctly with description lines and cost", () => {
        const hoveredImprovement = createMockImprovement({
            displayName: "Test Shrine",
            unique: "City",
            descriptionLines: ["+1 Faith", "+1 Culture"],
            cost: ["10 Industry"],
        });

        render(<ImprovementTooltip hoveredImprovement={hoveredImprovement} />);

        expect(screen.getByText("Test Shrine")).toBeInTheDocument();
        expect(screen.getByText("Once per City")).toBeInTheDocument();
        expect(screen.getByText("Effects:")).toBeInTheDocument();
        expect(screen.getByText("+1 Faith")).toBeInTheDocument();
        expect(screen.getByText("+1 Culture")).toBeInTheDocument();
        expect(screen.getByText("Cost:")).toBeInTheDocument();
        expect(screen.getByText("10 Industry")).toBeInTheDocument();
    });

    it("renders correctly without an effects section when description lines are empty", () => {
        const hoveredImprovement = createMockImprovement({
            displayName: "Basic Farm",
            unique: "District",
            descriptionLines: [],
            cost: [],
        });

        render(<ImprovementTooltip hoveredImprovement={hoveredImprovement} />);

        expect(screen.getByText("Basic Farm")).toBeInTheDocument();
        expect(screen.getByText("Once per District")).toBeInTheDocument();
        expect(screen.queryByText("Effects:")).not.toBeInTheDocument();
        expect(screen.queryByText("Cost:")).not.toBeInTheDocument();
    });
});
