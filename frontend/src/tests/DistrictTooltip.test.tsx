import { render, screen } from "@testing-library/react";
import DistrictTooltip from "../components/Tooltips/DistrictTooltip";
import type { District } from "@/types/dataTypes";
import type { HoveredWithCoords } from "@/components/Tooltips/hoverHelpers";

function createMockDistrict(
    data: District,
    coords: HoveredWithCoords<District>["coords"] = { xPct: 50, yPct: 50 }
): HoveredWithCoords<District> {
    return { data, coords };
}

describe("DistrictTooltip", () => {
    it("renders every description line when present", () => {
        const hoveredDistrict = createMockDistrict({
            displayName: "Test District",
            descriptionLines: ["A special district.", "+5 Gold"],
        });

        render(<DistrictTooltip hoveredDistrict={hoveredDistrict} />);

        expect(screen.getByText("Test District")).toBeInTheDocument();
        expect(screen.getByText("A special district.")).toBeInTheDocument();
        expect(screen.getByText("+5 Gold")).toBeInTheDocument();
    });

    it("renders correctly with only the district name when no description is available", () => {
        const hoveredDistrict = createMockDistrict({
            displayName: "Simple Farm",
            descriptionLines: [],
        });

        render(<DistrictTooltip hoveredDistrict={hoveredDistrict} />);

        expect(screen.getByText("Simple Farm")).toBeInTheDocument();
        expect(screen.queryByText("A special district.")).not.toBeInTheDocument();
    });
});
