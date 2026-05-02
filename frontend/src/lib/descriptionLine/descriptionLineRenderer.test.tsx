import { render, screen } from "@testing-library/react";
import {
    extractBracketTokens,
    renderDescriptionLine,
    stripDescriptionTokens,
} from "./descriptionLineRenderer";

describe("descriptionLineRenderer", () => {
    it("extracts bracket tokens from text", () => {
        expect(extractBracketTokens("[DustColored] Auric Coral grants [LuxuryResource01] value")).toEqual([
            "DustColored",
            "LuxuryResource01",
        ]);
    });

    it("renders known tokens as icons without leaking bracket text", () => {
        render(<div>{renderDescriptionLine("[DustColored] Auric Coral")}</div>);

        expect(screen.getByText("Auric Coral")).toBeInTheDocument();
        expect(screen.queryByText("[DustColored]")).not.toBeInTheDocument();
        expect(screen.getByRole("img", { name: "DustColored" })).toBeInTheDocument();
    });

    it("strips known and unknown bracket tokens from plain previews", () => {
        expect(stripDescriptionTokens("[DustColored] Auric Coral [LuxuryResource01]")).toBe("Auric Coral");
    });
});
